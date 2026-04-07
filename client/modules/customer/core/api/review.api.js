import { request } from "./base.api.js";

export const reviewAPI = {
  getByProduct(productId, { rating = null, page = 0, size = 5 } = {}) {
    const params = new URLSearchParams();
    if (rating) params.set("rating", String(rating));
    params.set("page", String(page));
    params.set("size", String(size));
    const query = `?${params.toString()}`;
    return request(`/reviews/${productId}${query}`);
  },

  create(data) {
    return request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(reviewId, data) {
    return request(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(reviewId) {
    return request(`/reviews/${reviewId}`, { method: "DELETE" });
  },
};
