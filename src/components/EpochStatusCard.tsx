
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { EpochInfo } from "@/services/api/types";
import { fetchEpochInfo, estimateEpochTimeRemaining } from "@/services/api/epochApi";

export function EpochStatusCard() {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch epoch info
  useEffect(() => {
    async function loadEpochInfo() {
      try {
        setIsLoading(true);
        const info = await fetchEpochInfo();
        setEpochInfo(info);
        
        // Calculate time remaining
        const remaining = estimateEpochTimeRemaining(info);
        setTimeRemaining(remaining);
      } catch (error) {
        console.error("Error loading epoch info:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEpochInfo();
    
    // Refresh every minute
    const intervalId = setInterval(loadEpochInfo, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "Epoch change imminent";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours}h ${minutes}m ${secs}s`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!epochInfo) return 0;
    return (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100;
  };

  return (
    <Card className="glass-card border-gojira-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-gojira-red" />
          Current Epoch
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 bg-muted/30 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold">Epoch {epochInfo?.epoch}</div>
            <div className="text-sm text-muted-foreground">
              {formatTimeRemaining(timeRemaining)} remaining
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gojira-gray-dark/50 h-1.5 rounded-full mt-2">
              <div 
                className="bg-gojira-red h-1.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {epochInfo?.slotIndex.toLocaleString()} / {epochInfo?.slotsInEpoch.toLocaleString()} slots
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
