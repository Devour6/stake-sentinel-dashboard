
import axios from "axios";
import { fetchCurrentEpoch } from "../epochApi";
import { parseStakeChanges } from "../utils/stakeUtils";
import { tryMultipleRpcs, createRpcRequestOptions } from "../utils/rpcUtils";

// Cache with a short expiration to ensure fresh data  
const changesCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Fetch stake changes (activating/deactivating) with multiple sources
 */
export const fetchReliableStakeChanges = async (votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> => {
  console.log(`[StakeChanges] Fetching for ${votePubkey}`);
  
  // Check cache first
  const cacheKey = `changes-${votePubkey}`;
  const cachedData = changesCache.get(cacheKey);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`[StakeChanges] Using cached data:`, cachedData.data);
    return cachedData.data;
  }
  
  try {
    // Try RPC method first
    try {
      const changes = await fetchStakeChangesFromRPC(votePubkey);
      console.log(`[StakeChanges] Got from RPC:`, changes);
      changesCache.set(cacheKey, { data: changes, timestamp: now });
      return changes;
    } catch (rpcError) {
      console.error("RPC stake changes failed:", rpcError);
    }
    
    // Try Stakewiz as fallback
    try {
      const changes = await fetchStakeChangesFromStakewiz(votePubkey);
      console.log(`[StakeChanges] Got from Stakewiz:`, changes);
      changesCache.set(cacheKey, { data: changes, timestamp: now });
      return changes;
    } catch (stakewizError) {
      console.error("Stakewiz stake changes failed:", stakewizError);
    }
    
    // Default response if all sources fail
    console.warn("[StakeChanges] All sources failed, returning zeros");
    return { activatingStake: 0, deactivatingStake: 0 };
  } catch (error) {
    console.error("Stake changes fetch failed:", error);
    return { activatingStake: 0, deactivatingStake: 0 };
  }
};

/**
 * Fetch stake changes directly from RPC
 */
async function fetchStakeChangesFromRPC(votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> {
  const fetchStakeAccounts = async (rpcUrl: string) => {
    const response = await fetch(rpcUrl, createRpcRequestOptions(
      'getProgramAccounts',
      [
        'Stake11111111111111111111111111111111111111',
        {
          encoding: 'jsonParsed',
          filters: [{ memcmp: { offset: 124, bytes: votePubkey } }]
        }
      ],
      'stake-changes'
    ));
    
    if (!response.ok) {
      throw new Error(`RPC response not OK: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.result || !Array.isArray(data.result)) {
      throw new Error("Invalid RPC response for stake accounts");
    }
    
    const currentEpoch = await fetchCurrentEpoch();
    return parseStakeChanges(data.result, currentEpoch);
  };
  
  return await tryMultipleRpcs(fetchStakeAccounts);
}

/**
 * Fetch stake changes from Stakewiz API
 */
async function fetchStakeChangesFromStakewiz(votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> {
  // Try direct stake endpoint first
  try {
    const response = await axios.get(
      `https://api.stakewiz.com/validator/${votePubkey}/stake`,
      { timeout: 6000 }
    );
    
    if (response.data) {
      return {
        activatingStake: response.data.activating || 0,
        deactivatingStake: response.data.deactivating || 0
      };
    }
  } catch (error) {
    console.error("Stakewiz stake endpoint failed:", error);
  }
  
  // Try main validator endpoint as fallback
  const response = await axios.get(
    `https://api.stakewiz.com/validator/${votePubkey}`,
    { timeout: 6000 }
  );
  
  if (response.data) {
    return {
      activatingStake: response.data.activating_stake || 0,
      deactivatingStake: response.data.deactivating_stake || 0
    };
  }
  
  throw new Error("No stake changes data from Stakewiz");
}
