import { ApiClient } from './apiClient';

export class ProductService extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
  }

  async getAll() {
    return this.get('/products');
  }

  async create(product) {
    return this.post('/products', product);
  }

  async update(id, product) {
    return this.put(`/products/${id}`, product);
  }

  async delete(id) {
    return this.delete(`/products/${id}`);
  }
}
