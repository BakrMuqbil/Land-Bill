import React, { useEffect, useState } from 'react';
import { printLandSolarDocument } from "../pdf/PDFGenerator.js";
import { useApprovedQuotes } from '../../hooks/useApprovedQuotes';
import InvoiceForm from './InvoiceForm';
import InvoiceArchive from './InvoiceArchive';
import ApprovedQuotesSection from './ApprovedQuotesSection';

export default function InvoicesManager({ products = [], apiUrl }) {
  // ============================================
  // 1. الحالات الأساسية (States)
  // ============================================
  const [invoices, setInvoices] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  const [includeStamp, setIncludeStamp] = useState(false);
  const [includeNote, setIncludeNote] = useState(false);
  const [customNoteText, setCustomNoteText] = useState('');

  // استخدام الـ Hook للعروض المعمدة
  const {
    approvedQuotes,
    loading: approvedLoading,
    convertToInvoice,
    fetchApprovedQuotes
  } = useApprovedQuotes(apiUrl);

  // ============================================
  // 2. جلب البيانات من السيرفر
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
    fetchApprovedQuotes();
  }, []);

  // ============================================
  // 3. دوال إدارة الأصناف
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
  // 4. دوال التعديل على الفاتورة
  // ============================================
  const handleEditInvoice = (invoice) => {
    setEditingInvoiceId(invoice.id);
    setCustomerName(invoice.customerName || invoice.customer_name || '');
    setCustomerPhone(invoice.customerPhone || invoice.customer_phone || '');
    setAmountPaid(invoice.amountPaid || invoice.amount_paid || 0);
    
    // ✅ تصحيح: التأكد من تعيين رقم الفاتورة بشكل صحيح
    setCurrentInvoiceNumber(invoice.invoice_number || null);
    
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
    setCurrentInvoiceNumber(null);
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

  if (currentInvoiceNumber) {
    invoiceData.invoice_number = currentInvoiceNumber;
  }

  const printPayload = {
    ...invoiceData,
    invoice_number: currentInvoiceNumber || null
  };

  console.log('📤 البيانات المرسلة للحفظ:', JSON.stringify(invoiceData, null, 2));
  console.log('🖨️ بيانات الطباعة:', JSON.stringify(printPayload, null, 2));

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
      const result = await response.json();
      
      if (result.invoice && result.invoice.invoice_number) {
        const newInvoiceNumber = result.invoice.invoice_number;
        setCurrentInvoiceNumber(newInvoiceNumber);
        printPayload.invoice_number = newInvoiceNumber;
      }
      
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
  // 7. دالة تحويل العرض المعتمد إلى فاتورة
  // ============================================
  const handleConvertApprovedQuote = async (approvedQuote) => {
    if (!window.confirm(`هل أنت متأكد من تحويل عرض السعر "${approvedQuote.quote_number}" إلى فاتورة؟`)) {
      return;
    }

    try {
      const result = await convertToInvoice(approvedQuote.id, {
        customerName: approvedQuote.customer_name,
        customerPhone: approvedQuote.customer_phone || '',
        grandTotal: approvedQuote.grand_total,
        amountPaid: 0,
        amountRemaining: approvedQuote.grand_total,
        status: 'غير مدفوعة'
      });

      if (result.success) {
        alert(`✅ تم تحويل العرض إلى فاتورة رقم: ${result.invoice.invoice_number}`);
        fetchInvoices();
      } else {
        alert(`فشل التحويل: ${result.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error("خطأ في تحويل العرض إلى فاتورة:", error);
      alert("حدث خطأ في الاتصال بالسيرفر");
    }
  };

  // ============================================
  // 8. الـ Return
  // ============================================
  return (
    <div className="space-y-8" dir="rtl">
      <InvoiceForm
        editingInvoiceId={editingInvoiceId}
        invoiceNumber={currentInvoiceNumber}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        customPrice={customPrice}
        setCustomPrice={setCustomPrice}
        quantity={quantity}
        setQuantity={setQuantity}
        products={products}
        handleProductChange={handleProductChange}
        handleAddItem={handleAddItem}
        handleAddNewRow={handleAddNewRow}
        currentItems={currentItems}
        editingItemIndex={editingItemIndex}
        handleRemoveItem={handleRemoveItem}
        calculateTotal={calculateTotal}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        calculateRemaining={calculateRemaining}
        includeStamp={includeStamp}
        setIncludeStamp={setIncludeStamp}
        includeNote={includeNote}
        setIncludeNote={setIncludeNote}
        customNoteText={customNoteText}
        setCustomNoteText={setCustomNoteText}
        handleSaveInvoice={handleSaveInvoice}
        handleCancelEdit={handleCancelEdit}
      />

      {!approvedLoading && approvedQuotes.length > 0 && (
        <ApprovedQuotesSection
          approvedQuotes={approvedQuotes}
          onConvert={handleConvertApprovedQuote}
        />
      )}

      <InvoiceArchive
        invoices={invoices}
        editingInvoiceId={editingInvoiceId}
        getInvoiceStatus={getInvoiceStatus}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
        onPrint={(inv) => {
          // 🔥 التأكد من وجود includeStamp عند الطباعة من الأرشيف
          const printData = {
            ...inv,
            includeStamp: inv.includeStamp || inv.include_stamp || false
          };
          printLandSolarDocument(printData, 'invoice');
        }}
      />
    </div>
  );
}