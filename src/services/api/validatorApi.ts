import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./constants";
import { ValidatorInfo, ValidatorMetrics, StakeHistoryItem } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchStakeHistory, fetchDelegatorCount } from "./stakeApi";

// API methods using real RPC endpoint
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    console.log("Fetching validator info...");
    
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      console.log("Validator not found in response");
      return null;
    }

    // Get current epoch info
    const currentEpoch = await fetchCurrentEpoch();
    
    return {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      activatingStake: lamportsToSol(validator.activatingStake || 0),
      delinquentStake: 0,
      epochCredits: validator.epochCredits[0]?.[0] || 0,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot || 0,
      currentEpoch: currentEpoch
    };
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data. Falling back to mock data.");
    
    // Fallback to mock data
    return {
      identity: VALIDATOR_IDENTITY,
      votePubkey: VALIDATOR_PUBKEY,
      commission: 7,
      activatedStake: 345678.9012,
      activatingStake: 0,
      delinquentStake: 0,
      epochCredits: 123456,
      lastVote: 198765432,
      rootSlot: 198765400,
      currentEpoch: 351
    };
  }
};

export const fetchValidatorMetrics = async (): Promise<ValidatorMetrics | null> => {
  try {
    console.log("Fetching validator metrics...");
    
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    // Try to get delegator count using all available methods
    let delegatorCount = null;
    try {
      delegatorCount = await fetchDelegatorCount();
      // If the delegator count is 0, we still want to show it as 0, not as an error
      if (delegatorCount === 0) {
        console.log("Delegator count is 0, but this is valid data");
      }
    } catch (error) {
      console.error("Could not fetch delegator count:", error);
      // We'll keep delegatorCount as null to show the error state
    }
    
    return {
      totalStake: validatorInfo.activatedStake,
      activatingStake: validatorInfo.activatingStake,
      commission: validatorInfo.commission,
      delegatorCount: delegatorCount,
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics. Using mock data.");
    
    // Fallback to mock data
    return {
      totalStake: 345678.9012,
      activatingStake: 0,
      commission: 7,
      delegatorCount: null,
    };
  }
};

// Re-export stake history function for compatibility
export { fetchStakeHistory };
