
import axios from "axios";
import { STAKEWIZ_API_URL } from "./constants";
import { ValidatorInfo } from "./types";
import { saveToCache } from "./utils/validatorCache";
import { fetchValidatorDetailsFromSolscan } from "./solscanApi";
import { VALIDATOR_IDENTITY } from "./constants";

// Fetch validator data from Stakewiz API
export const fetchFromStakewiz = async (votePubkey: string): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info from Stakewiz for ${votePubkey}...`);
    
    const stakewizResponse = await axios.get(
      `${STAKEWIZ_API_URL}/validator/${votePubkey}`,
      { timeout: 10000 }
    );
    
    if (!stakewizResponse.data) {
      console.log("No data returned from Stakewiz");
      return null;
    }
    
    const stakewizData = stakewizResponse.data;
    console.log("Stakewiz data:", stakewizData);
    
    // Get stake changes from Stakewiz
    let activatingStake = 0;
    let deactivatingStake = 0;
    
    try {
      const stakeResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${votePubkey}/stake`);
      if (stakeResponse.data) {
        activatingStake = stakeResponse.data.activating || 0;
        deactivatingStake = stakeResponse.data.deactivating || 0;
      }
    } catch (stakeError) {
      console.error("Error fetching stake data from Stakewiz:", stakeError);
    }
    
    // Use Solscan API for additional details
    const solscanDetails = await fetchValidatorDetailsFromSolscan(votePubkey);
    
    // Create validator info object from Stakewiz data
    const validatorInfo: ValidatorInfo = {
      identity: stakewizData.identity || VALIDATOR_IDENTITY,
      votePubkey: votePubkey,
      commission: stakewizData.commission || 0,
      activatedStake: stakewizData.activated_stake || 0,
      pendingStakeChange: Math.max(activatingStake, deactivatingStake),
      isDeactivating: deactivatingStake > activatingStake,
      delinquentStake: 0,
      epochCredits: stakewizData.epoch_credits || 0,
      lastVote: stakewizData.last_vote || 0,
      rootSlot: stakewizData.root_slot || 0,
      currentEpoch: stakewizData.epoch || 0,
      name: stakewizData.name || solscanDetails.name || '',
      icon: stakewizData.image || solscanDetails.logo || null,
      website: stakewizData.website || solscanDetails.website || null
    };
    
    // Cache the result
    saveToCache(votePubkey, validatorInfo);
    return validatorInfo;
  } catch (error) {
    console.error("Error fetching from Stakewiz:", error);
    return null;
  }
};
