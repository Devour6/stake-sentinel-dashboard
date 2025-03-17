
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
      
      // Find the wallet provider based on the wallet name
      walletProvider = findWalletProvider(walletName);
      
      if (!walletProvider) {
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
        console.log("Connection response:", resp);
        
        if (resp && resp.publicKey) {
          walletPublicKey = resp.publicKey.toString();
        } else {
          console.error("No publicKey in response:", resp);
        }
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
    // Map of standardized wallet names to potential provider names in window
    const walletProviderMap: Record<string, string[]> = {
      "phantom": ["solana"],
      "solflare": ["solflare"],
      "backpack": ["backpack", "xnft"],
      "magic eden": ["magicEden", "magiceden"],
      "coinbase": ["coinbaseWallet", "coinbaseWalletExtension", "coinbaseWalletSDK"],
      "slope": ["slope", "slopeWallet"],
      "brave": ["braveSolanaAdapter", "braveSolWallet", "braveWallet"],
      "exodus": ["exodus", "exodusWallet"],
      "glow": ["glow", "glowWallet"],
      "math wallet": ["mathwallet", "mathWallet"],
      "clover": ["clover", "cloverWallet"],
      "coin98": ["coin98", "coin98Wallet"],
      "bitkeep": ["bitkeep", "bitKeep"],
      "sollet": ["sollet"],
      "torus": ["torus"],
      "nightly": ["nightly"],
      "defi wallet": ["defiWallet", "cryptoComWallet"],
      "strike": ["strike", "strikeWallet"]
    };

    const nameLower = walletName.toLowerCase().trim();
    
    // 1. Direct check for known wallet providers
    for (const [key, providerNames] of Object.entries(walletProviderMap)) {
      if (nameLower === key || nameLower.includes(key) || key.includes(nameLower)) {
        for (const providerName of providerNames) {
          const provider = (window as any)[providerName];
          if (provider && typeof provider === 'object' && 
              (provider.connect || provider.signTransaction)) {
            console.log(`Found provider ${providerName} for wallet ${walletName}`);
            return provider;
          }
        }
      }
    }
    
    // 2. General search for any wallet-like providers
    for (const key of Object.keys(window)) {
      const provider = (window as any)[key];
      
      // Skip non-objects and null
      if (!provider || typeof provider !== 'object') continue;
      
      // If a wallet-like functionality is detected
      if (provider.connect || provider.signTransaction || 
          provider.signAllTransactions || provider.signMessage) {
        
        // Check if this provider matches the requested wallet (by name)
        const keyLower = key.toLowerCase();
        if (keyLower.includes(nameLower) || nameLower.includes(keyLower) ||
            // Check for common variations and concatenations
            keyLower.replace(/[^a-z0-9]/g, '').includes(nameLower.replace(/[^a-z0-9]/g, '')) ||
            nameLower.replace(/[^a-z0-9]/g, '').includes(keyLower.replace(/[^a-z0-9]/g, ''))) {
          
          console.log(`Found provider ${key} for wallet ${walletName} via general search`);
          return provider;
        }
      }
    }
    
    // 3. Fallback - try to find any wallet provider
    if (nameLower === "any" || nameLower === "default") {
      // Try to use a common wallet if available (Phantom or Solflare)
      if (window.solana?.isPhantom) return window.solana;
      if (window.solflare) return window.solflare;
      
      // Or first wallet-like object found
      for (const key of Object.keys(window)) {
        const provider = (window as any)[key];
        if (provider && typeof provider === 'object' && 
            (provider.connect || provider.signTransaction)) {
          console.log(`Found default wallet provider: ${key}`);
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
