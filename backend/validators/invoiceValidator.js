// ============================================
// التحقق من صحة بيانات الفاتورة قبل الحفظ/التحديث
// ============================================

/**
 * يفحص بيانات الفاتورة الواردة من الطلب (req.body)
 * ويرجع مصفوفة من رسائل الخطأ. لو المصفوفة فاضية، يعني البيانات سليمة.
 *
 * @param {object} body - بيانات الفاتورة (req.body)
 * @returns {string[]} errors - قائمة رسائل الخطأ (فاضية لو كل شيء سليم)
 */
function validateInvoicePayload(body) {
  const errors = [];

  // ---- اسم العميل ----
  if (
    !body.customerName ||
    typeof body.customerName !== 'string' ||
    !body.customerName.trim()
  ) {
    errors.push('اسم العميل مطلوب');
  }

  // ---- الأصناف (items) ----
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('يجب أن تحتوي الفاتورة على صنف واحد على الأقل');
  } else {
    body.items.forEach((item, index) => {
      const itemNumber = index + 1;

      if (item.id === undefined || item.id === null || item.id === '') {
        errors.push(`الصنف رقم ${itemNumber}: المعرّف (id) مفقود`);
      }

      if (
        item.quantity === undefined ||
        item.quantity === null ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        errors.push(`الصنف رقم ${itemNumber}: الكمية غير صالحة`);
      }

      if (
        item.price === undefined ||
        item.price === null ||
        typeof item.price !== 'number' ||
        item.price < 0
      ) {
        errors.push(`الصنف رقم ${itemNumber}: السعر غير صالح`);
      }
    });
  }

  // ---- الإجمالي الكلي ----
  if (
    body.grandTotal === undefined ||
    body.grandTotal === null ||
    typeof body.grandTotal !== 'number' ||
    body.grandTotal < 0
  ) {
    errors.push('إجمالي الفاتورة غير صالح');
  }

  // ---- المبلغ المدفوع (اختياري، لكن لو موجود لازم يكون رقم صحيح) ----
  if (
    body.amountPaid !== undefined &&
    body.amountPaid !== null &&
    (typeof body.amountPaid !== 'number' || body.amountPaid < 0)
  ) {
    errors.push('المبلغ المدفوع غير صالح');
  }

  // ---- المبلغ المدفوع لا يتجاوز الإجمالي ----
  if (
    typeof body.grandTotal === 'number' &&
    typeof body.amountPaid === 'number' &&
    body.amountPaid > body.grandTotal
  ) {
    errors.push('المبلغ المدفوع أكبر من إجمالي الفاتورة');
  }

  return errors;
}

module.exports = { validateInvoicePayload };
