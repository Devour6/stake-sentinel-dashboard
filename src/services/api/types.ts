
// Types for the Solana API responses and data structures
export interface ValidatorInfo {
  identity: string;
  votePubkey: string;
  commission: number;
  mevCommission: number; // MEV commission
  activatedStake: number;
  activatingStake: number;
  delinquentStake: number;
  epochCredits: number;
  lastVote: number;
  rootSlot: number;
  currentEpoch: number;
  epochTimeRemaining?: number; // Field for epoch timer
}

export interface StakeHistoryItem {
  epoch: number;
  stake: number;
  date: string;
}

export interface ValidatorMetrics {
  totalStake: number;
  activatingStake: number;
  commission: number;
  mevCommission: number; // MEV commission
  delegatorCount: number;
}
