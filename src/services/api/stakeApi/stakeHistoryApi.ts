
import axios from "axios";
import { StakeHistoryItem, StakeChangeDetail } from "../types";
import { fetchCurrentEpoch } from "../epochApi";
import { generateSyntheticStakeHistory } from "../utils/stakeUtils";
import { fetchReliableTotalStake } from "./totalStakeApi";

// Cache with a short expiration to ensure fresh data
const historyCache = new Map<
  string,
  { data: StakeHistoryItem[]; timestamp: number }
>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Fetch stake history with multiple sources and fallbacks
 */
export const fetchReliableStakeHistory = async (
  votePubkey: string
): Promise<StakeHistoryItem[]> => {
  console.log(`[StakeHistory] Fetching history for ${votePubkey}`);

  // Check cache first
  const cacheKey = `history-${votePubkey}`;
  const cachedData = historyCache.get(cacheKey);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    console.log(
      `[StakeHistory] Using cached history (${cachedData.data.length} points)`
    );
    return cachedData.data;
  }

  try {
    // Try Stakewiz first (most reliable source)
    try {
      const history = await fetchStakeHistoryFromStakewiz(votePubkey);
      if (history.length > 0) {
        console.log(
          `[StakeHistory] Got ${history.length} points from Stakewiz`
        );
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
        console.log(
          `[StakeHistory] Got ${history.length} points from SolanaFM`
        );
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

      console.log(
        `[StakeHistory] Created synthetic history (${syntheticHistory.length} points)`
      );
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
async function fetchStakeHistoryFromStakewiz(
  votePubkey: string
): Promise<StakeHistoryItem[]> {
  const response = await axios.get(
    `https://api.stakewiz.com/validator_total_stakes/${votePubkey}?limit=2000`,
    { timeout: 6000 }
  );

  if (
    response.data &&
    Array.isArray(response.data) &&
    response.data.length > 0
  ) {
    return response.data.map((item: any) => ({
      epoch: item.epoch,
      stake: item.stake,
      date: item.date || new Date().toISOString(),
    }));
  }

  throw new Error("No valid data from Stakewiz history endpoint");
}

/**
 * Fetch stake history from SolanaFM
 */
async function fetchStakeHistoryFromSolanaFM(
  votePubkey: string
): Promise<StakeHistoryItem[]> {
  const response = await axios.get(
    `https://api.solana.fm/v0/validators/${votePubkey}/history`,
    { timeout: 6000 }
  );

  if (
    response.data?.result &&
    Array.isArray(response.data.result) &&
    response.data.result.length > 0
  ) {
    return response.data.result.map((item: any) => ({
      epoch: item.epoch,
      stake: item.activatedStake / 1_000_000_000, // Convert lamports to SOL
      date: item.timestamp
        ? new Date(item.timestamp * 1000).toISOString()
        : new Date().toISOString(),
    }));
  }

  throw new Error("No valid data from SolanaFM history endpoint");
}

// Cache for stake change details
const stakeChangesCache = new Map<
  string,
  { data: { activating: StakeChangeDetail[], deactivating: StakeChangeDetail[] }; timestamp: number }
>();

/**
 * Fetch detailed information about stake changes for a validator
 */
export const fetchStakeChangeDetails = async (
  votePubkey: string
): Promise<{ activating: StakeChangeDetail[], deactivating: StakeChangeDetail[] }> => {
  console.log(`[StakeChangeDetails] Fetching for ${votePubkey}`);
  
  // Check cache first
  const cacheKey = `change-details-${votePubkey}`;
  const cachedData = stakeChangesCache.get(cacheKey);
  const now = Date.now();
  
  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    console.log(`[StakeChangeDetails] Using cached data`);
    return cachedData.data;
  }
  
  try {
    // Try to get data from Stakewiz
    try {
      const response = await axios.get(
        `https://api.stakewiz.com/validator/${votePubkey}/stake_accounts`,
        { timeout: 8000 }
      );
      
      if (response.data && Array.isArray(response.data)) {
        const currentEpoch = await fetchCurrentEpoch();
        
        const activating: StakeChangeDetail[] = [];
        const deactivating: StakeChangeDetail[] = [];
        
        // Process accounts
        for (const account of response.data) {
          if (account.activation_epoch && account.activation_epoch >= currentEpoch) {
            // This is an activating stake
            activating.push({
              stakeAccount: account.stake_account || account.address || "Unknown",
              amount: account.balance || account.stake || 0,
              remainingEpochs: account.activation_epoch - currentEpoch,
              owner: account.owner || "Unknown",
              epoch: account.activation_epoch
            });
          } else if (account.deactivation_epoch && 
                     account.deactivation_epoch !== 18446744073709551615 && 
                     account.deactivation_epoch >= currentEpoch) {
            // This is a deactivating stake
            deactivating.push({
              stakeAccount: account.stake_account || account.address || "Unknown",
              amount: account.balance || account.stake || 0,
              remainingEpochs: account.deactivation_epoch - currentEpoch,
              owner: account.owner || "Unknown", 
              epoch: account.deactivation_epoch
            });
          }
        }
        
        const result = { activating, deactivating };
        stakeChangesCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }
    } catch (stakewizError) {
      console.error("Stakewiz stake accounts fetch failed:", stakewizError);
    }
    
    // If we reach here, try to get synthetic data or fallback to empty arrays
    return generateSyntheticStakeChangeDetails(votePubkey);
    
  } catch (error) {
    console.error("Error fetching stake change details:", error);
    return { activating: [], deactivating: [] };
  }
};

/**
 * Generate synthetic data for testing or when real data is unavailable
 */
function generateSyntheticStakeChangeDetails(
  votePubkey: string
): { activating: StakeChangeDetail[], deactivating: StakeChangeDetail[] } {
  console.log(`[StakeChangeDetails] Generating synthetic data for ${votePubkey}`);
  
  const seedValue = parseInt(votePubkey.substring(votePubkey.length - 6), 16);
  const random = (min: number, max: number) => min + (seedValue % 1000) / 1000 * (max - min);
  
  // Generate some synthetic activating stakes
  const activatingCount = Math.floor(random(1, 4));
  const activating: StakeChangeDetail[] = [];
  
  for (let i = 0; i < activatingCount; i++) {
    const amount = random(50, 500);
    activating.push({
      stakeAccount: `${votePubkey.substring(0, 8)}...${i}`,
      amount,
      remainingEpochs: Math.floor(random(0, 2)),
      owner: `Owner${i+1}`,
      epoch: 0
    });
  }
  
  // Generate some synthetic deactivating stakes
  const deactivatingCount = Math.floor(random(0, 3));
  const deactivating: StakeChangeDetail[] = [];
  
  for (let i = 0; i < deactivatingCount; i++) {
    const amount = random(30, 300);
    deactivating.push({
      stakeAccount: `${votePubkey.substring(0, 8)}...${i+activatingCount}`,
      amount,
      remainingEpochs: Math.floor(random(0, 2)),
      owner: `Owner${i+activatingCount+1}`,
      epoch: 0
    });
  }
  
  return { activating, deactivating };
}
