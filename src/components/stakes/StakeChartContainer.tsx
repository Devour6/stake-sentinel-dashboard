
import { FC } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomTooltip } from "./CustomTooltip";
import { StakeChartContainerProps } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

export const StakeChartContainer: FC<StakeChartContainerProps> = ({ 
  isLoading,
  error,
  displayedStakes
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center border border-red-500/20 rounded-lg bg-red-500/5 p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!displayedStakes || displayedStakes.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center border border-muted rounded-lg bg-muted/10 p-4">
        <p className="text-muted-foreground text-center">No stake history data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: isMobile ? "250px" : "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={displayedStakes}
          margin={{
            top: 10,
            right: 10,
            left: isMobile ? 0 : 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="epoch" 
            tick={{ fill: '#9CA3AF' }}
            label={{ 
              value: 'Epoch', 
              position: 'insideBottomRight', 
              offset: -5,
              fill: '#9CA3AF'
            }}
            tickFormatter={(value) => isMobile ? String(value) : `Epoch ${value}`}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            label={{ 
              value: 'Stake (SOL)', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' },
              fill: '#9CA3AF',
              offset: isMobile ? 0 : 10 
            }}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="stake" 
            stroke="#EF4444" 
            strokeWidth={2}
            activeDot={{ r: 6, fill: '#EF4444', stroke: '#FFFFFF' }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
