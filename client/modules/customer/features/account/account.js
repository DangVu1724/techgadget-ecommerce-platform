import { authAPI } from "/modules/customer/core/api/auth.api.js";

/**
 * Check login, nếu chưa đăng nhập thì redirect
 */
const checkLogin = () => {
  if (!authAPI.isLoggedIn()) {
    alert("Vui lòng đăng nhập trước!");
    window.location.href = "/login";
    return false;
  }
  return true;
};

/**
 * Render dashboard info
 */
const renderDashboard = () => {
  const user = authAPI.getUser();
  const container = document.getElementById("dashboard-info");

  if (user) {
    container.innerHTML = `
      <div class="info-item">
        <div class="info-label">Full Name</div>
        <div class="info-value">${user.fullName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${user.email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Role</div>
        <div class="info-value">${
          user.role === "admin"
            ? "Administrator"
            : user.role === "user"
              ? "Customer"
              : user.role
        }</div>
      </div>
    `;
  }
};

/**
 * Render orders list
 */
const renderOrders = () => {
  const container = document.getElementById("orders-list");

  // Thay thế bằng API call để lấy đơn hàng từ backend
  const mockOrders = [
    {
      id: "ORD-001",
      date: "2024-03-15",
      total: 2400.0,
      status: "Delivered",
    },
    {
      id: "ORD-002",
      date: "2024-03-10",
      total: 1200.0,
      status: "Processing",
    },
    {
      id: "ORD-003",
      date: "2024-03-05",
      total: 3500.0,
      status: "Shipped",
    },
  ];

  if (mockOrders.length === 0) {
    container.innerHTML =
      '<div class="empty-message">No orders found. <a href="/shop">Start shopping</a></div>';
    return;
  }

  const ordersHtml = mockOrders
    .map(
      (order) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${order.id}</div>
        <div class="order-date">Ordered on ${order.date}</div>
      </div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
      <div class="order-status">${order.status}</div>
    </div>
  `,
    )
    .join("");

  container.innerHTML = ordersHtml;
};

/**
 * Load profile form
 */
const loadProfileForm = () => {
  const user = authAPI.getUser();

  if (user) {
    document.getElementById("fullName").value = user.fullName || "";
    document.getElementById("email").value = user.email || "";
  }
};

/**
 * Initialize menu navigation
 */
const initMenuNavigation = () => {
  const menuLinks = document.querySelectorAll(".menu-link");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const section = link.getAttribute("data-section");
      if (!section) return;

      // Remove active class từ tất cả links
      menuLinks.forEach((l) => l.classList.remove("active"));

      // Add active class vào link hiện tại
      link.classList.add("active");

      // Hide tất cả sections
      document.querySelectorAll(".content-section").forEach((s) => {
        s.classList.remove("active");
      });

      // Show section được click
      const sectionEl = document.getElementById(section);
      if (sectionEl) {
        sectionEl.classList.add("active");

        // Load dữ liệu khi click vào section
        if (section === "profile") {
          loadProfileForm();
        } else if (section === "orders") {
          renderOrders();
        }
      }
    });
  });
};

/**
 * Logout handler
 */
const initLogout = () => {
  const logoutLink = document.getElementById("logout-link");

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      authAPI.logout();
      alert("Đã đăng xuất thành công!");
      window.location.href = "/home";
    }
  });
};

/**
 * Save profile handler
 */
const initSaveProfile = () => {
  const saveBtn = document.getElementById("save-profile");

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    if (!fullName) {
      alert("Vui lòng nhập tên!");
      return;
    }

    // Cập nhật user trong localStorage (tạm thời)
    const user = authAPI.getUser();
    if (user) {
      user.fullName = fullName;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Cập nhật thông tin thành công!");
      renderDashboard();
    }
  });
};

/**
 * Change password handler
 */
const initChangePassword = () => {
  const changePasswordBtn = document.getElementById("change-password");

  changePasswordBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng điền tất cả các trường!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // TODO: Gọi API để đổi mật khẩu
    alert("Đổi mật khẩu thành công!");
    document.getElementById("security-form").reset();
  });
};

/**
 * Initialize page
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check login
  if (!checkLogin()) return;

  // Render dashboard
  renderDashboard();

  // Initialize menu navigation
  initMenuNavigation();

  // Initialize logout
  initLogout();

  // Initialize save profile
  initSaveProfile();

  // Initialize change password
  initChangePassword();
});
