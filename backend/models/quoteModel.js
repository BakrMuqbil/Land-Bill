const pool = require('../config/database');

const quoteModel = {
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

  // ✅ الأجزاء المصححة فقط

create: async (quote) => {
  // ✅ استخدام snake_case
  const { customer_name, customer_phone, grand_total, has_warranty, note, items } = quote;
  
  if (!customer_name) {
    throw new Error('اسم العميل مطلوب');
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const quoteResult = await client.query(
      `INSERT INTO quotes (customer_name, customer_phone, grand_total, has_warranty, note) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_name, customer_phone || 'غير مسجل', grand_total || 0, has_warranty || false, note || '']
    );
    
    const quoteId = quoteResult.rows[0].id;
    const quoteNumber = quoteResult.rows[0].quote_number;

    if (items && items.length > 0) {
      for (const item of items) {
        const productId = item.product_id || item.id;
        if (!productId) {
          throw new Error('معرف المنتج مطلوب (product_id)');
        }
        await client.query(
          `INSERT INTO quote_items (quote_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [quoteId, productId, item.quantity, item.price, item.total]
        );
      }
    }

    await client.query('COMMIT');
    return {
      ...quote,
      id: quoteId,
      quote_number: quoteNumber
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
},

update: async (id, quote) => {
  // ✅ استخدام snake_case
  const { customer_name, customer_phone, grand_total, has_warranty, note, items } = quote;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkResult = await client.query(
      'SELECT status FROM quotes WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      throw new Error('عرض السعر غير موجود');
    }

    if (checkResult.rows[0].status === 'approved') {
      throw new Error('لا يمكن تعديل عرض سعر معتمد. قم بإلغاء التعميد أولاً.');
    }

    await client.query(
      `UPDATE quotes
       SET customer_name = $1,
           customer_phone = $2,
           grand_total = $3,
           has_warranty = $4,
           note = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [customer_name, customer_phone, grand_total, has_warranty || false, note || '', id]
    );

    await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);

    for (const item of items) {
      const productId = item.product_id || item.id;
      await client.query(
        `INSERT INTO quote_items (quote_id, product_id, quantity, price, total)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, productId, item.quantity, item.price, item.total]
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

  delete: async (id) => {
  // التحقق من وجود العرض وحالته
  const checkResult = await pool.query(
    'SELECT status FROM quotes WHERE id = $1',
    [id]
  );

  if (checkResult.rowCount === 0) {
    throw new Error('عرض السعر غير موجود');
  }

  if (checkResult.rows[0].status === 'approved') {
    throw new Error('لا يمكن حذف عرض سعر معتمد. قم بإلغاء التعميد أولاً.');
  }

  // حذف أصناف العرض أولاً إذا كانت موجودة
  await pool.query(
    'DELETE FROM quote_items WHERE quote_id = $1',
    [id]
  );

  // ثم حذف العرض
  await pool.query(
    'DELETE FROM quotes WHERE id = $1',
    [id]
  );

  return { success: true };
},


  approve: async (quoteId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quoteResult = await client.query(
        `SELECT * FROM quotes WHERE id = $1 AND status = 'pending'`,
        [quoteId]
      );

      if (quoteResult.rows.length === 0) {
        throw new Error('العرض غير موجود أو تم تعميده مسبقاً');
      }

      const quote = quoteResult.rows[0];

      const approvedResult = await client.query(
        `INSERT INTO approved_quotes (
          original_quote_id, quote_number, customer_name, customer_phone,
          grand_total, has_warranty, note, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *`,
        [quote.id, quote.quote_number, quote.customer_name, quote.customer_phone,
         quote.grand_total, quote.has_warranty, quote.note]
      );

      await client.query(
        `UPDATE quotes SET status = 'approved', approved_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [quoteId]
      );

      await client.query('COMMIT');
      return { 
        success: true, 
        message: 'تم تعميد العرض بنجاح',
        approved_quote: approvedResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  unapprove: async (quoteId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const invoiceCheck = await client.query(
        `SELECT * FROM invoices WHERE approved_quote_id = $1`,
        [quoteId]
      );

      if (invoiceCheck.rows.length > 0) {
        throw new Error('لا يمكن إلغاء التعميد لوجود فاتورة مرتبطة بهذا العرض');
      }

      await client.query(
        `DELETE FROM approved_quotes WHERE original_quote_id = $1`,
        [quoteId]
      );

      await client.query(
        `UPDATE quotes SET status = 'pending', approved_at = NULL
         WHERE id = $1`,
        [quoteId]
      );

      await client.query('COMMIT');
      return { 
        success: true, 
        message: 'تم إلغاء تعميد العرض بنجاح'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getApprovedQuotes: async () => {
    const result = await pool.query(`
      SELECT 
        aq.*,
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
      FROM approved_quotes aq
      LEFT JOIN quotes q ON aq.original_quote_id = q.id
      LEFT JOIN quote_items qi ON q.id = qi.quote_id
      LEFT JOIN products p ON qi.product_id = p.id
      GROUP BY aq.id
      ORDER BY aq.id DESC
    `);
    return result.rows;
  },

  convertToInvoice: async (approvedQuoteId, invoiceData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quoteResult = await client.query(
        `SELECT * FROM approved_quotes WHERE id = $1`,
        [approvedQuoteId]
      );

      if (quoteResult.rows.length === 0) {
        throw new Error('العرض المعتمد غير موجود');
      }

      const quote = quoteResult.rows[0];

      const itemsResult = await client.query(`
        SELECT qi.*, p.name, p.unit
        FROM quote_items qi
        JOIN products p ON qi.product_id = p.id
        WHERE qi.quote_id = $1
      `, [quote.original_quote_id]);

      const invoiceResult = await client.query(
        `INSERT INTO invoices (
          customer_name, customer_phone, grand_total, amount_paid, 
          amount_remaining, status, approved_quote_id, original_quote_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          invoiceData.customerName || quote.customer_name,
          invoiceData.customerPhone || quote.customer_phone,
          invoiceData.grandTotal || quote.grand_total,
          invoiceData.amountPaid || 0,
          invoiceData.amountRemaining || (invoiceData.grandTotal || quote.grand_total),
          invoiceData.status || 'غير مدفوعة',
          approvedQuoteId,
          quote.quote_number
        ]
      );

      const invoiceId = invoiceResult.rows[0].id;

      for (const item of itemsResult.rows) {
        await client.query(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, price, total) 
           VALUES ($1, $2, $3, $4, $5)`,
          [invoiceId, item.product_id, item.quantity, item.price, item.total]
        );
      }

      await client.query('COMMIT');
      return { 
        success: true, 
        message: 'تم تحويل العرض إلى فاتورة بنجاح',
        invoice: invoiceResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = quoteModel;