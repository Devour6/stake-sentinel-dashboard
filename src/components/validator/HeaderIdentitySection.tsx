
import { Copy, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface HeaderIdentitySectionProps {
  validatorPubkey: string;
  identityPubkey?: string;
  isLoading?: boolean;
}

export const HeaderIdentitySection = ({ 
  validatorPubkey, 
  identityPubkey,
  isLoading = false,
}: HeaderIdentitySectionProps) => {
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

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
        <div className="h-5 w-32 bg-muted/30 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
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
          <div className="flex items-center gap-1 relative z-20">
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
  );
};
