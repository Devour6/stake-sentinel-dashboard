
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
        console.log(`Attempting to fetch stake history from Stakewiz for ${vote_identity}`);
        
        // First try the dedicated stake_history endpoint
        try {
          const response = await axios.get(`${STAKEWIZ_API_URL}/validator/${vote_identity}/stake_history`, {
            timeout: 15000
          });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Found ${response.data.length} stake history items from dedicated endpoint`);
            
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
          }
        } catch (err) {
          console.error("Error fetching from stake_history endpoint:", err);
        }
        
        // Next, try the main validator endpoint that may include stake_history
        try {
          console.log("Trying main validator endpoint for stake history...");
          const validatorResponse = await axios.get(`${STAKEWIZ_API_URL}/validator/${vote_identity}`, {
            timeout: 15000
          });
          
          if (validatorResponse.data) {
            // Check if the response has a stake_history array
            if (validatorResponse.data.stake_history && 
                Array.isArray(validatorResponse.data.stake_history) && 
                validatorResponse.data.stake_history.length > 0) {
              
              console.log(`Found ${validatorResponse.data.stake_history.length} stake history items in main validator response`);
              
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
        
        // Try the validators list as a last resort
        try {
          console.log("Trying validators list for stake data...");
          const validatorsResponse = await axios.get(`${STAKEWIZ_API_URL}/validators`, {
            timeout: 15000
          });
          
          if (validatorsResponse.data && Array.isArray(validatorsResponse.data)) {
            const validator = validatorsResponse.data.find(
              (v: any) => v.vote_account === vote_identity || 
                          v.vote_identity === vote_identity || 
                          v.vote_pubkey === vote_identity
            );
            
            if (validator && (validator.activated_stake !== undefined || validator.stake !== undefined)) {
              console.log("Creating minimal stake history from validators list");
              
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
            }
          }
        } catch (validatorsErr) {
          console.error("Error fetching from validators list:", validatorsErr);
        }
        
        // If we've tried everything and still have no data
        throw new Error("No stake history data could be retrieved");
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
