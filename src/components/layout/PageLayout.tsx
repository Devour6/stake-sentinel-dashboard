
import React from "react";
import Footer from "@/components/layout/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gojira-gray to-gojira-gray-dark p-4">
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
