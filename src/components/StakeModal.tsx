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
import WalletSelector from "./wallet/WalletSelector";
import StakeForm from "./stake/StakeForm";
import { useWallet } from "@/hooks/use-wallet";
import {
  HELIUS_RPC_ENDPOINT,
  RPC_ENDPOINT,
  VALIDATOR_PUBKEY,
} from "@/services/api/constants";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
} from "@solana/web3.js";
import { executeTransaction } from "@/lib/tx";
import { findWalletProvider } from "@/lib/utils";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  validatorPubkey?: string;
  validatorName?: string;
}

const StakeModal = ({
  isOpen,
  onClose,
  validatorPubkey,
  validatorName,
}: StakeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const {
    isConnected,
    isConnecting,
    selectedWallet,
    connectWallet,
    disconnectWallet,
    publicKey,
  } = useWallet();

  const handleConnectOption = () => {
    setShowWalletOptions(true);
  };

  const handleSelectWallet = async (walletName: string) => {
    const success = await connectWallet(walletName);
    if (success) {
      setShowWalletOptions(false);
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsStaking(true);

    try {
      const walletProvider = findWalletProvider(selectedWallet || "");
      if (!walletProvider) {
        throw new Error(`Could not find wallet provider for ${selectedWallet}`);
      }

      const targetValidator = validatorPubkey || VALIDATOR_PUBKEY;

      const result = await createStakeTransaction(
        walletProvider,
        parseFloat(amount),
        targetValidator
      );

      if (result) {
        toast.success(
          `Successfully initiated staking of ${amount} SOL to ${
            validatorName || "Gojira Validator"
          }`
        );
        setAmount("");
        onClose();
      } else {
        toast.error("Staking transaction was not completed");
      }
    } catch (error: any) {
      console.error("Failed to stake:", error);
      toast.error(error.message || "Failed to stake");
    } finally {
      setIsStaking(false);
    }
  };

  const createStakeTransaction = async (
    provider: any,
    amountSol: number,
    votePubkey: string
  ): Promise<boolean> => {
    if (!provider) {
      throw new Error("Wallet provider not found");
    }

    try {
      if (!provider.publicKey && !provider.signTransaction) {
        throw new Error("Wallet doesn't support transaction signing");
      }

      const lamports = amountSol * 1_000_000_000;
      const connection = new Connection(HELIUS_RPC_ENDPOINT);

      try {
        const publicKey = (await provider.connect()).publicKey;
        console.log(publicKey);
        const stakeAccount = Keypair.generate();

        const stakeTx = StakeProgram.createAccount({
          fromPubkey: publicKey,
          stakePubkey: stakeAccount.publicKey,
          authorized: {
            staker: publicKey,
            withdrawer: publicKey,
          },
          lamports,
        });
        const delegateTx = StakeProgram.delegate({
          stakePubkey: stakeAccount.publicKey,
          authorizedPubkey: publicKey,
          votePubkey: new PublicKey(votePubkey),
        });
        const delegateIx = delegateTx.instructions.filter((t) =>
          t.programId.equals(StakeProgram.programId)
        )[0];
        stakeTx.add(delegateIx);

        stakeTx.feePayer = publicKey;
        stakeTx.recentBlockhash = (
          await connection.getLatestBlockhash("confirmed")
        ).blockhash;
        stakeTx.sign(stakeAccount);
        const serializeData = await provider.signTransaction(stakeTx);

        const signature = await executeTransaction(
          connection,
          serializeData.serialize()
        );
        return !!signature;
      } catch (error: any) {
        if (
          error.message &&
          (error.message.includes("cancelled") ||
            error.message.includes("rejected") ||
            error.message.includes("User denied"))
        ) {
          toast.error("Transaction was cancelled");
          return false;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error creating stake transaction:", error);
      throw new Error("Failed to create stake transaction");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-white">
            Swap to aeroSOL {validatorName ? `via ${validatorName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Support the Solana network by swapping your SOL tokens to aeroSOL{" "}
            {validatorName ? `via ${validatorName}` : ""}.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <>
            {!showWalletOptions ? (
              <div className="flex justify-center my-6">
                <Button
                  onClick={handleConnectOption}
                  className="bg-gojira-red hover:bg-gojira-red-dark"
                >
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <WalletSelector
                onWalletSelect={handleSelectWallet}
                isConnecting={isConnecting}
                selectedWallet={selectedWallet}
              />
            )}
          </>
        ) : (
          <StakeForm
            amount={amount}
            setAmount={setAmount}
            onStake={handleStake}
            isStaking={isStaking}
            selectedWallet={selectedWallet}
            onDisconnect={disconnectWallet}
          />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gojira-gray-light text-white"
          >
            Cancel
          </Button>

          {isConnected && (
            <Button
              onClick={handleStake}
              className="bg-gojira-red hover:bg-gojira-red-dark"
              disabled={isStaking || !amount}
            >
              {isStaking ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Swapping...
                </>
              ) : (
                "Swap"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StakeModal;
