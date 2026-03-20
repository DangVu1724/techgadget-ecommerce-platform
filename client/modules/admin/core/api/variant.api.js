import { request } from "./base.api.js";

export const variantApi = {
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
