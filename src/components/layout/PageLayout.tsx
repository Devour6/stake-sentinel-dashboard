
import React from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";

interface PageLayoutProps {
  children: React.ReactNode;
  onStakeModalOpen: () => void;
  onPositionsModalOpen: () => void;
}

const PageLayout = ({
  children,
  onStakeModalOpen,
  onPositionsModalOpen,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-aero-dark to-aero-gray-dark p-4 relative overflow-hidden">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: "url('/lovable-uploads/28b498b2-7737-4119-b4b7-47387f6617b2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          mixBlendMode: "soft-light",
        }}
      />
      
      <div className="fixed top-4 right-4 z-10 flex gap-4">
        <Button
          variant="outline"
          className="border-white/50 text-white hover:border-aero-purple/10"
          onClick={onPositionsModalOpen}
        >
          My Stakes
        </Button>
        <Button
          variant="outline"
          className="border-aero-purple text-aero-purple hover:bg-aero-purple/10"
          onClick={onStakeModalOpen}
        >
          Swap to aeroSOL
        </Button>
      </div>

      <div className="w-full max-w-3xl mx-auto text-center mb-6 animate-fade-in z-1">
        <div className="flex items-center justify-center gap-3">
          <Logo size="md" className="animate-float" animate={true} />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">
            AeroScan
          </h1>
        </div>
      </div>

      <div className="relative z-1 w-full">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
