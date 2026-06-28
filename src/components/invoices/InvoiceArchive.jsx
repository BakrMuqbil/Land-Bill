import React, { useMemo, useState } from 'react';
import { printLandSolarDocument } from "../pdf/PDFGenerator.js";
import SearchBar from '../common/SearchBar.jsx';

export default function InvoiceArchive({
  invoices,
  editingInvoiceId,
  getInvoiceStatus,
  onEdit,
  onDelete,
  onPrint
}) {
  // ============================================
  // حالة البحث
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================
  // دالة البحث الذكية
  // ============================================
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;

    const query = searchQuery.trim().toLowerCase();
    
    return invoices.filter((inv) => {
      // دعم camelCase و snake_case
      const customerName = (inv.customerName || inv.customer_name || '').toLowerCase();
      const customerPhone = (inv.customerPhone || inv.customer_phone || '').toLowerCase();
      const invoiceNumber = (inv.invoiceNumber || '').toLowerCase();
      const grandTotal = String(inv.grandTotal || inv.grand_total || '');
      const status = (inv.status || '').toLowerCase();

      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        invoiceNumber.includes(query) ||
        grandTotal.includes(query) ||
        status.includes(query)
      );
    });
  }, [invoices, searchQuery]);

  // ============================================
  // الـ Return
  // ============================================
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
      {/* Header مع شريط البحث */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h3 className="text-lg font-bold text-slate-800 whitespace-nowrap">
            دفتر أرشيف الفواتير الصادرة
          </h3>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200 whitespace-nowrap">
            {filteredInvoices.length}
          </span>
        </div>

        {/* 🔥 شريط البحث */}
        <div className="w-full sm:w-72 md:w-80">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="🔍 بحث في الفواتير..."
            initialValue={searchQuery}
          />
        </div>
      </div>

      {/* 🔥 رسالة نتائج البحث */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-emerald-50/50 rounded-xl px-4 py-2.5 mb-4 border border-emerald-100">
          <span className="text-sm text-slate-600">
            <span className="font-bold text-emerald-700">{filteredInvoices.length}</span>
            {' '}نتيجة لعرض "{searchQuery}"
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            إلغاء البحث ✕
          </button>
        </div>
      )}

      {/* عرض النتائج */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 font-medium">لا توجد نتائج مطابقة للبحث</p>
          <p className="text-slate-300 text-sm mt-1">حاول تغيير كلمات البحث</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-bold text-sm underline-offset-2 underline"
            >
              عرض جميع الفواتير
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
                <th className="p-3.5">رقم الفاتورة</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">الإجمالي</th>
                <th className="p-3.5">المدفوع</th>
                <th className="p-3.5">المتبقي</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-slate-50">
              {filteredInvoices.map(inv => {
                // دعم camelCase و snake_case
                const customerName = inv.customerName || inv.customer_name || '—';
                const grandTotal = inv.grandTotal || inv.grand_total || 0;
                const amountPaid = inv.amountPaid || inv.amount_paid || 0;
                const amountRemaining = inv.amountRemaining || inv.amount_remaining || 0;
                const status = inv.status || 'غير مدفوعة';
                const createdAt = inv.createdAt || inv.created_at;
                const invoiceNumber = inv.invoiceNumber || '—';
                const statusInfo = getInvoiceStatus(grandTotal, amountPaid);

                return (
                  <tr key={inv.id} className={`hover:bg-slate-50/40 ${editingInvoiceId === inv.id ? 'bg-amber-50/50 border-r-4 border-amber-400' : ''}`}>
                    <td className="p-3.5 font-bold text-emerald-600 text-xs">
                      {invoiceNumber}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{customerName}</td>
                    <td className="p-3.5 text-slate-800 font-extrabold">${Number(grandTotal).toLocaleString()}</td>
                    <td className="p-3.5 text-emerald-600 font-bold">${Number(amountPaid).toLocaleString()}</td>
                    <td className="p-3.5 text-red-600 font-bold">${Number(amountRemaining).toLocaleString()}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {status || statusInfo.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs">
                      {createdAt ? new Date(createdAt).toLocaleDateString('ar-YE') : '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(inv)}
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="تعديل"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => onPrint(inv)}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="طباعة"
                        >
                          🖨️ طباعة
                        </button>
                        <button
                          onClick={() => onDelete(inv.id, customerName)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          title="حذف"
                        >
                          إلغاء
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
