
import { RPC_ENDPOINT } from "./constants";
import { fetchCurrentEpoch } from "./epochApi";
import { StakeHistoryItem } from "./types";

// Fetch pending stake changes directly from on-chain data
export const fetchOnchainStakeChanges = async (votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> => {
  try {
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
        signal: AbortSignal.timeout(15000)
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
            console.log("Processing delegation:", delegation);
            
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
      
      return {
        activatingStake: activatingStakeInSol,
        deactivatingStake: deactivatingStakeInSol
      };
    } catch (rpcError) {
      console.error("Error with direct RPC method:", rpcError);
      throw rpcError; // Propagate to try fallback methods
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
  console.log(`Generating stake history data for ${votePubkey} with current stake: ${totalStake}`);
  
  // Use a reasonable default if no stake data available
  if (!totalStake || totalStake <= 0) {
    totalStake = 10000; // Fallback if total stake is invalid
  }
  
  // Use last 6 chars of pubkey to seed the random generation for consistency
  const pubkeySeed = parseInt(votePubkey.substring(votePubkey.length - 6), 16) % 1000;
  
  // Base stake is current stake (should be accurate)
  const baseStake = totalStake;
  
  const history: StakeHistoryItem[] = [];
  const now = new Date();
  const currentEpoch = 758; // Approximate current epoch
  
  // Generate history going backward from current stake
  for (let i = 0; i < Math.ceil(days / 2.5); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.round(i * 2.5));
    
    // Add variability based on pubkey seed for consistency
    // Earlier epochs have progressively less stake (on average)
    const daysFactor = Math.min(0.15, i * 0.005); // Max 15% difference for oldest data
    const randomFactor = Math.sin((i + pubkeySeed) * 0.3) * 0.03; // Small fluctuations
    
    // Calculate stake for this point in history
    // More recent history is closer to current stake
    let historicalStake = baseStake;
    if (i > 0) {
      historicalStake = baseStake * (1 - daysFactor) * (1 + randomFactor);
    }
    
    history.push({
      epoch: currentEpoch - i,
      stake: Math.max(100, Math.round(historicalStake)), // Ensure minimum stake
      date: date.toISOString()
    });
  }
  
  // Return in ascending epoch order
  return history.sort((a, b) => a.epoch - b.epoch);
};
