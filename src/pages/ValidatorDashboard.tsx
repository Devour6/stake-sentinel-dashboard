
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ValidatorHeader } from "@/components/validator/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import StakeModal from "@/components/StakeModal";
import { StakeChart } from "@/components/StakeChart";
import { 
  fetchValidatorInfo, 
  fetchValidatorMetrics, 
  fetchOnchainTotalStake,
  fetchOnchainStakeChanges,
  fetchOnchainStakeHistory,
  fetchSolanaFMStake,
  fetchSolanaFMStakeHistory,
  type ValidatorInfo,
  type ValidatorMetrics,
  type StakeHistoryItem,
  VALIDATOR_PUBKEY
} from "@/services/solanaApi";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
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
  
  const [totalStake, setTotalStake] = useState<number>(0);
  const [stakeHistory, setStakeHistory] = useState<StakeHistoryItem[]>([]);
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
      
      // Fetch all data in parallel to speed up loading
      const results = await Promise.allSettled([
        // Basic validator info
        fetchValidatorInfo(votePubkey),
        fetchValidatorMetrics(votePubkey),
        
        // Get stake information from multiple sources for redundancy
        fetchOnchainTotalStake(votePubkey),
        fetchSolanaFMStake(votePubkey),
        
        // Get stake changes
        fetchOnchainStakeChanges(votePubkey),
        
        // Get stake history from multiple sources
        fetchSolanaFMStakeHistory(votePubkey),
        fetchOnchainStakeHistory(votePubkey),
        
        // Get delegator count
        fetchDelegatorCount(votePubkey)
      ]);
      
      // Extract results from the promises
      const [
        infoResult, 
        metricsResult, 
        onchainStakeResult, 
        solanaFMStakeResult, 
        stakeChangesResult, 
        solanaFMHistoryResult, 
        onchainHistoryResult, 
        delegatorCountResult
      ] = results;
      
      // Process validator info
      if (infoResult.status === 'fulfilled' && infoResult.value) {
        console.log("Validator info:", infoResult.value);
        setValidatorInfo(infoResult.value);
      } else {
        console.error("Failed to fetch validator info:", infoResult);
        setError("Failed to retrieve validator information");
      }
      
      // Process validator metrics
      if (metricsResult.status === 'fulfilled' && metricsResult.value) {
        console.log("Validator metrics:", metricsResult.value);
        setValidatorMetrics(metricsResult.value);
      }
      
      // Process total stake using multiple sources
      let finalStake = 0;
      
      // Try on-chain stake first
      if (onchainStakeResult.status === 'fulfilled' && onchainStakeResult.value > 0) {
        console.log("Using on-chain stake:", onchainStakeResult.value);
        finalStake = onchainStakeResult.value;
      } 
      // Try SolanaFM stake next
      else if (solanaFMStakeResult.status === 'fulfilled' && solanaFMStakeResult.value > 0) {
        console.log("Using SolanaFM stake:", solanaFMStakeResult.value);
        finalStake = solanaFMStakeResult.value;
      } 
      // Fall back to metrics or info if available
      else if (metricsResult.status === 'fulfilled' && metricsResult.value?.totalStake > 0) {
        console.log("Using metrics stake:", metricsResult.value.totalStake);
        finalStake = metricsResult.value.totalStake;
      } else if (infoResult.status === 'fulfilled' && infoResult.value?.activatedStake > 0) {
        console.log("Using info stake:", infoResult.value.activatedStake);
        finalStake = infoResult.value.activatedStake;
      }
      
      // Set total stake
      setTotalStake(finalStake);
      
      // Process stake changes
      if (stakeChangesResult.status === 'fulfilled') {
        console.log("Stake changes:", stakeChangesResult.value);
        setStakeChanges(stakeChangesResult.value);
      }
      
      // Process stake history (use the source with most data points)
      let bestHistory: StakeHistoryItem[] = [];
      
      if (solanaFMHistoryResult.status === 'fulfilled' && solanaFMHistoryResult.value && solanaFMHistoryResult.value.length > 0) {
        console.log("SolanaFM history:", solanaFMHistoryResult.value);
        bestHistory = solanaFMHistoryResult.value;
      }
      
      if (onchainHistoryResult.status === 'fulfilled' && onchainHistoryResult.value && 
          (bestHistory.length === 0 || onchainHistoryResult.value.length > bestHistory.length)) {
        console.log("On-chain history:", onchainHistoryResult.value);
        bestHistory = onchainHistoryResult.value;
      }
      
      // Only update if we got valid history data
      if (bestHistory.length > 0) {
        setStakeHistory(bestHistory);
      }
      
      // Process delegator count
      if (delegatorCountResult.status === 'fulfilled' && delegatorCountResult.value) {
        console.log("Delegator count:", delegatorCountResult.value);
        setDelegatorCount(delegatorCountResult.value);
      }
      
      if (showToast && infoResult.status === 'fulfilled' && infoResult.value) {
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

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeModalClose = () => {
    setIsStakeModalOpen(false);
  };

  const activatingStake = stakeChanges?.activatingStake || 0;
  const deactivatingStake = stakeChanges?.deactivatingStake || 0;
  
  // Use the largest pending change and indicate whether it's activating or deactivating
  const pendingStakeChange = Math.max(activatingStake, deactivatingStake);
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
          hasError={!!error && totalStake <= 0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          <div className="lg:col-span-4 space-y-5">
            <EpochStatusCard />
          </div>
          
          <div className="lg:col-span-8">
            <StakeChart 
              data={stakeHistory} 
              isLoading={isLoading} 
            />
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
