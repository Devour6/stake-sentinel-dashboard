
import axios from "axios";
import { STAKEWIZ_API_URL } from "../constants";

/**
 * Fetch validator metrics from Stakewiz API
 * @param votePubkey Validator vote account public key
 * @returns Stakewiz validator data
 */
export async function fetchStakewizMetrics(votePubkey: string): Promise<any> {
  try {
    const stakewizResponse = await axios.get(
      `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
      { timeout: 10000 }
    );
    
    if (stakewizResponse.data) {
      console.log("Stakewiz validator data:", stakewizResponse.data);
      return stakewizResponse.data;
    }
    return null;
  } catch (error) {
    console.error("Primary Stakewiz endpoint failed:", error);
    return null;
  }
}

/**
 * Extract stake data from Stakewiz metrics response
 * @param stakewizData Stakewiz validator data
 * @returns Object containing stake values or zeros if not available
 */
export function extractStakeData(stakewizData: any) {
  if (!stakewizData) return { totalStake: 0, activatingStake: 0, deactivatingStake: 0 };
  
  return {
    totalStake: stakewizData.activated_stake || 0,
    activatingStake: stakewizData.activating_stake || 0,
    deactivatingStake: stakewizData.deactivating_stake || 0
  };
}

/**
 * Extract additional validator metadata from Stakewiz response
 * @param stakewizData Stakewiz validator data
 * @returns Object containing validator metadata
 */
export function extractValidatorMetadata(stakewizData: any) {
  if (!stakewizData) return {
    description: "",
    uptime: 99.5,
    version: "v1.17.x",
    website: null,
    delegatorCount: 0
  };
  
  return {
    description: stakewizData.description || '',
    uptime: stakewizData.uptime_percentage || stakewizData.uptime || 99.5,
    version: stakewizData.version || 'v1.17.x',
    website: stakewizData.website || null,
    delegatorCount: stakewizData.delegator_count || 0
  };
}
