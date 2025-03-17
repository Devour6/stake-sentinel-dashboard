import { toast } from "sonner";

// Constants
const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";
const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";

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

// API methods using real RPC endpoint
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    console.log("Fetching validator info from Helius RPC...");
    
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getVoteAccounts',
        params: []
      })
    });

    if (!response.ok) {
      throw new Error(`RPC request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("RPC response:", data);
    
    const validators = [...(data.result?.current || []), ...(data.result?.delinquent || [])];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      console.log("Validator not found in response");
      return null;
    }
    
    return {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      delinquentStake: 0,
      epochCredits: validator.epochCredits[0]?.[0] || 0,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot || 0,
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
      delinquentStake: 0,
      epochCredits: 123456,
      lastVote: 198765432,
      rootSlot: 198765400,
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
    
    // For stake change, we'd need historical data which isn't directly available
    // Using a simulated change for now - in production you'd use a database or service to track historical stake
    const previousStake = validatorInfo.activatedStake * 0.98;
    const stakeChange = validatorInfo.activatedStake - previousStake;
    const stakeChangePercentage = (stakeChange / previousStake) * 100;
    
    // For delegator count, we need to make another RPC call
    let delegatorCount = 0;
    try {
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getStakeActivation',
          params: []
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        delegatorCount = data.result?.delegations?.length || 187; // fallback to mock count
      }
    } catch (error) {
      console.warn("Could not fetch delegator count:", error);
      delegatorCount = 187; // fallback to mock count
    }
    
    return {
      totalStake: validatorInfo.activatedStake,
      stakeChange24h: stakeChange,
      stakeChangePercentage: stakeChangePercentage,
      commission: validatorInfo.commission,
      delegatorCount: delegatorCount,
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics. Using mock data.");
    
    // Fallback to mock data
    return {
      totalStake: 345678.9012,
      stakeChange24h: 6789.1234,
      stakeChangePercentage: 2.01,
      commission: 7,
      delegatorCount: 187,
    };
  }
};

export const fetchStakeHistory = async (): Promise<StakeHistoryItem[]> => {
  try {
    console.log("Fetching stake history...");
    
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    // For real implementation, you'd need to track historical data in a database
    // For now, generate mock history based on the current stake
    return generateMockStakeHistory(30, validatorInfo.activatedStake);
  } catch (error) {
    console.error("Error fetching stake history:", error);
    toast.error("Failed to fetch stake history. Using simulated data.");
    return generateMockStakeHistory(30, 345678.9012);
  }
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
