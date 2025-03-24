import { forwardRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchBarProps {
  showStakeAmount?: boolean;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ showStakeAmount = true }, ref) => {
    const {
      searchInput,
      setSearchInput,
      isSearching,
      isLoadingValidators,
      filteredValidators,
      showSuggestions,
      setShowSuggestions,
      handleSearch,
      handleSelectValidator,
    } = useValidatorSearch();

    const isMobile = useIsMobile();

    // Close the dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".search-container")) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [setShowSuggestions]);

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
      <form
        onSubmit={handleSearch}
        className="flex gap-2 relative search-container w-full"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

          <div className="relative">
            <Input
              type="text"
              placeholder={
                isLoadingValidators ? "Loading..." : "Search validator..."
              }
              className="pl-9 pr-3 py-2 bg-white bg-opacity-5 outline outline-1 outline-black/20 h-9 w-full text-white"
              value={searchInput}
              onChange={handleInputChange}
              ref={ref}
              onFocus={() => {
                if (searchInput.length > 2 && filteredValidators.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              disabled={isLoadingValidators && !searchInput.trim()} // Allow typing even when loading
            />

            {isLoadingValidators && !searchInput.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {showSuggestions && filteredValidators.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                {filteredValidators.map((validator) => (
                  <div
                    key={validator.votePubkey}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectValidator(validator.votePubkey);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {validator.icon ? (
                        <img
                          src={validator.icon}
                          alt={`${validator.name || "Validator"} logo`}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">
                          {validator.name?.[0] || "V"}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-white/80">
                          {validator.name || "Unknown Validator"}
                        </span>
                        {showStakeAmount &&
                          validator.commission !== undefined && (
                            <span className="text-xs text-gray-600">
                              Commission: {validator.commission}%
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xs text-gray-600 truncate max-w-[80px] sm:max-w-[180px]">
                        {validator.votePubkey.slice(0, 4)}...
                        {validator.votePubkey.slice(-4)}
                      </span>
                      {showStakeAmount &&
                        validator.activatedStake !== undefined && (
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {validator.activatedStake > 0
                              ? `${Math.floor(
                                  validator.activatedStake
                                ).toLocaleString()} SOL`
                              : ""}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions &&
              filteredValidators.length === 0 &&
              searchInput.trim().length > 2 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 rounded-md shadow-lg p-4 text-center">
                  No validators found matching "{searchInput}"
                </div>
              )}
          </div>
        </div>
      </form>
    );
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
