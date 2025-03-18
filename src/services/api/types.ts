// Types for the Solana API responses and data structures
export interface ValidatorInfo {
  identity: string;
  votePubkey: string;
  commission: number;
  activatedStake: number;
  pendingStakeChange: number;
  isDeactivating: boolean;
  delinquentStake: number;
  epochCredits: number;
  lastVote: number;
  rootSlot: number;
  currentEpoch: number;
  name?: string;
  icon?: string | null;
  website?: string | null;
  description?: string; // Added field
  version?: string; // Added field
  uptime30d?: number; // Added field for 30-day uptime percentage
}

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
  estimatedApy?: number;
  activatingStake?: number;
  deactivatingStake?: number;
  description?: string; // Added field
  version?: string; // Added field
  uptime30d?: number; // Added field for 30-day uptime percentage
  website?: string | null; // Adding the missing website property
}

// Raw RPC response interfaces
export interface RpcVoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number;
  epochVoteAccount: boolean;
  commission: number;
  lastVote: number;
  epochCredits: [number, number, number][];
  rootSlot?: number;
}

// Interface for stake accounts response
export interface StakeAccountInfo {
  pubkey: string;
  account: {
    data: {
      parsed: {
        type: string;
        info: {
          meta: {
            authorized: {
              staker: string;
              withdrawer: string;
            };
            lockup: {
              custodian: string;
              epoch: number;
              unixTimestamp: number;
            };
            rentExemptReserve: string;
          };
          stake: {
            creditsObserved: number;
            delegation: {
              activationEpoch: string;
              deactivationEpoch: string;
              stake: string;
              voter: string;
            };
          };
        };
      };
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
}

// Adding a new interface for validator search results
export interface ValidatorSearchResult {
  name: string | null;
  votePubkey: string;
  identity: string;
  icon?: string | null;
  activatedStake?: number;
  commission?: number;
  delinquent?: boolean;
  website?: string | null;
}

// Add interface for on-chain validator config data
export interface ValidatorConfigData {
  name?: string;
  keybaseUsername?: string;
  website?: string;
  details?: string;
  [key: string]: any; // For any other properties that might be in the JSON
}

// Interface for epoch information
export interface EpochInfo {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight?: number;
  transactionCount?: number;
  timeRemaining?: number; // Added field for time remaining in seconds
}
