
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";

interface HeaderSearchSectionProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export const HeaderSearchSection = ({
  onRefresh,
  isLoading = false
}: HeaderSearchSectionProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-64 md:w-80">
        <SearchBar showStakeAmount={true} />
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        disabled={isLoading}
        className="text-muted-foreground hover:text-white"
      >
        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
