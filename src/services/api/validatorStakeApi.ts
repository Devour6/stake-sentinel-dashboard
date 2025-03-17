
import { RPC_ENDPOINT } from "./constants";
import { StakeAccountInfo } from "./types";
import { lamportsToSol } from "./utils";
import { fetchCurrentEpoch } from "./epochApi";

// Fetch stake accounts for a specific validator to determine stake changes
export async function fetchValidatorStake(voteAccount: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> {
  try {
    console.log(`Fetching stake changes for vote account: ${voteAccount}`);
    
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
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stake accounts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Stake accounts response:", data);

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
          
          const stakeAccount = account;
          const delegation = stakeAccount.account.data.parsed.info.stake.delegation;
          
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
