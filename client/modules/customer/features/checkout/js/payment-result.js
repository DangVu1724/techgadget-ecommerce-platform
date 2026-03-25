import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { showToast } from "/shared/ui/toast.js";

const PENDING_QR_KEY = "pendingQrTransactionId";
const BUY_NOW_KEY = "buyNowCheckoutItem";
const PAGE_MODE = document.body.dataset.paymentPage || "success";

const resultBadge = document.getElementById("result-badge");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const transactionIdEl = document.getElementById("transaction-id");
const paymentStatusEl = document.getElementById("payment-status");
const orderIdEl = document.getElementById("order-id");

const setState = ({ tone, badge, title, message, transactionId, paymentStatus, orderId }) => {
  resultBadge.className = `payment-result-badge ${tone}`;
  resultBadge.textContent = badge;
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  transactionIdEl.textContent = transactionId || "-";
  paymentStatusEl.textContent = paymentStatus || "-";
  orderIdEl.textContent = orderId || "-";
};

const clearPendingPayment = () => {
  localStorage.removeItem(PENDING_QR_KEY);
  sessionStorage.removeItem(BUY_NOW_KEY);
  sessionStorage.removeItem("cart");
  window.dispatchEvent(new Event("cartUpdated", { bubbles: true }));
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const syncPayment = async (transactionId) => {
  const attempts = PAGE_MODE === "success" ? 4 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const payment = await checkoutAPI.checkQrStatus(transactionId);

    if (payment?.paymentStatus === "PAID" && payment?.orderId) {
      clearPendingPayment();
      setState({
        tone: "success",
        badge: "OK",
        title: "Payment successful",
        message: "Your payment has been confirmed and your order was created successfully.",
        transactionId: payment.transactionId,
        paymentStatus: payment.paymentStatus,
        orderId: payment.orderId,
      });
      showToast("Payment confirmed successfully.", "success");
      return;
    }

    if (["CANCELLED", "FAILED", "EXPIRED"].includes(payment?.paymentStatus)) {
      localStorage.removeItem(PENDING_QR_KEY);
      setState({
        tone: "failed",
        badge: "!",
        title: "Payment not completed",
        message: "The payment did not complete. Reserved stock was released on the server.",
        transactionId: payment.transactionId,
        paymentStatus: payment.paymentStatus,
        orderId: payment.orderId,
      });
      return;
    }

    if (attempt < attempts - 1) {
      await wait(1500);
    }
  }

  setState({
    tone: "pending",
    badge: "...",
    title: "Payment is still processing",
    message: "We have not received a final QR payment result yet. Please refresh this page in a moment.",
    transactionId,
    paymentStatus: "PENDING",
    orderId: "-",
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const transactionId = localStorage.getItem(PENDING_QR_KEY);

  if (!transactionId) {
    setState({
      tone: "failed",
      badge: "!",
      title: "Missing payment session",
      message: "No QR payment transaction was found in this browser session.",
      transactionId: "-",
      paymentStatus: "UNKNOWN",
      orderId: "-",
    });
    return;
  }

  try {
    setState({
      tone: "pending",
      badge: "...",
      title: PAGE_MODE === "cancel" ? "Checking cancelled payment" : "Checking payment",
      message:
        PAGE_MODE === "cancel"
          ? "We are checking whether the payment was cancelled or completed before leaving the QR payment page."
          : "We are verifying your payment and creating your order.",
      transactionId,
      paymentStatus: "PENDING",
      orderId: "-",
    });

    await syncPayment(transactionId);
  } catch (error) {
    console.error("Failed to sync QR payment:", error);
    setState({
      tone: "failed",
      badge: "!",
      title: "Unable to verify payment",
      message: "The payment status could not be checked right now. Please try again shortly.",
      transactionId,
      paymentStatus: "ERROR",
      orderId: "-",
    });
  }
});
