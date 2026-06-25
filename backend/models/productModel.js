const pool = require('../config/database');

const productModel = {
  // جلب كل الأصناف
  getAll: async () => {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    return result.rows;
  },

  // إضافة صنف جديد
  create: async (product) => {
    const { name, price, unit } = product;
    // 🔥 لا ترسل id، سيتم توليده تلقائياً
    const result = await pool.query(
      'INSERT INTO products (name, price, unit) VALUES ($1, $2, $3) RETURNING *',
      [name, price, unit || 'حبة']
    );
    return result.rows[0];
  },

  // تحديث صنف
  update: async (id, product) => {
    const { name, price, unit } = product;
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, unit = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, price, unit, id]
    );
    return result.rows[0];
  },

  // حذف صنف
  delete: async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return { success: true };
  },

  // البحث عن صنف بالاسم
  findByName: async (name) => {
    const result = await pool.query(
      'SELECT * FROM products WHERE name ILIKE $1',
      [`%${name}%`]
    );
    return result.rows;
  }
};

module.exports = productModel;