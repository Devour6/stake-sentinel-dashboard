
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
