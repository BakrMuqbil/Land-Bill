import React from 'react';

export const Table = ({
  columns,
  data,
  actions,
  emptyMessage = 'لا توجد بيانات',
  className = '',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-100 ${className}`}>
      <table className="w-full text-right" {...props}>
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
            {columns.map((col, idx) => (
              <th key={idx} className={`p-3.5 ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-medium divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-6 text-slate-400 text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="p-3.5">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="p-3.5 text-center">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
