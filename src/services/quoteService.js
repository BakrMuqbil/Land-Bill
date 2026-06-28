import { ApiClient } from './apiClient';

export class QuoteService extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
  }

  async getAll() {
    return this.get('/quotes');
  }

  async create(quote) {
    return this.post('/quotes', quote);
  }

  async update(id, quote) {
    return this.put(`/quotes/${id}`, quote);
  }

  async delete(id) {
    // ⚠️ super.delete() وليس this.delete() لتجنب الاستدعاء المتكرر اللانهائي
    return super.delete(`/quotes/${id}`);
  }

  async approve(id) {
    return this.put(`/quotes/${id}/approve`);
  }

  async unapprove(id) {
    return this.put(`/quotes/${id}/unapprove`);
  }
}
