const pool = require('../config/database');

const invoiceModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT 
        i.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ii.id,
              'product_id', ii.product_id,
              'name', p.name,
              'quantity', ii.quantity,
              'price', ii.price,
              'total', ii.total,
              'unit', p.unit
            )
          ) FILTER (WHERE ii.id IS NOT NULL), '[]'
        ) as items
      FROM invoices i
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      LEFT JOIN products p ON ii.product_id = p.id
      GROUP BY i.id
      ORDER BY i.id DESC
    `);
    return result.rows;
  },

  create: async (invoice) => {
    const { customerName, customerPhone, grandTotal, amountPaid, amountRemaining, status, items } = invoice;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const invoiceResult = await client.query(
        `INSERT INTO invoices (customer_name, customer_phone, grand_total, amount_paid, amount_remaining, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [customerName, customerPhone, grandTotal, amountPaid || 0, amountRemaining || 0, status || 'غير مدفوعة']
      );
      
      const invoiceId = invoiceResult.rows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [invoiceId, item.id, item.quantity, item.price, item.total]
        );
      }

      await client.query('COMMIT');
      return { id: invoiceId, ...invoice };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // 🔥 دالة التحديث (جديدة)
  update: async (id, invoice) => {
    const { customerName, customerPhone, grandTotal, amountPaid, amountRemaining, status, items } = invoice;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE invoices 
         SET customer_name = $1, 
             customer_phone = $2, 
             grand_total = $3, 
             amount_paid = $4, 
             amount_remaining = $5, 
             status = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [customerName, customerPhone, grandTotal, amountPaid || 0, amountRemaining || 0, status || 'غير مدفوعة', id]
      );

      await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

      for (const item of items) {
        await client.query(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id, item.id, item.quantity, item.price, item.total]
        );
      }

      await client.query('COMMIT');
      return { id, ...invoice };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  delete: async (id) => {
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    return { success: true };
  },

  updateStatus: async (id, status) => {
    const result = await pool.query(
      'UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = invoiceModel;