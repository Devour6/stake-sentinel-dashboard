
import { toast } from "sonner";
import axios from "axios";
import { ValidatorSearchResult } from "./types";
import { fetchVoteAccounts } from "./epochApi";
import { fetchValidatorConfig } from "./validatorConfigApi";
import { getAllWellKnownValidators } from "./data/wellKnownValidators";
import { 
  processVoteAccountValidators,
  matchValidatorsWithConfigs,
  applyWellKnownValidatorData,
  fillMissingValidatorNames,
  sortValidatorsByStake
} from "./utils/validatorDataUtils";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Cache for validators list
let cachedValidators: ValidatorSearchResult[] | null = null;
let lastValidatorFetchTime = 0;
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Main function to fetch all validators for search - optimized
export const fetchAllValidators = async (): Promise<ValidatorSearchResult[]> => {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedValidators && now - lastValidatorFetchTime < CACHE_VALIDITY_MS) {
      console.log("Using cached validators list");
      return cachedValidators;
    }
    
    console.log("Fetching all validators...");
    
    // Try Stakewiz for validators first (most reliable)
    try {
      const stakewizResponse = await axios.get(`${STAKEWIZ_API_URL}/validators`, {
        timeout: 15000
      });
      
      if (stakewizResponse.data && Array.isArray(stakewizResponse.data)) {
        console.log(`Fetched ${stakewizResponse.data.length} validators from Stakewiz`);
        
        // Process Stakewiz validators
        let stakewizValidators = stakewizResponse.data.map(validator => ({
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
        stakewizValidators = sortValidatorsByStake(stakewizValidators);
        
        // Cache the results
        cachedValidators = stakewizValidators;
        lastValidatorFetchTime = now;
        
        console.log(`Returning ${stakewizValidators.length} validators from Stakewiz`);
        return stakewizValidators;
      }
    } catch (stakewizError) {
      console.error("Error fetching from Stakewiz validators API:", stakewizError);
    }
    
    // If Stakewiz fails, try the traditional method
    // First fetch all active and delinquent validators
    const { current, delinquent } = await fetchVoteAccounts();
    
    console.log(`Fetched ${current.length} active validators and ${delinquent.length} delinquent validators`);
    
    // Process both current and delinquent validators into a unified format
    let allValidators = processVoteAccountValidators(current, delinquent);
    
    console.log(`Processed ${allValidators.length} total validators`);
    
    // Get well-known validators to speed up the process
    const wellKnownValidators = getAllWellKnownValidators();
    
    // Enhance with on-chain data in a non-blocking way
    fetchValidatorConfig().then(onChainValidators => {
      try {
        // Match on-chain config with validators by identity key
        matchValidatorsWithConfigs(allValidators, onChainValidators);
        console.log("Enhanced validators with on-chain data");
      } catch (error) {
        console.error("Error matching validators with configs:", error);
      }
    }).catch(error => {
      console.error("Error fetching validator on-chain info:", error);
    });
    
    // Immediately apply well-known validators data - this is fast since it's local
    allValidators = applyWellKnownValidatorData(allValidators, wellKnownValidators);
    
    // Fill missing names with first characters of vote pubkey
    allValidators = fillMissingValidatorNames(allValidators);
    
    // Sort by activated stake (highest first)
    allValidators = sortValidatorsByStake(allValidators);
    
    // Cache the results
    cachedValidators = allValidators;
    lastValidatorFetchTime = now;
    
    console.log(`Returning ${allValidators.length} validators for search`);
    return allValidators;
  } catch (error) {
    console.error("Error fetching validators:", error);
    toast.error("Failed to fetch validators");
    
    // Use well-known validators as fallback
    const wellKnownValidators = getAllWellKnownValidators();
    
    return wellKnownValidators.map(v => ({
      ...v,
      activatedStake: 0,
      commission: 0,
      delinquent: false
    }));
  }
};
