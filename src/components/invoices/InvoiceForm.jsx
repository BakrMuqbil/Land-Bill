import React from 'react';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceOptions from './InvoiceOptions';

export default function InvoiceForm({
  editingInvoiceId,
  invoiceNumber,        // 🔥 جديد
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedProductId,
  setSelectedProductId,
  customPrice,
  setCustomPrice,
  quantity,
  setQuantity,
  products,
  handleProductChange,
  handleAddItem,
  handleAddNewRow,
  currentItems,
  editingItemIndex,
  handleRemoveItem,
  calculateTotal,
  amountPaid,
  setAmountPaid,
  calculateRemaining,
  includeStamp,
  setIncludeStamp,
  includeNote,
  setIncludeNote,
  customNoteText,
  setCustomNoteText,
  handleSaveInvoice,
  handleCancelEdit
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-emerald-50 text-[#059669] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
          {editingInvoiceId ? 'تعديل الفاتورة' : 'إنشاء فاتورة مبيعات مالية دقيقة'}
        </h2>
        <div className="flex items-center gap-2">
          {invoiceNumber && (
            <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200">
              📋 رقم الفاتورة: {invoiceNumber}
            </span>
          )}
          {editingInvoiceId && (
            <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
              تعديل
            </span>
          )}
        </div>
      </div>

      {/* 1. بيانات العميل الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">اسم العميل</label>
          <input
            type="text"
            placeholder="اسم العميل الكامل..."
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">رقم الجوال</label>
          <input
            type="text"
            placeholder="77..."
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* 2. شريط إضافة الأصناف */}
      <form onSubmit={handleAddItem} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">
              {editingItemIndex !== null ? 'تعديل الصنف المختار' : 'اختر الصنف المتوفر'}
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={e => handleProductChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-medium w-full"
            >
              <option value="">-- اختر صنفاً --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">سعر البيع المعتمد ($)</label>
            <input
              type="number"
              step="any"
              placeholder="السعر $"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-bold text-[#059669]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">الكمية المباعة</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-medium w-full"
              />
              <button
                type="submit"
                className="bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-4 py-3 font-bold text-sm shadow-sm transition-all whitespace-nowrap"
              >
                {editingItemIndex !== null ? 'تحديث' : 'إدراج +'}
              </button>
            </div>
          </div>
        </div>
        {editingItemIndex !== null && (
          <div className="mt-2 text-xs text-amber-600 font-bold">
            ⚠️ جارٍ تعديل الصنف رقم {editingItemIndex + 1} - اضغط "تحديث" لحفظ التغييرات
          </div>
        )}
      </form>

      {/* زر إضافة صنف آخر */}
      <button
        type="button"
        onClick={handleAddNewRow}
        className="w-full py-3 mb-6 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50 font-black text-xs transition-all flex items-center justify-center gap-1.5"
      >
        ➕ إضافة صنف آخر للفاتورة
      </button>

      {/* 3. جدول بنود المحتوى المالي */}
      <InvoiceItemsTable
        currentItems={currentItems}
        handleRemoveItem={handleRemoveItem}
        editingItemIndex={editingItemIndex}
      />

      {/* 4. الحسابات المالية */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
          <div>
            <span className="text-xs font-bold text-slate-500 block">الإجمالي الكلي للفاتورة</span>
            <span className="text-xl font-black text-slate-800">${calculateTotal()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">المبلغ المدفوع حالياً ($)</label>
            <input
              type="number"
              min="0"
              max={calculateTotal()}
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold text-emerald-600 focus:outline-none focus:border-[#059669] w-full max-w-[180px]"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">المبلغ المتبقي (الآجل)</span>
            <span className="text-xl font-black text-red-600">${calculateRemaining()}</span>
          </div>
        </div>
        </div>

      {/* 5. الختم والملاحظات */}
      <InvoiceOptions
        includeStamp={includeStamp}
        setIncludeStamp={setIncludeStamp}
        includeNote={includeNote}
        setIncludeNote={setIncludeNote}
        customNoteText={customNoteText}
        setCustomNoteText={setCustomNoteText}
      />
      <div className="flex justify-end pt-2 border-t border-slate-200/60">
          <button
            onClick={handleSaveInvoice}
            className="w-full sm:w-auto bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm shadow-md transition-all shadow-emerald-600/10"
          >
            {editingInvoiceId ? 'تحديث الفاتورة ←' : 'ترحيل واعتماد الفاتورة في الحسابات ←'}
          </button>
        </div>
      

    </div>
  );
}