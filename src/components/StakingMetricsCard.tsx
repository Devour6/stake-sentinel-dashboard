
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSol, formatCommission } from "@/services/solanaApi";
import { ArrowUpRight, ArrowDownRight, Percent, Users, Clock } from "lucide-react";

interface StakingMetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}

export const StakingMetricsCard = ({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  isLoading = false,
}: StakingMetricsCardProps) => {
  return (
    <Card className="overflow-hidden glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 w-24 bg-muted/30 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <CardDescription className={`mt-1 flex items-center gap-1 ${
            trend === "up" ? "text-green-500" : 
            trend === "down" ? "text-red-500" : ""
          }`}>
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

interface ValidatorMetricsProps {
  totalStake: number;
  activatingStake: number;
  commission: number;
  mevCommission: number; // Added MEV commission
  delegatorCount: number;
  isLoading?: boolean;
}

export const ValidatorMetricsGrid = ({
  totalStake,
  activatingStake,
  commission,
  mevCommission,
  delegatorCount,
  isLoading = false,
}: ValidatorMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
      <StakingMetricsCard
        title="Total Stake"
        value={isLoading ? "" : formatSol(totalStake)}
        icon={<div className="w-4 h-4 bg-gojira-red rounded-full"></div>}
        isLoading={isLoading}
      />
      <StakingMetricsCard
        title="Activating Stake"
        value={isLoading ? "" : formatSol(activatingStake)}
        description="Active next epoch"
        icon={<Clock className="h-4 w-4 text-gojira-red" />}
        trend="up"
        isLoading={isLoading}
      />
      <StakingMetricsCard
        title="Commission"
        value={isLoading ? "" : `${formatCommission(commission)} / ${mevCommission}%`}
        description="Vote / MEV"
        icon={<Percent className="h-4 w-4 text-gojira-red" />}
        isLoading={isLoading}
      />
      <StakingMetricsCard
        title="Delegators"
        value={isLoading ? "" : delegatorCount}
        icon={<Users className="h-4 w-4 text-gojira-red" />}
        isLoading={isLoading}
      />
    </div>
  );
};
