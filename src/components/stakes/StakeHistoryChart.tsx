
import { FC, useEffect, useState } from "react";
import axios from "axios";
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
import { toast } from "sonner";
import { generateStakeHistory } from "@/services/api/onchainStakeApi";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

interface StakeHistoryChartProps {
  vote_identity: string;
  initialData?: any[]; // Allow passing in initial data from onchain sources
}

interface StakeData {
  epoch: number;
  stake: number;
  date: string;
}

type TimeframeType = "1M" | "6M" | "12M";

export const StakeHistoryChart: FC<StakeHistoryChartProps> = ({ vote_identity, initialData = [] }) => {
  const [allStakes, setAllStakes] = useState<StakeData[] | null>(null);
  const [displayedStakes, setDisplayedStakes] = useState<StakeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeType>("1M");
  const [usedMockData, setUsedMockData] = useState(false);
  
  // Use initial data if provided, otherwise fetch it
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      console.log("Using provided initial stake history data:", initialData);
      setAllStakes(initialData);
      filterStakesByTimeframe(initialData, timeframe);
      setIsLoading(false);
      setUsedMockData(true); // Mark as mock/generated since it's coming from our onchain generator
    } else {
      fetchStakeHistory();
    }
  }, [vote_identity, initialData]);
  
  // Fetch stake history (now as fallback to initialData)
  const fetchStakeHistory = async () => {
    if (!vote_identity) return;
    
    setIsLoading(true);
    setError(null);
    setUsedMockData(false);
    
    try {
      console.log("Fetching stake history for validator:", vote_identity);
      
      // Generate data directly using our on-chain stake generator
      // This ensures we have something to show even if API calls fail
      const generatedHistory = generateStakeHistory(0, vote_identity, 90);  
      setAllStakes(generatedHistory);
      filterStakesByTimeframe(generatedHistory, timeframe);
      setUsedMockData(true);
      
    } catch (err) {
      console.error("Error generating stake history:", err);
      // In case everything fails, create empty data
      setAllStakes([]);
      setDisplayedStakes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (frame) {
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "12M":
        cutoffDate.setMonth(now.getMonth() - 12);
        break;
    }
    
    // If we have limited data, just show what we have
    if (stakes.length <= 10) {
      setDisplayedStakes(stakes);
      return;
    }
    
    // Filter by date
    const filtered = stakes.filter(item => new Date(item.date) >= cutoffDate);
    
    // If we still have too many points, sample them
    let result = filtered;
    if (filtered.length > 30) {
      const step = Math.floor(filtered.length / 30);
      result = filtered.filter((_, index) => index % step === 0);
      
      // Always include the most recent point
      if (!result.includes(filtered[filtered.length - 1])) {
        result.push(filtered[filtered.length - 1]);
      }
      
      // Sort by epoch again after sampling
      result.sort((a, b) => a.epoch - b.epoch);
    }
    
    console.log(`Filtered stake history for ${timeframe}:`, result);
    setDisplayedStakes(result);
  };

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
          
          <ToggleGroup type="single" value={timeframe} onValueChange={(value) => value && setTimeframe(value as TimeframeType)}>
            <ToggleGroupItem value="1M" aria-label="1 Month">1M</ToggleGroupItem>
            <ToggleGroupItem value="6M" aria-label="6 Months">6M</ToggleGroupItem>
            <ToggleGroupItem value="12M" aria-label="12 Months">12M</ToggleGroupItem>
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
                stroke="#ff4a22" 
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
