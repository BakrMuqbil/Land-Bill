import React, { useState } from 'react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

export default function ProductsManager({ products = [], onSave, onDelete }) {
  // ============================================
  // 1. الحالات الأساسية (States)
  // ============================================
  const initialFormState = { id: null, name: '', price: '', unit: 'حبة' };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // ============================================
  // 2. دوال المعالجة
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      return alert("الرجاء ملء كافة الحقول الأساسية أولاً!");
    }

    const formattedData = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: form.unit || 'حبة'
    };

    if (isEditing && form.id) {
      formattedData.id = form.id;
    }

    onSave(formattedData, isEditing);
    handleCancel();
  };

  const handleEditClick = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || 'حبة'
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id, name) => {
    if (confirm(`هل أنت متأكد من حذف الصنف: "${name}" نهائياً من ملف JSON؟`)) {
      onDelete(id);
      if (form.id === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setForm(initialFormState);
    setIsEditing(false);
  };

  // ============================================
  // 3. الـ Return
  // ============================================
  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <ProductForm
        form={form}
        setForm={setForm}
        isEditing={isEditing}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ProductTable
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
}
