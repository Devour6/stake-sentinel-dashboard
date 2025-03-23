
import React from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
import { useWallet } from "@/hooks/use-wallet";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
  const { isConnected, selectedWallet, connectWallet, disconnectWallet, isConnecting } = useWallet();
  
  const handleConnectWallet = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      // For now, just try to connect to the first detected wallet
      // This could be enhanced with a dropdown menu for wallet selection
      await connectWallet("Phantom");
    }
  };

  const handleStartValidator = () => {
    toast.info("Validator creation coming soon!");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-aero-dark bg-opacity-90 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" animate={true} />
            <ChevronDown className="text-white opacity-80" size={20} />
          </div>
          
          <div className="flex items-center justify-center">
            <div className="bg-aero-dark border border-aero-purple/30 text-white text-sm px-4 py-1 rounded-full">
              Coming Soon
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-aero-purple text-white hover:bg-aero-purple/80"
              onClick={handleStartValidator}
            >
              Start A Validator
            </Button>
            
            <Button
              variant="outline"
              className="border-aero-purple text-aero-purple hover:bg-aero-purple/10"
              onClick={handleConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : isConnected ? `${selectedWallet}` : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
