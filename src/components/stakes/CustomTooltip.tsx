
import { FC } from "react";
import { formatSol } from "@/services/solanaApi";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect p-3 border border-gojira-gray-light rounded-lg shadow-sm">
        <p className="font-medium">Epoch {label}</p>
        <p className="text-gojira-red font-bold">{formatSol(payload[0].value)}</p>
        <p className="text-xs text-muted-foreground">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
