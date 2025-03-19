
import { toast } from "sonner";
import axios from "axios";
import { VALIDATOR_PUBKEY, STAKEWIZ_API_URL, RPC_ENDPOINT } from "./constants";
import { ValidatorMetrics } from "./types";
import { fetchValidatorStake } from "./validatorStakeApi";
import { fetchVoteAccounts } from "./epochApi";
import { lamportsToSol } from "./utils";
import { fetchReliableTotalStake, fetchReliableStakeChanges } from "./betterStakeService";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 2 * 60 * 1000; // 2 minutes

// Enhanced metrics fetching with direct RPC calls as fallback
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
    
    // Get the most reliable stake data first
    let totalStake = 0;
    let activatingStake = 0;
    let deactivatingStake = 0;
    
    try {
      totalStake = await fetchReliableTotalStake(votePubkey);
      console.log(`Got reliable total stake: ${totalStake} SOL`);
      
      const changes = await fetchReliableStakeChanges(votePubkey);
      activatingStake = changes.activatingStake;
      deactivatingStake = changes.deactivatingStake;
      console.log(`Got reliable stake changes: activating=${activatingStake}, deactivating=${deactivatingStake}`);
    } catch (stakeError) {
      console.error("Error fetching reliable stake data:", stakeError);
    }
    
    // Primary source: Stakewiz validator endpoint
    try {
      const stakewizResponse = await axios.get(
        `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
        { timeout: 10000 }
      );
      
      if (stakewizResponse.data) {
        const stakewizData = stakewizResponse.data;
        console.log("Stakewiz validator data:", stakewizData);
        
        // If we didn't get stake data above, try getting it from Stakewiz
        if (totalStake <= 0 && stakewizData.activated_stake) {
          totalStake = stakewizData.activated_stake;
          console.log(`Using Stakewiz total stake: ${totalStake} SOL`);
        }
        
        // If we didn't get stake changes above, try getting them from Stakewiz
        if (activatingStake === 0 && deactivatingStake === 0) {
          if (stakewizData.activating_stake !== undefined) {
            activatingStake = stakewizData.activating_stake || 0;
            deactivatingStake = stakewizData.deactivating_stake || 0;
            console.log(`Using Stakewiz stake changes: activating=${activatingStake}, deactivating=${deactivatingStake}`);
          }
        }
        
        // Calculate APY from multiple possible sources
        let estimatedApy = null;
        
        // Try using validator's APY data
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
        
        // If we still don't have APY, try to get mev commission and estimate
        if (estimatedApy === null && stakewizData.commission !== undefined) {
          // Rough APY estimate based on commission
          const baseApy = 0.075; // 7.5% base APY estimate
          const commissionDecimal = stakewizData.commission / 100;
          estimatedApy = baseApy * (1 - commissionDecimal);
          console.log("Estimated APY based on commission:", estimatedApy);
        }
        
        // Extract additional info from stakewiz data
        const description = stakewizData.description || '';
        const uptime = stakewizData.uptime_percentage || stakewizData.uptime || 99.5;
        const version = stakewizData.version || 'v1.17.x';
        const website = stakewizData.website || null;
        
        // Get delegator count
        let delegatorCount = stakewizData.delegator_count || 0;
        
        const metrics = {
          totalStake,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          commission: stakewizData.commission || 0,
          mevCommission: stakewizData.jito_commission_bps !== undefined ? 
                        stakewizData.jito_commission_bps / 100 : 
                        stakewizData.commission || 0,
          estimatedApy: estimatedApy || 0.07,
          activatingStake,
          deactivatingStake,
          description,
          uptime,
          version,
          website,
          delegatorCount
        };
        
        console.log("Final validator metrics:", metrics);
        validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
        return metrics;
      }
    } catch (error) {
      console.error("Primary Stakewiz endpoint failed:", error);
      console.log("Primary data source unavailable, trying alternatives...");
    }
    
    // Try direct RPC calls for core validator data
    try {
      console.log("Trying direct RPC calls...");
      
      // Get validator data from vote accounts
      const { current, delinquent } = await fetchVoteAccounts();
      const validator = [...current, ...delinquent].find(v => v.votePubkey === votePubkey);
      
      if (validator) {
        console.log("Found validator in vote accounts:", validator);
        
        // Use RPC data only if we don't have better data already
        if (totalStake <= 0) {
          totalStake = lamportsToSol(validator.activatedStake);
        }
        
        const commission = validator.commission;
        
        // Estimate APY based on commission
        const baseApy = 0.075; // 7.5% base estimate
        const commissionDecimal = commission / 100;
        const estimatedApy = baseApy * (1 - commissionDecimal);
        
        // Very rough delegator count estimate (will be replaced with actual data if available)
        const delegatorCount = Math.floor(totalStake / 100) + 5;
        
        const metrics = {
          totalStake,
          pendingStakeChange: Math.max(activatingStake, deactivatingStake),
          isDeactivating: deactivatingStake > activatingStake,
          commission,
          mevCommission: commission, // Use regular commission as fallback
          estimatedApy,
          activatingStake,
          deactivatingStake,
          description: "",
          uptime: 99.5, // Default uptime
          version: "v1.17.x", // Default version
          website: null,
          delegatorCount
        };
        
        console.log("Metrics from direct RPC:", metrics);
        validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: now });
        return metrics;
      }
    } catch (rpcError) {
      console.error("Direct RPC approach failed:", rpcError);
    }
    
    // Last resort - create fallback metrics if everything else fails
    // At this point, we might have partial data from earlier attempts
    console.warn("All endpoints failed, creating fallback metrics with any data we have");
    
    // Use any data we gathered above, or generate fallbacks
    const commission = 5;
    const estimatedApy = 0.07 - (commission / 1000);
    
    const fallbackMetrics = {
      totalStake: totalStake > 0 ? totalStake : 10000,
      pendingStakeChange: Math.max(activatingStake, deactivatingStake),
      isDeactivating: deactivatingStake > activatingStake,
      commission,
      mevCommission: commission,
      estimatedApy,
      activatingStake,
      deactivatingStake,
      description: "",
      uptime: 99.5,
      version: "v1.17.x",
      website: null,
      delegatorCount: Math.floor((totalStake > 0 ? totalStake : 10000) / 100) + 5
    };
    
    console.log("Using fallback metrics:", fallbackMetrics);
    validatorMetricsCache.set(votePubkey, { ...fallbackMetrics, timestamp: now });
    return fallbackMetrics;
  } catch (error) {
    console.error("Critical error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics");
    return null;
  }
};
