
import React from "react";

const Footer = () => {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <div className="flex justify-center gap-1 items-center">
        <span>Powered by</span>
        <span className="text-aero-purple font-semibold">Phase Labs</span>
        <img 
          src="/lovable-uploads/f241ab61-a1b1-4ab3-a458-6a65ffac9040.png" 
          alt="AeroScan Logo" 
          className="w-4 h-4"
        />
      </div>
    </div>
  );
};

export default Footer;
