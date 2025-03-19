
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
      
      // Try with a different RPC if the first one fails
      try {
        const altResponse = await fetch("https://api.mainnet-beta.solana.com", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'stake-changes-alt',
            method: 'getProgramAccounts',
            params: [
              'Stake11111111111111111111111111111111111111',
              {
                encoding: 'jsonParsed',
                filters: [
                  {
                    memcmp: {
                      offset: 124,
                      bytes: votePubkey
                    }
                  }
                ]
              }
            ]
          }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log(`Received ${altData.result?.length || 0} stake accounts from alternative RPC`);
          
          let activatingStake = 0;
          let deactivatingStake = 0;
          
          if (altData.result && Array.isArray(altData.result)) {
            const currentEpoch = await fetchCurrentEpoch();
            
            for (const account of altData.result) {
              try {
                if (!account.account?.data?.parsed?.info?.stake?.delegation) continue;
                
                const delegation = account.account.data.parsed.info.stake.delegation;
                if (!delegation) continue;
                
                const activationEpoch = parseInt(delegation.activationEpoch);
                const deactivationEpoch = parseInt(delegation.deactivationEpoch);
                const stake = parseInt(delegation.stake);
                
                if (activationEpoch >= currentEpoch) {
                  activatingStake += stake;
                }
                
                if (deactivationEpoch !== 18446744073709552000 && 
                    deactivationEpoch !== 18446744073709551615 && 
                    deactivationEpoch >= currentEpoch) {
                  deactivatingStake += stake;
                }
              } catch (err) {
                console.error("Error processing stake account from alt RPC:", err);
              }
            }
          }
          
          const activatingStakeInSol = activatingStake / 1_000_000_000;
          const deactivatingStakeInSol = deactivatingStake / 1_000_000_000;
          
          const result = {
            activatingStake: activatingStakeInSol,
            deactivatingStake: deactivatingStakeInSol
          };
          
          stakeChangesCache.set(votePubkey, { data: result, timestamp: now });
          return result;
        }
      } catch (altRpcError) {
        console.error("Error with alternative RPC method:", altRpcError);
      }
    }
    
    // If all RPCs fail, return zeros
    console.error("All RPC methods failed for stake changes, returning zeros");
    return { activatingStake: 0, deactivatingStake: 0 };
  } catch (error) {
    console.error("Error fetching on-chain stake changes:", error);
    return { activatingStake: 0, deactivatingStake: 0 };
  }
};

// Fetch real on-chain total stake - directly from RPC
export const fetchOnchainTotalStake = async (votePubkey: string): Promise<number> => {
  try {
    console.log(`Fetching on-chain total stake for ${votePubkey}...`);
    
    // First try the direct vote accounts method
    try {
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-vote-accounts',
          method: 'getVoteAccounts',
          params: []
        }),
        signal: AbortSignal.timeout(8000)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vote accounts: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.result) {
        const { current, delinquent } = data.result;
        const allAccounts = [...current, ...delinquent];
        
        const validatorAccount = allAccounts.find(acc => acc.votePubkey === votePubkey);
        
        if (validatorAccount && validatorAccount.activatedStake) {
          const totalStake = parseInt(validatorAccount.activatedStake) / 1_000_000_000;
          console.log(`Found total stake from vote accounts: ${totalStake} SOL`);
          return totalStake;
        }
      }
    } catch (voteAccountsError) {
      console.error("Error fetching from vote accounts:", voteAccountsError);
    }
    
    // Try alternate method: calculate total from all stake accounts
    try {
      const stakeResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'stake-total',
          method: 'getProgramAccounts',
          params: [
            'Stake11111111111111111111111111111111111111',
            {
              encoding: 'jsonParsed',
              filters: [
                {
                  memcmp: {
                    offset: 124,
                    bytes: votePubkey
                  }
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!stakeResponse.ok) {
        throw new Error(`Failed to fetch stake accounts for total: ${stakeResponse.statusText}`);
      }
      
      const stakeData = await stakeResponse.json();
      
      if (stakeData.result && Array.isArray(stakeData.result)) {
        const currentEpoch = await fetchCurrentEpoch();
        let totalActiveStake = 0;
        
        for (const account of stakeData.result) {
          try {
            if (!account.account?.data?.parsed?.info?.stake?.delegation) continue;
            
            const delegation = account.account.data.parsed.info.stake.delegation;
            if (!delegation) continue;
            
            const activationEpoch = parseInt(delegation.activationEpoch);
            const deactivationEpoch = parseInt(delegation.deactivationEpoch);
            const stake = parseInt(delegation.stake);
            
            // Only count active stake (activated in past epochs and not deactivated)
            if (activationEpoch < currentEpoch && 
                (deactivationEpoch === 18446744073709552000 || 
                 deactivationEpoch === 18446744073709551615 || 
                 deactivationEpoch > currentEpoch)) {
              totalActiveStake += stake;
            }
          } catch (err) {
            console.error("Error processing stake account for total:", err);
          }
        }
        
        const totalStakeInSol = totalActiveStake / 1_000_000_000;
        console.log(`Calculated total stake from stake accounts: ${totalStakeInSol} SOL`);
        return totalStakeInSol;
      }
    } catch (stakeAccountsError) {
      console.error("Error calculating total from stake accounts:", stakeAccountsError);
    }
    
    // Try with a different RPC as last resort
    try {
      const altResponse = await fetch("https://api.mainnet-beta.solana.com", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-vote-accounts-alt',
          method: 'getVoteAccounts',
          params: []
        }),
        signal: AbortSignal.timeout(8000)
      });
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        
        if (altData.result) {
          const { current, delinquent } = altData.result;
          const allAccounts = [...current, ...delinquent];
          
          const validatorAccount = allAccounts.find(acc => acc.votePubkey === votePubkey);
          
          if (validatorAccount && validatorAccount.activatedStake) {
            const totalStake = parseInt(validatorAccount.activatedStake) / 1_000_000_000;
            console.log(`Found total stake from alternative RPC: ${totalStake} SOL`);
            return totalStake;
          }
        }
      }
    } catch (altRpcError) {
      console.error("Error with alternative RPC for total stake:", altRpcError);
    }
    
    console.error("All methods failed for total stake, returning 0");
    return 0;
  } catch (error) {
    console.error("Fatal error fetching on-chain total stake:", error);
    return 0;
  }
};

// Fetch stake history directly from on-chain data
export const fetchOnchainStakeHistory = async (votePubkey: string): Promise<StakeHistoryItem[]> => {
  try {
    console.log(`Attempting to build stake history from on-chain data for ${votePubkey}`);
    
    // Get current total stake
    const currentStake = await fetchOnchainTotalStake(votePubkey);
    const currentEpoch = await fetchCurrentEpoch();
    
    if (currentStake > 0) {
      const history: StakeHistoryItem[] = [
        {
          epoch: currentEpoch,
          stake: currentStake,
          date: new Date().toISOString()
        }
      ];
      
      console.log(`Created current epoch (${currentEpoch}) history entry with stake ${currentStake} SOL`);
      return history;
    }
    
    return [];
  } catch (error) {
    console.error("Error building on-chain stake history:", error);
    return [];
  }
};
