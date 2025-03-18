
// Cache for validators list
let cachedValidators: import('../types').ValidatorSearchResult[] | null = null;
let lastValidatorFetchTime = 0;
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export const getFromValidatorCache = () => {
  const now = Date.now();
  if (cachedValidators && now - lastValidatorFetchTime < CACHE_VALIDITY_MS) {
    console.log("Using cached validators list");
    return cachedValidators;
  }
  return null;
};

export const saveToValidatorCache = (validators: import('../types').ValidatorSearchResult[]) => {
  cachedValidators = validators;
  lastValidatorFetchTime = Date.now();
};
