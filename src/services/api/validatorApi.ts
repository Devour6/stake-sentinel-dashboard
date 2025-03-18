
// Refactored validator API - Split into multiple files for better organization
import { fetchStakeHistory } from "./stakeApi";

// Import from the new specialized modules
import { fetchValidatorInfo } from "./validatorInfoApi";
import { fetchValidatorMetrics } from "./validatorMetricsApi";

// Re-export functions from the specialized modules
export {
  fetchValidatorInfo,
  fetchValidatorMetrics
};

// Re-export functions from other related API modules
import { fetchAllValidators } from "./validatorSearchApi";
import { fetchValidatorStake } from "./validatorStakeApi";

export {
  fetchAllValidators,
  fetchValidatorStake,
  fetchStakeHistory
};
