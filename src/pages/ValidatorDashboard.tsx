
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ValidatorHeader } from "@/components/validator/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { ValidatorInfoCard } from "@/components/ValidatorInfoCard";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import { StakeHistoryChart } from "@/components/stakes/StakeHistoryChart";
import { 
  fetchValidatorInfo, 
  fetchValidatorMetrics, 
  type ValidatorInfo,
  type ValidatorMetrics
} from "@/services/solanaApi";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const RefreshOverlay = () => (
  <div className="refresh-overlay">
    <div className="refresh-spinner"></div>
  </div>
);

const ValidatorDashboard = () => {
  const { votePubkey } = useParams<{ votePubkey: string }>();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo | null>(null);
  const [validatorMetrics, setValidatorMetrics] = useState<ValidatorMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async (showToast = false) => {
    if (!votePubkey) {
      navigate("/");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [info, metrics] = await Promise.all([
        fetchValidatorInfo(votePubkey),
        fetchValidatorMetrics(votePubkey)
      ]);
      
      if (!info) {
        throw new Error("Validator not found");
      }
      
      setValidatorInfo(info);
      setValidatorMetrics(metrics);
      
      if (showToast && info) {
        uiToast({
          title: "Data refreshed",
          description: "Validator information updated successfully",
          variant: "default",
          className: "bg-gojira-gray-light border-gojira-red text-white",
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to retrieve validator information");
      toast.error("Could not retrieve validator information. Please check the validator address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  useEffect(() => {
    fetchData();
    
    const intervalId = setInterval(() => fetchData(), 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [votePubkey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gojira-gray to-gojira-gray-dark">
      {isRefreshing && <RefreshOverlay />}
      
      <div className="container max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <ValidatorHeader 
          validatorPubkey={votePubkey || ""}
          validatorName={validatorInfo?.name}
          validatorIcon={validatorInfo?.icon}
          identityPubkey={validatorInfo?.identity}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onBack={() => navigate("/")}
        />
        
        <div className="mt-4 sm:mt-8"></div>
        
        {error && !isLoading && (
          <div className="my-4 sm:my-8 p-4 sm:p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}
        
        <ValidatorMetricsGrid
          totalStake={validatorMetrics?.totalStake || 0}
          pendingStakeChange={validatorMetrics?.pendingStakeChange || 0}
          isDeactivating={validatorMetrics?.isDeactivating || false}
          commission={validatorMetrics?.commission || 0}
          mevCommission={validatorMetrics?.mevCommission}
          estimatedApy={validatorMetrics?.estimatedApy}
          isLoading={isLoading}
          hasError={!!error}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <ValidatorInfoCard validatorInfo={validatorInfo} isLoading={isLoading} />
            <EpochStatusCard />
          </div>
          
          <div className="lg:col-span-2">
            {votePubkey && <StakeHistoryChart vote_identity={votePubkey} />}
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 text-center text-sm text-muted-foreground pb-16 sm:pb-8">
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
