
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HeaderControlsSectionProps {
  onRefresh: () => void;
  isLoading?: boolean;
  onStakeModalOpen?: () => void;
}

export const HeaderControlsSection = ({
  onRefresh,
  isLoading = false,
  onStakeModalOpen
}: HeaderControlsSectionProps) => {
  const handleRefresh = () => {
    onRefresh();
    toast.info("Refreshing data...", {
      duration: 1500,
      position: "top-center"
    });
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <Button 
        variant="destructive" 
        size="icon"
        className="rounded-full bg-aero-purple hover:bg-aero-purple-dark transition-all duration-300 h-8 w-8 flex items-center justify-center"
        onClick={handleRefresh}
        disabled={isLoading}
        title="Refresh data"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      
      {onStakeModalOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onStakeModalOpen}
          className="bg-aero-purple hover:bg-aero-purple-dark text-white border-none whitespace-nowrap"
        >
          Swap to aeroSOL
        </Button>
      )}
    </div>
  );
};
