import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const orderApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
    });

    return normalizeCollection(await request(`/orders?${query.toString()}`));
  },

  async getByStatus(params = {}) {
    const query = new URLSearchParams({
      status: params.status || "PENDING",
      page: params.page ?? 0,
      size: params.size ?? 10,
    });

    return normalizeCollection(await request(`/orders/status?${query.toString()}`));
  },

  getById(id) {
    return request(`/orders/${id}`);
  },

  updateStatus(id, status) {
    return request(`/orders/${id}/status?status=${status}`, {
      method: "PUT",
    });
  },
};
