
import { HeaderInfoSection } from "./HeaderInfoSection";
import { HeaderIdentitySection } from "./HeaderIdentitySection";
import { HeaderSearchSection } from "./HeaderSearchSection";

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
  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <HeaderInfoSection 
          validatorName={validatorName}
          validatorIcon={validatorIcon}
          isLoading={isLoading}
          onBack={onBack}
        />
        
        <HeaderSearchSection 
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </div>
      
      <div className="text-muted-foreground relative z-10">
        <HeaderIdentitySection
          validatorPubkey={validatorPubkey}
          identityPubkey={identityPubkey}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
