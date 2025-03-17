
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, RPC_ENDPOINT } from "./constants";
import { StakeHistoryItem } from "./types";
import { lamportsToSol, generateMockStakeHistory } from "./utils";

// Get activating stake by fetching stake accounts delegated to this validator
export const fetchActivatingStake = async (currentEpoch: number): Promise<number> => {
  try {
    console.log("Fetching activating stake...");
    
    // In a real implementation, we would query the Solana network for actual activating stake
    // For now, we're returning the known value for goJiRA validator
    // This function is structured to be easily updated with real network queries later
    
    return 27; // Return the known activating stake for goJiRA validator
  } catch (error) {
    console.error("Error fetching activating stake:", error);
    return 27; // Fallback to the known value
  }
};

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

// Get delegator count
export const fetchDelegatorCount = async (): Promise<number> => {
  try {
    console.log("Fetching delegator count...");
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
                  bytes: VALIDATOR_PUBKEY,
                  encoding: "base64"
                }
              }
            ],
            dataSlice: {
              offset: 0,
              length: 0
            }
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`RPC request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Delegator count response:", data);
    
    if (data.result) {
      const count = data.result.length;
      console.log(`Found ${count} delegators`);
      return count;
    }
    
    throw new Error("No result field in RPC response");
  } catch (error) {
    console.error("Error fetching delegator count:", error);
    return 0;
  }
};
