import { request } from "./base.api.js";

export const checkoutAPI = {
  /**
   * Đặt hàng từ giỏ hàng
   * Endpoint: POST /api/checkout/cart
   * @param {Object} orderRequest - Thông tin đặt hàng
   * @returns {Promise<Object>} Kết quả tạo đơn hàng
   */
  checkoutFromCart: (orderRequest) =>
    request("/orders/checkout/cart", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    }),

  /**
   * Đặt hàng mua ngay
   * Endpoint: POST /api/checkout/buynow
   * @param {Object} orderRequest - Thông tin đặt hàng
   * @returns {Promise<Object>} Kết quả tạo đơn hàng
   */
  checkoutBuyNow: (orderRequest) =>
    request("/orders/checkout/buynow", {
      method: "POST",
      body: JSON.stringify(orderRequest),
    }),

  /**
   * Lấy thông tin đơn hàng
   * @param {number} orderId - ID của đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng
   */
  getOrder: (orderId) => request(`/orders/${orderId}`),

  /**
   * Xử lý thanh toán bằng PayOS
   * @param {Object} paymentData - Thông tin thanh toán
   * @returns {Promise<Object>} Kết quả thanh toán
   */
  createPayOSPayment: (paymentData) =>
    request("/payments/payos", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),

  /**
   * Kiểm tra trạng thái thanh toán PayOS
   * @param {string} transactionId - ID giao dịch
   * @returns {Promise<Object>} Trạng thái thanh toán
   */
  checkPayOSStatus: (transactionId) =>
    request(`/payments/payos/${transactionId}`),
};
