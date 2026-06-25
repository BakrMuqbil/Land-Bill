const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const productModel = require('./models/productModel');
const quoteModel = require('./models/quoteModel');
const invoiceModel = require('./models/invoiceModel');
const authService = require('./services/authService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ============================================
// 🔐 مسارات المصادقة (Authentication)
// ============================================

// ✅ تسجيل الدخول
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

// ✅ التحقق من صحة التوكن
app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const result = authService.verifyToken(token);
  res.json(result);
});

// ✅ تغيير كلمة المرور
app.put('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    const { valid, user } = authService.verifyToken(token);
    if (!valid) {
      return res.status(401).json({ error: 'جلسة غير صالحة' });
    }

    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(user.id, oldPassword, newPassword);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ إضافة مستخدم جديد (للمطورين فقط)
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
    res.json(products);
  } catch (error) {
    console.error('❌ خطأ في جلب الأصناف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await productModel.create(req.body);
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ خطأ في إضافة صنف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await productModel.update(parseInt(req.params.id), req.body);
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ خطأ في تحديث صنف:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await productModel.delete(parseInt(req.params.id));
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
    res.json(quotes);
  } catch (error) {
    console.error('❌ خطأ في جلب عروض الأسعار:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes', async (req, res) => {
  console.log('📥 [server] POST /api/quotes - البيانات:', JSON.stringify(req.body, null, 2));
  try {
    const quote = await quoteModel.create(req.body);
    console.log('✅ [server] تم حفظ العرض بنجاح:', quote);
    res.json({ success: true, quote });
  } catch (error) {
    console.error('❌ [server] خطأ في حفظ عرض السعر:', error.message);
    console.error('❌ [server] Stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await quoteModel.update(parseInt(req.params.id), req.body);
    res.json({ success: true, quote });
  } catch (error) {
    console.error('❌ خطأ في تحديث عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    await quoteModel.delete(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('❌ خطأ في حذف عرض سعر:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// مسارات التعميد (Approval)
// ============================================

// تعميد عرض سعر
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

// إلغاء تعميد عرض سعر
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

// جلب عروض الأسعار المعمدة
app.get('/api/approved-quotes', async (req, res) => {
  try {
    const approvedQuotes = await quoteModel.getApprovedQuotes();
    res.json(approvedQuotes);
  } catch (error) {
    console.error('❌ خطأ في جلب العروض المعمدة:', error);
    res.status(500).json({ error: error.message });
  }
});

// تحويل عرض معتمد إلى فاتورة
app.post('/api/approved-quotes/:id/convert', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await quoteModel.convertToInvoice(id, req.body);
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
    res.json(invoices);
  } catch (error) {
    console.error('❌ خطأ في جلب الفواتير:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invoice = await invoiceModel.create(req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    console.error('❌ خطأ في إضافة فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await invoiceModel.update(parseInt(req.params.id), req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    console.error('❌ خطأ في تحديث فاتورة:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await invoiceModel.delete(parseInt(req.params.id));
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