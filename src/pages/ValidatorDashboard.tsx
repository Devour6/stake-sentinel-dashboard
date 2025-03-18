
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ValidatorHeader } from "@/components/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { ValidatorInfoCard } from "@/components/ValidatorInfoCard";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import { StakeHistoryChart } from "@/components/stakes/StakeHistoryChart";
import { 
  fetchValidatorInfo, 
  fetchValidatorMetrics, 
  fetchStakeHistory,
  type ValidatorInfo,
  type ValidatorMetrics,
  type StakeHistoryItem
} from "@/services/solanaApi";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

const RefreshOverlay = () => (
  <div className="refresh-overlay">
    <div className="refresh-spinner"></div>
  </div>
);

const ValidatorDashboard = () => {
  const { votePubkey } = useParams<{ votePubkey: string }>();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo | null>(null);
  const [validatorMetrics, setValidatorMetrics] = useState<ValidatorMetrics | null>(null);
  const [stakeHistory, setStakeHistory] = useState<StakeHistoryItem[]>([]);
  
  const fetchData = async (showToast = false) => {
    if (!votePubkey) {
      navigate("/");
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch data in parallel with the provided vote pubkey
      const [info, metrics, history] = await Promise.all([
        fetchValidatorInfo(votePubkey),
        fetchValidatorMetrics(votePubkey),
        fetchStakeHistory(votePubkey)
      ]);
      
      if (!info) {
        throw new Error("Validator not found");
      }
      
      setValidatorInfo(info);
      setValidatorMetrics(metrics);
      setStakeHistory(history);
      
      if (showToast && info) {
        uiToast({
          title: "Data refreshed",
          description: "Validator information updated successfully",
          variant: "default",
          className: "bg-gojira-gray-light border-gojira-red text-white",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Could not retrieve validator information. Please check the validator address.");
      // Could navigate back to home if validator not found
      // navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(true);
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up polling interval (every 5 minutes)
    const intervalId = setInterval(() => fetchData(), 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [votePubkey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gojira-gray to-gojira-gray-dark">
      {isRefreshing && <RefreshOverlay />}
      
      {/* Glass container */}
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ValidatorHeader 
          validatorPubkey={votePubkey || ""}
          validatorName={validatorInfo?.name}
          validatorIcon={validatorInfo?.icon}
          identityPubkey={validatorInfo?.identity}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onBack={() => navigate("/")}
        />
        
        {/* Validator metrics */}
        {validatorMetrics ? (
          <ValidatorMetricsGrid
            totalStake={validatorMetrics.totalStake}
            pendingStakeChange={validatorMetrics.pendingStakeChange}
            isDeactivating={validatorMetrics.isDeactivating}
            commission={validatorMetrics.commission}
            isLoading={isLoading}
          />
        ) : (
          <ValidatorMetricsGrid
            totalStake={0}
            pendingStakeChange={0}
            commission={0}
            isLoading={true}
          />
        )}
        
        {/* Two column layout for chart and validator info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Chart takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            {votePubkey && <StakeHistoryChart vote_identity={votePubkey} />}
          </div>
          
          {/* Validator info card takes 1/3 of the space */}
          <div className="space-y-6">
            <ValidatorInfoCard validatorInfo={validatorInfo} isLoading={isLoading} />
            <EpochStatusCard />
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Data refreshes automatically every 5 minutes. Last updated: {new Date().toLocaleTimeString()}</p>
          <div className="mt-2 flex justify-center gap-1 items-center">
            <span>Powered by</span>
            <span className="text-gojira-red font-semibold">Gojira</span>
            <img 
              src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
              alt="Gojira Logo" 
              className="w-4 h-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorDashboard;
