
import axios from "axios";
import { toast } from "sonner";
import { StakeHistoryItem } from "./types";
import { fetchOnchainTotalStake, fetchOnchainStakeHistory } from "./onchainStakeApi";

// SolanaFM API endpoint
const SOLANAFM_API_URL = "https://api.solana.fm/v0";

// Alternative RPCs for redundancy
const ALTERNATIVE_RPCS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana"
];

// Cache for SolanaFM responses to improve performance
const stakeCache = new Map<string, { value: number, timestamp: number }>();
const historyCache = new Map<string, { data: StakeHistoryItem[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the current total stake for a validator from SolanaFM with fallbacks to multiple sources
 */
export const fetchSolanaFMStake = async (votePubkey: string): Promise<number> => {
  try {
    // Check cache first
    const now = Date.now();
    const cachedData = stakeCache.get(votePubkey);
    if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
      console.log(`Using cached stake data for ${votePubkey}: ${cachedData.value} SOL`);
      return cachedData.value;
    }
    
    console.log(`Fetching total stake from SolanaFM for vote account: ${votePubkey}`);
    
    // First, try SolanaFM's validator endpoint (most reliable)
    try {
      const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}`, {
        timeout: 8000
      });
      
      if (response.data && response.data.result) {
        const validatorData = response.data.result;
        
        // If activatedStake is available, use it
        if (validatorData.activatedStake) {
          const totalStake = validatorData.activatedStake / 1_000_000_000; // Convert lamports to SOL
          console.log(`SolanaFM total stake for ${votePubkey}: ${totalStake} SOL`);
          if (totalStake > 0) {
            stakeCache.set(votePubkey, { value: totalStake, timestamp: now });
            return totalStake;
          }
        }
        
        // Try other potential stake fields if activatedStake is missing or zero
        if (validatorData.stake) {
          const stakeValue = typeof validatorData.stake === 'number' 
            ? validatorData.stake 
            : parseFloat(validatorData.stake);
          
          // Check if we need to convert from lamports
          const totalStake = stakeValue > 100000000 
            ? stakeValue / 1_000_000_000 
            : stakeValue;
            
          console.log(`SolanaFM stake field value: ${totalStake} SOL`);
          if (totalStake > 0) {
            stakeCache.set(votePubkey, { value: totalStake, timestamp: now });
            return totalStake;
          }
        }
      }
    } catch (err) {
      console.error("Error with primary SolanaFM validator endpoint:", err);
    }
    
    // Try multiple fallback methods in parallel
    const results = await Promise.allSettled([
      // Method 1: Try fetch from the latest stake history entry
      (async () => {
        try {
          const historyResponse = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/history`, {
            timeout: 8000
          });
          
          if (historyResponse.data && historyResponse.data.result && 
              Array.isArray(historyResponse.data.result) && 
              historyResponse.data.result.length > 0) {
            
            // Sort by epoch in descending order to get the latest
            const sortedHistory = [...historyResponse.data.result].sort((a, b) => b.epoch - a.epoch);
            const latestEntry = sortedHistory[0];
            
            if (latestEntry && latestEntry.activatedStake) {
              const stake = latestEntry.activatedStake / 1_000_000_000;
              console.log(`Found stake from latest history entry: ${stake} SOL`);
              if (stake > 0) return stake;
            }
          }
          return 0;
        } catch (error) {
          console.error("Error fetching from history endpoint:", error);
          return 0;
        }
      })(),
      
      // Method 2: Try their validators list endpoint 
      (async () => {
        try {
          const validatorsListResponse = await axios.get(`${SOLANAFM_API_URL}/validators`, {
            timeout: 8000
          });
          
          if (validatorsListResponse.data && validatorsListResponse.data.result) {
            const validators = validatorsListResponse.data.result;
            const validator = validators.find((v: any) => v.voteAccount === votePubkey);
            
            if (validator && validator.activatedStake) {
              const stake = validator.activatedStake / 1_000_000_000;
              console.log(`Found stake in validators list: ${stake} SOL`);
              if (stake > 0) return stake;
            }
          }
          return 0;
        } catch (error) {
          console.error("Error with validators list endpoint:", error);
          return 0;
        }
      })(),
      
      // Method 3: Try Stakewiz API
      (async () => {
        try {
          const stakewizResponse = await axios.get(`https://api.stakewiz.com/validator/${votePubkey}`, {
            timeout: 8000
          });
          
          if (stakewizResponse.data && stakewizResponse.data.activated_stake) {
            const stake = stakewizResponse.data.activated_stake;
            console.log(`Found stake from Stakewiz: ${stake} SOL`);
            if (stake > 0) return stake;
          }
          return 0;
        } catch (error) {
          console.error("Error with Stakewiz fallback:", error);
          return 0;
        }
      })(),
      
      // Method 4: Try direct RPC call to get vote accounts
      (async () => {
        try {
          const result = await fetchOnchainTotalStake(votePubkey);
          console.log(`On-chain total stake result: ${result} SOL`);
          return result;
        } catch (error) {
          console.error("Error with direct on-chain query:", error);
          return 0;
        }
      })()
    ]);
    
    // Find the first successful result with a non-zero value
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value > 0) {
        console.log(`Using successful stake result: ${result.value} SOL`);
        stakeCache.set(votePubkey, { value: result.value, timestamp: now });
        return result.value;
      }
    }
    
    console.error("All stake retrieval methods failed");
    return 0;
  } catch (error) {
    console.error("Fatal error fetching stake from any source:", error);
    return 0;
  }
};

