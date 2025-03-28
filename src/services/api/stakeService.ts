import { toast } from "sonner";
import { VALIDATOR_PUBKEY } from "./constants";
import { StakeHistoryItem } from "./types";
import axios from "axios";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Fetch stake history from Stakewiz
export const fetchStakeHistory = async (
  votePubkey = VALIDATOR_PUBKEY,
  days = 30
): Promise<StakeHistoryItem[]> => {
  try {
    console.log(`Fetching stake history for ${votePubkey}...`);

    // Try to get data from Stakewiz API with increased timeout
    try {
      const response = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}/stake_history`,
        {
          timeout: 15000,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        console.log(
          `Found ${response.data.length} stake history records from Stakewiz`
        );

        // Convert to our StakeHistoryItem format
        const stakeHistory: StakeHistoryItem[] = response.data.map((item) => ({
          epoch: item.epoch,
          stake: item.stake,
          date: item.date,
        }));

        // Sort by epoch in ascending order
        return stakeHistory.sort((a, b) => a.epoch - b.epoch);
      }
    } catch (stakewizError) {
      console.error(
        "Error fetching stake history from Stakewiz:",
        stakewizError
      );
    }

    // If Stakewiz fails, generate mock data based on the validator pubkey
    console.log("Falling back to mock stake history data");
  } catch (error) {
    console.error(`Error fetching stake history for ${votePubkey}:`, error);
  }

  return [];
};

// Attempt to get delegator count with multiple RPC endpoints
export const fetchDelegatorCount = async (
  votePubkey = VALIDATOR_PUBKEY
): Promise<number | null> => {
  try {
    // Try to get data from Stakewiz API with increased timeout
    try {
      const response = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}/stake_accounts`,
        {
          timeout: 8000,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.length;
      }
    } catch (error) {
      console.error("Error fetching delegator count from Stakewiz:", error);
    }

    // Try the main validator endpoint which might have this info
    try {
      const validatorResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        {
          timeout: 8000,
        }
      );

      if (
        validatorResponse.data &&
        validatorResponse.data.stake_account_count
      ) {
        return validatorResponse.data.stake_account_count;
      }
    } catch (error) {
      console.error("Error fetching from main validator endpoint:", error);
    }
  } catch (error) {
    console.error("Error fetching delegator count:", error);
  }
};
