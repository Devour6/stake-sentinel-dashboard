
import { useRef, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SearchBar from "@/components/search/SearchBar";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

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

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleStakeModalOpen = () => {
    setIsStakeModalOpen(true);
  };

  return (
    <PageLayout onStakeModalOpen={handleStakeModalOpen}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Solana Validators Explorer
            </h1>
            <p className="text-xl text-muted-foreground">
              Find information about Solana validators, their performance, and stake distribution.
            </p>
          </div>

          <div className="w-full max-w-2xl">
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

          <div className="w-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-1 glass-card border border-gojira-gray-light rounded-lg p-6 text-center">
              <Cpu className="h-12 w-12 text-gojira-red mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gojira Validator</h3>
              <p className="text-muted-foreground mb-4">
                Explore the performance of the Gojira validator on the Solana network.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSelectValidator("goJiRADNdmfnJ4iWEyft7KaYMPTVsRba2Ee1akDEBXb")}
              >
                View Gojira <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="col-span-1 glass-card border border-gojira-gray-light rounded-lg p-6 text-center">
              <div className="h-12 w-12 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Solana Foundation</h3>
              <p className="text-muted-foreground mb-4">
                Check the Solana Foundation validator performance and metrics.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSelectValidator("GhBd6sozvfR9F2YwHVj2tAHbGyzQSuHxWNn5K8ofuYkx")}
              >
                View Solana <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="col-span-1 glass-card border border-gojira-gray-light rounded-lg p-6 text-center">
              <div className="h-12 w-12 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-lg font-bold">H</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Helius</h3>
              <p className="text-muted-foreground mb-4">
                Explore the Helius validator metrics and performance data.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSelectValidator("HeZU7mjJx9FFLX8ad4fErHhiTXNxwqLzW3AVUBCfXxT")}
              >
                View Helius <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="default" 
              className="bg-gojira-red hover:bg-gojira-red-dark"
              onClick={focusSearch}
            >
              Search All Validators
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;
