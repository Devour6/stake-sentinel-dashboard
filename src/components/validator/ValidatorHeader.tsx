import { useState, useEffect } from "react";
import { HeaderIdentitySection } from "./HeaderIdentitySection";
import { HeaderInfoSection } from "./HeaderInfoSection";
import { HeaderSearchSection } from "./HeaderSearchSection";
import { HeaderControlsSection } from "./HeaderControlsSection";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface ValidatorHeaderProps {
  validatorPubkey: string;
  validatorName?: string;
  validatorIcon?: string | null;
  identityPubkey?: string;
  description?: string;
  version?: string;
  uptime?: number;
  website?: string | null;
  isLoading?: boolean;
  onRefresh: () => void;
  onBack?: () => void;
}

export const ValidatorHeader = ({
  validatorPubkey,
  validatorName,
  validatorIcon,
  identityPubkey,
  description,
  version,
  uptime,
  website,
  isLoading = false,
  onRefresh,
  onBack,
}: ValidatorHeaderProps) => {
  const [localSearchInput, setLocalSearchInput] = useState("");
  const { handleSearch, setShowSuggestions } = useValidatorSearch();
  const isMobile = useIsMobile();

  // Reset suggestions when component mounts
  useEffect(() => {
    setShowSuggestions(false);
  }, [setShowSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchInput && localSearchInput.trim()) {
      handleSearch(e, localSearchInput);
    }
  };

  return (
    <div className="animate-slide-down space-y-4">
      {/* Top row with search and controls */}
      <div
        className={`flex ${
          isMobile ? "flex-col" : "flex-row"
        } items-center gap-4`}
      >
        {onBack && (
          <button
            className="text-muted-foreground hover:text-white self-start"
            onClick={onBack}
          >
            Back
          </button>
        )}

        <div
          className={`flex ${
            isMobile ? "flex-col w-full" : "flex-row"
          } gap-2 items-center ${isMobile ? "" : "ml-auto"}`}
        >
          <HeaderSearchSection handleSearchSubmit={handleSearchSubmit} />
          <HeaderControlsSection onRefresh={onRefresh} isLoading={isLoading} />
        </div>
      </div>

      {/* Validator info and identity sections */}
      <HeaderInfoSection
        validatorName={validatorName}
        validatorIcon={validatorIcon}
        isLoading={isLoading}
      />

      <HeaderIdentitySection
        validatorPubkey={validatorPubkey}
        identityPubkey={identityPubkey}
        isLoading={isLoading}
        version={version}
        uptime={uptime}
        description={description}
        website={website}
      />
    </div>
  );
};
