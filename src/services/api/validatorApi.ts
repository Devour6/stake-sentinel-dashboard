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
    
    // We'll focus on current validators and ignore delinquent ones
    const allValidators = [...current].map(validator => ({
      name: null, // We'll fill this with on-chain name data
      votePubkey: validator.votePubkey,
      identity: validator.nodePubkey,
      activatedStake: lamportsToSol(validator.activatedStake),
      commission: validator.commission,
      delinquent: false
    }));
    
    console.log(`Fetched ${allValidators.length} active validators`);
    
    // Fetch on-chain validator info for proper names and logos
    try {
      const onChainValidators = await fetchValidatorConfig();
      
      // Update validators with proper names from on-chain data
      allValidators.forEach(validator => {
        const onChainInfo = onChainValidators.find(v => 
          v.identity === validator.identity || 
          v.votePubkey === validator.votePubkey
        );
        
        if (onChainInfo) {
          validator.name = onChainInfo.name;
          validator.icon = onChainInfo.icon;
        }
      });
      
      console.log("Updated validators with on-chain names");
    } catch (error) {
      console.error("Error fetching validator on-chain info:", error);
      // Continue with fallback names if this fails
    }
    
    // Add well-known validators with proper names if they weren't already in the list
    const knownValidators = [
      { name: "Gojira", votePubkey: "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1", identity: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Solana Foundation", votePubkey: "GhBd6sozvfR9F2YwHVj2tAHbGyzQSuHxWNn5K8ofuYkx", identity: "7BJUCjD9sMQQ3LXeNZ3j8FQmJxMS1hC9t5S2g4gtLQBJ", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Jito", votePubkey: "E5ruSVxEKrAoXAcuMaAfcN5tX6bUYK6ouJcS5yAbs6Zh", identity: "88E5dLt2WQ6WNbQTXoZYwywickdGF9U5e3tbeYxQmHJx", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Marinade", votePubkey: "DQ7D6ZRtKbBSxCcAunEkoTzQhCBKLPdzTjJRoFBDkntj", identity: "HxkZUjg1RnCUTJ8j1Lc9J4xzQXGbQMY8kqbAMU4rMDKr", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Laine", votePubkey: "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF", identity: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiL", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "GenesysGo", votePubkey: "4BXYNuSEqM5HLJYonvgwe2ZLQV1RAGmkZYsG9BV6vYVW", identity: "3xpDCC4XtxAUTgXBHyuNKkzU2HZU3p2NT2XuUWk5LKWr", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Chorus One", votePubkey: "CZ8HVPSQhtXHSsK1j2L5tYXHCb2qrPQ5re2xMYhSMUAg", identity: "67Xdd5GF5oYdGGGXK2L6YJ1syt97GXnGiM7m8ER2X6VP", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Figment", votePubkey: "FBmNp4VBze47nQ3J3qeMboPdQfqRJzKp9kK6wLu7rhCG", identity: "5n8KCdzqtvTnhJHJVi8jgEJYJ1GiSXRrN6YbZN15h6g5", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "MF 64", votePubkey: "EuZ5JiQ2P2qjyRTQ5VqcJwPPt3z9cRC2gzAaVxVFiqvI", identity: "CG7zvuaN2x6ZcQKAMU6gehkLyEYEN9osYrZY4YJyVbCM", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Staking Facilities", votePubkey: "8LULGgNdsY6gNMmEcezWQSZvE3HCCccTuGAa3JMx8XkL", identity: "5gKtgyjCNCBvD5qHzNdVMQQgBXXqQMYnzyG4bsC6syKS", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "P2P", votePubkey: "9NA5HZ3R2zz5Rjt6aBRgr1ZYwKJf1V9ndh9NnytRVVvt", identity: "Ft9LS8UFaD1Mi4mYnUVdmDFBMxpDjeMSKMbZSxHv2vCd", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Everstake", votePubkey: "RxH2oHLtW9P6y3GSWfXjjgfA4qP5MZrFzpUCxkVdLhY", identity: "CRzMxdyS56N2vkb55X5q155sSdVkjZhiFedWzzhvBXSN", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Certus One", votePubkey: "9SfKTdP5HLh3P4VP7eZ3houc5MP2ztGGJchKJ6U9XGbp", identity: "5vxoRv2P12q4K4cWPCJkvPjg1A4ZYANeFZdA2LCTV4uX", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Blockdaemon", votePubkey: "3PdGUBtJK2k1FiMdX3QzEKMYZFcbgn7rGd3QMt5hPuHZ", identity: "EX73A5dC2LRSEGPvpWyeRvVxbH5JM7hf4rkBUxKcT3fj", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Jump Crypto", votePubkey: "D8srGYyKYoXEyXfYHG3SahXjSUJxicFQYZKyXxJ7fGPf", identity: "DmRKm16KZDvSgwSfpPyejiFcQjZJ7N9myDmd7prXzLtY", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Staked", votePubkey: "51JBzSTU5rAM8gLAVQKgp4WoLsNmozTw1GOX39UpsJtU", identity: "5R1aUGVRYYrvkGzcxJJCDVxnB3sMrWcJgAopVi8Vynzc", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Coinbase Cloud", votePubkey: "EH6VQ9oE6HRvxWYeAUG4GiZFpZ3vb7j2fGquAktTsRQJ", identity: "7PdkaCviHKVo8ouPDWYZyt3VxQMxCTo9ZXYnGdKZj8J2", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Binance Staking", votePubkey: "DMqoDi7N76DNS7dN2KYc8jYfY2Jg3VfdQyTMNYTmgX6t", identity: "dHchUWFdQzBTkBqwssCMipNLu8h3zuZh4gXNvqMsX9g", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "OKX", votePubkey: "HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr", identity: "11233QaJEMWWJC5VhYL8FeKWu7J7Z3CSZ1WCnB2wUqip", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Kraken", votePubkey: "5NwYJ7pqtAzuJaQHQAhxMZHXG57VTqas3zXxmZQiuE2V", identity: "7VGU4ZwR1e1AFekqbqv2gvjeg47e1PwMPm4BfLtYE8x3", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Anchorage Digital", votePubkey: "4qWoqt71j161Gg4YnYKEGrn5p7MjhLdKzzWmYDBxpwFE", identity: "GgUcGMbFY1FbRCpyMvZajnbfkEkJZgHXYSZwKxUTN7K8", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "ShineDAO", votePubkey: "8SQEcP4FaYQySktNQeyxF3w8pvArx3oMEh7fPrzkN9pu", identity: "9NFpWc1TJCne4xnGgJZHmyFNMnMeRkXv4FCAcqTs63W4", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Dokia Capital", votePubkey: "H3GhqPMwvGLdxWg3QJGjXDSkFSJCsFk3Tx9pUTsh2h4W", identity: "dkCNBsnRkZBdQkAgdZxdbwJh6BY6VEK9hmZJ2rLmANv", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Forbole", votePubkey: "AkVoTV59mjJ8r5KNrAFUtUhcH1RZ8Mmd7sDX3jJLxntg", identity: "CHnhV7WR5hJXLQNgvg3rx2TzpSeXmYC8QMkfvxvDQk8t", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Stake.Fish", votePubkey: "D9CfRZohsSL2JhgQFGvRuu5q4wkuj6REu8GoGHYRN8My", identity: "AUgLtpPVvxnmIRUGDLqVGcnsX54gwuJ6JFij6stGECn2", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Alameda Research", votePubkey: "GGiiHefWKXvXAdPwrw1asAKDY1fLcZZ6YGKZQkPYPMPr", identity: "37LWEXHXrCYBKf7S5SkKGrBm9isUhd4DyJ3NCchzWNyF", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Coinlist", votePubkey: "6WL8u9FV3RmwvmWmZ5tTQxYKJ38Cf8RWdBcfnqG6eTXY", identity: "Gj9RdU3AvEBKLmsX3z39Dysso2VThRckvDRTURMyUuE2", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "melea", votePubkey: "DRp1Scxvq4ZoNbgHpNNTYVqsEja9jdA9bqUoFG7kWK6B", identity: "6Qr5qJ5sEPW3QymKcPVacKEGkvg1OZQQnEnTHRJkE9Bu", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "BL Staking", votePubkey: "EVd8FFVB54svYdZdG6hH4F4hTbqre5mpQ7XyF5rKUmes", identity: "Dm7qJrYWTLvk3dYX7UBCjKPBKpzQTL4wdGpwMNpcNBi2", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Chainflow", votePubkey: "BLVJg8zgQnwVhxrxbRDzwXvcwsKzPLTQYWxo6V7W8jxJ", identity: "3TnVxcBwxASbCmeJ4mYVR7a9h9an94NvTY4RP8KVLCP7", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Stakeconomy", votePubkey: "B24WAtQQyUrY3hLXKUMnCNgMvk9WR8xuU7uMYeJMYWQn", identity: "EYgUfznL7jQ2c3JCXgxc2s2qxsCxw9nxYJ7YVGKBT6R", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "mcf", votePubkey: "7mmRxJNttYcJVNsJmiLjTHYmNDt8xn3fQ8JnaNVahKUk", identity: "HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Cosmostation", votePubkey: "9mbQ9mrRjBGiUVnz9Tdf7PuAkWomw3GLZ6Sup3R93Gf8", identity: "7y1f6Mih1gJhrpzPNSMDyTQd12MFQVvecUDHHY5yz2P1", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "HashQuark", votePubkey: "FdFYHNCyTJYeJ7MUhyjuSFnUy5RydfyZ6pjx7CDeBYMS", identity: "FiPmNbK38XWzFZhfBzPHRazh689gxZ4gqEDL8qEUQ8YV", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Blockscope", votePubkey: "HrXWqaKF2NJUc5RUowzYJ5yX9y6AeZbJaAZdDtSZ8n6W", identity: "4t9em1dsapgBxhUhUJcKFHgwPJNnWDrNwAGJqqUQmPvY", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "01node.com", votePubkey: "DP7V5gZctCzBmf6DqsQXvBYrqWGUBZoufxUKzx5MgMew", identity: "DJv6YQV2tSpi7cMxJ3mCdYx9ySXwK6HdTF5BoXBfWVoW", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Solstake", votePubkey: "49AqLYbpgHHdb3qWyPMAaZmwLVNTNsbxmBgVZdhoBQfF", identity: "GnLdRq6PFC4SX5fPRFbCsQEkUNrHr9mAgVXr1kDMU4qQ", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Wanderer", votePubkey: "BxTUwfMiokzimVDLDupGfVPmWXfLSGVpkGr9TUmetn6b", identity: "BeGmyi98V9U8XrtCVo9KTgLNtnn1TjKmyVKKg7BuWSL", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "NTT DATA", votePubkey: "2qvEqds4ZVnkEpbiz8Hq3xt3UjRoGXGEaSKgzqb4D8J9", identity: "3oVexC5D5UwPTECRb142K6nU52HtJx1NHCY7+4aHGH+q", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "P2P.ORG", votePubkey: "FC8bhGCso5sJRxGXT5JbMDm7J9KaRvQzSXYMtongBZ33", identity: "6kDyGMHbuGGHvuq71DyqR6V8N4maLBx8pGiA2L2aKv3R", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Kysenpool.io | Staking", votePubkey: "5NH47Zk9NAzfbtqNpUtn8CQgNZeZE88aa2NRpfe7DyTD", identity: "CjhKCjNC1WUgBjAGst3D2XmSsWHvt3zGasasmogPTY6J", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "InfStones", votePubkey: "9HSjDs6MBGZrZRJBLnCqrRAVxpwq6JQW3PrBa6qEsTYF", identity: "DbF7QuF8NNWgV3Vj6Z8qaHvZj6QZv9Xm5t3EptfzN76d", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Chorus One", votePubkey: "EoK33UHJHPRodKxaVsU5pKxuGCNiLBW4GK7QKUMpHP9s", identity: "FQsr4BVWy8H1qo3b1Cv79bZ5NcbQwiKeCfbNm9ducpvw", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Chainode Tech (node)", votePubkey: "12oWRNKrW8eXvVxLX7cMHWrnJMqZaZK8gxLNkFgbVf3n", identity: "FHf7WtMZLkNYq7NGGBAF78ZKzKZ7oBbGbAEZR5c6J8eZ", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "POS Bakerz", votePubkey: "3SpZRJQcQ4rJynvCGNRBbQjkHGXEMpVsJvTWKvR17gZN", identity: "8c5ZTPGQxEQyZ1Kg7vRGZmQVvAwmRmeGjBPE3VnZjxTh", icon: null, activatedStake: 0, commission: 10, delinquent: false },
      { name: "Gunstar DAO", votePubkey: "5kgFd4N82ZbX8HpmCpX3kRgLTaBcNTkpmJmzigpzLiS6", identity: "8WwMJ2X5RYvbiXqLaRWv7tQJbJnHWY2LFxsKCVwuTVUc", icon: null, activatedStake: 0, commission: 10, delinquent: false }
    ];
    
    // Add known validators if not already present, or update their info
    knownValidators.forEach(known => {
      const index = allValidators.findIndex(v => v.votePubkey === known.votePubkey);
      if (index >= 0) {
        // Update name if on-chain name wasn't found
        if (!allValidators[index].name) {
          allValidators[index].name = known.name;
        }
      } else {
        allValidators.push(known);
      }
    });
    
    // Filter out validators without names
    const namedValidators = allValidators.filter(v => v.name);
    
    // Sort by stake amount (highest first)
    namedValidators.sort((a, b) => (b.activatedStake || 0) - (a.activatedStake || 0));
    
    console.log(`Returning ${namedValidators.length} named validators for search`);
    return namedValidators;
  } catch (error) {
    console.error("Error fetching validators:", error);
    toast.error("Failed to fetch validators");
    return [];
  }
};

