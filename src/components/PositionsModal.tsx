import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { HELIUS_RPC_ENDPOINT } from "@/services/api/constants";
import {
  Connection,
  PublicKey,
  StakeProgram,
  Transaction,
} from "@solana/web3.js";
import { executeTransaction } from "@/lib/tx";
import { useStakes } from "@/hooks/iseStakesData";
import { formatSol } from "@/services/solanaApi";
import { findWalletProvider } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface PositionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validatorName?: string;
}

const PositionsModal = ({
  isOpen,
  onClose,
  validatorName,
}: PositionsModalProps) => {
  const { selectedWallet, publicKey } = useWallet();
  const queryClient = useQueryClient();
  const connection = new Connection(HELIUS_RPC_ENDPOINT);

  const { data: stakesInfo, invalidate } = useStakes({
    address: publicKey,
  });

  const handleDeactivate = async (stakeAddress: string) => {
    const stakePubkey = new PublicKey(stakeAddress);

    try {
      // Find the wallet provider
      const walletProvider = findWalletProvider(selectedWallet || "");
      if (!walletProvider) {
        throw new Error(`Could not find wallet provider for ${selectedWallet}`);
      }

      const tx = new Transaction();

      const walletPubkey = new PublicKey(publicKey);
      const deactiveIx = StakeProgram.deactivate({
        stakePubkey,
        authorizedPubkey: walletPubkey,
      }).instructions.filter((t) =>
        t.programId.equals(StakeProgram.programId)
      )[0];
      tx.add(deactiveIx);

      tx.feePayer = walletPubkey;
      tx.recentBlockhash = (
        await connection.getLatestBlockhash("confirmed")
      ).blockhash;
      const serializeData = await walletProvider.signTransaction(tx);
      const signature = await executeTransaction(
        connection,
        serializeData.serialize()
      );

      if (signature) {
        toast.success(`Successfully deactivated`);
        onClose();
      } else {
        // Transaction was not confirmed or was cancelled
        toast.error("Deactivate transaction was not completed");
      }
    } catch (error: any) {
      console.error("Failed to deactivate:", error);
      toast.error(error.message || "Failed to deactivate");
    } finally {
      invalidate();
    }
  };

  const handleWithdraw = async (stakeAddress: string, lamports: number) => {
    const stakePubkey = new PublicKey(stakeAddress);

    try {
      // Find the wallet provider
      const walletProvider = findWalletProvider(selectedWallet || "");
      if (!walletProvider) {
        throw new Error(`Could not find wallet provider for ${selectedWallet}`);
      }

      const tx = new Transaction();

      const walletPubkey = new PublicKey(publicKey);

      const withdrawIx = StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: walletPubkey,
        toPubkey: walletPubkey,
        lamports,
      }).instructions.filter((t) =>
        t.programId.equals(StakeProgram.programId)
      )[0];
      tx.add(withdrawIx);

      tx.feePayer = walletPubkey;
      tx.recentBlockhash = (
        await connection.getLatestBlockhash("confirmed")
      ).blockhash;
      const serializeData = await walletProvider.signTransaction(tx);
      const signature = await executeTransaction(
        connection,
        serializeData.serialize()
      );

      if (signature) {
        toast.success(`Successfully withdrawn`);
        onClose();
      } else {
        // Transaction was not confirmed or was cancelled
        toast.error("Withdrawn transaction was not completed");
      }
    } catch (error: any) {
      console.error("Failed to withdrawn:", error);
      toast.error(error.message || "Failed to withdrawn");
    } finally {
      invalidate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-aero-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-white mb-2">My stakes</DialogTitle>
          <DialogDescription>
            Here is your positions which staked on {validatorName || "Gojira"}{" "}
            validator.
          </DialogDescription>
        </DialogHeader>

        <table className="table-auto">
          <thead className="text-left">
            <tr>
              <th>Address</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stakesInfo.length > 0 ? (
              <>
                {stakesInfo.map((stake, idx) => (
                  <tr
                    key={`stake-item-${idx}`}
                    className="text-md text-gray-300"
                  >
                    <td>
                      <span className="w-40">{`${stake.account.substring(
                        0,
                        8
                      )}...`}</span>
                    </td>
                    <td>
                      <span className="w-24">
                        {formatSol(stake.lamports)} SOL
                      </span>
                    </td>
                    <td className="py-1">
                      <span>
                        {stake.activationEpoch == stake.deactivationEpoch
                          ? "Inactive"
                          : "Activating"}
                      </span>
                    </td>
                    <td className="py-1">
                      {stake.activationEpoch == stake.deactivationEpoch ? (
                        <button
                          type="button"
                          className="border px-2.5 py-1.5 rounded-xl text-white hover:border-aero-red"
                          onClick={() =>
                            handleWithdraw(stake.account, stake.lamports)
                          }
                        >
                          Withdraw
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="border px-2.5 py-1.5 rounded-xl text-aero-red hover:border-aero-red"
                          onClick={() => handleDeactivate(stake.account)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <>
                <tr className="text-md text-gray-300">
                  <td colSpan={4} className="text-center py-4">
                    <span>--- No stakes ---</span>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-aero-gray-light text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionsModal;
