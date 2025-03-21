
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ValidatorHeader } from "@/components/validator/ValidatorHeader";
import { ValidatorMetricsGrid } from "@/components/StakingMetricsCard";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import StakeModal from "@/components/StakeModal";
import { StakeChart } from "@/components/StakeChart";
import { VALIDATOR_PUBKEY } from "@/services/api/constants";
import { RefreshOverlay } from "@/components/validator/RefreshOverlay";
import { ErrorNotice } from "@/components/validator/ErrorNotice";
import { DashboardFooter } from "@/components/validator/DashboardFooter";
import { useValidatorData } from "@/hooks/useValidatorData";

const ValidatorDashboard = () => {
  const { votePubkey } = useParams<{ votePubkey: string }>();
  const navigate = useNavigate();
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const {
    isLoading,
    isRefreshing,
    validatorInfo,
    validatorMetrics,
    delegatorCount,
    error,
    totalStake,
    stakeHistory,
    stakeChanges,
    handleRefresh,
  } = useValidatorData(votePubkey);

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeModalClose = () => {
    setIsStakeModalOpen(false);
  };

  const activatingStake = stakeChanges?.activatingStake || 0;
  const deactivatingStake = stakeChanges?.deactivatingStake || 0;

  // Use the largest pending change and indicate whether it's activating or deactivating
  const pendingStakeChange = Math.abs(activatingStake - deactivatingStake);
  const isDeactivating = deactivatingStake > activatingStake;

  // If no votePubkey, redirect to home
  if (!votePubkey) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aero-dark to-aero-gray-dark relative overflow-hidden">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "url('/lovable-uploads/28b498b2-7737-4119-b4b7-47387f6617b2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Cosmic elements */}
      <div className="shooting-star shooting-star-1"></div>
      <div className="shooting-star shooting-star-2"></div>
      <div className="shooting-star shooting-star-3"></div>
      <div className="shooting-star shooting-star-4"></div>
      <div className="shooting-star shooting-star-5"></div>
      
      <div className="cosmic-particle particle-1"></div>
      <div className="cosmic-particle particle-2"></div>
      <div className="cosmic-particle particle-3"></div>
      <div className="cosmic-particle particle-4"></div>
      <div className="cosmic-particle particle-5"></div>
      <div className="cosmic-particle particle-6"></div>
      <div className="cosmic-particle particle-7"></div>
      <div className="cosmic-particle particle-8"></div>
      
      <div className="pulsating-star star-1"></div>
      <div className="pulsating-star star-2"></div>
      <div className="pulsating-star star-3"></div>
      <div className="pulsating-star star-4"></div>
      <div className="pulsating-star star-5"></div>

      {isRefreshing && <RefreshOverlay />}

      <div className="container relative z-1 max-w-7xl mx-auto py-4 px-3 sm:px-5 lg:px-6">
        <ValidatorHeader
          validatorPubkey={votePubkey}
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

        {error && !isLoading && <ErrorNotice error={error} />}

        <ValidatorMetricsGrid
          totalStake={totalStake}
          pendingStakeChange={pendingStakeChange}
          isDeactivating={isDeactivating}
          commission={
            validatorMetrics?.commission || validatorInfo?.commission || 0
          }
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
            <StakeChart data={stakeHistory} isLoading={isLoading} />
          </div>
        </div>

        <DashboardFooter />
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
