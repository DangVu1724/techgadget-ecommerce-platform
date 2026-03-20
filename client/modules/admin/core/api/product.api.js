import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const productApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
    });

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
