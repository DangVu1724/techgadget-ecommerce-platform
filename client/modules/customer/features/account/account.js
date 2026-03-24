import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { orderAPI } from "/modules/customer/core/api/order.api.js";
import { showToast } from "/shared/ui/toast.js";

const state = {
  allOrders: [],
  activeOrderTab: "all",
  searchKeyword: "",
};

const checkLogin = () => {
  if (!authAPI.isLoggedIn()) {
    showToast("Vui lòng đăng nhập trước.", "warning");
    window.location.href = "/login";
    return false;
  }
  return true;
};

const normalizeText = (value) => String(value || "").toLowerCase().trim();

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")}đ`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
};

const formatOrderStatus = (status) => {
  const map = {
    PENDING: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang vận chuyển",
    DELIVERED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };
  return map[status] || status || "Không xác định";
};

const mapStatusToOrderTab = (status) => {
  switch (status) {
    case "PENDING":
      return "pending";
    case "SHIPPING":
    case "PROCESSING":
    case "CONFIRMED":
      return "shipping";
    case "DELIVERED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "all";
  }
};

const renderUserInfo = () => {
  const user = authAPI.getUser();
  if (!user) return;

  const usernameEl = document.querySelector(".username");
  if (usernameEl) {
    usernameEl.textContent = user.fullName || user.email || "Người dùng";
  }

  const profileNameInput = document.querySelector(
    '#tab-hoso .profile-form input[type="text"]',
  );
  if (profileNameInput) {
    profileNameInput.value = user.fullName || "";
  }
};

const renderOrderList = () => {
  const container = document.getElementById("order-list-content");
  if (!container) return;

  const keyword = normalizeText(state.searchKeyword);
  const tab = state.activeOrderTab;

  const filteredOrders = state.allOrders.filter((order) => {
    const tabMatch = tab === "all" || mapStatusToOrderTab(order.orderStatus) === tab;
    const keywordMatch =
      !keyword ||
      normalizeText(order.orderCode).includes(keyword) ||
      normalizeText(order.id).includes(keyword) ||
      normalizeText(formatOrderStatus(order.orderStatus)).includes(keyword);
    return tabMatch && keywordMatch;
  });

  if (!filteredOrders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Chưa có đơn hàng phù hợp.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredOrders
    .map(
      (order) => `
      <div class="order-card">
        <div class="order-shop-header">
          <div class="shop-info">
            <span class="badge-mall">Mall</span>
            <span class="shop-name">TechGadget Official</span>
          </div>
          <div class="order-status">${formatOrderStatus(order.orderStatus)}</div>
        </div>

        <div class="order-body">
          <img src="/modules/customer/assets/images/default-pro.png" alt="Order item" />
          <div class="product-info">
            <h4 class="product-name">Đơn hàng #${order.orderCode || order.id}</h4>
            <p class="product-variant">Ngày đặt: ${formatDate(order.orderDate)}</p>
            <p class="product-variant">Thanh toán: ${order.paymentMethod || "-"}</p>
          </div>
        </div>

        <div class="order-footer">
          <div class="total-row">
            <span>Tổng tiền:</span>
            <span class="total-price">${formatCurrency(order.amount)}</span>
          </div>
          <div class="order-actions">
            <a class="btn-main" href="/cart">Mua lại</a>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
};

const loadOrderHistory = async () => {
  const container = document.getElementById("order-list-content");
  if (container) {
    container.innerHTML = '<div class="empty-state"><p>Đang tải lịch sử đơn hàng...</p></div>';
  }

  try {
    const response = await orderAPI.getMyOrders({ page: 0, size: 100 });
    state.allOrders = response?.content || [];
    renderOrderList();
  } catch (error) {
    console.error("Load order history failed:", error);
    if (container) {
      container.innerHTML =
        '<div class="empty-state"><p>Không thể tải lịch sử đơn hàng. Vui lòng thử lại.</p></div>';
    }
  }
};

const activateTab = (tabId) => {
  const targetTab = document.getElementById(tabId);
  if (!targetTab) return;

  document.querySelectorAll(".tab-content").forEach((item) => {
    item.classList.remove("active");
  });
  targetTab.classList.add("active");

  document.querySelectorAll(".menu-item, .sub-menu li").forEach((item) => {
    item.classList.remove("active");
  });

  const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
  const subItem = document.querySelector(`.sub-menu li[data-tab="${tabId}"]`);
  menuItem?.classList.add("active");
  subItem?.classList.add("active");
  subItem?.closest(".menu-item")?.classList.add("active");

  if (tabId === "tab-donmua") {
    loadOrderHistory();
  }
};

const initMainTabNavigation = () => {
  document.querySelectorAll(".sub-menu li, .menu-item[data-tab]").forEach((item) => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      if (!tabId) return;
      activateTab(tabId);
    });
  });
};

const initOrderFilters = () => {
  document.querySelectorAll(".ot-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".ot-item").forEach((el) => el.classList.remove("active"));
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
};

document.addEventListener("DOMContentLoaded", () => {
  if (!checkLogin()) return;
  renderUserInfo();
  initMainTabNavigation();
  initOrderFilters();
});
