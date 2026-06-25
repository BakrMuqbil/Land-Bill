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
    return this.delete(`/invoices/${id}`);
  }
}
