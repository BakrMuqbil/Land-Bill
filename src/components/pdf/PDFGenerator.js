// src/utils/pdfGenerator.js

/**
 * دالة لتنسيق التاريخ الحالي تلقائياً بصيغة YYYY/MM/DD
 */
const getCurrentFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * الستايل المعتمد لتهيئة الصورة كخلفية ممتدة على كامل الصفحة
 */
const getInvoiceStyle = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page {
    size: A4;
    margin: 0;
  }

  body {
    font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', Arial, sans-serif;
    background-color: #ffffff;
    color: #000000;
    width: 210mm;
    height: 297mm;
    position: relative;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .pdf-background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    background-image: url('/print-bg.png'); 
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 1;
  }

  .main-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    z-index: 10;
    padding-top: 47mm;
    padding-bottom: 35mm;
    padding-left: 18mm;
    padding-right: 18mm;
    display: flex;
    flex-direction: column;
  }

  /* 🔥 هيدر: رقم في اليسار، عنوان في المنتصف (RTL) */
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 5px;
    direction: rtl;
  }
  .header-left {
    flex: 0 0 auto;
    text-align: right;
    font-size: 14px;
  }
  .header-left .doc-label {
    font-weight: 500;
    color: #000000;
  }
  .header-left .doc-number {
    font-weight: bold;
    color: #cc0000;
  }
  .header-center {
    flex: 1;
    text-align: center;
  }
  .header-center span {
    font-size: 18px;
    font-weight: bold;
    color: #000000;
    border-bottom: 1.5px solid #000000;
    padding-bottom: 2px;
    padding-left: 25px;
    padding-right: 25px;
    display: inline-block;
  }
  .header-right {
    flex: 0 0 auto;
    width: 120px;
  }

  .customer-info-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 15px;
    padding: 0 5px;
  }

  .greeting-paragraph {
    font-size: 13px;
    color: #000000;
    font-weight: 500;
    text-align: center;
    margin-bottom: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #000000;
    padding: 6px 6px;
    color: #000000;
  }
  
  th {
    background-color: rgba(242, 242, 242, 0.5); 
    font-size: 14px;
    font-weight: 900 !important;
    text-align: center;
  }
  
  td {
    text-align: right;
  }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  
  .total-row {
    font-weight: bold;
  }

  .custom-notes-area {
    margin-top: 15px;
    border-right: 3px solid #000000;
    padding-right: 10px;
    padding-left: 5px;
  }
  .notes-heading {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .note-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    white-space: pre-line;
    margin-bottom: 5px;
  }
  .warranty-text {
    font-size: 11px;
    font-weight: bold;
    font-style: italic;
  }

  .stamp-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .stamp-label {
    font-size: 12px;
    font-weight: bold;
    color: #000000;
  }
  .stamp-image {
    max-height: 110px;
    width: auto;
    object-fit: contain;
  }

  @media print {
    body, .pdf-background-container, .main-content {
      width: 210mm;
      height: 297mm;
    }
  }
`;

/**
 * الدالة الموحدة لإنشاء المستند وطباعته
 */
export const printLandSolarDocument = (data = {}, mode = 'offer') => {
  const isOffer = mode === 'offer';
  
  // دعم camelCase و snake_case
  const customerName = data.customerName || data.customer_name || "............................................";
  const customerPhone = data.customerPhone || data.customer_phone || "........................";
  const items = data.items || [];
  
  const customNote = data.note || data.notes || '';
  const hasWarranty = data.hasWarranty || data.has_warranty || false;
  const includeStamp = data.includeStamp || data.include_stamp || false;

  // 🔥 رقم المستند (فاتورة أو عرض سعر)
  const documentNumber = data.invoiceNumber || data.quoteNumber || data.documentNumber || '';

  const documentDate = getCurrentFormattedDate();

  // بناء شبكة أسطر الجدول
  let tableRows = '';
  if (items && items.length > 0) {
    items.forEach((item, idx) => {
      const itemName = item.name || item.product_name || '';
      const itemUnit = item.unit || 'حبة';
      const itemQuantity = item.quantity || 0;
      const itemPrice = item.price || 0;
      const itemTotal = item.total || (itemQuantity * itemPrice) || 0;
      
      tableRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td style="font-weight: bold;">${itemName}</td>
          <td class="text-center">${itemUnit}</td>
          <td class="text-center" style="font-weight: bold;">${itemQuantity}</td>
          <td class="text-left" dir="ltr">${Number(itemPrice).toLocaleString()}</td>
          <td class="text-left" dir="ltr" style="font-weight: bold;">${Number(itemTotal).toLocaleString()}</td>
        </tr>
      `;
    });
  } else {
    tableRows = `
      <tr>
        <td colspan="6" class="text-center" style="padding: 20px; color: #999;">
          لا توجد أصناف في هذا المستند
        </td>
      </tr>
    `;
  }

  // إدارة الـ iframe المخفي
  let printFrame = document.getElementById('land-solar-print-frame');
  if (printFrame) {
    printFrame.remove();
  }

  printFrame = document.createElement('iframe');
  printFrame.id = 'land-solar-print-frame';
  printFrame.style.position = 'fixed';
  printFrame.style.bottom = '0';
  printFrame.style.right = '0';
  printFrame.style.width = '1px';
  printFrame.style.height = '1px';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
  
  const grandTotal =
  data.grandTotal ?? data.grand_total ?? 0;

