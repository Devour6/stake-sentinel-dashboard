import { HELIUS_RPC_ENDPOINT } from "@/services/api/constants";
import { RPC_ENDPOINT } from "@/services/solanaApi";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  StakeProgram,
} from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type StakeInfo = {
  account: string;
  lamports: number;
  activationEpoch: string;
  deactivationEpoch: string;
};

export type StakesInfo = StakeInfo[];

export const useStakes = ({ address }: { address: string | null }) => {
  const queryClient = useQueryClient();

  const { data, ...rest } = useQuery<StakesInfo>(
    {
      queryKey: ["stakes", address],
      queryFn: async () => {
        const stakes: StakeInfo[] = [];
        if (address) {
          const connection = new Connection(HELIUS_RPC_ENDPOINT);

          // fetch all stake account for this wallet
          const allStakeAccounts = await connection.getParsedProgramAccounts(
            StakeProgram.programId,
            {
              filters: [
                {
                  memcmp: {
                    offset: 12, // number of bytes
                    bytes: address, // base58 encoded string
                  },
                },
              ],
              commitment: "confirmed",
            }
          );

          for (const stake of allStakeAccounts) {
            const delegration = (stake.account.data as ParsedAccountData).parsed
              .info.stake.delegation;
            const { activationEpoch, deactivationEpoch } = delegration;

            stakes.push({
              lamports: stake.account.lamports,
              account: stake.pubkey.toBase58(),
              activationEpoch,
              deactivationEpoch,
            });
          }
        }

        return stakes;
      },
      enabled: !!address,
    },
    queryClient
  );
  return {
    ...rest,
    data: data ?? [],
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["stakes"] }),
  };
};
