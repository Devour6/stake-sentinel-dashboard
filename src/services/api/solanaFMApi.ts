
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
    
    if (voteResponse.data && voteResponse.data.result && voteResponse.data.result.account) {
      // Parse the vote account data to extract stake info
      const accountInfo = voteResponse.data.result.account;
      if (accountInfo.lamports) {
        const stake = accountInfo.lamports / 1_000_000_000; // Convert lamports to SOL
        console.log(`Found stake in vote account: ${stake} SOL`);
        return stake;
      }
    }
    
    // If we can't get data from SolanaFM, throw error to trigger fallback
    throw new Error("Could not retrieve stake data from SolanaFM");
  } catch (error) {
    console.error("Error fetching stake from SolanaFM:", error);
    // Return 0 to trigger fallback mechanism in the component
    return 0;
  }
};

/**
 * Fetches stake history for a validator from SolanaFM
 */
export const fetchSolanaFMStakeHistory = async (votePubkey: string): Promise<StakeHistoryItem[]> => {
  try {
    console.log(`Fetching stake history from SolanaFM for vote account: ${votePubkey}`);
    
    // Use SolanaFM's validator endpoint to get stake history
    const response = await axios.get(`${SOLANAFM_API_URL}/validators/${votePubkey}/history`, {
      timeout: 15000
    });
    
    if (response.data && response.data.result && Array.isArray(response.data.result)) {
      const historyData = response.data.result;
      console.log(`Retrieved ${historyData.length} stake history records from SolanaFM`);
      
      // Format the data for our chart component
      const formattedHistory: StakeHistoryItem[] = historyData.map(item => ({
        epoch: item.epoch,
        stake: item.activatedStake / 1_000_000_000, // Convert lamports to SOL
        date: new Date(item.timestamp * 1000).toISOString() // Convert unix timestamp to ISO date
      }));
      
      // Sort by epoch in ascending order
      return formattedHistory.sort((a, b) => a.epoch - b.epoch);
    }
    
    // Alternative approach: try SolanaFM's epoch history endpoint
    const epochResponse = await axios.get(`${SOLANAFM_API_URL}/epochs`, {
      params: {
        limit: 50
      },
      timeout: 12000
    });
    
    if (epochResponse.data && epochResponse.data.result && Array.isArray(epochResponse.data.result)) {
      const epochsData = epochResponse.data.result;
      console.log(`Retrieved ${epochsData.length} epochs from SolanaFM`);
      
      // Now for each epoch, try to get validator data
      const historyPromises = epochsData.map(async (epochInfo) => {
        try {
          const validatorResponse = await axios.get(
            `${SOLANAFM_API_URL}/validators/${votePubkey}?epoch=${epochInfo.epoch}`,
            { timeout: 5000 }
          );
          
          if (validatorResponse.data && validatorResponse.data.result) {
            const validatorData = validatorResponse.data.result;
            return {
              epoch: epochInfo.epoch,
              stake: validatorData.activatedStake / 1_000_000_000,
              date: new Date(epochInfo.timestamp * 1000).toISOString()
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching data for epoch ${epochInfo.epoch}:`, err);
          return null;
        }
      });
      
      // Wait for all promises and filter out null values
      const historyResults = (await Promise.all(historyPromises)).filter(item => item !== null) as StakeHistoryItem[];
      
      if (historyResults.length > 0) {
        console.log(`Generated ${historyResults.length} stake history points from epoch data`);
        return historyResults.sort((a, b) => a.epoch - b.epoch);
      }
    }
    
    // If we still don't have data, generate fallback data based on current stake
    throw new Error("Could not retrieve stake history from SolanaFM");
  } catch (error) {
    console.error("Error fetching stake history from SolanaFM:", error);
    
    // Return an empty array to trigger fallback mechanism in the component
    return [];
  }
};
