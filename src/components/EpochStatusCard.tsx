
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarClock, AlertCircle, RefreshCw } from "lucide-react";
import { EpochTimer } from "./EpochTimer";
import { fetchEpochInfo } from "@/services/api/epochApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

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
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSuccessfulSource, setLastSuccessfulSource] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpochData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try our improved fetchEpochInfo first
        let info = await fetchEpochInfo();
        
        // If that fails, try a direct fallback to Solana Explorer as a last resort
        if (!info) {
          try {
            console.log("Trying direct Explorer scraping fallback...");
            // This is a fallback to get data from the Solana Explorer public API
            const explorerResponse = await axios.get("https://explorer-api.solana.com/epoch-info");
            if (explorerResponse.data && explorerResponse.data.result) {
              setLastSuccessfulSource("Solana Explorer API");
              const result = explorerResponse.data.result;
              
              info = {
                epoch: result.epoch,
                slotIndex: result.slotIndex,
                slotsInEpoch: result.slotsInEpoch,
                absoluteSlot: result.absoluteSlot,
                blockHeight: result.blockHeight || 0,
                transactionCount: null,
                timeRemaining: result.epochTimeRemaining || 0
              };
            }
          } catch (fallbackError) {
            console.error("Explorer fallback also failed:", fallbackError);
          }
        } else {
          setLastSuccessfulSource("RPC Endpoint");
        }
        
        if (info) {
          setEpochInfo({
            epoch: info.epoch,
            slotIndex: info.slotIndex,
            slotsInEpoch: info.slotsInEpoch,
            timeRemaining: info.timeRemaining || 0
          });
          
          // Show toast on successful refresh if it was previously in error state
          if (error && retryCount > 0) {
            toast.success(`Successfully connected to Solana network via ${lastSuccessfulSource}`);
          }
        } else {
          throw new Error("Failed to retrieve epoch data from all sources");
        }
      } catch (error) {
        console.error("Failed to fetch epoch info:", error);
        setError("Unable to fetch current epoch data. Connection issue with all data sources.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchEpochData();
    
    // Poll for updates every 30 seconds - only if not in error state
    const intervalId = !error ? setInterval(fetchEpochData, 30 * 1000) : undefined;
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [retryCount, error]);

  const handleRetry = () => {
    setIsRefreshing(true);
    setRetryCount(prev => prev + 1);
    toast.info("Attempting to reconnect to Solana network...");
  };

  if (compact) {
    return (
      <Card className="overflow-hidden bg-aero-gray-dark/50 shadow-md border-aero-gray-light">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-aero-red" />
            <div>
              <span className="text-sm font-medium">Current Epoch: </span>
              {isLoading ? (
                <span className="text-sm animate-pulse">Loading...</span>
              ) : error ? (
                <span className="text-sm text-red-500">Connection Error</span>
              ) : (
                <span className="text-sm font-bold">{epochInfo?.epoch}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {error ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRetry}
                className="h-6 px-2 text-xs"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            ) : (
              <EpochTimer 
                currentEpoch={epochInfo?.epoch || 0}
                timeRemaining={epochInfo?.timeRemaining || 0}
                isLoading={isLoading}
                compact={true} 
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-fade-in border-aero-gray-light">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-aero-red" />
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
          <div className="py-4 text-center space-y-3">
            <div className="flex justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-muted-foreground">
              Trying multiple sources for reliable epoch data
            </p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
              Retry Connection
            </Button>
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
            
            {lastSuccessfulSource && (
              <div className="mt-2 text-right">
                <span className="text-xs text-muted-foreground">Source: {lastSuccessfulSource}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
