import React from 'react';

export const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  required = false,
  error = '',
  ...props
}) => {
  const baseStyles = 'w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-inner';

  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
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
