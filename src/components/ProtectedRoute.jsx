import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 🔄 عرض مؤشر التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">جاري التحقق من صلاحية الدخول...</p>
        </div>
      </div>
    );
  }

  // 🔒 إذا لم يكن هناك مستخدم، التوجيه إلى صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ إذا كان المستخدم مسجلاً، عرض المحتوى
  return children;
};
