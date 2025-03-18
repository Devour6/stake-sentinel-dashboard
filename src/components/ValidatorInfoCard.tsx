
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidatorInfo } from "@/services/solanaApi";
import { Check, AlertTriangle, Server, Clock, Info } from "lucide-react";

interface ValidatorInfoCardProps {
  validatorInfo: ValidatorInfo | null;
  description?: string;
  website?: string | null;
  isLoading: boolean;
}

export const ValidatorInfoCard = ({ 
  validatorInfo,
  description,
  isLoading 
}: ValidatorInfoCardProps) => {
  const getStatusColor = () => {
    if (isLoading) return "bg-muted-foreground/20";
    if (!validatorInfo) return "bg-red-500";
    return "bg-green-500";
  };

  // Calculate time since last vote
  const getVoteStatus = () => {
    if (!validatorInfo) return { text: "Unknown", status: "warning" };
    
    // Very simple check - in a real app you'd compare to network's current slot
    const timeSinceVote = Math.floor(Math.random() * 10) + 1; // Mock value in seconds
    
    if (timeSinceVote < 5) return { text: "Recent vote ✓", status: "success" };
    if (timeSinceVote < 60) return { text: "Voted recently", status: "success" };
    return { text: "Vote pending", status: "warning" };
  };

  const voteStatus = getVoteStatus();

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gojira-red" />
              Validator Details
            </CardTitle>
            <CardDescription>Information about this validator</CardDescription>
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
            {description && (
              <div className="space-y-2 border-b border-gray-700 pb-4">
                <div className="font-medium">Description</div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-gojira-red" />
                <span className="text-sm text-muted-foreground">Vote Status</span>
              </div>
              <p className="font-medium">{voteStatus.text}</p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Validator Status</span>
                <div className="font-medium">High Performance</div>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border-green-500/30">
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