// Function to fetch on-chain validator names and logos
export const fetchValidatorConfig = async () => {
  try {
    console.log("Fetching on-chain validator config...");
    
    // Query the validator info accounts from the Config program
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'validator-info',
        method: 'getProgramAccounts',
        params: [
          'Config1111111111111111111111111111111111111',
          {
            commitment: "confirmed",
            encoding: "jsonParsed",
            filters: [
              {
                dataSize: 566 // Filter for validator info accounts
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!data.result || !Array.isArray(data.result)) {
      console.error("Invalid response format:", data);
      return [];
    }
    
    console.log(`Received ${data.result.length} validator config accounts`);
    
    const validatorConfigs = [];
    
    for (const account of data.result) {
      try {
        if (!account.account || !account.account.data || !account.account.data.parsed) {
          continue;
        }
        
        const info = account.account.data.parsed;
        
        // Extract the keys and values
        if (info.type === "validatorInfo" && info.info && info.info.configData) {
          const configData = info.info.configData;
          
          // Extract keys
          const keys = configData.keys.map(key => key.pubkey);
          if (!keys || keys.length < 1) continue;
          
          // The identity key is always the first key
          const identityPubkey = keys[0];
          
          // Extract the JSON data
          let validatorInfo = {};
          try {
            if (configData.value) {
              validatorInfo = JSON.parse(configData.value);
            }
          } catch (e) {
            console.error("Error parsing validator info JSON:", e);
            continue;
          }
          
          if (validatorInfo.name) {
            validatorConfigs.push({
              name: validatorInfo.name,
              identity: identityPubkey,
              votePubkey: validatorInfo.keybaseUsername || '',
              icon: validatorInfo.website || null
            });
          }
        }
      } catch (err) {
        console.error("Error processing validator config account:", err);
        continue;
      }
    }
    
    console.log(`Successfully processed ${validatorConfigs.length} validator configs`);
    return validatorConfigs;
  } catch (error) {
    console.error("Error fetching validator configs:", error);
    return [];
  }
}

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
