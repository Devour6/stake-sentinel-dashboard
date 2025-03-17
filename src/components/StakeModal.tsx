
import { useState, useEffect } from "react";
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
import { VALIDATOR_PUBKEY } from "@/services/solanaApi";

interface StakeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type WalletType = {
  name: string;
  icon: string;
};

const WALLETS: WalletType[] = [
  { name: "Phantom", icon: "https://phantom.app/favicon.ico" },
  { name: "Solflare", icon: "https://solflare.com/favicon.ico" },
  { name: "Backpack", icon: "https://backpack.app/favicon.ico" },
  { name: "Glow", icon: "https://glow.app/favicon.ico" },
];

const StakeModal = ({ isOpen, setIsOpen }: StakeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Check if window.solana exists, indicating a Solana wallet extension
  useEffect(() => {
    const checkWalletConnection = async () => {
      // This is a simplified check - in a real app, use proper wallet adapters
      if (window.solana?.isPhantom || window.solflare) {
        try {
          // Check if already connected
          const walletPubkey = localStorage.getItem("walletPubkey");
          if (walletPubkey) {
            setIsConnected(true);
            setSelectedWallet(localStorage.getItem("walletName") || "Wallet");
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const handleConnectOption = () => {
    setShowWalletOptions(true);
  };

  const handleSelectWallet = async (walletName: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletName);
    
    try {
      // This is a placeholder - in a real app, you'd use a wallet adapter library
      // like @solana/wallet-adapter-react to connect to the selected wallet
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful connection
      const mockPubkey = "5pV7aBJyZcEXPGGENNWzANkdShxf8RQEKfRHMQB8Lc9x";
      localStorage.setItem("walletPubkey", mockPubkey);
      localStorage.setItem("walletName", walletName);
      
      setIsConnected(true);
      setShowWalletOptions(false);
      toast.success(`${walletName} wallet connected successfully`);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error(`Failed to connect ${walletName}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("walletPubkey");
    localStorage.removeItem("walletName");
    setIsConnected(false);
    setSelectedWallet(null);
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
              <div className="py-4 space-y-4">
                <h3 className="text-sm font-medium text-white">Select a wallet</h3>
                <div className="grid grid-cols-2 gap-3">
                  {WALLETS.map((wallet) => (
                    <Button
                      key={wallet.name}
                      variant="outline"
                      className="flex items-center justify-start gap-2 py-5 border-gojira-gray-light hover:bg-gojira-gray-light"
                      disabled={isConnecting}
                      onClick={() => handleSelectWallet(wallet.name)}
                    >
                      {isConnecting && selectedWallet === wallet.name ? (
                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <img src={wallet.icon} alt={wallet.name} className="h-5 w-5" />
                      )}
                      <span>{wallet.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Connected to {selectedWallet}
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="text-xs text-gojira-red hover:text-gojira-red-light hover:bg-transparent"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
            
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
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Gojira Validator Address:</p>
              <p className="font-mono text-xs break-all">{VALIDATOR_PUBKEY}</p>
              <p className="mt-2 text-xs">
                Staking through this interface delegates your SOL to Gojira's validator. 
                You maintain full custody of your tokens and can unstake anytime.
              </p>
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
