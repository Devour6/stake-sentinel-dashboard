
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

interface WalletSelectorProps {
  onWalletSelect: (walletName: string) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

const WalletSelector = ({ onWalletSelect, isConnecting, selectedWallet }: WalletSelectorProps) => {
  return (
    <div className="py-4 space-y-4">
      <h3 className="text-sm font-medium text-white">Select a wallet</h3>
      <div className="grid grid-cols-2 gap-3">
        {WALLETS.map((wallet) => (
          <Button
            key={wallet.name}
            variant="outline"
            className="flex items-center justify-start gap-2 py-5 border-gojira-gray-light hover:bg-gojira-gray-light"
            disabled={isConnecting}
            onClick={() => onWalletSelect(wallet.name)}
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
  );
};

export default WalletSelector;
