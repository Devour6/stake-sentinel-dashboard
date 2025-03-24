
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "", animate = false }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const animationClass = animate ? "hover:scale-105 transition-transform duration-300" : "";

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src="/lovable-uploads/d77bb215-62b8-4038-ac27-01eb95f981db.png"
        alt="AeroScan Logo"
        className={`w-full h-full object-contain ${animationClass}`}
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default Logo;
