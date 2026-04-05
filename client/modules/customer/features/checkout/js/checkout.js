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
  new URLSearchParams(window.location.search).get("mode") === "buy-now"
    ? "buy-now"
    : "cart";

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
        <i class="fa-solid fa-shopping-cart" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
        <p>Your cart is empty.</p>
        <a href="/shop" style="color: #ff6b6b; text-decoration: none;">Continue Shopping →</a>
      </div>
    `;
    updateSummaryTotals(0);
    return;
  }

  container.innerHTML = cartData.items
    .map(
      (item) => `
      <div class="summary-item">
        <span class="item-name">${escapeHtml(item.productName)}${item.variantName ? ` - ${escapeHtml(item.variantName)}` : ""}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${formatPrice(parseFloat(item.price) * item.quantity)}</span>
      </div>
    `,
    )
    .join("");

  updateSummaryTotals();
};

const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
  const discountAmount = appliedCoupon?.discountAmount
    ? Number(appliedCoupon.discountAmount)
    : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const total = discountedSubtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("summary-shipping").textContent = 
    shippingCost === 0 ? "FREE" : formatPrice(shippingCost);

  const discountRow = document.getElementById("summary-discount-row");
  const discountValue = document.getElementById("summary-discount");
  if (discountRow && discountValue) {
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      discountValue.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  document.getElementById("summary-total").textContent = formatPrice(total);
};

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
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
      message.textContent = "Your cart is empty. Add items to apply coupon.";
      message.style.color = "#d9534f";
    }
    return;
  }

  try {
    const result = await couponAPI.validate(code, subtotal);
    appliedCoupon = {
      code: result.code,
      discountAmount: Number(result.discountAmount || 0),
      type: result.type,
      value: result.value,
    };

    updateSummaryTotals();
    if (message) {
      const discountText =
        appliedCoupon.type === "PERCENT"
          ? `${appliedCoupon.value}%`
          : `$${appliedCoupon.discountAmount.toFixed(2)}`;
      message.innerHTML = `<i class="fa-solid fa-check-circle"></i> Coupon "${result.code}" applied! You saved ${discountText}.`;
      message.style.color = "#28a745";
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      if (message && message.innerHTML.includes("applied")) {
        message.innerHTML = "";
      }
    }, 3000);
  } catch (error) {
    appliedCoupon = null;
    updateSummaryTotals();
    if (message) {
      message.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${error?.message || "Unable to apply coupon. Please check the code and try again."}`;
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
    list.innerHTML = "";
    return;
  }

  const visibleCoupons = checkoutCoupons.filter(
    (coupon) => coupon?.isActive !== false,
  );

  if (!visibleCoupons.length) {
    list.innerHTML = "";
    return;
  }

  // Add "View Vouchers" button instead of displaying all coupons
  list.innerHTML = `
    <button type="button" id="view-vouchers-btn" class="view-vouchers-btn">
      <i class="fa-solid fa-ticket"></i>
      View Available Vouchers (${visibleCoupons.length})
    </button>
  `;

  const viewBtn = document.getElementById("view-vouchers-btn");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      showVoucherModal(visibleCoupons);
    });
  }
};

const showVoucherModal = (coupons) => {
  const modal = document.getElementById("voucher-modal");
  const modalBody = document.getElementById("voucher-modal-body");

  if (!modal || !modalBody) return;

  // Sort coupons: valid ones first
  const sortedCoupons = [...coupons].sort((a, b) => {
    const aValid = a?.valid ? 1 : 0;
    const bValid = b?.valid ? 1 : 0;
    return bValid - aValid;
  });

  modalBody.innerHTML = sortedCoupons
    .map((coupon) => renderModalCouponCard(coupon))
    .join("");

  // Add event listeners for apply buttons in modal
  modalBody.querySelectorAll("[data-coupon-apply]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = btn.getAttribute("data-code");
      const input = document.getElementById("coupon-code");
      if (input && code) {
        input.value = code;
        handleApplyCoupon();
        closeVoucherModal();
        showToast(`Applied coupon ${code} successfully!`, "success");
      }
    });
  });

  // Add click handlers for coupon cards to show details
  modalBody.querySelectorAll("[data-coupon-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const target = event.target;
      if (
        target &&
        (target.closest("[data-coupon-apply]") ||
          target.closest(".coupon-card__btn"))
      ) {
        return;
      }
      const details = card.querySelector("[data-coupon-details]");
      if (!details) return;
      const isVisible = details.style.display === "block";
      details.style.display = isVisible ? "none" : "block";
    });
  });

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Close modal when clicking overlay or close button
  const overlay = modal.querySelector(".voucher-modal-overlay");
  const closeBtn = modal.querySelector("#voucher-modal-close");

  const closeModal = () => {
    closeVoucherModal();
  };

  overlay?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);
};

