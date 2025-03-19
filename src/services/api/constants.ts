
// Constants used throughout the Solana API

// Default validator public key and identity
export const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
export const VALIDATOR_IDENTITY = "59LQ99x9ouCzkYPx5JTrKz3nDDLognzhWZV6J1zJ";

// Default RPC endpoint for Solana Mainnet Beta
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Define all RPC endpoints to try for redundancy and reliability
export const ALL_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://mainnet.helius-rpc.com/?api-key=dff978e2-fae5-4768-8ee2-8e01b2c7fe2f",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
  "https://mainnet.rpcpool.com"
];

// Additional RPC endpoints if primary ones fail
export const ADDITIONAL_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://api.testnet.solana.com",
  "https://api.devnet.solana.com"
];

// Helius RPC endpoint with API key
export const HELIUS_RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=dff978e2-fae5-4768-8ee2-8e01b2c7fe2f";

// Solana Explorer API
export const EXPLORER_API = "https://explorer-api.mainnet-beta.solana.com";

// Stakewiz API URL 
export const STAKEWIZ_API_URL = "https://api.stakewiz.com";
