
import { 
  RPC_ENDPOINT, 
  FALLBACK_RPC_ENDPOINT,
  HELIUS_RPC_ENDPOINT,
  ALL_RPC_ENDPOINTS,
  ADDITIONAL_RPC_ENDPOINTS,
  EXPLORER_API
} from "./constants";
import { EpochInfo, RpcVoteAccount } from "./types";
import { toast } from "sonner";
import axios from "axios";

/**
 * Fetches detailed epoch information from Solana Explorer API
 * which is more reliable than direct RPC calls
 */
export const fetchEpochInfo = async (): Promise<EpochInfo | null> => {
  try {
    console.log("Fetching epoch info from Solana Explorer API...");
    
    // First try the explorer API which is more reliable for epoch info
    try {
      const explorerResponse = await axios.get(`${EXPLORER_API}/epoch-info`, {
        timeout: 5000
      });
      
      if (explorerResponse.data && explorerResponse.data.result) {
        const result = explorerResponse.data.result;
        console.log("Explorer API response:", result);
        
        return {
          epoch: result.epoch,
          slotIndex: result.slotIndex,
          slotsInEpoch: result.slotsInEpoch,
          absoluteSlot: result.absoluteSlot,
          blockHeight: result.blockHeight || 0,
          transactionCount: result.transactionCount || null,
          timeRemaining: result.epochTimeRemaining || 0
        };
      }
    } catch (error) {
      console.error("Error fetching from Explorer API:", error);
      // Fall back to direct RPC method
    }
  
    // If explorer API fails, fall back to direct RPC calls
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
    
    // If all methods failed, attempt to scrape from explorer as a last resort
    try {
      console.log("All RPC endpoints failed. Attempting to fetch from public sources...");
      
      // Use a proxy or CORS-friendly API if available
      const response = await axios.get('https://api.solanabeach.io/v1/epoch/current', {
        timeout: 5000
      });
      
      if (response.data) {
        console.log("Solana Beach API response:", response.data);
        // Format the data according to our EpochInfo type
        return {
          epoch: response.data.epoch,
          slotIndex: response.data.slotIndex || 0,
          slotsInEpoch: response.data.slotsInEpoch || 432000, // Default Solana epoch size
          absoluteSlot: response.data.absoluteSlot || 0,
          blockHeight: response.data.blockHeight || 0,
          transactionCount: null,
          timeRemaining: response.data.timeRemaining || 
                       (response.data.slotsRemaining ? Math.round(response.data.slotsRemaining * 0.4) : 0)
        };
      }
    } catch (error) {
      console.error("Error fetching from Solana Beach API:", error);
    }
    
    // If we've tried all options and none worked
    console.error("All methods failed when fetching epoch info");
    toast.error("Failed to fetch epoch information from all sources");
    return null;
  } catch (finalError) {
    console.error("Unexpected error in fetchEpochInfo:", finalError);
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
