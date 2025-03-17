
import { ExternalLink, Info, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard`);
      })
      .catch((err) => {
        toast.error(`Failed to copy: ${err}`);
      });
  };

  // Solscan URLs instead of Explorer
  const solscanUrl = `https://solscan.io/account/${validatorPubkey}`;
  const identitySolscanUrl = identityPubkey ? `https://solscan.io/account/${identityPubkey}` : null;

  return (
    <div className="animate-slide-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-16 md:h-16 relative animate-pulse-subtle">
            <img 
              src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
              alt="Gojira Logo" 
              className="object-contain w-full h-full animate-roar"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-gojira-red mb-1">Solana Validator</p>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Gojira Stake Monitor</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-sm">Vote Account:</span>
                {isLoading ? (
                  <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
                ) : (
                  <div className="flex items-center gap-1">
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
                )}
              </div>
              
              {identityPubkey && !isLoading && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Identity:</span>
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
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            className="rounded-full bg-gojira-red hover:bg-gojira-red-dark"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
