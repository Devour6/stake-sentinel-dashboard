
import { toast } from "sonner";
import { ValidatorSearchResult } from "./types";
import { fetchVoteAccounts } from "./epochApi";
import { fetchValidatorConfig } from "./validatorConfigApi";
import { getAllWellKnownValidators } from "./data/wellKnownValidators";
import { 
  processVoteAccountValidators,
  matchValidatorsWithConfigs,
  applyWellKnownValidatorData,
  enhanceTopValidatorsWithSolscan,
  fillMissingValidatorNames,
  sortValidatorsByStake
} from "./utils/validatorDataUtils";

// Main function to fetch all validators for search
export const fetchAllValidators = async (): Promise<ValidatorSearchResult[]> => {
  try {
    console.log("Fetching all validators...");
    
    // First fetch all active and delinquent validators
    const { current, delinquent } = await fetchVoteAccounts();
    
    console.log(`Fetched ${current.length} active validators and ${delinquent.length} delinquent validators`);
    
    // Process both current and delinquent validators into a unified format
    let allValidators = processVoteAccountValidators(current, delinquent);
    
    console.log(`Processed ${allValidators.length} total validators`);
    
    // Fetch on-chain validator info for names and websites
    try {
      console.log("Fetching on-chain validator configurations...");
      const onChainValidators = await fetchValidatorConfig();
      console.log(`Fetched ${onChainValidators.length} on-chain validator configurations`);
      
      // Match on-chain config with validators by identity key
      allValidators = matchValidatorsWithConfigs(allValidators, onChainValidators);
    } catch (error) {
      console.error("Error fetching validator on-chain info:", error);
      // Continue with fallback names
    }

    // Add well-known validators if they're not already in the list
    // or update names for existing validators
    const wellKnownValidators = getAllWellKnownValidators();
    allValidators = applyWellKnownValidatorData(allValidators, wellKnownValidators);
    
    // Try to enhance data with Solscan for popular validators (limit to reduce API load)
    try {
      allValidators = await enhanceTopValidatorsWithSolscan(allValidators);
    } catch (error) {
      console.error("Error enhancing validators with Solscan data:", error);
    }
    
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
