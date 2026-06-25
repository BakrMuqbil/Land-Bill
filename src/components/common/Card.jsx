import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = true,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-[2rem] shadow-sm border border-slate-100';
  const paddingStyles = padding ? 'p-6 sm:p-8' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
