
import React from 'react';

export const DashboardFooter = () => {
  return (
    <div className="mt-5 text-center text-sm text-muted-foreground">
      <p>Data refreshes automatically every 2 minutes. Last updated: {new Date().toLocaleTimeString()}</p>
      <div className="mt-2 flex justify-center gap-1 items-center">
        <span>Powered by</span>
        <span className="text-aero-purple font-semibold">AeroScan</span>
      </div>
    </div>
  );
};
