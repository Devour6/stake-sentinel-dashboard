
import { toast } from "sonner";
import { VALIDATOR_PUBKEY } from "./constants";
import { StakeHistoryItem } from "./types";
import axios from "axios";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Fetch stake history from Stakewiz with improved reliability
export const fetchStakeHistory = async (votePubkey = VALIDATOR_PUBKEY): Promise<StakeHistoryItem[]> => {
  try {
    console.log(`Fetching stake history for ${votePubkey}...`);
    
    // Try to get data from Stakewiz API with increased timeout
    const response = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake_history`, {
      timeout: 30000 // Increase timeout to 30 seconds
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} stake history records from Stakewiz`);
      
      if (response.data.length === 0) {
        console.log("Empty response from Stakewiz");
        throw new Error("No stake history data available");
      }
      
      // Convert to our StakeHistoryItem format
      const stakeHistory: StakeHistoryItem[] = response.data.map(item => ({
        epoch: item.epoch,
        stake: item.stake,
        date: item.date
      }));
      
      // Sort by epoch in ascending order
      return stakeHistory.sort((a, b) => a.epoch - b.epoch);
    } else {
      throw new Error("Invalid response format from Stakewiz");
    }
  } catch (error) {
    console.error(`Error fetching stake history for ${votePubkey}:`, error);
    throw error; // Re-throw to handle in the component
  }
};

// Attempt to get delegator count with improved reliability
export const fetchDelegatorCount = async (votePubkey = VALIDATOR_PUBKEY): Promise<number | null> => {
  try {
    // Try to get data from Stakewiz API with increased timeout
    const response = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake_accounts`, {
      timeout: 20000 // Increased timeout to 20 seconds
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.length;
    }
    
    // Try the main validator endpoint which might have this info
    const validatorResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}`, {
      timeout: 20000
    });
    
    if (validatorResponse.data && validatorResponse.data.stake_account_count) {
      return validatorResponse.data.stake_account_count;
    }
    
    throw new Error("No delegator data available");
  } catch (error) {
    console.error("Error fetching delegator count:", error);
    throw error; // Re-throw to handle in the component
  }
};
