
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarClock } from "lucide-react";
import { EpochTimer } from "./EpochTimer";
import axios from "axios";

// Set up Stakewiz API URL
const STAKEWIZ_API_URL = "https://api.stakewiz.com";

interface EpochInfo {
  epoch: number;
  slot: number;
  slotsInEpoch: number;
  timeRemaining: number; // in seconds
}

interface EpochStatusCardProps {
  compact?: boolean;
}

export const EpochStatusCard = ({ compact = false }: EpochStatusCardProps) => {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEpochData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get data directly from Stakewiz API
        const response = await axios.get(`${STAKEWIZ_API_URL}/epoch`, {
          timeout: 8000
        });
        
        if (response.data) {
          console.log("Epoch data from Stakewiz:", response.data);
          
          // Calculate time remaining based on slots remaining and slot time (400ms per slot)
          const slotsRemaining = response.data.epoch_slot_info.slots_in_epoch - response.data.epoch_slot_info.current_slot;
          const timeRemaining = slotsRemaining * 0.4; // 400ms per slot = 0.4 seconds
          
          setEpochInfo({
            epoch: response.data.epoch,
            slot: response.data.epoch_slot_info.current_slot,
            slotsInEpoch: response.data.epoch_slot_info.slots_in_epoch,
            timeRemaining: timeRemaining
          });
        }
      } catch (error) {
        console.error("Failed to fetch epoch info from Stakewiz:", error);
        
        // Fallback to mock data
        setEpochInfo({
          epoch: 758, // Use a reasonable current epoch
          slot: 280000,
          slotsInEpoch: 432000,
          timeRemaining: 60800 // About 17 hours
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpochData();
    
    // Poll for updates every 5 minutes
    const intervalId = setInterval(fetchEpochData, 5 * 60 * 1000);
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
              <span className="text-sm font-bold">{isLoading ? "..." : epochInfo?.epoch}</span>
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
