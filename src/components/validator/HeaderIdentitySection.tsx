
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

  const truncateUrl = (url: string, maxLength = 30) => {
    if (!url) return "";
    url = url.replace(/^https?:\/\//, '');
    if (url.length <= maxLength) return url;
    return `${url.slice(0, maxLength - 3)}...`;
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
    <div className="space-y-4 w-full">
      {description && (
        <div className="text-sm text-white mb-4 w-full bg-aero-gray-dark/30 p-3 rounded-md border border-aero-gray-light/20">
          {description}
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Vote Account Section */}
        <div className="flex items-center gap-1 bg-aero-gray-dark/30 px-2 py-1 rounded-md">
          <span className="text-sm whitespace-nowrap">Vote Account:</span>
          <code className="bg-aero-gray-dark/50 px-2 py-0.5 rounded text-sm font-mono">
            {truncateAddress(validatorPubkey, 6)}
          </code>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto hover:bg-transparent text-aero-purple hover:text-aero-purple-light"
            onClick={() => copyToClipboard(validatorPubkey, "Vote Account")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <a 
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-aero-purple hover:text-aero-purple-light transition-colors"
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
          <div className="flex items-center gap-1 bg-aero-gray-dark/30 px-2 py-1 rounded-md">
            <span className="text-sm whitespace-nowrap">Identity:</span>
            <code className="bg-aero-gray-dark/50 px-2 py-0.5 rounded text-sm font-mono">
              {truncateAddress(identityPubkey, 6)}
            </code>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto hover:bg-transparent text-aero-purple hover:text-aero-purple-light"
              onClick={() => copyToClipboard(identityPubkey, "Identity")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <a 
              href={identitySolscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-aero-purple hover:text-aero-purple-light transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
        
        {/* Website Badge */}
        {website && (
          <div className="flex items-center gap-1 bg-aero-gray-dark/30 px-2 py-1 rounded-md">
            <span className="text-sm whitespace-nowrap">Website:</span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-aero-purple hover:text-aero-purple-light transition-colors flex items-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    <span className="text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px] xl:max-w-[400px]">
                      {truncateUrl(website, 50)}
                    </span>
                  </a>
                </TooltipTrigger>
                <TooltipContent className="glass-effect">
                  <p>{website}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Version Badge */}
        {version && (
          <Badge variant="outline" className="bg-aero-gray-dark/30 text-white border-aero-gray-light">
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
