// src/utils/pdfGenerator.js

/**
 * دالة لتنسيق التاريخ الحالي تلقائياً بصيغة YYYY/MM/DD
 */
const getCurrentFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  // إضافة صفر على اليسار إذا كان الشهر أو اليوم أقل من 10
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * الستايل المعتمد لتهيئة الصورة كخلفية ممتدة على كامل الصفحة والتنسيقات الهيكلية
 */
const getInvoiceStyle = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page {
    size: A4;
    margin: 0; /* إلغاء هوامش الطابعة الافتراضية لضمان تمدد الخلفية بالكامل */
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
  
  /* حاوية الخلفية الكاملة للصورة المنقولة من مجلد public */
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

  /* طبقة المحتوى النصي والبيانات الفوقية */
  .main-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    z-index: 10;
    padding-top: 42mm;     /* مساحة الهيدر العلوي لاند سولار */
    padding-bottom: 35mm;  /* مساحة الفوتر السفلي */
    padding-left: 18mm;
    padding-right: 18mm;
    display: flex;
    flex-direction: column;
  }

  /* عنوان المستند: عرض سعر / فاتورة مبيعات */
  .document-title {
    text-align: center;
    margin-bottom: 20px;
  }
  .document-title span {
    font-size: 18px;
    font-weight: bold;
    color: #000000;
    border-bottom: 1.5px solid #000000;
    padding-bottom: 2px;
    padding-left: 25px;
    padding-right: 25px;
    display: inline-block;
  }

  /* سطر معلومات العميل والجوال والتاريخ المتباعد */
  .customer-info-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 15px;
    padding: 0 5px;
  }

  /* فقرة التحية المكتوبة بالصورة */
  .greeting-paragraph {
    font-size: 13px;
    color: #000000;
    font-weight: 500;
    text-align: center;
    margin-bottom: 15px;
  }

  /* جدول تفاصيل العمل والأصناف */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #000000;
    padding: 8px 6px;
    color: #000000;
  }
  
  /* تعديل النصوص الرئيسية الثابتة في الصف الأول لتصبح عريضة وواضحة جداً */
  th {
    background-color: rgba(242, 242, 242, 0.5); 
    font-size: 14px;
    font-weight: 900 !important; /* تجعل الخط Bold عريض جداً */
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

  /* تنسيق قسم الملاحظات والضمان المضاف ليتناسب مع تصميمك الأسود والأبيض الكلاسيكي */
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

  @media print {
    body, .pdf-background-container, .main-content {
      width: 210mm;
      height: 297mm;
    }
  }
`;

/**
 * الدالة الموحدة لإنشاء المستند وطباعته بـ عدد أصناف فعلي وتاريخ تلقائي
 */
export const printLandSolarDocument = (data = {}, mode = 'offer') => {
  const isOffer = mode === 'offer';
  
  const customerName = data.customerName || data.name || "............................................";
  const customerPhone = data.customerPhone || data.phone || "........................";
  const items = data.items || [];
  const grandTotal = data.grandTotal || data.totalPrice || 0;
  
  // استخراج الملاحظات والضمان بمرونة للمسميات (القديمة في JSON والجديدة في الواجهة)
  const customNote = data.note || data.notes || '';
  const hasWarranty = data.hasWarranty || data.warranty || false;

  // توليد التاريخ التلقائي الحالي للمستند
  const documentDate = getCurrentFormattedDate();

  // بناء شبكة أسطر الجدول بناءً على عدد الأصناف الفعلي فقط
  let tableRows = '';
  items.forEach((item, idx) => {
    tableRows += `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td style="font-weight: bold;">${item.name || item.description || ''}</td>
        <td class="text-center">${item.unit || 'حبة'}</td>
        <td class="text-center" style="font-weight: bold;">${item.quantity || 0}</td>
        <td class="text-left" dir="ltr">${Number(item.price || 0).toLocaleString()}</td>
        <td class="text-left" dir="ltr" style="font-weight: bold;">${Number(item.total || (item.quantity * item.price) || 0).toLocaleString()}</td>
      </tr>
    `;
  });

  // إدارة الـ iframe المخفي والتأكد من تصفير الكاش القديم
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
        
        <div class="document-title">
          <span>${isOffer ? 'عرض سعر' : 'فاتورة مبيعات'}</span>
        </div>

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
            ${!isOffer && data.amountPaid !== undefined ? `
              <tr class="total-row">
                <td colspan="5" style="text-align: center;">المبلغ الواصل / المدفوع</td>
                <td class="text-left" dir="ltr">$${Number(data.amountPaid).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="5" style="text-align: center;">المبلغ المتبقي / الآجل</td>
                <td class="text-left" dir="ltr">$${Number(data.amountRemaining || 0).toLocaleString()}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        ${(customNote || hasWarranty) ? `
          <div class="custom-notes-area">
            <div class="notes-heading">📌 شروط وملاحظات منظومة لاند سولار:</div>
            
            ${customNote ? `
              <div class="note-text">${customNote}</div>
            ` : ''}
            
            ${hasWarranty ? `
              <div class="warranty-text">🛡️ هذا العرض يشمل بند الضمانة المعتمدة للألواح والإنفرتر والبطاريات ضد العيوب المصنعية وفق السياسة الرسمية للشركة.</div>
            ` : ''}
          </div>
        ` : ''}

      </div>
    </body>
    </html>
  `);
  frameDoc.close();

  // تنفيذ الطباعة المباشرة والمستقرة للـ iframe
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
