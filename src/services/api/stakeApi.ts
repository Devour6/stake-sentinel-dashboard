
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, RPC_ENDPOINT } from "./constants";
import { StakeHistoryItem } from "./types";
import { lamportsToSol, generateMockStakeHistory } from "./utils";

// Fetch stake history
export const fetchStakeHistory = async (days = 30): Promise<StakeHistoryItem[]> => {
  try {
    console.log("Fetching stake history...");
    
    // For real implementation, you'd need to track historical data in a database
    // For now, use the validator's current stake to generate mock history
    const epochInfoResponse = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'getVoteAccounts',
        params: []
      })
    });

    if (!epochInfoResponse.ok) {
      throw new Error(`RPC request failed with status ${epochInfoResponse.status}`);
    }

    const epochInfoData = await epochInfoResponse.json();
    console.log("Vote accounts response for history:", epochInfoData);
    
    const validators = [...(epochInfoData.result?.current || []), ...(epochInfoData.result?.delinquent || [])];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      throw new Error("Validator not found in response");
    }
    
    const currentStake = lamportsToSol(validator.activatedStake);
    return generateMockStakeHistory(days, currentStake);
  } catch (error) {
    console.error("Error fetching stake history:", error);
    toast.error("Failed to fetch stake history. Using simulated data.");
    return generateMockStakeHistory(30, 345678.9012);
  }
};

// Attempt to get delegator count with multiple RPC endpoints
export const fetchDelegatorCount = async (): Promise<number | null> => {
  // Array of RPC endpoints to try
  const rpcEndpoints = [
    RPC_ENDPOINT,
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana"
  ];
  
  // Try each endpoint until we get a valid result
  for (const endpoint of rpcEndpoints) {
    try {
      console.log(`Trying to fetch delegator count from ${endpoint}...`);
      
      // First, try getVoteAccounts which might have delegatorCount directly
      const voteAccountResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getVoteAccounts',
          params: []
        }),
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(5000)
      });

      if (!voteAccountResponse.ok) {
        throw new Error(`RPC request failed with status ${voteAccountResponse.status}`);
      }

      const voteAccountData = await voteAccountResponse.json();
      console.log(`Vote account data from ${endpoint}:`, voteAccountData);
      
      const validators = [...(voteAccountData.result?.current || []), ...(voteAccountData.result?.delinquent || [])];
      const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
      
      if (validator) {
        // Check if the validator data includes a delegatorCount property
        if (validator.delegatorCount !== undefined && validator.delegatorCount > 0) {
          console.log(`Found delegator count directly in vote account: ${validator.delegatorCount}`);
          return validator.delegatorCount;
        }
      }
      
      // If not available in vote account data, use getProgramAccounts to count stake accounts
      console.log(`Trying getProgramAccounts with ${endpoint}...`);
      const stakeAccountsResponse = await fetch(endpoint, {
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
                    offset: 44,
                    bytes: VALIDATOR_PUBKEY
                  }
                }
              ]
            }
          ]
        }),
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(10000)
      });

      if (!stakeAccountsResponse.ok) {
        throw new Error(`RPC request failed with status ${stakeAccountsResponse.status}`);
      }

      const stakeAccountsData = await stakeAccountsResponse.json();
      console.log(`Stake accounts data from ${endpoint}:`, stakeAccountsData);
      
      // Check if the result exists and has a length property
      if (stakeAccountsData.result !== undefined) {
        // If we got an empty array but this isn't the last endpoint, continue to the next one
        if (stakeAccountsData.result.length === 0) {
          console.log(`Empty result array from getProgramAccounts on ${endpoint}, trying next endpoint...`);
          continue;
        }
        
        console.log(`Found ${stakeAccountsData.result.length} delegators via getProgramAccounts`);
        return stakeAccountsData.result.length;
      }
    } catch (error) {
      console.error(`Error fetching delegator count from ${endpoint}:`, error);
      // Continue to the next endpoint on error
    }
  }
  
  // If all endpoints failed, return null to indicate the error
  console.error("All RPC endpoints failed to return delegator count");
  return null;
};
