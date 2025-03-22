
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatSol, formatCommission } from "@/services/solanaApi";
import {
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Clock,
  TrendingUp,
  Users,
  Database,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatSolNumber } from "@/services/api/utils";

interface StakingMetricsCardProps {
  title: string;
  value: string | number | null;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
  isEstimated?: boolean;
  isError?: boolean;
  isSecondary?: boolean;
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
  isSecondary = false,
}: StakingMetricsCardProps) => {
  return (
    <Card className={`overflow-hidden glass-card animate-fade-in border-aero-gray-light ${isSecondary ? 'opacity-80' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium text-muted-foreground flex items-center gap-2 ${isSecondary ? 'text-xs' : ''}`}>
          {icon}
          {title}
          {isEstimated && !title.toLowerCase().includes('estimated') && (
            <span className="text-xs bg-aero-gray-dark/50 px-1 py-0.5 rounded">
              est.
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center">
            <Spinner size="sm" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : isError ? (
          <div className="text-red-500 flex items-center gap-1">
            <span className="text-sm">Error loading data</span>
          </div>
        ) : (
          <>
            <div className={`${isSecondary ? 'text-xl' : 'text-2xl'} font-bold`}>{value || "—"}</div>
            {description && (
              <CardDescription
                className={`mt-1 flex items-center gap-1 ${
                  trend === "up"
                    ? "text-green-500"
                    : trend === "down"
                    ? "text-red-500"
                    : ""
                } ${isSecondary ? 'text-xs' : ''}`}
              >
                {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                {description}
              </CardDescription>
            )}
          </>
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
  voteRate?: number;
  skipRate?: number;
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
  voteRate,
  skipRate,
  isLoading = false,
  hasError = false,
}: ValidatorMetricsProps) => {
  console.log(totalStake, pendingStakeChange);

  // Format the combined commission display
  const hasMevCommission =
    mevCommission !== undefined && mevCommission !== commission;
  const commissionDisplay = hasMevCommission
    ? `${formatCommission(commission)} / ${formatCommission(mevCommission!)}`
    : `${formatCommission(commission)}`;

  // Format the commission description
  const commissionDescription = hasMevCommission
    ? "Standard / MEV Commission"
    : "";

  // Format the pending stake description
  const pendingDescription =
    pendingStakeChange > 0
      ? isDeactivating
        ? "Deactivating"
        : "Activating"
      : "No pending change";

  // Format stake values properly even if zero or very small
  const formattedTotalStake =
    totalStake > 0.001
      ? formatSolNumber(totalStake)
      : totalStake > 0
      ? "< 0.001 SOL"
      : "—";
  const formattedPendingStake =
    pendingStakeChange > 0.001
      ? formatSolNumber(pendingStakeChange)
      : pendingStakeChange > 0
      ? "< 0.001 SOL"
      : "—";
  const formattedApy = estimatedApy
    ? `${(estimatedApy * 100).toFixed(2)}%`
    : "—";

  // Format vote rate and skip rate
  const formattedVoteRate = voteRate !== undefined ? `${voteRate.toFixed(2)}%` : "—";
  const formattedSkipRate = skipRate !== undefined ? `${skipRate.toFixed(2)}%` : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 animate-slide-up">
      {/* Primary metrics row - most important metrics */}
      <StakingMetricsCard
        title="Total Stake"
        value={isLoading ? null : hasError ? "Error" : formattedTotalStake}
        icon={<Database className="h-4 w-4 text-aero-purple" />}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Pending Change in Stake"
        value={isLoading ? null : hasError ? "Error" : formattedPendingStake}
        icon={<Clock className="h-4 w-4 text-aero-purple" />}
        trend={
          pendingStakeChange > 0 ? (isDeactivating ? "down" : "up") : "neutral"
        }
        description={hasError ? "" : pendingDescription}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Commission"
        value={isLoading ? null : hasError ? "Error" : commissionDisplay}
        description={commissionDescription}
        icon={<Percent className="h-4 w-4 text-aero-purple" />}
        isLoading={isLoading}
        isError={hasError}
      />
      <StakingMetricsCard
        title="Estimated APY"
        value={isLoading ? null : hasError ? "Error" : formattedApy}
        icon={<TrendingUp className="h-4 w-4 text-aero-purple" />}
        isLoading={isLoading}
        isError={hasError || !estimatedApy}
      />
      
      {/* Secondary metrics row - less important metrics */}
      <div className="grid grid-cols-2 col-span-1 sm:col-span-2 md:col-span-4 gap-4 mt-2">
        <StakingMetricsCard
          title="Vote Rate"
          value={isLoading ? null : hasError ? "Error" : formattedVoteRate}
          icon={<ArrowUpRight className="h-3 w-3 text-aero-purple" />}
          isLoading={isLoading}
          isError={hasError || voteRate === undefined}
          isSecondary={true}
        />
        <StakingMetricsCard
          title="Skip Rate"
          value={isLoading ? null : hasError ? "Error" : formattedSkipRate}
          icon={<ArrowDownRight className="h-3 w-3 text-aero-purple" />}
          isLoading={isLoading}
          isError={hasError || skipRate === undefined}
          isSecondary={true}
        />
      </div>
    </div>
  );
};
