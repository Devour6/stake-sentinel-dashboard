
import { ValidatorSearchResult } from "../types";
import { enhanceValidatorWithSolscanData } from "../solscanApi";

// Function to process validators from vote accounts data
export const processVoteAccountValidators = (
  current: any[],
  delinquent: any[]
): ValidatorSearchResult[] => {
  return [
    ...current.map(validator => ({
      name: null, // Will be filled with on-chain name data
      votePubkey: validator.votePubkey,
      identity: validator.nodePubkey,
      icon: null, // Initialize with null, will be populated later
      activatedStake: parseFloat(validator.activatedStake) / 10**9, // Convert lamports to SOL
      commission: validator.commission,
      delinquent: false
    })),
    ...delinquent.map(validator => ({
      name: null,
      votePubkey: validator.votePubkey,
      identity: validator.nodePubkey,
      icon: null,
      activatedStake: parseFloat(validator.activatedStake) / 10**9,
      commission: validator.commission,
      delinquent: true
    }))
  ];
};

// Function to match on-chain validator configurations with validators
export const matchValidatorsWithConfigs = (
  validators: ValidatorSearchResult[],
  onChainValidators: ValidatorSearchResult[]
): ValidatorSearchResult[] => {
  // Create maps for easy lookup by identity and vote pubkey
  const identityToValidator = new Map<string, ValidatorSearchResult>();
  const votePubkeyToValidator = new Map<string, ValidatorSearchResult>();
  
  validators.forEach(validator => {
    if (validator.identity) {
      identityToValidator.set(validator.identity, validator);
    }
    if (validator.votePubkey) {
      votePubkeyToValidator.set(validator.votePubkey, validator);
    }
  });
  
  // Match on-chain config with validators by identity key
  for (const configValidator of onChainValidators) {
    if (!configValidator.identity) continue;
    
    const validator = identityToValidator.get(configValidator.identity);
    if (validator) {
      validator.name = configValidator.name;
      if (configValidator.icon) validator.icon = configValidator.icon;
      console.log(`Matched on-chain name for identity ${validator.identity}: ${validator.name}`);
      
      // Since we matched by identity, we might need to update our maps
      if (validator.votePubkey) {
        votePubkeyToValidator.set(validator.votePubkey, validator);
      }
    } else {
      // If we have on-chain info but no matching validator in our list, add it
      console.log(`Found on-chain validator with no matching identity: ${configValidator.name} (${configValidator.identity})`);
      
      // Check if we have a matching vote pubkey even though identity doesn't match
      if (configValidator.votePubkey && votePubkeyToValidator.has(configValidator.votePubkey)) {
        const voteValidator = votePubkeyToValidator.get(configValidator.votePubkey);
        voteValidator.name = configValidator.name;
        if (configValidator.icon) voteValidator.icon = configValidator.icon;
        console.log(`Matched on-chain name by vote pubkey: ${voteValidator.votePubkey} -> ${voteValidator.name}`);
      } else {
        // Add as a new validator
        const newValidator = {
          ...configValidator,
          activatedStake: 0,
          commission: 0,
          delinquent: false
        };
        
        validators.push(newValidator);
        
        // Update maps
        if (newValidator.identity) {
          identityToValidator.set(newValidator.identity, newValidator);
        }
        if (newValidator.votePubkey) {
          votePubkeyToValidator.set(newValidator.votePubkey, newValidator);
        }
      }
    }
  }
  
  return validators;
};

// Apply well-known validator data to the validator list
export const applyWellKnownValidatorData = (
  validators: ValidatorSearchResult[],
  wellKnownValidators: any[]
): ValidatorSearchResult[] => {
  // Create maps for easy lookup
  const votePubkeyToValidator = new Map<string, ValidatorSearchResult>();
  const identityToValidator = new Map<string, ValidatorSearchResult>();
  
  validators.forEach(validator => {
    if (validator.votePubkey) {
      votePubkeyToValidator.set(validator.votePubkey, validator);
    }
    if (validator.identity) {
      identityToValidator.set(validator.identity, validator);
    }
  });
  
  for (const known of wellKnownValidators) {
    if (!known.votePubkey) continue;
    
    // Check by vote pubkey first (more reliable)
    const existingByVote = votePubkeyToValidator.get(known.votePubkey);
    
    if (existingByVote) {
      if (!existingByVote.name || existingByVote.name === '') {
        existingByVote.name = known.name;
        if (known.icon) existingByVote.icon = known.icon;
        console.log(`Added well-known name by vote pubkey for ${known.name} (${known.votePubkey})`);
      }
      continue; // Skip to next known validator
    }
    
    // If not found by vote pubkey, try by identity
    if (known.identity) {
      const existingByIdentity = identityToValidator.get(known.identity);
      
      if (existingByIdentity) {
        if (!existingByIdentity.name || existingByIdentity.name === '') {
          existingByIdentity.name = known.name;
          if (known.icon) existingByIdentity.icon = known.icon;
          console.log(`Added well-known name by identity for ${known.name} (${known.identity})`);
        }
        continue; // Skip to next known validator
      }
    }
    
    // If not found at all, add it
    console.log(`Adding missing well-known validator: ${known.name} (${known.votePubkey})`);
    const newValidator = {
      ...known,
      activatedStake: 0,
      commission: 0,
      delinquent: false
    };
    
    validators.push(newValidator);
    
    // Update maps
    if (newValidator.votePubkey) {
      votePubkeyToValidator.set(newValidator.votePubkey, newValidator);
    }
    if (newValidator.identity) {
      identityToValidator.set(newValidator.identity, newValidator);
    }
  }
  
  return validators;
};

// Enhance validators with Solscan data
export const enhanceTopValidatorsWithSolscan = async (validators: ValidatorSearchResult[]): Promise<ValidatorSearchResult[]> => {
  try {
    const topValidators = validators
      .filter(v => v.activatedStake > 1000 && (!v.name || v.name.startsWith('Validator ')))
      .slice(0, 25);
    
    console.log(`Enhancing ${topValidators.length} top validators with Solscan data`);
    const enhancedTopValidators = await enhanceValidatorWithSolscanData(topValidators);
    
    // Create map for easy lookup
    const votePubkeyToValidator = new Map<string, ValidatorSearchResult>();
    validators.forEach(validator => {
      if (validator.votePubkey) {
        votePubkeyToValidator.set(validator.votePubkey, validator);
      }
    });
    
    // Update the name and icon for enhanced validators
    enhancedTopValidators.forEach(validator => {
      const existingValidator = votePubkeyToValidator.get(validator.votePubkey);
      if (existingValidator) {
        if (validator.name) existingValidator.name = validator.name;
        if (validator.icon) existingValidator.icon = validator.icon;
      }
    });
    
    return validators;
  } catch (error) {
    console.error("Error enhancing validators with Solscan data:", error);
    return validators;
  }
};

// Fill missing validator names with default format
export const fillMissingValidatorNames = (validators: ValidatorSearchResult[]): ValidatorSearchResult[] => {
  validators.forEach(validator => {
    if (!validator.name || validator.name === '') {
      validator.name = `Validator ${validator.votePubkey.substring(0, 6)}...${validator.votePubkey.substring(validator.votePubkey.length - 4)}`;
    }
  });
  
  return validators;
};

// Sort validators by stake (highest first)
export const sortValidatorsByStake = (validators: ValidatorSearchResult[]): ValidatorSearchResult[] => {
  return [...validators].sort((a, b) => (b.activatedStake || 0) - (a.activatedStake || 0));
};
