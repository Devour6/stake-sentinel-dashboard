
import { ValidatorMetrics } from "../types";

// Cache for validator metrics to improve performance
const validatorMetricsCache = new Map<string, ValidatorMetrics & { timestamp: number }>();
const CACHE_VALIDITY_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Get cached validator metrics if available and still valid
 * @param votePubkey Validator vote account public key
 * @returns Cached validator metrics or null if not available/valid
 */
export function getCachedMetrics(votePubkey: string): ValidatorMetrics | null {
  const now = Date.now();
  const cachedMetrics = validatorMetricsCache.get(votePubkey);
  
  if (cachedMetrics && (now - cachedMetrics.timestamp < CACHE_VALIDITY_MS)) {
    console.log("Using cached validator metrics");
    const { timestamp, ...metrics } = cachedMetrics;
    return metrics;
  }
  
  return null;
}

/**
 * Save validator metrics to cache
 * @param votePubkey Validator vote account public key
 * @param metrics Validator metrics to cache
 */
export function cacheMetrics(votePubkey: string, metrics: ValidatorMetrics): void {
  validatorMetricsCache.set(votePubkey, { ...metrics, timestamp: Date.now() });
}
