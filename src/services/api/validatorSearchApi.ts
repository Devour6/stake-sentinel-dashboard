
import { toast } from "sonner";
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

// Main function to fetch all validators for search - optimized
export const fetchAllValidators = async (): Promise<ValidatorSearchResult[]> => {
  try {
    console.log("Fetching all validators...");
    
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
