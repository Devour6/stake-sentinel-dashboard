
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StakeHistoryItem } from "@/services/solanaApi";

interface StakeChartProps {
  data: StakeHistoryItem[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const epoch = payload[0]?.payload?.epoch;
    return (
      <div className="glass-effect p-3 border border-gojira-gray-light rounded-lg shadow-sm">
        <p className="font-medium">Epoch {epoch}</p>
        <p className="text-gojira-red font-bold">{`${new Intl.NumberFormat().format(Math.round(payload[0].value * 100) / 100)} SOL`}</p>
      </div>
    );
  }

  return null;
};

export const StakeChart = ({ data, isLoading = false }: StakeChartProps) => {
  const [chartData, setChartData] = useState<StakeHistoryItem[]>([]);

  useEffect(() => {
    // Format data for the chart
    if (data && data.length > 0) {
      // Filter out invalid data points
      const validData = data.filter(item => 
        item && item.stake !== undefined && !isNaN(Number(item.stake))
      );
      
      console.log("Filtered stake history for chart:", validData);
      setChartData(validData);
    } else {
      console.log("No valid data for stake history chart");
    }
  }, [data]);

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Stake History</CardTitle>
            <CardDescription>Validator stake over time by epoch</CardDescription>
          </div>
          {isLoading && (
            <div className="h-4 w-20 bg-muted/30 rounded animate-pulse"></div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorStake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DD0817" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DD0817" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="epoch" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => {
                    return new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(value);
                  }}
                  label={{ value: 'Stake (SOL)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="stake"
                  stroke="#DD0817"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStake)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#DD0817" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No stake history data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
