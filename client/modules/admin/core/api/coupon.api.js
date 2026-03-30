import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const couponApi = {
  async getAll(options = {}) {
    const { search = "" } = options;

    try {
      let response;

      if (search && search.trim()) {
        response = await request(
          `/admin/coupons/search?code=${encodeURIComponent(search)}`,
        );
      } else {
        response = await request("/admin/coupons");
      }

      return normalizeCollection(response);
    } catch (error) {
      console.error("Error in couponApi.getAll:", error);
      throw error;
    }
  },

  getById(id) {
    return request(`/admin/coupons/${id}`);
  },

  create(data) {
    return request("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/admin/coupons/${id}`, {
      method: "DELETE",
    });
  },
};
