import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      setLoading(false);
      return;
    }

    const result = await login(username.trim(), password.trim());

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'فشل تسجيل الدخول');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
      <div className="w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/logo.png" alt="شعار لاند سولار" className="h-12 w-auto" />
            <img src="/header.png" alt="Land Solar" className="h-10 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h2>
          <p className="text-slate-500 text-sm mt-1">نظام إدارة المبيعات</p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                dir="rtl"
                autoFocus
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                dir="rtl"
              />
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium text-center">
                ❌ {error}
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#059669] hover:bg-emerald-700 text-white rounded-xl p-3.5 font-bold text-sm shadow-md transition-all shadow-emerald-600/10 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول ←'
              )}
            </button>
          </form>

          {/* المعلومات */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              نظام آمن © 2026 لاند سولار
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
