
import { useState, useEffect, useMemo } from 'react';
import { fetchAllValidators } from '@/services/solanaApi';
import { ValidatorSearchResult } from '@/services/api/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useValidatorSearch() {
  const [allValidators, setAllValidators] = useState<ValidatorSearchResult[]>([]);
  const [filteredValidators, setFilteredValidators] = useState<ValidatorSearchResult[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingValidators, setIsLoadingValidators] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Fetch all validators on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadValidators() {
      setIsLoadingValidators(true);
      try {
        const validators = await fetchAllValidators();
        console.log(`Loaded ${validators.length} validators for search`);
        if (isMounted) {
          setAllValidators(validators);
          // Allow the search bar to be used as soon as we have any validators
          setIsLoadingValidators(false);
        }
      } catch (error) {
        console.error("Error fetching validators:", error);
        if (isMounted) {
          setIsLoadingValidators(false);
        }
      }
    }

    loadValidators();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter validators based on search input - optimized with useMemo
  useMemo(() => {
    if (searchInput.trim().length < 2) {
      setFilteredValidators([]);
      return;
    }

    const searchTerm = searchInput.toLowerCase().trim();
    
    // Process in batches to avoid UI freezing
    setTimeout(() => {
      // First try exact match on name, then partial name, then identity and vote pubkey
      const exactNameMatches: ValidatorSearchResult[] = [];
      const partialNameMatches: ValidatorSearchResult[] = [];
      const identityMatches: ValidatorSearchResult[] = [];
      const voteKeyMatches: ValidatorSearchResult[] = [];
  
      allValidators.forEach(validator => {
        // Check for exact name match first (case insensitive)
        if (validator.name && validator.name.toLowerCase() === searchTerm) {
          exactNameMatches.push(validator);
          return;
        }
        
        // Check for partial name match
        if (validator.name && validator.name.toLowerCase().includes(searchTerm)) {
          partialNameMatches.push(validator);
          return;
        }
        
        // Check identity and vote pubkey
        if (validator.identity && validator.identity.toLowerCase().includes(searchTerm)) {
          identityMatches.push(validator);
        } else if (validator.votePubkey && validator.votePubkey.toLowerCase().includes(searchTerm)) {
          voteKeyMatches.push(validator);
        }
      });
  
      // Combine matches in priority order
      const matches = [
        ...exactNameMatches,
        ...partialNameMatches,
        ...identityMatches,
        ...voteKeyMatches
      ];
  
      // Sort by stake (if available)
      matches.sort((a, b) => (b.activatedStake || 0) - (a.activatedStake || 0));
  
      // Limit suggestions to avoid overwhelming UI
      const limitedMatches = matches.slice(0, 10);
      
      setFilteredValidators(limitedMatches);
    }, 0);
  }, [searchInput, allValidators]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent, inputOverride?: string) => {
    e.preventDefault();
    
    const searchTerm = inputOverride || searchInput;
    
    if (!searchTerm.trim() || isSearching) return;
    
    setIsSearching(true);
    console.log("Searching for validator:", searchTerm);
    
    // Try to find an exact match first
    const exactMatch = allValidators.find(
      v => 
        (v.name && v.name.toLowerCase() === searchTerm.toLowerCase()) ||
        v.votePubkey.toLowerCase() === searchTerm.toLowerCase() ||
        (v.identity && v.identity.toLowerCase() === searchTerm.toLowerCase())
    );
    
    if (exactMatch) {
      console.log("Found exact validator match:", exactMatch);
      navigate(`/validator/${exactMatch.votePubkey}`);
      setSearchInput('');
    } else if (filteredValidators.length > 0) {
      // If no exact match but we have filtered results, navigate to the first one
      console.log("Using first filtered result:", filteredValidators[0]);
      navigate(`/validator/${filteredValidators[0].votePubkey}`);
      setSearchInput('');
    } else {
      // If no matches, try a more flexible search
      const fuzzyMatch = allValidators.find(v => 
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.votePubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.identity && v.identity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      if (fuzzyMatch) {
        console.log("Found fuzzy validator match:", fuzzyMatch);
        navigate(`/validator/${fuzzyMatch.votePubkey}`);
        setSearchInput('');
      } else {
        console.log("No validator matches found for:", searchTerm);
        toast.error("No validator matches found");
      }
    }
    
    setIsSearching(false);
    setShowSuggestions(false);
  };

  // Handle selection of validator from dropdown
  const handleSelectValidator = (votePubkey: string) => {
    console.log("Selected validator:", votePubkey);
    navigate(`/validator/${votePubkey}`);
    setShowSuggestions(false);
    setSearchInput('');
  };

  return {
    searchInput,
    setSearchInput,
    isSearching,
    isLoadingValidators,
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSelectValidator
  };
}
