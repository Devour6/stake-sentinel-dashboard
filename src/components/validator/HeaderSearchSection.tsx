
import { useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";

interface HeaderSearchSectionProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export const HeaderSearchSection = ({
  searchInput,
  setSearchInput,
  handleSearchSubmit
}: HeaderSearchSectionProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    isLoadingValidators,
    handleSelectValidator
  } = useValidatorSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.length > 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="w-full sm:w-48 md:w-56">
      <div className="relative search-container">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search validator..."
          value={searchInput}
          onChange={handleInputChange}
          className="pl-9 h-9 w-full bg-gojira-gray-dark border-gojira-gray-light text-sm"
          ref={searchInputRef}
          onFocus={() => {
            if (searchInput.length > 2 && filteredValidators.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Use setTimeout to allow click events on suggestions to fire before hiding
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
                  handleSelectValidator(validator.votePubkey);
                  setSearchInput('');
                }}
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
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[180px]">
                    {validator.votePubkey.slice(0, 6)}...{validator.votePubkey.slice(-6)}
                  </span>
                  {validator.activatedStake !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {validator.activatedStake > 0 
                        ? `Stake: ${Math.floor(validator.activatedStake).toLocaleString()} SOL` 
                        : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};
