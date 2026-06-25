import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export const useProducts = (apiUrl) => {
  const [products, setProducts] = useState([]);
  const { loading, error, request } = useApi(apiUrl);

  // جلب الأصناف
  const fetchProducts = useCallback(async () => {
    const data = await request('/products');
    setProducts(data);
    return data;
  }, [request]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // إضافة صنف جديد
  const addProduct = useCallback(async (product) => {
    const data = await request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    await fetchProducts();
    return data;
  }, [request, fetchProducts]);

  // تحديث صنف
  const updateProduct = useCallback(async (id, product) => {
    const data = await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
    await fetchProducts();
    return data;
  }, [request, fetchProducts]);

  // حذف صنف
  const deleteProduct = useCallback(async (id) => {
    const data = await request(`/products/${id}`, {
      method: 'DELETE'
    });
    await fetchProducts();
    return data;
  }, [request, fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
