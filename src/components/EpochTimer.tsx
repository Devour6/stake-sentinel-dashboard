
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface EpochTimerProps {
  currentEpoch: number;
  timeRemaining?: number; // in seconds
  isLoading?: boolean;
}

export const EpochTimer = ({ 
  currentEpoch, 
  timeRemaining = 0,
  isLoading = false 
}: EpochTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(timeRemaining);

  useEffect(() => {
    // Update remaining time when prop changes
    setRemainingTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    // Set up timer to count down every second
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time remaining as days, hours, minutes
  const formatTimeRemaining = () => {
    if (remainingTime <= 0) return "Epoch change imminent";
    
    const days = Math.floor(remainingTime / 86400);
    const hours = Math.floor((remainingTime % 86400) / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <Card className="overflow-hidden glass-card animate-fade-in border-gojira-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-gojira-red" />
          Epoch Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 bg-muted/30 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">Epoch {currentEpoch}</div>
            <CardDescription className="flex items-center gap-1">
              {formatTimeRemaining()} until next epoch
            </CardDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
