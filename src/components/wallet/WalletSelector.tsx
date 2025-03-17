
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WalletType = {
  name: string;
  providerName?: string;
  isDetected: boolean;
  installUrl?: string;
};

// Wallet display names mappings
const WALLET_NAME_MAPPING: Record<string, string> = {
  "solana": "Phantom",
  "solflare": "Solflare",
  "backpack": "Backpack",
  "xnft": "Backpack",
  "magiceden": "Magic Eden",
  "magicEden": "Magic Eden",
  "coinbasewallet": "Coinbase",
  "coinbasewalletextension": "Coinbase",
  "coinbasewalletsdk": "Coinbase",
  "bravesolunadapter": "Brave Wallet",
  "bravesolwallet": "Brave Wallet",
  "bravewallet": "Brave Wallet",
  "exodus": "Exodus",
  "exoduswallet": "Exodus",
  "glowwallet": "Glow",
  "slopewallet": "Slope",
  "slope": "Slope",
  "mathwallet": "Math Wallet",
  "coin98wallet": "Coin98",
  "clover": "Clover",
  "bitkeep": "BitKeep",
  "sollet": "Sollet",
  "torus": "Torus Wallet",
  "nightly": "Nightly Connect",
  "defiwallet": "DeFi Wallet",
  "strike": "Strike Wallet",
};