const closeVoucherModal = () => {
  const modal = document.getElementById("voucher-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
};

const renderModalCouponCard = (coupon) => {
  const isValid = Boolean(coupon.valid);
  const statusText = isValid
    ? "✓ Available"
    : "✗ " + (coupon.invalidReason || "Not available");
  const statusColor = isValid ? "#16a34a" : "#dc2626";
  const btnDisabled = isValid ? "" : "disabled";
  const btnText = isValid ? "Apply Now" : "Not Available";
  const remainingUses = getRemainingUses(coupon);

  // Format discount text
  // Sửa phần format discountText
let discountText = "";
if (coupon.type === "PERCENT") {
  discountText = `Reduce ${Number(coupon.value)}%`;
} else {
  discountText = `Reduce ${formatPrice(coupon.value)}`;
}
  return `
    <div data-coupon-card="1" class="coupon-card ${isValid ? "" : "coupon-card--disabled"}">
      <div class="coupon-card__head">
        <div>
          <div class="coupon-card__code">${escapeHtml(coupon.code)}</div>
          <div class="coupon-card__meta">${discountText}</div>
        </div>
        <span class="coupon-card__status" style="color: ${statusColor}; background: ${isValid ? "#e8f5e9" : "#ffebee"}">
          ${statusText}
        </span>
      </div>
      <div data-coupon-details="1" class="coupon-card__details" style="display: none;">
        ${renderModalCouponDetails(coupon, remainingUses)}
      </div>
      <div class="coupon-card__actions">
        <button type="button" data-coupon-apply="1" data-code="${coupon.code}" class="coupon-card__btn" ${btnDisabled}>
          ${btnText}
        </button>
      </div>
    </div>
  `;
};

const renderModalCouponDetails = (coupon, remainingUses) => {
  const lines = [];

  // Discount details
  if (coupon.type === "PERCENT") {
    lines.push(`🎯 ${coupon.value}% discount on your order`);
  } else {
    lines.push(`💰 Save $${Number(coupon.value).toFixed(2)} on your order`);
  }

  // Min order requirement
  // Sửa các dòng hiển thị điều kiện
  if (coupon.minOrderAmount > 0) {
    lines.push(`📦 Minimum order: ${formatPrice(coupon.minOrderAmount)}`);
  }
  if (coupon.maxDiscountAmount > 0) {
    lines.push(`🏷️ Maximum discount: ${formatPrice(coupon.maxDiscountAmount)}`);
  }
  // Valid until
  const endDate = coupon.endAt ? formatDateTime(coupon.endAt) : null;
  if (endDate) {
    lines.push(`⏰ Valid until: ${endDate}`);
  }

  // Usage limit
  if (remainingUses !== null) {
    if (Number(remainingUses) <= 0) {
      lines.push(`⚠️ You have no remaining uses for this voucher`);
    } else {
      lines.push(`✨ You have ${remainingUses} use(s) remaining`);
    }
  }

  if (!lines.length) {
    return "<div>No additional conditions.</div>";
  }

  return lines.map((line) => `<div>${line}</div>`).join("");
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
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${formatDateOnly(date)}`;
};

const getRemainingUses = (coupon) => {
  if (
    coupon.userRemainingUses !== null &&
    coupon.userRemainingUses !== undefined
  ) {
    return coupon.userRemainingUses;
  }
  if (
    coupon.usageLimitPerUser !== null &&
    coupon.usageLimitPerUser !== undefined &&
    coupon.userUsedCount !== null &&
    coupon.userUsedCount !== undefined
  ) {
    return Math.max(
      Number(coupon.usageLimitPerUser) - Number(coupon.userUsedCount),
      0,
    );
  }
  return null;
};

const formatUsd = (value) => {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
};

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVoucherModal();
  }
});

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  const modal = document.getElementById("voucher-modal");
  if (modal && modal.style.display === "flex") {
    const container = modal.querySelector(".voucher-modal-container");
    if (
      container &&
      !container.contains(event.target) &&
      !event.target.closest("#view-vouchers-btn")
    ) {
      closeVoucherModal();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadCartData();
  document
    .getElementById("checkout-form")
    ?.addEventListener("submit", handleCheckoutSubmit);
  document
    .getElementById("apply-coupon-btn")
    ?.addEventListener("click", handleApplyCoupon);

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

// Lấy thẻ button
const backToTopBtn = document.getElementById("backToTop");

// Theo dõi sự kiện cuộn chuột
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  // Nếu cuộn xuống quá 300px thì hiện nút, ngược lại thì ẩn
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
}

// Khi người dùng nhấn vào nút
backToTopBtn.onclick = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Cuộn mượt mà
  });
};
