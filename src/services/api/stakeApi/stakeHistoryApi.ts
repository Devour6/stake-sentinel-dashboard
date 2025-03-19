
import axios from "axios";
import { StakeHistoryItem } from "../types";
import { fetchCurrentEpoch } from "../epochApi";
import { generateSyntheticStakeHistory } from "../utils/stakeUtils";
import { fetchReliableTotalStake } from "./totalStakeApi";

// Cache with a short expiration to ensure fresh data
const historyCache = new Map<string, { data: StakeHistoryItem[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Fetch stake history with multiple sources and fallbacks
 */
export const fetchReliableStakeHistory = async (votePubkey: string): Promise<StakeHistoryItem[]> => {
  console.log(`[StakeHistory] Fetching history for ${votePubkey}`);
  
  // Check cache first
  const cacheKey = `history-${votePubkey}`;
  const cachedData = historyCache.get(cacheKey);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`[StakeHistory] Using cached history (${cachedData.data.length} points)`);
    return cachedData.data;
  }
  
  try {
    // Try Stakewiz first (most reliable source)
    try {
      const history = await fetchStakeHistoryFromStakewiz(votePubkey);
      if (history.length > 0) {
        console.log(`[StakeHistory] Got ${history.length} points from Stakewiz`);
        historyCache.set(cacheKey, { data: history, timestamp: now });
        return history;
      }
    } catch (stakewizError) {
      console.error("Stakewiz history failed:", stakewizError);
    }
    
    // Try SolanaFM as backup
    try {
      const history = await fetchStakeHistoryFromSolanaFM(votePubkey);
      if (history.length > 0) {
        console.log(`[StakeHistory] Got ${history.length} points from SolanaFM`);
        historyCache.set(cacheKey, { data: history, timestamp: now });
        return history;
      }
    } catch (solanaFmError) {
      console.error("SolanaFM history failed:", solanaFmError);
    }
    
    // Create synthetic history as last resort
    const currentEpoch = await fetchCurrentEpoch();
    const currentStake = await fetchReliableTotalStake(votePubkey);
    
    if (currentStake > 0) {
      const syntheticHistory = generateSyntheticStakeHistory(
        votePubkey,
        currentStake,
        currentEpoch
      );
      
      console.log(`[StakeHistory] Created synthetic history (${syntheticHistory.length} points)`);
      historyCache.set(cacheKey, { data: syntheticHistory, timestamp: now });
      return syntheticHistory;
    }
    
    console.warn("[StakeHistory] Failed to get any stake history");
    return [];
  } catch (error) {
    console.error("Error fetching stake history:", error);
    return [];
  }
};

/**
 * Fetch stake history from Stakewiz
 */
async function fetchStakeHistoryFromStakewiz(votePubkey: string): Promise<StakeHistoryItem[]> {
  const response = await axios.get(
    `https://api.stakewiz.com/validator/${votePubkey}/stake_history`,
    { timeout: 6000 }
  );
  
  if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    return response.data.map((item: any) => ({
      epoch: item.epoch,
      stake: item.stake,
      date: item.date || new Date().toISOString()
    }));
  }
  
  throw new Error("No valid data from Stakewiz history endpoint");
}

/**
 * Fetch stake history from SolanaFM
 */
async function fetchStakeHistoryFromSolanaFM(votePubkey: string): Promise<StakeHistoryItem[]> {
  const response = await axios.get(
    `https://api.solana.fm/v0/validators/${votePubkey}/history`,
    { timeout: 6000 }
  );
  
  if (response.data?.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
    return response.data.result.map((item: any) => ({
      epoch: item.epoch,
      stake: item.activatedStake / 1_000_000_000, // Convert lamports to SOL
      date: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : new Date().toISOString()
    }));
  }
  
  throw new Error("No valid data from SolanaFM history endpoint");
}
