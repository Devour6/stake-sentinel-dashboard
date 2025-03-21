
import React from 'react';

export const DashboardFooter = () => {
  return (
    <div className="mt-5 text-center text-sm text-muted-foreground">
      <p>Data refreshes automatically every 2 minutes. Last updated: {new Date().toLocaleTimeString()}</p>
      <div className="mt-2 flex justify-center gap-1 items-center">
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
