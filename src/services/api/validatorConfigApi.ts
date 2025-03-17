
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
                memcmp: {
                  offset: 4,
                  bytes: "2"  // Filter for validator info accounts
                }
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
    
    // Use a simplified approach that doesn't rely on Buffer
    for (const account of data.result) {
      try {
        if (!account.account || !account.account.data || !account.account.data.parsed) {
          continue;
        }
        
        const parsedData = account.account.data.parsed;
        
        // Skip if we don't have what we need
        if (!parsedData.info || !parsedData.info.configData || !parsedData.info.configData.keys) {
          continue;
        }
        
        // The identity key should be in the first key (usually at index 0)
        const keys = parsedData.info.configData.keys;
        if (keys.length < 1) continue;
        
        const identityPubkey = keys[0].pubkey;
        
        // Extract the validator info JSON from the data
        const configData = parsedData.info.configData.configData;
        if (!configData) continue;
        
        try {
          // Parse the validator config JSON
          const validatorInfo = JSON.parse(configData);
          
          if (validatorInfo && validatorInfo.name) {
            validatorConfigs.push({
              name: validatorInfo.name,
              identity: identityPubkey,
              votePubkey: '',  // Will be matched later
              icon: validatorInfo.website || null
            });
            
            console.log(`Found validator with name: ${validatorInfo.name}`);
          }
        } catch (e) {
          console.error("Error parsing validator JSON:", e);
          continue;
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