const amountPaid =
  data.amountPaid ?? data.amount_paid ?? 0;

const amountRemaining =
  data.amountRemaining ?? data.amount_remaining ?? 0;

  // 🔥 تحديد النص المعروض حسب نوع المستند
  const docLabel = isOffer ? 'رقم العرض' : 'رقم الفاتورة';

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>${isOffer ? 'عرض سعر' : 'فاتورة'} - ${customerName}</title>
      <style>${getInvoiceStyle()}</style>
    </head>
    <body>
      
      <div class="pdf-background-container"></div>
      
      <div class="main-content">
        
        <!-- 🔥 هيدر: رقم في اليسار، عنوان في المنتصف -->
        <div class="header-section" >
          <div class="header-left" >
            ${documentNumber ? `<span class="doc-label">${docLabel}: </span><span class="doc-number">${documentNumber}</span>` : ''}
          </div>
          <div class="header-center">
            <span>${isOffer ? 'عرض سعر' : 'فاتورة مبيعات'}</span>
          </div>
          <div class="header-right"></div>
        </div>

        <!-- معلومات العميل -->
        <div class="customer-info-line">
          <div>
            <span>الاخ/ عميل:</span>
            <strong>${customerName}</strong>
          </div>
          <div>
            <span>جوال/</span>
            <strong dir="ltr">${customerPhone}</strong>
          </div>
          <div>
            <span>التاريخ:</span>
            <strong dir="ltr">${documentDate}</strong>
          </div>
        </div>

        <div class="greeting-paragraph">
          يسُرُّنا ويسعدنا تقديم عرضنا بأفضل الأسعار وأحدث المواصفات العالمية
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">م</th>
              <th style="width: 50%;">المواصفات</th>
              <th style="width: 9%;">الوحدة</th>
              <th style="width: 9%;">الكمية</th>
              <th style="width: 13%;">سعر الوحدة</th>
              <th style="width: 14%;">إجمالي السعر</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr class="total-row">
              <td colspan="5" style="text-align: center; font-weight: 900;">الإجمالي الكلي ( دولار )</td>
              <td class="text-left" dir="ltr" style="font-weight: 900;">$${Number(grandTotal).toLocaleString()}</td>
            </tr>
            ${!isOffer ? `
              <tr class="total-row">
                <td colspan="5" style="text-align: center;">المبلغ الواصل / المدفوع</td>
                <td class="text-left" dir="ltr">$${Number(amountPaid).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="5" style="text-align: center;">المبلغ المتبقي / الآجل</td>
                <td class="text-left" dir="ltr">$${Number(amountRemaining || 0).toLocaleString()}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        ${(customNote || hasWarranty) ? `
          <div class="custom-notes-area">
            <div class="notes-heading">📌 شروط وملاحظات منظومة لاند سولار:</div>
            ${customNote ? `<div class="note-text">${customNote}</div>` : ''}
            ${hasWarranty ? `<div class="warranty-text">🛡️ هذا العرض يشمل بند الضمانة المعتمدة للألواح والإنفرتر والبطاريات ضد العيوب المصنعية وفق السياسة الرسمية للشركة.</div>` : ''}
          </div>
        ` : ''}

        ${!isOffer && includeStamp ? `
          <div class="stamp-container">
            <div class="stamp-label">ختم الشركة</div>
            <div>
              <img src="/Companyseal.png" class="stamp-image" alt="ختم الشركة" />
            </div>
          </div>
        ` : ''}

      </div>
    </body>
    </html>
  `);
  frameDoc.close();

  const executePrint = () => {
    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (e) {
        console.error("فشلت عملية استدعاء واجهة الطباعة:", e);
      }
    }, 600);
  };

  if (frameDoc.readyState === 'complete') {
    executePrint();
  } else {
    printFrame.onload = executePrint;
  }
};

export default { printLandSolarDocument };