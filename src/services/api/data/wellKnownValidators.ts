
// Well-known validators as a fallback mechanism
export const WELL_KNOWN_VALIDATORS = [
  { name: "Helius", votePubkey: "HeZU7mjJx9FFLX8ad4fErHhiTXNxwqLzW3AVUBCfXxT", identity: "7TMu26hC7sfyEqmA8aXGLLx66JD8WMuKQkExW2K8rfwx", icon: "https://helius.xyz", website: "https://helius.xyz" },
  { name: "Gojira", votePubkey: "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb", identity: "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw", icon: null, website: null },
  { name: "Solana Foundation", votePubkey: "GhBd6sozvfR9F2YwHVj2tAHbGyzQSuHxWNn5K8ofuYkx", identity: "7BJUCjD9sMQQ3LXeNZ3j8FQmJxMS1hC9t5S2g4gtLQBJ", icon: null, website: "https://solana.org" },
  { name: "Jito", votePubkey: "E5ruSVxEKrAoXAcuMaAfcN5tX6bUYK6ouJcS5yAbs6Zh", identity: "88E5dLt2WQ6WNbQTXoZYwywickdGF9U5e3tbeYxQmHJx", icon: null, website: "https://jito.network" },
  { name: "Marinade", votePubkey: "DQ7D6ZRtKbBSxCcAunEkoTzQhCBKLPdzTjJRoFBDkntj", identity: "HxkZUjg1RnCUTJ8j1Lc9J4xzQXGbQMY8kqbAMU4rMDKr", icon: null, website: "https://marinade.finance" },
  { name: "Laine", votePubkey: "9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF", identity: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiL", icon: null, website: "https://laine.capital" },
  { name: "GenesysGo", votePubkey: "4BXYNuSEqM5HLJYonvgwe2ZLQV1RAGmkZYsG9BV6vYVW", identity: "3xpDCC4XtxAUTgXBHyuNKkzU2HZU3p2NT2XuUWk5LKWr", icon: null, website: "https://genesysgo.com" },
  { name: "Chorus One", votePubkey: "CZ8HVPSQhtXHSsK1j2L5tYXHCb2qrPQ5re2xMYhSMUAg", identity: "67Xdd5GF5oYdGGGXK2L6YJ1syt97GXnGiM7m8ER2X6VP", icon: null, website: "https://chorus.one" },
  { name: "Figment", votePubkey: "FBmNp4VBze47nQ3J3qeMboPdQfqRJzKp9kK6wLu7rhCG", identity: "5n8KCdzqtvTnhJHJVi8jgEJYJ1GiSXRrN6YbZN15h6g5", icon: null, website: "https://figment.io" },
  { name: "MF 64", votePubkey: "EuZ5JiQ2P2qjyRTQ5VqcJwPPt3z9cRC2gzAaVxVFiqvI", identity: "CG7zvuaN2x6ZcQKAMU6gehkLyEYEN9osYrZY4YJyVbCM", icon: null, website: null },
  // Top validators that must be included
  { name: "Triton", votePubkey: "GoCwdN1C1WXXArrqoivMoaiqksR8QP79N1qoajbHrYG1", identity: "5GKFxHSZrJ4KgErXGNdXEJwvS59W2a2j59V3Xex6P3ow", icon: null, website: null },
  { name: "Blockdaemon", votePubkey: "GBU4rXNppvuYjUDuUHK9evta7aQ9G9567QH5ViVPjvFv", identity: "GBU4rXNppvuYjUDuUHK9evta7aQ9G9567QH5ViVPjvFv", icon: null, website: "https://blockdaemon.com" },
  { name: "Staking Facilities", votePubkey: "8LULGgNdsY6gNMmEcezWQSZvE3HCCccTuGAa3JMx8XkL", identity: "5gKtgyjCNCBvD5qHzNdVMQQgBXXqQMYnzyG4bsC6syKS", icon: null, website: "https://stakingfacilities.com" },
  { name: "P2P", votePubkey: "9NA5HZ3R2zz5Rjt6aBRgr1ZYwKJf1V9ndh9NnytRVVvt", identity: "Ft9LS8UFaD1Mi4mYnUVdmDFBMxpDjeMSKMbZSxHv2vCd", icon: null, website: "https://p2p.org" },
  { name: "Everstake", votePubkey: "RxH2oHLtW9P6y3GSWfXjjgfA4qP5MZrFzpUCxkVdLhY", identity: "CRzMxdyS56N2vkb55X5q155sSdVkjZhiFedWzzhvBXSN", icon: null, website: "https://everstake.one" },
  { name: "Certus One", votePubkey: "9SfKTdP5HLh3P4VP7eZ3houc5MP2ztGGJchKJ6U9XGbp", identity: "5vxoRv2P12q4K4cWPCJkvPjg1A4ZYANeFZdA2LCTV4uX", icon: null, website: null },
  { name: "Jump Crypto", votePubkey: "D8srGYyKYoXEyXfYHG3SahXjSUJxicFQYZKyXxJ7fGPf", identity: "DmRKm16KZDvSgwSfpPyejiFcQjZJ7N9myDmd7prXzLtY", icon: null, website: "https://jumpcrypto.com" },
  { name: "Staked", votePubkey: "51JBzSTU5rAM8gLAVQKgp4WoLsNmozTw1GOX39UpsJtU", identity: "5R1aUGVRYYrvkGzcxJJCDVxnB3sMrWcJgAopVi8Vynzc", icon: null, website: "https://staked.us" },
  { name: "Coinbase Cloud", votePubkey: "EH6VQ9oE6HRvxWYeAUG4GiZFpZ3vb7j2fGquAktTsRQJ", identity: "7PdkaCviHKVo8ouPDWYZyt3VxQMxCTo9ZXYnGdKZj8J2", icon: null, website: "https://coinbase.com/cloud" },
  { name: "Binance Staking", votePubkey: "DMqoDi7N76DNS7dN2KYc8jYfY2Jg3VfdQyTMNYTmgX6t", identity: "dHchUWFdQzBTkBqwssCMipNLu8h3zuZh4gXNvqMsX9g", icon: null, website: "https://binance.com" },
  { name: "OKX", votePubkey: "HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr", identity: "11233QaJEMWWJC5VhYL8FeKWu7J7Z3CSZ1WCnB2wUqip", icon: null, website: "https://okx.com" },
  { name: "Kraken", votePubkey: "5NwYJ7pqtAzuJaQHQAhxMZHXG57VTqas3zXxmZQiuE2V", identity: "7VGU4ZwR1e1AFekqbqv2gvjeg47e1PwMPm4BfLtYE8x3", icon: null, website: "https://kraken.com" },
  { name: "Anchorage Digital", votePubkey: "4qWoqt71j161Gg4YnYKEGrn5p7MjhLdKzzWmYDBxpwFE", identity: "GgUcGMbFY1FbRCpyMvZajnbfkEkJZgHXYSZwKxUTN7K8", icon: null, website: "https://anchorage.com" },
  { name: "ShineDAO", votePubkey: "8SQEcP4FaYQySktNQeyxF3w8pvArx3oMEh7fPrzkN9pu", identity: "9NFpWc1TJCne4xnGgJZHmyFNMnMeRkXv4FCAcqTs63W4", icon: null, website: null },
  { name: "Dokia Capital", votePubkey: "H3GhqPMwvGLdxWg3QJGjXDSkFSJCsFk3Tx9pUTsh2h4W", identity: "dkCNBsnRkZBdQkAgdZxdbwJh6BY6VEK9hmZJ2rLmANv", icon: null, website: null },
  { name: "Forbole", votePubkey: "AkVoTV59mjJ8r5KNrAFUtUhcH1RZ8Mmd7sDX3jJLxntg", identity: "CHnhV7WR5hJXLQNgvg3rx2TzpSeXmYC8QMkfvxvDQk8t", icon: null, website: "https://forbole.com" },
  { name: "Stake.Fish", votePubkey: "D9CfRZohsSL2JhgQFGvRuu5q4wkuj6REu8GoGHYRN8My", identity: "AUgLtpPVvxnmIRUGDLqVGcnsX54gwuJ6JFij6stGECn2", icon: null, website: "https://stake.fish" },
  { name: "Alameda Research", votePubkey: "GGiiHefWKXvXAdPwrw1asAKDY1fLcZZ6YGKZQkPYPMPr", identity: "37LWEXHXrCYBKf7S5SkKGrBm9isUhd4DyJ3NCchzWNyF", icon: null, website: null },
  { name: "Coinlist", votePubkey: "6WL8u9FV3RmwvmWmZ5tTQxYKJ38Cf8RWdBcfnqG6eTXY", identity: "Gj9RdU3AvEBKLmsX3z39Dysso2VThRckvDRTURMyUuE2", icon: null, website: "https://coinlist.co" },
  { name: "melea", votePubkey: "DRp1Scxvq4ZoNbgHpNNTYVqsEja9jdA9bqUoFG7kWK6B", identity: "6Qr5qJ5sEPW3QymKcPVacKEGkvg1OZQQnEnTHRJkE9Bu", icon: null, website: "https://melea.org" },
  { name: "BL Staking", votePubkey: "EVd8FFVB54svYdZdG6hH4F4hTbqre5mpQ7XyF5rKUmes", identity: "Dm7qJrYWTLvk3dYX7UBCjKPBKpzQTL4wdGpwMNpcNBi2", icon: null, website: null },
  { name: "Chainflow", votePubkey: "BLVJg8zgQnwVhxrxbRDzwXvcwsKzPLTQYWxo6V7W8jxJ", identity: "3TnVxcBwxASbCmeJ4mYVR7a9h9an94NvTY4RP8KVLCP7", icon: null, website: "https://chainflow.io" },
  { name: "Stakeconomy", votePubkey: "B24WAtQQyUrY3hLXKUMnCNgMvk9WR8xuU7uMYeJMYWQn", identity: "EYgUfznL7jQ2c3JCXgxc2s2qxsCxw9nxYJ7YVGKBT6R", icon: null, website: "https://stakeconomy.com" },
  { name: "mcf", votePubkey: "7mmRxJNttYcJVNsJmiLjTHYmNDt8xn3fQ8JnaNVahKUk", identity: "HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1", icon: null, website: null },
  { name: "Cosmostation", votePubkey: "9mbQ9mrRjBGiUVnz9Tdf7PuAkWomw3GLZ6Sup3R93Gf8", identity: "7y1f6Mih1gJhrpzPNSMDyTQd12MFQVvecUDHHY5yz2P1", icon: null, website: "https://cosmostation.io" },
  { name: "HashQuark", votePubkey: "FdFYHNCyTJYeJ7MUhyjuSFnUy5RydfyZ6pjx7CDeBYMS", identity: "FiPmNbK38XWzFZhfBzPHRazh689gxZ4gqEDL8qEUQ8YV", icon: null, website: "https://hashquark.io" },
  { name: "Blockscope", votePubkey: "HrXWqaKF2NJUc5RUowzYJ5yX9y6AeZbJaAZdDtSZ8n6W", identity: "4t9em1dsapgBxhUhUhUJcKFHgwPJNnWDrNwAGJqqUQmPvY", icon: null, website: null },
  { name: "01node.com", votePubkey: "DP7V5gZctCzBmf6DqsQXvBYrqWGUBZoufxUKzx5MgMew", identity: "DJv6YQV2tSpi7cMxJ3mCdYx9ySXwK6HdTF5BoXBfWVoW", icon: null, website: "https://01node.com" },
  { name: "Solstake", votePubkey: "49AqLYbpgHHdb3qWyPMAaZmwLVNTNsbxmBgVZdhoBQfF", identity: "GnLdRq6PFC4SX5fPRFbCsQEkUNrHr9mAgVXr1kDMU4qQ", icon: null, website: "https://solstake.io" },
  { name: "Wanderer", votePubkey: "BxTUwfMiokzimVDLDupGfVPmWXfLSGVpkGr9TUmetn6b", identity: "BeGmyi98V9U8XrtCVo9KTgLNtnn1TjKmyVKKg7BuWSL", icon: null, website: null },
  { name: "NTT DATA", votePubkey: "2qvEqds4ZVnkEpbiz8Hq3xt3UjRoGXGEaSKgzqb4D8J9", identity: "3oVexC5D5UwPTECRb142K6nU52HtJx1NHCY7+4aHGH+q", icon: null, website: "https://nttdata.com" },
  { name: "P2P.ORG", votePubkey: "FC8bhGCso5sJRxGXT5JbMDm7J9KaRvQzSXYMtongBZ33", identity: "6kDyGMHbuGGHvuq71DyqR6V8N4maLBx8pGiA2L2aKv3R", icon: null, website: "https://p2p.org" },
  { name: "Kysenpool.io | Staking", votePubkey: "5NH47Zk9NAzfbtqNpUtn8CQgNZeZE88aa2NRpfe7DyTD", identity: "CjhKCjNC1WUgBjAGst3D2XmSsWHvt3zGasasmogPTY6J", icon: null, website: "https://kysenpool.io" },
  { name: "InfStones", votePubkey: "9HSjDs6MBGZrZRJBLnCqrRAVxpwq6JQW3PrBa6qEsTYF", identity: "DbF7QuF8NNWgV3Vj6Z8qaHvZj6QZv9Xm5t3EptfzN76d", icon: null, website: "https://infstones.com" },
  // Additional Chorus One entry
  { name: "Chorus One", votePubkey: "EoK33UHJHPRodKxaVsU5pKxuGCNiLBW4GK7QKUMpHP9s", identity: "FQsr4BVWy8H1qo3b1Cv79bZ5NcbQwiKeCfbNm9ducpvw", icon: null, website: "https://chorus.one" },
  { name: "Chainode Tech (node)", votePubkey: "12oWRNKrW8eXvVxLX7cMHWrnJMqZaZK8gxLNkFgbVf3n", identity: "FHf7WtMZLkNYq7NGGBAF78ZKzKZ7oBbGbAEZR5c6J8eZ", icon: null, website: "https://chainode.tech" },
  { name: "POS Bakerz", votePubkey: "3SpZRJQcQ4rJynvCGNRBbQjkHGXEMpVsJvTWKvR17gZN", identity: "8c5ZTPGQxEQyZ1Kg7vRGZmQVvAwmRmeGjBPE3VnZjxTh", icon: null, website: "https://posbakerz.com" },
  { name: "Gunstar DAO", votePubkey: "5kgFd4N82ZbX8HpmCpX3kRgLTaBcNTkpmJmzigpzLiS6", identity: "8WwMJ2X5RYvbiXqLaRWv7tQJbJnHWY2LFxsKCVwuTVUc", icon: null, website: null }
];

// Additional well-known validators to ensure we have the major ones covered
export const ADDITIONAL_VALIDATORS = [
  { name: "Helius", votePubkey: "HeZU7mjJx9FFLX8ad4fErHhiTXNxwqLzW3AVUBCfXxT", identity: "7TMu26hC7sfyEqmA8aXGLLx66JD8WMuKQkExW2K8rfwx", icon: "https://helius.xyz", website: "https://helius.xyz" },
  { name: "Triton", votePubkey: "GoCwdN1C1WXXArrqoivMoaiqksR8QP79N1qoajbHrYG1", identity: "5GKFxHSZrJ4KgErXGNdXEJwvS59W2a2j59V3Xex6P3ow", icon: null, website: null },
  { name: "Blockdaemon", votePubkey: "GBU4rXNppvuYjUDuUHK9evta7aQ9G9567QH5ViVPjvFv", identity: "GBU4rXNppvuYjUDuUHK9evta7aQ9G9567QH5ViVPjvFv", icon: null, website: "https://blockdaemon.com" },
  { name: "Gojira", votePubkey: "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb", identity: "gojir4WnhS7VS1JdbnanJMzaMfr4UD7KeX1ixWAHEmw", icon: null, website: null },
  { name: "P2P Validator", votePubkey: "D52Q6Ap8RVMw1EvJYTdEABP6M5SPg98aToMcqw7KVLD9", identity: "DRpbCBMxVnDK7maPM5tGv6MvG3QC8kLZ6RqTMV5LJcQzRW", icon: null, website: "https://p2p.org" },
  { name: "Validators.app", votePubkey: "8g4iBKx35wPg1DYALMnCTVYBFbFBvhgKawUzJJnnfqT3", identity: "DTCytRdyR2RXn7ApVzRZtEQYSGgm8cXWH7ZnfLKgYGT7", icon: null, website: "https://validators.app" },
  { name: "Solflare", votePubkey: "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1", identity: "EZKQZTstC8XGxrGPgZ4Lb4UtgzEf2GfRgj3MVgYnzZXy", icon: null, website: "https://solflare.com" },
  { name: "Shinobi Systems", votePubkey: "wWf94sVnaXHzBYrePsRUyesq6ofndocfBmKRcmJRyuD", identity: "7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECh", icon: null, website: "https://shinobi.systems" },
];

// Combine and export both lists
export const getAllWellKnownValidators = () => {
  const combinedList = [...WELL_KNOWN_VALIDATORS, ...ADDITIONAL_VALIDATORS];
  // Remove duplicates by vote pubkey
  return combinedList.filter(
    (v, i, a) => a.findIndex(t => t.votePubkey === v.votePubkey) === i
  );
};
