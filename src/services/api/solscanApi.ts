
import axios from "axios";
import { toast } from "sonner";

// Function to fetch validator details from Solscan
export const fetchValidatorDetailsFromSolscan = async (votePubkey: string) => {
  try {
    console.log("Fetching Solscan page for validator:", votePubkey);
    
    // Simulate a delay to avoid rate limiting during development
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Try to fetch from Solscan directly
      const response = await axios.get(`https://solscan.io/account/${votePubkey}`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      const html = response.data;
      
      // Extract validator name - look for pattern "[Validator Name] vote account"
      let validatorName = null;
      const nameRegex = /<title>(.*?) vote account \| Solscan<\/title>/i;
      const nameMatch = html.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        validatorName = nameMatch[1].trim();
        console.log("Extracted validator name:", validatorName);
      }
      
      // Extract validator logo - look for the logo URL in the HTML
      let logoUrl = null;
      const logoRegex = /<img[^>]*class="[^"]*avatar[^"]*"[^>]*src="([^"]+)"/i;
      const logoMatch = html.match(logoRegex);
      if (logoMatch && logoMatch[1]) {
        logoUrl = logoMatch[1].trim();
        console.log("Extracted validator logo URL:", logoUrl);
      }
      
      return { name: validatorName, logo: logoUrl };
    } catch (error) {
      console.error("Error fetching from Solscan directly:", error);
      
      // Fallback to well-known validators if direct fetch fails
      // This is a development workaround - in production you'd use a proper backend proxy
      const wellKnownValidators = {
        'goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb': { 
          name: 'Gojira', 
          logo: '/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png' 
        },
        'he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk': { 
          name: 'Helius', 
          logo: 'https://raw.githubusercontent.com/helius-labs/helius-assets/master/helius-icon.png' 
        },
        'GoCwdN1C1WXXArrqoivMoaiqksR8QP79N1qoajbHrYG1': { 
          name: 'Triton', 
          logo: 'https://triton.one/wp-content/uploads/fbrfg/apple-touch-icon.png'
        },
        'HeZU7mjJx9FFLX8ad4fErHhiTXNxwqLzW3AVUBCfXxT': {
          name: 'Helius',
          logo: 'https://raw.githubusercontent.com/helius-labs/helius-assets/master/helius-icon.png'
        },
        // Add more well-known validators as needed
      };
      
      if (wellKnownValidators[votePubkey]) {
        console.log("Using cached validator data for:", votePubkey);
        return wellKnownValidators[votePubkey];
      }
      
      // For unknown validators, construct a name from the vote pubkey
      const shortPubkey = `${votePubkey.substring(0, 6)}...${votePubkey.substring(votePubkey.length - 4)}`;
      return { name: `Validator ${shortPubkey}`, logo: null };
    }
  } catch (error) {
    console.error("Error fetching validator details from Solscan:", error);
    return { name: null, logo: null };
  }
};

// Function to enhance validator data with Solscan details
export const enhanceValidatorWithSolscanData = async (validators) => {
  const enhancedValidators = [...validators];
  
  // Limit to 3 concurrent requests to avoid being rate-limited
  const concurrentLimit = 3;
  const chunks = [];
  
  for (let i = 0; i < enhancedValidators.length; i += concurrentLimit) {
    chunks.push(enhancedValidators.slice(i, i + concurrentLimit));
  }
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (validator) => {
      try {
        if (!validator.name || validator.name.startsWith('Validator ')) {
          const details = await fetchValidatorDetailsFromSolscan(validator.votePubkey);
          if (details.name) {
            validator.name = details.name;
          }
          if (details.logo) {
            validator.icon = details.logo;
          }
        }
      } catch (error) {
        console.error(`Error enhancing validator ${validator.votePubkey}:`, error);
      }
    }));
    
    // Add a small delay between chunks to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return enhancedValidators;
};
