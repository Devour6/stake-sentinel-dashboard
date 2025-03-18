
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY, STAKEWIZ_API_URL } from "./constants";
import { ValidatorMetrics } from "./types";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// Enhanced metrics fetching from Stakewiz with improved error handling and multiple data sources
export const fetchValidatorMetrics = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorMetrics | null> => {
  try {
    console.log(`Fetching validator metrics for ${votePubkey}...`);
    
    // Check cache first (with timeout)
    const now = Date.now();
    const cachedMetrics = validatorMetricsCache.get(votePubkey);
    if (cachedMetrics && (now - cachedMetrics.timestamp < CACHE_VALIDITY_MS)) {
      console.log("Using cached validator metrics");
      const { timestamp, ...metrics } = cachedMetrics;
      return metrics;
    }
    
    // Primary source: Stakewiz validator endpoint
    try {
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 60000 } // Increased timeout for slower connections
      );
      
      if (stakewizResponse.data) {
        const stakewizData = stakewizResponse.data;
        console.log("Stakewiz validator data:", stakewizData);
        
        // Get stake changes from Stakewiz - but don't fail the whole request if this fails
        let activatingStake = 0;
        let deactivatingStake = 0;
        
        try {
          const stakeResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake`, {
            timeout: 30000
          });
          
          if (stakeResponse.data) {
            console.log("Stakewiz stake data:", stakeResponse.data);
            activatingStake = stakeResponse.data.activating || 0;
            deactivatingStake = stakeResponse.data.deactivating || 0;
          }
        } catch (stakeError) {
          console.error("Error fetching stake data from Stakewiz:", stakeError);
          // Try to extract stake changes directly from the main validator response
          if (stakewizData.activating_stake !== undefined) {
            activatingStake = stakewizData.activating_stake || 0;
            deactivatingStake = stakewizData.deactivating_stake || 0;
          }
        }
        
        // Calculate APY from multiple possible sources
        let estimatedApy = null;
        
        // First try network endpoint for overall network APY
        try {
          const networkResponse = await axios.get(`${STAKEWIZ_API_URL}/network`, {
            timeout: 10000
          });
          
          if (networkResponse.data && networkResponse.data.apy) {
            estimatedApy = networkResponse.data.apy / 100; // Convert percentage to decimal
            console.log("Network APY from Stakewiz:", estimatedApy);
          }
        } catch (networkError) {
          console.error("Error fetching network APY from Stakewiz:", networkError);
        }
        
        // If network APY fails, try using validator's APY data
        if (estimatedApy === null) {
          if (stakewizData.total_apy) {
            estimatedApy = stakewizData.total_apy / 100; // Convert percentage to decimal
            console.log("Using validator total APY:", estimatedApy);
          } else if (stakewizData.apy_estimate) {
            estimatedApy = stakewizData.apy_estimate / 100;
            console.log("Using validator APY estimate:", estimatedApy);
          } else if (stakewizData.staking_apy) {
            // If we have staking_apy and jito_apy, combine them
            const stakingApy = stakewizData.staking_apy / 100;
            const jitoApy = (stakewizData.jito_apy || 0) / 100;
            estimatedApy = stakingApy + jitoApy;
            console.log("Using combined staking + jito APY:", estimatedApy);
          }
        }
        
        // If we still don't have APY, try to get mev commission and estimate
        if (estimatedApy === null && stakewizData.commission) {
          // Rough APY estimate based on commission
          const baseApy = 0.075; // 7.5% base APY estimate
          const commissionDecimal = stakewizData.commission / 100;
          estimatedApy = baseApy * (1 - commissionDecimal);
          console.log("Estimated APY based on commission:", estimatedApy);
        }
        
        // Extract description and version from stakewizData if available
        const description = stakewizData.description || null;
        const version = stakewizData.version || null;
        
        // Extract uptime from stakewizData
        let uptime30d = null;
        if (stakewizData.uptime) {
          uptime30d = stakewizData.uptime;
        } else if (stakewizData.uptime_30d) {
          uptime30d = stakewizData.uptime_30d;
        }
        
        // Get the proper activated stake value, as Stakewiz may format it in different ways
        // Sometimes it's "activated_stake", sometimes it's "stake", sometimes it's a different format
        let totalStake = 0;
        if (stakewizData.activated_stake !== undefined) {
          totalStake = stakewizData.activated_stake;
        } else if (stakewizData.stake !== undefined) {
          totalStake = stakewizData.stake;
        } else if (stakewizData.total_stake !== undefined) {
          totalStake = stakewizData.total_stake;
        } else if (stakewizData.active_stake !== undefined) {
          totalStake = stakewizData.active_stake;
        }
        
        console.log("Activated stake value:", totalStake);
        
        const metrics = {
          totalStake: totalStake,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          commission: stakewizData.commission || 0,
          mevCommission: stakewizData.jito_commission_bps !== undefined ? 
                        stakewizData.jito_commission_bps / 100 : 
                        stakewizData.commission || 0,
          estimatedApy,
          activatingStake,
          deactivatingStake,
          description,
          version,
          uptime30d
        };
        
        console.log("Final validator metrics:", metrics);
        validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
        return metrics;
      }
    } catch (error) {
      console.error("Primary Stakewiz endpoint failed:", error);
      toast.error("Primary data source unavailable, trying alternatives...", {
        duration: 3000,
        id: "stakewiz-primary-error"
      });
    }
    
    // If primary source fails, try alternate Stakewiz validators endpoint
    try {
      console.log("Trying alternate validators list endpoint...");
      const validatorsResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validators`,
        { timeout: 20000 }
      );
      
      if (validatorsResponse.data && Array.isArray(validatorsResponse.data)) {
        const validator = validatorsResponse.data.find(
          (v) => v.vote_identity === votePubkey
        );
        
        if (validator) {
          console.log("Found validator in validators list:", validator);
          
          // Estimate APY based on commission
          const baseApy = 0.075; // 7.5% base estimate
          const commissionDecimal = validator.commission / 100;
          const estimatedApy = baseApy * (1 - commissionDecimal);
          
          const metrics = {
            totalStake: validator.activated_stake || validator.stake || 0,
            pendingStakeChange: 0,
            isDeactivating: false,
            commission: validator.commission || 0,
            mevCommission: validator.commission || 0,
            estimatedApy,
            activatingStake: 0,
            deactivatingStake: 0,
            description: validator.description || null,
            version: validator.version || null,
            uptime30d: validator.uptime || null
          };
          
          console.log("Metrics from validators list:", metrics);
          validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
          return metrics;
        }
      }
    } catch (error) {
      console.error("Alternate Stakewiz endpoint failed:", error);
    }
    
    // Last resort - try to fetch directly from Stakewiz website
    try {
      // This is just for logging, we can't actually scrape from our frontend
      console.log(`Consider checking https://stakewiz.com/validator/${votePubkey} manually`);
      return null;
    } catch (error) {
      console.error("Failed to get data from all sources:", error);
      return null;
    }
  } catch (error) {
    console.error("Critical error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics: " + (error instanceof Error ? error.message : "Unknown error"));
    return null;
  }
};
