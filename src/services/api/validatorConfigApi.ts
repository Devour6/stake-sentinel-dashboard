
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
            encoding: "base64",
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
        if (!account.account || !account.account.data) {
          continue;
        }
        
        const base64Data = account.account.data[0];
        
        // Skip accounts with no data
        if (!base64Data) continue;
        
        // Decode base64 data
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Skip if too small
        if (buffer.length < 100) continue;
        
        // The identity key starts at position 8 (32 bytes)
        const identityPubkey = buffer.slice(8, 40).toString('base64');
        
        // The actual JSON data is after the keys at the end of the data
        // Try to find the start of the JSON data
        let jsonStart = 45; // Start position after the identity key
        
        // Find the JSON start position (usually after some null bytes)
        while (jsonStart < buffer.length && buffer[jsonStart] !== 123) { // 123 is '{'
          jsonStart++;
        }
        
        if (jsonStart >= buffer.length) continue;
        
        // Extract JSON
        try {
          const jsonData = buffer.slice(jsonStart).toString('utf8');
          const validatorInfo = JSON.parse(jsonData);
          
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
          // Skip invalid JSON
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
