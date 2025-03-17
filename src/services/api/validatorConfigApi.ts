
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
    
    for (const account of data.result) {
      try {
        if (!account.account || !account.account.data || !account.account.data.parsed) {
          continue;
        }
        
        const parsedData = account.account.data.parsed;
        
        // Skip if we don't have what we need
        if (!parsedData.info || !parsedData.info.configData || !parsedData.info.keys) {
          continue;
        }
        
        // The identity key should be in the first key (usually at index 0)
        const keys = parsedData.info.configData.keys;
        if (!keys || keys.length < 1) continue;
        
        const identityPubkey = keys[0].pubkey;
        if (!identityPubkey) continue;
        
        // Extract the validator info JSON from the data
        const configData = parsedData.info.configData.configData;
        if (!configData) continue;
        
        try {
          // Parse the validator config JSON
          let validatorInfo: ValidatorConfigData;
          
          // Handle the string format properly
          if (typeof configData === 'string') {
            // Clean up the data for parsing
            let cleanedData = configData;
            
            try {
              // Try to parse directly first
              validatorInfo = JSON.parse(cleanedData);
            } catch (e) {
              console.log("First parsing attempt failed, trying alternative method:", e);
              
              try {
                // Sometimes config data is double-encoded or has escape characters
                if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
                  // Remove enclosing quotes and handle escaped quotes
                  cleanedData = cleanedData.slice(1, -1).replace(/\\"/g, '"');
                }
                
                validatorInfo = JSON.parse(cleanedData);
              } catch (e2) {
                console.log("Second parsing attempt failed, trying another method:", e2);
                
                try {
                  // Try removing all backslashes and parse again
                  cleanedData = cleanedData.replace(/\\/g, '');
                  validatorInfo = JSON.parse(cleanedData);
                } catch (e3) {
                  console.log("All parsing attempts failed:", e3, "Raw data:", configData);
                  continue; // Skip this validator if we can't parse the data
                }
              }
            }
          } else if (typeof configData === 'object') {
            // If it's already an object, use it directly
            validatorInfo = configData;
          } else {
            continue; // Skip if data format is unexpected
          }
          
          // Only add validators with names
          if (validatorInfo && validatorInfo.name) {
            // Extract website or keybase for icon
            let icon = null;
            if (validatorInfo.website) {
              icon = validatorInfo.website;
            } else if (validatorInfo.keybaseUsername) {
              icon = `https://keybase.io/${validatorInfo.keybaseUsername}`;
            } else if (validatorInfo.iconUrl) {
              icon = validatorInfo.iconUrl;
            }
            
            validatorConfigs.push({
              name: validatorInfo.name,
              identity: identityPubkey,
              votePubkey: '', // Will be matched later with vote accounts
              icon: icon
            });
            
            console.log(`Found validator with name: ${validatorInfo.name}, identity: ${identityPubkey}`);
          }
        } catch (err) {
          console.error("Error processing validator data:", err);
          continue;
        }
      } catch (err) {
        console.error("Error processing validator account:", err);
        continue;
      }
    }
    
    console.log(`Successfully processed ${validatorConfigs.length} validator configs`);
    return validatorConfigs;
  } catch (error) {
    console.error("Error fetching validator configs:", error);
    toast.error("Failed to fetch validator information");
    return [];
  }
}
