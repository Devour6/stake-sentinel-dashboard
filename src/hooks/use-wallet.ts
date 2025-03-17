
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      // This is a simplified check - in a real app, use proper wallet adapters
      if ((window.solana && window.solana.isPhantom) || window.solflare) {
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

  const connectWallet = async (walletName: string) => {
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
      toast.success(`${walletName} wallet connected successfully`);
      return true;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error(`Failed to connect ${walletName}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("walletPubkey");
    localStorage.removeItem("walletName");
    setIsConnected(false);
    setSelectedWallet(null);
  };

  return {
    isConnecting,
    isConnected,
    selectedWallet,
    connectWallet,
    disconnectWallet
  };
}
