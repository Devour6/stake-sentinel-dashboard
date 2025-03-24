
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { StakeHistoryItem } from "@/services/solanaApi";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fetchCurrentEpoch } from "@/services/api/epochApi";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface StakeChartProps {
  data: StakeHistoryItem[];
  isLoading?: boolean;
}

type TimeframeType = "10E" | "30E" | "All";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const epoch = payload[0]?.payload?.epoch;
    const stakeValue = payload[0]?.value;
    const date = payload[0]?.payload?.date;
    
    let formattedDate = "";
    if (date) {
      try {
        formattedDate = format(new Date(date), 'MMM d, yyyy');
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
    
    if (epoch !== undefined && stakeValue !== undefined) {
      return (
        <div className="glass-effect p-3 border border-white/20 rounded-lg shadow-sm">
          <p className="font-medium">Epoch {epoch}</p>
          {formattedDate && <p className="text-muted-foreground text-xs">{formattedDate}</p>}
          <p className="text-[#838EFC] font-bold mt-1">{`${new Intl.NumberFormat().format(Math.round(stakeValue * 100) / 100)} SOL`}</p>
        </div>
      );
    }
  }

  return null;
};

// Custom formatter for the X-axis to show both epoch and date
// Modified to match the expected tickFormatter signature (value, index)
const formatXAxis = (value: any, index: number) => {
  // Only show every 3rd label to avoid overcrowding
  if (index % 3 !== 0) return '';
  return `E${value}`;
};

export const StakeChart = ({ data, isLoading = false }: StakeChartProps) => {
  const [chartData, setChartData] = useState<StakeHistoryItem[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeType>("30E");
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [dataLength, setDataLength] = useState<number>(0);
  
  useEffect(() => {
    const getEpoch = async () => {
      try {
        const epoch = await fetchCurrentEpoch();
        setCurrentEpoch(epoch);
      } catch (error) {
        console.error("Error fetching current epoch:", error);
      }
    };
    
    getEpoch();
  }, []);
  
  useEffect(() => {
    console.log("Raw stake history data:", data?.length, "items");
    
    if (data && data.length > 0) {
      setDataLength(data.length);
      
      const validData = data.filter(item => 
        item && 
        item.stake !== undefined && 
        !isNaN(Number(item.stake)) &&
        item.epoch !== undefined
      );
      
      if (validData.length > 0) {
        const sortedData = [...validData].sort((a, b) => a.epoch - b.epoch);
        console.log("Processed stake history data:", sortedData.length, "valid items");
        
        const filteredData = filterDataByTimeframe(sortedData, timeframe);
        setChartData(filteredData);
      } else {
        console.log("No valid stake history items found");
        setChartData([]);
        
        if (dataLength === 0 && retryCount < 2 && !isLoading) {
          console.log(`No stake history data, retry attempt ${retryCount + 1}`);
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
          
          return () => clearTimeout(timer);
        }
      }
    } else if (dataLength === 0 && retryCount < 2 && !isLoading) {
      console.log(`No stake history data, retry attempt ${retryCount + 1}`);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      console.log("No stake history data available after retries");
      setChartData([]);
    }
  }, [data, timeframe, retryCount, isLoading, dataLength]);
  
  const filterDataByTimeframe = (inputData: StakeHistoryItem[], frame: TimeframeType): StakeHistoryItem[] => {
    if (!inputData || inputData.length === 0) {
      return [];
    }
    
    const sortedData = [...inputData].sort((a, b) => a.epoch - b.epoch);
    
    if (sortedData.length <= 10 || frame === "All") {
      return sortedData;
    }
    
    switch (frame) {
      case "10E":
        return sortedData.slice(-10);
      case "30E":
        return sortedData.slice(-30);
      default:
        return sortedData;
    }
  };

  const isDataLoading = isLoading;
  const hasNoData = !isLoading && (!chartData || chartData.length === 0);
  
  const handleRetry = () => {
    if (hasNoData) {
      setRetryCount(0);
    }
  };

  // Function to format dates for secondary axis labels
  const getDateLabel = (item: StakeHistoryItem) => {
    if (!item.date) return "";
    try {
      return format(new Date(item.date), 'MMM d');
    } catch (e) {
      return "";
    }
  };

  return (
    <Card className="glass-card animate-fade-in border-white/20">
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
        {isDataLoading ? (
          <div className="h-[320px] w-full flex items-center justify-center">
            <Spinner size="md" />
            <span className="ml-2">Loading stake history...</span>
          </div>
        ) : hasNoData ? (
          <div className="h-[320px] w-full flex flex-col items-center justify-center text-center gap-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <div>
              <p className="text-muted-foreground">No stake history data available for this validator</p>
              <p className="text-xs text-muted-foreground mt-1">We're having trouble retrieving historical data for this validator</p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-[#838EFC] text-white rounded-md hover:bg-[#6e77e0] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorStake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#838EFC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#838EFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="epoch" 
                label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, dy: 10 }}
                style={{ fontSize: '0.75rem' }}
                tickFormatter={formatXAxis}
                padding={{ left: 10, right: 10 }}
              />
              <XAxis 
                dataKey={(entry) => getDateLabel(entry)}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 10 }}
                xAxisId="date"
                orientation="bottom"
                padding={{ left: 10, right: 10 }}
                height={20}
                tickFormatter={(value, index) => {
                  // Only show every nth label to avoid overcrowding
                  if (index % 3 !== 0 && index !== chartData.length - 1) return '';
                  return value;
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
              {currentEpoch && (
                <ReferenceLine 
                  x={currentEpoch} 
                  stroke="#838EFC" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Current', position: 'top', fill: '#838EFC' }} 
                />
              )}
              <Area 
                type="monotone" 
                dataKey="stake" 
                stroke="#838EFC" 
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
