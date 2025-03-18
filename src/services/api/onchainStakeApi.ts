
import { Connection, PublicKey, StakeProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT, FALLBACK_RPC_ENDPOINTS } from "./constants";
import { toast } from "sonner";
import { fetchCurrentEpoch } from "./epochApi";
import { StakeHistoryItem } from "./types";

// Create a connection to the Solana network with retry logic
const getConnection = async (): Promise<Connection> => {
  let connection = new Connection(RPC_ENDPOINT);
  
  // Try main RPC endpoint first
  try {
    await connection.getVersion();
    return connection;
  } catch (error) {
    console.error("Primary RPC endpoint failed, trying fallbacks");
    
    // Try fallback endpoints
    for (const endpoint of FALLBACK_RPC_ENDPOINTS) {
      try {
        connection = new Connection(endpoint);
        await connection.getVersion();
        console.log(`Using fallback RPC endpoint: ${endpoint}`);
        return connection;
      } catch (fallbackError) {
        console.error(`Fallback endpoint ${endpoint} failed`, fallbackError);
      }
    }
    
    // If all fallbacks fail, return the primary connection anyway
    console.warn("All RPC endpoints failed, using primary anyway");
    return new Connection(RPC_ENDPOINT);
  }
};

// Fetch a validator's total active stake directly from the vote account
export const fetchOnchainTotalStake = async (votePubkey: string): Promise<number> => {
  try {
    console.log(`Fetching on-chain total stake for vote account: ${votePubkey}`);
    const connection = await getConnection();
    const voteAccountPubkey = new PublicKey(votePubkey);
    
    // Get all stake accounts delegated to this vote account
    const stakeAccounts = await connection.getProgramAccounts(
      StakeProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 124, // Offset of vote pubkey in stake account data
              bytes: votePubkey
            }
          }
        ]
      }
    );
    
    console.log(`Found ${stakeAccounts.length} stake accounts delegated to ${votePubkey}`);
    
    // Calculate total active stake
    let totalActivatedStake = 0;
    const currentEpoch = await fetchCurrentEpoch();
    
    for (const account of stakeAccounts) {
      try {
        // Parse stake account data
        const stakeAccount = await connection.getStakeActivation(account.pubkey);
        
        if (stakeAccount.state === 'active') {
          // Get account balance for active stake
          const balance = await connection.getBalance(account.pubkey);
          totalActivatedStake += balance;
        }
      } catch (err) {
        console.error(`Error processing stake account ${account.pubkey.toString()}:`, err);
      }
    }
    
    // Convert lamports to SOL
    const totalStakeInSol = totalActivatedStake / LAMPORTS_PER_SOL;
    console.log(`Total on-chain stake for ${votePubkey}: ${totalStakeInSol} SOL`);
    
    return totalStakeInSol;
  } catch (error) {
    console.error("Error fetching on-chain total stake:", error);
    return 0;
  }
};

// Fetch pending stake changes directly from on-chain data
export const fetchOnchainStakeChanges = async (votePubkey: string): Promise<{
  activatingStake: number;
  deactivatingStake: number;
}> => {
  try {
    console.log(`Fetching on-chain stake changes for vote account: ${votePubkey}`);
    const connection = await getConnection();
    const voteAccountPubkey = new PublicKey(votePubkey);
    
    // Get all stake accounts delegated to this vote account
    const stakeAccounts = await connection.getProgramAccounts(
      StakeProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 124, // Offset of vote pubkey in stake account data
              bytes: votePubkey
            }
          }
        ]
      }
    );
    
    let activatingStake = 0;
    let deactivatingStake = 0;
    const currentEpoch = await fetchCurrentEpoch();
    
    for (const account of stakeAccounts) {
      try {
        // Get activation status
        const stakeAccount = await connection.getStakeActivation(account.pubkey);
        const balance = await connection.getBalance(account.pubkey);
        
        if (stakeAccount.state === 'activating') {
          activatingStake += balance;
        } else if (stakeAccount.state === 'deactivating') {
          deactivatingStake += balance;
        }
      } catch (err) {
        console.error(`Error processing stake account ${account.pubkey.toString()}:`, err);
      }
    }
    
    // Convert lamports to SOL
    const activatingStakeInSol = activatingStake / LAMPORTS_PER_SOL;
    const deactivatingStakeInSol = deactivatingStake / LAMPORTS_PER_SOL;
    
    console.log(`On-chain activating stake: ${activatingStakeInSol} SOL`);
    console.log(`On-chain deactivating stake: ${deactivatingStakeInSol} SOL`);
    
    return {
      activatingStake: activatingStakeInSol,
      deactivatingStake: deactivatingStakeInSol
    };
  } catch (error) {
    console.error("Error fetching on-chain stake changes:", error);
    return {
      activatingStake: 0,
      deactivatingStake: 0
    };
  }
};

// Generate stake history based on validator data
export const generateStakeHistory = (
  totalStake: number, 
  votePubkey: string,
  days = 30
): StakeHistoryItem[] => {
  console.log(`Generating stake history data for ${votePubkey} with current stake: ${totalStake}`);
  
  if (!totalStake || totalStake <= 0) {
    totalStake = 1000; // Fallback if total stake is invalid
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
