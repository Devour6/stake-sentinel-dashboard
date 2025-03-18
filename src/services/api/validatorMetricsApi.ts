
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY } from "./constants";
import { ValidatorMetrics } from "./types";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Enhanced metrics fetching from Stakewiz with additional data
export const fetchValidatorMetrics = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorMetrics | null> => {
  try {
    console.log(`Fetching validator metrics for ${votePubkey}...`);
    
    // Check cache first (with timeout)
    const now = Date.now();
    const cachedMetrics = validatorMetricsCache.get(votePubkey);
    if (cachedMetrics && (now - cachedMetrics.timestamp < CACHE_VALIDITY_MS)) {
      const { timestamp, ...metrics } = cachedMetrics;
      return metrics;
    }
    
    // Get data from Stakewiz API
    const stakewizResponse = await axios.get(
      `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
      { timeout: 10000 }
    );
    
    if (!stakewizResponse.data) {
      throw new Error("Invalid response from Stakewiz API");
    }
    
    const stakewizData = stakewizResponse.data;
    console.log("Stakewiz validator data:", stakewizData);
    
    // Get stake changes from Stakewiz
    let activatingStake = 0;
    let deactivatingStake = 0;
    
    try {
      const stakeResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake`, {
        timeout: 5000
      });
      
      if (stakeResponse.data) {
        console.log("Stakewiz stake data:", stakeResponse.data);
        activatingStake = stakeResponse.data.activating || 0;
        deactivatingStake = stakeResponse.data.deactivating || 0;
      }
    } catch (stakeError) {
      console.error("Error fetching stake data from Stakewiz:", stakeError);
      throw new Error("Failed to fetch stake change data");
    }
    
    // Get network data for APY calculation
    let estimatedApy = null;
    let networkInflation = 0.08; // Default inflation rate if we can't fetch it
    
    try {
      const networkResponse = await axios.get(`${STAKEWIZ_API_URL}/network`, {
        timeout: 5000
      });
      
      if (networkResponse.data && networkResponse.data.inflation) {
        console.log("Stakewiz network data:", networkResponse.data);
        networkInflation = networkResponse.data.inflation;
        
        // Calculate estimated APY based on network inflation and commission
        const commission = stakewizData.commission / 100 || 0;
        const mevCommission = stakewizData.mev_commission / 100 || commission; // Default to same as regular commission
        
        // Basic APY calculation formula (could be more sophisticated)
        estimatedApy = networkInflation * (1 - commission);
      }
    } catch (networkError) {
      console.error("Error fetching network data from Stakewiz:", networkError);
      // We'll continue with default values
    }
    
    const metrics = {
      totalStake: stakewizData.activated_stake || 0,
      pendingStakeChange: Math.max(activatingStake, deactivatingStake),
      isDeactivating: deactivatingStake > activatingStake,
      commission: stakewizData.commission || 0,
      mevCommission: stakewizData.mev_commission || stakewizData.commission || 0, // Fall back to regular commission
      estimatedApy: estimatedApy || networkInflation * 0.9, // Fallback calculation
      activatingStake: activatingStake,
      deactivatingStake: deactivatingStake
    };
    
    validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
    return metrics;
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics");
    return null;
  }
};
