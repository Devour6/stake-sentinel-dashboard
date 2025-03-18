
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY } from "./constants";
import { ValidatorMetrics } from "./types";
import { fetchValidatorInfo } from "./validatorInfoApi";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Improved metrics fetching - prioritizing Stakewiz
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
    
    // Try to get data from Stakewiz API directly
    try {
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 8000 }
      );
      
      if (stakewizResponse.data) {
        const stakewizData = stakewizResponse.data;
        console.log("Stakewiz metrics data:", stakewizData);
        
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
        }
        
        const metrics = {
          totalStake: stakewizData.activated_stake || 0,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          commission: stakewizData.commission || 0,
        };
        
        validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
        return metrics;
      }
    } catch (stakewizError) {
      console.error("Error fetching from Stakewiz metrics:", stakewizError);
    }
    
    // Fall back to validatorInfo if Stakewiz direct API fails
    const validatorInfo = await fetchValidatorInfo(votePubkey);
    
    if (!validatorInfo) {
      toast.error("Failed to fetch validator info");
      return null;
    }
    
    const metrics = {
      totalStake: validatorInfo.activatedStake,
      pendingStakeChange: validatorInfo.pendingStakeChange,
      isDeactivating: validatorInfo.isDeactivating,
      commission: validatorInfo.commission,
    };
    
    validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
    return metrics;
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics.");
    return null;
  }
};
