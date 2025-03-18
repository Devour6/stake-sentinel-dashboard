
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
import { VALIDATOR_PUBKEY } from "@/services/api/constants";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  validatorPubkey: string;
  validatorName: string;
}

const StakeModal = ({ isOpen, onClose, validatorPubkey, validatorName }: StakeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const { isConnected, isConnecting, selectedWallet, connectWallet, disconnectWallet, publicKey } = useWallet();

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
      // Find the wallet provider
      const walletProvider = findWalletProvider(selectedWallet || "");
      
      if (!walletProvider) {
        throw new Error(`Could not find wallet provider for ${selectedWallet}`);
      }

      // Create stake transaction
      await createStakeTransaction(walletProvider, parseFloat(amount), validatorPubkey);
      
      toast.success(`Successfully initiated staking of ${amount} SOL to ${validatorName}`);
      setAmount("");
      onClose();
    } catch (error: any) {
      console.error("Failed to stake:", error);
      toast.error(error.message || "Failed to stake");
    } finally {
      setIsStaking(false);
    }
  };

  // Helper function to find wallet provider
  const findWalletProvider = (walletName: string): any => {
    // Standardized wallet names
    const nameLower = walletName.toLowerCase().trim();
    
    // Common wallet provider names
    const providerNames: Record<string, string[]> = {
      "phantom": ["solana", "phantom"],
      "solflare": ["solflare"],
      "backpack": ["backpack", "xnft"],
      "magic eden": ["magicEden", "magiceden"],
      "coinbase": ["coinbaseWallet", "coinbaseWalletExtension"],
      "slope": ["slope", "slopeWallet"],
      "brave": ["braveSolanaAdapter", "braveWallet"],
      "exodus": ["exodus"],
      "glow": ["glow"],
    };
    
    // Try to find provider based on wallet name
    for (const [key, names] of Object.entries(providerNames)) {
      if (nameLower === key || nameLower.includes(key) || key.includes(nameLower)) {
        for (const name of names) {
          const provider = (window as any)[name];
          if (provider && typeof provider === 'object') {
            return provider;
          }
        }
      }
    }
    
    // Fallback to using any available provider
    return (window as any).solana || (window as any).solflare;
  };

  // Create and send stake transaction
  const createStakeTransaction = async (provider: any, amountSol: number, votePubkey: string) => {
    if (!provider) {
      throw new Error("Wallet provider not found");
    }

    try {
      // Check if wallet has necessary methods
      if (!provider.signAndSendTransaction && !provider.signTransaction) {
        throw new Error("Wallet doesn't support transaction signing");
      }

      // Construct transaction request
      const amountLamports = amountSol * 1_000_000_000; // Convert SOL to lamports
      
      // For Phantom and compatible wallets
      if (provider.createStakeAccount) {
        const result = await provider.createStakeAccount({
          fromPubkey: publicKey,
          lamports: amountLamports,
          stakePubkey: null, // Let wallet generate new stake account
          votePubkey: votePubkey,
          withdrawAuthority: publicKey,
          stakeAuthority: publicKey,
        });
        
        console.log("Stake transaction result:", result);
        return result;
      }
      
      // For other wallets, use standard signing approach
      // This will vary by wallet, so we'll use the most universal approach
      // by redirecting to the stakeview.app URL
      const stakeLinkUrl = `https://stakeview.app/stake-to/${votePubkey}?amount=${amountSol}`;
      
      if (confirm("Redirecting to StakeView to complete staking. Continue?")) {
        window.open(stakeLinkUrl, "_blank");
      }
    } catch (error) {
      console.error("Error creating stake transaction:", error);
      throw new Error("Failed to create stake transaction");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gojira-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-white">Stake to {validatorName}</DialogTitle>
          <DialogDescription>
            Support the Solana network by staking your SOL tokens to this validator.
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
                  Staking...
                </>
              ) : (
                "Stake"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StakeModal;
