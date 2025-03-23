import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import StakeModal from "@/components/StakeModal";
import { VALIDATOR_PUBKEY } from "@/services/api/constants";
import { HomeContent } from "@/components/home/HomeContent";
import PositionsModal from "@/components/PositionsModal";

const Home = () => {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isPositionsModalOpen, setPositionsModalOpen] = useState(false);

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeModalClose = () => {
    setIsStakeModalOpen(false);
  };

  return (
    <PageLayout>
      <HomeContent onStakeButtonClick={handleStakeModalOpen} />

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={handleStakeModalClose}
        validatorPubkey={VALIDATOR_PUBKEY}
        validatorName="AeroScan Validator"
      />

      <PositionsModal
        isOpen={isPositionsModalOpen}
        onClose={() => setPositionsModalOpen(false)}
      />
    </PageLayout>
  );
};

export default Home;
