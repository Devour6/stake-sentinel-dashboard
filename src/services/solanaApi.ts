
// This file re-exports from the refactored modules
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY, RPC_ENDPOINT } from "./api/constants";
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
  fetchStakeHistory,
  fetchAllValidators
} from "./api/validatorApi";
import {
  fetchEpochInfo,
  fetchCurrentEpoch
} from "./api/epochApi";

// Type imports
import type { ValidatorInfo, ValidatorMetrics, StakeHistoryItem, ValidatorSearchResult, EpochInfo } from "./api/types";
import type { ValidatorI, ClusterStatsI, EpochInfoI } from "./api/interfaces";

// Re-export everything
export {
  // Constants
  VALIDATOR_PUBKEY,
  VALIDATOR_IDENTITY,
  RPC_ENDPOINT,
  
  // Types - use 'export type' for TypeScript types
  type ValidatorInfo,
  type ValidatorMetrics,
  type StakeHistoryItem,
  type ValidatorSearchResult,
  type ValidatorI,
  type ClusterStatsI,
  type EpochInfoI,
  type EpochInfo,
  
  // API methods
  fetchValidatorInfo,
  fetchValidatorMetrics,
  fetchStakeHistory,
  fetchAllValidators,
  fetchEpochInfo,
  fetchCurrentEpoch,
  
  // Utils
  validateVotePubkey,
  formatSol,
  formatCommission,
  formatChange,
  formatNumber,
  lamportsToSol
};
