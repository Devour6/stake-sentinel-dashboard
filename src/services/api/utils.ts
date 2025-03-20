import { toast } from "sonner";

// Utils for formatting and converting data
export const formatSol = (lamports: number | null): string => {
  if (lamports === null) return "N/A";
  const sol = lamports / 1_000_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(sol);
};

export const formatSolNumber = (solAmount: number | null): string => {
  if (solAmount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(solAmount);
};

export const formatCommission = (commission: number | null): string => {
  if (commission === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(commission / 100);
};

export const formatChange = (change: number | null): string => {
  if (change === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    signDisplay: "always",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(change);
};

export const formatNumber = (number: number | null): string => {
  if (number === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000;
};

// Mock data generator for stake history
export const generateMockStakeHistory = (
  days: number,
  currentStake: number
) => {
  const stakeHistory = [];
  let stake = currentStake;
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toLocaleDateString("en-CA"); // Use a consistent date format

    // Generate a random stake change
    const stakeChange = (Math.random() - 0.5) * 0.02 * currentStake; // Up to 2% change
    stake += stakeChange;
    stake = Math.max(0, stake); // Stake cannot be negative

    stakeHistory.push({
      epoch: days - i,
      stake: stake,
      date: dateString,
    });
  }

  return stakeHistory;
};

// Add a function to validate vote pubkey format
export const validateVotePubkey = (pubkey: string): boolean => {
  // This is a simple check for Solana address format (base58, 32-44 chars)
  // For a real app, you'd want to perform a more thorough validation
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(pubkey);
};
