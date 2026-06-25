import React from 'react';

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  error = '',
  ...props
}) => {
  const baseStyles = 'w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium';

  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
