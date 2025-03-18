
// RPC and Validator Constants
export const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
export const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";

// Helius paid RPC endpoint (primary)
export const HELIUS_RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";
export const HELIUS_WEBSOCKET_URL = "wss://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";
export const HELIUS_PARSE_API = "https://api.helius.xyz/v0/addresses/{address}/transactions/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";

// Primary RPC endpoint (now Helius)
export const RPC_ENDPOINT = HELIUS_RPC_ENDPOINT;

// Reliable community endpoints for epoch info
export const SOLANABEACH_API = "https://api.solanabeach.io/v1";
export const SOLSCAN_API = "https://api.solscan.io";
export const EXPLORER_API = "https://explorer-api.solana.com";

// Fallback RPC endpoints with higher reliability
export const FALLBACK_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.g.alchemy.com/v2/demo",
  "https://api.devnet.solana.com", 
  "https://solana-api.projectserum.com"
];

// Array of all available endpoints for retry logic
export const ALL_RPC_ENDPOINTS = [RPC_ENDPOINT, ...FALLBACK_RPC_ENDPOINTS];

// Additional public endpoints if needed for future use
export const ADDITIONAL_RPC_ENDPOINTS = [
  "https://rpc.ankr.com/solana",
  "https://solana.public-rpc.com"
];
