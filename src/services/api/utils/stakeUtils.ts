
import { lamportsToSol } from "../utils";
import { StakeHistoryItem } from "../types";

/**
 * Extract the most reliable stake value from various data sources
 */
export function getReliableStakeValue(
  directStake: number,
  metricsStake: number,
  infoStake: number,
  stakeHistory: StakeHistoryItem[]
): number {
  // Try getting stake from direct total stake fetch first
  if (directStake > 0) {
    console.log("Using direct total stake:", directStake);
    return directStake;
  } 
  
  // Then try metrics if direct fetch failed
  if (metricsStake > 0) {
    console.log("Using metrics total stake:", metricsStake);
    return metricsStake;
  } 
  
  // Next try validator info stake
  if (infoStake > 0) {
    console.log("Using info stake:", infoStake);
    return infoStake;
  }
  
  // As a last resort, try to get stake from history
  if (stakeHistory && stakeHistory.length > 0) {
    const latestPoint = [...stakeHistory].sort((a, b) => b.epoch - a.epoch)[0];
    if (latestPoint && latestPoint.stake > 0) {
      console.log("Using latest stake history point as total stake:", latestPoint.stake);
      return latestPoint.stake;
    }
  }
  
  return 0;
}

/**
 * Generate synthetic stake history based on validator pubkey and current stake
 */
export function generateSyntheticStakeHistory(
  votePubkey: string, 
  currentStake: number, 
  currentEpoch: number,
  days = 30
): StakeHistoryItem[] {
  if (currentStake <= 0) {
    return [];
  }
  
  // Use last 6 chars of pubkey to seed the pattern
  const seedValue = parseInt(votePubkey.substring(votePubkey.length - 6), 16);
  const history: StakeHistoryItem[] = [];
  
  // Add current epoch data
  history.push({
    epoch: currentEpoch,
    stake: currentStake,
    date: new Date().toISOString()
  });
  
  // Generate past epochs with a deterministic pattern
  for (let i = 1; i <= Math.ceil(days / 2.5); i++) {
    // Create a deterministic but realistic variation
    const variation = Math.sin((currentEpoch - i) * 0.3 + seedValue * 0.01) * 0.03;
    const ageFactor = 1 - (i * 0.005);
    const historicalStake = currentStake * ageFactor * (1 + variation);
    
    // Create date for this epoch (roughly 2-3 days per epoch)
    const epochDate = new Date();
    epochDate.setDate(epochDate.getDate() - (i * 2.5));
    
    history.push({
      epoch: currentEpoch - i,
      stake: Math.max(currentStake * 0.7, historicalStake),
      date: epochDate.toISOString()
    });
  }
  
  // Sort by epoch (ascending)
  return history.sort((a, b) => a.epoch - b.epoch);
}

/**
 * Parse stake change data from RPC response
 */
export function parseStakeChanges(
  stakeAccounts: any[], 
  currentEpoch: number
): { activatingStake: number, deactivatingStake: number } {
  let activatingStake = 0;
  let deactivatingStake = 0;
  
  if (!Array.isArray(stakeAccounts)) {
    return { activatingStake, deactivatingStake };
  }
  
  for (const account of stakeAccounts) {
    try {
      if (!account.account?.data?.parsed?.info?.stake?.delegation) continue;
      
      const delegation = account.account.data.parsed.info.stake.delegation;
      if (!delegation) continue;
      
      const activationEpoch = parseInt(delegation.activationEpoch);
      const deactivationEpoch = parseInt(delegation.deactivationEpoch);
      const stake = parseInt(delegation.stake);
      
      // Check for activating stake (not yet active in current epoch)
      if (activationEpoch >= currentEpoch) {
        activatingStake += stake;
      }
      
      // Check for deactivating stake
      const maxU64Values = [18446744073709552000, 18446744073709551615];
      if (!maxU64Values.includes(deactivationEpoch) && deactivationEpoch >= currentEpoch) {
        deactivatingStake += stake;
      }
    } catch (err) {
      console.error("Error processing stake account:", err);
    }
  }
  
  return {
    activatingStake: lamportsToSol(activatingStake),
    deactivatingStake: lamportsToSol(deactivatingStake)
  };
}
