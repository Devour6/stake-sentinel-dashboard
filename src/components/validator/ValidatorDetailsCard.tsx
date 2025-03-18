
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Server, Code, Activity, Globe } from "lucide-react";
import { ValidatorMetrics } from "@/services/solanaApi";
import { Skeleton } from "@/components/ui/skeleton";

interface ValidatorDetailsCardProps {
  metrics: ValidatorMetrics | null;
  isLoading?: boolean;
}

export const ValidatorDetailsCard: FC<ValidatorDetailsCardProps> = ({ 
  metrics,
  isLoading = false
}) => {
  return (
    <Card className="glass-card border-gojira-gray-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-4 w-4 text-gojira-red" />
          Validator Details
        </CardTitle>
        <CardDescription>Technical information and metadata</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Description */}
            {metrics?.description && (
              <div className="bg-gojira-gray-dark/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-sm leading-relaxed">{metrics.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Version Information */}
              <div className="bg-gojira-gray-dark/30 p-3 rounded-lg">
                <h3 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Code className="h-3.5 w-3.5 text-gojira-red" />
                  Software Version
                </h3>
                <p className="text-sm font-mono">{metrics?.version || "Unknown"}</p>
              </div>
              
              {/* Uptime */}
              <div className="bg-gojira-gray-dark/30 p-3 rounded-lg">
                <h3 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-gojira-red" />
                  30-Day Uptime
                </h3>
                <p className="text-sm">
                  {metrics?.uptime30d !== undefined && metrics?.uptime30d !== null
                    ? `${metrics.uptime30d}%`
                    : "Data unavailable"}
                </p>
              </div>
              
              {/* Website */}
              {metrics?.website && (
                <div className="bg-gojira-gray-dark/30 p-3 rounded-lg sm:col-span-2">
                  <h3 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-gojira-red" />
                    Website
                  </h3>
                  <div className="flex items-center gap-2">
                    <a 
                      href={metrics.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gojira-red hover:underline flex items-center gap-1"
                    >
                      {metrics.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* MEV Configuration */}
              <div className="bg-gojira-gray-dark/30 p-3 rounded-lg">
                <h3 className="text-xs font-medium text-muted-foreground mb-1">MEV Configuration</h3>
                <p className="text-sm">
                  {metrics?.mevCommission !== undefined && metrics.mevCommission !== metrics.commission
                    ? `MEV Enabled (${metrics.mevCommission}% commission)`
                    : "Standard configuration"}
                </p>
              </div>
              
              {/* Commission */}
              <div className="bg-gojira-gray-dark/30 p-3 rounded-lg">
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Commission Rate</h3>
                <p className="text-sm">
                  {metrics?.commission !== undefined 
                    ? `${metrics.commission}%` 
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
