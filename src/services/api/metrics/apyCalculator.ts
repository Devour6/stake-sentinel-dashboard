
/**
 * Utility functions for calculating and processing APY data
 */

/**
 * Calculate estimated APY based on commission rate
 * @param commission Commission rate in percentage (0-100)
 * @param baseApy Base APY estimate (default: 7.5%)
 * @returns Estimated APY in decimal form (e.g., 0.075 for 7.5%)
 */
export function estimateApyFromCommission(commission: number, baseApy = 0.075): number {
  const commissionDecimal = commission / 100;
  return baseApy * (1 - commissionDecimal);
}

/**
 * Determine the most reliable APY value from available sources
 * @param stakewizData Validator data from Stakewiz API
 * @param commission Fallback commission value if needed
 * @returns The most reliable APY value
 */
export function getReliableApy(stakewizData: any, commission?: number): number {
  // Try using validator's APY data in order of reliability
  if (stakewizData?.total_apy) {
    return stakewizData.total_apy / 100; // Convert percentage to decimal
  } 
  
  if (stakewizData?.apy_estimate) {
    return stakewizData.apy_estimate / 100;
  } 
  
  if (stakewizData?.staking_apy) {
    // If we have staking_apy and jito_apy, combine them
    const stakingApy = stakewizData.staking_apy / 100;
    const jitoApy = (stakewizData.jito_apy || 0) / 100;
    return stakingApy + jitoApy;
  }
  
  // If we still don't have APY, try to get commission and estimate
  if (commission !== undefined || stakewizData?.commission !== undefined) {
    // Use provided commission or extract from stakewiz data
    const commissionValue = commission !== undefined ? commission : stakewizData.commission;
    return estimateApyFromCommission(commissionValue);
  }
  
  // Default fallback APY if nothing else is available
  return 0.07; // 7% default
}
