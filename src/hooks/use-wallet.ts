
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      const walletPubkey = localStorage.getItem("walletPubkey");
      const storedWalletName = localStorage.getItem("walletName");
      
      if (walletPubkey && storedWalletName) {
        setIsConnected(true);
        setSelectedWallet(storedWalletName);
        setPublicKey(walletPubkey);
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async (walletName: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletName);
    
    try {
      let walletPublicKey: string | null = null;
      
      // Actual wallet connection logic
      if (walletName === "Phantom") {
        if (!window.solana || !window.solana.isPhantom) {
          window.open("https://phantom.app/", "_blank");
          throw new Error("Phantom wallet is not installed");
        }
        
        try {
          // This will prompt the user to connect
          const resp = await window.solana.connect();
          walletPublicKey = resp.publicKey.toString();
        } catch (error) {
          console.error("User rejected the connection request", error);
          throw new Error("Connection rejected");
        }
      } 
      else if (walletName === "Solflare") {
        if (!window.solflare) {
          window.open("https://solflare.com/", "_blank");
          throw new Error("Solflare wallet is not installed");
        }
        
        try {
          const resp = await window.solflare.connect();
          walletPublicKey = resp.publicKey.toString();
        } catch (error) {
          console.error("User rejected the connection request", error);
          throw new Error("Connection rejected");
        }
      }
      else {
        // For Backpack, Glow, and other wallets - in a real app, 
        // you'd implement proper connection logic for each
        const openLinks: Record<string, string> = {
          "Backpack": "https://backpack.app/",
          "Glow": "https://glow.app/"
        };
        
        if (openLinks[walletName]) {
          window.open(openLinks[walletName], "_blank");
          throw new Error(`${walletName} wallet is not installed or not supported yet`);
        }
        
        // Mock connection for development
        walletPublicKey = "5pV7aBJyZcEXPGGENNWzANkdShxf8RQEKfRHMQB8Lc9x";
      }
      
      if (walletPublicKey) {
        localStorage.setItem("walletPubkey", walletPublicKey);
        localStorage.setItem("walletName", walletName);
        setPublicKey(walletPublicKey);
        setIsConnected(true);
        toast.success(`${walletName} wallet connected successfully`);
        return true;
      } else {
        throw new Error("Failed to get wallet public key");
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(error.message || `Failed to connect ${walletName}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // In a real implementation, you would also disconnect from the actual wallet
    if (window.solana && selectedWallet === "Phantom") {
      try {
        window.solana.disconnect();
      } catch (error) {
        console.error("Error disconnecting from Phantom:", error);
      }
    }
    
    localStorage.removeItem("walletPubkey");
    localStorage.removeItem("walletName");
    setIsConnected(false);
    setSelectedWallet(null);
    setPublicKey(null);
    toast.success("Wallet disconnected");
  };

  return {
    isConnecting,
    isConnected,
    selectedWallet,
    publicKey,
    connectWallet,
    disconnectWallet
  };
}
