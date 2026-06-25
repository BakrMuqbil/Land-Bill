import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export const useQuotes = (apiUrl) => {
  const [quotes, setQuotes] = useState([]);
  const { loading, error, request } = useApi(apiUrl);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  // جلب عروض الأسعار
  const fetchQuotes = useCallback(async () => {
    const data = await request('/quotes');
    setQuotes(data);
    return data;
  }, [request]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // إضافة عرض سعر جديد
  const addQuote = useCallback(async (quote) => {
    const data = await request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
    await fetchQuotes();
    return data;
  }, [request, fetchQuotes]);

  // تحديث عرض سعر
  const updateQuote = useCallback(async (id, quote) => {
    const data = await request(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quote)
    });
    await fetchQuotes();
    return data;
  }, [request, fetchQuotes]);

  // حذف عرض سعر
  const deleteQuote = useCallback(async (id) => {
    const data = await request(`/quotes/${id}`, {
      method: 'DELETE'
    });
    await fetchQuotes();
    return data;
  }, [request, fetchQuotes]);

  // بدء التعديل
  const startEdit = useCallback((id) => {
    setEditingQuoteId(id);
  }, []);

  // إلغاء التعديل
  const cancelEdit = useCallback(() => {
    setEditingQuoteId(null);
  }, []);

  return {
    quotes,
    loading,
    error,
    editingQuoteId,
    fetchQuotes,
    addQuote,
    updateQuote,
    deleteQuote,
    startEdit,
    cancelEdit
  };
};
