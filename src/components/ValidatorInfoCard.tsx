
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidatorInfo } from "@/services/solanaApi";
import { Check, AlertTriangle, Server, Vote, ArrowUpDown } from "lucide-react";

interface ValidatorInfoCardProps {
  validatorInfo: ValidatorInfo | null;
  isLoading: boolean;
}

export const ValidatorInfoCard = ({ 
  validatorInfo, 
  isLoading 
}: ValidatorInfoCardProps) => {
  const getStatusColor = () => {
    if (isLoading) return "bg-muted-foreground/20";
    if (!validatorInfo) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Validator Status
            </CardTitle>
            <CardDescription>Current validator information</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()} animate-pulse-subtle`}></div>
            <span className="text-sm font-medium">
              {isLoading ? "Checking..." : validatorInfo ? "Active" : "Offline"}
            </span>
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
        ) : !validatorInfo ? (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
            <p className="text-center text-muted-foreground">
              Could not fetch validator information. Please try again later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Vote className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-muted-foreground">Last Vote</span>
                </div>
                <p className="font-medium">{validatorInfo.lastVote.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-muted-foreground">Root Slot</span>
                </div>
                <p className="font-medium">{validatorInfo.rootSlot.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Credits (Current Epoch)</span>
                <div className="font-medium">{validatorInfo.epochCredits.toLocaleString()}</div>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-green-500/10">
                <Check className="h-3 w-3" />
                <span>Healthy</span>
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
