
import React from "react";

const Footer = () => {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <div className="flex justify-center gap-1 items-center">
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

export default Footer;
