import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const brandApi = {
  async getAll(options = {}) {
    const { search = "" } = options;
    
    try {
      let response;
      
      if (search && search.trim()) {
        response = await request(`/brands/search?name=${encodeURIComponent(search)}`);
      } else {
        response = await request("/brands");
      }
      
      return normalizeCollection(response);
    } catch (error) {
      console.error("Error in brandApi.getAll:", error);
      throw error;
    }
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
