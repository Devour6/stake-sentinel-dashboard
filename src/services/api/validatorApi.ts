import { toast } from "sonner";
import { VALIDATOR_PUBKEY, VALIDATOR_IDENTITY, RPC_ENDPOINT } from "./constants";
import { ValidatorInfo, ValidatorMetrics, StakeHistoryItem, RpcVoteAccount, StakeAccountInfo } from "./types";
import { lamportsToSol } from "./utils";
import { fetchVoteAccounts, fetchCurrentEpoch } from "./epochApi";
import { fetchStakeHistory } from "./stakeApi";

// Fetch all validators for the search function
export const fetchAllValidators = async () => {
  try {
    console.log("Fetching all validators...");
    
    // Use the existing fetchVoteAccounts function to get all validators
    const { current, delinquent } = await fetchVoteAccounts();
    
    // Combine current and delinquent validators
    const allValidators = [...current, ...delinquent].map(validator => ({
      name: validator.nodePubkey.slice(0, 6), // Placeholder name (in a real app, you'd fetch these from an API)
      votePubkey: validator.votePubkey,
      identity: validator.nodePubkey
    }));
    
    console.log(`Fetched ${allValidators.length} validators`);
    
    // Add some known validators with proper names
    const knownValidators = [
      { name: "Gojira", votePubkey: "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1", identity: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
      { name: "Solana Foundation", votePubkey: "GhBd6sozvfR9F2YwHVj2tAHbGyzQSuHxWNn5K8ofuYkx", identity: "7BJUCjD9sMQQ3LXeNZ3j8FQmJxMS1hC9t5S2g4gtLQBJ" },
      { name: "Jito", votePubkey: "E5ruSVxEKrAoXAcuMaAfcN5tX6bUYK6ouJcS5yAbs6Zh", identity: "88E5dLt2WQ6WNbQTXoZYwywickdGF9U5e3tbeYxQmHJx" },
      { name: "Marinade", votePubkey: "DQ7D6ZRtKbBSxCcAunEkoTzQhCBKLPdzTjJRoFBDkntj", identity: "HxkZUjg1RnCUTJ8j1Lc9J4xzQXGbQMY8kqbAMU4rMDKr" },
      { name: "Laine", votePubkey: "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF", identity: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiL" },
      { name: "GenesysGo", votePubkey: "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF", identity: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiL" },
      { name: "Chorus One", votePubkey: "CZ8HVPSQhtXHSsK1j2L5tYXHCb2qrPQ5re2xMYhSMUAg", identity: "67Xdd5GF5oYdGGGXK2L6YJ1syt97GXnGiM7m8ER2X6VP" },
      { name: "Figment", votePubkey: "FBmNp4VBze47nQ3J3qeMboPdQfqRJzKp9kK6wLu7rhCG", identity: "5n8KCdzqtvTnhJHJVi8jgEJYJ1GiSXRrN6YbZN15h6g5" },
      { name: "MF 64", votePubkey: "EuZ5JiQ2P2qjyRTQ5VqcJwPPt3z9cRC2gzAaVxVFiqvI", identity: "CG7zvuaN2x6ZcQKAMU6gehkLyEYEN9osYrZY4YJyVbCM" },
      { name: "Staking Facilities", votePubkey: "8LULGgNdsY6gNMmEcezWQSZvE3HCCccTuGAa3JMx8XkL", identity: "5gKtgyjCNCBvD5qHzNdVMQQgBXXqQMYnzyG4bsC6syKS" },
      { name: "P2P", votePubkey: "9NA5HZ3R2zz5Rjt6aBRgr1ZYwKJf1V9ndh9NnytRVVvt", identity: "Ft9LS8UFaD1Mi4mYnUVdmDFBMxpDjeMSKMbZSxHv2vCd" },
      { name: "Everstake", votePubkey: "RxH2oHLtW9P6y3GSWfXjjgfA4qP5MZrFzpUCxkVdLhY", identity: "CRzMxdyS56N2vkb55X5q155sSdVkjZhiFedWzzhvBXSN" },
      { name: "Certus One", votePubkey: "9SfKTdP5HLh3P4VP7eZ3houc5MP2ztGGJchKJ6U9XGbp", identity: "5vxoRv2P12q4K4cWPCJkvPjg1A4ZYANeFZdA2LCTV4uX" },
      // Add more known validators as needed
    ];
    
    // Replace any matching validators with the known ones that have proper names
    knownValidators.forEach(known => {
      const index = allValidators.findIndex(v => v.votePubkey === known.votePubkey);
      if (index >= 0) {
        allValidators[index] = known;
      } else {
        allValidators.push(known);
      }
    });
    
    return allValidators;
  } catch (error) {
    console.error("Error fetching validators:", error);
    toast.error("Failed to fetch validators");
    return [];
  }
};

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
export const fetchValidatorInfo = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorInfo | null> => {
  try {
    console.log(`Fetching validator info for ${votePubkey}...`);
    
    // Get vote accounts for basic validator info
    const { current, delinquent } = await fetchVoteAccounts();
    const validators = [...current, ...delinquent];
    const validator = validators.find(v => v.votePubkey === votePubkey);
    
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
    toast.error("Failed to fetch validator data.");
    return null;
  }
};

export const fetchValidatorMetrics = async (votePubkey = VALIDATOR_PUBKEY): Promise<ValidatorMetrics | null> => {
  try {
    console.log(`Fetching validator metrics for ${votePubkey}...`);
    
    const validatorInfo = await fetchValidatorInfo(votePubkey);
    
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
    toast.error("Failed to fetch validator metrics.");
    return null;
  }
};

// Re-export stake history function for compatibility
export { fetchStakeHistory };
