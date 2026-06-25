import React from 'react';

export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  className = '',
  required = false,
  error = '',
  ...props
}) => {
  const baseStyles = 'w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-medium';

  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
