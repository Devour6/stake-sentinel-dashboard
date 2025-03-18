
/**
 * Types for stake-related components
 */

export interface StakeData {
  epoch: number;
  stake: number;
  date: string;
}

export type TimeframeType = "1M" | "6M" | "12M";

export interface StakeHistoryChartProps {
  vote_identity: string;
}

export interface StakeChartContainerProps {
  isLoading: boolean;
  error: string | null;
  displayedStakes: StakeData[] | null;
  usedMockData: boolean;
}

export interface TimeframeToggleProps {
  timeframe: TimeframeType;
  onTimeframeChange: (value: TimeframeType) => void;
}
