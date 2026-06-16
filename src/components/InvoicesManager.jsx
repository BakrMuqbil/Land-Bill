import React, { useEffect, useState } from 'react';

export default function InvoicesManager({ products = [], apiUrl }) {
  // الحالات الخاصة بإدارة الفواتير والأرشيف
  const [invoices, setInvoices] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState(0); // المبلغ المدفوع مقدماً

  // الحالات الخاصة بإضافة صنف للفاتورة الحالية
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentItems, setCurrentItems] = useState([]); // الأصناف المضافة مؤقتاً

  // جلب الفواتير المخزنة من السيرفر عند تحميل المكون
  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${apiUrl}/invoices`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // مراقبة اختيار الصنف لتعبئة السعر الافتراضي
  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    if (!productId) {
      setCustomPrice('');
      return;
    }
    const prod = products.find(p => p.id === parseInt(productId));
    if (prod) {
      setCustomPrice(prod.price);
    }
  };

  // إضافة صنف إلى القائمة المؤقتة للفاتورة
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert("الرجاء اختيار صنف أولاً!");
    if (!customPrice || Number(customPrice) < 0) return alert("الرجاء إدخال سعر صحيح!");
    if (quantity <= 0) return alert("الرجاء إدخال كمية صالحة!");

    const prod = products.find(p => p.id === parseInt(selectedProductId));
    if (!prod) return;

    const finalPrice = Number(customPrice);
    const finalQuantity = Number(quantity);

    const existingItemIndex = currentItems.findIndex(
      item => item.id === prod.id && item.price === finalPrice
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += finalQuantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * finalPrice;
      setCurrentItems(updatedItems);
    } else {
      setCurrentItems([
        ...currentItems,
        {
          id: prod.id,
          name: prod.name,
          price: finalPrice,
          unit: prod.unit,
          quantity: finalQuantity,
          total: finalQuantity * finalPrice
        }
      ]);
    }

    setSelectedProductId('');
    setCustomPrice('');
    setQuantity(1);
  };

  // حذف صنف من القائمة المؤقتة
  const handleRemoveItem = (index) => {
    setCurrentItems(currentItems.filter((_, i) => i !== index));
  };

  // حساب الإجمالي الكلي للفاتورة الحالية
  const calculateTotal = () => {
    return currentItems.reduce((sum, item) => sum + item.total, 0);
  };

  // حساب المبلغ المتبقي (الآجل)
  const calculateRemaining = () => {
    const total = calculateTotal();
    const remaining = total - Number(amountPaid);
    return remaining < 0 ? 0 : remaining;
  };

  // تحديد حالة الفاتورة ديناميكياً بناءً على الدفع
  const getInvoiceStatus = (total, paid) => {
    if (Number(paid) === 0) return { label: 'غير مدفوعة', color: 'text-red-600 bg-red-50' };
    if (Number(paid) >= total) return { label: 'مدفوعة بالكامل', color: 'text-emerald-600 bg-emerald-50' };
    return { label: 'مدفوعة جزئياً (آجل)', color: 'text-amber-600 bg-amber-50' };
  };

  // حفظ الفاتورة النهائية وإرسالها إلى ملف الـ JSON
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return alert("الرجاء إدخال اسم العميل!");
    if (currentItems.length === 0) return alert("لا يمكن حفظ فاتورة فارغة! أضف أصنافاً أولاً.");
    
    const total = calculateTotal();
    const paid = Number(amountPaid);

    if (paid > total) {
      return alert("المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الفاتورة الكلي!");
    }

    const newInvoice = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || "غير مسجل",
      items: currentItems,
      grandTotal: total,
      amountPaid: paid,
      amountRemaining: total - paid,
      status: getInvoiceStatus(total, paid).label,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${apiUrl}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      
      if (response.ok) {
        alert("تم حفظ واعتماد الفاتورة المالية بنجاح!");
        setCustomerName('');
        setCustomerPhone('');
        setAmountPaid(0);
        setCurrentItems([]);
        fetchInvoices();
      }
    } catch (error) {
      console.error("خطأ في حفظ الفاتورة:", error);
    }
  };

  // حذف فاتورة من الأرشيف
  const handleDeleteInvoice = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف الفاتورة المالية للعميل: "${name}" نهائياً؟`)) {
      try {
        await fetch(`${apiUrl}/invoices/${id}`, { method: 'DELETE' });
        fetchInvoices();
      } catch (error) {
        console.error("خطأ في حذف الفاتورة:", error);
      }
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* قسم إنشاء الفاتورة */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
          <span className="p-2 bg-emerald-50 text-[#059669] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
          إنشاء فاتورة مبيعات مالية دقيقة
        </h2>

        {/* 1. بيانات العميل الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">اسم العميل</label>
            <input 
              type="text" placeholder="اسم العميل الكامل..." value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">رقم الجوال</label>
            <input 
              type="text" placeholder="77..." value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* 2. شريط إضافة الأصناف السريع القابل لتعديل السعر */}
        <form onSubmit={handleAddItem} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">اختر الصنف المتوفر</label>
            <select 
              value={selectedProductId} 
              onChange={e => handleProductChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-medium w-full"
            >
              <option value="">-- اختر صنفاً لإدراجه بالفاتورة --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">سعر البيع المعتمد ($)</label>
            <input 
              type="number" step="any" placeholder="السعر $" value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-bold text-[#059669]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">الكمية المباعة</label>
            <div className="flex gap-2">
              <input 
                type="number" min="1" value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#059669] font-medium w-full"
              />
              <button type="submit" className="bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-4 py-3 font-bold text-sm shadow-sm transition-all whitespace-nowrap">
                إدراج +
              </button>
            </div>
          </div>
        </form>

        {/* 3. جدول بنود المحتوى المالي */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6">
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

        {/* 4. الحسابات المالية (الإجمالي، المدفوع، المتبقي) والاعتماد */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div>
              <span className="text-xs font-bold text-slate-500 block">الإجمالي الكلي للفاتورة</span>
              <span className="text-xl font-black text-slate-800">${calculateTotal()}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">المبلغ المدفوع حالياً ($)</label>
              <input 
                type="number" min="0" max={calculateTotal()} value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold text-emerald-600 focus:outline-none focus:border-[#059669] w-full max-w-[180px]"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 block">المبلغ المتبقي (الآجل)</span>
              <span className="text-xl font-black text-red-600">${calculateRemaining()}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200/60">
            <button 
              onClick={handleSaveInvoice}
              className="w-full sm:w-auto bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm shadow-md transition-all shadow-emerald-600/10"
            >
              ترحيل واعتماد الفاتورة في الحسابات JSON ←
            </button>
          </div>
        </div>
      </div>

      {/* سجل أرشيف الفواتير المعتمدة */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          دفتر أرشيف الفواتير الصادرة ({invoices.length})
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-slate-400 text-xs">لا توجد فواتير مبيعات مسجلة في هذا الدفتر حالياً.</td>
                </tr>
              ) : (
                invoices.map(inv => {
                  const statusInfo = getInvoiceStatus(inv.grandTotal, inv.amountPaid);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/40">
                      <td className="p-3.5 font-bold text-slate-800">{inv.customerName}</td>
                      <td className="p-3.5 text-slate-800 font-extrabold">${inv.grandTotal}</td>
                      <td className="p-3.5 text-emerald-600 font-bold">${inv.amountPaid}</td>
                      <td className="p-3.5 text-red-600 font-bold">${inv.amountRemaining}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {inv.status || statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-YE') : '—'}
                      </td>
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => handleDeleteInvoice(inv.id, inv.customerName)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          إلغاء الفاتورة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
