
// If this file doesn't exist, I'll create it with the necessary types
export interface StakeHistoryItem {
  epoch: number;
  stake: number;
  date: string;
}

export interface ValidatorMetrics {
  totalStake: number;
  pendingStakeChange: number;
  isDeactivating: boolean;
  commission: number;
  mevCommission?: number;
  estimatedApy: number | null;
  activatingStake?: number;
  deactivatingStake?: number;
  description?: string | null;
  version?: string | null;
  uptime30d?: number | null;
  website?: string | null;
}

export interface ValidatorInfo {
  name: string;
  votePubkey: string;
  identity?: string;
  commission?: number;
  activatedStake?: number;
  icon?: string | null;
  website?: string | null;
}

export interface ValidatorSearchResult {
  name: string | null;
  votePubkey: string;
  identity?: string;
  commission?: number;
  activatedStake?: number;
  icon?: string | null;
}

export interface EpochInfo {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
  transactionCount: number | null;
  timeRemaining: number;
}

export interface RpcVoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number;
  epochVoteAccount: boolean;
  commission: number;
  lastVote: number;
  rootSlot: number;
}
