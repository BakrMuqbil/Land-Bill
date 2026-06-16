const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// دالة مساعدة لقراءة البيانات من ملف JSON
const readData = () => {
    try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return { products: [], quotes: [], invoices: [] };
    }
};

// دالة مساعدة لكتابة وحفظ البيانات في ملف JSON
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// --- [ مسارات الأصناف Products ] ---
app.get('/api/products', (req, res) => {
    res.json(readData().products);
});

app.post('/api/products', (req, res) => {
    const data = readData();
    
    // استخراج الخصائص الأساسية فقط من الـ body لمنع الـ id من القدوم كـ null
    const { name, price, unit } = req.body;
    
    const newProduct = { 
        id: Date.now(), // توليد رقم فريد فوري ونظيف
        name: name,
        price: Number(price),
        unit: unit || 'حبة'
    };
    
    data.products.push(newProduct);
    writeData(data);
    res.json({ success: true, product: newProduct });
});


app.put('/api/products/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    data.products = data.products.map(p => p.id === id ? { ...p, ...req.body } : p);
    writeData(data);
    res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    data.products = data.products.filter(p => p.id !== id);
    writeData(data);
    res.json({ success: true });
});

// --- [ مسارات عروض الأسعار Quotes ] ---
app.get('/api/quotes', (req, res) => {
    res.json(readData().quotes);
});

app.post('/api/quotes', (req, res) => {
    const data = readData();
    const newQuote = { id: Date.now(), createdAt: new Date().toISOString(), ...req.body };
    data.quotes.push(newQuote);
    writeData(data);
    res.json({ success: true, quote: newQuote });
});

// 🔥 إضافة مسار التعديل المفقود لعروض الأسعار لتجنب خطأ 404
app.put('/api/quotes/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    
    let updatedQuote = null;
    data.quotes = data.quotes.map(q => {
        if (q.id === id) {
            updatedQuote = { ...q, ...req.body, id }; // الحفاظ على المعرف الرقمي ثابت
            return updatedQuote;
        }
        return q;
    });
    
    writeData(data);
    res.json({ success: true, quote: updatedQuote });
});

app.delete('/api/quotes/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    data.quotes = data.quotes.filter(q => q.id !== id);
    writeData(data);
    res.json({ success: true });
});

// --- [ مسارات الفواتير Invoices ] ---
app.get('/api/invoices', (req, res) => {
    res.json(readData().invoices);
});

app.post('/api/invoices', (req, res) => {
    const data = readData();
    const newInvoice = { id: Date.now(), createdAt: new Date().toISOString(), ...req.body };
    data.invoices.push(newInvoice);
    writeData(data);
    res.json({ success: true, invoice: newInvoice });
});

app.delete('/api/invoices/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    data.invoices = data.invoices.filter(i => i.id !== id);
    writeData(data);
    res.json({ success: true });
});

// تصدير التطبيق لـ Vercel
module.exports = app;

// تشغيل السيرفر محلياً فقط
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
