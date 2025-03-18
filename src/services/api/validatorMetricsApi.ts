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
    
    // Primary direct API call to Stakewiz
    try {
      console.log(`Making direct request to ${STAKEWIZ_API_URL}/validator/${votePubkey}`);
      
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 15000 }
      );
      
      if (stakewizResponse.data) {
        const stakewizData = stakewizResponse.data;
        console.log("Stakewiz validator data:", stakewizData);
        
        // Extract stake amounts - Stakewiz uses different field names in different endpoints
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
        
        console.log("Extracted total stake:", totalStake);
        
        // Get activating/deactivating stake
        let activatingStake = 0;
        let deactivatingStake = 0;
        
        // Try to get stake changes from the main response first
        if (stakewizData.activating_stake !== undefined) {
          activatingStake = stakewizData.activating_stake;
          deactivatingStake = stakewizData.deactivating_stake || 0;
        } else if (stakewizData.activating !== undefined) {
          activatingStake = stakewizData.activating;
          deactivatingStake = stakewizData.deactivating || 0;
        }
        
        // If not found in main response, try dedicated stake endpoint
        if (activatingStake === 0 && deactivatingStake === 0) {
          try {
            const stakeResponse = await axios.get(
              `${STAKEWIZ_API_URL}/validator/${votePubkey}/stake`,
              { timeout: 10000 }
            );
            
            if (stakeResponse.data) {
              console.log("Stakewiz stake data:", stakeResponse.data);
              activatingStake = stakeResponse.data.activating || 0;
              deactivatingStake = stakeResponse.data.deactivating || 0;
            }
          } catch (stakeError) {
            console.error("Error fetching stake data:", stakeError);
          }
        }
        
        console.log("Stake changes - Activating:", activatingStake, "Deactivating:", deactivatingStake);
        
        // Extract commission and calculate APY
        const commission = stakewizData.commission !== undefined ? stakewizData.commission : 0;
        
        // Extract APY from various possible fields
        let estimatedApy = null;
        if (stakewizData.total_apy) {
          estimatedApy = stakewizData.total_apy / 100;
        } else if (stakewizData.apy_estimate) {
          estimatedApy = stakewizData.apy_estimate / 100;
        } else if (stakewizData.staking_apy) {
          const stakingApy = stakewizData.staking_apy / 100;
          const jitoApy = (stakewizData.jito_apy || 0) / 100;
          estimatedApy = stakingApy + jitoApy;
        } else {
          // Fallback estimation
          const baseApy = 0.075; // 7.5% base APY estimate
          const commissionDecimal = commission / 100;
          estimatedApy = baseApy * (1 - commissionDecimal);
        }
        
        // Extract other validator metadata
        const description = stakewizData.description || null;
        const version = stakewizData.version || null;
        const uptime30d = stakewizData.uptime !== undefined ? 
                          stakewizData.uptime : 
                          stakewizData.uptime_30d !== undefined ? 
                          stakewizData.uptime_30d : null;
        
        // Website
        const website = stakewizData.website || null;
        
        // MEV commission handling
        const mevCommission = stakewizData.jito_commission_bps !== undefined ? 
                             stakewizData.jito_commission_bps / 100 : commission;
        
        // Create metrics object
        const metrics: ValidatorMetrics = {
          totalStake: totalStake,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          commission: commission,
          mevCommission: mevCommission,
          estimatedApy: estimatedApy,
          activatingStake: activatingStake,
          deactivatingStake: deactivatingStake,
          description: description,
          version: version,
          uptime30d: uptime30d,
          website: website
        };
        
        console.log("Final validator metrics:", metrics);
        validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
        return metrics;
      }
    } catch (primaryError) {
      console.error("Error with primary Stakewiz endpoint:", primaryError);
    }
    
    // Fallback to validators list endpoint
    try {
      console.log("Trying validators list endpoint...");
      const validatorsResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validators`,
        { timeout: 15000 }
      );
      
      if (validatorsResponse.data && Array.isArray(validatorsResponse.data)) {
        // Find the validator in the list
        const validator = validatorsResponse.data.find(v => 
          v.vote_account === votePubkey || 
          v.vote_identity === votePubkey || 
          v.vote_pubkey === votePubkey
        );
        
        if (validator) {
          console.log("Found validator in validators list:", validator);
          
          // Extract data from the validator object
          const totalStake = validator.activated_stake || validator.stake || 0;
          const commission = validator.commission || 0;
          const baseApy = 0.075; // 7.5% base estimate
          const commissionDecimal = commission / 100;
          const estimatedApy = baseApy * (1 - commissionDecimal);
          
          const metrics: ValidatorMetrics = {
            totalStake: totalStake,
            pendingStakeChange: 0, // No pending change info in this endpoint
            isDeactivating: false,
            commission: commission,
            mevCommission: commission,
            estimatedApy: estimatedApy,
            activatingStake: 0,
            deactivatingStake: 0,
            description: validator.description || null,
            version: validator.version || null,
            uptime30d: validator.uptime || null,
            website: validator.website || null
          };
          
          console.log("Metrics from validators list:", metrics);
          validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
          return metrics;
        }
      }
    } catch (fallbackError) {
      console.error("Fallback endpoint failed:", fallbackError);
    }
    
    // Last resort - return a minimal object with whatever data we have
    console.log("All Stakewiz methods failed, returning minimal data");
    return {
      totalStake: 0,
      pendingStakeChange: 0,
      isDeactivating: false,
      commission: 0,
      estimatedApy: null,
      website: null
    };
  } catch (error) {
    console.error("Critical error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics");
    return null;
  }
};
