
import { FC } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeframeToggleProps } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

export const TimeframeToggle: FC<TimeframeToggleProps> = ({ timeframe, onTimeframeChange }) => {
  const isMobile = useIsMobile();
  
  return (
    <ToggleGroup 
      type="single" 
      value={timeframe} 
      onValueChange={(value) => value && onTimeframeChange(value as "1M" | "6M" | "12M")}
      className={isMobile ? "toggle-group scale-90 origin-right" : ""}
    >
      <ToggleGroupItem value="1M" aria-label="1 Month" className="px-3 py-1 text-sm">1M</ToggleGroupItem>
      <ToggleGroupItem value="6M" aria-label="6 Months" className="px-3 py-1 text-sm">6M</ToggleGroupItem>
      <ToggleGroupItem value="12M" aria-label="12 Months" className="px-3 py-1 text-sm">12M</ToggleGroupItem>
    </ToggleGroup>
  );
};

export default TimeframeToggle;
