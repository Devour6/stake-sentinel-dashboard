
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HeaderIdentitySection } from "./HeaderIdentitySection";
import { HeaderInfoSection } from "./HeaderInfoSection";
import { HeaderSearchSection } from "./HeaderSearchSection";
import { HeaderControlsSection } from "./HeaderControlsSection";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";

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
  const [searchInput, setSearchInput] = useState('');
  const { handleSearch } = useValidatorSearch();
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput && searchInput.trim()) {
      handleSearch(e);
      setSearchInput('');
    }
  };

  return (
    <div className="animate-slide-down space-y-4">
      {/* Top row with search and controls */}
      <div className="flex flex-row items-center justify-between gap-4">
        {onBack && (
          <button 
            className="text-muted-foreground hover:text-white"
            onClick={onBack}
          >
            Back
          </button>
        )}
        
        <div className="flex flex-row gap-2 items-center ml-auto">
          <HeaderSearchSection 
            searchInput={searchInput}
            setSearchInput={setSearchInput}
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
