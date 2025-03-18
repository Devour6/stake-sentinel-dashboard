
import { FC } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import CustomTooltip from "./CustomTooltip";
import { StakeChartContainerProps } from "./types";

export const StakeChartContainer: FC<StakeChartContainerProps> = ({ 
  isLoading, 
  error, 
  displayedStakes,
  usedMockData
}) => {
  if (isLoading) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  if (!displayedStakes || displayedStakes.length === 0) {
    return (
      <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">No stake history available for this timeframe</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={displayedStakes}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }}
          style={{ fontSize: '0.75rem' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis 
          label={{ value: 'Stake (SOL)', angle: -90, position: 'insideLeft' }}
          style={{ fontSize: '0.75rem' }}
          tickFormatter={(value) => {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value);
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="stake" 
          stroke="#ff4a22" 
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
          name={usedMockData ? "Estimated Stake" : "Active Stake"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StakeChartContainer;
