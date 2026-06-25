import React, { useEffect, useState } from 'react';
import QuoteForm from './QuoteForm';
import QuoteArchive from './QuoteArchive';
import { printLandSolarDocument } from "../pdf/PDFGenerator.js";

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

  // ============================================
  // 2. جلب البيانات من السيرفر
  // ============================================
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
    
    const targetId = quote.id || quote._id;
    setEditingQuoteId(targetId);
    setCustomerName(quote.customerName || quote.customer_name || '');
    setCustomerPhone(quote.customerPhone || quote.customer_phone || '');
    setCurrentQuoteNumber(quote.quote_number || null);

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
  // 6. دوال الحفظ والحذف (المصححة)
  // ============================================
  const handleSubmitQuote = async (e) => {
    e.preventDefault();

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
      quotePayload.quote_number = currentQuoteNumber;
    }

    console.log('📤 البيانات المرسلة:', JSON.stringify(quotePayload, null, 2));

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

      const responseData = await response.json();
      console.log('📥 الرد من السيرفر:', responseData);

      if (response.ok) {
        // ✅ تحديث رقم العرض من استجابة السيرفر
        if (responseData.quote && responseData.quote.quote_number) {
          const newQuoteNumber = responseData.quote.quote_number;
          setCurrentQuoteNumber(newQuoteNumber);
          quotePayload.quote_number = newQuoteNumber;
        }
        
        // ✅ طباعة الـ PDF بعد تحديث رقم العرض
        printLandSolarDocument(quotePayload, 'offer');
        handleCancelEdit();
        fetchQuotes();
        
        // ✅ إظهار رسالة نجاح مع رقم العرض
        alert(`✅ تم حفظ عرض السعر بنجاح! رقم العرض: ${quotePayload.quote_number || 'غير معروف'}`);
      } else {
        alert(`فشلت عملية الحفظ: ${responseData.error || response.status}`);
      }
    } catch (error) {
      console.error("خطأ أثناء حفظ عرض السعر:", error);
      alert("حدث خطأ في الاتصال بالسيرفر: " + error.message);
    }
  };

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

  // ============================================
  // 7. دوال التعميد
  // ============================================
  const handleApproveQuote = async (id) => {
    if (!window.confirm('هل أنت متأكد من تعميد عرض السعر هذا؟')) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/quotes/${id}/approve`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert('✅ تم تعميد عرض السعر بنجاح!');
        fetchQuotes();
      } else {
        const error = await response.json();
        alert(`فشل التعميد: ${error.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error("خطأ أثناء تعميد العرض:", error);
      alert("حدث خطأ في الاتصال بالسيرفر");
    }
  };

  const handleUnapproveQuote = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء تعميد عرض السعر هذا؟')) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/quotes/${id}/unapprove`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert('✅ تم إلغاء تعميد عرض السعر بنجاح!');
        fetchQuotes();
      } else {
        const error = await response.json();
        alert(`فشل إلغاء التعميد: ${error.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error("خطأ أثناء إلغاء تعميد العرض:", error);
      alert("حدث خطأ في الاتصال بالسيرفر");
    }
  };

  // ============================================
  // 8. الـ Return
  // ============================================
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" dir="rtl">
      <QuoteForm
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