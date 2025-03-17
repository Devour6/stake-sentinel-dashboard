
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./constants";
import { ValidatorInfo, ValidatorMetrics } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchStakeHistory } from "./stakeApi";
import { fetchValidatorStake } from "./validatorStakeApi";
import { fetchAllValidators } from "./validatorSearchApi";
import { fetchValidatorDetailsFromSolscan } from "./solscanApi";

// API methods using real RPC endpoint
export const fetchValidatorInfo = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info for ${votePubkey}...`);
    
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === votePubkey);
    
    // Get current epoch info
    const currentEpoch = await fetchCurrentEpoch();
    
    // Try to fetch validator details from Solscan
    const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
    
    if (!validator) {
      console.log(`Validator not found in vote accounts: ${votePubkey}`);
      
      // Get all validators to look for this one
      const allValidators = await fetchAllValidators();
      const searchResult = allValidators.find(v => v.votePubkey === votePubkey);
      
      if (!searchResult) {
        console.log("Validator not found in search results either");
        return null;
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
        icon: solscanDetails.logo || searchResult.icon || null
      };
    }

    // Fetch stake changes from stake accounts
    const { activatingStake, deactivatingStake } = await fetchValidatorStake(validator.votePubkey);
    console.log("Stake changes:", { activatingStake, deactivatingStake });
    
    // Get all validators to find the name of this one
    const allValidators = await fetchAllValidators();
    const searchResult = allValidators.find(v => v.votePubkey === votePubkey);
    
    return {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      pendingStakeChange: Math.max(activatingStake, deactivatingStake),
      isDeactivating: deactivatingStake > activatingStake,
      delinquentStake: 0,
      epochCredits: validator.epochCredits[0]?.[0] || 0,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot || 0,
      currentEpoch: currentEpoch,
      name: solscanDetails.name || (searchResult?.name || ''),
      icon: solscanDetails.logo || (searchResult?.icon || null)
    };
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data.");
    return null;
  }
};

export const fetchValidatorMetrics = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorMetrics | null> => {
  try {
    console.log(`Fetching validator metrics for ${votePubkey}...`);
    
    const validatorInfo = await fetchValidatorInfo(votePubkey);
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
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
