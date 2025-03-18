
import { RPC_ENDPOINT, ALL_RPC_ENDPOINTS, ADDITIONAL_RPC_ENDPOINTS, HELIUS_RPC_ENDPOINT } from "./constants";
import { EpochInfo, RpcVoteAccount } from "./types";
import { toast } from "sonner";

/**
 * Fetches detailed epoch information directly from Solana's RPC endpoint
 * with fallback to multiple RPC providers and extended retry logic
 */
export const fetchEpochInfo = async (): Promise<EpochInfo | null> => {
  // Try Helius first, then the rest
  const allEndpoints = [HELIUS_RPC_ENDPOINT, ...ALL_RPC_ENDPOINTS, ...ADDITIONAL_RPC_ENDPOINTS];
  // Remove duplicates
  const uniqueEndpoints = [...new Set(allEndpoints)];
  
  // Try each endpoint in sequence until one works
  for (const endpoint of uniqueEndpoints) {
    try {
      console.log(`Fetching epoch info from RPC endpoint: ${endpoint}...`);
      
      const epochInfoResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getEpochInfo',
          params: []
        }),
        // Add timeout to prevent long waits on failing endpoints
        signal: AbortSignal.timeout(5000) // Increased timeout for more reliable endpoints
      });

      if (!epochInfoResponse.ok) {
        console.log(`HTTP error from endpoint ${endpoint}: ${epochInfoResponse.status}`);
        continue; // Try next endpoint
      }

      const epochInfoData = await epochInfoResponse.json();
      console.log("Epoch info response:", epochInfoData);
      
      if (epochInfoData.error) {
        console.log(`Error from endpoint ${endpoint}:`, epochInfoData.error);
        continue; // Try next endpoint
      }
      
      if (!epochInfoData.result) {
        console.log(`No result from endpoint ${endpoint}`);
        continue; // Try next endpoint
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
      console.error(`Error fetching epoch info from ${endpoint}:`, error);
      // Continue to next endpoint rather than failing immediately
    }
  }
  
  // If we've tried all endpoints and none worked
  console.error("All RPC endpoints failed when fetching epoch info");
  toast.error("Failed to fetch epoch information from all sources");
  return null;
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
 * with fallback to multiple RPC providers
 */
export const fetchVoteAccounts = async (): Promise<{ current: RpcVoteAccount[], delinquent: RpcVoteAccount[] }> => {
  // Try Helius first, then the rest
  const allEndpoints = [HELIUS_RPC_ENDPOINT, ...ALL_RPC_ENDPOINTS, ...ADDITIONAL_RPC_ENDPOINTS];
  // Remove duplicates
  const uniqueEndpoints = [...new Set(allEndpoints)];
  
  // Try each endpoint in sequence until one works
  for (const endpoint of uniqueEndpoints) {
    try {
      console.log(`Fetching vote accounts from RPC endpoint: ${endpoint}...`);
      
      const response = await fetch(endpoint, {
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
        signal: AbortSignal.timeout(5000) // Increased timeout for more reliable endpoints
      });

      if (!response.ok) {
        console.log(`HTTP error from endpoint ${endpoint}: ${response.status}`);
        continue; // Try next endpoint
      }

      const data = await response.json();
      
      if (data.error) {
        console.log(`Error from endpoint ${endpoint}:`, data.error);
        continue; // Try next endpoint
      }
      
      if (!data.result) {
        console.log(`No result from endpoint ${endpoint}`);
        continue; // Try next endpoint
      }
      
      console.log("Vote accounts response received successfully");
      
      return {
        current: data.result.current || [],
        delinquent: data.result.delinquent || []
      };
    } catch (error) {
      console.error(`Error fetching vote accounts from ${endpoint}:`, error);
      // Continue to next endpoint rather than failing immediately
    }
  }
  
  // If we've tried all endpoints and none worked
  console.error("All RPC endpoints failed when fetching vote accounts");
  toast.error("Failed to fetch validator vote accounts from all sources");
  return { current: [], delinquent: [] };
};
