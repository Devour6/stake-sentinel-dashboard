
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarClock } from "lucide-react";
import { EpochTimer } from "./EpochTimer";
import { fetchEpochInfo, estimateEpochTimeRemaining } from "@/services/api/epochApi";

interface EpochInfo {
  epoch: number;
  slot: number;
  slotsInEpoch: number;
}

interface EpochStatusCardProps {
  compact?: boolean;
}

export const EpochStatusCard = ({ compact = false }: EpochStatusCardProps) => {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEpochData = async () => {
      try {
        // Fetch real epoch data
        const epochData = await fetchEpochInfo();
        
        // Set the time remaining
        const remaining = estimateEpochTimeRemaining(epochData);
        
        setEpochInfo({
          epoch: epochData.epoch,
          slot: epochData.slotIndex,
          slotsInEpoch: epochData.slotsInEpoch
        });
        
        setTimeRemaining(remaining);
      } catch (error) {
        console.error("Failed to fetch epoch info:", error);
        
        // Fallback to mock data
        setEpochInfo({
          epoch: 757,
          slot: 428451,
          slotsInEpoch: 432000
        });
        
        setTimeRemaining(86400); // 1 day fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpochData();
    // In real implementation, you might want to poll this data periodically
  }, []);

  if (compact) {
    return (
      <Card className="overflow-hidden bg-gojira-gray-dark/50 shadow-md border-gojira-gray-light">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gojira-red" />
            <div>
              <span className="text-sm font-medium">Current Epoch: </span>
              <span className="text-sm font-bold">{isLoading ? "..." : epochInfo?.epoch}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EpochTimer 
              currentEpoch={epochInfo?.epoch || 0}
              timeRemaining={timeRemaining}
              isLoading={isLoading}
              compact={true} 
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-gojira-red" />
          Epoch Status
        </CardTitle>
        <CardDescription>Current Solana blockchain epoch information</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted/30 rounded animate-pulse"></div>
            <div className="h-6 w-40 bg-muted/30 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Epoch</span>
              <span className="font-semibold">{epochInfo?.epoch}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Slot Progress</span>
              <span className="font-semibold">
                {epochInfo?.slot} / {epochInfo?.slotsInEpoch}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <EpochTimer 
                currentEpoch={epochInfo?.epoch || 0}
                timeRemaining={timeRemaining}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
