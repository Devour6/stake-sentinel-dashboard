
// This file re-exports from the refactored modules
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY } from "./api/constants";
import {
  validateVotePubkey,
  formatSol,
  formatCommission,
  formatChange,
  formatNumber,
  lamportsToSol
} from "./api/utils";
import {
  fetchValidatorInfo,
  fetchValidatorMetrics,
  fetchStakeHistory
} from "./api/validatorApi";

// Type imports
import type { ValidatorInfo, ValidatorMetrics, StakeHistoryItem } from "./api/types";

// Re-export everything
export {
  // Constants
  VALIDATOR_PUBKEY,
  VALIDATOR_IDENTITY,
  
  // Types - use 'export type' for TypeScript types
  type ValidatorInfo,
  type ValidatorMetrics,
  type StakeHistoryItem,
  
  // API methods
  fetchValidatorInfo,
  fetchValidatorMetrics,
  fetchStakeHistory,
  
  // Utils
  validateVotePubkey,
  formatSol,
  formatCommission,
  formatChange,
  formatNumber,
  lamportsToSol
};
