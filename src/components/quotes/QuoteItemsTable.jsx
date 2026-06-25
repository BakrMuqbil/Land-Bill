import React from 'react';

export default function QuoteItemsTable({
  currentItems,
  products,
  handleRowProductChange,
  handleRowPriceChange,
  handleRowQuantityChange,
  handleRemoveRow,
  handleAddNewRow
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📦</span>
        <h3 className="text-sm font-black text-slate-700">أصناف ومواد منظومة العرض</h3>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        {/* نسخة سطح المكتب */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 min-w-[240px]">اسم الصنف / المنتج</th>
                <th className="p-3 w-36 text-center">سعر الوحدة ($)</th>
                <th className="p-3 w-24 text-center">الكمية</th>
                <th className="p-3 w-32 text-center">الإجمالي ($)</th>
                <th className="p-3 w-16 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((item, index) => {
                const currentTotal = (parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 0);
                return (
                  <tr key={item.rowId} className="hover:bg-slate-50/70 transition-all">
                    <td className="p-3 text-center text-slate-400 font-bold">{index + 1}</td>
                    <td className="p-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleRowProductChange(item.rowId, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- اختر صنف من المخزن --</option>
                        {products.map(p => {
                          const pId = p.id || p._id;
                          return (
                            <option key={pId} value={pId}>{p.name} (${p.price})</option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="any"
                        value={item.customPrice}
                        onChange={(e) => handleRowPriceChange(item.rowId, e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleRowQuantityChange(item.rowId, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-3 text-center font-extrabold text-slate-700">
                      ${currentTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(item.rowId)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all"
                        title="حذف هذا السطر"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* نسخة الجوال */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentItems.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              لا توجد أصناف مضافة حتى الآن
            </div>
          ) : (
            currentItems.map((item, index) => {
              const currentTotal = (parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 0);
              return (
                <div key={item.rowId} className="p-4 hover:bg-slate-50/70 transition-all space-y-2.5 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(item.rowId)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم الصنف</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleRowProductChange(item.rowId, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- اختر صنف --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">سعر الوحدة ($)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.customPrice}
                        onChange={(e) => handleRowPriceChange(item.rowId, e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-center text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">الكمية</label>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleRowQuantityChange(item.rowId, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-center text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50/50 rounded-lg p-3 border border-emerald-100/50">
                    <span className="text-sm font-bold text-slate-600">الإجمالي:</span>
                    <span className="text-base font-extrabold text-emerald-600">${currentTotal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddNewRow}
        className="mt-4 w-full py-3.5 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50 font-black text-xs transition-all flex items-center justify-center gap-2"
      >
        <span className="text-base">➕</span> إضافة صنف آخر للعرض
      </button>
    </div>
  );
}
