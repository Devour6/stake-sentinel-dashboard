
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface StakeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const StakeModal = ({ isOpen, setIsOpen }: StakeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // This is a placeholder - in a real app, you'd use a wallet adapter to connect
      // like @solana/wallet-adapter-react
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(true);
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully staked ${amount} SOL to Gojira validator`);
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
          <div className="flex justify-center my-6">
            <Button
              onClick={handleConnectWallet}
              className="bg-gojira-red hover:bg-gojira-red-dark"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-white">
                Amount (SOL)
              </label>
              <Input
                id="amount"
                placeholder="Enter SOL amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.1"
                className="bg-gojira-gray border-gojira-gray-light"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Gojira Validator Address:</p>
              <p className="font-mono">CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1</p>
            </div>
          </div>
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