/**
 * Fetches stake history for a validator from SolanaFM with fallbacks
 */
export const fetchSolanaFMStakeHistory = async (votePubkey: string): Promise<StakeHistoryItem[]> => {
  try {
    // Check cache first
    const now = Date.now();
    const cachedData = historyCache.get(votePubkey);
    if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
      console.log(`Using cached stake history for ${votePubkey}, ${cachedData.data.length} entries`);
      return cachedData.data;
    }
    
    console.log(`Fetching stake history from SolanaFM for vote account: ${votePubkey}`);
    
    // Try multiple sources in parallel
    const results = await Promise.allSettled([
      // Method 1: SolanaFM validator history
      (async () => {
        try {
          const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/history`, {
            timeout: 10000
          });
          
          if (response.data && response.data.result && 
              Array.isArray(response.data.result) && 
              response.data.result.length > 0) {
            const historyData = response.data.result;
            console.log(`Retrieved ${historyData.length} stake history records from SolanaFM`);
            
            // Format the data for our chart component
            const formattedHistory: StakeHistoryItem[] = historyData.map(item => ({
              epoch: item.epoch,
              stake: item.activatedStake / 1_000_000_000, // Convert lamports to SOL
              date: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : new Date().toISOString() // Convert unix timestamp to ISO date
            }));
            
            // Sort by epoch in ascending order
            return formattedHistory.sort((a, b) => a.epoch - b.epoch);
          }
          return [];
        } catch (error) {
          console.error("SolanaFM history endpoint failed:", error);
          return [];
        }
      })(),
      
      // Method 2: SolanaFM validator epochs
      (async () => {
        try {
          const epochsResponse = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/epochs`, {
            timeout: 10000
          });
          
          if (epochsResponse.data && epochsResponse.data.result && 
              Array.isArray(epochsResponse.data.result) && 
              epochsResponse.data.result.length > 0) {
            const epochsData = epochsResponse.data.result;
            console.log(`Retrieved ${epochsData.length} epoch records from SolanaFM`);
            
            // Format the data for our chart component
            const formattedHistory: StakeHistoryItem[] = epochsData.map(item => ({
              epoch: item.epoch,
              stake: item.activatedStake / 1_000_000_000, // Convert lamports to SOL
              date: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : new Date().toISOString()
            }));
            
            // Sort by epoch in ascending order
            return formattedHistory.sort((a, b) => a.epoch - b.epoch);
          }
          return [];
        } catch (error) {
          console.error("SolanaFM epochs endpoint failed:", error);
          return [];
        }
      })(),
      
      // Method 3: Stakewiz stake history
      (async () => {
        try {
          const stakewizHistoryResponse = await axios.get(`https://api.stakewiz.com/validator/${votePubkey}/stake_history`, {
            timeout: 10000
          });
          
          if (stakewizHistoryResponse.data && 
              Array.isArray(stakewizHistoryResponse.data) && 
              stakewizHistoryResponse.data.length > 0) {
            console.log(`Retrieved ${stakewizHistoryResponse.data.length} stake history records from Stakewiz`);
            
            // Format the data for our chart component
            const formattedHistory: StakeHistoryItem[] = stakewizHistoryResponse.data.map(item => ({
              epoch: item.epoch,
              stake: item.stake,
              date: item.date || new Date().toISOString()
            }));
            
            // Sort by epoch in ascending order
            return formattedHistory.sort((a, b) => a.epoch - b.epoch);
          }
          return [];
        } catch (error) {
          console.error("Stakewiz history endpoint failed:", error);
          return [];
        }
      })(),
      
      // Method 4: Direct on-chain history
      (async () => {
        try {
          const onchainHistory = await fetchOnchainStakeHistory(votePubkey);
          console.log(`Retrieved ${onchainHistory.length} stake history records from on-chain data`);
          return onchainHistory;
        } catch (error) {
          console.error("On-chain history retrieval failed:", error);
          return [];
        }
      })()
    ]);
    
    // Use the result with the most data points
    let bestResult: StakeHistoryItem[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > bestResult.length) {
        bestResult = result.value;
      }
    }
    
    if (bestResult.length > 0) {
      console.log(`Using best stake history result with ${bestResult.length} entries`);
      historyCache.set(votePubkey, { data: bestResult, timestamp: now });
      return bestResult;
    }
    
    console.error("All stake history retrieval methods failed");
    return [];
  } catch (error) {
    console.error("Fatal error fetching stake history from any source:", error);
    return [];
  }
};
