import React, { useEffect, useState } from 'react';
import { printLandSolarDocument } from './pdfGenerator.js';

export default function QuotesManager({ products = [], apiUrl }) {
  // الحالات الخاصة بإدارة عروض الأسعار والأرشيف
  const [quotes, setQuotes] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // المصفوفة الديناميكية لأسطر الجدول
  const [currentItems, setCurrentItems] = useState([
    { rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }
  ]);

  // الحالات الخاصة بخانات الاختيار والملاحظات أسفل الجدول
  const [includeWarranty, setIncludeWarranty] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [customNoteText, setCustomNoteText] = useState('');

  // حالة وضع التعديل
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  // جلب عروض الأسعار من السيرفر
  const fetchQuotes = async () => {
    try {
      const response = await fetch(`${apiUrl}/quotes`);
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error("خطأ في جلب عروض الأسعار:", error);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // مراقبة وتحديث بيانات الصنف عند تغيير خيار المنتج في سطر معين
  const handleRowProductChange = (rowId, productId) => {
    const updatedItems = currentItems.map(item => {
      if (item.rowId === rowId) {
        if (!productId) {
          return { ...item, productId: '', customPrice: '' };
        }
        const prod = products.find(p => (p.id || p._id)?.toString() === productId.toString());
        return { 
          ...item, 
          productId: productId, 
          customPrice: prod ? prod.price : '' 
        };
      }
      return item;
    });
    setCurrentItems(updatedItems);
  };

  // تحديث السعر المخصص لسطر معين
  const handleRowPriceChange = (rowId, priceValue) => {
    const updatedItems = currentItems.map(item => {
      if (item.rowId === rowId) {
        return { ...item, customPrice: priceValue };
      }
      return item;
    });
    setCurrentItems(updatedItems);
  };

  // تحديث الكمية لسطر معين
  const handleRowQuantityChange = (rowId, qtyValue) => {
    const updatedItems = currentItems.map(item => {
      if (item.rowId === rowId) {
        return { ...item, quantity: parseInt(qtyValue) || 0 };
      }
      return item;
    });
    setCurrentItems(updatedItems);
  };

  // إضافة سطر صنف جديد فارغ
  const handleAddNewRow = () => {
    setCurrentItems([
      ...currentItems,
      { rowId: Date.now() + Math.random(), productId: '', customPrice: '', quantity: 1 }
    ]);
  };

  // حذف سطر صنف معين
  const handleRemoveRow = (rowId) => {
    if (currentItems.length === 1) {
      setCurrentItems([{ rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }]);
      return;
    }
    setCurrentItems(currentItems.filter(item => item.rowId !== rowId));
  };

  // حساب الإجمالي الكلي الحالي للواجهة
  const calculateGrandTotal = () => {
    return currentItems.reduce((acc, item) => {
      const price = parseFloat(item.customPrice) || 0;
      const qty = parseInt(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);
  };

  // معالجة الضغط على زر "تعديل" من الأرشيف
  const handleEditQuoteClick = (quote) => {
    const targetId = quote.id || quote._id;
    setEditingQuoteId(targetId);
    setCustomerName(quote.customerName);
    setCustomerPhone(quote.customerPhone);
    
    setIncludeWarranty(quote.hasWarranty || false);
    setIncludeNote(!!quote.note);
    setCustomNoteText(quote.note || '');

    if (quote.items && quote.items.length > 0) {
      const formattedItems = quote.items.map((item, index) => {
        const foundProd = products.find(p => p.name === item.name);
        const prodId = foundProd ? (foundProd.id || foundProd._id) : '';
        return {
          rowId: Date.now() + index,
          productId: prodId ? prodId.toString() : '',
          customPrice: item.price,
          quantity: item.quantity
        };
      });
      setCurrentItems(formattedItems);
    } else {
      setCurrentItems([{ rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }]);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // إلغاء وضع التعديل وتصفير الحقول
  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setCustomerName('');
    setCustomerPhone('');
    setIncludeWarranty(false);
    setIncludeNote(false);
    setCustomNoteText('');
    setCurrentItems([{ rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }]);
  };

  // دالة الإرسال والحفظ
  const handleSubmitQuote = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert("الرجاء إدخال اسم العميل");
      return;
    }

    // بناء مصفوفة العناصر لتطابق مسميات جدول الـ PDF تماماً
    const finalItems = currentItems
      .map(item => {
        if (!item.productId) return null;
        const prod = products.find(p => (p.id || p._id)?.toString() === item.productId.toString());
        if (!prod) return null;
        
        const price = item.customPrice !== "" ? parseFloat(item.customPrice) : prod.price;
        const qty = parseInt(item.quantity) || 1;
        
        return {
          name: prod.name,
          price: price,
          unit: prod.unit || "حبة",
          quantity: qty,
          total: price * qty
        };
      })
      .filter(item => item !== null);

    if (finalItems.length === 0) {
      alert("الرجاء إضافة صنف واحد صالح على الأقل للعرض");
      return;
    }

    const grandTotal = finalItems.reduce((sum, item) => sum + item.total, 0);

    // بناء كائن البيانات الكامل الموجه والمتوافق كلياً مع دالة البناء للـ PDF
    const quotePayload = {
      id: editingQuoteId || Date.now(),
      customerName,
      customerPhone,
      items: finalItems,
      grandTotal: grandTotal,
      hasWarranty: includeWarranty,
      note: includeNote ? customNoteText : '',
      createdAt: new Date().toISOString()
    };

    try {
      let response;
      if (editingQuoteId) {
        response = await fetch(`${apiUrl}/quotes/${editingQuoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotePayload)
        });
      } else {
        response = await fetch(`${apiUrl}/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotePayload)
        });
      }

      if (response.ok) {
        // الحل الجذري: نمرر الكائن الكامل المبني محلياً لضمان عدم تأثر الطباعة بنوع استجابة السيرفر
        printLandSolarDocument(quotePayload, 'offer');
        
        handleCancelEdit();
        fetchQuotes();
      } else {
        alert(`فشلت عملية الحفظ. كود الخطأ من الخادم: ${response.status}`);
      }
    } catch (error) {
      console.error("خطأ أثناء حفظ عرض السعر:", error);
    }
  };

  // دالة الحذف
  const handleDeleteQuote = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف عرض السعر الخاص بالعميل (${name})؟`)) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/quotes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchQuotes();
        if (editingQuoteId === id) {
          handleCancelEdit();
        }
      } else {
        alert("فشل حذف العرض من الخادم");
      }
    } catch (error) {
      console.error("خطأ أثناء حذف عرض السعر:", error);
    }
  };
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" dir="rtl">
      
      {/* القسم الأول: إنشاء وتعديل عروض الأسعار */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-7 mb-8 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-black text-slate-800">
              {editingQuoteId ? 'تعديل عرض سعر مؤرشف' : 'إنشاء عرض سعر جديد'}
            </h2>
          </div>
          {editingQuoteId && (
            <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-bold animate-pulse">
              وضع التعديل نشط (رقم العرض: #{editingQuoteId})
            </span>
          )}
        </div>

        <form onSubmit={handleSubmitQuote} className="space-y-6">
          {/* حقول بيانات العميل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">اسم العميل / الجهة المستهدفة</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: شركة لاند سولار للطاقة"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">رقم الجوال أو الهاتف للتواصل</label>
              <input 
                type="text" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="مثال: 774276866"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-medium text-left transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {/* جدول أسطر المنتجات */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📦</span>
              <h3 className="text-sm font-black text-slate-700">أصناف ومواد منظومة العرض</h3>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
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

            <button
              type="button"
              onClick={handleAddNewRow}
              className="mt-4 w-full py-3 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50 font-black text-xs transition-all flex items-center justify-center gap-1.5"
            >
              ➕ إضافة صنف آخر للعرض
            </button>
          </div>

          {/* خانات الاختيار (Checkboxes) والملاحظات */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
                <input 
                  type="checkbox"
                  checked={includeWarranty}
                  onChange={(e) => setIncludeWarranty(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span>إدراج بند الضمانة المعتمد</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
                <input 
                  type="checkbox"
                  checked={includeNote}
                  onChange={(e) => setIncludeNote(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span>إضافة ملاحظة مخصصة أسفل الجدول</span>
              </label>
            </div>

            {includeNote && (
              <div className="pt-2">
                <textarea
                  rows="2"
                  value={customNoteText}
                  onChange={(e) => setCustomNoteText(e.target.value)}
                  placeholder="اكتب هنا الملاحظات الإضافية التي ترغب في أن تظهر بخط واضح أسفل جدول الـ PDF المستخرج..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                />
              </div>
            )}
          </div>

          {/* لوحة التحكم وعرض الإجماليات */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-5 gap-4">
            <div className="text-slate-800 font-medium">
              <span className="text-slate-500 text-sm">الملخص المالي للعرض: </span>
              <span className="text-2xl font-black text-[#059669] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100/60 inline-block mr-1">
                ${calculateGrandTotal().toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {editingQuoteId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                >
                  ❌ إلغاء التعديل
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                💾 {editingQuoteId ? 'حفظ التغييرات وتحديث الـ PDF' : 'حفظ العرض وتوليد الـ PDF'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* أرشيف وعروض الأسعار السابقة */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-7 transition-all">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <span className="text-2xl">🗄️</span>
          <h2 className="text-xl font-black text-slate-800">أرشيف وعروض الأسعار السابقة</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3.5">اسم العميل / الجهة</th>
                <th className="p-3.5">رقم الهاتف</th>
                <th className="p-3.5">تفاصيل الإضافات</th>
                <th className="p-3.5">إجمالي العرض</th>
                <th className="p-3.5">تاريخ الإصدار</th>
                <th className="p-3.5 text-center">الإجراءات والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    لا توجد عروض أسعار مؤرشفة حالياً في النظام.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => {
                  const currentQuoteId = q.id || q._id;
                  return (
                    <tr key={currentQuoteId} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-3.5 font-bold text-slate-800">{q.customerName}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{q.customerPhone || '—'}</td>
                      <td className="p-3.5 text-xs font-semibold">
                        <div className="flex gap-1.5 flex-wrap">
                          {q.hasWarranty && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">🛡️ ضمان</span>}
                          {q.note && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100" title={q.note}>📝 ملاحظة</span>}
                          {!q.hasWarranty && !q.note && <span className="text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="p-3.5 text-[#059669] font-black">${Number(q.grandTotal).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-400 text-xs font-medium">
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString('ar-YE') : '—'}
                      </td>
                      <td className="p-3.5 text-center flex justify-center gap-2 items-center">
                        <button 
                          type="button"
                          onClick={() => printLandSolarDocument(q, 'offer')}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          🖨️ طباعة
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleEditQuoteClick(q)}
                          className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          ✏️ تعديل
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteQuote(currentQuoteId, q.customerName)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          حذف
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
