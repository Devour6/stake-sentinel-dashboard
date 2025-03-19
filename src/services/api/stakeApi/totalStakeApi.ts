
import axios from "axios";
import { lamportsToSol } from "../utils";
import { tryMultipleRpcs, createRpcRequestOptions } from "../utils/rpcUtils";

// Cache with a short expiration to ensure fresh data
const stakeCache = new Map<string, { data: number, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Fetch validator's total stake from multiple sources with failover
 */
export const fetchReliableTotalStake = async (votePubkey: string): Promise<number> => {
  console.log(`[TotalStake] Fetching for ${votePubkey}`);
  
  // Check cache first
  const cacheKey = `total-${votePubkey}`;
  const cachedData = stakeCache.get(cacheKey);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`[TotalStake] Using cached value: ${cachedData.data} SOL`);
    return cachedData.data;
  }
  
  try {
    // Try RPC vote accounts method first (most reliable)
    try {
      const stake = await fetchTotalStakeFromVoteAccounts(votePubkey);
      if (stake > 0) {
        console.log(`[TotalStake] Got ${stake} SOL from RPC vote accounts`);
        stakeCache.set(cacheKey, { data: stake, timestamp: now });
        return stake;
      }
    } catch (rpcError) {
      console.error("RPC vote accounts failed:", rpcError);
    }
    
    // Try Stakewiz API
    try {
      const stake = await fetchTotalStakeFromStakewiz(votePubkey);
      if (stake > 0) {
        console.log(`[TotalStake] Got ${stake} SOL from Stakewiz`);
        stakeCache.set(cacheKey, { data: stake, timestamp: now });
        return stake;
      }
    } catch (stakewizError) {
      console.error("Stakewiz API failed:", stakewizError);
    }
    
    // Try Solscan API
    try {
      const stake = await fetchTotalStakeFromSolscan(votePubkey);
      if (stake > 0) {
        console.log(`[TotalStake] Got ${stake} SOL from Solscan`);
        stakeCache.set(cacheKey, { data: stake, timestamp: now });
        return stake;
      }
    } catch (solscanError) {
      console.error("Solscan API failed:", solscanError);
    }
    
    console.warn("[TotalStake] All sources failed, returning 0");
    return 0;
  } catch (error) {
    console.error("Total stake fetch failed:", error);
    return 0;
  }
};

/**
 * Fetch stake from Solana RPC vote accounts
 */
async function fetchTotalStakeFromVoteAccounts(votePubkey: string): Promise<number> {
  const fetchVoteAccounts = async (rpcUrl: string) => {
    const response = await fetch(rpcUrl, 
      createRpcRequestOptions('getVoteAccounts')
    );
    
    if (!response.ok) {
      throw new Error(`RPC response not OK: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result) {
      const { current, delinquent } = data.result;
      const allAccounts = [...current, ...delinquent];
      const validatorAccount = allAccounts.find(acc => acc.votePubkey === votePubkey);
      
      if (validatorAccount && validatorAccount.activatedStake) {
        return lamportsToSol(validatorAccount.activatedStake);
      }
    }
    
    throw new Error("Validator not found in vote accounts");
  };
  
  return await tryMultipleRpcs(fetchVoteAccounts);
}

/**
 * Fetch stake from Stakewiz API
 */
async function fetchTotalStakeFromStakewiz(votePubkey: string): Promise<number> {
  const response = await axios.get(
    `https://api.stakewiz.com/validator/${votePubkey}`,
    { timeout: 6000 }
  );
  
  if (response.data && response.data.activated_stake) {
    return response.data.activated_stake;
  }
  
  throw new Error("No stake data from Stakewiz");
}

/**
 * Fetch stake from Solscan API
 */
async function fetchTotalStakeFromSolscan(votePubkey: string): Promise<number> {
  const response = await axios.get(
    `https://api.solscan.io/validator/stake?account=${votePubkey}`,
    { timeout: 6000 }
  );
  
  if (response.data?.data?.total) {
    return response.data.data.total;
  }
  
  throw new Error("No stake data from Solscan");
}
