import React, { useState } from 'react';

export default function ProductsManager({ products = [], onSave, onDelete }) {
  // الحالة الافتراضية للنموذج
  const initialFormState = { id: null, name: '', price: '', unit: 'حبة' };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // معالجة إرسال النموذج (إضافة أو تعديل)
    const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      return alert("الرجاء ملء كافة الحقول الأساسية أولاً!");
    }

    // تجهيز البيانات النظيفة
    const formattedData = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit || 'حبة'
    };

    // إذا كنا في وضع التعديل، نقوم بإرفاق المعرف الحالي فقط
    if (isEditing && form.id) {
      formattedData.id = form.id;
    }

    onSave(formattedData, isEditing);
    handleCancel(); // تفريغ الحقول وإعادة التعيين
  };


  // تفعيل وضع التعديل وتعبئة الحقول ببيانات الصنف المختار
  const handleEditClick = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || 'حبة'
    });
    setIsEditing(true);
  };

  // تأكيد الحذف قبل إرسال الطلب للسيرفر
  const handleDeleteClick = (id, name) => {
    if (confirm(`هل أنت متأكد من حذف الصنف: "${name}" نهائياً من ملف JSON؟`)) {
      onDelete(id);
      // إذا قمنا بحذف الصنف الذي يجري تعديله حالياً، يتم تصفية الحقول
      if (form.id === id) handleCancel();
    }
  };

  // إلغاء عملية التعديل أو تفريغ النموذج
  const handleCancel = () => {
    setForm(initialFormState);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      
      {/* 1. فورمة الإدخال الذكية */}
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

      {/* 2. جدول عرض البيانات المتكامل */}
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
                        onClick={() => handleEditClick(p)}
                        className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all text-xs font-bold"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>تعديل</span>
                      </button>

                      {/* زر الحذف الفوري */}
                      <button 
                        onClick={() => handleDeleteClick(p.id, p.name)}
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

    </div>
  );
}
