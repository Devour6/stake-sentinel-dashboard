
import { useState, useRef } from "react";
import { ExternalLink, Info, Copy, RefreshCw, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useValidatorSearch } from "@/hooks/useValidatorSearch";

interface ValidatorHeaderProps {
  validatorPubkey: string;
  validatorName?: string;
  validatorIcon?: string | null;
  identityPubkey?: string;
  isLoading?: boolean;
  onRefresh: () => void;
  onBack?: () => void;
}

export const ValidatorHeader = ({ 
  validatorPubkey, 
  validatorName,
  validatorIcon,
  identityPubkey,
  isLoading = false,
  onRefresh,
  onBack
}: ValidatorHeaderProps) => {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    filteredValidators,
    showSuggestions,
    setShowSuggestions,
    isLoadingValidators,
    handleSearch,
    handleSelectValidator
  } = useValidatorSearch();

  const truncateAddress = (address: string, length = 8) => {
    if (!address) return "";
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard`);
      })
      .catch((err) => {
        toast.error(`Failed to copy: ${err}`);
      });
  };

  const solscanUrl = `https://solscan.io/account/${validatorPubkey}`;
  const identitySolscanUrl = identityPubkey ? `https://solscan.io/account/${identityPubkey}` : null;

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
    <div className="animate-slide-down space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start">
        {/* Validator info section */}
        <div className="flex items-start gap-3">
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
            
            {/* Address information with horizontal layout when possible */}
            <div className="text-muted-foreground">
              {isLoading ? (
                <div className="flex flex-col space-y-2">
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Vote Account */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm whitespace-nowrap">Vote Account:</span>
                    <code className="bg-gojira-gray-dark/50 px-2 py-0.5 rounded text-sm font-mono">
                      {truncateAddress(validatorPubkey, 6)}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto hover:bg-transparent text-gojira-red hover:text-gojira-red-light"
                      onClick={() => copyToClipboard(validatorPubkey, "Vote Account")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <a 
                      href={solscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gojira-red hover:text-gojira-red-light transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="glass-effect">
                          <p>Validator vote account on Solana blockchain</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {/* Identity */}
                  {identityPubkey && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm whitespace-nowrap">Identity:</span>
                        <code className="bg-gojira-gray-dark/50 px-2 py-0.5 rounded text-sm font-mono">
                          {truncateAddress(identityPubkey, 6)}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto hover:bg-transparent text-gojira-red hover:text-gojira-red-light"
                          onClick={() => copyToClipboard(identityPubkey, "Identity")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <a 
                          href={identitySolscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gojira-red hover:text-gojira-red-light transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search and refresh section - always visible */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-52 md:w-64">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search validator..."
                value={searchInput}
                onChange={handleInputChange}
                className="pl-8 h-9 w-full bg-gojira-gray-dark border-gojira-gray-light"
                ref={searchInputRef}
                onFocus={() => {
                  if (searchInput.length > 2 && filteredValidators.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isLoadingValidators}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
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
            size="sm"
            className="rounded-full bg-gojira-red hover:bg-gojira-red-dark transition-all duration-300 flex items-center gap-2 min-w-[100px]"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
