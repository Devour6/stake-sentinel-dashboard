
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./constants";
import { ValidatorInfo } from "./types";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchValidatorStake } from "./validatorStakeApi";
import { fetchAllValidators } from "./validatorSearchApi";
import { fetchValidatorDetailsFromSolscan } from "./solscanApi";
import { lamportsToSol } from "./utils";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Cache for validator details to improve performance
const validatorInfoCache = new Map<string, ValidatorInfo & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Improved method to fetch validator info - prioritizing Stakewiz
export const fetchValidatorInfo = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info for ${votePubkey}...`);
    
    // Check cache first (with timeout)
    const now = Date.now();
    const cachedInfo = validatorInfoCache.get(votePubkey);
    if (cachedInfo && (now - cachedInfo.timestamp < CACHE_VALIDITY_MS)) {
      const { timestamp, ...validatorInfo } = cachedInfo;
      return validatorInfo;
    }
    
    // First try Stakewiz API directly - most reliable source
    try {
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 10000 }
      );
      
      if (stakewizResponse.data) {
        const stakewizData = stakewizResponse.data;
        console.log("Stakewiz data:", stakewizData);
        
        // Get stake changes from Stakewiz
        let activatingStake = 0;
        let deactivatingStake = 0;
        
        try {
          const stakeResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake`);
          if (stakeResponse.data) {
            activatingStake = stakeResponse.data.activating || 0;
            deactivatingStake = stakeResponse.data.deactivating || 0;
          }
        } catch (stakeError) {
          console.error("Error fetching stake data from Stakewiz:", stakeError);
        }
        
        // Use Solscan API for additional details
        const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
        
        // Create validator info object from Stakewiz data
        const validatorInfo: ValidatorInfo = {
          identity: stakewizData.identity || VALIDATOR_IDENTITY,
          votePubkey: votePubkey,
          commission: stakewizData.commission || 0,
          activatedStake: stakewizData.activated_stake || 0,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          delinquentStake: 0,
          epochCredits: stakewizData.epoch_credits || 0,
          lastVote: stakewizData.last_vote || 0,
          rootSlot: stakewizData.root_slot || 0,
          currentEpoch: stakewizData.epoch || 0,
          name: stakewizData.name || solscanDetails.name || '',
          icon: stakewizData.image || solscanDetails.logo || null,
          website: stakewizData.website || solscanDetails.website || null
        };
        
        // Cache the result with timestamp
        validatorInfoCache.set(votePubkey, { ...validatorInfo, timestamp: now });
        return validatorInfo;
      }
    } catch (stakewizError) {
      console.error("Error fetching from Stakewiz:", stakewizError);
    }
    
    return await fetchValidatorInfoFallback(votePubkey, now);
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data.");
    return null;
  }
};

// Fallback method when Stakewiz direct API fails
export const fetchValidatorInfoFallback = async (votePubkey: string, now: number): Promise<ValidatorInfo | null> => {
  try {
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === votePubkey);
    
    // Get current epoch info
    const currentEpoch = await fetchCurrentEpoch();
    
    // Get details from Solscan as fallback
    const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
    console.log("Validator details from Solscan:", solscanDetails);
    
    // If validator not found in vote accounts
    if (!validator) {
      console.log(`Validator not found in vote accounts: ${votePubkey}`);
      
      // Get all validators to look for this one
      const allValidators = await fetchAllValidators();
      const searchResult = allValidators.find(v => v.votePubkey === votePubkey);
      
      if (!searchResult) {
        console.log("Validator not found in search results either");
        
        // Create a minimal record if we can't find data anywhere
        const minimalInfo = {
          identity: VALIDATOR_IDENTITY,
          votePubkey: votePubkey,
          commission: 0,
          activatedStake: 0,
          pendingStakeChange: 0,
          isDeactivating: false,
          delinquentStake: 0,
          epochCredits: 0,
          lastVote: 0,
          rootSlot: 0,
          currentEpoch: currentEpoch,
          name: solscanDetails.name || '',
          icon: solscanDetails.logo || null,
          website: solscanDetails.website || null
        };
        
        validatorInfoCache.set(votePubkey, { ...minimalInfo, timestamp: now });
        return minimalInfo;
      }
      
      // If we found it in the search, use the available info
      const searchBasedInfo = {
        identity: searchResult.identity || VALIDATOR_IDENTITY,
        votePubkey: searchResult.votePubkey,
        commission: searchResult.commission || 0,
        activatedStake: searchResult.activatedStake || 0,
        pendingStakeChange: 0,
        isDeactivating: false,
        delinquentStake: 0,
        epochCredits: 0,
        lastVote: 0,
        rootSlot: 0,
        currentEpoch: currentEpoch,
        name: solscanDetails.name || searchResult.name || '',
        icon: solscanDetails.logo || searchResult.icon || null,
        website: solscanDetails.website || searchResult.website || null
      };
      
      validatorInfoCache.set(votePubkey, { ...searchBasedInfo, timestamp: now });
      return searchBasedInfo;
    }

    // If validator found in vote accounts, fetch stake changes
    const { activatingStake, deactivatingStake } = await fetchValidatorStake(validator.votePubkey);
    console.log("Stake changes:", { activatingStake, deactivatingStake });
    
    // Determine the pending stake change and if it's deactivating
    const pendingStakeChange = Math.max(activatingStake, deactivatingStake);
    const isDeactivating = deactivatingStake > activatingStake;
    
    // Get all validators to find additional info for this one
    const allValidators = await fetchAllValidators();
    const searchResult = allValidators.find(v => v.votePubkey === votePubkey);
    
    const validatorInfo = {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      pendingStakeChange: pendingStakeChange,
      isDeactivating: isDeactivating,
      delinquentStake: 0,
      epochCredits: validator.epochCredits[0]?.[0] || 0,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot || 0,
      currentEpoch: currentEpoch,
      name: solscanDetails.name || (searchResult?.name || ''),
      icon: solscanDetails.logo || (searchResult?.icon || null),
      website: solscanDetails.website || (searchResult?.website || null)
    };
    
    validatorInfoCache.set(votePubkey, { ...validatorInfo, timestamp: now });
    return validatorInfo;
  } catch (traditionalError) {
    console.error("Error with traditional validator info fetch:", traditionalError);
    
    // If all else fails, return minimal info with Solscan data
    const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
    const fallbackInfo = {
      identity: VALIDATOR_IDENTITY,
      votePubkey: votePubkey,
      commission: 0,
      activatedStake: 0,
      pendingStakeChange: 0,
      isDeactivating: false,
      delinquentStake: 0,
      epochCredits: 0,
      lastVote: 0,
      rootSlot: 0,
      currentEpoch: 0,
      name: solscanDetails.name || '',
      icon: solscanDetails.logo || null,
      website: solscanDetails.website || null
    };
    
    validatorInfoCache.set(votePubkey, { ...fallbackInfo, timestamp: now });
    return fallbackInfo;
  }
};
