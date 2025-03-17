
import axios from "axios";
import { toast } from "sonner";
import { getAllWellKnownValidators } from "./data/wellKnownValidators";

// Function to fetch validator details from Solscan
export const fetchValidatorDetailsFromSolscan = async (votePubkey: string) => {
  try {
    console.log("Fetching details for validator:", votePubkey);
    
    // Check if it's in our well-known validators list first
    const wellKnownValidators = getAllWellKnownValidators();
    const knownValidator = wellKnownValidators.find(v => v.votePubkey === votePubkey);
    
    if (knownValidator && knownValidator.name) {
      console.log("Found validator in well-known list:", knownValidator.name);
      return { 
        name: knownValidator.name, 
        logo: knownValidator.icon || null,
        website: knownValidator.website || null
      };
    }
    
    // Try to fetch from alternative sources
    try {
      // Try to fetch from Stakewiz API (more reliable than direct scraping)
      const stakewizResponse = await axios.get(
        `https://api.stakewiz.com/validator/${votePubkey}`,
        { timeout: 5000 }
      );
      
      if (stakewizResponse.data) {
        console.log("Retrieved validator data from Stakewiz API");
        const data = stakewizResponse.data;
        return {
          name: data.name || null,
          logo: data.image || null,
          website: data.website || null
        };
      }
    } catch (stakewizError) {
      console.log("Could not fetch from Stakewiz API, trying Solscan scraping");
    }
    
    // If Stakewiz fails, try Solscan direct scraping as fallback
    try {
      const response = await axios.get(`https://solscan.io/account/${votePubkey}`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 8000
      });
      
      const html = response.data;
      
      // Extract validator name - look for pattern "[Validator Name] vote account"
      let validatorName = null;
      const nameRegex = /<title>(.*?) vote account \| Solscan<\/title>/i;
      const nameMatch = html.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        validatorName = nameMatch[1].trim();
        console.log("Extracted validator name from Solscan:", validatorName);
      }
      
      // Extract validator logo
      let logoUrl = null;
      const logoRegex = /<img[^>]*class="[^"]*avatar[^"]*"[^>]*src="([^"]+)"/i;
      const logoMatch = html.match(logoRegex);
      if (logoMatch && logoMatch[1]) {
        logoUrl = logoMatch[1].trim();
        console.log("Extracted validator logo URL from Solscan:", logoUrl);
      }
      
      // Extract website if available
      let website = null;
      const websiteRegex = /Website<\/div><div[^>]*><a[^>]*href="([^"]+)"/i;
      const websiteMatch = html.match(websiteRegex);
      if (websiteMatch && websiteMatch[1]) {
        website = websiteMatch[1].trim();
        console.log("Extracted validator website from Solscan:", website);
      }
      
      return { 
        name: validatorName, 
        logo: logoUrl,
        website: website
      };
    } catch (solscanError) {
      console.error("Error fetching from Solscan:", solscanError);
      
      // Create a fallback name from the vote pubkey
      const shortPubkey = `${votePubkey.substring(0, 6)}...${votePubkey.substring(votePubkey.length - 4)}`;
      return { 
        name: `Validator ${shortPubkey}`, 
        logo: null,
        website: null
      };
    }
  } catch (error) {
    console.error("Error fetching validator details:", error);
    const shortPubkey = `${votePubkey.substring(0, 6)}...${votePubkey.substring(votePubkey.length - 4)}`;
    return { 
      name: `Validator ${shortPubkey}`, 
      logo: null,
      website: null
    };
  }
};

// Function to enhance validator data with details
export const enhanceValidatorWithSolscanData = async (validators) => {
  const enhancedValidators = [...validators];
  
  // Limit to 2 concurrent requests to avoid being rate-limited
  const concurrentLimit = 2;
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
          if (details.website) {
            validator.website = details.website;
          }
        }
      } catch (error) {
        console.error(`Error enhancing validator ${validator.votePubkey}:`, error);
      }
    }));
    
    // Add a delay between chunks to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return enhancedValidators;
};
