
import { toast } from "sonner";

// Constants
const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

// Types
export interface ValidatorInfo {
  identity: string;
  votePubkey: string;
  commission: number;
  activatedStake: number;
  delinquentStake: number;
  epochCredits: number;
  lastVote: number;
  rootSlot: number;
}

export interface StakeHistoryItem {
  epoch: number;
  stake: number;
  date: string;
}

export interface ValidatorMetrics {
  totalStake: number;
  stakeChange24h: number;
  stakeChangePercentage: number;
  commission: number;
  delegatorCount: number;
}

// Helper functions
const lamportsToSol = (lamports: number): number => {
  return lamports / 1000000000;
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
};

// API methods
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getVoteAccounts",
        params: {
          commitment: "finalized",
        },
      }),
    });

    const data = await response.json();
    
    if (!data.result) {
      throw new Error("Failed to fetch validator data");
    }

    const allValidators = [
      ...(data.result.current || []),
      ...(data.result.delinquent || []),
    ];

    const validator = allValidators.find(
      (v: any) => v.votePubkey === VALIDATOR_PUBKEY
    );

    if (!validator) {
      throw new Error("Validator not found");
    }

    return {
      identity: VALIDATOR_IDENTITY, // Use provided identity
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      delinquentStake: 0, // Only applicable if the validator is delinquent
      epochCredits: validator.epochCredits[0][0],
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot,
    };
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data");
    return null;
  }
};

export const fetchValidatorMetrics = async (): Promise<ValidatorMetrics | null> => {
  try {
    // Simulate metrics for demo purposes
    // In a real app, you would fetch this data from an API
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    // Simulate historical data to calculate changes
    const previousStake = validatorInfo.activatedStake * 0.98;
    const stakeChange = validatorInfo.activatedStake - previousStake;
    const stakeChangePercentage = (stakeChange / previousStake) * 100;
    
    return {
      totalStake: validatorInfo.activatedStake,
      stakeChange24h: stakeChange,
      stakeChangePercentage: stakeChangePercentage,
      commission: validatorInfo.commission,
      delegatorCount: Math.floor(Math.random() * 50) + 150, // Simulated
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics");
    return null;
  }
};

export const fetchStakeHistory = async (): Promise<StakeHistoryItem[]> => {
  try {
    // Simulate historical data for demo purposes
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    const currentStake = validatorInfo.activatedStake;
    const history: StakeHistoryItem[] = [];
    
    // Generate 30 days of simulated history
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create some variations in the stake amount
      const variation = Math.random() * 0.1 - 0.05; // -5% to +5%
      const stake = currentStake * (1 + variation * (i / 30));
      
      history.push({
        epoch: 300 - i, // Simulated epoch numbers
        stake: stake,
        date: date.toISOString().split('T')[0],
      });
    }
    
    return history;
  } catch (error) {
    console.error("Error fetching stake history:", error);
    toast.error("Failed to fetch stake history");
    return [];
  }
};

export const validateVotePubkey = (pubkey: string): boolean => {
  // Simple validation - in real app should be more robust
  return pubkey.length === 44 || pubkey.length === 43;
};

// Format helpers for display
export const formatSol = (sol: number): string => {
  return `${formatNumber(sol)} SOL`;
};

export const formatCommission = (commission: number): string => {
  return `${commission}%`;
};

export const formatChange = (change: number, percentage: number): string => {
  const prefix = change >= 0 ? "+" : "";
  return `${prefix}${formatNumber(change)} SOL (${prefix}${percentage.toFixed(2)}%)`;
};
