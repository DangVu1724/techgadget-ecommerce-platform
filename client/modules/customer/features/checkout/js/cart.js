// cart.js - Cart management for checkout
import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import { showToast } from "/shared/ui/toast.js";
import {
  escapeHtml,
  formatPrice,
  calculateSubtotal,
  calculateShipping,
  getShippingRule,
} from "./utils.js";
import { BUY_NOW_KEY } from "./constants.js";
import { getSelectedCity, getSelectedWardMeta } from "./address.js";

let cartData = null;

const normalizeCheckoutItem = (item) => {
  const variantName =
    item.variantName ||
    item.variant?.name ||
    buildVariantNameFromAttributes(item.variant?.attributes);
  const productName =
    item.productName || item.variant?.product?.name || "Unknown Product";

  return {
    ...item,
    productName,
    variantName,
    price: Number(item.price || item.variant?.price || 0),
  };
};

const buildVariantNameFromAttributes = (attributes = {}) => {
  const values = Object.values(attributes || {}).filter(Boolean);
  return values.length ? values.join(" - ") : "";
};

export const getCartData = () => cartData;
export const setCartData = (data) => {
  cartData = data;
};

export const loadCartData = async (
  checkoutMode,
  renderOrderSummary,
  prefillUserInfo,
  loadCheckoutCoupons,
) => {
  if (checkoutMode === "buy-now") {
    loadBuyNowData(renderOrderSummary, prefillUserInfo, loadCheckoutCoupons);
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
            return normalizeCheckoutItem({ ...item, variant });
          } catch (error) {
            console.warn(`Failed to load variant ${item.variantId}:`, error);
            return normalizeCheckoutItem(item);
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

export const loadBuyNowData = (
  renderOrderSummary,
  prefillUserInfo,
  loadCheckoutCoupons,
) => {
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
        normalizeCheckoutItem({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          variantName: item.variantName,
          image: item.image,
        }),
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

export const renderOrderSummary = () => {
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
        <span class="item-name">${escapeHtml(item.productName || "Unknown Product")}${item.variantName ? ` - ${escapeHtml(item.variantName)}` : ""}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</span>
      </div>
    `,
    )
    .join("");

  updateSummaryTotals();
};

export const updateSummaryTotals = (appliedCoupon) => {
  const subtotal = calculateSubtotal(cartData);
  const selectedCity = getSelectedCity();
  const selectedWardMeta = getSelectedWardMeta();
  const shippingRule = getShippingRule(selectedCity, selectedWardMeta);
  const shippingCost = calculateShipping(selectedCity, selectedWardMeta);
  const discountAmount = appliedCoupon?.discountAmount
    ? Number(appliedCoupon.discountAmount)
    : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const total = discountedSubtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent =
    formatPrice(subtotal);
  document.getElementById("summary-shipping").textContent =
    `${formatPrice(shippingCost)} (${shippingRule.label})`;

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

export const prefillUserInfo = (overrideUser = null) => {
  const user = overrideUser || authAPI.getUser();
  if (!user) {
    return;
  }

  if (user.fullName) document.getElementById("fullName").value = user.fullName;
  if (user.email) document.getElementById("email").value = user.email;
  if (user.phone) document.getElementById("phone").value = user.phone;
  if (user.address) {
    document.getElementById("address-line").value = user.address;
    document.getElementById("address").value = user.address;
  }
};
