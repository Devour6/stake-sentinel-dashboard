
// Utility functions for the Solana API

// Convert lamports to SOL
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1000000000;
};

// Format a number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
};

// Validate a vote pubkey
export const validateVotePubkey = (pubkey: string): boolean => {
  // Simple validation - in real app should be more robust
  return pubkey.length === 44 || pubkey.length === 43;
};

// Format SOL amount for display
export const formatSol = (sol: number): string => {
  return `${formatNumber(sol)} SOL`;
};

// Format commission percentage
export const formatCommission = (commission: number): string => {
  return `${commission}%`;
};

// Format stake change with percentage
export const formatChange = (change: number, percentage: number): string => {
  const prefix = change >= 0 ? "+" : "";
  return `${prefix}${formatNumber(change)} SOL (${prefix}${percentage.toFixed(2)}%)`;
};

// Generate mock stake history data
export const generateMockStakeHistory = (days: number, currentStake: number) => {
  const history = [];
  const now = new Date();
  
  // Start with current stake and work backwards with slight variations
  let stake = currentStake;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation (tends to grow over time)
    const change = (Math.random() * 0.01 - 0.003) * stake;
    
    // For older dates, stake should generally be less (showing growth trend)
    stake = i === 0 ? currentStake : stake - change;
    
    history.unshift({
      epoch: 300 - Math.floor(i / 3), // Approximate epochs
      stake: stake,
      date: date.toISOString().split('T')[0],
    });
  }
  
  return history;
};
