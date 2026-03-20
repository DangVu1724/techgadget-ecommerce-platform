import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import { showToast } from "/shared/ui/toast.js";

let cartData = null;

const loadCartData = async () => {
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
  } catch (error) {
    console.error("Failed to load checkout cart:", error);
    showToast("Unable to load checkout data.", "error");
    window.location.href = "/cart";
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
        <span class="item-name">${item.productName}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
      </div>
    `)
    .join("");

  updateSummaryTotals();
};

const updateSummaryTotals = () => {
  const subtotal = cartData?.items?.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  ) || 0;

  const shippingCost = subtotal > 99 ? 0 : 10;
  const total = subtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-shipping").textContent = shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
};

const prefillUserInfo = () => {
  const user = authAPI.getUser();
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
  };

  if (orderRequest.paymentMethod === "PAYOS") {
    await handlePayOSPayment(orderRequest);
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

    const result = await checkoutAPI.checkoutFromCart(orderRequest);
    sessionStorage.removeItem("cart");
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

const handlePayOSPayment = async (orderRequest) => {
  try {
    console.log("PayOS Payment:", orderRequest);
    showToast("PayOS integration will be available soon.", "info");
  } catch (error) {
    console.error("PayOS failed:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadCartData();
  document.getElementById("checkout-form")?.addEventListener("submit", handleCheckoutSubmit);
});
