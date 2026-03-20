import { request } from "./base.api.js";

export const cartAPI = {
  getCart() {
    return request("/cart");
  },

  addToCart(variantId, quantity) {
    return request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    });
  },

  updateQuantity(variantId, quantity) {
    return request("/cart/items", {
      method: "PUT",
      body: JSON.stringify({ variantId, quantity }),
    });
  },

  removeItem(cartItemId) {
    return request(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  },
};
