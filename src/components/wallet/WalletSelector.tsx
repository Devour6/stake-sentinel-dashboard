
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WalletType = {
  name: string;
  icon: string;
  installUrl?: string;
  providerName?: string; // Add property to store actual provider name
};

const DEFAULT_WALLETS: WalletType[] = [
  { name: "Phantom", icon: "https://phantom.app/img/logo.png", installUrl: "https://phantom.app/" },
  { name: "Solflare", icon: "https://solflare.com/assets/logo.svg", installUrl: "https://solflare.com/" },
  { name: "Backpack", icon: "https://backpack.app/assets/backpack-logo.svg", installUrl: "https://backpack.app/" },
  { name: "MagicEden", icon: "https://magiceden.io/img/logo.png", installUrl: "https://magiceden.io/wallet" },
];

// Known wallets for icon mapping with reliable URLs
const WALLET_ICONS: Record<string, string> = {
  "phantom": "https://phantom.app/img/logo.png",
  "solflare": "https://solflare.com/assets/logo.svg",
  "backpack": "https://backpack.app/assets/backpack-logo.svg",
  "magiceden": "https://magiceden.io/img/logo.png",
  "coinbase": "https://www.coinbase.com/assets/images/favicon/favicon.ico",
  "slope": "https://slope.finance/assets/images/logo.svg",
  "brave": "https://brave.com/static-assets/images/brave-logo.svg",
  "exodus": "https://www.exodus.com/images/logos/exodus-logo-white.svg",
  "glow": "https://glow.app/icons/logo.svg",
};

// Mapping of provider names to more user-friendly display names
const WALLET_NAME_MAPPING: Record<string, string> = {
  "solana": "Phantom",
  "solflare": "Solflare",
  "backpack": "Backpack",
  "magicEden": "Magic Eden",
  "coinbasewallet": "Coinbase",
  "coinbasewalletsdk": "Coinbase",
  "bravedsolwallet": "Brave Wallet",
  "exoduswallet": "Exodus",
  "glowwallet": "Glow",
  "slopewallet": "Slope",
};

interface WalletSelectorProps {
  onWalletSelect: (walletName: string) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

const WalletSelector = ({ onWalletSelect, isConnecting, selectedWallet }: WalletSelectorProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<WalletType[]>([]);
  const [defaultWallets, setDefaultWallets] = useState<WalletType[]>([]);

  useEffect(() => {
    // Detect all available Solana wallets
    detectWallets();
  }, []);

  const detectWallets = () => {
    // First find all potential wallet providers in the window object
    const detectedProviders: Record<string, any> = {};
    const potentialProviders: Record<string, string> = {};
    
    // Check window for known wallet objects and properties
    Object.keys(window).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if the key might be a Solana wallet provider
      if (
        (lowerKey.includes('wallet') || 
         lowerKey.includes('solana') || 
         lowerKey.includes('sol') ||
         lowerKey.includes('adapter')) && 
        typeof (window as any)[key] === 'object'
      ) {
        const provider = (window as any)[key];
        
        // Check if it has typical wallet methods
        if (provider && (provider.connect || provider.signTransaction || provider.signAllTransactions)) {
          potentialProviders[key] = key;
        }
      }
    });
    
