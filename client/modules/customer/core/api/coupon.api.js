import { request } from "./base.api.js";

export const couponAPI = {
  getActive() {
    return request("/coupons/active");
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
