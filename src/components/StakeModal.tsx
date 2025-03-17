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

interface StakeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const StakeModal = ({ isOpen, setIsOpen }: StakeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const { isConnected, isConnecting, selectedWallet, connectWallet, disconnectWallet } = useWallet();

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
      // This is a placeholder - in a real app, you'd use the connected wallet to stake
      // using @solana/web3.js to create and send a staking transaction
      
      /* The actual staking process would look something like:
      1. Create a new stake account
      2. Transfer SOL to the stake account
      3. Delegate the stake to the validator
      4. Sign and send the transaction
      */
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully staked ${amount} SOL to Gojira validator`);
      setAmount("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to stake:", error);
      toast.error("Failed to stake");
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gojira-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-white">Stake to Gojira Validator</DialogTitle>
          <DialogDescription>
            Support Gojira by staking your SOL tokens to our validator.
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
            onClick={() => setIsOpen(false)}
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
