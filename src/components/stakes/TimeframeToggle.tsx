
import { FC } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeframeToggleProps } from "./types";

export const TimeframeToggle: FC<TimeframeToggleProps> = ({ timeframe, onTimeframeChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={timeframe} 
      onValueChange={(value) => value && onTimeframeChange(value as "1M" | "6M" | "12M")}
    >
      <ToggleGroupItem value="1M" aria-label="1 Month">1M</ToggleGroupItem>
      <ToggleGroupItem value="6M" aria-label="6 Months">6M</ToggleGroupItem>
      <ToggleGroupItem value="12M" aria-label="12 Months">12M</ToggleGroupItem>
    </ToggleGroup>
  );
};

export default TimeframeToggle;
