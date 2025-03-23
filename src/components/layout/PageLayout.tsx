
import React from "react";
import Logo from "@/components/layout/Logo";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-aero-dark to-aero-gray-dark p-4 relative overflow-hidden">
      <Navbar />
      <div
        className="relative w-full flex-1 flex items-center justify-center bg-contain bg-no-repeat bg-center pt-16"
        style={{
          backgroundImage: "url(/images/bg_main.svg)",
        }}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default PageLayout;
