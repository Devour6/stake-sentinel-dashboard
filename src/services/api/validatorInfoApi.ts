
import { toast } from "sonner";
import { ValidatorInfo } from "./types";
import { VALIDATOR_PUBKEY } from "./constants";
import { getFromCache } from "./utils/validatorCache";
import { fetchFromStakewiz } from "./stakewizApi";
import { fetchValidatorInfoFallback } from "./validatorInfoFallback";

// Improved method to fetch validator info - prioritizing Stakewiz
export const fetchValidatorInfo = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info for ${votePubkey}...`);
    
    // Check cache first
    const cachedData = getFromCache(votePubkey);
    if (cachedData) {
      console.log("Using cached validator info");
      return cachedData.validatorInfo;
    }
    
    // First try Stakewiz API directly - most reliable source
    const stakewizData = await fetchFromStakewiz(votePubkey);
    if (stakewizData) {
      console.log("Successfully fetched data from Stakewiz");
      return stakewizData;
    }
    
    // If Stakewiz fails, use the fallback method
    console.log("Stakewiz fetch failed, using fallback...");
    return await fetchValidatorInfoFallback(votePubkey);
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data.");
    return null;
  }
};
