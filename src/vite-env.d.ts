
/// <reference types="vite/client" />

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect?: () => Promise<{ publicKey: string }>;
  };
  solflare?: {
    connect?: () => Promise<{ publicKey: string }>;
  };
}
