import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const categoryApi = {
  async getAll() {
    return normalizeCollection(await request("/category"));
  },

  getById(id) {
    return request(`/category/${id}/attributes`);
  },

  create(data) {
    return request("/category", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/category/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/category/${id}`, {
      method: "DELETE",
    });
  },
};
