
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ValidatorHeader } from "@/components/validator/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import { StakeHistoryChart } from "@/components/stakes/StakeHistoryChart";
import StakeModal from "@/components/StakeModal";
import { 
  fetchValidatorInfo, 
  fetchValidatorMetrics, 
  type ValidatorInfo,
  type ValidatorMetrics,
  VALIDATOR_PUBKEY
} from "@/services/solanaApi";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { fetchSolanaFMStake, fetchSolanaFMStakeHistory } from "@/services/api/solanaFMApi";
import { fetchOnchainStakeChanges } from "@/services/api/onchainStakeApi";
import { fetchDelegatorCount } from "@/services/api/stakeApi";

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
  const [delegatorCount, setDelegatorCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  
  // SolanaFM and on-chain data state
  const [totalStake, setTotalStake] = useState<number>(0);
  const [stakeHistory, setStakeHistory] = useState<any[]>([]);
  const [stakeChanges, setStakeChanges] = useState<{
    activatingStake: number;
    deactivatingStake: number;
  }>({ activatingStake: 0, deactivatingStake: 0 });
  
  const fetchData = async (showToast = false) => {
    if (!votePubkey) {
      navigate("/");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching data for validator:", votePubkey);
      
      // Fetch validator info and metrics
      const [info, metrics, delegators] = await Promise.all([
        fetchValidatorInfo(votePubkey),
        fetchValidatorMetrics(votePubkey),
        fetchDelegatorCount(votePubkey)
      ]);
      
      console.log("Validator info:", info);
      console.log("Validator metrics:", metrics);
      console.log("Delegator count:", delegators);
      
      if (!info) {
        throw new Error("Validator not found");
      }
      
      setValidatorInfo(info);
      setValidatorMetrics(metrics);
      setDelegatorCount(delegators);
      
      // Fetch SolanaFM and on-chain data in parallel
      await fetchSolanaData(votePubkey);
      
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
  
  // Separate function to fetch SolanaFM data
  const fetchSolanaData = async (votePubkey: string) => {
    try {
      console.log("Fetching SolanaFM and on-chain data for validator:", votePubkey);
      
      // Fetch total stake, stake history, and stake changes in parallel
      const [stakeData, historyData, stakeChangesData] = await Promise.all([
        fetchSolanaFMStake(votePubkey),
        fetchSolanaFMStakeHistory(votePubkey),
        fetchOnchainStakeChanges(votePubkey)
      ]);
      
      console.log("SolanaFM total stake:", stakeData);
      console.log("SolanaFM stake history:", historyData);
      console.log("On-chain stake changes:", stakeChangesData);
      
      // Update state with fetched data
      if (stakeData > 0) {
        setTotalStake(stakeData);
      } else if (validatorMetrics?.totalStake) {
        // Fallback to metrics data if SolanaFM returns 0
        setTotalStake(validatorMetrics.totalStake);
      } else if (validatorInfo?.activatedStake) {
        // Further fallback
        setTotalStake(validatorInfo.activatedStake);
      }
      
      if (historyData && historyData.length > 0) {
        setStakeHistory(historyData);
      }
      
      setStakeChanges(stakeChangesData);
      
    } catch (err) {
      console.error("Error fetching SolanaFM data:", err);
      // Keep previous data if available, otherwise provide fallback
      if (totalStake <= 0) {
        // Use metrics data as fallback
        const fallbackStake = validatorMetrics?.totalStake || validatorInfo?.activatedStake || 0;
        setTotalStake(fallbackStake);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(true);
    
    // Explicitly refresh SolanaFM data
    if (votePubkey) {
      await fetchSolanaData(votePubkey);
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [votePubkey]);

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeModalClose = () => {
    setIsStakeModalOpen(false);
  };

  // Log state variables to help debug
  useEffect(() => {
    console.log("Current validator info state:", validatorInfo);
    console.log("Current validator metrics state:", validatorMetrics);
    console.log("Current total stake from SolanaFM:", totalStake);
    console.log("Current stake changes from on-chain:", stakeChanges);
    console.log("Current stake history from SolanaFM:", stakeHistory);
  }, [validatorInfo, validatorMetrics, totalStake, stakeChanges, stakeHistory]);

  // Get activating and deactivating stake values
  const activatingStake = stakeChanges.activatingStake || 0;
  const deactivatingStake = stakeChanges.deactivatingStake || 0;
  
  // Calculate pending stake change
  const pendingStakeChange = Math.max(activatingStake, deactivatingStake) || 
    validatorMetrics?.pendingStakeChange || 0;
  
  // Determine if deactivating
  const isDeactivating = deactivatingStake > activatingStake;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gojira-gray to-gojira-gray-dark">
      {isRefreshing && <RefreshOverlay />}
      
      <div className="container max-w-7xl mx-auto py-4 px-3 sm:px-5 lg:px-6">
        <ValidatorHeader 
          validatorPubkey={votePubkey || ""}
          validatorName={validatorInfo?.name}
          validatorIcon={validatorInfo?.icon}
          identityPubkey={validatorInfo?.identity}
          description={validatorMetrics?.description}
          version={validatorMetrics?.version}
          uptime={validatorMetrics?.uptime}
          website={validatorInfo?.website || validatorMetrics?.website}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onBack={() => navigate("/")}
          onStakeModalOpen={handleStakeModalOpen}
        />
        
        <div className="mt-6"></div>
        
        {error && !isLoading && (
          <div className="my-4 p-5 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}
        
        <ValidatorMetricsGrid
          totalStake={totalStake}
          pendingStakeChange={pendingStakeChange}
          isDeactivating={isDeactivating}
          commission={validatorMetrics?.commission || validatorInfo?.commission || 0}
          mevCommission={validatorMetrics?.mevCommission}
          estimatedApy={validatorMetrics?.estimatedApy}
          delegatorCount={delegatorCount}
          isLoading={isLoading}
          hasError={!!error}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          <div className="lg:col-span-4 space-y-5">
            <EpochStatusCard />
          </div>
          
          <div className="lg:col-span-8">
            {votePubkey && stakeHistory.length > 0 ? (
              <StakeHistoryChart vote_identity={votePubkey} initialData={stakeHistory} />
            ) : (
              <StakeHistoryChart vote_identity={votePubkey || ""} />
            )}
          </div>
        </div>
        
        <div className="mt-5 text-center text-sm text-muted-foreground">
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

      <StakeModal 
        isOpen={isStakeModalOpen} 
        onClose={handleStakeModalClose} 
        validatorPubkey={votePubkey || VALIDATOR_PUBKEY}
        validatorName={validatorInfo?.name || "Validator"}
      />
    </div>
  );
};

export default ValidatorDashboard;
