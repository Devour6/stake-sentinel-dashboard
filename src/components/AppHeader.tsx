
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import SearchBar from './search/SearchBar';
import { ValidatorSearchResult } from '@/services/api/types';

interface AppHeaderProps {
  setIsStakeModalOpen: (isOpen: boolean) => void;
}

const AppHeader = ({ setIsStakeModalOpen }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);
  const [filteredValidators, setFilteredValidators] = useState<ValidatorSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setIsSearching(true);
      // Navigate to validator page if search is submitted
      navigate(`/validator/${searchInput.trim()}`);
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const handleSelectValidator = (votePubkey: string) => {
    // Navigate to selected validator's page
    navigate(`/validator/${votePubkey}`);
    setSearchInput('');
    setShowSuggestions(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/373e9dfd-22f8-47a8-971e-5dcb53f5aae2.png" 
              alt="NodeScan Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">NodeScan</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-xl mx-4">
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
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setIsStakeModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Stake to Validator
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
