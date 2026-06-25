import React from 'react';

export default function InvoiceItemsTable({
  currentItems,
  handleRemoveItem,
  editingItemIndex
}) {
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6">
      {/* نسخة سطح المكتب */}
      <div className="hidden md:block">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
              <th className="p-3.5">المواصفات والبيان</th>
              <th className="p-3.5 w-24">الوحدة</th>
              <th className="p-3.5 w-24">الكمية</th>
              <th className="p-3.5 w-28">السعر</th>
              <th className="p-3.5 w-28">الإجمالي</th>
              <th className="p-3.5 w-16 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-slate-50">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-slate-400 text-xs">الفاتورة لا تحتوي على أي بنود مبيعات حتى الآن.</td>
              </tr>
            ) : (
              currentItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40">
                  <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                  <td className="p-3.5 text-slate-500">{item.unit}</td>
                  <td className="p-3.5 text-slate-800 font-bold">{item.quantity}</td>
                  <td className="p-3.5 text-slate-600">${item.price}</td>
                  <td className="p-3.5 text-[#059669] font-extrabold">${item.total}</td>
                  <td className="p-3.5 text-center">
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نسخة الجوال */}
      <div className="md:hidden divide-y divide-slate-100">
        {currentItems.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium">
            لا توجد بنود مبيعات حتى الآن
          </div>
        ) : (
          currentItems.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/70 transition-all space-y-2.5 border-b border-slate-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  🗑️ حذف
                </button>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">المواصفات</span>
                <span className="text-sm font-bold text-slate-800 block">{item.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">الوحدة</span>
                  <span className="text-sm font-bold text-slate-700">{item.unit}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 block">الكمية</span>
                  <span className="text-sm font-bold text-slate-800">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 block">السعر</span>
                  <span className="text-sm font-bold text-slate-600">${item.price}</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-emerald-50/50 rounded-lg p-3 border border-emerald-100/50">
                <span className="text-sm font-bold text-slate-600">الإجمالي:</span>
                <span className="text-base font-extrabold text-emerald-600">${item.total}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
