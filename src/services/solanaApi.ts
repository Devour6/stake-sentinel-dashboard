
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
  fetchAllValidators
} from "./api/validatorApi";
import {
  fetchEpochInfo,
  fetchCurrentEpoch,
  fetchVoteAccounts
} from "./api/epochApi";
import {
  fetchReliableTotalStake as fetchTotalStake,
  fetchReliableStakeChanges as fetchStakeChanges,
  fetchReliableStakeHistory as fetchStakeHistory
} from "./api/betterStakeService";

// Type imports
import type { ValidatorInfo, ValidatorMetrics, StakeHistoryItem, ValidatorSearchResult, EpochInfo, RpcVoteAccount } from "./api/types";
import type { ValidatorI, ClusterStatsI, EpochInfoI } from "./api/interfaces";

// Re-export everything
export {
  // Constants
  VALIDATOR_PUBKEY,
  VALIDATOR_IDENTITY,
  RPC_ENDPOINT,
  
  // Types
  type ValidatorInfo,
  type ValidatorMetrics,
  type StakeHistoryItem,
  type ValidatorSearchResult,
  type ValidatorI,
  type ClusterStatsI,
  type EpochInfoI,
  type EpochInfo,
  type RpcVoteAccount,
  
  // API methods
  fetchValidatorInfo,
  fetchValidatorMetrics,
  fetchAllValidators,
  fetchEpochInfo,
  fetchCurrentEpoch,
  fetchVoteAccounts,
  
  // Stake data fetching
  fetchTotalStake,
  fetchStakeChanges,
  fetchStakeHistory,
  
  // Utils
  validateVotePubkey,
  formatSol,
  formatCommission,
  formatChange,
  formatNumber,
  lamportsToSol
};
