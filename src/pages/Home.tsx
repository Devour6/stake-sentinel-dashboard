
import { useRef, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SearchBar from "@/components/search/SearchBar";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import Footer from "@/components/layout/Footer";
import StakeModal from "@/components/StakeModal";
import { EpochStatusCard } from "@/components/EpochStatusCard";

const Home = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const {
    searchInput,
    setSearchInput,
    isSearching,
    isLoadingValidators,
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSelectValidator
  } = useValidatorSearch();

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
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
              <SearchBar
                ref={searchInputRef}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                isSearching={isSearching}
                isLoadingValidators={isLoadingValidators}
                filteredValidators={filteredValidators}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                onSearch={handleSearch}
                onSelectValidator={handleSelectValidator}
              />
            </div>
            
            {/* Compact Epoch Status Card */}
            <div className="w-full">
              <EpochStatusCard compact={true} />
            </div>
          </div>
          
          <Footer />
        </div>
      </div>
      
      <StakeModal 
        isOpen={isStakeModalOpen}
        setIsOpen={setIsStakeModalOpen}
      />
    </PageLayout>
  );
};

export default Home;
