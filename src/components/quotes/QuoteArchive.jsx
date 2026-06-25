import React, { useMemo, useState } from 'react';
import { printLandSolarDocument } from "../pdf/PDFGenerator.js";
import SearchBar from '../common/SearchBar.jsx';

export default function QuoteArchive({
  quotes,
  onEdit,
  onDelete,
  onApprove,
  onUnapprove
}) {
  // ============================================
  // حالة البحث
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================
  // دالة البحث الذكية
  // ============================================
  const filteredQuotes = useMemo(() => {
    if (!searchQuery.trim()) return quotes;

    const query = searchQuery.trim().toLowerCase();
    
    return quotes.filter((q) => {
      // جلب البيانات مع دعم camelCase و snake_case
      const customerName = (q.customerName || q.customer_name || '').toLowerCase();
      const customerPhone = (q.customerPhone || q.customer_phone || '').toLowerCase();
      const quoteNumber = (q.quote_number || '').toLowerCase();
      const grandTotal = String(q.grandTotal || q.grand_total || '');
      const status = (q.status || '').toLowerCase();
      const note = (q.note || '').toLowerCase();

      // البحث في جميع الحقول
      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        quoteNumber.includes(query) ||
        grandTotal.includes(query) ||
        status.includes(query) ||
        note.includes(query)
      );
    });
  }, [quotes, searchQuery]);

  // ============================================
  // دالة لتنظيف النص للبحث
  // ============================================
  const normalizeText = (text) => {
    return text?.toString().toLowerCase().trim() || '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-7 transition-all">
      {/* Header مع شريط البحث */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-2xl">🗄️</span>
          <h2 className="text-xl font-black text-slate-800 whitespace-nowrap">أرشيف عروض الأسعار</h2>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200 whitespace-nowrap">
            {filteredQuotes.length} عرض
          </span>
        </div>
        
        {/* 🔥 شريط البحث */}
        <div className="w-full sm:w-72 md:w-80">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="🔍 بحث في العروض..."
            initialValue={searchQuery}
          />
        </div>
      </div>

      {/* 🔥 رسالة نتائج البحث */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-emerald-50/50 rounded-xl px-4 py-2.5 mb-4 border border-emerald-100">
          <span className="text-sm text-slate-600">
            <span className="font-bold text-emerald-700">{filteredQuotes.length}</span>
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
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 font-medium">لا توجد نتائج مطابقة للبحث</p>
          <p className="text-slate-300 text-sm mt-1">حاول تغيير كلمات البحث</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-bold text-sm underline-offset-2 underline"
            >
              عرض جميع العروض
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ✅ نسخة سطح المكتب (جدول) */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-right text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3.5">رقم العرض</th>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">الجوال</th>
                  <th className="p-3.5">الإضافات</th>
                  <th className="p-3.5">الإجمالي</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => {
                  const currentQuoteId = q.id || q._id;
                  const customerName = q.customerName || q.customer_name || '—';
                  const customerPhone = q.customerPhone || q.customer_phone || '—';
                  const grandTotal = q.grandTotal || q.grand_total || 0;
                  const hasWarranty = q.hasWarranty || q.has_warranty || false;
                  const note = q.note || '';
                  const status = q.status || 'pending';
                  const createdAt = q.createdAt || q.created_at;
                  const quoteNumber = q.quote_number || '—';
                  const isApproved = status === 'approved';

                  return (
                    <tr key={currentQuoteId} className="hover:bg-slate-50/70 transition-all duration-200 group">
                      <td className="p-3.5 font-bold text-emerald-600 text-xs">
                        {quoteNumber}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{customerName}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{customerPhone}</td>
                      <td className="p-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {hasWarranty && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              🛡️ ضمان
                            </span>
                          )}
                          {note && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200" title={note}>
                              📝 ملاحظة
                            </span>
                          )}
                          {!hasWarranty && !note && (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-[#059669] font-black">
                        ${Number(grandTotal).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isApproved 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {isApproved ? 'معتمد' : 'معلق'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs font-medium">
                        {createdAt ? new Date(createdAt).toLocaleDateString('en-US') : '—'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => printLandSolarDocument(q, 'offer')}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                            title="طباعة"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(q)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                            title="تعديل"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {isApproved ? (
                            <button
                              type="button"
                              onClick={() => onUnapprove(currentQuoteId)}
                              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 border border-amber-200"
                              title="إلغاء التعميد"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onApprove(currentQuoteId)}
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 border border-emerald-200"
                              title="تعميد العرض"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDelete(currentQuoteId, customerName)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="حذف"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ نسخة الجوال (بطاقات) */}
          <div className="lg:hidden space-y-4">
            {filteredQuotes.map((q) => {
              const currentQuoteId = q.id || q._id;
              const customerName = q.customerName || q.customer_name || '—';
              const customerPhone = q.customerPhone || q.customer_phone || '—';
              const grandTotal = q.grandTotal || q.grand_total || 0;
              const hasWarranty = q.hasWarranty || q.has_warranty || false;
              const note = q.note || '';
              const status = q.status || 'pending';
              const createdAt = q.createdAt || q.created_at;
              const quoteNumber = q.quote_number || '—';
              const isApproved = status === 'approved';

              return (
                <div
                  key={currentQuoteId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* رأس البطاقة */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {quoteNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {isApproved ? 'معتمد' : 'معلق'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {createdAt ? new Date(createdAt).toLocaleDateString('en-US') : '—'}
                    </span>
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">العميل</p>
                        <p className="text-sm font-bold text-slate-800">{customerName}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400 font-medium">الجوال</p>
                        <p className="text-sm font-bold text-slate-700">{customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">الإجمالي</p>
                        <p className="text-lg font-black text-[#059669]">
                          ${Number(grandTotal).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {hasWarranty && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                            🛡️
                          </span>
                        )}
                        {note && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200" title={note}>
                            📝
                          </span>
                        )}
                        {!hasWarranty && !note && (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => printLandSolarDocument(q, 'offer')}
                        className="flex-1 min-w-[40px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        🖨️ طباعة
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(q)}
                        className="flex-1 min-w-[40px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        ✏️ تعديل
                      </button>
                      {isApproved ? (
                        <button
                          type="button"
                          onClick={() => onUnapprove(currentQuoteId)}
                          className="flex-1 min-w-[40px] bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          🔄 إلغاء
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onApprove(currentQuoteId)}
                          className="flex-1 min-w-[40px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          ✅ تعميد
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(currentQuoteId, customerName)}
                        className="flex-1 min-w-[40px] bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
