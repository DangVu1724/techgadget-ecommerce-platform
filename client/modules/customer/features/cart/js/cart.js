import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";

// ===== RENDER =====
const renderCartItems = (items) => {
  const container = document.getElementById("cart-items-container");
  const totalsSection = document.querySelector(".cart-totals-section");
  const actionsSection = document.querySelector(".cart-actions");
  const cartTableDiv = document.querySelector(".cart-table");

  if (!items || items.length === 0) {
    // Hide entire cart table, totals and actions sections
    if (cartTableDiv) cartTableDiv.style.display = "none";
    if (totalsSection) totalsSection.style.display = "none";
    if (actionsSection) actionsSection.style.display = "none";

    // Show empty message container
    container.innerHTML = `
      <div style="padding: 60px 40px; text-align: center; color: #999;">
        <p style="font-size: 16px; margin-bottom: 20px;">Giỏ hàng trống</p>
        <a href="/shop" class="btn-cart-secondary" style="margin-top: 20px; display: inline-block;">Tiếp tục mua sắm</a>
      </div>
    `;
    container.style.display = "block";
    updateCartTotals(0, 0);
    return;
  }

  // Show all sections when cart has items
  if (cartTableDiv) cartTableDiv.style.display = "block";
  if (totalsSection) totalsSection.style.display = "block";
  if (actionsSection) actionsSection.style.display = "flex";

  const itemsHtml = items
    .map((item) => {
      const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);

      // Render variant attributes
      const attributes = item.variant?.attributes || {};

      const color = attributes["Color"] || attributes["color"] || "";
      const ram = attributes["RAM"] || "";
      const storage = attributes["Storage"] || "";

      const attributesHtml = `
  ${color ? `<p class="attr-color">${color}</p>` : ""}
  ${
    ram || storage
      ? `<p class="attr-config">${[ram, storage].filter(Boolean).join(" • ")}</p>`
      : ""
  }
`;

      return `
      <div class="cart-item" data-id="${item.id}" data-variant-id="${item.variantId}" data-price="${item.price}">
        <div class="product-info-cell">
          <div class="product-img-box">
            <img src="${item.image || "/modules/customer/assets/images/macbook.png"}" alt="${item.productName}">
          </div>
          <div class="product-detail-cell">
            <h4>${item.productName}</h4>
            ${attributesHtml}            
            <p class="unit-price" data-price="${item.price}" style="margin-top: 5px;">$${parseFloat(item.price).toFixed(2)}</p>
          </div>
        </div>
        <div class="qty-cell">
          <div class="qty-picker">
            <button type="button" onclick="window.updateQty(this, -1)">−</button>
            <input type="text" value="${item.quantity}" readonly class="qty-input">
            <button type="button" onclick="window.updateQty(this, 1)">+</button>
          </div>
        </div>
        <div class="subtotal-cell">$${subtotal}</div>
        <div class="remove-cell">
          <button class="btn-remove-cart" onclick="window.removeItem(this)">
            <i class="fas fa-trash-alt"></i> <span class="remove-x"></span>
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = itemsHtml;
  calculateAndUpdateTotals();
};

/**
 * Tính toán và cập nhật tổng tiền
 */
const calculateAndUpdateTotals = () => {
  let finalTotal = 0;
  const items = document.querySelectorAll(".cart-item");

  items.forEach((item) => {
    const subtotal = parseFloat(
      item.querySelector(".subtotal-cell").innerText.replace("$", ""),
    );
    finalTotal += subtotal;
  });

  updateCartTotals(finalTotal, finalTotal);
};

/**
 * Trigger event khi cart thay đổi
 */
const notifyCartUpdate = () => {
  const event = new Event("cartUpdated", { bubbles: true });
  window.dispatchEvent(event);
};

/**
 * Cập nhật hiển thị tổng tiền
 */
const updateCartTotals = (subtotal, total) => {
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
};

/**
 * Lấy thông tin variant từ API
 */
const getVariantDetails = async (variantId) => {
  try {
    const variantData = await variantAPI.getVariant(variantId);
    return variantData;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin variant ${variantId}:`, error);
    return null;
  }
};

