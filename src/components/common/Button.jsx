import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'rounded-xl font-bold transition-all flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[#059669] hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/40',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-3.5 text-sm',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
