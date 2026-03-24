import { request } from "./base.api.js";

export const orderAPI = {
  getMyOrders(params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/orders/me?${query.toString()}`);
  },
};
