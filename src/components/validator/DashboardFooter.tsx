
import React from 'react';

export const DashboardFooter = () => {
  return (
    <div className="mt-5 text-center text-sm text-muted-foreground">
      <p>Data refreshes automatically every 2 minutes. Last updated: {new Date().toLocaleTimeString()}</p>
      <div className="mt-2 flex justify-center gap-1 items-center">
        <span>Powered by</span>
        <span className="text-gojira-red font-semibold">Gojira</span>
        <img 
          src="/lovable-uploads/31314417-ef5b-4d58-ac5e-91a2ab487110.png" 
          alt="Gojira Logo" 
          className="w-4 h-4"
        />
      </div>
    </div>
  );
};
