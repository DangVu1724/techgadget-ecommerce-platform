import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { orderApi } from "/modules/customer/core/api/order.api.js";
import { showToast } from "/shared/ui/toast.js";

const state = {
  allOrders: [],
  activeOrderTab: "all",
  searchKeyword: "",
};

const STATUS_LABELS = {
  PENDING: "Pending payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

function checkLogin() {
  if (!authAPI.isLoggedIn()) {
    showToast("Please sign in first.", "warning");
    window.location.href = "/login";
    return false;
  }
  return true;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value || "");
  return div.innerHTML;
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("en-US")} VND`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-GB");
}

function getAvatarText(user) {
  return String(user?.fullName || user?.email || "T")
    .charAt(0)
    .toUpperCase();
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "Unknown";
}

function getStatusClass(status) {
  const tab = mapStatusToOrderTab(status);
  return `status-${tab}`;
}

function mapStatusToOrderTab(status) {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "PROCESSING":
    case "SHIPPING":
      return "shipping";
    case "DELIVERED":
      return "completed";
    case "CANCELLED":
    case "FAILED":
      return "cancelled";
    default:
      return "all";
  }
}

function renderProfileDetails(user) {
  const detailsContainer = document.getElementById("profileDetails");
  const emptyState = document.getElementById("profileEmpty");
  if (!detailsContainer || !emptyState) return;

  const fields = [
    { label: "Full name", value: user?.fullName },
    { label: "Email", value: user?.email },
    { label: "Phone number", value: user?.phone },
    { label: "Address", value: user?.address },
  ].filter((item) => normalizeText(item.value));

  if (!fields.length) {
    detailsContainer.innerHTML = "";
    emptyState.style.display = "grid";
    return;
  }

  emptyState.style.display = "none";
  detailsContainer.innerHTML = fields
    .map(
      (item) => `
        <article class="profile-detail-card">
          <span class="profile-detail-label">${escapeHtml(item.label)}</span>
          <strong class="profile-detail-value">${escapeHtml(item.value)}</strong>
        </article>
      `,
    )
    .join("");
}

function renderUserInfo() {
  const user = authAPI.getUser();
  if (!user) return;

  const name = user.fullName || user.email || "Tai khoan";
  const email = user.email || "No email available";
  const avatarText = getAvatarText(user);

  document.querySelectorAll(".username").forEach((element) => {
    element.textContent = name;
  });

  document.querySelectorAll(".profile-display-name").forEach((element) => {
    element.textContent = name;
  });

  document.querySelectorAll(".profile-email").forEach((element) => {
    element.textContent = email;
  });

  document.querySelectorAll(".profile-avatar-initial").forEach((element) => {
    element.textContent = avatarText;
  });

  renderProfileDetails(user);
}

function initLogoutAction() {
  const logoutButton = document.getElementById("accountLogoutBtn");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    authAPI.logout();
    showToast("Logged out successfully.", "success");
    window.location.href = "/login";
  });
}

function renderOrderList() {
  const container = document.getElementById("order-list-content");
  if (!container) return;

  const keyword = normalizeText(state.searchKeyword);
  const tab = state.activeOrderTab;

  const filteredOrders = state.allOrders.filter((order) => {
    const tabMatch =
      tab === "all" || mapStatusToOrderTab(order.orderStatus) === tab;
    const keywordMatch =
      !keyword ||
      normalizeText(order.orderCode).includes(keyword) ||
      normalizeText(order.id).includes(keyword) ||
      normalizeText(getStatusLabel(order.orderStatus)).includes(keyword);

    return tabMatch && keywordMatch;
  });

  if (!filteredOrders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>No orders match the current filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredOrders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-card-top">
            <div class="order-card-meta">
              <span class="order-code">Order #${escapeHtml(order.orderCode || order.id || "-")}</span>
              <span class="order-date">Placed at ${escapeHtml(formatDate(order.orderDate))}</span>
            </div>
            <span class="status-chip ${getStatusClass(order.orderStatus)}">
              <i class="fas fa-circle"></i>
              ${escapeHtml(getStatusLabel(order.orderStatus))}
            </span>
          </div>

          <div class="order-card-body">
            <img
              class="order-card-thumb"
              src="/modules/customer/assets/images/tech_item.png"
              alt="Order item"
            />
            <div>
              <h3 class="order-card-title">TechGadget Official</h3>
              <div class="order-card-grid">
                <div class="order-card-cell">
                  <span class="order-card-label">Payment method</span>
                  <span class="order-card-value">${escapeHtml(order.paymentMethod || "-")}</span>
                </div>
                <div class="order-card-cell">
                  <span class="order-card-label">Payment status</span>
                  <span class="order-card-value">${escapeHtml(order.paymentStatus || "-")}</span>
                </div>
                <div class="order-card-cell">
                  <span class="order-card-label">Internal ID</span>
                  <span class="order-card-value">#${escapeHtml(order.id || "-")}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-card-bottom">
            <div class="order-total">
              <span class="order-total-label">Total amount</span>
              <strong class="order-total-value">${escapeHtml(formatCurrency(order.amount))}</strong>
            </div>

            <div class="order-actions">
              <a class="btn-main" href="/modules/customer/features/order_detail/order_detail.html?id=${encodeURIComponent(order.id)}">
                View details
              </a>
              <a class="btn-secondary" href="/cart">Buy again</a>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadOrderHistory() {
  const container = document.getElementById("order-list-content");
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Loading order history...</p>
      </div>
    `;
  }

  try {
    const response = await orderApi.getMyOrders({ page: 0, size: 100 });
    state.allOrders = response?.content || [];
    renderOrderList();
  } catch (error) {
    console.error("Load order history failed:", error);
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-circle-exclamation"></i>
          <p>Unable to load order history. Please try again.</p>
        </div>
      `;
    }
  }
}

function activateTab(tabId) {
  const targetTab = document.getElementById(tabId);
  if (!targetTab) return;

  document.querySelectorAll(".tab-content").forEach((item) => {
    item.classList.remove("active");
  });
  targetTab.classList.add("active");

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });
  document
    .querySelector(`.menu-item[data-tab="${tabId}"]`)
    ?.classList.add("active");

  if (tabId === "tab-donmua") {
    loadOrderHistory();
  }
}

function initMainTabNavigation() {
  document.querySelectorAll(".menu-item[data-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      if (tabId) {
        activateTab(tabId);
      }
    });
  });
}

function initOrderFilters() {
  document.querySelectorAll(".ot-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".ot-item").forEach((element) => {
        element.classList.remove("active");
      });
      item.classList.add("active");
      state.activeOrderTab = item.dataset.order || "all";
      renderOrderList();
    });
  });

  const searchInput = document.querySelector(".order-search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.searchKeyword = event.target.value || "";
      renderOrderList();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkLogin()) return;

  renderUserInfo();
  initLogoutAction();
  initMainTabNavigation();
  initOrderFilters();
});
