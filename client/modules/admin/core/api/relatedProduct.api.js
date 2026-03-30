import { request } from "./base.api.js";

export const relatedProductApi = {
  getByProduct(productId) {
    return request(`/admin/related-products/${productId}`);
  },

  add(payload) {
    return request("/admin/related-products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  remove(id) {
    return request(`/admin/related-products/${id}`, {
      method: "DELETE",
    });
  },
};
