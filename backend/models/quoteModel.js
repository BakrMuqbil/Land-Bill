const pool = require('../config/database');

const quoteModel = {
  // جلب كل عروض الأسعار مع عناصرها
  getAll: async () => {
    const result = await pool.query(`
      SELECT 
        q.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', qi.id,
              'product_id', qi.product_id,
              'name', p.name,
              'quantity', qi.quantity,
              'price', qi.price,
              'total', qi.total,
              'unit', p.unit
            )
          ) FILTER (WHERE qi.id IS NOT NULL), '[]'
        ) as items
      FROM quotes q
      LEFT JOIN quote_items qi ON q.id = qi.quote_id
      LEFT JOIN products p ON qi.product_id = p.id
      GROUP BY q.id
      ORDER BY q.id DESC
    `);
    return result.rows;
  },

  // إضافة عرض سعر جديد مع عناصره
  create: async (quote) => {
    const { customerName, customerPhone, grandTotal, hasWarranty, note, items } = quote;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quoteResult = await client.query(
        `INSERT INTO quotes (customer_name, customer_phone, grand_total, has_warranty, note) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [customerName, customerPhone, grandTotal, hasWarranty || false, note || '']
      );
      
      const quoteId = quoteResult.rows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO quote_items (quote_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [quoteId, item.id, item.quantity, item.price, item.total]
        );
      }

      await client.query('COMMIT');
      return { id: quoteId, ...quote };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // تحديث عرض سعر
  update: async (id, quote) => {
    const { customerName, customerPhone, grandTotal, hasWarranty, note, items } = quote;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE quotes 
         SET customer_name = $1, customer_phone = $2, grand_total = $3, 
             has_warranty = $4, note = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [customerName, customerPhone, grandTotal, hasWarranty || false, note || '', id]
      );

      await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);

      for (const item of items) {
        await client.query(
          `INSERT INTO quote_items (quote_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id, item.id, item.quantity, item.price, item.total]
        );
      }

      await client.query('COMMIT');
      return { id, ...quote };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // حذف عرض سعر
  delete: async (id) => {
    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return { success: true };
  }
};

module.exports = quoteModel;
