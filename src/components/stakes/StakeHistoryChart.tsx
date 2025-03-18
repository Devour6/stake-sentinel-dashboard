
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStakeHistory } from "./useStakeHistory";
import { TimeframeToggle } from "./TimeframeToggle";
import { StakeChartContainer } from "./StakeChartContainer";
import { StakeHistoryChartProps } from "./types";

export const StakeHistoryChart: FC<StakeHistoryChartProps> = ({ vote_identity }) => {
  const {
    displayedStakes,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    usedMockData
  } = useStakeHistory(vote_identity);

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Stake History</CardTitle>
            <CardDescription>
              {usedMockData ? "Estimated validator stake over time" : "Validator stake over time"}
            </CardDescription>
          </div>
          
          <TimeframeToggle 
            timeframe={timeframe} 
            onTimeframeChange={setTimeframe} 
          />
        </div>
      </CardHeader>
      <CardContent>
        <StakeChartContainer
          isLoading={isLoading}
          error={error}
          displayedStakes={displayedStakes}
          usedMockData={usedMockData}
        />
      </CardContent>
    </Card>
  );
};

export default StakeHistoryChart;
