
import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
  linkToHome?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  className = "", 
  animate = false,
  linkToHome = true
}) => {
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const animationClass = animate ? "hover:scale-105 transition-transform duration-300" : "";
  const logoContent = (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src="/images/logo.png"
        alt="AeroScan Logo"
        className={`w-full h-full object-contain ${animationClass}`}
        style={{ background: 'transparent' }}
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
