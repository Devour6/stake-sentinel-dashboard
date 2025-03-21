
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
        src="/lovable-uploads/f241ab61-a1b1-4ab3-a458-6a65ffac9040.png"
        alt="AeroScan Logo"
        className={`w-full h-full object-contain ${animationClass}`}
      />
    </div>
  );
};

export default Logo;
