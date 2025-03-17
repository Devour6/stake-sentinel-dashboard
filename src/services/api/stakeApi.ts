
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

// Get delegator count by fetching stake accounts delegated to the validator
export const fetchDelegatorCount = async (): Promise<number | null> => {
  try {
    console.log("Fetching delegator count directly from vote account...");
    
    // Get vote account info which contains delegator count
    const voteAccountResponse = await fetch(RPC_ENDPOINT, {
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

    if (!voteAccountResponse.ok) {
      throw new Error(`RPC request failed with status ${voteAccountResponse.status}`);
    }

    const voteAccountData = await voteAccountResponse.json();
    console.log("Vote account data:", voteAccountData);
    
    const validators = [...(voteAccountData.result?.current || []), ...(voteAccountData.result?.delinquent || [])];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      console.log("Validator not found in vote accounts response");
      throw new Error("Validator not found");
    }
    
    // Check if the validator data includes a delegatorCount property
    if (validator.delegatorCount !== undefined) {
      return validator.delegatorCount;
    }
    
    // If not available in vote account data, use getProgramAccounts to count stake accounts
    const stakeAccountsResponse = await fetch(RPC_ENDPOINT, {
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
      })
    });

    if (!stakeAccountsResponse.ok) {
      throw new Error(`RPC request failed with status ${stakeAccountsResponse.status}`);
    }

    const stakeAccountsData = await stakeAccountsResponse.json();
    console.log("Stake accounts data:", stakeAccountsData);
    
    // Count the number of returned stake accounts
    if (stakeAccountsData.result) {
      return stakeAccountsData.result.length;
    }
    
    throw new Error("Failed to fetch delegator count");
  } catch (error) {
    console.error("Error fetching delegator count:", error);
    
    // As a fallback, try using a more direct method with another RPC endpoint
    try {
      const solanaMainnetRPC = "https://api.mainnet-beta.solana.com";
      const response = await fetch(solanaMainnetRPC, {
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
      
      if (!response.ok) {
        throw new Error(`Fallback RPC request failed`);
      }
      
      const data = await response.json();
      const allValidators = [...(data.result?.current || []), ...(data.result?.delinquent || [])];
      const validator = allValidators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
      
      if (validator && validator.delegatorCount !== undefined) {
        return validator.delegatorCount;
      }
      
      throw new Error("Validator not found in fallback response");
    } catch (fallbackError) {
      console.error("Fallback method failed:", fallbackError);
      // Return null to indicate error instead of a default value
      toast.error("Could not fetch delegator count");
      return null;
    }
  }
};
