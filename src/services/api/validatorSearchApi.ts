
import { toast } from "sonner";
import { ValidatorSearchResult } from "./types";
import { getFromValidatorCache } from "./search/validatorCache";
import { fetchValidatorsFromStakewiz } from "./search/stakewizSearch";
import { fetchValidatorsFallback, getWellKnownValidatorsFallback } from "./search/fallbackSearch";

// Main function to fetch all validators for search - optimized
export const fetchAllValidators = async (): Promise<ValidatorSearchResult[]> => {
  try {
    // Check cache first
    const cachedValidators = getFromValidatorCache();
    if (cachedValidators) {
      return cachedValidators;
    }
    
    console.log("Fetching all validators...");
    
    // Try Stakewiz for validators first (most reliable)
    const stakewizValidators = await fetchValidatorsFromStakewiz();
    if (stakewizValidators) {
      return stakewizValidators;
    }
    
    // If Stakewiz fails, try the traditional method
    return await fetchValidatorsFallback();
  } catch (error) {
    console.error("Error fetching validators:", error);
    toast.error("Failed to fetch validators");
    
    // Use well-known validators as fallback when everything else fails
    return getWellKnownValidatorsFallback();
  }
};
