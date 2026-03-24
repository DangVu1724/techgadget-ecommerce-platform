import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const userApi = {
  async getAll(options = {}) {
    const { search = "" } = options;
    
    try {
      let response;
      
      // If search term is provided, use search endpoint
      if (search && search.trim()) {
        response = await request(`/adminuser/search?email=${encodeURIComponent(search)}`);
      } else {
        // Otherwise, get all users
        response = await request(`/adminuser/user`);
      }
      
      return normalizeCollection(response);
    } catch (error) {
      console.error("Error in userApi.getAll:", error);
      throw error;
    }
  },

  async searchByEmail(email) {
    const response = await request(`/adminuser/search?email=${encodeURIComponent(email)}`);
    return normalizeCollection(response);
  },
};