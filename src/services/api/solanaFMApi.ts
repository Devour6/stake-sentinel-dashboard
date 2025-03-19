
import axios from "axios";
import { toast } from "sonner";
import { StakeHistoryItem } from "./types";
import { generateStakeHistory } from "./onchainStakeApi";

// SolanaFM API endpoint
const SOLANAFM_API_URL = "https://api.solana.fm/v0";

// Cache for SolanaFM responses to improve performance
const stakeCache = new Map<string, { value: number, timestamp: number }>();
const historyCache = new Map<string, { data: StakeHistoryItem[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the current total stake for a validator from SolanaFM
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
    
    // Try fetch from the latest stake history entry
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
          if (stake > 0) {
            stakeCache.set(votePubkey, { value: stake, timestamp: now });
            return stake;
          }
        }
      }
    } catch (historyErr) {
      console.error("Error fetching from history endpoint:", historyErr);
    }
    
    // Next, try their validators list endpoint and filter for our validator
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
          if (stake > 0) {
            stakeCache.set(votePubkey, { value: stake, timestamp: now });
            return stake;
          }
        }
      }
    } catch (err) {
      console.error("Error with validators list endpoint:", err);
    }
    
    // Try the Stakewiz API as fallback
    try {
      const stakewizResponse = await axios.get(`https://api.stakewiz.com/validator/${votePubkey}`, {
        timeout: 8000
      });
      
      if (stakewizResponse.data && stakewizResponse.data.activated_stake) {
        const stake = stakewizResponse.data.activated_stake;
        console.log(`Found stake from Stakewiz: ${stake} SOL`);
        if (stake > 0) {
          stakeCache.set(votePubkey, { value: stake, timestamp: now });
          return stake;
        }
      }
    } catch (err) {
      console.error("Error with Stakewiz fallback:", err);
    }
    
    // Try direct RPC call to get vote accounts as a last resort
    try {
      const rpcResponse = await fetch("https://mainnet.helius-rpc.com/?api-key=dff978e2-fae5-4768-8ee2-8e01b2c7fe2f", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-vote-accounts",
          method: "getVoteAccounts"
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (rpcResponse.ok) {
        const data = await rpcResponse.json();
        
        if (data && data.result) {
          const { current, delinquent } = data.result;
          const allAccounts = [...current, ...delinquent];
          const validator = allAccounts.find(acc => acc.votePubkey === votePubkey);
          
          if (validator && validator.activatedStake) {
            const stake = validator.activatedStake / 1_000_000_000;
            console.log(`Found stake from RPC vote accounts: ${stake} SOL`);
            if (stake > 0) {
              stakeCache.set(votePubkey, { value: stake, timestamp: now });
              return stake;
            }
          }
        }
      }
    } catch (rpcError) {
      console.error("Error fetching from RPC:", rpcError);
    }
    
    // If we get here, we couldn't get a valid stake value
    console.log("Failed to get stake data from any source");
    return 0;
  } catch (error) {
    console.error("Error fetching stake from SolanaFM:", error);
    return 0;
  }
};

/**
 * Fetches stake history for a validator from SolanaFM
 */
export const fetchSolanaFMStakeHistory = async (votePubkey: string): Promise<StakeHistoryItem[]> => {
  try {
    // Check cache first
    const now = Date.now();
    const cachedData = historyCache.get(votePubkey);
    if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
      console.log(`Using cached stake history for ${votePubkey}`);
      return cachedData.data;
    }
    
    console.log(`Fetching stake history from SolanaFM for vote account: ${votePubkey}`);
    
    // Try first endpoint - validator history
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
        const sortedHistory = formattedHistory.sort((a, b) => a.epoch - b.epoch);
        historyCache.set(votePubkey, { data: sortedHistory, timestamp: now });
        return sortedHistory;
      }
    } catch (err) {
      console.error("First endpoint failed:", err);
    }
    
    // Try second endpoint - validator epochs
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
        const sortedHistory = formattedHistory.sort((a, b) => a.epoch - b.epoch);
        historyCache.set(votePubkey, { data: sortedHistory, timestamp: now });
        return sortedHistory;
      }
    } catch (err) {
      console.error("Second endpoint failed:", err);
    }
    
    // Fallback to stake history from Stakewiz
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
        const sortedHistory = formattedHistory.sort((a, b) => a.epoch - b.epoch);
        historyCache.set(votePubkey, { data: sortedHistory, timestamp: now });
        return sortedHistory;
      }
    } catch (err) {
      console.error("Stakewiz history endpoint failed:", err);
    }
    
    // Try to construct history from validator list endpoint
    try {
      const validatorsResponse = await axios.get(`${SOLANAFM_API_URL}/validators`, {
        timeout: 10000
      });
      
      if (validatorsResponse.data && validatorsResponse.data.result) {
        const validators = validatorsResponse.data.result;
        const validator = validators.find((v: any) => v.voteAccount === votePubkey);
        
        if (validator && validator.activatedStake) {
          // Create at least one data point for the current epoch
          const currentEpoch = validator.epoch || 758; // Use epoch from validator or default to recent epoch
          
          const formattedHistory: StakeHistoryItem[] = [{
            epoch: currentEpoch,
            stake: validator.activatedStake / 1_000_000_000,
            date: new Date().toISOString()
          }];
          
          historyCache.set(votePubkey, { data: formattedHistory, timestamp: now });
          return formattedHistory;
        }
      }
    } catch (err) {
      console.error("Validator list endpoint failed:", err);
    }
    
    // If all fails, just return an empty array
    console.log("All stake history endpoints failed, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching stake history from SolanaFM:", error);
    return [];
  }
};
