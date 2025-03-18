
// API endpoints
export const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Default Helius RPC endpoint - with fallback
export const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";
export const FALLBACK_RPC_ENDPOINT = "https://nanete-kbmodz-fast-mainnet.helius-rpc.com";

// Additional RPC endpoints for redundancy
export const HELIUS_RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=389d22ab-25bb-4f64-a36f-96455b26ea2e";
export const ALL_RPC_ENDPOINTS = [RPC_ENDPOINT, FALLBACK_RPC_ENDPOINT];
export const ADDITIONAL_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com", 
  "https://solana-api.projectserum.com"
];

// Explorer API
export const SOLANA_EXPLORER_API = "https://explorer-api.solana.com";
export const EXPLORER_API = "https://explorer-api.solana.com";

// Default validator information
export const VALIDATOR_PUBKEY = "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF";
export const VALIDATOR_IDENTITY = "AKoVXpZmi8wSz3sGvCYEygbpdHvSRysWsh36b97iPvKh";