    // Special case checks for known wallet patterns
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
    }
    
    // Process other potential providers
    for (const [key, provider] of Object.entries(potentialProviders)) {
      const lowerKey = key.toLowerCase();
      
      // Skip if already detected
      if (Object.keys(detectedProviders).some(providerName => 
        lowerKey.includes(providerName) || providerName.includes(lowerKey)
      )) {
        continue;
      }
      
      // Try to identify the wallet type
      let walletName = '';
      for (const [knownWallet, displayName] of Object.entries(WALLET_NAME_MAPPING)) {
        if (lowerKey.includes(knownWallet.toLowerCase())) {
          walletName = displayName;
          detectedProviders[knownWallet.toLowerCase()] = (window as any)[key];
          break;
        }
      }
      
      // If not identified but has wallet-like properties, add as generic wallet
      if (!walletName && ((window as any)[key].connect || (window as any)[key].signTransaction)) {
        let formattedName = formatWalletName(key);
        detectedProviders[formattedName.toLowerCase()] = (window as any)[key];
      }
    }
    
    console.log("Detected wallet providers:", detectedProviders);
    
    // Now create proper wallet objects from the detected providers
    const detected: WalletType[] = [];
    const remaining: WalletType[] = [];
    
    // Process default wallets first
    DEFAULT_WALLETS.forEach(wallet => {
      const walletLower = wallet.name.toLowerCase();
      if (detectedProviders[walletLower]) {
        detected.push({
          ...wallet,
          providerName: getProviderNameForWallet(wallet.name, detectedProviders)
        });
      } else {
        remaining.push(wallet);
      }
    });
    
    // Add any additional detected wallets not in DEFAULT_WALLETS
    for (const [providerKey, provider] of Object.entries(detectedProviders)) {
      // Skip if we already added this wallet
      if (detected.some(w => w.name.toLowerCase() === providerKey || 
                           (w.providerName && w.providerName.toLowerCase() === providerKey))) {
        continue;
      }
      
      // Get the display name for this provider
      let displayName = getDisplayNameForProvider(providerKey);
      let iconUrl = getIconForWallet(displayName);
      
      detected.push({
        name: displayName,
        icon: iconUrl,
        providerName: providerKey
      });
    }
    
    console.log("Processed wallets:", { detected, remaining });
    
    setDetectedWallets(detected);
    setDefaultWallets(remaining);
  };

  const getProviderNameForWallet = (walletName: string, providers: Record<string, any>): string => {
    const walletLower = walletName.toLowerCase();
    
    // Direct match
    if (providers[walletLower]) {
      return walletLower;
    }
    
    // Check for partial matches
    for (const providerKey of Object.keys(providers)) {
      if (providerKey.includes(walletLower) || walletLower.includes(providerKey)) {
        return providerKey;
      }
    }
    
    // Special case mappings
    if (walletLower === "phantom" && providers["solana"]) {
      return "solana";
    }
    
    return walletLower; // Fallback to the wallet name itself
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

  const getIconForWallet = (walletName: string): string => {
    const walletLower = walletName.toLowerCase();
    
    // Check for exact matches in our icon mapping
    for (const [key, url] of Object.entries(WALLET_ICONS)) {
      if (walletLower === key || walletLower.includes(key) || key.includes(walletLower)) {
        return url;
      }
    }
    
    // Try to find any partial matches
    for (const [key, url] of Object.entries(WALLET_ICONS)) {
      if (walletLower.includes(key) || key.includes(walletLower)) {
        return url;
      }
    }
    
    // Default fallback
    return "/placeholder.svg";
  };

  const handleWalletClick = async (wallet: WalletType) => {
    // For detected wallets, try to connect directly
    if (wallet.providerName) {
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

  // Helper function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, walletName: string) => {
    e.currentTarget.src = "/placeholder.svg";
    console.log(`Failed to load icon for ${walletName}, using placeholder`);
  };

  return (
    <div className="py-4 space-y-4">
      {detectedWallets.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-white">Detected wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {detectedWallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="flex items-center justify-start gap-2 py-5 border-gojira-gray-light hover:bg-gojira-gray-light relative"
                disabled={isConnecting}
                onClick={() => handleWalletClick(wallet)}
                onMouseEnter={() => setHoveredWallet(wallet.name)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                {isConnecting && selectedWallet === wallet.name ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <img 
                    src={wallet.icon} 
                    alt={wallet.name} 
                    className="h-5 w-5 object-contain" 
                    onError={(e) => handleImageError(e, wallet.name)}
                  />
                )}
                <span>{wallet.name}</span>
              </Button>
            ))}
          </div>
        </>
      )}

      {defaultWallets.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-white">Available wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {defaultWallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="flex items-center justify-start gap-2 py-5 border-gojira-gray-light hover:bg-gojira-gray-light relative"
                disabled={isConnecting}
                onClick={() => handleWalletClick(wallet)}
                onMouseEnter={() => setHoveredWallet(wallet.name)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                {isConnecting && selectedWallet === wallet.name ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <img 
                    src={wallet.icon} 
                    alt={wallet.name} 
                    className="h-5 w-5 object-contain" 
                    onError={(e) => handleImageError(e, wallet.name)}
                  />
                )}
                <span>{wallet.name}</span>
                
                {hoveredWallet === wallet.name && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-gojira-gray-dark text-xs rounded border border-gojira-gray-light whitespace-nowrap">
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
