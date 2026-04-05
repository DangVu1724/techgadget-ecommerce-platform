import { request } from "./base.api.js";

export const reviewAPI = {
  getByProduct(productId, rating = null) {
    const query = rating ? `?rating=${rating}` : "";
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
