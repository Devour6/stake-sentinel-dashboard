
// RPC and Validator Constants
export const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
export const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";

// Primary RPC endpoint
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Fallback RPC endpoints with higher reliability
export const FALLBACK_RPC_ENDPOINTS = [
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
