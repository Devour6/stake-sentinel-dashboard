
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WalletType = {
  name: string;
  icon: string;
  installUrl?: string;
};

const DEFAULT_WALLETS: WalletType[] = [
  { name: "Phantom", icon: "https://phantom.app/img/logo.png", installUrl: "https://phantom.app/" },
  { name: "Solflare", icon: "https://solflare.com/favicon.ico", installUrl: "https://solflare.com/" },
  { name: "Backpack", icon: "https://backpack.app/favicon.ico", installUrl: "https://backpack.app/" },
  { name: "MagicEden", icon: "https://cdn.magiceden.io/renderer/images/logo/icon-light.png", installUrl: "https://magiceden.io/wallet" },
];

// Known wallets for icon mapping
const WALLET_ICONS: Record<string, string> = {
  "phantom": "https://phantom.app/img/logo.png",
  "solflare": "https://solflare.com/favicon.ico",
  "backpack": "https://backpack.app/favicon.ico",
  "magiceden": "https://cdn.magiceden.io/renderer/images/logo/icon-light.png",
  "coinbase": "https://www.coinbase.com/assets/favicon-c208bf2c08f08e2f28bb3b21550cedd2e0581be6e7d02dcfcf8bfa7580494256.ico",
  "slope": "https://slope.finance/favicons/favicon.ico",
  "brave": "https://brave.com/static-assets/images/brave-favicon.png",
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

    // Add other detected wallets that aren't in our default list
    if (window.solana && !detected.some(w => w.name === "Phantom")) {
      detected.push({
        name: "Phantom",
        icon: WALLET_ICONS["phantom"],
        installUrl: "https://phantom.app/"
      });
    }

    // Add any other wallets detected in the window object
    const walletKeywords = ["wallet", "solana", "sol"];
    
    // Filter window object for potential wallet providers
    const otherWalletKeys = Object.keys(window).filter(key => {
      const lowercaseKey = key.toLowerCase();
      // Check if it contains wallet keywords but is not already in detected wallets
      return (
        walletKeywords.some(keyword => lowercaseKey.includes(keyword)) && 
        !detected.some(w => w.name.toLowerCase() === lowercaseKey)
      );
    });

    // Process each found wallet key
    otherWalletKeys.forEach(key => {
      // Format the wallet name nicely
      let formattedName = key;
      
      // Remove common suffixes for cleaner display
      if (formattedName.toLowerCase().endsWith("wallet")) {
        formattedName = formattedName.slice(0, -6);
      }
      if (formattedName.toLowerCase().endsWith("walletsdk")) {
        formattedName = formattedName.slice(0, -9);
      }
      
      // Capitalize first letter
      formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
      
      // Find an appropriate icon
      let icon = "/placeholder.svg"; // Default fallback
      
      // Check if we have a known icon for this wallet
      const walletLower = formattedName.toLowerCase();
      for (const [knownWallet, iconUrl] of Object.entries(WALLET_ICONS)) {
        if (walletLower.includes(knownWallet)) {
          icon = iconUrl;
          break;
        }
      }
      
      detected.push({
        name: formattedName,
        icon: icon,
        installUrl: undefined
      });
    });

    setDetectedWallets(detected);
    setDefaultWallets(remaining);
  }, []);

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
