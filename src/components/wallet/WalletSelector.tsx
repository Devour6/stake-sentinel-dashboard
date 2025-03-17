
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WalletType = {
  name: string;
  icon: string;
  installUrl?: string;
};

const DEFAULT_WALLETS: WalletType[] = [
  { name: "Phantom", icon: "https://cdn.jsdelivr.net/gh/phantom-labs/website-assets@main/src/img/logo-dark.svg", installUrl: "https://phantom.app/" },
  { name: "Solflare", icon: "https://solflare.com/favicon.ico", installUrl: "https://solflare.com/" },
  { name: "Backpack", icon: "https://backpack.app/favicon.ico", installUrl: "https://backpack.app/" },
  { name: "MagicEden", icon: "https://magiceden.io/img/favicon.ico", installUrl: "https://magiceden.io/wallet" },
];

// Known wallets for icon mapping with reliable CDN URLs
const WALLET_ICONS: Record<string, string> = {
  "phantom": "https://cdn.jsdelivr.net/gh/phantom-labs/website-assets@main/src/img/logo-dark.svg",
  "solflare": "https://solflare.com/favicon.ico",
  "backpack": "https://backpack.app/favicon.ico",
  "magiceden": "https://magiceden.io/img/favicon.ico",
  "coinbase": "https://www.coinbase.com/img/favicon/favicon.ico",
  "slope": "https://slope.finance/favicon.ico",
  "brave": "https://brave.com/static-assets/images/brave-favicon.png",
  "exodus": "https://www.exodus.com/favicon.ico",
  "glow": "https://glow.app/favicon.ico",
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
    // Check for detected wallets and organize them
    const detected: WalletType[] = [];
    const remaining: WalletType[] = [];

    DEFAULT_WALLETS.forEach(wallet => {
      if (checkWalletInstalled(wallet.name)) {
        detected.push(wallet);
      } else {
        remaining.push(wallet);
      }
    });

    // Try to detect additional wallets
    detectAdditionalWallets(detected);

    setDetectedWallets(detected);
    setDefaultWallets(remaining);
  }, []);

  const detectAdditionalWallets = (detected: WalletType[]) => {
    // Check for standard Solana wallets first
    const standardWallets = [
      { key: "solana", name: "Phantom", condition: (w: any) => w.isPhantom },
      { key: "solflare", name: "Solflare", condition: (w: any) => true },
      { key: "backpack", name: "Backpack", condition: (w: any) => true },
      { key: "magicEden", name: "Magic Eden", condition: (w: any) => true },
    ];

    // Check standard wallet patterns
    standardWallets.forEach(({ key, name, condition }) => {
      const wallet = (window as any)[key];
      if (wallet && condition(wallet) && !detected.some(w => w.name.toLowerCase() === name.toLowerCase())) {
        detected.push({
          name,
          icon: WALLET_ICONS[name.toLowerCase()] || "/placeholder.svg",
          installUrl: undefined
        });
      }
    });

    // Check for other wallet patterns in window
    const walletPatterns = ["wallet", "sol", "solana", "adapter"];
    const existingNames = new Set(detected.map(w => w.name.toLowerCase()));
    
    // Find potential wallet keys in window object
    Object.keys(window).forEach(key => {
      const keyLower = key.toLowerCase();
      
      // Skip if we've already detected this wallet
      if ([...existingNames].some(name => keyLower.includes(name))) {
        return;
      }
      
      // Check if this key might be a wallet
      if (walletPatterns.some(pattern => keyLower.includes(pattern)) &&
          typeof (window as any)[key] === 'object') {
        
        // Format wallet name properly
        let walletName = formatWalletName(key);
        
        // Find appropriate icon
        let iconUrl = findWalletIcon(walletName);
        
        // Add to detected wallets if not already present
        if (!detected.some(w => w.name.toLowerCase() === walletName.toLowerCase())) {
          detected.push({
            name: walletName,
            icon: iconUrl,
            installUrl: undefined
          });
        }
      }
    });
  };

  const formatWalletName = (key: string): string => {
    // Remove common patterns
    let name = key;
    const patternsToRemove = [
      "wallet", "Wallet", "WALLET",
      "sdk", "SDK", "Sdk",
      "provider", "Provider", "PROVIDER",
      "adapter", "Adapter", "ADAPTER",
      "extension", "Extension", "EXTENSION",
      "request", "Request", "REQUEST"
    ];
    
    // Try to find known wallet names within the key
    for (const [knownWallet] of Object.entries(WALLET_ICONS)) {
      if (name.toLowerCase().includes(knownWallet.toLowerCase())) {
        // Extract just the wallet name part
        const matches = new RegExp(`(${knownWallet})`, 'i').exec(name);
        if (matches && matches[1]) {
          const walletPart = matches[1];
          // Capitalize properly
          return walletPart.charAt(0).toUpperCase() + walletPart.slice(1).toLowerCase();
        }
      }
    }
    
    // If no known wallet found, clean up the name
    patternsToRemove.forEach(pattern => {
      name = name.replace(new RegExp(pattern, 'gi'), '');
    });
    
    // Remove any remaining non-alphabetic characters
    name = name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    
    // Handle CamelCase
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Capitalize each word
    name = name.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // If name is empty after all processing, use a generic name
    if (!name) name = "Solana Wallet";
    
    return name;
  };

  const findWalletIcon = (walletName: string): string => {
    const walletLower = walletName.toLowerCase();
    
    // Check for exact matches first
    for (const [key, url] of Object.entries(WALLET_ICONS)) {
      if (walletLower === key || walletLower.includes(key)) {
        return url;
      }
    }
    
    // Check for partial matches
    for (const [key, url] of Object.entries(WALLET_ICONS)) {
      if (walletLower.includes(key) || key.includes(walletLower)) {
        return url;
      }
    }
    
    // Default fallback
    return "/placeholder.svg";
  };

  const checkWalletInstalled = (name: string): boolean => {
    if (name === "Phantom") return !!window.solana?.isPhantom;
    if (name === "Solflare") return !!window.solflare;
    if (name === "Backpack") return !!(window as any).backpack;
    if (name === "MagicEden") return !!(window as any).magicEden;
    return false;
  };

  const handleWalletClick = async (wallet: WalletType) => {
    const isInstalled = checkWalletInstalled(wallet.name);
    
    if (!isInstalled && wallet.installUrl) {
      toast.info(`${wallet.name} not detected. Opening install page...`);
      window.open(wallet.installUrl, "_blank");
      return;
    }
    
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
    </div>
  );
};

export default WalletSelector;
