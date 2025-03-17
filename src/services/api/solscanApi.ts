
import axios from "axios";
import { toast } from "sonner";

// Function to fetch validator details from Solscan
export const fetchValidatorDetailsFromSolscan = async (votePubkey: string) => {
  try {
    // We'll parse Solscan HTML to extract the validator name and logo
    const response = await axios.get(`https://solscan.io/account/${votePubkey}`, {
      headers: {
        'Accept': 'text/html',
      }
    });
    
    console.log("Fetched Solscan page for validator:", votePubkey);
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
    console.error("Error fetching validator details from Solscan:", error);
    return { name: null, logo: null };
  }
};

// Function to enhance validator data with Solscan details
export const enhanceValidatorWithSolscanData = async (validators) => {
  const enhancedValidators = [...validators];
  
  // Limit to 5 concurrent requests to avoid being rate-limited
  const concurrentLimit = 5;
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
  }
  
  return enhancedValidators;
};
