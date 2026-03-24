import { request } from "./base.api.js";

export const checkoutAPI = {
  checkoutFromCart(orderRequest) {
    return request("/orders/checkout/cart", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    });
  },

  checkoutBuyNow(orderRequest) {
    return request("/orders/checkout/buynow", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    });
  },

  getOrder(orderId) {
    return request(`/orders/${orderId}`);
  },

  createPayOSPayment(paymentData) {
    return request("/payments/payos", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  checkPayOSStatus(transactionId) {
    return request(`/payments/payos/${transactionId}`);
  },
};
