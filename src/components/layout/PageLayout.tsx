
import React from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  onStakeModalOpen: () => void;
}

const PageLayout = ({ children, onStakeModalOpen }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gojira-gray to-gojira-gray-dark p-4">
      <div className="fixed top-4 right-4 z-10">
        <Button 
          variant="outline" 
          className="border-gojira-red text-gojira-red hover:bg-gojira-red/10"
          onClick={onStakeModalOpen}
        >
          Stake to Gojira Validator
        </Button>
      </div>

      <div className="w-full max-w-3xl mx-auto text-center mb-6 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">
          NodeScan
        </h1>
      </div>

      {children}
    </div>
  );
};

export default PageLayout;
