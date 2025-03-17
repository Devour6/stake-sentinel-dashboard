
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

interface StakeHistoryChartProps {
  vote_identity: string;
}

interface StakeData {
  epoch: number;
  stake: number;
}

export const StakeHistoryChart: FC<StakeHistoryChartProps> = ({ vote_identity }) => {
  const [allStakes, setAllStakes] = useState<StakeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // For now, we'll create mock data instead of doing an actual API call
    const generateMockData = () => {
      const data: StakeData[] = [];
      const currentEpoch = 345; // Example current epoch
      
      // Generate last 20 epochs of data
      for (let i = 0; i < 20; i++) {
        const epoch = currentEpoch - 19 + i;
        // Random stake between 1000 and 2000 SOL with some trend
        const stake = 1000 + Math.floor(i * 50 + Math.random() * 500);
        
        data.push({
          epoch,
          stake
        });
      }
      
      return data;
    };
    
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setAllStakes(generateMockData());
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [vote_identity]);  

  if (isLoading || !allStakes) {
    return <Spinner />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={allStakes}
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
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString()} SOL`, 'Stake']}
          labelFormatter={(label) => `Epoch ${label}`}
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
  );
};

export default StakeHistoryChart;
