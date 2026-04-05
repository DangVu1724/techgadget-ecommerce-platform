import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import { confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

const renderCartItems = (items) => {
  const container = document.getElementById("cart-items-container");
  const totalsSection = document.querySelector(".cart-totals-section");
  const actionsSection = document.querySelector(".cart-actions");
  const cartTableDiv = document.querySelector(".cart-table");

  if (!items?.length) {
    if (cartTableDiv) cartTableDiv.style.display = "none";
    if (totalsSection) totalsSection.style.display = "none";
    if (actionsSection) actionsSection.style.display = "none";

    container.innerHTML = `
      <div style="padding: 60px 40px; text-align: center; color: #999;">
        <p style="font-size: 16px; margin-bottom: 20px;">Your cart is empty.</p>
        <a href="/shop" class="btn-cart-secondary" style="margin-top: 20px; display: inline-block;">Continue shopping</a>
      </div>
    `;

    container.style.display = "block";
    updateCartTotals(0, 0);
    return;
  }

  if (cartTableDiv) cartTableDiv.style.display = "block";
  if (totalsSection) totalsSection.style.display = "block";
  if (actionsSection) actionsSection.style.display = "flex";

  container.innerHTML = items.map((item) => {
    const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);
    const attributes = item.variant?.attributes || {};
    const color = attributes.Color || attributes.color || "";
    const ram = attributes.RAM || "";
    const storage = attributes.Storage || "";
return `
  <div class="cart-item" data-id="${item.id}" data-variant-id="${item.variantId}" data-price="${item.price}">
    <div class="product-info-cell">
      <div class="product-img-box">
        <img src="${item.image || "/modules/customer/assets/images/macbook.png"}" alt="${item.productName}">
      </div>
      <div class="product-detail-cell">
        <h4>${item.productName}</h4>
        ${color ? `<p class="attr-color">${color}</p>` : ""}
        ${ram || storage ? `<p class="attr-config">${[ram, storage].filter(Boolean).join(" • ")}</p>` : ""}
        
        <p class="unit-price" data-price="${item.price}" style="margin-top: 5px;">
          ${formatPrice(item.price)}
        </p>
      </div>
    </div>
    <div class="qty-cell">
      <div class="qty-picker">
        <button type="button" onclick="window.updateQty(this, -1)">−</button>
        <input type="text" value="${item.quantity}" readonly class="qty-input">
        <button type="button" onclick="window.updateQty(this, 1)">+</button>
      </div>
    </div>
    
    <div class="subtotal-cell">${formatPrice(subtotal)}</div>
    
    <div class="remove-cell">
      <button class="btn-remove-cart" onclick="window.removeItem(this)">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
`;
  }).join("");

  calculateAndUpdateTotals();
};

const calculateAndUpdateTotals = () => {
  let finalTotal = 0;
  document.querySelectorAll(".cart-item").forEach((item) => {
    const price = parseFloat(item.getAttribute("data-price") || "0");
    const qty = parseInt(item.querySelector(".qty-input")?.value || "0");
    finalTotal += price * qty;
  });

  updateCartTotals(finalTotal, finalTotal);
};

const notifyCartUpdate = () => {
  window.dispatchEvent(new Event("cartUpdated", { bubbles: true }));
};

const updateCartTotals = (subtotal, total) => {
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  // Sử dụng hàm formatPrice để hiển thị định dạng VNĐ chuẩn
  if (subtotalEl) subtotalEl.innerText = formatPrice(subtotal);
  if (totalEl) totalEl.innerText = formatPrice(total);
};
const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const loadCart = async () => {
  const container = document.getElementById("cart-items-container");

  if (!authAPI.isLoggedIn()) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <p style="margin-bottom: 20px; font-size: 1.1rem; color: #666;">Please log in to view your cart.</p>
      </div>
    `;

    await showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  try {
    const data = await cartAPI.getCart();

    if (data.items?.length) {
      const enrichedItems = await Promise.all(
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

      renderCartItems(enrichedItems);
      return;
    }

    renderCartItems(data.items || []);
  } catch (error) {
    console.error("Failed to load cart:", error);
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #e74c3c;">
        <p>Unable to load your cart. Please try again.</p>
      </div>
    `;
  }
};

window.updateQty = async (btn, change) => {
  if (!authAPI.isLoggedIn()) {
    await showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  const cartItem = btn.closest(".cart-item");
  const input = cartItem?.querySelector(".qty-input");
  const variantId = cartItem?.getAttribute("data-variant-id");
  const price = parseFloat(cartItem?.getAttribute("data-price") || "0");
  const subtotalCell = cartItem?.querySelector(".subtotal-cell");

  const currentQty = parseInt(input?.value || "1", 10);
  const newQty = currentQty + change;
  if (newQty < 1) return;

  try {
    await cartAPI.updateQuantity(variantId, newQty);
    input.value = newQty;
    subtotalCell.innerText = formatPrice(newQty * price);
    calculateAndUpdateTotals();
    notifyCartUpdate();
    showToast("Cart updated successfully.", "success");
  } catch (error) {
    console.error("Failed to update cart:", error);
  }
};

window.removeItem = async (btn) => {
  if (!authAPI.isLoggedIn()) {
    await showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  const cartItem = btn.closest(".cart-item");
  const cartItemId = cartItem?.getAttribute("data-id");
  const productName = cartItem?.querySelector("h4")?.innerText || "this item";

  const confirmed = await confirmModal(
    `Remove "${productName}" from your cart?`,
    {
      title: "Remove item",
      confirmText: "Remove",
      cancelText: "Keep item",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await cartAPI.removeItem(cartItemId);
    cartItem.remove();
    calculateAndUpdateTotals();
    notifyCartUpdate();
    showToast("Item removed from cart.", "success");

    if (!document.querySelectorAll(".cart-item").length) {
      renderCartItems([]);
    }
  } catch (error) {
    console.error("Failed to remove item:", error);
  }
};

const setupCartActions = () => {
  document.getElementById("btn-continue-shopping")?.addEventListener("click", () => {
    window.location.href = "/home";
  });

  document.getElementById("btn-checkout")?.addEventListener("click", async () => {
    if (!authAPI.isLoggedIn()) {
      await showLoginModal(() => {
        window.location.href = "/login";
      });
      return;
    }

    if (!document.querySelectorAll(".cart-item").length) {
      showToast("Your cart is empty.", "warning");
      return;
    }

    window.location.href = "/checkout";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  loadCart().then(notifyCartUpdate);
  setupCartActions();
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