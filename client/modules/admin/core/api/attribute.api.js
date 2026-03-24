import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const attributeApi = {
  async getAll(options = {}) {
    const { search = "" } = options;

    if (search && search.trim()) {
      return normalizeCollection(await request(`/attributes/search?name=${encodeURIComponent(search)}`));
    }

    return normalizeCollection(await request("/attributes"));
  },

  getById(id) {
    return request(`/attributes/${id}`);
  },

  create(data) {
    return request("/attributes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/attributes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/attributes/${id}`, {
      method: "DELETE",
    });
  },
};
