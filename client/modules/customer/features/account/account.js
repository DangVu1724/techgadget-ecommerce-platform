import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

const checkLogin = () => {
  if (!authAPI.isLoggedIn()) {
    showToast("Please log in first.", "warning");
    window.location.href = "/login";
    return false;
  }
  return true;
};

const renderDashboard = () => {
  const user = authAPI.getUser();
  const container = document.getElementById("dashboard-info");
  if (!user || !container) return;

  container.innerHTML = `
    <div class="info-item"><div class="info-label">Full Name</div><div class="info-value">${user.fullName}</div></div>
    <div class="info-item"><div class="info-label">Email</div><div class="info-value">${user.email}</div></div>
    <div class="info-item"><div class="info-label">Role</div><div class="info-value">${user.role}</div></div>
  `;
};

const renderOrders = () => {
  const container = document.getElementById("orders-list");
  if (!container) return;

  const mockOrders = [
    { id: "ORD-001", date: "2024-03-15", total: 2400.0, status: "Delivered" },
    { id: "ORD-002", date: "2024-03-10", total: 1200.0, status: "Processing" },
    { id: "ORD-003", date: "2024-03-05", total: 3500.0, status: "Shipped" },
  ];

  container.innerHTML = mockOrders.map((order) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${order.id}</div>
        <div class="order-date">Ordered on ${order.date}</div>
      </div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
      <div class="order-status">${order.status}</div>
    </div>
  `).join("");
};

const loadProfileForm = () => {
  const user = authAPI.getUser();
  if (!user) return;
  document.getElementById("fullName").value = user.fullName || "";
  document.getElementById("email").value = user.email || "";
};

const initMenuNavigation = () => {
  document.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const section = link.getAttribute("data-section");
      if (!section) return;

      document.querySelectorAll(".menu-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      document.querySelectorAll(".content-section").forEach((item) => item.classList.remove("active"));
      const sectionEl = document.getElementById(section);
      sectionEl?.classList.add("active");

      if (section === "profile") loadProfileForm();
      if (section === "orders") renderOrders();
    });
  });
};

const initLogout = () => {
  document.getElementById("logout-link")?.addEventListener("click", async (event) => {
    event.preventDefault();

    const confirmed = await confirmModal("Do you want to log out of your account?", {
      title: "Log out",
      confirmText: "Log out",
      cancelText: "Stay logged in",
      variant: "danger",
    });

    if (!confirmed) return;

    authAPI.logout();
    showToast("Logged out successfully.", "success");
    window.location.href = "/home";
  });
};

const initSaveProfile = () => {
  document.getElementById("save-profile")?.addEventListener("click", (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName")?.value?.trim();
    if (!fullName) {
      showToast("Please enter your full name.", "warning");
      return;
    }

    const user = authAPI.getUser();
    if (!user) return;

    user.fullName = fullName;
    localStorage.setItem("user", JSON.stringify(user));
    showToast("Profile updated successfully.", "success");
    renderDashboard();
  });
};

const initChangePassword = () => {
  document.getElementById("change-password")?.addEventListener("click", (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById("currentPassword")?.value;
    const newPassword = document.getElementById("newPassword")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match.", "warning");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    showToast("Password updated successfully.", "success");
    document.getElementById("security-form")?.reset();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  if (!checkLogin()) return;

  renderDashboard();
  initMenuNavigation();
  initLogout();
  initSaveProfile();
  initChangePassword();
});
