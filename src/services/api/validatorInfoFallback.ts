
import { toast } from "sonner";
import { ValidatorInfo } from "./types";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchValidatorStake } from "./validatorStakeApi";
import { fetchAllValidators } from "./validatorSearchApi";
import { fetchValidatorDetailsFromSolscan } from "./solscanApi";
import { lamportsToSol } from "./utils";
import { VALIDATOR_IDENTITY } from "./constants";
import { saveToCache } from "./utils/validatorCache";

// Fallback method when Stakewiz direct API fails
export const fetchValidatorInfoFallback = async (votePubkey: string): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info fallback for ${votePubkey}...`);
    
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
        const minimalInfo: ValidatorInfo = {
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
        
        saveToCache(votePubkey, minimalInfo);
        return minimalInfo;
      }
      
      // If we found it in the search, use the available info
      const searchBasedInfo: ValidatorInfo = {
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
      
      saveToCache(votePubkey, searchBasedInfo);
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
    
    const validatorInfo: ValidatorInfo = {
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
    
    saveToCache(votePubkey, validatorInfo);
    return validatorInfo;
  } catch (error) {
    console.error("Error with traditional validator info fetch:", error);
    
    // If all else fails, return minimal info with Solscan data
    try {
      const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
      const fallbackInfo: ValidatorInfo = {
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
      
      saveToCache(votePubkey, fallbackInfo);
      return fallbackInfo;
    } catch (solscanError) {
      console.error("Even Solscan fallback failed:", solscanError);
      return null;
    }
  }
};
