
import { useRef, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SearchBar from "@/components/search/SearchBar";
import Footer from "@/components/layout/Footer";
import StakeModal from "@/components/StakeModal";
import { EpochStatusCard } from "@/components/EpochStatusCard";
import { VALIDATOR_PUBKEY } from "@/services/api/constants";
import Logo from "@/components/layout/Logo";

const Home = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  const handleStakeModalClose = () => {
    setIsStakeModalOpen(false);
  };

  return (
    <PageLayout onStakeModalOpen={handleStakeModalOpen}>
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="flex flex-col items-center justify-center space-y-4 max-w-4xl mx-auto">
          <div className="text-center mb-2">
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Find information about Solana validators, their performance, and stake distribution.
            </p>
          </div>
          
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {/* Search bar takes precedence */}
            <div className="w-full">
              <SearchBar ref={searchInputRef} />
            </div>
            
            {/* Compact Epoch Status Card */}
            <div className="w-full">
              <EpochStatusCard compact={true} />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Logo size="sm" className="mx-auto mb-2 animate-float" />
            <Footer />
          </div>
        </div>
      </div>
      
      <StakeModal 
        isOpen={isStakeModalOpen}
        onClose={handleStakeModalClose}
        validatorPubkey={VALIDATOR_PUBKEY}
        validatorName="Gojira Validator"
      />
    </PageLayout>
  );
};

export default Home;
