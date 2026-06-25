import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export const useApprovedQuotes = (apiUrl) => {
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const { loading, error, request } = useApi(apiUrl);

  // جلب عروض الأسعار المعمدة
  const fetchApprovedQuotes = useCallback(async () => {
    const data = await request('/approved-quotes');
    setApprovedQuotes(data);
    return data;
  }, [request]);

  useEffect(() => {
    fetchApprovedQuotes();
  }, [fetchApprovedQuotes]);

  // تحويل عرض معتمد إلى فاتورة
  const convertToInvoice = useCallback(async (approvedQuoteId, invoiceData) => {
    const data = await request(`/approved-quotes/${approvedQuoteId}/convert`, {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
    // تحديث القائمة بعد التحويل
    await fetchApprovedQuotes();
    return data;
  }, [request, fetchApprovedQuotes]);

  // الحصول على عرض معتمد محدد
  const getApprovedQuote = useCallback(async (id) => {
    const data = await request(`/approved-quotes/${id}`);
    return data;
  }, [request]);

  return {
    approvedQuotes,
    loading,
    error,
    fetchApprovedQuotes,
    convertToInvoice,
    getApprovedQuote
  };
};
