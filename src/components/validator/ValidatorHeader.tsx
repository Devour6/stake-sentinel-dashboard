
import { useRef } from "react";
import { ExternalLink, Info, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ValidatorHeaderProps {
  validatorPubkey: string;
  validatorName?: string;
  validatorIcon?: string | null;
  identityPubkey?: string;
  isLoading?: boolean;
  onRefresh: () => void;
}

export const ValidatorHeader = ({ 
  validatorPubkey, 
  validatorName,
  validatorIcon,
  identityPubkey,
  isLoading = false,
  onRefresh
}: ValidatorHeaderProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const truncateAddress = (address: string, length = 6) => {
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

  return (
    <div className="bg-gojira-gray-dark/60 backdrop-blur-sm rounded-2xl p-6 border border-gojira-gray-light/30 animate-slide-down">
      <div className="flex items-start gap-6">
        {/* Validator Icon */}
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
        
        {/* Validator Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div>
              <p className="text-sm uppercase tracking-wider text-gojira-red">Solana Validator</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {isLoading ? (
                  <div className="h-8 w-64 bg-muted/30 rounded animate-pulse"></div>
                ) : (
                  validatorName || "Validator Dashboard"
                )}
              </h1>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="ml-auto text-muted-foreground hover:text-white"
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden md:inline">Refresh</span>
            </Button>
          </div>
          
          {/* Validator addresses */}
          <div className="mt-4 space-y-2">
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
    </div>
  );
};
