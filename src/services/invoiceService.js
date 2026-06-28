import { ApiClient } from './apiClient';

export class InvoiceService extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
  }

  async getAll() {
    return this.get('/invoices');
  }

  async create(invoice) {
    return this.post('/invoices', invoice);
  }

  async update(id, invoice) {
    return this.put(`/invoices/${id}`, invoice);
  }

  async delete(id) {
    // ⚠️ يجب استخدام super.delete() وليس this.delete()
    // لأن this.delete() ينادي نفس الدالة الحالية بدل دالة الأب (ApiClient)
    // مما يسبب استدعاءً متكررًا لا نهائيًا (Maximum call stack size exceeded)
    return super.delete(`/invoices/${id}`);
  }
}
