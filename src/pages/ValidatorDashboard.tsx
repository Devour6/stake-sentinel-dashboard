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
import { useValidatorData } from "@/hooks/useValidatorData";
import PageLayout from "@/components/layout/PageLayout";

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
    voteRate,
    skipRate,
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
    <PageLayout>
      <div className="container relative z-1 max-w-7xl mx-auto py-4 px-3 sm:px-5 lg:px-6 flex flex-col gap-4">
        {isRefreshing && <RefreshOverlay />}

        {error && !isLoading && <ErrorNotice error={error} />}

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
        />

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
          voteRate={voteRate}
          skipRate={skipRate}
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
      </div>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={handleStakeModalClose}
        validatorPubkey={VALIDATOR_PUBKEY}
        validatorName="AeroScan Validator"
      />
    </PageLayout>
  );
};

export default ValidatorDashboard;
