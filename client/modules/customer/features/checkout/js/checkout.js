import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";

let cartData = null;

// ===== LOAD CART DATA =====
const loadCartData = async () => {
  if (!authAPI.isLoggedIn()) {
    window.location.href = "/login";
    return;
  }

  try {
    const data = await cartAPI.getCart();
    cartData = data;

    // Enrich items with variant data
    if (data.items && data.items.length > 0) {
      const enrichedItems = await Promise.all(
        data.items.map(async (item) => {
          try {
            const variant = await variantAPI.getVariant(item.variantId);
            return { ...item, variant };
          } catch (error) {
            console.warn(`Không thể tải variant ${item.variantId}:`, error);
            return item;
          }
        }),
      );
      cartData.items = enrichedItems;
    }

    renderOrderSummary();
    prefillUserInfo();
  } catch (err) {
    console.error("Lỗi khi load giỏ hàng:", err);
    alert("Không thể tải giỏ hàng. Vui lòng thử lại.");
    window.location.href = "/cart";
  }
};

// ===== RENDER ORDER SUMMARY =====
const renderOrderSummary = () => {
  const container = document.getElementById("order-items-container");

  if (!cartData.items || cartData.items.length === 0) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #999;">
        <p>Giỏ hàng trống</p>
      </div>
    `;
    updateSummaryTotals(0);
    return;
  }

  const itemsHtml = cartData.items
    .map((item) => {
      return `
      <div class="summary-item">
        <span class="item-name">${item.productName}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
      </div>
    `;
    })
    .join("");

  container.innerHTML = itemsHtml;
  updateSummaryTotals();
};

// ===== UPDATE SUMMARY TOTALS =====
const updateSummaryTotals = () => {
  let subtotal = 0;

  if (cartData.items) {
    subtotal = cartData.items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);
  }

  const shippingCost = subtotal > 99 ? 0 : 10; // Free shipping over $99
  const total = subtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-shipping").textContent =
    `${shippingCost === 0 ? "FREE" : "$" + shippingCost.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
};

// ===== PREFILL USER INFO =====
const prefillUserInfo = () => {
  if (authAPI.isLoggedIn()) {
    const user = authAPI.getUser();
    if (user) {
      if (user.fullName)
        document.getElementById("fullName").value = user.fullName;
      if (user.email) document.getElementById("email").value = user.email;
      if (user.phone) document.getElementById("phone").value = user.phone;
      if (user.address) document.getElementById("address").value = user.address;
    }
  }
};

// ===== HANDLE FORM SUBMIT =====
const handleCheckoutSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  const form = document.getElementById("checkout-form");
  if (!form.checkValidity()) {
    alert("Vui lòng điền đầy đủ thông tin cần thiết.");
    return;
  }

  // Get form data
  const formData = new FormData(form);

  // Build order request data (match OrderRequest backend class)
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

  console.log("Order Request:", orderRequest);

  // Handle payment method
  if (orderRequest.paymentMethod === "PAYOS") {
    await handlePayOSPayment(orderRequest);
  } else if (orderRequest.paymentMethod === "COD") {
    await submitCheckout(orderRequest);
  }
};

// ===== SUBMIT CHECKOUT =====
const submitCheckout = async (orderRequest) => {
  try {
    // Show loading state
    const submitBtn = document.querySelector(".btn-checkout-submit");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    // Call checkout API
    const result = await checkoutAPI.checkoutFromCart(orderRequest);
    console.log("Checkout successful:", result);

    // Clear cart session
    sessionStorage.removeItem("cart");

    // Notify cart update
    const event = new Event("cartUpdated", { bubbles: true });
    window.dispatchEvent(event);

    // Show success message
    alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");

    // Redirect to order confirmation
    if (result.id) {
      window.location.href = `/home`;
    } else {
      window.location.href = "/home";
    }
  } catch (error) {
    console.error("Lỗi khi đặt hàng:", error);
    alert("Lỗi: " + (error.message || "Không thể đặt hàng. Vui lòng thử lại."));

    // Restore button state
    const submitBtn = document.querySelector(".btn-checkout-submit");
    submitBtn.disabled = false;
    submitBtn.textContent = "PLACE ORDER";
  }
};

// ===== HANDLE PAYOS PAYMENT =====
const handlePayOSPayment = async (orderRequest) => {
  try {
    // TODO: Implement PayOS integration
    // This would typically involve:
    // 1. Call backend to get PayOS payment link
    // 2. Redirect to PayOS payment page
    // 3. Handle callback after payment
    alert("Hệ thống PayOS sẽ được cập nhật sớm!");
    console.log("PayOS Payment:", orderRequest);
  } catch (error) {
    console.error("Lỗi PayOS:", error);
    alert("Lỗi: " + error.message);
  }
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  loadCartData();

  // Setup form submit
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", handleCheckoutSubmit);
  }
});
