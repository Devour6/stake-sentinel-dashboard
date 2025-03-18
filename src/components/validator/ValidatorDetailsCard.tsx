
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidatorMetrics } from "@/services/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Percent, TrendingUp, Info, Activity, Tag } from "lucide-react";

interface ValidatorDetailsCardProps {
  metrics: ValidatorMetrics | null;
  isLoading: boolean;
}

export const ValidatorDetailsCard = ({ metrics, isLoading }: ValidatorDetailsCardProps) => {
  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gojira-red" />
              Validator Details
            </CardTitle>
            <CardDescription>Additional information from Stakewiz</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-muted/30 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : !metrics ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No additional details available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-gojira-red" />
                  <span className="text-sm text-muted-foreground">Description</span>
                </div>
                <p className="text-sm">{metrics.description}</p>
              </div>
            )}
            
            {metrics.mevCommission !== undefined && metrics.mevCommission !== metrics.commission && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Percent className="h-3.5 w-3.5 text-gojira-red" />
                  <span className="text-sm text-muted-foreground">MEV Commission</span>
                </div>
                <p className="font-medium">{(metrics.mevCommission).toFixed(2)}%</p>
              </div>
            )}
            
            {metrics.estimatedApy !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-gojira-red" />
                  <span className="text-sm text-muted-foreground">APY Estimate</span>
                </div>
                <p className="font-medium">{(metrics.estimatedApy * 100).toFixed(2)}%</p>
              </div>
            )}
            
            {metrics.uptime30d !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-gojira-red" />
                  <span className="text-sm text-muted-foreground">Uptime (30 days)</span>
                </div>
                <p className="font-medium">{metrics.uptime30d.toFixed(2)}%</p>
                <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, metrics.uptime30d)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {metrics.version && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-gojira-red" />
                  <span className="text-sm text-muted-foreground">Version</span>
                </div>
                <p className="font-medium">{metrics.version}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
