import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export const useInvoices = (apiUrl) => {
  const [invoices, setInvoices] = useState([]);
  const { loading, error, request } = useApi(apiUrl);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  // جلب الفواتير
  const fetchInvoices = useCallback(async () => {
    const data = await request('/invoices');
    setInvoices(data);
    return data;
  }, [request]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // إضافة فاتورة جديدة
  const addInvoice = useCallback(async (invoice) => {
    const data = await request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
    await fetchInvoices();
    return data;
  }, [request, fetchInvoices]);

  // تحديث فاتورة
  const updateInvoice = useCallback(async (id, invoice) => {
    const data = await request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    });
    await fetchInvoices();
    return data;
  }, [request, fetchInvoices]);

  // حذف فاتورة
  const deleteInvoice = useCallback(async (id) => {
    const data = await request(`/invoices/${id}`, {
      method: 'DELETE'
    });
    await fetchInvoices();
    return data;
  }, [request, fetchInvoices]);

  // بدء التعديل
  const startEdit = useCallback((id) => {
    setEditingInvoiceId(id);
  }, []);

  // إلغاء التعديل
  const cancelEdit = useCallback(() => {
    setEditingInvoiceId(null);
  }, []);

  return {
    invoices,
    loading,
    error,
    editingInvoiceId,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    startEdit,
    cancelEdit
  };
};
