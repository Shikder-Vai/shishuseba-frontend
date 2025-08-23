import React from 'react';

const PrimaryButton = ({ 
  children,
  size = 'md', // 'sm' | 'md' | 'lg'
  icon, // React component
  fullWidth = false,
  ...props 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  };

  return (
    <button
      className={`
        bg-primary hover:bg-brand-teal-500  // Uses DaisyUI primary color
        text-white font-medium
        rounded-lg transition-all
        duration-200 ease-in-out
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        shadow-soft
        hover:shadow-md
        transform hover:-translate-y-0.5
        active:translate-y-0
        flex items-center justify-center gap-2
      `}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};

export default PrimaryButton;