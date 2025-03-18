
import { FC } from "react";
import { TooltipProps } from "recharts";

const CustomTooltip: FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
    
    return (
      <div className="bg-gojira-gray-light/80 backdrop-blur-md p-3 border border-gojira-gray-light rounded-lg shadow-md">
        <p className="font-medium text-sm">{formattedDate}</p>
        <p className="text-gojira-red font-bold">
          {`${Number(payload[0].value).toLocaleString()} SOL`}
        </p>
      </div>
    );
  }
  
  return null;
};

export default CustomTooltip;
