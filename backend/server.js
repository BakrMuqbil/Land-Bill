const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const productModel = require('./models/productModel');
const quoteModel = require('./models/quoteModel');
const invoiceModel = require('./models/invoiceModel');
const authService = require('./services/authService');
const { validateInvoicePayload } = require('./validators/invoiceValidator');
// ✅ إضافة caseConverter
const { toSnakeCase, toCamelCase, toCamelCaseArray } = require('./utils/caseConverter');

const app = express();
const PORT = process.env.PORT || 5000;
// ✅ تأكد من أن CORS يسمح بكل شيء مؤقتاً (للاختبار)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json());

// ============================================
// 🔐 مسارات المصادقة (Authentication)
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبة' });
    }
    const result = await authService.login(username, password);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });
  const result = authService.verifyToken(token);
  res.json(result);
});

app.put('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'غير مصرح' });
    const { valid, user } = authService.verifyToken(token);
    if (!valid) return res.status(401).json({ error: 'جلسة غير صالحة' });
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(user.id, oldPassword, newPassword);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    const user = await authService.createUser(username, password, fullName, role);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// مسارات الأصناف Products
// ============================================
app.get('/api/products', async (req, res) => {
  try {
    const products = await productModel.getAll();
    res.json(toCamelCaseArray(products)); // ✅ snake_case → camelCase
  } catch (error) {
    console.error('❌ خطأ في جلب الأصناف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const snakeData = toSnakeCase(req.body); // ✅ camelCase → snake_case
    const product = await productModel.create(snakeData);
    res.json({ success: true, product: toCamelCase(product) });
  } catch (error) {
    console.error('❌ خطأ في إضافة صنف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const snakeData = toSnakeCase(req.body);
    const product = await productModel.update(id, snakeData);
    res.json({ success: true, product: toCamelCase(product) });
  } catch (error) {
    console.error('❌ خطأ في تحديث صنف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await productModel.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ خطأ في حذف صنف:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// مسارات عروض الأسعار Quotes
// ============================================
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await quoteModel.getAll();
    res.json(toCamelCaseArray(quotes)); // ✅ snake_case → camelCase
  } catch (error) {
    console.error('❌ خطأ في جلب عروض الأسعار:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const snakeData = toSnakeCase(req.body); // ✅ camelCase → snake_case
    const quote = await quoteModel.create(snakeData);
    console.log('✅ [server] تم حفظ العرض بنجاح:', quote);
    res.json({ success: true, quote: toCamelCase(quote) });
  } catch (error) {
    console.error('❌ [server] خطأ في حفظ عرض السعر:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const snakeData = toSnakeCase(req.body);
    const quote = await quoteModel.update(id, snakeData);
    res.json({ success: true, quote: toCamelCase(quote) });
  } catch (error) {
    console.error('❌ خطأ في تحديث عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await quoteModel.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ خطأ في حذف عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// مسارات التعميد (Approval)
// ============================================

app.put('/api/quotes/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await quoteModel.approve(id);
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في تعميد عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/quotes/:id/unapprove', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await quoteModel.unapprove(id);
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في إلغاء تعميد عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/approved-quotes', async (req, res) => {
  try {
    const approvedQuotes = await quoteModel.getApprovedQuotes();
    res.json(toCamelCaseArray(approvedQuotes)); // ✅ snake_case → camelCase
  } catch (error) {
    console.error('❌ خطأ في جلب العروض المعمدة:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approved-quotes/:id/convert', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const snakeData = toSnakeCase(req.body);
    const result = await quoteModel.convertToInvoice(id, snakeData);
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في تحويل عرض إلى فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// مسارات الفواتير Invoices
// ============================================
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await invoiceModel.getAll();
    res.json(toCamelCaseArray(invoices)); // ✅ snake_case → camelCase
  } catch (error) {
    console.error('❌ خطأ في جلب الفواتير:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const errors = validateInvoicePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('، ') });
    }

    const snakeData = toSnakeCase(req.body); // ✅ camelCase → snake_case
    const invoice = await invoiceModel.create(snakeData);
    res.json({ success: true, invoice: toCamelCase(invoice) });
  } catch (error) {
    console.error('❌ خطأ في إضافة فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const errors = validateInvoicePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('، ') });
    }

    const id = parseInt(req.params.id);
    const snakeData = toSnakeCase(req.body);
    const invoice = await invoiceModel.update(id, snakeData);
    res.json({ success: true, invoice: toCamelCase(invoice) });
  } catch (error) {
    console.error('❌ خطأ في تحديث فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await invoiceModel.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ خطأ في حذف فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// تشغيل السيرفر
// ============================================
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}