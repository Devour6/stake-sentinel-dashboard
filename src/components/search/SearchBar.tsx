
import { useState, useRef, forwardRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ValidatorSearchResult } from "@/services/api/types";

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  isSearching: boolean;
  isLoadingValidators: boolean;
  filteredValidators: ValidatorSearchResult[];
  showSuggestions: boolean;
  setShowSuggestions: (value: boolean) => void;
  onSearch: (e: React.FormEvent) => void;
  onSelectValidator: (votePubkey: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  searchInput,
  setSearchInput,
  isSearching,
  isLoadingValidators,
  filteredValidators,
  showSuggestions,
  setShowSuggestions,
  onSearch,
  onSelectValidator
}, ref) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <form onSubmit={onSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        
        <div className="relative">
          <Input
            type="text"
            placeholder={isLoadingValidators ? "Loading validators..." : "Search by validator name, vote account, or identity..."}
            className="pl-10 bg-gojira-gray-dark border-gojira-gray-light"
            value={searchInput}
            onChange={handleInputChange}
            ref={ref}
            onFocus={() => filteredValidators.length > 0 && setShowSuggestions(true)}
            onBlur={() => {
              // Delayed hide of suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            disabled={isLoadingValidators}
          />
          
          {showSuggestions && filteredValidators.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-gojira-gray-dark border border-gojira-gray-light rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              {filteredValidators.map((validator) => (
                <div
                  key={validator.votePubkey}
                  className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectValidator(validator.votePubkey);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {validator.icon && (
                      <img 
                        src={validator.icon} 
                        alt={`${validator.name || 'Validator'} logo`}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-medium">{validator.name || "Unknown Validator"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {validator.votePubkey.slice(0, 8)}...{validator.votePubkey.slice(-8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button 
        type="submit" 
        variant="destructive"
        className="bg-gojira-red hover:bg-gojira-red-dark"
        disabled={isSearching || isLoadingValidators || !searchInput.trim()}
      >
        {isSearching ? (
          <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
        ) : null}
        Search
      </Button>
    </form>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