// ===== LOAD CART =====
const loadCart = async () => {
  if (!authAPI.isLoggedIn()) {
    const container = document.getElementById("cart-items-container");
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <p style="margin-bottom: 20px; font-size: 1.1rem; color: #666;">Vui lòng đăng nhập để xem giỏ hàng</p>
      </div>
    `;

    // Show login modal
    showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  try {
    const data = await cartAPI.getCart();

    // Fetch variant details for each cart item
    if (data.items && data.items.length > 0) {
      const enrichedItems = await Promise.all(
        data.items.map(async (item) => {
          try {
            const variant = await variantAPI.getVariant(item.variantId);
            return { ...item, variant };
          } catch (error) {
            console.warn(`Không thể tải variant ${item.variantId}:`, error);
            return item; // Return item without variant data if fetch fails
          }
        }),
      );
      renderCartItems(enrichedItems);
    } else {
      renderCartItems(data.items || []);
    }
  } catch (err) {
    console.error("Lỗi khi load giỏ hàng:", err);
    const container = document.getElementById("cart-items-container");
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #e74c3c;">
        <p>Không thể tải giỏ hàng. Vui lòng thử lại.</p>
      </div>
    `;
  }
};

// ===== UPDATE =====
window.updateQty = async (btn, change) => {
  if (!authAPI.isLoggedIn()) {
    showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  const cartItem = btn.closest(".cart-item");
  const input = cartItem.querySelector(".qty-input");
  const variantId = cartItem.getAttribute("data-variant-id");
  const price = parseFloat(cartItem.getAttribute("data-price"));
  const subtotalCell = cartItem.querySelector(".subtotal-cell");

  let currentQty = parseInt(input.value) || 1;
  let newQty = currentQty + change;

  if (newQty < 1) return;

  try {
    await cartAPI.updateQuantity(variantId, newQty);

    input.value = newQty;
    const newSubtotal = newQty * price;
    subtotalCell.innerText = `$${newSubtotal.toFixed(2)}`;

    calculateAndUpdateTotals();
    notifyCartUpdate();
  } catch (error) {
    alert("Lỗi: " + error.message);
    console.error(error);
  }
};

// ===== REMOVE =====
window.removeItem = async (btn) => {
  if (!authAPI.isLoggedIn()) {
    showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  const cartItem = btn.closest(".cart-item");
  const cartItemId = cartItem.getAttribute("data-id");
  const productName = cartItem.querySelector("h4").innerText;

  if (
    !confirm(`Bạn có muốn xóa sản phẩm "${productName}" khỏi giỏ hàng không?`)
  ) {
    return;
  }

  try {
    await cartAPI.removeItem(cartItemId);

    cartItem.style.opacity = "0";
    cartItem.style.transform = "translateX(20px)";
    cartItem.style.transition = "0.3s";

    setTimeout(() => {
      cartItem.remove();
      calculateAndUpdateTotals();
      notifyCartUpdate();

      // Kiểm tra nếu giỏ hàng trống
      const items = document.querySelectorAll(".cart-item");
      if (items.length === 0) {
        renderCartItems([]);
      }
    }, 300);
  } catch (error) {
    alert("Lỗi: " + error.message);
    console.error(error);
  }
};

/**
 * Setup cart action buttons
 */
const setupCartActions = () => {
  const btnContinueShopping = document.getElementById("btn-continue-shopping");
  const btnCheckout = document.getElementById("btn-checkout");

  if (btnContinueShopping) {
    btnContinueShopping.addEventListener("click", () => {
      window.location.href = "/shop";
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      if (!authAPI.isLoggedIn()) {
        showLoginModal(() => {
          window.location.href = "/login";
        });
        return;
      }

      const items = document.querySelectorAll(".cart-item");
      if (items.length === 0) {
        alert("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
        return;
      }

      // Redirect to checkout page
      window.location.href = "/checkout";
    });
  }
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  loadCart().then(() => {
    notifyCartUpdate();
  });
  setupCartActions();
});
