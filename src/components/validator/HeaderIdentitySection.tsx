
import { Copy, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface HeaderIdentitySectionProps {
  validatorPubkey: string;
  identityPubkey?: string;
  isLoading?: boolean;
  version?: string;
  uptime?: number;
  description?: string;
  website?: string | null;
}

export const HeaderIdentitySection = ({ 
  validatorPubkey, 
  identityPubkey,
  isLoading = false,
  version,
  uptime,
  description,
  website
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
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-muted-foreground mb-2 max-w-3xl">
          {description}
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Vote Account Section */}
        <div className="flex items-center gap-1 bg-gojira-gray-dark/30 px-2 py-1 rounded-md">
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
        
        {/* Identity Account Section */}
        {identityPubkey && (
          <div className="flex items-center gap-1 bg-gojira-gray-dark/30 px-2 py-1 rounded-md">
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
        )}
        
        {/* Website Badge */}
        {website && (
          <div className="flex items-center gap-1 bg-gojira-gray-dark/30 px-2 py-1 rounded-md">
            <span className="text-sm whitespace-nowrap">Website:</span>
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gojira-red hover:text-gojira-red-light transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              <span className="text-sm">{website.replace(/^https?:\/\//, '')}</span>
            </a>
          </div>
        )}
        
        {/* Version Badge */}
        {version && (
          <Badge variant="outline" className="bg-gojira-gray-dark/30 text-white border-gojira-gray-light">
            Version: {version}
          </Badge>
        )}
        
        {/* Uptime Badge */}
        {uptime !== undefined && (
          <Badge variant="outline" className={`${uptime >= 95 ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
            Uptime (30d): {uptime}%
          </Badge>
        )}
      </div>
    </div>
  );
};
