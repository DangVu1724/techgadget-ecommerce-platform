import { request } from "./base.api.js";

export const orderApi = {
  getMyOrders(params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/orders/me?${query.toString()}`);
  },

  getOrderById(orderId) {
    return request(`/orders/${orderId}`);
  },

  getOrdersByStatus(status, params = {}) {
    const query = new URLSearchParams({
      status: status,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/orders/me/status?${query.toString()}`);
  },

  cancelOrder(orderId, reason) {
    return request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  trackOrder(orderId) {
    return request(`/orders/${orderId}/track`);
  }
};
