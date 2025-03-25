
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletType } from "./walletUtils";

interface WalletButtonProps {
  wallet: WalletType;
  isConnecting: boolean;
  selectedWallet: string | null;
  onWalletClick: (wallet: WalletType) => void;
}

const WalletButton = ({ 
  wallet, 
  isConnecting, 
  selectedWallet, 
  onWalletClick 
}: WalletButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Button
      variant="outline"
      className="flex items-center justify-center py-5 border-aero-gray-light hover:bg-aero-gray-light relative"
      disabled={isConnecting}
      onClick={() => onWalletClick(wallet)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isConnecting && selectedWallet === wallet.name ? (
        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      <span>{wallet.name}</span>
      
      {!wallet.isDetected && isHovered && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-aero-gray-dark text-xs rounded border border-aero-gray-light whitespace-nowrap z-10">
          Not installed. Click to install.
        </div>
      )}
    </Button>
  );
};

export default WalletButton;
