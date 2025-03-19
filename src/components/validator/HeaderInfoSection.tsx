
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderInfoSectionProps {
  validatorName?: string;
  validatorIcon?: string | null;
  isLoading?: boolean;
  onBack?: () => void;
}

export const HeaderInfoSection = ({
  validatorName,
  validatorIcon,
  isLoading = false,
  onBack
}: HeaderInfoSectionProps) => {
  return (
    <div className="flex items-center gap-3 w-full">
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
      <div className="w-12 h-12 md:w-16 md:h-16 relative animate-pulse-subtle shrink-0 flex items-center justify-center">
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
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white truncate">
          {isLoading ? (
            <div className="h-8 w-64 bg-muted/30 rounded animate-pulse"></div>
          ) : (
            validatorName || "Validator Dashboard"
          )}
        </h1>
      </div>
    </div>
  );
};
