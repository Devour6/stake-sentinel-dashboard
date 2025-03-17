
import { RPC_ENDPOINT } from "./constants";
import { EpochInfo } from "./types";

// Get detailed epoch info
export const fetchEpochInfo = async (): Promise<EpochInfo> => {
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
    
    if (!epochInfoData.result) {
      throw new Error("Failed to fetch epoch info");
    }
    
    const result = epochInfoData.result;
    
    return {
      epoch: result.epoch,
      slotIndex: result.slotIndex,
      slotsInEpoch: result.slotsInEpoch,
      absoluteSlot: result.absoluteSlot,
      blockHeight: result.blockHeight,
    };
  } catch (error) {
    console.error("Error fetching epoch info:", error);
    return {
      epoch: 0,
      slotIndex: 0,
      slotsInEpoch: 0,
      absoluteSlot: 0,
    };
  }
};

// Get current epoch number (simplified version)
export const fetchCurrentEpoch = async (): Promise<number> => {
  try {
    const epochInfo = await fetchEpochInfo();
    return epochInfo.epoch;
  } catch (error) {
    console.error("Error fetching current epoch:", error);
    return 0;
  }
};

// Estimate time remaining in current epoch
export const estimateEpochTimeRemaining = (epochInfo: EpochInfo): number => {
  if (!epochInfo || !epochInfo.slotsInEpoch) return 0;
  
  const remainingSlots = epochInfo.slotsInEpoch - epochInfo.slotIndex;
  // Solana's average slot time is about 400ms
  const estimatedTimeInSeconds = remainingSlots * 0.4;
  
  return Math.round(estimatedTimeInSeconds);
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
