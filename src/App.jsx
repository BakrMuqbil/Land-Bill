import React, { useEffect, useState } from 'react';
import QuotesManager from './components/QuotesManager';
import InvoicesManager from './components/InvoicesManager';
import ProductsManager from './components/ProductsManager';


const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('quotes');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      setMessage({ text: 'فشل الاتصال بقاعدة البيانات', type: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productForm, isEditing) => {
    try {
      const url = isEditing 
        ? `${API_URL}/products/${productForm.id}`
        : `${API_URL}/products`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        setMessage({ 
          text: isEditing ? '✅ تم تحديث الصنف بنجاح' : '✅ تم إضافة الصنف بنجاح', 
          type: 'success' 
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        await fetchProducts();
      } else {
        const error = await response.json();
        setMessage({ text: `❌ ${error.error || 'حدث خطأ'}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ خطأ في الاتصال بالسيرفر', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ text: '✅ تم حذف الصنف بنجاح', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        await fetchProducts();
      }
    } catch (error) {
      setMessage({ text: '❌ خطأ في حذف الصنف', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-right font-sans flex flex-col justify-between" dir="rtl">
      
      {/* هيدر الموقع */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="شعار لاند سولار" className="h-10 w-auto object-contain" />
            <img src="/header.png" alt="Land Solar Name Logo" className="h-12 w-auto object-contain border-r border-slate-100 pr-3" />
          </div>

          <nav className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 w-full md:w-auto justify-around sm:justify-start gap-1">
            <button 
              onClick={() => setActiveTab('quotes')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'quotes' ? 'bg-[#059669] text-white shadow-md shadow-emerald-600/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              عروض الأسعار
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'invoices' ? 'bg-[#059669] text-white shadow-md shadow-emerald-600/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              الفواتير
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'products' ? 'bg-[#059669] text-white shadow-md shadow-emerald-600/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              إدارة الأصناف
            </button>
          </nav>

          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[10px] font-bold text-[#00a896] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80 uppercase tracking-widest">
              نظام إدارة المبيعات v2.0
            </div>
          </div>

        </div>
      </header>

      {/* رسائل النظام */}
      {message.text && (
        <div className={`max-w-7xl mx-auto px-4 pt-4 ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          <div className={`p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            {message.text}
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex-grow w-full">
        {loading ? (
          <div className="text-center py-12 font-bold text-slate-500 animate-pulse">جاري جلب البيانات من قاعدة البيانات...</div>
        ) : (
          <div className="transition-all duration-300">
            {activeTab === 'quotes' && <QuotesManager products={products} apiUrl={API_URL} />}
            {activeTab === 'invoices' && <InvoicesManager products={products} apiUrl={API_URL} />}
            {activeTab === 'products' && (
              <ProductsManager 
                products={products} 
                onSave={handleSaveProduct} 
                onDelete={handleDeleteProduct} 
              />
            )}
          </div>
        )}
      </main>

      {/* الفوتر */}
      <footer className="mt-12 px-4 mb-10" dir="rtl">
        <p className="text-slate-400 text-[13px] text-center mt-6 leading-relaxed">
          © 2026 جميع الحقوق محفوظة لشركة لاند سولار للطاقة المتجددة <br />
          تصميم وتطوير {' '}
          <span 
            className="text-emerald-900/80 font-bold cursor-pointer hover:text-emerald-400 transition-colors underline decoration-dotted underline-offset-4"
            onClick={() => {
              const facebookUrl = "https://www.facebook.com/profile.php?id=61590381007741";
              window.open(facebookUrl, '_blank');
            }}
          >
            Syntix_Web
          </span>
        </p>
      </footer>

    </div>
  );
}

export default App;