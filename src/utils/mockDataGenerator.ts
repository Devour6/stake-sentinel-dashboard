
/**
 * Utility functions for generating mock data
 */

import { StakeData } from "@/components/stakes/types";

/**
 * Generates mock stake history data for a validator when API fails
 */
export const generateMockStakeHistory = (votePubkey: string, days = 30): StakeData[] => {
  console.log(`Generating mock stake history for ${votePubkey}`);
  
  // Use last 6 chars of pubkey to seed the random generation
  const pubkeySeed = parseInt(votePubkey.substring(votePubkey.length - 6), 16) % 1000;
  
  // Base stake between 1,000 and 100,000 SOL
  const baseStake = 1000 + (pubkeySeed * 100);
  
  const history: StakeData[] = [];
  const now = new Date();
  const currentEpoch = 758; // Current approximate epoch
  
  // Generate one entry per epoch, roughly 2-3 days per epoch
  for (let i = 0; i < Math.ceil(days / 2.5); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.round(i * 2.5));
    
    // Add some variability to the stake amount, with a slight upward trend
    const randomFactor = Math.sin(i * 0.5) * 0.1; // Adds some realistic fluctuation
    const trendFactor = 1 + (i * 0.005); // Small upward trend over time
    const stake = Math.round(baseStake * trendFactor * (1 + randomFactor));
    
    history.push({
      epoch: currentEpoch - i,
      stake,
      date: date.toISOString()
    });
  }
  
  // Return in ascending epoch order
  return history.sort((a, b) => a.epoch - b.epoch);
};
