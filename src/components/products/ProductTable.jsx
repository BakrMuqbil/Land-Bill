import React from 'react';

export default function ProductTable({
  products,
  onEdit,
  onDelete
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pr-1">
        قائمة الأصناف المتوفرة حالياً ({products.length})
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-100 text-xs font-bold uppercase tracking-wider">
              <th className="p-4">مواصفات الصنف</th>
              <th className="p-4 w-32">السعر</th>
              <th className="p-4 w-28">الوحدة</th>
              <th className="p-4 w-36 text-center">العمليات</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-slate-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-slate-400 font-bold">
                  لا توجد أي أصناف في ملف الـ JSON حالياً.
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4 text-[#059669] font-extrabold">${p.price}</td>
                  <td className="p-4 text-slate-500">{p.unit}</td>
                  <td className="p-4 flex justify-center items-center gap-2">
                    {/* زر التعديل الإجرائي */}
                    <button
                      onClick={() => onEdit(p)}
                      className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all text-xs font-bold"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>تعديل</span>
                    </button>

                    {/* زر الحذف الفوري */}
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all text-xs font-bold"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>حذف</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
