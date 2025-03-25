
import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import WalletButton from "./WalletButton";
import { useWalletDetection } from "./useWalletDetection";
import { WalletType } from "./walletUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WalletSelectorProps {
  onWalletSelect: (walletName: string) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

const WalletSelector = ({ onWalletSelect, isConnecting, selectedWallet }: WalletSelectorProps) => {
  const { wallets } = useWalletDetection();
  
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

  const detectedWallets = wallets.filter(w => w.isDetected);
  const availableWallets = wallets.filter(w => !w.isDetected);

  return (
    <div className="py-4 space-y-4">
      {detectedWallets.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-white">Detected wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {detectedWallets.map((wallet) => (
              <WalletButton
                key={wallet.name}
                wallet={wallet}
                isConnecting={isConnecting}
                selectedWallet={selectedWallet}
                onWalletClick={handleWalletClick}
              />
            ))}
          </div>
        </>
      )}

      {availableWallets.length > 0 && (
        <>
          <div className="mt-6">
            <Accordion type="single" collapsible className="border-aero-gray-light rounded-md">
              <AccordionItem value="available-wallets" className="border-aero-gray-light">
                <AccordionTrigger className="py-3 px-4 text-sm font-medium text-white hover:no-underline">
                  Available wallets ({availableWallets.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="grid grid-cols-2 gap-3 p-2">
                    {availableWallets.map((wallet) => (
                      <WalletButton
                        key={wallet.name}
                        wallet={wallet}
                        isConnecting={isConnecting}
                        selectedWallet={selectedWallet}
                        onWalletClick={handleWalletClick}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletSelector;
