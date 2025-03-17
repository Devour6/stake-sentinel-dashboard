
import { useEffect, useState } from "react";
import { ValidatorHeader } from "@/components/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { StakeChart } from "@/components/StakeChart";
import { ValidatorInfoCard } from "@/components/ValidatorInfoCard";
import { 
  fetchValidatorInfo, 
  fetchValidatorMetrics, 
  fetchStakeHistory,
  ValidatorInfo,
  ValidatorMetrics,
  StakeHistoryItem
} from "@/services/solanaApi";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo | null>(null);
  const [validatorMetrics, setValidatorMetrics] = useState<ValidatorMetrics | null>(null);
  const [stakeHistory, setStakeHistory] = useState<StakeHistoryItem[]>([]);
  
  const VALIDATOR_PUBKEY = "goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [info, metrics, history] = await Promise.all([
          fetchValidatorInfo(),
          fetchValidatorMetrics(),
          fetchStakeHistory()
        ]);
        
        setValidatorInfo(info);
        setValidatorMetrics(metrics);
        setStakeHistory(history);
        
        if (info) {
          toast({
            title: "Data refreshed",
            description: "Validator information updated successfully",
            variant: "default",
            className: "bg-gojira-gray-light border-gojira-red text-white",
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not retrieve validator information",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling interval (every 5 minutes)
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gojira-gray to-gojira-gray-dark">
      {/* Glass container */}
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ValidatorHeader 
          validatorPubkey={VALIDATOR_PUBKEY}
          identityPubkey={validatorInfo?.identity}
          isLoading={isLoading}
        />
        
        {/* Validator metrics */}
        {validatorMetrics ? (
          <ValidatorMetricsGrid
            totalStake={validatorMetrics.totalStake}
            activatingStake={validatorMetrics.activatingStake}
            stakeChange24h={validatorMetrics.stakeChange24h}
            stakeChangePercentage={validatorMetrics.stakeChangePercentage}
            commission={validatorMetrics.commission}
            delegatorCount={validatorMetrics.delegatorCount}
            isLoading={isLoading}
          />
        ) : (
          <ValidatorMetricsGrid
            totalStake={0}
            activatingStake={0}
            stakeChange24h={0}
            stakeChangePercentage={0}
            commission={0}
            delegatorCount={0}
            isLoading={true}
          />
        )}
        
        {/* Two column layout for chart and validator info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Chart takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <StakeChart data={stakeHistory} isLoading={isLoading} />
          </div>
          
          {/* Validator info card takes 1/3 of the space */}
          <div>
            <ValidatorInfoCard validatorInfo={validatorInfo} isLoading={isLoading} />
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

export default Index;
