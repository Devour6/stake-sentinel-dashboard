
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { StakeData, TimeframeType } from "./types";
import { STAKEWIZ_API_URL } from "@/services/api/constants";

export const useStakeHistory = (vote_identity: string) => {
  const [allStakes, setAllStakes] = useState<StakeData[] | null>(null);
  const [displayedStakes, setDisplayedStakes] = useState<StakeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>("1M");
  
  // Helper function to filter stakes by timeframe
  const filterStakesByTimeframe = (stakes: StakeData[], frame: TimeframeType) => {
    if (!stakes || stakes.length === 0) {
      setDisplayedStakes([]);
      return;
    }
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (frame) {
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "12M":
        cutoffDate.setMonth(now.getMonth() - 12);
        break;
    }
    
    // If we have limited data, just show what we have
    if (stakes.length <= 10) {
      setDisplayedStakes(stakes);
      return;
    }
    
    // Filter by date
    const filtered = stakes.filter(item => new Date(item.date) >= cutoffDate);
    
    // If we still have too many points, sample them
    let result = filtered;
    if (filtered.length > 30) {
      const step = Math.floor(filtered.length / 30);
      result = filtered.filter((_, index) => index % step === 0);
      
      // Always include the most recent point
      if (!result.includes(filtered[filtered.length - 1])) {
        result.push(filtered[filtered.length - 1]);
      }
      
      // Sort by epoch again after sampling
      result.sort((a, b) => a.epoch - b.epoch);
    }
    
    setDisplayedStakes(result);
  };

  // Fetch stake history from Stakewiz API
  useEffect(() => {
    const fetchStakeHistory = async () => {
      if (!vote_identity) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Attempting to fetch stake history for ${vote_identity}`);
        
        // DIRECT STAKEWIZ STAKE HISTORY ENDPOINT
        const stakewizStakeHistoryUrl = `${STAKEWIZ_API_URL}/validator/${vote_identity}/stake_history`;
        console.log(`Trying direct stake history endpoint: ${stakewizStakeHistoryUrl}`);
        
        try {
          const response = await axios.get(stakewizStakeHistoryUrl, {
            timeout: 15000
          });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Success! Found ${response.data.length} stake history records`);
            
            // Format the data properly
            const formattedData = response.data.map((item: any) => ({
              epoch: item.epoch,
              stake: item.stake,
              date: new Date(item.date).toISOString()
            }));
            
            // Sort by epoch ascending
            formattedData.sort((a: StakeData, b: StakeData) => a.epoch - b.epoch);
            
            setAllStakes(formattedData);
            filterStakesByTimeframe(formattedData, timeframe);
            setIsLoading(false);
            return;
          } else {
            console.log("Stake history endpoint returned empty array or invalid data");
          }
        } catch (err) {
          console.error("Error fetching from stake_history endpoint:", err);
        }
        
        // FALLBACK #1: MAIN VALIDATOR ENDPOINT
        console.log("Trying main validator endpoint for stake info...");
        const validatorUrl = `${STAKEWIZ_API_URL}/validator/${vote_identity}`;
        
        try {
          const validatorResponse = await axios.get(validatorUrl, {
            timeout: 15000
          });
          
          if (validatorResponse.data) {
            console.log("Successfully fetched main validator data:", validatorResponse.data);
            
            // Check if the response has a stake_history array
            if (validatorResponse.data.stake_history && 
                Array.isArray(validatorResponse.data.stake_history) && 
                validatorResponse.data.stake_history.length > 0) {
              
              console.log(`Found ${validatorResponse.data.stake_history.length} stake history items`);
              
              const formattedData = validatorResponse.data.stake_history.map((item: any) => ({
                epoch: item.epoch,
                stake: item.stake,
                date: new Date(item.date || Date.now()).toISOString()
              }));
              
              formattedData.sort((a: StakeData, b: StakeData) => a.epoch - b.epoch);
              
              setAllStakes(formattedData);
              filterStakesByTimeframe(formattedData, timeframe);
              setIsLoading(false);
              return;
            }
            
            // If there's no stake_history array but we have current stake and epoch, create a minimal history
            if (validatorResponse.data.activated_stake !== undefined || 
                validatorResponse.data.stake !== undefined) {
              console.log("Creating minimal stake history from current validator data");
              
              const currentStake = validatorResponse.data.activated_stake || 
                                  validatorResponse.data.stake || 0;
              const currentEpoch = validatorResponse.data.epoch || 0;
              
              // Create a single-point history
              const minimalHistory: StakeData[] = [{
                epoch: currentEpoch,
                stake: currentStake,
                date: new Date().toISOString()
              }];
              
              setAllStakes(minimalHistory);
              setDisplayedStakes(minimalHistory);
              setIsLoading(false);
              return;
            }
          }
        } catch (validatorErr) {
          console.error("Error fetching from main validator endpoint:", validatorErr);
        }
        
        // FALLBACK #2: VALIDATORS LIST
        console.log("Trying validators list endpoint...");
        try {
          const validatorsResponse = await axios.get(`${STAKEWIZ_API_URL}/validators`, {
            timeout: 15000
          });
          
          if (validatorsResponse.data && Array.isArray(validatorsResponse.data)) {
            const validator = validatorsResponse.data.find(
              (v: any) => v.vote_account === vote_identity || 
                          v.vote_identity === vote_identity || 
                          v.vote_pubkey === vote_identity
            );
            
            if (validator) {
              console.log("Found validator in validators list:", validator);
              
              const stake = validator.activated_stake || validator.stake || 0;
              const epoch = validator.epoch || 0;
              
              const minimalHistory: StakeData[] = [{
                epoch: epoch,
                stake: stake,
                date: new Date().toISOString()
              }];
              
              setAllStakes(minimalHistory);
              setDisplayedStakes(minimalHistory);
              setIsLoading(false);
              return;
            } else {
              console.log("Validator not found in validators list");
            }
          }
        } catch (validatorsErr) {
          console.error("Error fetching from validators list:", validatorsErr);
        }
        
        // FALLBACK #3: HACK - SCRAPE STAKEWIZ WEBSITE
        console.log("Last resort: attempting to scrape from Stakewiz website...");
        
        try {
          // We'll use a proxy service to avoid CORS issues
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://stakewiz.com/validator/${vote_identity}`)}`;
          const scrapeResponse = await axios.get(proxyUrl, {
            timeout: 20000
          });
          
          if (scrapeResponse.data) {
            const html = scrapeResponse.data;
            console.log("Successfully scraped Stakewiz HTML");
            
            // Very simple parsing for demonstration
            // In a production app, you'd use a proper HTML parser
            const stakeMatch = html.match(/"active_stake":(\d+)/);
            if (stakeMatch && stakeMatch[1]) {
              const stake = parseInt(stakeMatch[1], 10) / 1000000000; // lamports to SOL
              console.log("Extracted stake from scraped data:", stake);
              
              const minimalHistory: StakeData[] = [{
                epoch: 0, // We don't know the epoch
                stake: stake,
                date: new Date().toISOString()
              }];
              
              setAllStakes(minimalHistory);
              setDisplayedStakes(minimalHistory);
              setIsLoading(false);
              return;
            }
          }
        } catch (scrapeErr) {
          console.error("Error scraping Stakewiz website:", scrapeErr);
        }

        // If all methods failed
        throw new Error("Could not retrieve stake history data from any source");
        
      } catch (err: any) {
        console.error("Failed to fetch stake history data:", err);
        setError(`Failed to fetch stake history: ${err.message || "Unknown error"}`);
        setAllStakes([]);
        setDisplayedStakes([]);
        toast.error("Could not fetch validator stake history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStakeHistory();
  }, [vote_identity]);
  
  // Filter stakes by selected timeframe
  useEffect(() => {
    if (allStakes) {
      filterStakesByTimeframe(allStakes, timeframe);
    }
  }, [timeframe, allStakes]);

  return {
    displayedStakes,
    isLoading,
    error,
    timeframe,
    setTimeframe
  };
};
