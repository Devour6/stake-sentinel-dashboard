
import { useState, useEffect } from "react";
import { 
  WalletType, 
  getDisplayNameForProvider, 
  getInstallUrlForWallet, 
  isSolanaWallet,
  SOLANA_WALLETS
} from "./walletUtils";

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
    
    // 2. General scan for wallet providers that look like Solana wallets
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
          
        // Try to identify if it's a Solana wallet
        const keyLower = key.toLowerCase();
        
        // Only add if it seems like a Solana wallet
        if (keyLower.includes('solana') || 
            keyLower.includes('sol') || 
            Object.keys(getDisplayNameForProvider).some(id => keyLower.includes(id.toLowerCase()))) {
          
          // Find a name for this wallet
          let walletId = '';
          for (const [id] of Object.entries(getDisplayNameForProvider)) {
            if (keyLower.includes(id.toLowerCase())) {
              walletId = id.toLowerCase();
              detectedProviders[walletId] = provider;
              break;
            }
          }
          
          // If identified as a likely Solana wallet but not mapped, add with generic name
          if (!walletId && (keyLower.includes('sol') || keyLower.includes('solana'))) {
            detectedProviders[keyLower] = provider;
          }
        }
      }
    });
    
    console.log("Detected potential Solana wallet providers:", detectedProviders);
    
    // Create the final wallet list
    const walletList: WalletType[] = [];
    
    // First add detected wallets that are confirmed Solana wallets
    for (const [id, provider] of Object.entries(detectedProviders)) {
      const displayName = getDisplayNameForProvider(id);
      
      // Only add if it's likely a Solana wallet
      if (isSolanaWallet(displayName)) {
        walletList.push({
          name: displayName,
          providerName: id,
          isDetected: true
        });
      }
    }
    
    // Add standard non-detected Solana wallets
    SOLANA_WALLETS.forEach(name => {
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
    
    console.log("Processed Solana wallets:", walletList);
    setWallets(walletList);
  };

  return { wallets };
};
