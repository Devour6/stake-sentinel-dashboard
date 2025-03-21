import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to find wallet provider
export const findWalletProvider = (walletName: string): any => {
  // Standardized wallet names
  const nameLower = walletName.toLowerCase().trim();

  // Common wallet provider names
  const providerNames: Record<string, string[]> = {
    phantom: ["solana", "phantom"],
    solflare: ["solflare"],
    backpack: ["backpack", "xnft"],
    "magic eden": ["magicEden", "magiceden"],
    coinbase: ["coinbaseWallet", "coinbaseWalletExtension"],
    slope: ["slope", "slopeWallet"],
    brave: ["braveSolanaAdapter", "braveWallet"],
    exodus: ["exodus"],
    glow: ["glow"],
  };

  // Try to find provider based on wallet name
  for (const [key, names] of Object.entries(providerNames)) {
    if (
      nameLower === key ||
      nameLower.includes(key) ||
      key.includes(nameLower)
    ) {
      for (const name of names) {
        const provider = (window as any)[name];
        if (provider && typeof provider === "object") {
          return provider;
        }
      }
    }
  }

  // Fallback to using any available provider
  return (window as any).solana || (window as any).solflare;
};
