
import { toast } from "sonner";

// Constants
const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";

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

// Mock data for demonstration purposes
// In production, this would be fetched from a backend service or RPC provider with proper API keys
const MOCK_VALIDATOR_INFO: ValidatorInfo = {
  identity: VALIDATOR_IDENTITY,
  votePubkey: VALIDATOR_PUBKEY,
  commission: 7,
  activatedStake: 345678.9012,
  delinquentStake: 0,
  epochCredits: 123456,
  lastVote: 198765432,
  rootSlot: 198765400,
};

const generateMockStakeHistory = (days: number, currentStake: number): StakeHistoryItem[] => {
  const history: StakeHistoryItem[] = [];
  const now = new Date();
  
  // Start with current stake and work backwards with slight variations
  let stake = currentStake;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation (tends to grow over time)
    const change = (Math.random() * 0.01 - 0.003) * stake;
    
    // For older dates, stake should generally be less (showing growth trend)
    stake = i === 0 ? currentStake : stake - change;
    
    history.unshift({
      epoch: 300 - Math.floor(i / 3), // Approximate epochs
      stake: stake,
      date: date.toISOString().split('T')[0],
    });
  }
  
  return history;
};

// API methods (using mock data to overcome RPC limitations)
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    console.log("Returning mock validator info");
    return MOCK_VALIDATOR_INFO;
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data");
    return null;
  }
};

export const fetchValidatorMetrics = async (): Promise<ValidatorMetrics | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    // Calculate previous stake (3 days ago) with a small decrease
    const previousStake = validatorInfo.activatedStake * 0.98;
    const stakeChange = validatorInfo.activatedStake - previousStake;
    const stakeChangePercentage = (stakeChange / previousStake) * 100;
    
    return {
      totalStake: validatorInfo.activatedStake,
      stakeChange24h: stakeChange,
      stakeChangePercentage: stakeChangePercentage,
      commission: validatorInfo.commission,
      delegatorCount: 187, // Simulated delegator count
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics");
    return null;
  }
};

export const fetchStakeHistory = async (): Promise<StakeHistoryItem[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    // Generate 30 days of historical data
    return generateMockStakeHistory(30, validatorInfo.activatedStake);
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
