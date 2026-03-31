import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { orderApi } from "/modules/customer/core/api/order.api.js";
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

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = String(value || "");
  return div.innerHTML;
};

const getAvatarText = (user) => {
  const source = user?.fullName || user?.email || "T";
  return source.charAt(0).toUpperCase();
};

const renderProfileDetails = (user) => {
  const detailsContainer = document.getElementById("profileDetails");
  const emptyState = document.getElementById("profileEmpty");
  if (!detailsContainer || !emptyState) return;

  const fields = [
    { label: "Họ và tên", value: user?.fullName },
    { label: "Email", value: user?.email },
    { label: "Số điện thoại", value: user?.phone },
    { label: "Địa chỉ", value: user?.address },
  ].filter((item) => normalizeText(item.value));

  if (!fields.length) {
    detailsContainer.innerHTML = "";
    emptyState.style.display = "flex";
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
};

const renderUserInfo = () => {
  const user = authAPI.getUser();
  console.log("User data from authAPI:", user); // Debug log
  
  if (!user) {
    console.warn("No user data found");
    return;
  }

  const name = user.fullName || user.email || "Tài khoản";
  const email = user.email || "Chưa có email";
  const avatarText = getAvatarText(user);

  console.log("Rendering user info:", { name, email, avatarText }); // Debug log

  document.querySelectorAll(".username").forEach((element) => {
    element.textContent = name;
  });

  const profileDisplayName = document.querySelector(".profile-display-name");
  if (profileDisplayName) {
    profileDisplayName.textContent = name;
  }

  const profileEmail = document.querySelector(".profile-email");
  if (profileEmail) {
    profileEmail.textContent = email;
  }

  document.querySelectorAll(".profile-avatar-initial").forEach((element) => {
    element.textContent = avatarText;
  });

  renderProfileDetails(user);
};

const initLogoutAction = () => {
  const logoutButton = document.getElementById("accountLogoutBtn");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", () => {
    const confirmed = window.confirm("Ban co chac muon dang xuat khong?");
    if (!confirmed) {
      return;
    }

    authAPI.logout();
    showToast("Dang xuat thanh cong.", "success");
    window.location.href = "/login";
  });
};

const renderOrderList = () => {
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
            <div class="order-status">${escapeHtml(formatOrderStatus(order.orderStatus))}</div>
          </div>

          <div class="order-body">
            <img src="/modules/customer/assets/images/tech_item.png" alt="Order item" />
            <div class="product-info">
              <h4 class="product-name">Đơn hàng #${escapeHtml(order.orderCode || order.id || "-")}</h4>
              <p class="product-variant">Ngày đặt: ${escapeHtml(formatDate(order.orderDate))}</p>
              <p class="product-variant">Thanh toán: ${escapeHtml(order.paymentMethod || "-")}</p>
            </div>
          </div>

          <div class="order-footer">
            <div class="total-row">
              <span>Tổng tiền:</span>
              <span class="total-price">${escapeHtml(formatCurrency(order.finalAmount ?? order.amount))}</span>
            </div>
            <div class="order-actions">
              <a class="btn-main" href="/modules/customer/features/order_detail/order_detail.html?id=${order.id}">Xem chi tiết</a>
              <a class="btn-secondary" href="/cart">Mua lại</a>
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
    container.innerHTML =
      '<div class="empty-state"><p>Đang tải lịch sử đơn hàng...</p></div>';
  }

  try {
    const response = await orderApi.getMyOrders({ page: 0, size: 100 });
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

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });

  const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
  menuItem?.classList.add("active");

  if (tabId === "tab-donmua") {
    loadOrderHistory();
  }
};

const initMainTabNavigation = () => {
  document.querySelectorAll(".menu-item[data-tab]").forEach((item) => {
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
      document
        .querySelectorAll(".ot-item")
        .forEach((element) => element.classList.remove("active"));
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
  initLogoutAction();
  initMainTabNavigation();
  initOrderFilters();
});
