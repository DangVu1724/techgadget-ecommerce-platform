// coupon.js - Coupon management for checkout
import { couponAPI } from "/modules/customer/core/api/coupon.api.js";
import { showToast } from "/shared/ui/toast.js";
import {
  escapeHtml,
  formatPrice,
  formatDateTime,
  calculateSubtotal,
} from "./utils.js";
import { getCartData } from "./cart.js";

let appliedCoupon = null;
let checkoutCoupons = [];

export const getAppliedCoupon = () => appliedCoupon;
export const setAppliedCoupon = (coupon) => {
  appliedCoupon = coupon;
};

export const handleApplyCoupon = async (updateSummaryTotals) => {
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

  const subtotal = calculateSubtotal(getCartData());
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

export const loadCheckoutCoupons = async (cartData) => {
  const list = document.getElementById("coupon-list");
  if (!list) return;

  try {
    const subtotal = calculateSubtotal(cartData);
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
        handleApplyCoupon(() => {});
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

// Event listeners for coupon modal
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVoucherModal();
  }
});

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
