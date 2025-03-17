
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY, RPC_ENDPOINT } from "./constants";
import { ValidatorInfo, ValidatorMetrics, StakeHistoryItem } from "./types";
import { lamportsToSol, generateMockStakeHistory } from "./utils";

// API methods using real RPC endpoint
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    console.log("Fetching validator info from Helius RPC...");
    
    // Get vote accounts for basic validator info
    const voteAccountsResponse = await fetch(RPC_ENDPOINT, {
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

    if (!voteAccountsResponse.ok) {
      throw new Error(`RPC request failed with status ${voteAccountsResponse.status}`);
    }

    const voteAccountsData = await voteAccountsResponse.json();
    console.log("Vote accounts response:", voteAccountsData);
    
    const validators = [...(voteAccountsData.result?.current || []), ...(voteAccountsData.result?.delinquent || [])];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      console.log("Validator not found in response");
      return null;
    }

    // Get current epoch info
    const epochInfoResponse = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'getEpochInfo',
        params: []
      })
    });

    const epochInfoData = await epochInfoResponse.json();
    console.log("Epoch info response:", epochInfoData);
    const currentEpoch = epochInfoData.result?.epoch || 0;
    
    // Get activating stake (stake that will be active next epoch)
    let activatingStake = 0;
    try {
      const inflationRewardResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 4,
          method: 'getInflationReward',
          params: [
            [VALIDATOR_PUBKEY],
            { epoch: currentEpoch - 1 }
          ]
        })
      });
      
      const inflationData = await inflationRewardResponse.json();
      console.log("Inflation reward response:", inflationData);
      
      // The difference between effective and post balance can give us activating stake
      if (inflationData.result && inflationData.result[0]) {
        const previousBalance = inflationData.result[0].postBalance || 0;
        activatingStake = lamportsToSol(validator.activatedStake) - previousBalance;
        if (activatingStake < 0) activatingStake = 0; // Ensure we don't show negative activating stake
      }
    } catch (error) {
      console.error("Error fetching activating stake:", error);
      // Estimate activating stake as a small percentage of total stake
      activatingStake = lamportsToSol(validator.activatedStake) * 0.02;
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
      activatingStake: 7890.1234,
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
    
    // Get historical data for 24h change
    // For a real implementation, you would store historical data or use a data provider
    // Here we'll fetch the epoch rewards which might give us an estimate
    let previousStake = validatorInfo.activatedStake; 
    try {
      const epochInfoResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 5,
          method: 'getEpochInfo',
          params: []
        })
      });
      
      const epochInfoData = await epochInfoResponse.json();
      const currentEpoch = epochInfoData.result?.epoch || 0;
      
      // Fetch inflation reward for previous epoch to estimate stake from yesterday
      const inflationRewardResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 6,
          method: 'getInflationReward',
          params: [
            [VALIDATOR_PUBKEY],
            { epoch: currentEpoch - 1 }
          ]
        })
      });
      
      const inflationData = await inflationRewardResponse.json();
      if (inflationData.result && inflationData.result[0]) {
        // If we have inflation data, we can estimate the previous stake
        previousStake = inflationData.result[0].postBalance 
          ? lamportsToSol(inflationData.result[0].postBalance) 
          : validatorInfo.activatedStake * 0.98; // Fallback if no postBalance
      } else {
        // Fallback to a reasonable estimate
        previousStake = validatorInfo.activatedStake * 0.98;
      }
    } catch (error) {
      console.error("Error fetching historical stake:", error);
      // Fallback to a standard estimate
      previousStake = validatorInfo.activatedStake * 0.98;
    }
    
    const stakeChange = validatorInfo.activatedStake - previousStake;
    const stakeChangePercentage = (stakeChange / previousStake) * 100;
    
    // For delegator count, we need to fetch stake accounts that delegate to this validator
    let delegatorCount = 0;
    try {
      console.log("Fetching stakes for validator...");
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getProgramAccounts',
          params: [
            'Stake11111111111111111111111111111111111111',
            {
              filters: [
                {
                  memcmp: {
                    offset: 124,
                    bytes: VALIDATOR_PUBKEY
                  }
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`RPC request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Stakes response:", data);
      
      if (data.result) {
        delegatorCount = data.result.length;
        console.log(`Found ${delegatorCount} delegators`);
      } else {
        throw new Error("No result field in RPC response");
      }
    } catch (error) {
      console.error("Error fetching delegator count:", error);
      // If we can't get the delegator count, use a more conservative estimate
      // based on total stake divided by average stake size
      const avgStakeSizeEstimate = 10000; // 10,000 SOL average stake size
      delegatorCount = Math.floor(validatorInfo.activatedStake / avgStakeSizeEstimate);
      console.log(`Estimated ${delegatorCount} delegators based on average stake size`);
    }
    
    return {
      totalStake: validatorInfo.activatedStake,
      activatingStake: validatorInfo.activatingStake,
      stakeChange24h: stakeChange,
      stakeChangePercentage: stakeChangePercentage,
      commission: validatorInfo.commission,
      delegatorCount: delegatorCount || 0,
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics. Using mock data.");
    
    // Fallback to mock data
    return {
      totalStake: 345678.9012,
      activatingStake: 7890.1234,
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
