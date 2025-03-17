
// Types for the Solana API responses and data structures
export interface ValidatorInfo {
  identity: string;
  votePubkey: string;
  commission: number;
  activatedStake: number;
  activatingStake: number;
  delinquentStake: number;
  epochCredits: number;
  lastVote: number;
  rootSlot: number;
  currentEpoch: number;
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
}
