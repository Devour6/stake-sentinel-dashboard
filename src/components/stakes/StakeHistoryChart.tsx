
import { FC, useEffect, useState } from "react";
import { VALIDATOR_PUBKEY, RPC_ENDPOINT } from "@/services/api/constants";
import { fetchStakeHistory } from "@/services/api/stakeApi";
import { StakeHistoryItem } from "@/services/api/types";
import { Spinner } from "@/components/ui/spinner";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { formatSol } from "@/services/api/utils";

interface StakeHistoryChartProps {
  votePubkey?: string;
  days?: number;
}

const StakeHistoryChart: FC<StakeHistoryChartProps> = ({ 
  votePubkey = VALIDATOR_PUBKEY,
  days = 30 
}) => {
  const [stakeHistory, setStakeHistory] = useState<StakeHistoryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadStakeHistory = async () => {
      try {
        setIsLoading(true);
        const history = await fetchStakeHistory(votePubkey, days);
        setStakeHistory(history);
      } catch (error) {
        console.error("Error fetching stake history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStakeHistory();
  }, [votePubkey, days]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (!stakeHistory || stakeHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No stake history available for this validator
      </div>
    );
  }

  // Configure chart data
  const chartConfig = {
    stake: {
      label: "Stake",
      color: "#e11d48",
    }
  };

  return (
    <div className="w-full h-80">
      <ChartContainer config={chartConfig}>
        <LineChart data={stakeHistory}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatSol(value, true)}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="stake"
            stroke="var(--color-stake)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default StakeHistoryChart;
