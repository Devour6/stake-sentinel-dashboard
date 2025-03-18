import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { validateVotePubkey } from "@/services/solanaApi";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { VALIDATOR_PUBKEY } from "@/services/api/constants";
import { Button as CustomButton } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";

interface HomeProps {
  setIsStakeModalOpen: (isOpen: boolean) => void;
}

const Home = ({ setIsStakeModalOpen }: HomeProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    isLoadingValidators,
    handleSearch,
    handleSelectValidator
  } = useValidatorSearch();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Check if input is a valid Solana pubkey first
      const isValid = await validateVotePubkey(searchInput.trim());
      
      if (isValid) {
        // If valid, redirect to validator page
        navigate(`/validator/${searchInput.trim()}`);
      } else {
        // Otherwise, try to find validators by name
        const filtered = filteredValidators.filter(v => 
          v.name?.toLowerCase().includes(searchInput.toLowerCase())
        );
        
        if (filtered.length === 1) {
          // If only one match, go directly to it
          navigate(`/validator/${filtered[0].votePubkey}`);
        } else if (filtered.length > 1) {
          // Show toast if multiple matches
          toast.info(`Found ${filtered.length} validators. Please select one from the list.`);
          setShowSuggestions(true);
        } else {
          // No matches found
          toast.error("No validator found with that name or address");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for validator");
    } finally {
      setIsSearching(false);
    }
  };

  // Focus search input on load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gojira-gray to-gojira-gray-dark">
      <div className="container max-w-5xl mx-auto p-4">
        {/* Header with Brand and Stake Button */}
        <div className="flex justify-between items-center my-8">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
              alt="Gojira Logo" 
              className="h-12 w-12 animate-pulse-subtle"
            />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                NodeScan
              </h1>
              <p className="text-muted-foreground">
                Solana Validator Explorer
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="border-gojira-red text-gojira-red hover:bg-gojira-red/10"
            onClick={() => setIsStakeModalOpen(true)}
          >
            Stake to Gojira Validator
          </Button>
        </div>
        
        <AppHeader />
        
        {/* Main search section */}
        <div className="mt-12 mb-8 max-w-2xl mx-auto animate-fade-in relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-white">
            Search for a Solana Validator
          </h2>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Enter validator name, vote account or identity..."
                className="pl-10 pr-20 py-6 bg-gojira-gray-dark border-gojira-gray-light text-white"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value.length > 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchInput.length > 2 && filteredValidators.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isLoadingValidators && !searchInput.trim()}
              />
              
              <Button 
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gojira-red hover:bg-gojira-red-dark"
                disabled={isSearching || !searchInput.trim()}
              >
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : "Search"}
              </Button>
            </div>
            
            {showSuggestions && filteredValidators.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-gojira-gray-dark border border-gojira-gray-light rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                {filteredValidators.map((validator) => (
                  <div
                    key={validator.votePubkey}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                    onClick={() => handleSelectValidator(validator.votePubkey)}
                  >
                    <div className="flex items-center gap-3">
                      {validator.icon && (
                        <img 
                          src={validator.icon} 
                          alt={`${validator.name || 'Validator'} logo`}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{validator.name || "Unknown Validator"}</span>
                        {validator.commission !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            Commission: {validator.commission}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {validator.votePubkey.slice(0, 6)}...{validator.votePubkey.slice(-6)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showSuggestions && searchInput.length > 2 && filteredValidators.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-gojira-gray-dark border border-gojira-gray-light rounded-md shadow-lg p-4 text-center">
                No validators found matching "{searchInput}"
              </div>
            )}
          </form>
          
          <div className="text-center mt-4">
            <Button
              variant="link"
              className="text-gojira-red hover:text-gojira-red-light"
              onClick={() => navigate(`/validator/${VALIDATOR_PUBKEY}`)}
            >
              View Gojira's Validator
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 NodeScan by Gojira</p>
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

export default Home;
