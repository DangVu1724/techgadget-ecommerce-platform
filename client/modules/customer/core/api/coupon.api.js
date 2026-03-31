import { request } from "./base.api.js";

export const couponAPI = {
  getCheckoutList(orderAmount) {
    const params = new URLSearchParams();
    if (orderAmount !== undefined && orderAmount !== null) {
      params.set("orderAmount", String(orderAmount));
    }
    return request(`/coupons/checkout?${params.toString()}`);
  },

  validate(code, orderAmount) {
    return request("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code,
        orderAmount,
      }),
    });
  },
};
