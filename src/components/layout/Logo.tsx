
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
      {/* Simple hexagon shape - red */}
      <div className={`absolute inset-0 text-gojira-red transform ${animationClass}`}>
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
        </svg>
      </div>
      
      {/* Simple N letter */}
      <div className="absolute inset-0 text-white transform">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M35,30 L35,70 L45,70 L45,50 L65,70 L65,30 L55,30 L55,50 L35,30" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export default Logo;
