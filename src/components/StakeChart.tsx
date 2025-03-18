
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StakeHistoryItem } from "@/services/solanaApi";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StakeChartProps {
  data: StakeHistoryItem[];
  isLoading?: boolean;
}

type TimeframeType = "10E" | "30E" | "All";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const epoch = payload[0]?.payload?.epoch;
    const stakeValue = payload[0]?.value;
    
    if (epoch !== undefined && stakeValue !== undefined) {
      return (
        <div className="glass-effect p-3 border border-gojira-gray-light rounded-lg shadow-sm">
          <p className="font-medium">Epoch {epoch}</p>
          <p className="text-gojira-red font-bold">{`${new Intl.NumberFormat().format(Math.round(stakeValue * 100) / 100)} SOL`}</p>
        </div>
      );
    }
  }

  return null;
};

export const StakeChart = ({ data, isLoading = false }: StakeChartProps) => {
  const [chartData, setChartData] = useState<StakeHistoryItem[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeType>("30E");
  
  // Validate and prepare data for the chart
  useEffect(() => {
    console.log("Raw stake history data:", data);
    
    if (data && data.length > 0) {
      // Filter out invalid data points and ensure all required fields exist
      const validData = data.filter(item => 
        item && 
        item.stake !== undefined && 
        !isNaN(Number(item.stake)) &&
        item.epoch !== undefined
      );
      
      if (validData.length > 0) {
        // Sort by epoch (ascending)
        const sortedData = [...validData].sort((a, b) => a.epoch - b.epoch);
        console.log("Processed stake history data:", sortedData);
        
        // Filter by timeframe
        const filteredData = filterDataByTimeframe(sortedData, timeframe);
        setChartData(filteredData);
      } else {
        console.log("No valid stake history items found");
        setChartData([]);
      }
    } else {
      console.log("No stake history data available");
      setChartData([]);
    }
  }, [data, timeframe]);
  
  // Filter data by selected timeframe
  const filterDataByTimeframe = (inputData: StakeHistoryItem[], frame: TimeframeType): StakeHistoryItem[] => {
    if (!inputData || inputData.length === 0) {
      return [];
    }
    
    // Sort by epoch (ascending)
    const sortedData = [...inputData].sort((a, b) => a.epoch - b.epoch);
    
    // If we have limited data, just show what we have
    if (sortedData.length <= 10 || frame === "All") {
      return sortedData;
    }
    
    // Filter by epoch range
    switch (frame) {
      case "10E": // Last 10 epochs
        return sortedData.slice(-10);
      case "30E": // Last 30 epochs
        return sortedData.slice(-30);
      default:
        return sortedData;
    }
  };

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Stake History</CardTitle>
            <CardDescription>
              Validator stake over time by epoch
            </CardDescription>
          </div>
          
          <ToggleGroup type="single" value={timeframe} onValueChange={(value) => value && setTimeframe(value as TimeframeType)}>
            <ToggleGroupItem value="10E" aria-label="Last 10 Epochs">10E</ToggleGroupItem>
            <ToggleGroupItem value="30E" aria-label="Last 30 Epochs">30E</ToggleGroupItem>
            <ToggleGroupItem value="All" aria-label="All Available Data">All</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[320px] w-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
            <p className="text-muted-foreground">No stake history data available for this validator</p>
            <p className="text-xs text-muted-foreground">This may be due to API limitations or the validator being new</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorStake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4a22" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff4a22" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="epoch" 
                label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
                style={{ fontSize: '0.75rem' }}
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
              <Area 
                type="monotone" 
                dataKey="stake" 
                stroke="#ff4a22" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStake)"
                activeDot={{ r: 6 }}
                name="Active Stake"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StakeChart;
