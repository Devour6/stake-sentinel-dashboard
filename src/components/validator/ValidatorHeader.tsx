
import { HeaderInfoSection } from "./HeaderInfoSection";
import { HeaderIdentitySection } from "./HeaderIdentitySection";
import { HeaderSearchSection } from "./HeaderSearchSection";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface ValidatorHeaderProps {
  validatorPubkey: string;
  validatorName?: string;
  validatorIcon?: string | null;
  identityPubkey?: string;
  description?: string;
  version?: string;
  uptime?: number;
  isLoading?: boolean;
  onRefresh: () => void;
  onBack?: () => void;
  onStakeModalOpen: () => void;
}

export const ValidatorHeader = ({ 
  validatorPubkey, 
  validatorName,
  validatorIcon,
  identityPubkey,
  description,
  version,
  uptime,
  isLoading = false,
  onRefresh,
  onBack,
  onStakeModalOpen
}: ValidatorHeaderProps) => {
  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-2">
        <HeaderInfoSection 
          validatorName={validatorName}
          validatorIcon={validatorIcon}
          isLoading={isLoading}
          onBack={onBack}
        />
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="border-gojira-red text-gojira-red hover:bg-gojira-red/10 w-full md:w-auto"
            onClick={onStakeModalOpen}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Stake to Validator
          </Button>
          
          <HeaderSearchSection 
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="text-muted-foreground relative z-10">
        <HeaderIdentitySection
          validatorPubkey={validatorPubkey}
          identityPubkey={identityPubkey}
          description={description}
          version={version}
          uptime={uptime}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
