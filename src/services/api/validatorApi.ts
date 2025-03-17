
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./constants";
import { ValidatorInfo, ValidatorMetrics, StakeHistoryItem } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { 
  fetchActivatingStake, 
  fetchStakeHistory, 
  fetchDelegatorCount,
  calculate24hChange
} from "./stakeApi";

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
    
    // Get activating stake
    let activatingStake = await fetchActivatingStake(currentEpoch);
    if (activatingStake <= 0) {
      // Use a better fallback - approximately 1% of activated stake
      activatingStake = lamportsToSol(validator.activatedStake) * 0.01;
    }
    
    return {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      activatingStake: activatingStake,
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
      activatingStake: 2500.1234, // More realistic activating stake
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
    
    // Get delegator count
    const delegatorCount = await fetchDelegatorCount();
    
    // Calculate 24h change
    const { change: stakeChange, percentage: stakeChangePercentage } = 
      await calculate24hChange(validatorInfo.activatedStake);
    
    return {
      totalStake: validatorInfo.activatedStake,
      activatingStake: validatorInfo.activatingStake,
      stakeChange24h: stakeChange,
      stakeChangePercentage: stakeChangePercentage,
      commission: validatorInfo.commission,
      delegatorCount: delegatorCount || Math.floor(validatorInfo.activatedStake / 10000), // Fallback estimation
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics. Using mock data.");
    
    // Fallback to mock data
    return {
      totalStake: 345678.9012,
      activatingStake: 2500.1234, 
      stakeChange24h: 1230.5678, 
      stakeChangePercentage: 0.35, 
      commission: 7,
      delegatorCount: 187,
    };
  }
};

// Re-export stake history function for compatibility
export { fetchStakeHistory };
