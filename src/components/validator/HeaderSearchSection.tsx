
import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderSearchSectionProps {
  handleSearchSubmit: (e: React.FormEvent) => void;
}

export const HeaderSearchSection = ({
  handleSearchSubmit,
}: HeaderSearchSectionProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const {
    searchInput,
    setSearchInput,
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    isLoadingValidators,
    isSearching,
    handleSelectValidator,
  } = useValidatorSearch();
  console.log(filteredValidators);

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
      onSubmit={handleSearchSubmit}
      className={`${
        isMobile ? "w-full" : "w-full sm:w-48 md:w-56"
      } relative search-container`}
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={
            isLoadingValidators ? "Loading..." : "Search validator..."
          }
          value={searchInput}
          onChange={handleInputChange}
          className="pl-9 h-9 w-full bg-gojira-gray-dark border-gojira-gray-light text-sm pr-12"
          ref={searchInputRef}
          onFocus={() => {
            if (searchInput.length > 2 && filteredValidators.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />

        <Button
          type="submit"
          variant="destructive"
          size="sm"
          className="absolute right-0 top-0 h-9 rounded-l-none bg-gojira-red hover:bg-gojira-red-dark"
          disabled={isLoadingValidators || !searchInput.trim() || isSearching}
        >
          {isSearching ? (
            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : isMobile ? (
            ""
          ) : (
            "Search"
          )}
        </Button>

        {showSuggestions && filteredValidators.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gojira-gray-dark border border-gojira-gray-light rounded-md shadow-lg max-h-[300px] overflow-y-auto">
            {filteredValidators.map((validator) => (
              <div
                key={validator.votePubkey}
                className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectValidator(validator.votePubkey);
                  setSearchInput("");
                  setShowSuggestions(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {validator.icon ? (
                    <img
                      src={validator.icon}
                      alt={`${validator.name || "Validator"} logo`}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gojira-gray-light flex items-center justify-center text-xs flex-shrink-0">
                      {validator.name?.[0] || "V"}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">
                      {validator.name || "Unknown Validator"}
                    </span>
                    {validator.commission !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        Commission: {validator.commission}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-[120px]">
                    {validator.votePubkey.slice(0, 4)}...
                    {validator.votePubkey.slice(-4)}
                  </span>
                  {validator.activatedStake !== undefined && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
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
          searchInput.length > 2 &&
          filteredValidators.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-gojira-gray-dark border border-gojira-gray-light rounded-md shadow-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No validators found matching your search
              </p>
            </div>
          )}
      </div>
    </form>
  );
};