interface WalletSelectorProps {
  onWalletSelect: (walletName: string) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

const WalletSelector = ({ onWalletSelect, isConnecting, selectedWallet }: WalletSelectorProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  
  useEffect(() => {
    detectWallets();
  }, []);

  const detectWallets = () => {
    // First, find all wallet providers in the window object
    const detectedProviders: Record<string, any> = {};
    
    // 1. Check for known wallet objects first
    if (window.solana?.isPhantom) {
      detectedProviders['phantom'] = window.solana;
    }
    
    if (window.solflare) {
      detectedProviders['solflare'] = window.solflare;
    }
    
    if ((window as any).backpack) {
      detectedProviders['backpack'] = (window as any).backpack;
    }
    
    if ((window as any).magicEden) {
      detectedProviders['magiceden'] = (window as any).magicEden;
    } else if ((window as any).magiceden) {
      detectedProviders['magiceden'] = (window as any).magiceden;
    }
    
    // 2. General scan for wallet providers
    Object.keys(window).forEach(key => {
      // Skip keys we've already identified
      if (Object.keys(detectedProviders).some(name => 
        key.toLowerCase().includes(name) || name.includes(key.toLowerCase()))) {
        return;
      }
      
      const provider = (window as any)[key];
      
      // Check if it looks like a wallet provider
      if (provider && typeof provider === 'object' && 
          (provider.connect || provider.signTransaction || 
           provider.signAllTransactions || provider.signMessage)) {
          
        // Try to identify the wallet type
        const keyLower = key.toLowerCase();
        
        // Find a name for this wallet
        let walletId = '';
        for (const [id, displayName] of Object.entries(WALLET_NAME_MAPPING)) {
          if (keyLower.includes(id.toLowerCase())) {
            walletId = id.toLowerCase();
            detectedProviders[walletId] = provider;
            break;
          }
        }
        
        // If not identified but has wallet-like properties, add with generic name
        if (!walletId) {
          detectedProviders[keyLower] = provider;
        }
      }
    });
    
    console.log("Detected wallet providers:", detectedProviders);
    
    // Create the final wallet list
    const walletList: WalletType[] = [];
    
    // First add detected wallets
    for (const [id, provider] of Object.entries(detectedProviders)) {
      const displayName = getDisplayNameForProvider(id);
      
      walletList.push({
        name: displayName,
        providerName: id,
        isDetected: true
      });
    }
    
    // Add standard non-detected wallets for common options
    const standardWallets = [
      "Phantom", "Solflare", "Backpack", "Magic Eden", "Coinbase", 
      "Brave Wallet", "Slope", "Exodus", "Glow"
    ];
    
    standardWallets.forEach(name => {
      // Skip if already in the list
      if (walletList.some(w => w.name.toLowerCase() === name.toLowerCase())) {
        return;
      }
      
      const installUrl = getInstallUrlForWallet(name);
      
      walletList.push({
        name,
        installUrl,
        isDetected: false
      });
    });
    
    // Sort wallets: detected first, then alphabetical
    walletList.sort((a, b) => {
      if (a.isDetected && !b.isDetected) return -1;
      if (!a.isDetected && b.isDetected) return 1;
      return a.name.localeCompare(b.name);
    });
    
    console.log("Processed wallets:", walletList);
    setWallets(walletList);
  };
  
  const getInstallUrlForWallet = (walletName: string): string => {
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
    
    return installUrls[walletName] || "https://solana.com/ecosystem/wallets";
  };

  const getDisplayNameForProvider = (providerKey: string): string => {
    // Check our mapping first
    for (const [key, displayName] of Object.entries(WALLET_NAME_MAPPING)) {
      if (providerKey.toLowerCase().includes(key.toLowerCase())) {
        return displayName;
      }
    }
    
    // If not in mapping, format the provider key
    return formatWalletName(providerKey);
  };

  const formatWalletName = (key: string): string => {
    // Remove common wallet-related terms
    let name = key.replace(/(wallet|sdk|provider|adapter|extension|request|solana)/gi, " ");
    
    // Remove non-alphanumeric characters except spaces
    name = name.replace(/[^a-zA-Z0-9\s]/g, " ");
    
    // Split camelCase
    name = name.replace(/([a-z])([A-Z])/g, "$1 $2");
    
    // Trim and clean up multiple spaces
    name = name.replace(/\s+/g, " ").trim();
    
    // Capitalize each word
    name = name.split(" ")
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    // If empty after all processing, use generic name
    if (!name) name = "Solana Wallet";
    
    return name;
  };

  const handleWalletClick = async (wallet: WalletType) => {
    // For detected wallets, try to connect directly
    if (wallet.isDetected) {
      await onWalletSelect(wallet.name);
      return;
    }
    
    // For non-detected wallets, redirect to install page
    if (wallet.installUrl) {
      toast.info(`${wallet.name} not detected. Opening install page...`);
      window.open(wallet.installUrl, "_blank");
      return;
    }
    
    // Fallback for any other case
    await onWalletSelect(wallet.name);
  };

  return (
    <div className="py-4 space-y-4">
      {wallets.filter(w => w.isDetected).length > 0 && (
        <>
          <h3 className="text-sm font-medium text-white">Detected wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {wallets.filter(w => w.isDetected).map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="flex items-center justify-center py-5 border-gojira-gray-light hover:bg-gojira-gray-light relative"
                disabled={isConnecting}
                onClick={() => handleWalletClick(wallet)}
                onMouseEnter={() => setHoveredWallet(wallet.name)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                {isConnecting && selectedWallet === wallet.name ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                <span>{wallet.name}</span>
              </Button>
            ))}
          </div>
        </>
      )}

      {wallets.filter(w => !w.isDetected).length > 0 && (
        <>
          <h3 className="text-sm font-medium text-white">Available wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {wallets.filter(w => !w.isDetected).map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="flex items-center justify-center py-5 border-gojira-gray-light hover:bg-gojira-gray-light relative"
                disabled={isConnecting}
                onClick={() => handleWalletClick(wallet)}
                onMouseEnter={() => setHoveredWallet(wallet.name)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                {isConnecting && selectedWallet === wallet.name ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                <span>{wallet.name}</span>
                
                {hoveredWallet === wallet.name && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-gojira-gray-dark text-xs rounded border border-gojira-gray-light whitespace-nowrap z-10">
                    Not installed. Click to install.
                  </div>
                )}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WalletSelector;
