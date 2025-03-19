
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Hexagon outer shape - red */}
      <div className="absolute inset-0 text-gojira-red transform hover:scale-105 transition-transform duration-300">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
        </svg>
      </div>
      
      {/* Inner gray shape */}
      <div className="absolute inset-0 scale-[0.85] text-gojira-gray-light transform translate-y-1 translate-x-1">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <polygon points="50,15 80,33 80,67 50,85 20,67 20,33" />
        </svg>
      </div>
      
      {/* Letter N stylized */}
      <div className="absolute inset-0 text-gojira-red transform translate-y-0.5">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M34,30 L34,70 L44,70 L44,45 L66,70 L66,30 L56,30 L56,55 L34,30" />
        </svg>
      </div>

      {/* 3D shadow effect for depth */}
      <div className="absolute inset-0 opacity-30 blur-sm -z-10 bg-black transform translate-y-1 translate-x-1 rounded-xl"></div>
    </div>
  );
};

export default Logo;
