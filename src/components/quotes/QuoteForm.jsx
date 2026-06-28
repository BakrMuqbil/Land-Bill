import React from 'react';
import QuoteItemsTable from './QuoteItemsTable';
import QuoteOptions from './QuoteOptions';

export default function QuoteForm({
  editingQuoteId,
  loading,
  quoteNumber,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  currentItems,
  products,
  handleRowProductChange,
  handleRowPriceChange,
  handleRowQuantityChange,
  handleRemoveRow,
  handleAddNewRow,
  calculateGrandTotal,
  includeWarranty,
  setIncludeWarranty,
  includeNote,
  setIncludeNote,
  customNoteText,
  setCustomNoteText,
  handleSubmitQuote,
  handleCancelEdit
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-emerald-50 text-[#059669] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          {editingQuoteId ? 'تعديل عرض سعر' : 'إنشاء عرض سعر جديد'}
        </h2>
        <div className="flex items-center gap-2">
          {quoteNumber && (
            <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200">
              📋 رقم العرض: {quoteNumber}
            </span>
          )}
          {editingQuoteId && (
            <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
              تعديل
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitQuote} className="space-y-6">
        {/* 1. بيانات العميل الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">اسم العميل / الجهة المستهدفة</label>
            <input
              type="text"
              placeholder="اسم العميل"
              value={customerName || ''}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">رقم الجوال</label>
            <input
              type="text"
              placeholder="77..."
              value={customerPhone || ''}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium w-full"
              dir="ltr"
            />
          </div>
        </div>

        {/* 2. شريط إضافة الأصناف */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-4">
          <QuoteItemsTable
            currentItems={currentItems}
            products={products}
            handleRowProductChange={handleRowProductChange}
            handleRowPriceChange={handleRowPriceChange}
            handleRowQuantityChange={handleRowQuantityChange}
            handleRemoveRow={handleRemoveRow}
            handleAddNewRow={handleAddNewRow}
          />
        </div>

        {/* 3. خيارات الضمان والملاحظات */}
        <QuoteOptions
          includeWarranty={includeWarranty}
          setIncludeWarranty={setIncludeWarranty}
          includeNote={includeNote}
          setIncludeNote={setIncludeNote}
          customNoteText={customNoteText || ''}
          setCustomNoteText={setCustomNoteText}
        />

        {/* 4. الحسابات المالية */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div>
              <span className="text-xs font-bold text-slate-500 block">الملخص المالي للعرض</span>
              <span className="text-xl font-black text-[#059669] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100/60 inline-block">
                ${calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-200/60">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm shadow-md transition-all shadow-emerald-600/10 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري الحفظ...
                </div>
              ) : (
                editingQuoteId ? 'حفظ التغييرات وتحديث الـ PDF' : 'حفظ العرض وتوليد الـ PDF'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}