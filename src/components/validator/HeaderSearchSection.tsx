
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";

interface HeaderSearchSectionProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export const HeaderSearchSection = ({ 
  onRefresh,
  isLoading = false 
}: HeaderSearchSectionProps) => {
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    isLoadingValidators,
    handleSearch,
    handleSelectValidator
  } = useValidatorSearch();

  const handleRefresh = () => {
    onRefresh();
    toast.info("Refreshing data...", {
      duration: 1500,
      position: "top-center"
    });
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput && searchInput.trim()) {
      handleSearch(e);
      setSearchInput('');
    }
  };
  
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
    <div className="flex flex-row gap-2 items-center ml-auto max-w-full shrink-0">
      <form onSubmit={handleSearchSubmit} className="w-full sm:w-44 md:w-48">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search validator..."
            value={searchInput}
            onChange={handleInputChange}
            className="pl-7 h-8 w-full bg-gojira-gray-dark border-gojira-gray-light text-sm"
            ref={searchInputRef}
            onFocus={() => {
              if (searchInput.length > 2 && filteredValidators.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicking on them
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            disabled={isLoadingValidators}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          
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
      
      <Button 
        variant="destructive" 
        size="icon"
        className="rounded-full bg-gojira-red hover:bg-gojira-red-dark transition-all duration-300 h-8 w-8 flex items-center justify-center"
        onClick={handleRefresh}
        disabled={isLoading}
        title="Refresh data"
      >
        <span className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}>
          ↻
        </span>
      </Button>
    </div>
  );
};
