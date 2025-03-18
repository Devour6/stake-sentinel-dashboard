
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarClock } from "lucide-react";
import { EpochTimer } from "./EpochTimer";
import { fetchEpochInfo } from "@/services/api/epochApi";
import { Spinner } from "@/components/ui/spinner";

interface EpochStatusCardProps {
  compact?: boolean;
}

export const EpochStatusCard = ({ compact = false }: EpochStatusCardProps) => {
  const [epochInfo, setEpochInfo] = useState<{
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    timeRemaining: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpochData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const info = await fetchEpochInfo();
        
        if (info) {
          setEpochInfo({
            epoch: info.epoch,
            slotIndex: info.slotIndex,
            slotsInEpoch: info.slotsInEpoch,
            timeRemaining: info.timeRemaining || 0
          });
        } else {
          throw new Error("No epoch data in response");
        }
      } catch (error) {
        console.error("Failed to fetch epoch info:", error);
        setError("Failed to fetch current epoch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpochData();
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchEpochData, 30 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (compact) {
    return (
      <Card className="overflow-hidden bg-gojira-gray-dark/50 shadow-md border-gojira-gray-light">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gojira-red" />
            <div>
              <span className="text-sm font-medium">Current Epoch: </span>
              {isLoading ? (
                <span className="text-sm animate-pulse">Loading...</span>
              ) : error ? (
                <span className="text-sm text-red-500">Error</span>
              ) : (
                <span className="text-sm font-bold">{epochInfo?.epoch}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EpochTimer 
              currentEpoch={epochInfo?.epoch || 0}
              timeRemaining={epochInfo?.timeRemaining || 0}
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
          <div className="h-24 flex items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-red-500">{error}</p>
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
                {epochInfo?.slotIndex.toLocaleString()} / {epochInfo?.slotsInEpoch.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <EpochTimer 
                currentEpoch={epochInfo?.epoch || 0}
                timeRemaining={epochInfo?.timeRemaining || 0}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
