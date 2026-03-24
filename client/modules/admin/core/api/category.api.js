import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const categoryApi = {
  async getAll(options = {}) {
    const { search = "" } = options;
    
    try {
      let response;
      
      if (search && search.trim()) {
        response = await request(`/category/search?name=${encodeURIComponent(search)}`);
      } else {
        response = await request("/category");
      }
      
      return normalizeCollection(response);
    } catch (error) {
      console.error("Error in categoryApi.getAll:", error);
      throw error;
    }
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
