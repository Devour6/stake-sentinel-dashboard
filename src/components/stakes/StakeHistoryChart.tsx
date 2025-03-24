
import { FC, useEffect, useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertTriangle } from "lucide-react";

interface StakeHistoryChartProps {
  vote_identity: string;
  initialData?: any[]; // Allow passing in initial data from SolanaFM
}

interface StakeData {
  epoch: number;
  stake: number;
  date: string;
}

type TimeframeType = "10E" | "30E" | "All";

export const StakeHistoryChart: FC<StakeHistoryChartProps> = ({ vote_identity, initialData = [] }) => {
  const [allStakes, setAllStakes] = useState<StakeData[] | null>(null);
  const [displayedStakes, setDisplayedStakes] = useState<StakeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>("30E");
  
  // Use initial data if provided
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      console.log("Using provided stake history data:", initialData);
      setAllStakes(initialData);
      filterStakesByTimeframe(initialData, timeframe);
      setIsLoading(false);
    } else {
      console.log("No initial data provided");
      setAllStakes([]);
      setDisplayedStakes([]);
      setIsLoading(false);
      setError("No stake history data available");
    }
  }, [vote_identity, initialData]);
  
  // Filter stakes by selected timeframe
  useEffect(() => {
    if (allStakes) {
      filterStakesByTimeframe(allStakes, timeframe);
    }
  }, [timeframe, allStakes]);
  
  // Helper function to filter stakes by timeframe
  const filterStakesByTimeframe = (stakes: StakeData[], frame: TimeframeType) => {
    if (!stakes || stakes.length === 0) {
      setDisplayedStakes([]);
      return;
    }
    
    // If we have limited data, just show what we have
    if (stakes.length <= 10 || frame === "All") {
      setDisplayedStakes(stakes);
      return;
    }
    
    // Sort by epoch (ascending)
    const sortedStakes = [...stakes].sort((a, b) => a.epoch - b.epoch);
    
    // Filter by epoch range
    let filtered: StakeData[];
    
    switch (frame) {
      case "10E": // Last 10 epochs
        filtered = sortedStakes.slice(-10);
        break;
      case "30E": // Last 30 epochs
        filtered = sortedStakes.slice(-30);
        break;
      default:
        filtered = sortedStakes;
    }
    
    console.log(`Filtered stake history for ${timeframe}:`, filtered);
    setDisplayedStakes(filtered);
  };

  return (
    <Card className="glass-card animate-fade-in border-white/20">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Stake History</CardTitle>
            <CardDescription>
              Validator stake over time
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
        ) : error ? (
          <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : !displayedStakes || displayedStakes.length === 0 ? (
          <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="text-muted-foreground">No stake history available for this timeframe</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={displayedStakes}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} SOL`, 'Stake']}
                labelFormatter={(epoch) => `Epoch ${epoch}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stake" 
                stroke="#838EFC" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
                name="Active Stake"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StakeHistoryChart;
