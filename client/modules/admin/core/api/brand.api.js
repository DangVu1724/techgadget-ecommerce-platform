import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const brandApi = {
  async getAll() {
    return normalizeCollection(await request("/brands"));
  },

  getById(id) {
    return request(`/brands/${id}`);
  },

  create(data) {
    return request("/brands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/brands/${id}`, {
      method: "DELETE",
    });
  },
};
