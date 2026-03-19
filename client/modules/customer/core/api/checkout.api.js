import { request } from "./base.api.js";

export const checkoutAPI = {
  checkoutFromCart: (orderRequest) =>
    request("/orders/checkout/cart", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    }),

  checkoutBuyNow: (orderRequest) =>
    request("/orders/checkout/buynow", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    }),


  getOrder: (orderId) => request(`/orders/${orderId}`),


  createPayOSPayment: (paymentData) =>
    request("/payments/payos", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),

  checkPayOSStatus: (transactionId) =>
    request(`/payments/payos/${transactionId}`),
};
