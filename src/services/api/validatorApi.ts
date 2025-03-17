
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./constants";
import { ValidatorInfo, ValidatorMetrics } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchStakeHistory } from "./stakeApi";
import { fetchValidatorStake } from "./validatorStakeApi";
import { fetchAllValidators } from "./validatorSearchApi";
import { fetchValidatorDetailsFromSolscan } from "./solscanApi";

// Improved method to fetch validator info
export const fetchValidatorInfo = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info for ${votePubkey}...`);
    
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === votePubkey);
    
    // Get current epoch info
    const currentEpoch = await fetchCurrentEpoch();
    
    // Try Stakewiz first, then fallback to Solscan for validator details
    const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
    console.log("Validator details:", solscanDetails);
    
    // If validator not found in vote accounts
    if (!validator) {
      console.log(`Validator not found in vote accounts: ${votePubkey}`);
      
      // Get all validators to look for this one
      const allValidators = await fetchAllValidators();
      const searchResult = allValidators.find(v => v.votePubkey === votePubkey);
      
      // Try to get data from Stakewiz API as a fallback
      try {
        const stakewizResponse = await fetch(`https://api.stakewiz.com/validator/${votePubkey}`);
        if (stakewizResponse.ok) {
          const stakewizData = await stakewizResponse.json();
          console.log("Stakewiz data:", stakewizData);
          
          // Extract basic info from Stakewiz
          return {
            identity: stakewizData.identityPubkey || searchResult?.identity || VALIDATOR_IDENTITY,
            votePubkey: votePubkey,
            commission: stakewizData.commission || searchResult?.commission || 0,
            activatedStake: stakewizData.activatedStake || (searchResult?.activatedStake || 0),
            pendingStakeChange: 0,
            isDeactivating: false,
            delinquentStake: 0,
            epochCredits: stakewizData.credits || 0,
            lastVote: stakewizData.lastVote || 0,
            rootSlot: 0,
            currentEpoch: currentEpoch,
            name: solscanDetails.name || stakewizData.name || (searchResult?.name || ''),
            icon: solscanDetails.logo || stakewizData.image || (searchResult?.icon || null),
            website: solscanDetails.website || stakewizData.website || null
          };
        }
      } catch (stakewizError) {
        console.error("Error fetching from Stakewiz:", stakewizError);
      }

      if (!searchResult) {
        console.log("Validator not found in search results either");
        
        // Create a minimal record if we can't find data anywhere
        return {
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
      }
      
      // If we found it in the search, use the available info
      return {
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
        website: solscanDetails.website || null
      };
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
    
    return {
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
      website: solscanDetails.website || null
    };
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data.");
    return null;
  }
};

// Improved metrics fetching
export const fetchValidatorMetrics = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorMetrics | null> => {
  try {
    console.log(`Fetching validator metrics for ${votePubkey}...`);
    
    const validatorInfo = await fetchValidatorInfo(votePubkey);
    
    if (!validatorInfo) {
      // Try to get data from Stakewiz API directly
      try {
        const stakewizResponse = await fetch(`https://api.stakewiz.com/validator/${votePubkey}`);
        if (stakewizResponse.ok) {
          const stakewizData = await stakewizResponse.json();
          console.log("Stakewiz metrics data:", stakewizData);
          
          const stakeResponse = await fetch(`https://api.stakewiz.com/validator/${votePubkey}/stake`);
          let activatingStake = 0;
          let deactivatingStake = 0;
          
          if (stakeResponse.ok) {
            const stakeData = await stakeResponse.json();
            activatingStake = stakeData.activating || 0;
            deactivatingStake = stakeData.deactivating || 0;
          }
          
          return {
            totalStake: stakewizData.activatedStake || 0,
            pendingStakeChange: Math.max(activatingStake, deactivatingStake),
            isDeactivating: deactivatingStake > activatingStake,
            commission: stakewizData.commission || 0,
          };
        }
      } catch (stakewizError) {
        console.error("Error fetching from Stakewiz metrics:", stakewizError);
      }
      
      // If all else fails, return null
      toast.error("Failed to fetch validator info");
      return null;
    }
    
    return {
      totalStake: validatorInfo.activatedStake,
      pendingStakeChange: validatorInfo.pendingStakeChange,
      isDeactivating: validatorInfo.isDeactivating,
      commission: validatorInfo.commission,
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics.");
    return null;
  }
};

// Re-export the functions from other modules
export { fetchAllValidators, fetchValidatorStake, fetchStakeHistory };
