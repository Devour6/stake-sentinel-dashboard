
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WalletType = {
  name: string;
  icon: string;
  installUrl?: string;
};

const WALLETS: WalletType[] = [
  { name: "Phantom", icon: "https://phantom.app/favicon.ico", installUrl: "https://phantom.app/" },
  { name: "Solflare", icon: "https://solflare.com/favicon.ico", installUrl: "https://solflare.com/" },
  { name: "Backpack", icon: "https://backpack.app/favicon.ico", installUrl: "https://backpack.app/" },
  { name: "Glow", icon: "https://glow.app/favicon.ico", installUrl: "https://glow.app/" },
];

interface WalletSelectorProps {
  onWalletSelect: (walletName: string) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

const WalletSelector = ({ onWalletSelect, isConnecting, selectedWallet }: WalletSelectorProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);

  const checkWalletInstalled = (name: string): boolean => {
    if (name === "Phantom") return !!window.solana?.isPhantom;
    if (name === "Solflare") return !!window.solflare;
    // For other wallets, we would need to implement specific detection logic
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

  return (
    <div className="py-4 space-y-4">
      <h3 className="text-sm font-medium text-white">Select a wallet</h3>
      <div className="grid grid-cols-2 gap-3">
        {WALLETS.map((wallet) => (
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
              <img src={wallet.icon} alt={wallet.name} className="h-5 w-5" />
            )}
            <span>{wallet.name}</span>
            
            {hoveredWallet === wallet.name && !checkWalletInstalled(wallet.name) && (
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
