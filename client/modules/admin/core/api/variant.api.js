import { request } from "./base.api.js";

export const variantApi = {
  getById(id) {
    return request(`/variants/${id}`);
  },

  createVariant(data) {
    return request("/variants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateVariant(id, data) {
    return request(`/variants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteVariant(id) {
    return request(`/variants/${id}`, {
      method: "DELETE",
    });
  },
};
