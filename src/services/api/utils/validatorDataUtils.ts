
import { ValidatorSearchResult } from "../types";

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
      delinquent: false,
      website: null
    })),
    ...delinquent.map(validator => ({
      name: null,
      votePubkey: validator.votePubkey,
      identity: validator.nodePubkey,
      icon: null,
      activatedStake: parseFloat(validator.activatedStake) / 10**9,
      commission: validator.commission,
      delinquent: true,
      website: null
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
      if (configValidator.website) validator.website = configValidator.website;
      
      // Since we matched by identity, we might need to update our maps
      if (validator.votePubkey) {
        votePubkeyToValidator.set(validator.votePubkey, validator);
      }
    } else if (configValidator.votePubkey && votePubkeyToValidator.has(configValidator.votePubkey)) {
      // Check if we have a matching vote pubkey even though identity doesn't match
      const voteValidator = votePubkeyToValidator.get(configValidator.votePubkey);
      voteValidator.name = configValidator.name;
      if (configValidator.icon) voteValidator.icon = configValidator.icon;
      if (configValidator.website) voteValidator.website = configValidator.website;
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
  
  return validators;
};

// Apply well-known validator data to the validator list - optimized
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
        if (known.website) existingByVote.website = known.website;
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
          if (known.website) existingByIdentity.website = known.website;
        }
        continue; // Skip to next known validator
      }
    }
    
    // If not found at all, add it
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

// We've removed the enhanceTopValidatorsWithSolscan function since it was causing performance issues
