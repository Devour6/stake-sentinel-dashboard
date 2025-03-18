
import { useState, useRef } from "react";
import { ExternalLink, Info, Copy, RefreshCw, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";
import { HeaderIdentitySection } from "./HeaderIdentitySection";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchInput,
    setSearchInput,
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
    <div className="animate-slide-down space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex items-start gap-3 flex-grow overflow-visible">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="mr-2 text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="w-12 h-12 md:w-16 md:h-16 relative animate-pulse-subtle">
            {validatorIcon ? (
              <img 
                src={validatorIcon} 
                alt={validatorName || "Validator Logo"}
                className="object-contain w-full h-full rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png";
                }}
              />
            ) : (
              <img 
                src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
                alt="Gojira Logo" 
                className="object-contain w-full h-full animate-roar"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm uppercase tracking-widest text-gojira-red mb-1">Solana Validator</p>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white truncate">
              {isLoading ? (
                <div className="h-8 w-64 bg-muted/30 rounded animate-pulse"></div>
              ) : (
                validatorName || "Validator Dashboard"
              )}
            </h1>
            
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
        </div>
        
        <div className="flex flex-row gap-2 items-center ml-auto max-w-full shrink-0">
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
          
          <Button 
            variant="destructive" 
            size="icon"
            className="rounded-full bg-gojira-red hover:bg-gojira-red-dark transition-all duration-300 h-8 w-8 flex items-center justify-center"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          {onStakeModalOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStakeModalOpen}
              className="bg-gojira-red hover:bg-gojira-red-dark text-white border-none whitespace-nowrap"
            >
              Stake to Gojira
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
