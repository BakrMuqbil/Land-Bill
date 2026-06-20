import React, { useEffect, useState } from 'react';
import { printLandSolarDocument } from './pdfGenerator.js';

export default function InvoicesManager({ products = [], apiUrl }) {
  // ============================================
  // 1. الحالات (States)
  // ============================================
  const [invoices, setInvoices] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  // حالات الختم والملاحظات
  const [includeStamp, setIncludeStamp] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [customNoteText, setCustomNoteText] = useState('');

  // ============================================
  // 2. جلب البيانات
  // ============================================
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

  // ============================================
  // 3. دوال التعديل على الفاتورة
  // ============================================
  const handleEditInvoice = (invoice) => {
    setEditingInvoiceId(invoice.id);
    setCustomerName(invoice.customerName || invoice.customer_name || '');
    setCustomerPhone(invoice.customerPhone || invoice.customer_phone || '');
    setAmountPaid(invoice.amountPaid || invoice.amount_paid || 0);
    setIncludeStamp(invoice.includeStamp || invoice.include_stamp || false);
    setIncludeNote(!!(invoice.note));
    setCustomNoteText(invoice.note || '');

    if (invoice.items && invoice.items.length > 0) {
      const formattedItems = invoice.items.map((item) => ({
        id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        unit: item.unit || 'حبة',
        quantity: item.quantity,
        total: item.total || (item.quantity * item.price)
      }));
      setCurrentItems(formattedItems);
    } else {
      setCurrentItems([]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid(0);
    setCurrentItems([]);
    setEditingItemIndex(null);
    setSelectedProductId('');
    setCustomPrice('');
    setQuantity(1);
    setIncludeStamp(false);
    setIncludeNote(false);
    setCustomNoteText('');
  };

  // ============================================
  // 4. دوال إدارة الأصناف
  // ============================================
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

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert("الرجاء اختيار صنف أولاً!");
    if (!customPrice || Number(customPrice) < 0) return alert("الرجاء إدخال سعر صحيح!");
    if (quantity <= 0) return alert("الرجاء إدخال كمية صالحة!");

    const prod = products.find(p => p.id === parseInt(selectedProductId));
    if (!prod) return;

    const finalPrice = Number(customPrice);
    const finalQuantity = Number(quantity);

    if (editingItemIndex !== null) {
      const updatedItems = [...currentItems];
      updatedItems[editingItemIndex] = {
        ...updatedItems[editingItemIndex],
        id: prod.id,
        name: prod.name,
        price: finalPrice,
        unit: prod.unit,
        quantity: finalQuantity,
        total: finalPrice * finalQuantity
      };
      setCurrentItems(updatedItems);
      setEditingItemIndex(null);
    } else {
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
    }

    setSelectedProductId('');
    setCustomPrice('');
    setQuantity(1);
  };

  const handleEditItem = (index) => {
    const item = currentItems[index];
    setEditingItemIndex(index);
    setSelectedProductId(item.id.toString());
    setCustomPrice(item.price.toString());
    setQuantity(item.quantity);
    document.getElementById('product-select')?.focus();
  };

  const handleRemoveItem = (index) => {
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
    }
    setCurrentItems(currentItems.filter((_, i) => i !== index));
  };

  const handleAddNewRow = () => {
    setSelectedProductId('');
    setCustomPrice('');
    setQuantity(1);
    document.getElementById('product-select')?.focus();
  };

  // ============================================
  // 5. دوال الحسابات
  // ============================================
  const calculateTotal = () => {
    return currentItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const remaining = total - Number(amountPaid);
    return remaining < 0 ? 0 : remaining;
  };

  const getInvoiceStatus = (total, paid) => {
    if (Number(paid) === 0) return { label: 'غير مدفوعة', color: 'text-red-600 bg-red-50' };
    if (Number(paid) >= total) return { label: 'مدفوعة بالكامل', color: 'text-emerald-600 bg-emerald-50' };
    return { label: 'مدفوعة جزئياً (آجل)', color: 'text-amber-600 bg-amber-50' };
  };

  // ============================================
  // 6. دوال الحفظ والحذف
  // ============================================
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    
    const customerNameValue = customerName.trim();
    if (!customerNameValue) {
      alert("الرجاء إدخال اسم العميل!");
      return;
    }
    
    if (currentItems.length === 0) {
      alert("لا يمكن حفظ فاتورة فارغة! أضف أصنافاً أولاً.");
      return;
    }
    
    const total = calculateTotal();
    const paid = Number(amountPaid);

    if (paid > total) {
      alert("المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الفاتورة الكلي!");
      return;
    }

    const invoiceData = {
      customerName: customerNameValue,
      customerPhone: customerPhone.trim() || "غير مسجل",
      grandTotal: total,
      amountPaid: paid,
      amountRemaining: total - paid,
      status: getInvoiceStatus(total, paid).label,
      includeStamp: includeStamp,
      note: includeNote ? customNoteText : '',
      items: currentItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        total: item.total
      })),
      createdAt: new Date().toISOString()
    };

    // بيانات الطباعة
    const printPayload = {
      customerName: customerNameValue,
      customerPhone: customerPhone.trim() || "غير مسجل",
      grandTotal: total,
      amountPaid: paid,
      amountRemaining: total - paid,
      includeStamp: includeStamp,
      note: includeNote ? customNoteText : '',
      items: currentItems.map(item => ({
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        total: item.total
      })),
      status: getInvoiceStatus(total, paid).label,
      createdAt: new Date().toISOString()
    };

    try {
      let response;
      const url = editingInvoiceId 
        ? `${apiUrl}/invoices/${editingInvoiceId}`
        : `${apiUrl}/invoices`;
      
      const method = editingInvoiceId ? 'PUT' : 'POST';

      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      if (response.ok) {
        printLandSolarDocument(printPayload, 'invoice');
        alert(editingInvoiceId ? "تم تحديث الفاتورة بنجاح!" : "تم حفظ واعتماد الفاتورة المالية بنجاح!");
        handleCancelEdit();
        fetchInvoices();
      } else {
        const error = await response.json();
        alert(`فشل الحفظ: ${error.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error("خطأ في حفظ الفاتورة:", error);
      alert("حدث خطأ في الاتصال بالسيرفر");
    }
  };

  const handleDeleteInvoice = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف الفاتورة المالية للعميل: "${name}" نهائياً؟`)) {
      try {
        const response = await fetch(`${apiUrl}/invoices/${id}`, { method: 'DELETE' });
        if (response.ok) {
          if (editingInvoiceId === id) {
            handleCancelEdit();
          }
          fetchInvoices();
        } else {
          alert("فشل حذف الفاتورة");
        }
      } catch (error) {
        console.error("خطأ في حذف الفاتورة:", error);
      }
    }
  };
    // ============================================
  // 7. الـ Return (واجهة المستخدم)
  // ============================================
  return (
    <div className="space-y-8" dir="rtl">
      
      {/* ===== قسم إنشاء الفاتورة ===== */}
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
          {editingInvoiceId && (
            <div className="flex items-center gap-2">
              <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
                تعديل الفاتورة #{editingInvoiceId}
              </span>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* 1. بيانات العميل */}
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

        {/* 2. إضافة الأصناف */}
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
        
        {/* 3. جدول الأصناف */}
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
                  <th className="p-3.5 w-32 text-center">العمليات</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-slate-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-slate-400 text-xs">الفاتورة لا تحتوي على أي بنود مبيعات حتى الآن.</td>
                  </tr>
                ) : (
                  currentItems.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/40 ${editingItemIndex === idx ? 'bg-amber-50/50 border-r-4 border-amber-400' : ''}`}>
                      <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3.5 text-slate-500">{item.unit}</td>
                      <td className="p-3.5 text-slate-800 font-bold">{item.quantity}</td>
                      <td className="p-3.5 text-slate-600">${item.price}</td>
                      <td className="p-3.5 text-[#059669] font-extrabold">${item.total}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => handleEditItem(idx)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-all" title="تعديل">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-all" title="حذف">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                            </svg>
                          </button>
                        </div>
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
              <div className="p-6 text-center text-slate-400 text-xs font-medium">لا توجد بنود مبيعات حتى الآن</div>
            ) : (
              currentItems.map((item, idx) => (
                <div key={idx} className={`p-4 hover:bg-slate-50/70 transition-all space-y-2.5 border-b border-slate-100 last:border-b-0 ${editingItemIndex === idx ? 'bg-amber-50/50 border-r-4 border-amber-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">#{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => handleEditItem(idx)} className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">✏️ تعديل</button>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">🗑️ حذف</button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">المواصفات</span>
                    <span className="text-sm font-bold text-slate-800 block">{item.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><span className="text-xs font-bold text-slate-500 block">الوحدة</span><span className="text-sm font-bold text-slate-700">{item.unit}</span></div>
                    <div><span className="text-xs font-bold text-slate-500 block">الكمية</span><span className="text-sm font-bold text-slate-800">{item.quantity}</span></div>
                    <div><span className="text-xs font-bold text-slate-500 block">السعر</span><span className="text-sm font-bold text-slate-600">${item.price}</span></div>
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

        {/* 4. الحسابات المالية */}
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
        
        <div><span className="text-xs font-bold text-slate-500 block">الإجمالي الكلي للفاتورة</span>
          
              <span className="text-xl font-black text-slate-800">${calculateTotal()}</span> </div>
        
        <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">المبلغ المدفوع حالياً ($)</label>
              <input 
                type="number" min="0" max={calculateTotal()} value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold text-emerald-600 focus:outline-none focus:border-[#059669] w-full max-w-[180px]"
              />
                    </div>
      
        <div><span className="text-xs font-bold text-slate-500 block">المبلغ المتبقي (الآجل)</span>
              <span className="text-xl font-black text-red-600">${calculateRemaining()}</span>
        </div>
        
     </div>
   </div>

        {/* 5. الختم والملاحظات */}
        <div className="mt-6 bg-slate-50/70 rounded-xl p-4 border border-slate-200/60">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
              <input 
                type="checkbox"
                checked={includeStamp}
                onChange={(e) => setIncludeStamp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span>🖨️ إدراج الختم الرسمي للشركة</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
              <input 
                type="checkbox"
                checked={includeNote}
                onChange={(e) => setIncludeNote(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span>📝 إضافة ملاحظة مخصصة أسفل الجدول</span>
            </label>
          </div>

          {includeNote && (
            <div className="pt-3">
              <textarea
                rows="2"
                value={customNoteText}
                onChange={(e) => setCustomNoteText(e.target.value)}
                placeholder="اكتب هنا الملاحظات الإضافية..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>
          )}

          {includeStamp && (
            <div className="pt-3 flex justify-start">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <img 
                  src="/Companyseal.png" 
                  alt="ختم الشركة" 
                  className="h-20 w-auto object-contain"
                />
              </div>
            </div>
          )}
                  </div>
        <div className="flex justify-end pt-2 border-t border-slate-200/60">
            <button 
              onClick={handleSaveInvoice}
              className="w-full sm:w-auto bg-[#059669] hover:bg-emerald-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm shadow-md transition-all shadow-emerald-600/10"
            >
              {editingInvoiceId ? 'تحديث الفاتورة ←' : 'ترحيل واعتماد الفاتورة في الحسابات ←'}
            </button>
          </div>

      </div>

      {/* ===== أرشيف الفواتير ===== */}
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
                    <tr key={inv.id} className={`hover:bg-slate-50/40 ${editingInvoiceId === inv.id ? 'bg-amber-50/50 border-r-4 border-amber-400' : ''}`}>
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleEditInvoice(inv)}
                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            تعديل
                          </button>
                          <button 
                            onClick={() => printLandSolarDocument(inv, 'invoice')}
                            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            🖨️ طباعة
                          </button>
                               <button 
                            onClick={() => handleDeleteInvoice(inv.id, inv.customerName)}
                            className="text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
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
             