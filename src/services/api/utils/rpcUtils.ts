
import { ALL_RPC_ENDPOINTS } from "../constants";

/**
 * Try multiple RPC endpoints in sequence until one works
 */
export async function tryMultipleRpcs<T>(
  requestFn: (rpcUrl: string) => Promise<T>,
  timeoutMs = 10000
): Promise<T> {
  // Try each RPC endpoint
  for (const rpcUrl of ALL_RPC_ENDPOINTS) {
    try {
      console.log(`Trying RPC endpoint: ${rpcUrl}`);
      return await Promise.race([
        requestFn(rpcUrl),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`RPC timeout: ${rpcUrl}`)), timeoutMs);
        })
      ]);
    } catch (error) {
      console.error(`RPC ${rpcUrl} failed:`, error);
      // Continue to next RPC
    }
  }
  
  throw new Error("All RPC endpoints failed");
}

/**
 * Create standard fetch options for RPC requests
 */
export function createRpcRequestOptions(
  method: string,
  params: any[] = [],
  id: string | number = 1
): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params
    })
  };
}

/**
 * Standard error handler for RPC requests
 */
export function handleRpcError(error: any, context: string): never {
  console.error(`RPC error (${context}):`, error);
  throw new Error(`Failed to ${context}: ${error.message || 'Unknown error'}`);
}
