
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
      
      // More aggressive search strategy
      
      // 1. Exact matches first (case insensitive)
      const exactNameMatches = validators.filter(
        validator => validator.name?.toLowerCase() === searchTerm
      );
      
      const exactPubkeyMatches = validators.filter(
        validator => 
          validator.votePubkey.toLowerCase() === searchTerm ||
          validator.identity.toLowerCase() === searchTerm
      );
      
      // 2. Starts with matches (higher priority than contains)
      const nameStartsWithMatches = validators.filter(
        validator => 
          validator.name?.toLowerCase().startsWith(searchTerm) &&
          validator.name?.toLowerCase() !== searchTerm
      );
      
      // 3. Contains matches (lower priority)
      const nameContainsMatches = validators.filter(
        validator => 
          validator.name?.toLowerCase().includes(searchTerm) && 
          !validator.name?.toLowerCase().startsWith(searchTerm) &&
          validator.name?.toLowerCase() !== searchTerm
      );
      
      const pubkeyContainsMatches = validators.filter(
        validator => 
          (validator.votePubkey.toLowerCase().includes(searchTerm) && 
           validator.votePubkey.toLowerCase() !== searchTerm) ||
          (validator.identity.toLowerCase().includes(searchTerm) &&
           validator.identity.toLowerCase() !== searchTerm)
      );
      
      // Combine all matches with priority ordering and remove duplicates
      const allMatches = [
        ...exactNameMatches, 
        ...exactPubkeyMatches,
        ...nameStartsWithMatches,
        ...nameContainsMatches,
        ...pubkeyContainsMatches
      ];
      
      // Remove duplicates by votePubkey
      const filtered = allMatches.filter(
        (v, i, a) => a.findIndex(t => t.votePubkey === v.votePubkey) === i
      ).slice(0, 10);
      
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
      
      // Partial name matches - prioritize "starts with" over "contains"
      const nameStartsWithMatches = validators.filter(v => 
        v.name?.toLowerCase().startsWith(searchInput.toLowerCase()) && 
        v.name?.toLowerCase() !== searchInput.toLowerCase()
      );
      
      if (nameStartsWithMatches.length > 0) {
        // Sort by stake and name length for better matches
        const bestMatch = nameStartsWithMatches.sort((a, b) => {
          // First by stake (higher is better)
          const stakeDiff = (b.activatedStake || 0) - (a.activatedStake || 0);
          if (stakeDiff !== 0) return stakeDiff;
          
          // Then by name length (shorter is better)
          return (a.name?.length || 0) - (b.name?.length || 0);
        })[0];
        
        navigate(`/validator/${encodeURIComponent(bestMatch.votePubkey)}`);
        return;
      }
      
      const nameContainsMatches = validators.filter(v => 
        v.name?.toLowerCase().includes(searchInput.toLowerCase()) && 
        !v.name?.toLowerCase().startsWith(searchInput.toLowerCase()) &&
        v.name?.toLowerCase() !== searchInput.toLowerCase()
      );
      
      if (nameContainsMatches.length > 0) {
        const bestMatch = nameContainsMatches.sort((a, b) => 
          (b.activatedStake || 0) - (a.activatedStake || 0)
        )[0];
        
        navigate(`/validator/${encodeURIComponent(bestMatch.votePubkey)}`);
        return;
      }
      
      // Try partial pubkey matches as last resort
      const pubkeyMatch = validators.find(v => 
        v.votePubkey.toLowerCase().includes(searchInput.toLowerCase()) ||
        v.identity.toLowerCase().includes(searchInput.toLowerCase())
      );

      if (pubkeyMatch) {
        navigate(`/validator/${encodeURIComponent(pubkeyMatch.votePubkey)}`);
        return;
      }
      
      // If we have any filtered validators from the live search, use the first one
      if (filteredValidators.length > 0) {
        navigate(`/validator/${encodeURIComponent(filteredValidators[0].votePubkey)}`);
        return;
      }
      
      toast.error("No validator found matching your search");
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
