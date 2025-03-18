
import axios from "axios";
import { getAllWellKnownValidators } from "./data/wellKnownValidators";
import { ValidatorSearchResult } from "./types";

// Set up base URLs
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Cache for validator details
const validatorDetailsCache = new Map<string, any>();

// Function to fetch validator details - prioritizing Stakewiz API
export const fetchValidatorDetailsFromSolscan = async (votePubkey: string) => {
  try {
    // Check cache first
    if (validatorDetailsCache.has(votePubkey)) {
      return validatorDetailsCache.get(votePubkey);
    }
    
    console.log("Fetching details for validator:", votePubkey);
    
    // Try to fetch from Stakewiz API first (most reliable)
    try {
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 10000 }
      );
      
      if (stakewizResponse.data) {
        console.log("Retrieved validator data from Stakewiz API:", stakewizResponse.data);
        const data = stakewizResponse.data;
        const result = {
          name: data.name || null,
          logo: data.image || null,
          website: data.website || null
        };
        validatorDetailsCache.set(votePubkey, result);
        return result;
      }
    } catch (stakewizError) {
      console.log("Could not fetch from Stakewiz API, using fallback", stakewizError);
    }
    
    // Check if it's in our well-known validators list as fallback
    const wellKnownValidators = getAllWellKnownValidators();
    const knownValidator = wellKnownValidators.find(v => v.votePubkey === votePubkey);
    
    if (knownValidator && knownValidator.name) {
      console.log("Found validator in well-known list:", knownValidator.name);
      const result = { 
        name: knownValidator.name, 
        logo: knownValidator.icon || null,
        website: knownValidator.website || null
      };
      validatorDetailsCache.set(votePubkey, result);
      return result;
    }
    
    // Create a fallback name from the vote pubkey
    const shortPubkey = `${votePubkey.substring(0, 6)}...${votePubkey.substring(votePubkey.length - 4)}`;
    const result = { 
      name: `Validator ${shortPubkey}`, 
      logo: null,
      website: null
    };
    validatorDetailsCache.set(votePubkey, result);
    return result;
  } catch (error) {
    console.error("Error fetching validator details:", error);
    const shortPubkey = `${votePubkey.substring(0, 6)}...${votePubkey.substring(votePubkey.length - 4)}`;
    return { 
      name: `Validator ${shortPubkey}`, 
      logo: null,
      website: null
    };
  }
};

// Optimized function that doesn't try to enhance every validator
export const enhanceValidatorWithSolscanData = async (validators: ValidatorSearchResult[]) => {
  // Only enhance validators that don't have names or have generic names
  const validatorsToEnhance = validators
    .filter(v => (!v.name || v.name.startsWith('Validator ')))
    .slice(0, 20); // Only enhance a small batch to improve performance
  
  if (validatorsToEnhance.length === 0) {
    return validators;
  }
  
  console.log(`Enhancing ${validatorsToEnhance.length} validators with Stakewiz data`);
  
  // Create a map for easy lookup
  const votePubkeyToValidator = new Map<string, ValidatorSearchResult>();
  validators.forEach(validator => {
    if (validator.votePubkey) {
      votePubkeyToValidator.set(validator.votePubkey, validator);
    }
  });
  
  // Process validators in sequence to avoid rate limiting
  for (const validator of validatorsToEnhance) {
    try {
      const details = await fetchValidatorDetailsFromSolscan(validator.votePubkey);
      
      const existingValidator = votePubkeyToValidator.get(validator.votePubkey);
      if (existingValidator) {
        if (details.name) existingValidator.name = details.name;
        if (details.logo) existingValidator.icon = details.logo;
        if (details.website) existingValidator.website = details.website;
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error enhancing validator ${validator.votePubkey}:`, error);
    }
  }
  
  return validators;
};
