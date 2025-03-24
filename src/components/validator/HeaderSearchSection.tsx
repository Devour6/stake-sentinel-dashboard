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
      } relative search-container font-outfit`}
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
          className="pl-9 pr-3 py-2 bg-[#222] outline outline-1 outline-black/20 h-9 w-full text-white"
          ref={searchInputRef}
          onFocus={() => {
            if (searchInput.length > 2 && filteredValidators.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />

        {showSuggestions && filteredValidators.length > 0 && (
          <div className="absolute z-50 w-64 mt-2 bg-[#222] outline outline-1 outline-black/20 rounded-md shadow-lg max-h-[300px] overflow-y-auto font-outfit">
            {filteredValidators.map((validator) => (
              <div
                key={validator.votePubkey}
                className="flex gap-4 items-start p-3 hover:bg-accent cursor-pointer"
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
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-xs flex-shrink-0">
                      {validator.name?.[0] || "V"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-0">
                  <div className="w-32">
                    <span className="font-medium line-clamp-1 text-white">
                      {validator.name || "Unknown Validator"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end flex-shrink-0 text-gray-400 gap-4">
                    <span className="text-xs truncate max-w-[80px] sm:max-w-[120px]">
                      {validator.votePubkey.slice(0, 4)}...
                      {validator.votePubkey.slice(-4)}
                    </span>
                    {validator.activatedStake !== undefined && (
                      <span className="text-xs whitespace-nowrap">
                        {validator.activatedStake > 0
                          ? `${Math.floor(
                              validator.activatedStake
                            ).toLocaleString()} SOL`
                          : ""}
                      </span>
                    )}
                  </div>
                  <div>
                    {validator.commission !== undefined && (
                      <span className="text-xs text-gray-400">
                        Commission: {validator.commission}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSuggestions &&
          searchInput.length > 2 &&
          filteredValidators.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-[#222] outline outline-1 outline-black/20 rounded-md shadow-lg p-4">
              <p className="text-sm text-white/50 text-center">
                No validators found matching your search
              </p>
            </div>
          )}
      </div>
    </form>
  );
};
