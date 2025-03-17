
import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ValidatorHeaderProps {
  validatorPubkey: string;
  identityPubkey?: string;
  isLoading?: boolean;
}

export const ValidatorHeader = ({ 
  validatorPubkey, 
  identityPubkey,
  isLoading = false 
}: ValidatorHeaderProps) => {
  const truncateAddress = (address: string, length = 8) => {
    if (!address) return "";
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  };

  const explorerUrl = `https://explorer.solana.com/vote-account/${validatorPubkey}`;
  const identityUrl = identityPubkey ? `https://explorer.solana.com/address/${identityPubkey}` : null;

  return (
    <div className="animate-slide-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary mb-1">Solana Validator</p>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Stake Monitor</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-sm">Vote Account:</span>
              {isLoading ? (
                <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
              ) : (
                <code className="bg-secondary/50 px-2 py-0.5 rounded text-sm font-mono">
                  {truncateAddress(validatorPubkey, 6)}
                </code>
              )}
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
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
            
            {identityPubkey && !isLoading && (
              <>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">Identity:</span>
                  <code className="bg-secondary/50 px-2 py-0.5 rounded text-sm font-mono">
                    {truncateAddress(identityPubkey, 6)}
                  </code>
                  <a 
                    href={identityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            className="rounded-full"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
