
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  onStakeModalOpen?: () => void;
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
  onStakeModalOpen
}: ValidatorHeaderProps) => {
  const navigate = useNavigate();
  const [localSearchInput, setLocalSearchInput] = useState('');
  const { handleSearch, isSearching } = useValidatorSearch();
  const isMobile = useIsMobile();
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchInput && localSearchInput.trim()) {
      // We use the hook's handleSearch directly but with our local state
      const tempEvent = { ...e, preventDefault: () => {} };
      handleSearch(tempEvent, localSearchInput);
    }
  };

  return (
    <div className="animate-slide-down space-y-4">
      {/* Top row with search and controls */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-4`}>
        {onBack && (
          <button 
            className="text-muted-foreground hover:text-white self-start"
            onClick={onBack}
          >
            Back
          </button>
        )}
        
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} gap-2 items-center ${isMobile ? '' : 'ml-auto'}`}>
          <HeaderSearchSection 
            searchInput={localSearchInput}
            setSearchInput={setLocalSearchInput}
            handleSearchSubmit={handleSearchSubmit}
          />
          
          <HeaderControlsSection 
            onRefresh={onRefresh}
            isLoading={isLoading}
            onStakeModalOpen={onStakeModalOpen}
          />
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
