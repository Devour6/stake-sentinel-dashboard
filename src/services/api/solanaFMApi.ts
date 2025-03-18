
import axios from "axios";
import { toast } from "sonner";
import { StakeHistoryItem } from "./types";

// SolanaFM API endpoint
const SOLANAFM_API_URL = "https://api.solana.fm/v0";

/**
 * Fetches the current total stake for a validator from SolanaFM
 */
export const fetchSolanaFMStake = async (votePubkey: string): Promise<number> => {
  try {
    console.log(`Fetching total stake from SolanaFM for vote account: ${votePubkey}`);
    
    // Use SolanaFM's validator endpoint to get current stake
    const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}`, {
      timeout: 10000
    });
    
    console.log("SolanaFM validator response:", response.data);
    
    if (response.data && response.data.result) {
      const validatorData = response.data.result;
      const totalStake = validatorData.activatedStake / 1_000_000_000; // Convert lamports to SOL
      console.log(`SolanaFM total stake for ${votePubkey}: ${totalStake} SOL`);
      return totalStake;
    }
    
    // Try the vote account endpoint as a fallback
    const voteResponse = await axios.get(`${SOLANAFM_API_URL}/accounts/${votePubkey}`, {
      timeout: 10000
    });
    
    console.log("SolanaFM vote account response:", voteResponse.data);
    
    if (voteResponse.data && voteResponse.data.result && voteResponse.data.result.account) {
      // Parse the vote account data to extract stake info
      const accountInfo = voteResponse.data.result.account;
      if (accountInfo.lamports) {
        const stake = accountInfo.lamports / 1_000_000_000; // Convert lamports to SOL
        console.log(`Found stake in vote account: ${stake} SOL`);
        return stake;
      }
    }
    
    // If we can't get data from SolanaFM, try another approach
    const validatorsListResponse = await axios.get(`${SOLANAFM_API_URL}/validators?limit=1000`, {
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
    
    console.log("Could not retrieve stake data from SolanaFM, falling back to a default value");
    return 0; // Return 0 to indicate a problem instead of a fake value
  } catch (error) {
    console.error("Error fetching stake from SolanaFM:", error);
    return 0; // Return 0 to indicate a problem instead of a fake value
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
      // Use SolanaFM's validator history endpoint to get stake history
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
      
      console.log("SolanaFM epochs response:", epochsResponse.data);
      
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
    
    // Try third approach - get current stake and validator data
    try {
      const validatorResponse = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}`, {
        timeout: 10000
      });
      
      if (validatorResponse.data && validatorResponse.data.result) {
        const validatorData = validatorResponse.data.result;
        console.log("Using validator data to create a minimal history:", validatorData);
        
        const currentEpoch = validatorData.epoch || 758; // Fallback to approximate current epoch
        const currentStake = validatorData.activatedStake / 1_000_000_000;
        
        // Create a single data point for the current epoch
        return [{
          epoch: currentEpoch,
          stake: currentStake,
          date: new Date().toISOString()
        }];
      }
    } catch (err) {
      console.error("Third approach failed:", err);
    }
    
    console.log("All SolanaFM history endpoints failed, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching stake history from SolanaFM:", error);
    return [];
  }
};
