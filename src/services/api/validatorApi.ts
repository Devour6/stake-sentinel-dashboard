
import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY, RPC_ENDPOINT } from "./constants";
import { ValidatorInfo, ValidatorMetrics, StakeHistoryItem, RpcVoteAccount, StakeAccountInfo } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchStakeHistory } from "./stakeApi";

// Fetch stake accounts for a specific validator to determine activating stake
async function fetchActivatingStake(voteAccount: string): Promise<number> {
  try {
    console.log(`Fetching activating stake for vote account: ${voteAccount}`);
    
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'activating-stake',
        method: 'getProgramAccounts',
        params: [
          'Stake11111111111111111111111111111111111111',
          {
            encoding: 'jsonParsed',
            filters: [
              {
                memcmp: {
                  offset: 124,
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
    
    if (data.result && Array.isArray(data.result)) {
      const currentEpoch = await fetchCurrentEpoch();
      
      // Sum up the stake that's still activating (activation epoch >= current epoch)
      for (const account of data.result) {
        try {
          const stakeAccount = account as StakeAccountInfo;
          const activationEpoch = Number(stakeAccount.account.data.parsed.info.stake.delegation.activationEpoch);
          const stake = Number(stakeAccount.account.data.parsed.info.stake.delegation.stake);
          
          if (activationEpoch >= currentEpoch) {
            console.log(`Found activating stake: ${lamportsToSol(stake)} SOL, activation epoch: ${activationEpoch}, current epoch: ${currentEpoch}`);
            activatingStake += stake;
          }
        } catch (err) {
          console.error("Error processing stake account:", err);
        }
      }
    }
    
    return lamportsToSol(activatingStake);
  } catch (error) {
    console.error("Error fetching activating stake:", error);
    return 0;
  }
}

// API methods using real RPC endpoint
export const fetchValidatorInfo = async (): Promise<ValidatorInfo | null> => {
  try {
    console.log("Fetching validator info...");
    
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === VALIDATOR_PUBKEY);
    
    if (!validator) {
      console.log("Validator not found in response");
      return null;
    }

    // Get current epoch info
    const currentEpoch = await fetchCurrentEpoch();
    
    // Log the validator data for debugging purposes
    console.log("Raw validator data:", validator);
    
    // Fetch activating stake from stake accounts
    const activatingStake = await fetchActivatingStake(validator.votePubkey);
    console.log("Processed activatingStake:", activatingStake);
    
    return {
      identity: validator.nodePubkey || VALIDATOR_IDENTITY,
      votePubkey: validator.votePubkey,
      commission: validator.commission,
      activatedStake: lamportsToSol(validator.activatedStake),
      activatingStake: activatingStake,
      delinquentStake: 0,
      epochCredits: validator.epochCredits[0]?.[0] || 0,
      lastVote: validator.lastVote,
      rootSlot: validator.rootSlot || 0,
      currentEpoch: currentEpoch
    };
  } catch (error) {
    console.error("Error fetching validator info:", error);
    toast.error("Failed to fetch validator data. Falling back to mock data.");
    
    // Fallback to mock data
    return {
      identity: VALIDATOR_IDENTITY,
      votePubkey: VALIDATOR_PUBKEY,
      commission: 7,
      activatedStake: 345678.9012,
      activatingStake: 0,
      delinquentStake: 0,
      epochCredits: 123456,
      lastVote: 198765432,
      rootSlot: 198765400,
      currentEpoch: 351
    };
  }
};

export const fetchValidatorMetrics = async (): Promise<ValidatorMetrics | null> => {
  try {
    console.log("Fetching validator metrics...");
    
    const validatorInfo = await fetchValidatorInfo();
    
    if (!validatorInfo) {
      throw new Error("Failed to fetch validator info");
    }
    
    return {
      totalStake: validatorInfo.activatedStake,
      activatingStake: validatorInfo.activatingStake,
      commission: validatorInfo.commission,
    };
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    toast.error("Failed to fetch validator metrics. Using mock data.");
    
    // Fallback to mock data
    return {
      totalStake: 345678.9012,
      activatingStake: 0,
      commission: 7,
    };
  }
};

// Re-export stake history function for compatibility
export { fetchStakeHistory };
