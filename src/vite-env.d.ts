
/// <reference types="vite/client" />

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: () => Promise<any>;
    signAllTransactions?: () => Promise<any>;
    signMessage?: () => Promise<any>;
  };
  solflare?: {
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: () => Promise<any>;
    signAllTransactions?: () => Promise<any>;
    signMessage?: () => Promise<any>;
  };
  // Magic Eden wallet
  magicEden?: {
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: () => Promise<any>;
    signAllTransactions?: () => Promise<any>;
    signMessage?: () => Promise<any>;
  };
  // Alternative capitalization
  magiceden?: {
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: () => Promise<any>;
    signAllTransactions?: () => Promise<any>;
    signMessage?: () => Promise<any>;
  };
  // Backpack wallet
  backpack?: {
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: () => Promise<any>;
    signAllTransactions?: () => Promise<any>;
    signMessage?: () => Promise<any>;
  };
  // Common interface for other Solana wallets
  [key: string]: any;
}
