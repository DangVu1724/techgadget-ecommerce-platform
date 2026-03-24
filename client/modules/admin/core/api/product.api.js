import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const productApi = {
  async getAll(params = {}) {
    const { page = 0, size = 10, search = "" } = params;

    if (search && search.trim()) {
      const query = new URLSearchParams({ page, size });
      return normalizeCollection(await request(`/products/search?name=${encodeURIComponent(search)}&${query.toString()}`));
    }

    const query = new URLSearchParams({ page, size });
    return normalizeCollection(await request(`/products?${query.toString()}`));
  },

  getById(id) {
    return request(`/products/${id}`);
  },

  create(data) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  getTopSelling(limit = 5) {
    return request(`/products/top-selling?limit=${limit}`);
  },

  getNewest(limit = 5) {
    return request(`/products/newest?limit=${limit}`);
  },
};
