
// RPC and Validator Constants
export const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";
export const VALIDATOR_IDENTITY = "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw";

// Primary RPC endpoint
export const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";

// Fallback RPC endpoints
export const FALLBACK_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com", 
  "https://solana-api.projectserum.com"
];

// Array of all available endpoints for retry logic
export const ALL_RPC_ENDPOINTS = [RPC_ENDPOINT, ...FALLBACK_RPC_ENDPOINTS];
