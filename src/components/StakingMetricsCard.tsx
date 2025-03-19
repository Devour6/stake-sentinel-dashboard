
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSol, formatCommission } from "@/services/solanaApi";
import { ArrowUpRight, ArrowDownRight, Percent, Clock, TrendingUp, Users } from "lucide-react";

interface StakingMetricsCardProps {
  title: string;
  value: string | number | null;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
  isEstimated?: boolean;
  isError?: boolean;
}

export const StakingMetricsCard = ({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  isLoading = false,
  isEstimated = false,
  isError = false,
}: StakingMetricsCardProps) => {
  return (
    <Card className="overflow-hidden glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
          {isEstimated && (
            <span className="text-xs bg-gojira-gray-dark/50 px-1 py-0.5 rounded">est.</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 w-24 bg-muted/30 rounded animate-pulse"></div>
        ) : isError ? (
          <div className="text-red-500 flex items-center gap-1">
            <span className="text-sm">Error loading data</span>
          </div>
        ) : (
          <div className="text-2xl font-bold">{value || "No data"}</div>
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
  pendingStakeChange?: number;
  isDeactivating?: boolean;
  commission: number;
  mevCommission?: number;
  estimatedApy?: number;
  delegatorCount?: number;
  isLoading?: boolean;
  hasError?: boolean;
}

export const ValidatorMetricsGrid = ({
  totalStake,
  pendingStakeChange = 0,
  isDeactivating = false,
  commission,
  mevCommission,
  estimatedApy,
  delegatorCount,
  isLoading = false,
  hasError = false,
}: ValidatorMetricsProps) => {
  // Format the combined commission display
  const hasMevCommission = mevCommission !== undefined && mevCommission !== commission;
  const commissionDisplay = hasMevCommission
    ? `${formatCommission(commission)} / ${formatCommission(mevCommission!)}`
    : `${formatCommission(commission)}`;
  
  // Format the commission description
  const commissionDescription = hasMevCommission
    ? "Standard / MEV Commission"
    : "";

  // Format the pending stake description
  const pendingDescription = pendingStakeChange > 0 
    ? (isDeactivating ? "Deactivating" : "Activating") 
    : "No pending change";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-4 animate-slide-up">
      <StakingMetricsCard
        title="Total Stake"
        value={isLoading ? null : hasError ? "Error" : formatSol(totalStake)}
        icon={<div className="w-4 h-4 bg-gojira-red rounded-full"></div>}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Pending Change in Stake"
        value={isLoading ? null : hasError ? "Error" : formatSol(pendingStakeChange || 0)}
        icon={<Clock className="h-4 w-4 text-gojira-red" />}
        trend={pendingStakeChange > 0 ? (isDeactivating ? "down" : "up") : "neutral"}
        description={hasError ? "" : pendingDescription}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Commission"
        value={isLoading ? null : hasError ? "Error" : commissionDisplay}
        description={commissionDescription}
        icon={<Percent className="h-4 w-4 text-gojira-red" />}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Estimated APY"
        value={isLoading ? null : hasError ? "Error" : estimatedApy ? `${(estimatedApy * 100).toFixed(2)}%` : "N/A"}
        icon={<TrendingUp className="h-4 w-4 text-gojira-red" />}
        isEstimated={true}
        isLoading={isLoading}
        isError={hasError || !estimatedApy}
      />
    </div>
  );
};
