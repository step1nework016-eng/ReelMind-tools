import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  
  const baseStyle = "relative inline-flex items-center justify-center px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-black disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant";
  
  const variants = {
    primary: "bg-cyber-primary text-cyber-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] focus:ring-cyber-primary",
    secondary: "bg-cyber-secondary text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(255,0,60,0.6)] focus:ring-cyber-secondary",
    outline: "bg-transparent border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] focus:ring-cyber-primary"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          處理中
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
};