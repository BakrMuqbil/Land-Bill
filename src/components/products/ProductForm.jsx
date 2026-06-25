import React from 'react';

export default function ProductForm({
  form,
  setForm,
  isEditing,
  handleSubmit,
  handleCancel
}) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className={`p-2 rounded-xl ${isEditing ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-[#059669]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'تعديل بيانات الصنف الحالي' : 'إضافة صنف جديد '}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">سيتم تحديث الملف وحفظ التغييرات تلقائياً وبشكل دائم</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* اسم ومواصفات الصنف */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 pr-1">مواصفات الصنف</label>
            <input
              type="text"
              placeholder="مثال: جهاز جروات 5 كيلو"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="bg-slate-50/60 border border-slate-200 rounded-2xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {/* سعر الوحدة */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 pr-1">سعر الوحدة ( دولار $ )</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              className="bg-slate-50/60 border border-slate-200 rounded-2xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {/* وحدة القياس */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 pr-1">الوحدة</label>
            <select
              value={form.unit}
              onChange={e => setForm({...form, unit: e.target.value})}
              className="bg-slate-50/60 border border-slate-200 rounded-2xl p-3.5 text-slate-800 focus:outline-none focus:border-[#059669] focus:bg-white transition-all text-sm font-medium"
            >
              <option value="حبة">حبة</option>
              <option value="منظومة">منظومة</option>
              <option value="لوح">لوح</option>
              <option value="متر">متر</option>
            </select>
          </div>
        </div>

        {/* أزرار التحكم والعمليات للنموذج */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className={`flex-1 text-white rounded-2xl p-3.5 font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10' : 'bg-[#059669] hover:bg-emerald-700 shadow-emerald-600/10'}`}
          >
            <span>{isEditing ? 'تحديث وحفظ التعديلات ←' : 'حفظ البيانات'}</span>
          </button>

          {/* زر الإلغاء يظهر فقط أثناء التعديل أو إذا كانت الحقول ممتلئة */}
          {(isEditing || form.name || form.price) && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl px-6 font-bold transition-all text-sm border border-slate-200/40"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
