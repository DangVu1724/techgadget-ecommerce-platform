import { request } from "./base.api.js";

export const cartAPI = {
  getCart: () => request("/cart"),

  addToCart: (variantId, quantity) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    }),

  updateQuantity: (variantId, quantity) =>
    request("/cart/items", {
      method: "PUT",
      body: JSON.stringify({ variantId, quantity }),
    }),

  removeItem: (cartItemId) =>
    request(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    }),
};