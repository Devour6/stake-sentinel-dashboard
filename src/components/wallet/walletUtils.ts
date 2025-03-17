
// Wallet display names mappings
export const WALLET_NAME_MAPPING: Record<string, string> = {
  "solana": "Phantom",
  "solflare": "Solflare",
  "backpack": "Backpack",
  "xnft": "Backpack",
  "magiceden": "Magic Eden",
  "magicEden": "Magic Eden",
  "coinbasewallet": "Coinbase",
  "coinbasewalletextension": "Coinbase",
  "coinbasewalletsdk": "Coinbase",
  "bravesolunadapter": "Brave Wallet",
  "bravesolwallet": "Brave Wallet",
  "bravewallet": "Brave Wallet",
  "exodus": "Exodus",
  "exoduswallet": "Exodus",
  "glowwallet": "Glow",
  "slopewallet": "Slope",
  "slope": "Slope",
  "mathwallet": "Math Wallet",
  "coin98wallet": "Coin98",
  "clover": "Clover",
  "bitkeep": "BitKeep",
  "sollet": "Sollet",
  "torus": "Torus Wallet",
  "nightly": "Nightly Connect",
  "defiwallet": "DeFi Wallet",
  "strike": "Strike Wallet",
};

export interface WalletType {
  name: string;
  providerName?: string;
  isDetected: boolean;
  installUrl?: string;
}

export const getInstallUrlForWallet = (walletName: string): string => {
  const installUrls: Record<string, string> = {
    "Phantom": "https://phantom.app/",
    "Solflare": "https://solflare.com/",
    "Backpack": "https://backpack.app/",
    "Magic Eden": "https://magiceden.io/wallet",
    "Coinbase": "https://www.coinbase.com/wallet",
    "Slope": "https://slope.finance/",
    "Brave Wallet": "https://brave.com/wallet/",
    "Exodus": "https://www.exodus.com/",
    "Glow": "https://glow.app/"
  };
  
  return installUrls[walletName] || "https://solana.com/ecosystem/wallets";
};

export const getDisplayNameForProvider = (providerKey: string): string => {
  // Check our mapping first
  for (const [key, displayName] of Object.entries(WALLET_NAME_MAPPING)) {
    if (providerKey.toLowerCase().includes(key.toLowerCase())) {
      return displayName;
    }
  }
  
  // If not in mapping, format the provider key
  return formatWalletName(providerKey);
};

export const formatWalletName = (key: string): string => {
  // Remove common wallet-related terms
  let name = key.replace(/(wallet|sdk|provider|adapter|extension|request|solana)/gi, " ");
  
  // Remove non-alphanumeric characters except spaces
  name = name.replace(/[^a-zA-Z0-9\s]/g, " ");
  
  // Split camelCase
  name = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  
  // Trim and clean up multiple spaces
  name = name.replace(/\s+/g, " ").trim();
  
  // Capitalize each word
  name = name.split(" ")
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  // If empty after all processing, use generic name
  if (!name) name = "Solana Wallet";
  
  return name;
};
