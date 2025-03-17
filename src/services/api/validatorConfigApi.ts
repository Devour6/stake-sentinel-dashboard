
import { toast } from "sonner";
import { RPC_ENDPOINT } from "./constants";
import { ValidatorSearchResult, ValidatorConfigData } from "./types";

// Function to fetch on-chain validator names and logos
export const fetchValidatorConfig = async (): Promise<ValidatorSearchResult[]> => {
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
    
    const validatorConfigs: ValidatorSearchResult[] = [];
    
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
          const keys = configData.keys.map((key: any) => key.pubkey);
          if (!keys || keys.length < 1) continue;
          
          // The identity key is always the first key
          const identityPubkey = keys[0];
          
          // Extract the JSON data
          let validatorInfo: ValidatorConfigData = {};
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
