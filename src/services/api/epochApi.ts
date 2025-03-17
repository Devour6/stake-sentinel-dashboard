
import { RPC_ENDPOINT } from "./constants";

// Get current epoch info
export const fetchCurrentEpoch = async (): Promise<number> => {
  try {
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
    return epochInfoData.result?.epoch || 0;
  } catch (error) {
    console.error("Error fetching epoch info:", error);
    return 0;
  }
};

// Get vote accounts data
export const fetchVoteAccounts = async () => {
  try {
    console.log("Fetching vote accounts from Helius RPC...");
    
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
    
    return {
      current: voteAccountsData.result?.current || [],
      delinquent: voteAccountsData.result?.delinquent || []
    };
  } catch (error) {
    console.error("Error fetching vote accounts:", error);
    return { current: [], delinquent: [] };
  }
};
