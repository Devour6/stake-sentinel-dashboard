
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
    <div className="bg-gojira-gray-dark/60 backdrop-blur-sm rounded-2xl p-6 border border-gojira-gray-light/30 animate-slide-down">
      <div className="flex flex-col space-y-6">
        {/* Top row with back button */}
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="self-start -ml-2 text-muted-foreground hover:text-white mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        )}
        
        {/* Main header content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Validator Logo and Info */}
          <div className="flex items-start gap-4 flex-grow">
            <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0">
              {validatorIcon ? (
                <img 
                  src={validatorIcon} 
                  alt={validatorName || "Validator Logo"}
                  className="object-contain w-full h-full rounded-full border-2 border-gojira-red/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png";
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gojira-gray-light/20 flex items-center justify-center text-gojira-red text-xl font-bold">
                  {validatorName ? validatorName[0] : "V"}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm uppercase tracking-wider text-gojira-red">Solana Validator</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {isLoading ? (
                  <div className="h-8 w-64 bg-muted/30 rounded animate-pulse"></div>
                ) : (
                  validatorName || "Validator Dashboard"
                )}
              </h1>
              
              {/* Validator addresses */}
              <div className="mt-3 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-64 bg-muted/30 rounded animate-pulse"></div>
                    <div className="h-5 w-48 bg-muted/30 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    {/* Vote account */}
                    <div className="flex items-center gap-2 text-sm bg-gojira-gray-dark/80 px-3 py-2 rounded-md w-fit">
                      <span className="text-muted-foreground">Vote Account:</span>
                      <code className="font-mono text-white">
                        {truncateAddress(validatorPubkey, 8)}
                      </code>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-gojira-red hover:text-gojira-red-light"
                          onClick={() => copyToClipboard(validatorPubkey, "Vote Account")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <a 
                          href={solscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gojira-red hover:text-gojira-red-light h-6 w-6 flex items-center justify-center"
                          title="View on Solscan"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="glass-effect">
                              <p>Validator vote account on Solana blockchain</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    
                    {/* Identity account */}
                    {identityPubkey && (
                      <div className="flex items-center gap-2 text-sm bg-gojira-gray-dark/80 px-3 py-2 rounded-md w-fit">
                        <span className="text-muted-foreground">Identity:</span>
                        <code className="font-mono text-white">
                          {truncateAddress(identityPubkey, 8)}
                        </code>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gojira-red hover:text-gojira-red-light"
                            onClick={() => copyToClipboard(identityPubkey, "Identity")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <a 
                            href={identitySolscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gojira-red hover:text-gojira-red-light h-6 w-6 flex items-center justify-center"
                            title="View on Solscan"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Search and Refresh Buttons */}
          <div className="flex flex-col gap-4 md:min-w-64">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search validator..."
                  value={searchInput}
                  onChange={handleInputChange}
                  className="pl-9 bg-gojira-gray-dark border-gojira-gray-light"
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
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {validator.votePubkey.slice(0, 6)}...{validator.votePubkey.slice(-6)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="self-end text-muted-foreground hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
