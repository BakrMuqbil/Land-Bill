import React, { useEffect, useState } from 'react';
import QuoteForm from './QuoteForm';
import QuoteArchive from './QuoteArchive';
import { printLandSolarDocument } from "../pdf/PDFGenerator.js";
import { QuoteService } from '../../services/quoteService';

export default function QuotesManager({ products = [], apiUrl }) {
  // ============================================
  // 1. الحالات الأساسية (States)
  // ============================================
  const [quotes, setQuotes] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [currentQuoteNumber, setCurrentQuoteNumber] = useState(null);

  // حالة أسطر الجدول
  const [currentItems, setCurrentItems] = useState([
    { rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }
  ]);

  // حالات الخيارات
  const [includeWarranty, setIncludeWarranty] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [customNoteText, setCustomNoteText] = useState('');
const [loading, setLoading] = useState(false);
  // 🔌 خدمة عروض الأسعار (تستخدم apiClient الذي يرفق توكن المصادقة تلقائيًا)
  const [quoteService] = useState(() => new QuoteService(apiUrl));

  // ============================================
  // 2. جلب البيانات من السيرفر
  // ============================================
  const fetchQuotes = async () => {
    try {
      const data = await quoteService.getAll();
      setQuotes(Array.isArray(data) ? data : (data.quotes || data.data || []));
    } catch (error) {
      console.error("خطأ في جلب عروض الأسعار:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // ============================================
  // 3. دوال إدارة أسطر الجدول
  // ============================================
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

  const handleRowPriceChange = (rowId, priceValue) => {
    const updatedItems = currentItems.map(item => {
      if (item.rowId === rowId) {
        return { ...item, customPrice: priceValue };
      }
      return item;
    });
    setCurrentItems(updatedItems);
  };

  const handleRowQuantityChange = (rowId, qtyValue) => {
    const updatedItems = currentItems.map(item => {
      if (item.rowId === rowId) {
        return { ...item, quantity: parseInt(qtyValue) || 0 };
      }
      return item;
    });
    setCurrentItems(updatedItems);
  };

  const handleAddNewRow = () => {
    setCurrentItems([
      ...currentItems,
      { rowId: Date.now() + Math.random(), productId: '', customPrice: '', quantity: 1 }
    ]);
  };

  const handleRemoveRow = (rowId) => {
    if (currentItems.length === 1) {
      setCurrentItems([{ rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }]);
      return;
    }
    setCurrentItems(currentItems.filter(item => item.rowId !== rowId));
  };

  // ============================================
  // 4. دوال الحسابات
  // ============================================
  const calculateGrandTotal = () => {
    return currentItems.reduce((acc, item) => {
      const price = parseFloat(item.customPrice) || 0;
      const qty = parseInt(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);
  };

  // ============================================
  // 5. دوال التعديل على العرض
  // ============================================
  const handleEditQuoteClick = (quote) => {
  console.log('🔄 [QuoteManager] بدء تعديل العرض:', quote);

  // ❌ منع تعديل العرض إذا كان معتمد
  if (quote.status === 'approved') {
    alert('⚠️ لا يمكن تعديل عرض سعر معتمد. قم بإلغاء التعميد أولاً.');
    return;
  }

  const targetId = quote.id || quote._id;
  setEditingQuoteId(targetId);

  setCustomerName(quote.customerName || quote.customerName || '');
  setCustomerPhone(quote.customerPhone || quote.customer_phone || '');
  setCurrentQuoteNumber(quote.quoteNumber || null);

  setIncludeWarranty(quote.hasWarranty || quote.has_warranty || false);
  setIncludeNote(!!(quote.note));
  setCustomNoteText(quote.note || '');

  if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
    const formattedItems = quote.items.map((item, index) => {
      const productId = item.product_id || item.id;
      const foundProd = products.find(p => p.id === productId);

      return {
        rowId: Date.now() + index,
        productId: foundProd ? foundProd.id.toString() : '',
        customPrice: item.price || 0,
        quantity: item.quantity || 1
      };
    });

    setCurrentItems(formattedItems);
  } else {
    setCurrentItems([{
      rowId: Date.now(),
      productId: '',
      customPrice: '',
      quantity: 1
    }]);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  

  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCurrentQuoteNumber(null);
    setIncludeWarranty(false);
    setIncludeNote(false);
    setCustomNoteText('');
    setCurrentItems([{ rowId: Date.now(), productId: '', customPrice: '', quantity: 1 }]);
  };

  // ============================================
  // 6. دوال الحفظ والحذف
  // ============================================
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (!customerName.trim()) {
      alert("الرجاء إدخال اسم العميل");
      return;
    }

    const finalItems = currentItems
      .map(item => {
        if (!item.productId) return null;
        const prod = products.find(p => (p.id || p._id)?.toString() === item.productId.toString());
        if (!prod) return null;

        const price = item.customPrice !== "" ? parseFloat(item.customPrice) : prod.price;
        const qty = parseInt(item.quantity) || 1;

        return {
          id: prod.id,
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

    const quotePayload = {
      id: editingQuoteId || Date.now(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || "غير مسجل",
      grandTotal: grandTotal,
      hasWarranty: includeWarranty,
      note: includeNote ? customNoteText : '',
      items: finalItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        total: item.total
      })),
      createdAt: new Date().toISOString()
    };

    if (currentQuoteNumber) {
      quotePayload.quoteNumber = currentQuoteNumber;
    }

    try {
      const responseData = editingQuoteId
        ? await quoteService.update(editingQuoteId, quotePayload)
        : await quoteService.create(quotePayload);

      console.log("========== RESPONSE ==========");
console.log(responseData);
console.log(JSON.stringify(responseData, null, 2));
console.log("==============================");


      // ✅ تحديث رقم العرض من استجابة السيرفر
      if (responseData.quote && responseData.quote.quoteNumber) {
        const newQuoteNumber = responseData.quote.quoteNumber;
        setCurrentQuoteNumber(newQuoteNumber);
        quotePayload.quoteNumber = newQuoteNumber;
      }

      // ✅ طباعة الـ PDF بعد تحديث رقم العرض
      try {
        printLandSolarDocument(quotePayload, 'offer');
      } catch (printErr) {
        console.error("خطأ في الطباعة:", printErr);
      }

      handleCancelEdit();
      fetchQuotes();

      // ✅ إظهار رسالة نجاح مع رقم العرض
      alert(`✅ تم حفظ عرض السعر بنجاح! رقم العرض: ${quotePayload.quoteNumber || 'غير معروف'}`);
    } catch (error) {
      console.error("خطأ أثناء حفظ عرض السعر:", error);
      alert(`فشلت عملية الحفظ: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleDeleteQuote = async (id, name, status) => {
  // ❌ منع حذف عرض سعر معتمد
  if (status === 'approved') {
    alert('⚠️ لا يمكن حذف عرض سعر معتمد.\nيجب أولاً إلغاء التعميد ثم الحذف.');
    return;
  }

  if (!window.confirm(`هل أنت متأكد من حذف عرض السعر الخاص بالعميل (${name})؟`)) {
    return;
  }

  try {
    await quoteService.delete(id);

    fetchQuotes();

    if (editingQuoteId === id) {
      handleCancelEdit();
    }

  } catch (error) {
    console.error("خطأ أثناء حذف عرض السعر:", error);
    alert(`فشل حذف العرض من الخادم: ${error.message || 'خطأ غير معروف'}`);
  }
    finally{
      setLoading(false)
    }
};

  // ============================================
  // 7. دوال التعميد
  // ============================================
  const handleApproveQuote = async (id) => {
    if (!window.confirm('هل أنت متأكد من تعميد عرض السعر هذا؟')) {
      return;
    }
    try {
      await quoteService.approve(id);
      alert('✅ تم تعميد عرض السعر بنجاح!');
      fetchQuotes();
    } catch (error) {
      console.error("خطأ أثناء تعميد العرض:", error);
      alert(`فشل التعميد: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleUnapproveQuote = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء تعميد عرض السعر هذا؟')) {
      return;
    }
    try {
      await quoteService.unapprove(id);
      alert('✅ تم إلغاء تعميد عرض السعر بنجاح!');
      fetchQuotes();
    } catch (error) {
      console.error("خطأ أثناء إلغاء تعميد العرض:", error);
      alert(`فشل إلغاء التعميد: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  // ============================================
  // 8. الـ Return
  // ============================================
  return (
    <div className="space-y-8" dir="rtl">
      <QuoteForm
        loading={loading}
        editingQuoteId={editingQuoteId}
        quoteNumber={currentQuoteNumber}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        currentItems={currentItems}
        products={products}
        handleRowProductChange={handleRowProductChange}
        handleRowPriceChange={handleRowPriceChange}
        handleRowQuantityChange={handleRowQuantityChange}
        handleRemoveRow={handleRemoveRow}
        handleAddNewRow={handleAddNewRow}
        calculateGrandTotal={calculateGrandTotal}
        includeWarranty={includeWarranty}
        setIncludeWarranty={setIncludeWarranty}
        includeNote={includeNote}
        setIncludeNote={setIncludeNote}
        customNoteText={customNoteText}
        setCustomNoteText={setCustomNoteText}
        handleSubmitQuote={handleSubmitQuote}
        handleCancelEdit={handleCancelEdit}
      />

      <QuoteArchive
        quotes={quotes}
        onEdit={handleEditQuoteClick}
        onDelete={handleDeleteQuote}
        onApprove={handleApproveQuote}
        onUnapprove={handleUnapproveQuote}
      />
    </div>
  );
}
