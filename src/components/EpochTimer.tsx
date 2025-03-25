
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface EpochTimerProps {
  currentEpoch: number;
  timeRemaining?: number; // in seconds
  isLoading?: boolean;
  compact?: boolean; // Add compact prop
}

export const EpochTimer = ({ 
  currentEpoch, 
  timeRemaining = 0,
  isLoading = false,
  compact = false // Default to false
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
    const seconds = Math.floor(remainingTime % 60);
    
    if (compact) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    
    // More detailed format for full view
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-aero-red" />
        <span className="text-sm whitespace-nowrap">
          {isLoading ? "..." : formatTimeRemaining()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-md font-semibold whitespace-nowrap">
        {isLoading ? "..." : formatTimeRemaining()}
      </div>
    </div>
  );
};
