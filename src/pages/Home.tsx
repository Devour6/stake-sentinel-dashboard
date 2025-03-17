
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { validateVotePubkey } from "@/services/solanaApi";
import { toast } from "sonner";
import { fetchAllValidators } from "@/services/api/validatorSearchApi";
import StakeModal from "@/components/StakeModal";
import { ValidatorSearchResult } from "@/services/api/types";
import SearchBar from "@/components/search/SearchBar";
import PageLayout from "@/components/layout/PageLayout";
import Footer from "@/components/layout/Footer";

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validators, setValidators] = useState<ValidatorSearchResult[]>([]);
  const [filteredValidators, setFilteredValidators] = useState<ValidatorSearchResult[]>([]);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isLoadingValidators, setIsLoadingValidators] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadValidators = async () => {
      setIsLoadingValidators(true);
      try {
        const allValidators = await fetchAllValidators();
        setValidators(allValidators);
        console.log(`Fetched ${allValidators.length} validators`);
      } catch (error) {
        console.error("Failed to load validators:", error);
        toast.error("Failed to load validator list");
      } finally {
        setIsLoadingValidators(false);
      }
    };
    
    loadValidators();
  }, []);

  useEffect(() => {
    if (searchInput.trim()) {
      const searchTerm = searchInput.toLowerCase();
      
      // Prioritize search matches
      const exactNameMatches = validators.filter(
        (validator) => validator.name?.toLowerCase() === searchTerm
      );
      
      const exactPubkeyMatches = validators.filter(
        (validator) => 
          validator.votePubkey.toLowerCase() === searchTerm ||
          validator.identity.toLowerCase() === searchTerm
      );
      
      const partialNameMatches = validators.filter(
        (validator) => 
          validator.name?.toLowerCase().includes(searchTerm) && 
          validator.name?.toLowerCase() !== searchTerm
      );
      
      const partialPubkeyMatches = validators.filter(
        (validator) => 
          (validator.votePubkey.toLowerCase().includes(searchTerm) && 
           validator.votePubkey.toLowerCase() !== searchTerm) ||
          (validator.identity.toLowerCase().includes(searchTerm) &&
           validator.identity.toLowerCase() !== searchTerm)
      );
      
      // Combine and limit to top 10 results with prioritization
      const filtered = [
        ...exactNameMatches, 
        ...exactPubkeyMatches,
        ...partialNameMatches,
        ...partialPubkeyMatches
      ].filter((v, i, a) => a.findIndex(t => t.votePubkey === v.votePubkey) === i).slice(0, 10);
      
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
      
      // Exact name match
      const nameMatch = validators.find(v => 
        v.name?.toLowerCase() === searchInput.toLowerCase()
      );
      
      if (nameMatch) {
        navigate(`/validator/${encodeURIComponent(nameMatch.votePubkey)}`);
        return;
      }

      // Identity match
      const identityMatch = validators.find(v => 
        v.identity.toLowerCase() === searchInput.toLowerCase()
      );
      
      if (identityMatch) {
        navigate(`/validator/${encodeURIComponent(identityMatch.votePubkey)}`);
        return;
      }
      
      // Partial matches - try to find the best match
      const matchedValidator = validators.find(v => 
        v.votePubkey.toLowerCase().includes(searchInput.toLowerCase()) ||
        v.identity.toLowerCase().includes(searchInput.toLowerCase()) ||
        v.name?.toLowerCase().includes(searchInput.toLowerCase())
      );

      if (matchedValidator) {
        navigate(`/validator/${encodeURIComponent(matchedValidator.votePubkey)}`);
      } else if (filteredValidators.length > 0) {
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

  return (
    <PageLayout onStakeModalOpen={() => setIsStakeModalOpen(true)}>
      <Card className="w-full max-w-2xl glass-card mx-auto animate-slide-up">
        <CardContent className="pt-6">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isSearching={isSearching}
            isLoadingValidators={isLoadingValidators}
            filteredValidators={filteredValidators}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            onSearch={handleSearch}
            onSelectValidator={handleSelectValidator}
            ref={searchInputRef}
          />
        </CardContent>
      </Card>

      <Footer />

      <StakeModal isOpen={isStakeModalOpen} setIsOpen={setIsStakeModalOpen} />
    </PageLayout>
  );
};

export default Home;
