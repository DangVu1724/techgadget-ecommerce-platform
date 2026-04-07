// checkout.js - Main checkout logic
import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { showToast } from "/shared/ui/toast.js";
import { PENDING_QR_KEY, BUY_NOW_KEY } from "./constants.js";
import {
  loadCartData,
  renderOrderSummary,
  updateSummaryTotals,
  prefillUserInfo,
  getCartData,
} from "./cart.js";
import { setupVietnamAddressForm, isSelectedAddressValid } from "./address.js";
import {
  handleApplyCoupon,
  loadCheckoutCoupons,
  getAppliedCoupon,
} from "./coupon.js";

const checkoutMode =
  new URLSearchParams(window.location.search).get("mode") === "buy-now"
    ? "buy-now"
    : "cart";

const handleCheckoutSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById("checkout-form");
  const cityValue = document.getElementById("city-select")?.value || "";
  const wardValue = document.getElementById("ward-select")?.value || "";

  if (!cityValue) {
    showToast("Please choose a city.", "warning");
    document.getElementById("city-select")?.focus();
    return;
  }

  if (!wardValue) {
    showToast("Please choose a ward/commune.", "warning");
    document.getElementById("ward-select")?.focus();
    return;
  }

  if (!isSelectedAddressValid()) {
    showToast("Please select a valid address from the suggestions.", "warning");
    form?.reportValidity();
    return;
  }

  if (!form?.checkValidity()) {
    showToast("Please complete all required checkout fields.", "warning");
    return;
  }

  const formData = new FormData(form);
  const shippingAddress = document.getElementById("address")?.value?.trim();

  if (!shippingAddress) {
    showToast("Please complete your delivery address.", "warning");
    return;
  }

  const cartData = getCartData();
  const appliedCoupon = getAppliedCoupon();

  const orderRequest = {
    shippingAddress,
    phoneNumber: formData.get("phone"),
    orderEmail: formData.get("email"),
    paymentMethod: formData.get("paymentMethod"),
    items: cartData.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
    })),
    couponCode: appliedCoupon?.code || null,
  };

  if (orderRequest.paymentMethod === "QR") {
    await handleQrPayment(orderRequest);
    return;
  }

  await submitCheckout(orderRequest);
};

const submitCheckout = async (orderRequest) => {
  const submitBtn = document.querySelector(".btn-checkout-submit");
  const originalText = submitBtn?.textContent || "PLACE ORDER";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }

    const result =
      checkoutMode === "buy-now"
        ? await checkoutAPI.checkoutBuyNow(orderRequest)
        : await checkoutAPI.checkoutFromCart(orderRequest);
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem(BUY_NOW_KEY);
    window.dispatchEvent(new Event("cartUpdated", { bubbles: true }));

    showToast(
      "Order placed successfully. Thank you for shopping with us!",
      "success",
    );
    window.location.href = "/home";
  } catch (error) {
    console.error("Checkout failed:", error);
    showToast(error?.message || "Checkout failed. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

const handleQrPayment = async (orderRequest) => {
  const submitBtn = document.querySelector(".btn-checkout-submit");
  const originalText = submitBtn?.textContent || "PLACE ORDER";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Redirecting...";
    }

    const payment =
      checkoutMode === "buy-now"
        ? await checkoutAPI.checkoutBuyNow(orderRequest)
        : await checkoutAPI.checkoutFromCart(orderRequest);

    if (!payment?.paymentUrl || !payment?.transactionId) {
      throw new Error("Unable to initialize QR payment.");
    }

    localStorage.setItem(PENDING_QR_KEY, payment.transactionId);
    window.location.href = payment.paymentUrl;
  } catch (error) {
    console.error("QR payment failed:", error);
    showToast(error?.message || "Unable to initialize QR payment.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

// Back to top functionality
const backToTopBtn = document.getElementById("backToTop");

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
}

backToTopBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupVietnamAddressForm();
  loadCartData(checkoutMode, renderOrderSummary, prefillUserInfo, () =>
    loadCheckoutCoupons(getCartData()),
  );
  document
    .getElementById("checkout-form")
    ?.addEventListener("submit", handleCheckoutSubmit);
  document
    .getElementById("apply-coupon-btn")
    ?.addEventListener("click", () =>
      handleApplyCoupon(() => updateSummaryTotals(getAppliedCoupon())),
    );

  const couponToggle = document.getElementById("coupon-list-toggle");
  const couponList = document.getElementById("coupon-list");
  if (couponToggle && couponList) {
    couponToggle.addEventListener("click", () => {
      couponList.classList.toggle("is-collapsed");
      const expanded = !couponList.classList.contains("is-collapsed");
      couponToggle.classList.toggle("is-expanded", expanded);
      couponToggle.setAttribute("aria-expanded", String(expanded));
    });
  }
});
