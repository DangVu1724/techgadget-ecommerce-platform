import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { couponAPI } from "/modules/customer/core/api/coupon.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import { showToast } from "/shared/ui/toast.js";

let cartData = null;
let appliedCoupon = null;
let checkoutCoupons = [];
const PENDING_QR_KEY = "pendingQrTransactionId";
const BUY_NOW_KEY = "buyNowCheckoutItem";
const checkoutMode =
  new URLSearchParams(window.location.search).get("mode") === "buy-now" ? "buy-now" : "cart";

const loadCartData = async () => {
  if (checkoutMode === "buy-now") {
    loadBuyNowData();
    return;
  }

  if (!authAPI.isLoggedIn()) {
    await showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  try {
    const data = await cartAPI.getCart();
    cartData = data;

    if (data.items?.length) {
      cartData.items = await Promise.all(
        data.items.map(async (item) => {
          try {
            const variant = await variantAPI.getVariant(item.variantId);
            return { ...item, variant };
          } catch (error) {
            console.warn(`Failed to load variant ${item.variantId}:`, error);
            return item;
          }
        }),
      );
    }

    renderOrderSummary();
    prefillUserInfo();
    loadCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load checkout cart:", error);
    showToast("Unable to load checkout data.", "error");
    window.location.href = "/cart";
  }
};

const loadBuyNowData = () => {
  const rawItem = sessionStorage.getItem(BUY_NOW_KEY);
  if (!rawItem) {
    showToast("No Buy Now item found.", "warning");
    window.location.href = "/home";
    return;
  }

  try {
    const item = JSON.parse(rawItem);
    cartData = {
      mode: "buy-now",
      items: [
        {
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          variantName: item.variantName,
          image: item.image,
        },
      ],
    };

    renderOrderSummary();
    prefillUserInfo(item);
    loadCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load Buy Now checkout:", error);
    showToast("Unable to load Buy Now checkout.", "error");
    sessionStorage.removeItem(BUY_NOW_KEY);
    window.location.href = "/home";
  }
};

const renderOrderSummary = () => {
  const container = document.getElementById("order-items-container");

  if (!cartData?.items?.length) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #999;">
        <p>Your cart is empty.</p>
      </div>
    `;
    updateSummaryTotals(0);
    return;
  }

  container.innerHTML = cartData.items
    .map((item) => `
      <div class="summary-item">
        <span class="item-name">${item.productName}${item.variantName ? ` - ${item.variantName}` : ""}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
      </div>
    `)
    .join("");

  updateSummaryTotals();
};

const calculateSubtotal = () =>
  cartData?.items?.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  ) || 0;

const calculateShipping = (subtotal) => (subtotal > 99 ? 0 : 10);

const updateSummaryTotals = () => {
  const subtotal = calculateSubtotal();
  const shippingCost = calculateShipping(subtotal);
  const discountAmount = appliedCoupon?.discountAmount ? Number(appliedCoupon.discountAmount) : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const total = discountedSubtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-shipping").textContent =
    shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`;

  const discountRow = document.getElementById("summary-discount-row");
  const discountValue = document.getElementById("summary-discount");
  if (discountRow && discountValue) {
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      discountValue.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      discountRow.style.display = "none";
      discountValue.textContent = "-$0.00";
    }
  }

  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
};

const prefillUserInfo = (overrideUser = null) => {
  const user = overrideUser || authAPI.getUser();
  if (!user) {
    return;
  }

  if (user.fullName) document.getElementById("fullName").value = user.fullName;
  if (user.email) document.getElementById("email").value = user.email;
  if (user.phone) document.getElementById("phone").value = user.phone;
  if (user.address) document.getElementById("address").value = user.address;
};

const handleCheckoutSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById("checkout-form");
  if (!form?.checkValidity()) {
    showToast("Please complete all required checkout fields.", "warning");
    return;
  }

  const formData = new FormData(form);
  const orderRequest = {
    shippingAddress: formData.get("address"),
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

    showToast("Order placed successfully.", "success");
    window.location.href = result?.id ? "/home" : "/home";
  } catch (error) {
    console.error("Checkout failed:", error);
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
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

const handleApplyCoupon = async () => {
  const input = document.getElementById("coupon-code");
  const message = document.getElementById("coupon-message");
  const code = input?.value?.trim() || "";

  if (!code) {
    appliedCoupon = null;
    updateSummaryTotals();
    if (message) {
      message.textContent = "Please enter a coupon code.";
      message.style.color = "#d9534f";
    }
    return;
  }

  const subtotal = calculateSubtotal();
  if (subtotal <= 0) {
    if (message) {
      message.textContent = "Your cart is empty.";
      message.style.color = "#d9534f";
    }
    return;
  }

  try {
    const result = await couponAPI.validate(code, subtotal);
    appliedCoupon = {
      code: result.code,
      discountAmount: Number(result.discountAmount || 0),
    };

    updateSummaryTotals();
    if (message) {
      message.textContent = `Applied coupon ${result.code}.`;
      message.style.color = "#28a745";
    }
  } catch (error) {
    appliedCoupon = null;
    updateSummaryTotals();
    if (message) {
      message.textContent = error?.message || "Unable to apply coupon.";
      message.style.color = "#d9534f";
    }
  }
};

const loadCheckoutCoupons = async () => {
  const list = document.getElementById("coupon-list");
  if (!list) return;

  try {
    const subtotal = calculateSubtotal();
    checkoutCoupons = await couponAPI.getCheckoutList(subtotal);
    renderCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load coupons:", error);
    list.innerHTML = "";
  }
};

const renderCheckoutCoupons = () => {
  const list = document.getElementById("coupon-list");
  if (!list) return;

  if (!checkoutCoupons?.length) {
    list.innerHTML = "<p class=\"coupon-empty\">No coupons available.</p>";
    return;
  }

  const visibleCoupons = checkoutCoupons.filter((coupon) => coupon?.isActive !== false);

  if (!visibleCoupons.length) {
    list.innerHTML = "<p class=\"coupon-empty\">No coupons available.</p>";
    return;
  }

  const sortedCoupons = [...visibleCoupons].sort((a, b) => {
    const aValid = a?.valid ? 1 : 0;
    const bValid = b?.valid ? 1 : 0;
    return bValid - aValid;
  });

  list.innerHTML = sortedCoupons
    .map((coupon) => renderCouponCard(coupon))
    .join("");

  list.querySelectorAll("[data-coupon-apply]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      const input = document.getElementById("coupon-code");
      if (input && code) {
        input.value = code;
        handleApplyCoupon();
      }
    });
  });

  list.querySelectorAll("[data-coupon-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.closest("[data-coupon-apply]")) {
        return;
      }
      const details = card.querySelector("[data-coupon-details]");
      if (!details) return;
      details.style.display = details.style.display === "none" ? "block" : "none";
    });
  });
};

const formatCouponSummary = (coupon) => {
  if (coupon.type === "PERCENT") {
    return `${Number(coupon.value)}% off`;
  }
  const fixed = Number(coupon.value || 0).toFixed(2);
  return `$${fixed} off`;
};

const renderCouponCard = (coupon) => {
  const isValid = Boolean(coupon.valid);
  const statusText = isValid ? "Available" : coupon.invalidReason || "Not available";
  const statusColor = isValid ? "#16a34a" : "#dc2626";
  const btnDisabled = isValid ? "" : "disabled";
  const btnText = "Apply";
  const remainingUses = getRemainingUses(coupon);

  return `
    <div data-coupon-card="1" class="coupon-card ${isValid ? "" : "coupon-card--disabled"}">
      <div class="coupon-card__head">
        <div>
          <div class="coupon-card__code">${coupon.code}</div>
          <div class="coupon-card__meta">${formatCouponSummary(coupon)}</div>
        </div>
        <span class="coupon-card__status" style="color: ${statusColor};">${statusText}</span>
      </div>
      <div data-coupon-details="1" class="coupon-card__details">
        ${renderCouponDetails(coupon, remainingUses)}
      </div>
      <div class="coupon-card__actions">
        <button type="button" data-coupon-apply="1" data-code="${coupon.code}" class="coupon-card__btn" ${btnDisabled}>
          ${btnText}
        </button>
      </div>
    </div>
  `;
};

const renderCouponDetails = (coupon, remainingUses) => {
  const lines = [];
  if (coupon.minOrderAmount) {
    lines.push(`Min order: ${formatUsd(coupon.minOrderAmount)}`);
  }
  if (coupon.maxDiscountAmount) {
    lines.push(`Max discount: ${formatUsd(coupon.maxDiscountAmount)}`);
  }
  const endDate = coupon.endAt ? formatDateTime(coupon.endAt) : null;
  if (endDate) {
    lines.push(`Valid until: ${endDate}`);
  }
  if (remainingUses !== null) {
    if (Number(remainingUses) <= 0) {
      lines.push("You have no remaining uses for this voucher");
    } else {
      lines.push(`Your remaining uses: ${remainingUses}`);
    }
  }
  if (!lines.length) {
    return "No additional conditions.";
  }
  return lines.map((line) => `<div>${line}</div>`).join("");
};

const formatDateRange = (startAt, endAt) => {
  if (!startAt && !endAt) return null;
  const start = startAt ? formatDateOnly(startAt) : "";
  const end = endAt ? formatDateOnly(endAt) : "";
  if (start && end) return `${start} - ${end}`;
  return start || end;
};

const formatDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${time} ${formatDateOnly(date)}`;
};

const getRemainingUses = (coupon) => {
  if (coupon.userRemainingUses !== null && coupon.userRemainingUses !== undefined) {
    return coupon.userRemainingUses;
  }
  if (
    coupon.usageLimitPerUser !== null &&
    coupon.usageLimitPerUser !== undefined &&
    coupon.userUsedCount !== null &&
    coupon.userUsedCount !== undefined
  ) {
    return Math.max(Number(coupon.usageLimitPerUser) - Number(coupon.userUsedCount), 0);
  }
  return null;
};

const formatUsd = (value) => {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
};

document.addEventListener("DOMContentLoaded", () => {
  loadCartData();
  document.getElementById("checkout-form")?.addEventListener("submit", handleCheckoutSubmit);
  document.getElementById("apply-coupon-btn")?.addEventListener("click", handleApplyCoupon);
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
