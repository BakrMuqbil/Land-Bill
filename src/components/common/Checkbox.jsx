import React from 'react';

export const Checkbox = ({
  label,
  checked,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};
