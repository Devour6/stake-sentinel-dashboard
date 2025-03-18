
import axios from "axios";
import { toast } from "sonner";
import { StakeHistoryItem } from "./types";
import { generateStakeHistory } from "./onchainStakeApi";

// SolanaFM API endpoint
const SOLANAFM_API_URL = "https://api.solana.fm/v0";

/**
 * Fetches the current total stake for a validator from SolanaFM
 */
export const fetchSolanaFMStake = async (votePubkey: string): Promise<number> => {
  try {
    console.log(`Fetching total stake from SolanaFM for vote account: ${votePubkey}`);
    
    // First, try SolanaFM's validator endpoint (most reliable)
    try {
      const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}`, {
        timeout: 10000
      });
      
      if (response.data && response.data.result) {
        const validatorData = response.data.result;
        const totalStake = validatorData.activatedStake / 1_000_000_000; // Convert lamports to SOL
        console.log(`SolanaFM total stake for ${votePubkey}: ${totalStake} SOL`);
        if (totalStake > 0) {
          return totalStake;
        }
      }
    } catch (err) {
      console.error("Error with primary SolanaFM validator endpoint:", err);
    }
    
    // Next, try their validators list endpoint and filter for our validator
    try {
      const validatorsListResponse = await axios.get(`${SOLANAFM_API_URL}/validators`, {
        timeout: 10000
      });
      
      if (validatorsListResponse.data && validatorsListResponse.data.result) {
        const validators = validatorsListResponse.data.result;
        const validator = validators.find((v: any) => v.voteAccount === votePubkey);
        
        if (validator && validator.activatedStake) {
          const stake = validator.activatedStake / 1_000_000_000;
          console.log(`Found stake in validators list: ${stake} SOL`);
          return stake;
        }
      }
    } catch (err) {
      console.error("Error with validators list endpoint:", err);
    }
    
    // Try the Stakewiz API as fallback
    try {
      const stakewizResponse = await axios.get(`https://api.stakewiz.com/validator/${votePubkey}`, {
        timeout: 10000
      });
      
      if (stakewizResponse.data && stakewizResponse.data.activated_stake) {
        const stake = stakewizResponse.data.activated_stake;
        console.log(`Found stake from Stakewiz: ${stake} SOL`);
        return stake;
      }
    } catch (err) {
      console.error("Error with Stakewiz fallback:", err);
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
    console.log(`Fetching stake history from SolanaFM for vote account: ${votePubkey}`);
    
    // Try first endpoint - validator history
    try {
      const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/history`, {
        timeout: 15000
      });
      
      console.log("SolanaFM history response:", response.data);
      
      if (response.data && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
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
    } catch (err) {
      console.error("First endpoint failed:", err);
    }
    
    // Try second endpoint - validator epochs
    try {
      const epochsResponse = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/epochs`, {
        timeout: 15000
      });
      
      if (epochsResponse.data && epochsResponse.data.result && Array.isArray(epochsResponse.data.result) && epochsResponse.data.result.length > 0) {
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
    } catch (err) {
      console.error("Second endpoint failed:", err);
    }
    
    // Fallback to stake history from Stakewiz
    try {
      const stakewizHistoryResponse = await axios.get(`https://api.stakewiz.com/validator/${votePubkey}/stake_history`, {
        timeout: 10000
      });
      
      if (stakewizHistoryResponse.data && Array.isArray(stakewizHistoryResponse.data) && stakewizHistoryResponse.data.length > 0) {
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
    } catch (err) {
      console.error("Stakewiz history endpoint failed:", err);
    }
    
    // If all fails, try to get at least current stake and generate history from it
    try {
      const totalStake = await fetchSolanaFMStake(votePubkey);
      if (totalStake > 0) {
        console.log(`Generating stake history based on current stake: ${totalStake}`);
        return generateStakeHistory(totalStake, votePubkey, 90);
      }
    } catch (err) {
      console.error("Failed to generate history from current stake:", err);
    }
    
    // Last resort - generate completely synthetic data
    console.log("All history endpoints failed, generating synthetic history");
    return generateStakeHistory(0, votePubkey, 90);
  } catch (error) {
    console.error("Error fetching stake history from SolanaFM:", error);
    return generateStakeHistory(0, votePubkey, 90);
  }
};
