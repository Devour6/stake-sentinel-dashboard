
import axios from "axios";
import { STAKEWIZ_API_URL } from "../constants";
import { ValidatorSearchResult } from "../types";
import { sortValidatorsByStake } from "../utils/validatorDataUtils";
import { saveToValidatorCache } from "./validatorCache";

// Fetch validators from Stakewiz API
export const fetchValidatorsFromStakewiz = async (): Promise<ValidatorSearchResult[] | null> => {
  try {
    const stakewizResponse = await axios.get(`${STAKEWIZ_API_URL}/validators`, {
      timeout: 15000
    });
    
    if (stakewizResponse.data && Array.isArray(stakewizResponse.data)) {
      console.log(`Fetched ${stakewizResponse.data.length} validators from Stakewiz`);
      
      // Process Stakewiz validators
      const stakewizValidators: ValidatorSearchResult[] = stakewizResponse.data.map(validator => ({
        name: validator.name || null,
        votePubkey: validator.vote_identity,
        identity: validator.identity,
        icon: validator.image || null,
        activatedStake: validator.activated_stake || 0,
        commission: validator.commission || 0,
        delinquent: validator.delinquent || false,
        website: validator.website || null
      }));
      
      // Sort by activated stake
      const sortedValidators = sortValidatorsByStake(stakewizValidators);
      
      // Cache the results
      saveToValidatorCache(sortedValidators);
      
      console.log(`Returning ${sortedValidators.length} validators from Stakewiz`);
      return sortedValidators;
    }
    return null;
  } catch (stakewizError) {
    console.error("Error fetching from Stakewiz validators API:", stakewizError);
    return null;
  }
};
