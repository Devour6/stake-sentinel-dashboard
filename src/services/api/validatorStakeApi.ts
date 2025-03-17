
import { RPC_ENDPOINT } from "./constants";
import { StakeAccountInfo } from "./types";
import { lamportsToSol } from "./utils";
import { fetchCurrentEpoch } from "./epochApi";

// Improved function to fetch stake accounts for a specific validator
export async function fetchValidatorStake(voteAccount: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> {
  try {
    console.log(`Fetching stake changes for vote account: ${voteAccount}`);
    
    // First try using getProgramAccounts with filters
    try {
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
                    bytes: voteAccount
                  }
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stake accounts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.result?.length || 0} stake accounts`);

      let activatingStake = 0;
      let deactivatingStake = 0;
      
      if (data.result && Array.isArray(data.result)) {
        const currentEpoch = await fetchCurrentEpoch();
        
        // Process stake accounts
        for (const account of data.result) {
          try {
            if (!account.account?.data?.parsed?.info?.stake?.delegation) {
              continue;
            }
            
            const delegation = account.account.data.parsed.info.stake.delegation;
            
            if (!delegation) continue;
            
            const activationEpoch = Number(delegation.activationEpoch);
            const deactivationEpoch = Number(delegation.deactivationEpoch);
            const stake = Number(delegation.stake);
            
            // Check for activating stake (not yet active in current epoch)
            if (activationEpoch >= currentEpoch) {
              console.log(`Found activating stake: ${lamportsToSol(stake)} SOL, activation epoch: ${activationEpoch}, current epoch: ${currentEpoch}`);
              activatingStake += stake;
            }
            
            // Check for deactivating stake (deactivation requested but not yet complete)
            if (deactivationEpoch !== 18446744073709552000 && deactivationEpoch >= currentEpoch) {
              console.log(`Found deactivating stake: ${lamportsToSol(stake)} SOL, deactivation epoch: ${deactivationEpoch}, current epoch: ${currentEpoch}`);
              deactivatingStake += stake;
            }
          } catch (err) {
            console.error("Error processing stake account:", err);
          }
        }
      }
      
      return {
        activatingStake: lamportsToSol(activatingStake),
        deactivatingStake: lamportsToSol(deactivatingStake)
      };
    } catch (firstError) {
      console.error("Error with primary RPC method, trying fallback:", firstError);
      
      // Fallback - try to get data from Stakewiz API
      const stakewizResponse = await fetch(`https://api.stakewiz.com/validator/${voteAccount}/stake`);
      if (stakewizResponse.ok) {
        const stakewizData = await stakewizResponse.json();
        console.log("Stakewiz stake data:", stakewizData);
        
        // Extract stake changes from Stakewiz data
        if (stakewizData && stakewizData.active !== undefined) {
          return {
            activatingStake: stakewizData.activating || 0,
            deactivatingStake: stakewizData.deactivating || 0
          };
        }
      }
      
      // If all else fails, return zeros
      return {
        activatingStake: 0,
        deactivatingStake: 0
      };
    }
  } catch (error) {
    console.error("Error fetching stake changes:", error);
    return {
      activatingStake: 0,
      deactivatingStake: 0
    };
  }
}

// For backward compatibility
export const fetchActivatingStake = async (voteAccount: string): Promise<number> => {
  const { activatingStake } = await fetchValidatorStake(voteAccount);
  return activatingStake;
};
