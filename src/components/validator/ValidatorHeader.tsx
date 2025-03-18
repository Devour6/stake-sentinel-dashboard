
import { useState, useRef } from "react";
import { ExternalLink, Info, Copy, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { HeaderSearchSection } from "./HeaderSearchSection";
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
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const {
    handleSearch,
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
            
            <div className="text-muted-foreground relative z-10">
              {isLoading ? (
                <div className="flex flex-col space-y-2">
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative">
                  <div className="flex items-center gap-1 relative z-10">
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
                  
                  {identityPubkey && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 relative z-10">
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
        
        <div className="flex flex-row gap-2 items-center ml-auto max-w-full shrink-0">
          <HeaderSearchSection
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearchSubmit={handleSearchSubmit}
          />
          
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
        </div>
      </div>
      
      {/* Description section - optional */}
      {description && !isLoading && (
        <div className="mt-2 text-sm text-muted-foreground bg-gojira-gray-dark/50 p-3 rounded-md">
          <p>{description}</p>
          {(version || uptime) && (
            <div className="flex gap-4 mt-2 text-xs">
              {version && <span>Version: {version}</span>}
              {uptime && <span>Uptime: {uptime.toFixed(2)}%</span>}
              {website && (
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gojira-red hover:text-gojira-red-light flex items-center gap-1"
                >
                  Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Stake button - optional */}
      {onStakeModalOpen && !isLoading && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="destructive" 
            size="sm"
            className="bg-gojira-red hover:bg-gojira-red-dark"
            onClick={onStakeModalOpen}
          >
            Stake to this Validator
          </Button>
        </div>
      )}
    </div>
  );
};
