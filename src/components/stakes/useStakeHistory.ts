
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { StakeData, TimeframeType } from "./types";
import { generateMockStakeHistory } from "@/utils/mockDataGenerator";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

export const useStakeHistory = (vote_identity: string) => {
  const [allStakes, setAllStakes] = useState<StakeData[] | null>(null);
  const [displayedStakes, setDisplayedStakes] = useState<StakeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>("1M");
  const [usedMockData, setUsedMockData] = useState(false);
  
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
      setUsedMockData(false);
      
      try {
        // Fetch stake history from Stakewiz
        const response = await axios.get(`${STAKEWIZ_API_URL}/validator/${vote_identity}/stake_history`, {
          timeout: 15000
        });
        
        if (response.data && Array.isArray(response.data)) {
          console.log("Stake history from Stakewiz:", response.data);
          
          if (response.data.length === 0) {
            // If we got an empty array, generate mock data instead of showing an error
            console.log("Empty stake history from API, generating mock data");
            const mockData = generateMockStakeHistory(vote_identity, 90); // 90 days of data
            setAllStakes(mockData);
            setUsedMockData(true);
            filterStakesByTimeframe(mockData, timeframe);
            // Show an info toast
            setTimeout(() => {
              toast.info("Using estimated stake history - actual data unavailable");
            }, 1000);
            return;
          }
          
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
        } else {
          throw new Error("Invalid response from Stakewiz");
        }
      } catch (err) {
        console.error("Error fetching stake history:", err);
        
        // Generate mock data instead of showing an error
        console.log("Generating mock stake history data");
        const mockData = generateMockStakeHistory(vote_identity, 90); // 90 days of data
        setAllStakes(mockData);
        setUsedMockData(true);
        filterStakesByTimeframe(mockData, timeframe);
        
        // Show an info toast
        setTimeout(() => {
          toast.info("Using estimated stake history - actual data unavailable");
        }, 1000);
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
    setTimeframe,
    usedMockData
  };
};
