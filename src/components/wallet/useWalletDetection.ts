
import { useState, useEffect } from "react";
import { WalletType, getDisplayNameForProvider, getInstallUrlForWallet } from "./walletUtils";

export const useWalletDetection = () => {
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
        for (const [id] of Object.entries(getDisplayNameForProvider)) {
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

  return { wallets };
};
