
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
    if (!searchInput.trim()) {
      setFilteredValidators([]);
      setShowSuggestions(false);
      return;
    }
    
    const searchTerm = searchInput.toLowerCase();
    
    // Enhanced search algorithm (StakeWiz-inspired):
    // 1. Exact matches
    // 2. Starts with matches
    // 3. Contains matches
    // 4. Pubkey contains matches
    
    // Exact name matches
    const exactNameMatches = validators.filter(v => 
      v.name?.toLowerCase() === searchTerm
    );
    
    // Exact pubkey matches (vote or identity)
    const exactPubkeyMatches = validators.filter(v => 
      v.votePubkey.toLowerCase() === searchTerm ||
      v.identity.toLowerCase() === searchTerm
    );
    
    // Name starts with
    const nameStartsWithMatches = validators.filter(v => 
      v.name?.toLowerCase().startsWith(searchTerm) &&
      v.name?.toLowerCase() !== searchTerm // exclude exact matches
    );
    
    // Name contains
    const nameContainsMatches = validators.filter(v => 
      v.name?.toLowerCase().includes(searchTerm) && 
      !v.name?.toLowerCase().startsWith(searchTerm) &&
      v.name?.toLowerCase() !== searchTerm // exclude exact and starts with
    );
    
    // Pubkey contains
    const pubkeyContainsMatches = validators.filter(v => 
      (v.votePubkey.toLowerCase().includes(searchTerm) && 
       v.votePubkey.toLowerCase() !== searchTerm) ||
      (v.identity.toLowerCase().includes(searchTerm) &&
       v.identity.toLowerCase() !== searchTerm)
    );
    
    // Combine results in priority order
    const allResults = [
      ...exactNameMatches,
      ...exactPubkeyMatches,
      ...nameStartsWithMatches, 
      ...nameContainsMatches,
      ...pubkeyContainsMatches
    ];
    
    // Remove duplicates by votePubkey
    const uniqueResults = allResults.filter(
      (v, i, a) => a.findIndex(t => t.votePubkey === v.votePubkey) === i
    );
    
    // Sort by stake (higher first)
    const sortedResults = uniqueResults.sort((a, b) => 
      (b.activatedStake || 0) - (a.activatedStake || 0)
    );
    
    // Limit for performance
    const limitedResults = sortedResults.slice(0, 10);
    
    setFilteredValidators(limitedResults);
    setShowSuggestions(limitedResults.length > 0);
  }, [searchInput, validators]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    
    try {
      console.log("Searching for:", searchInput.trim());
      
      // 1. Check if it's a valid vote pubkey
      const searchTerm = searchInput.trim();
      if (validateVotePubkey(searchTerm)) {
        navigate(`/validator/${encodeURIComponent(searchTerm)}`);
        return;
      }
      
      // 2. Exact name match (case insensitive)
      const exactNameMatch = validators.find(v => 
        v.name?.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactNameMatch) {
        console.log(`Found exact name match: ${exactNameMatch.name}`);
        navigate(`/validator/${encodeURIComponent(exactNameMatch.votePubkey)}`);
        return;
      }
      
      // 3. Exact identity match (case insensitive)
      const exactIdentityMatch = validators.find(v => 
        v.identity.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactIdentityMatch) {
        console.log(`Found exact identity match: ${exactIdentityMatch.identity}`);
        navigate(`/validator/${encodeURIComponent(exactIdentityMatch.votePubkey)}`);
        return;
      }
      
      // 4. Name starts with (case insensitive)
      const nameStartsWithMatches = validators.filter(v => 
        v.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) && 
        v.name?.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      if (nameStartsWithMatches.length > 0) {
        // Sort by stake and name length
        const bestMatch = nameStartsWithMatches.sort((a, b) => {
          // Higher stake first
          const stakeDiff = (b.activatedStake || 0) - (a.activatedStake || 0);
          if (stakeDiff !== 0) return stakeDiff;
          
          // Shorter name first (better match)
          return (a.name?.length || 0) - (b.name?.length || 0);
        })[0];
        
        console.log(`Found name starts with match: ${bestMatch.name}`);
        navigate(`/validator/${encodeURIComponent(bestMatch.votePubkey)}`);
        return;
      }
      
      // 5. Name contains (case insensitive)
      const nameContainsMatches = validators.filter(v => 
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !v.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
        v.name?.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      if (nameContainsMatches.length > 0) {
        const bestMatch = nameContainsMatches.sort((a, b) => 
          (b.activatedStake || 0) - (a.activatedStake || 0)
        )[0];
        
        console.log(`Found name contains match: ${bestMatch.name}`);
        navigate(`/validator/${encodeURIComponent(bestMatch.votePubkey)}`);
        return;
      }
      
      // 6. Partial pubkey match
      const pubkeyMatch = validators.find(v => 
        v.votePubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.identity.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (pubkeyMatch) {
        console.log(`Found pubkey match: ${pubkeyMatch.votePubkey}`);
        navigate(`/validator/${encodeURIComponent(pubkeyMatch.votePubkey)}`);
        return;
      }
      
      // 7. If all else fails but we have filtered results, use the first one
      if (filteredValidators.length > 0) {
        console.log(`Using first filtered result: ${filteredValidators[0].name}`);
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
