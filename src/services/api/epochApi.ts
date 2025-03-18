
import { RPC_ENDPOINT } from "./constants";
import { EpochInfo, RpcVoteAccount } from "./types";
import { toast } from "sonner";

/**
 * Fetches detailed epoch information directly from Solana's RPC endpoint
 */
export const fetchEpochInfo = async (): Promise<EpochInfo | null> => {
  try {
    console.log("Fetching epoch info from Solana RPC...");
    
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
    
    // Calculate estimated time remaining based on slots
    const remainingSlots = result.slotsInEpoch - result.slotIndex;
    // Solana's average slot time is about 400ms
    const estimatedTimeInSeconds = remainingSlots * 0.4;
    
    return {
      epoch: result.epoch,
      slotIndex: result.slotIndex,
      slotsInEpoch: result.slotsInEpoch,
      absoluteSlot: result.absoluteSlot,
      blockHeight: result.blockHeight,
      transactionCount: null, // Not available from this endpoint
      timeRemaining: Math.round(estimatedTimeInSeconds)
    };
  } catch (error) {
    console.error("Error fetching epoch info:", error);
    toast.error("Failed to fetch epoch information");
    return null;
  }
};

/**
 * Simplified function to get the current epoch number
 */
export const fetchCurrentEpoch = async (): Promise<number> => {
  try {
    const epochInfo = await fetchEpochInfo();
    return epochInfo?.epoch || 0;
  } catch (error) {
    console.error("Error fetching current epoch:", error);
    return 0;
  }
};

/**
 * Fetch more comprehensive epoch data from Solana (can be extended if needed)
 */
export const fetchExtendedEpochInfo = async (): Promise<any> => {
  const epochInfo = await fetchEpochInfo();
  return epochInfo;
};

/**
 * Fetches current and delinquent vote accounts
 */
export const fetchVoteAccounts = async (): Promise<{ current: RpcVoteAccount[], delinquent: RpcVoteAccount[] }> => {
  try {
    console.log("Fetching vote accounts from Solana RPC...");
    
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

    const data = await response.json();
    console.log("Vote accounts response:", data);
    
    if (!data.result) {
      throw new Error("Failed to fetch vote accounts");
    }
    
    return {
      current: data.result.current || [],
      delinquent: data.result.delinquent || []
    };
  } catch (error) {
    console.error("Error fetching vote accounts:", error);
    toast.error("Failed to fetch validator vote accounts");
    return { current: [], delinquent: [] };
  }
};
