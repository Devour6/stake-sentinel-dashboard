
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY, STAKEWIZ_API_URL } from "./constants";
import { ValidatorMetrics } from "./types";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Enhanced metrics fetching from Stakewiz with improved error handling
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
      console.error("Invalid response from Stakewiz API");
      return null;
    }
    
    const stakewizData = stakewizResponse.data;
    console.log("Stakewiz validator data:", stakewizData);
    
    // Get stake changes from Stakewiz - but don't fail the whole request if this fails
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
      // Continue without stake data rather than failing the whole request
    }
    
    // Estimated APY calculation - we'll calculate it ourselves since /network endpoint is failing
    let estimatedApy = null;
    
    try {
      // Use the data from the validator response instead of the /network endpoint
      if (stakewizData.total_apy) {
        estimatedApy = stakewizData.total_apy / 100; // Convert percentage to decimal
      } else if (stakewizData.apy_estimate) {
        estimatedApy = stakewizData.apy_estimate / 100;
      } else if (stakewizData.staking_apy) {
        // If we have staking_apy and jito_apy, combine them
        const stakingApy = stakewizData.staking_apy / 100;
        const jitoApy = (stakewizData.jito_apy || 0) / 100;
        estimatedApy = stakingApy + jitoApy;
      }
    } catch (apyError) {
      console.error("Error calculating APY:", apyError);
    }
    
    // If we still don't have APY, use a reasonable estimate based on typical Solana staking returns
    if (estimatedApy === null) {
      estimatedApy = 0.07; // ~7% as a fallback estimate
    }
    
    const metrics = {
      totalStake: stakewizData.activated_stake || 0,
      pendingStakeChange: Math.max(activatingStake, deactivatingStake),
      isDeactivating: deactivatingStake > activatingStake,
      commission: stakewizData.commission || 0,
      mevCommission: stakewizData.jito_commission_bps !== undefined ? 
                     stakewizData.jito_commission_bps / 100 : 
                     stakewizData.commission || 0,
      estimatedApy,
      activatingStake,
      deactivatingStake
    };
    
    console.log("Final validator metrics:", metrics);
    validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
    return metrics;
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics: " + (error instanceof Error ? error.message : "Unknown error"));
    return null;
  }
};
