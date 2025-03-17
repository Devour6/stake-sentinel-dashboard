
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
      let walletProvider: any = null;
      
      // First, try to find the wallet provider based on the wallet name
      walletProvider = findWalletProvider(walletName);
      
      if (!walletProvider) {
        // Check if we need to open an install page
        const installUrls: Record<string, string> = {
          "Phantom": "https://phantom.app/",
          "Solflare": "https://solflare.com/",
          "Backpack": "https://backpack.app/",
          "Magic Eden": "https://magiceden.io/wallet",
          "Coinbase": "https://www.coinbase.com/wallet",
          "Slope": "https://slope.finance/",
          "Brave Wallet": "https://brave.com/wallet/",
          "Exodus": "https://www.exodus.com/",
          "Glow": "https://glow.app/"
        };
        
        if (installUrls[walletName]) {
          window.open(installUrls[walletName], "_blank");
          throw new Error(`${walletName} wallet is not installed`);
        } else {
          throw new Error(`Could not find ${walletName} wallet provider`);
        }
      }
      
      // Attempt to connect using the provider
      try {
        console.log(`Connecting to ${walletName} using provider:`, walletProvider);
        const resp = await walletProvider.connect();
        walletPublicKey = resp.publicKey?.toString();
      } catch (error) {
        console.error(`User rejected the ${walletName} connection request`, error);
        throw new Error("Connection rejected");
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

  // Helper function to find the wallet provider based on wallet name
  const findWalletProvider = (walletName: string): any => {
    const nameLower = walletName.toLowerCase();
    
    // Direct matching for common wallets
    if (nameLower === "phantom" && window.solana?.isPhantom) {
      return window.solana;
    }
    
    if (nameLower === "solflare" && window.solflare) {
      return window.solflare;
    }
    
    if (nameLower === "backpack" && (window as any).backpack) {
      return (window as any).backpack;
    }
    
    if ((nameLower === "magic eden" || nameLower === "magiceden") && (window as any).magicEden) {
      return (window as any).magicEden;
    }
    
    if (nameLower === "coinbase" && ((window as any).coinbaseWallet || (window as any).coinbaseWalletSDK)) {
      return (window as any).coinbaseWallet || (window as any).coinbaseWalletSDK;
    }
    
    // Look for wallet provider in window object by common patterns
    const walletMappings: Record<string, string[]> = {
      "phantom": ["solana"],
      "solflare": ["solflare"],
      "backpack": ["backpack"],
      "magic eden": ["magicEden", "magiceden"],
      "coinbase": ["coinbaseWallet", "coinbaseWalletSDK"],
      "slope": ["slope", "slopeWallet"],
      "brave": ["braveSolWallet"],
      "exodus": ["exodus", "exodusWallet"],
      "glow": ["glow", "glowWallet"]
    };
    
    // Check our mappings
    for (const [wallet, keys] of Object.entries(walletMappings)) {
      if (nameLower === wallet || nameLower.includes(wallet) || wallet.includes(nameLower)) {
        for (const key of keys) {
          if ((window as any)[key] && 
             ((window as any)[key].connect || (window as any)[key].signTransaction)) {
            return (window as any)[key];
          }
        }
      }
    }
    
    // More aggressive search for any wallet-like provider
    for (const key of Object.keys(window)) {
      const lowerKey = key.toLowerCase();
      
      // Check if the key resembles the wallet name
      if (lowerKey.includes(nameLower) || nameLower.includes(lowerKey)) {
        const provider = (window as any)[key];
        if (provider && (provider.connect || provider.signTransaction)) {
          return provider;
        }
      }
      
      // Check for wallet-like patterns
      if ((lowerKey.includes('wallet') || lowerKey.includes('solana') || lowerKey.includes('sol')) &&
          nameLower.includes(lowerKey.replace(/(wallet|solana|sol|sdk|provider)/gi, ''))) {
        const provider = (window as any)[key];
        if (provider && (provider.connect || provider.signTransaction)) {
          return provider;
        }
      }
    }
    
    console.warn(`Could not find provider for wallet: ${walletName}`);
    return null;
  };

  const disconnectWallet = () => {
    // Attempt to disconnect from the connected wallet provider
    const walletProvider = findWalletProvider(selectedWallet || "");
    
    if (walletProvider && walletProvider.disconnect) {
      try {
        walletProvider.disconnect();
      } catch (error) {
        console.error(`Error disconnecting from ${selectedWallet}:`, error);
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
