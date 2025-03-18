
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import SearchBar from './search/SearchBar';

interface AppHeaderProps {
  setIsStakeModalOpen: (isOpen: boolean) => void;
}

const AppHeader = ({ setIsStakeModalOpen }: AppHeaderProps) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">NodeScan</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-xl mx-4">
          <SearchBar />
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
