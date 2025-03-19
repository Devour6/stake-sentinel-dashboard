
import { RPC_ENDPOINT } from "./constants";
import { fetchCurrentEpoch } from "./epochApi";
import { StakeHistoryItem } from "./types";

// Cache for stake changes to improve performance
const stakeChangesCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch pending stake changes directly from on-chain data
export const fetchOnchainStakeChanges = async (votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> => {
  try {
    // Check cache first
    const now = Date.now();
    const cachedData = stakeChangesCache.get(votePubkey);
    if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
      console.log(`Using cached stake changes for ${votePubkey}`);
      return cachedData.data;
    }
    
    console.log(`Fetching on-chain stake changes for vote account: ${votePubkey}`);
    
    // Try direct RPC call method (most reliable)
    try {
      console.log("Using direct RPC call for stake changes");
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'stake-changes',
          method: 'getProgramAccounts',
          params: [
            'Stake11111111111111111111111111111111111111',
            {
              encoding: 'jsonParsed',
              filters: [
                {
                  memcmp: {
                    offset: 124,  // Offset for vote account in stake delegation
                    bytes: votePubkey
                  }
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stake accounts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.result?.length || 0} stake accounts from RPC`);

      let activatingStake = 0;
      let deactivatingStake = 0;
      
      if (data.result && Array.isArray(data.result)) {
        const currentEpoch = await fetchCurrentEpoch();
        console.log("Current epoch:", currentEpoch);
        
        // Process stake accounts
        for (const account of data.result) {
          try {
            if (!account.account?.data?.parsed?.info?.stake?.delegation) {
              continue;
            }
            
            const delegation = account.account.data.parsed.info.stake.delegation;
            
            if (!delegation) continue;
            
            const activationEpoch = parseInt(delegation.activationEpoch);
            const deactivationEpoch = parseInt(delegation.deactivationEpoch);
            const stake = parseInt(delegation.stake);
            
            // Check for activating stake (not yet active in current epoch)
            if (activationEpoch >= currentEpoch) {
              console.log(`Found activating stake: ${stake / 1_000_000_000} SOL, activation epoch: ${activationEpoch}, current epoch: ${currentEpoch}`);
              activatingStake += stake;
            }
            
            // Check for deactivating stake (deactivation requested but not yet complete)
            // In Solana, the "deactivationEpoch" is set to the max u64 value (18446744073709551615) when not deactivating
            if (deactivationEpoch !== 18446744073709552000 && 
                deactivationEpoch !== 18446744073709551615 && 
                deactivationEpoch >= currentEpoch) {
              console.log(`Found deactivating stake: ${stake / 1_000_000_000} SOL, deactivation epoch: ${deactivationEpoch}, current epoch: ${currentEpoch}`);
              deactivatingStake += stake;
            }
          } catch (err) {
            console.error("Error processing stake account:", err);
          }
        }
      }
      
      const activatingStakeInSol = activatingStake / 1_000_000_000;
      const deactivatingStakeInSol = deactivatingStake / 1_000_000_000;
      
      console.log(`On-chain activating stake: ${activatingStakeInSol} SOL`);
      console.log(`On-chain deactivating stake: ${deactivatingStakeInSol} SOL`);
      
      const result = {
        activatingStake: activatingStakeInSol,
        deactivatingStake: deactivatingStakeInSol
      };
      
      stakeChangesCache.set(votePubkey, { data: result, timestamp: now });
      return result;
    } catch (rpcError) {
      console.error("Error with direct RPC method:", rpcError);
      
      // Try Stakewiz as a backup
      try {
        const stakewizResponse = await fetch(`https://api.stakewiz.com/validator/${votePubkey}/stake`, {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        
        if (stakewizResponse.ok) {
          const stakewizData = await stakewizResponse.json();
          
          if (stakewizData) {
            const result = {
              activatingStake: stakewizData.activating || 0,
              deactivatingStake: stakewizData.deactivating || 0
            };
            
            console.log(`Stakewiz stake changes:`, result);
            stakeChangesCache.set(votePubkey, { data: result, timestamp: now });
            return result;
          }
        }
      } catch (stakewizError) {
        console.error("Error with Stakewiz fallback:", stakewizError);
      }
      
      // Return zeros if all methods fail
      const fallback = { activatingStake: 0, deactivatingStake: 0 };
      stakeChangesCache.set(votePubkey, { data: fallback, timestamp: now });
      return fallback;
    }
  } catch (error) {
    console.error("Error fetching on-chain stake changes:", error);
    
    // Return zeros if all methods fail
    return {
      activatingStake: 0,
      deactivatingStake: 0
    };
  }
};

// Generate stake history based on validator data (fallback function)
export const generateStakeHistory = (
  totalStake: number, 
  votePubkey: string,
  days = 30
): StakeHistoryItem[] => {
  // This function is only used as a last resort when all other methods fail
  // but we still need to show something in the UI
  console.warn(`All stake history endpoints failed for ${votePubkey}, no real data available`);
  return [];
};
