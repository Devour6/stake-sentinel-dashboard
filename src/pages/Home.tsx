
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { validateVotePubkey } from "@/services/solanaApi";
import { toast } from "sonner";
import { fetchAllValidators } from "@/services/api/validatorApi";
import StakeModal from "@/components/StakeModal";

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validators, setValidators] = useState<Array<{name: string, votePubkey: string, identity: string}>>([]);
  const [filteredValidators, setFilteredValidators] = useState<Array<{name: string, votePubkey: string, identity: string}>>([]);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadValidators = async () => {
      try {
        const allValidators = await fetchAllValidators();
        setValidators(allValidators);
        console.log(`Fetched ${allValidators.length} validators`);
      } catch (error) {
        console.error("Failed to load validators:", error);
        toast.error("Failed to load validator list");
      }
    };
    
    loadValidators();
  }, []);

  // Improved filtered validators logic with better search
  useEffect(() => {
    if (searchInput.trim()) {
      const searchTerm = searchInput.toLowerCase();
      const filtered = validators.filter(
        (validator) => 
          (validator.name?.toLowerCase().includes(searchTerm)) ||
          validator.votePubkey.toLowerCase().includes(searchTerm) ||
          validator.identity.toLowerCase().includes(searchTerm)
      ).slice(0, 10); // Limit to 10 results for better UI
      setFilteredValidators(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredValidators([]);
      setShowSuggestions(false);
    }
  }, [searchInput, validators]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    
    try {
      // First check if input is a valid vote pubkey
      if (validateVotePubkey(searchInput.trim())) {
        navigate(`/validator/${encodeURIComponent(searchInput.trim())}`);
        return;
      }
      
      // Then check if it matches any validator name or identity
      const matchedValidator = validators.find(v => 
        (v.name?.toLowerCase() === searchInput.toLowerCase()) ||
        v.votePubkey.toLowerCase() === searchInput.toLowerCase() ||
        v.identity.toLowerCase() === searchInput.toLowerCase()
      );

      if (matchedValidator) {
        navigate(`/validator/${encodeURIComponent(matchedValidator.votePubkey)}`);
      } else if (filteredValidators.length > 0) {
        // If we have filtered results but no exact match, navigate to the first result
        navigate(`/validator/${encodeURIComponent(filteredValidators[0].votePubkey)}`);
      } else {
        toast.error("No validator found matching your search");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for validator");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectValidator = (votePubkey: string) => {
    setShowSuggestions(false);
    navigate(`/validator/${encodeURIComponent(votePubkey)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gojira-gray to-gojira-gray-dark p-4">
      <div className="fixed top-4 right-4 z-10">
        <Button 
          variant="outline" 
          className="border-gojira-red text-gojira-red hover:bg-gojira-red/10"
          onClick={() => setIsStakeModalOpen(true)}
        >
          Stake to Gojira Validator
        </Button>
      </div>

      <div className="w-full max-w-3xl mx-auto text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          hiStake
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Search for any Solana validator by vote account address, identity, or name to view detailed performance metrics.
        </p>
      </div>

      <Card className="w-full max-w-2xl glass-card mx-auto animate-slide-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
                <PopoverTrigger asChild>
                  <Input
                    type="text"
                    placeholder="Search by validator vote account, identity, or name..."
                    className="pl-10 bg-gojira-gray-dark border-gojira-gray-light"
                    value={searchInput}
                    onChange={handleInputChange}
                    ref={searchInputRef}
                    onFocus={() => filteredValidators.length > 0 && setShowSuggestions(true)}
                  />
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0 w-[var(--radix-popover-trigger-width)] mt-1" 
                  align="start"
                  sideOffset={5}
                >
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredValidators.map((validator) => (
                      <div
                        key={validator.votePubkey}
                        className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectValidator(validator.votePubkey)}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{validator.name || "Unknown"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {validator.votePubkey.slice(0, 8)}...{validator.votePubkey.slice(-8)}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              type="submit" 
              variant="destructive"
              className="bg-gojira-red hover:bg-gojira-red-dark"
              disabled={isSearching || !searchInput.trim()}
            >
              {isSearching ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              ) : null}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-1 items-center">
          <span>Powered by</span>
          <span className="text-gojira-red font-semibold">Gojira</span>
          <img 
            src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
            alt="Gojira Logo" 
            className="w-4 h-4"
          />
        </div>
      </div>

      <StakeModal isOpen={isStakeModalOpen} setIsOpen={setIsStakeModalOpen} />
    </div>
  );
};

export default Home;
