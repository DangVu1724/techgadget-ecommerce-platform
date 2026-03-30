import { authAPI } from "/modules/admin/core/api/auth.api.js";
import { confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

const ADMIN_BASE = "/admin";

export class Sidebar {
  constructor() {
    this.init();
  }

  async init() {
    this.render();
    this.setActiveLink();
    this.initLogout();
  }

  render() {
    const sidebarContainer = document.getElementById("sidebar-container");

    sidebarContainer.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-title">Tech Admin</div>
        <nav class="sidebar-menu">
          <a href="${ADMIN_BASE}/dashboard" class="nav-link">Dashboard</a>
          <a href="${ADMIN_BASE}/category" class="nav-link">Categories</a>
          <a href="${ADMIN_BASE}/brands" class="nav-link">Brands</a>
          <a href="${ADMIN_BASE}/attributes" class="nav-link">Attributes</a>
          <a href="${ADMIN_BASE}/products" class="nav-link">Products</a>
          <a href="${ADMIN_BASE}/discounts" class="nav-link">Vouchers</a>
          <a href="${ADMIN_BASE}/order" class="nav-link">Orders</a>
          <a href="${ADMIN_BASE}/users" class="nav-link">Users</a>
        </nav>
        <div class="sidebar-footer">
          <a href="#" class="nav-link logout" id="logoutBtn">Logout</a>
        </div>
      </aside>
    `;
  }

  initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) {
      return;
    }

    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      const confirmed = await confirmModal("Do you want to log out of the admin area?", {
        title: "Log out",
        confirmText: "Log out",
        cancelText: "Stay logged in",
        variant: "danger",
      });

      if (!confirmed) {
        return;
      }

      authAPI.logout();
      showToast("Logged out successfully.", "success");
      window.location.href = "/home";
    });
  }

  setActiveLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll(".nav-link");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && path.includes(href.split("/").pop())) {
        link.classList.add("active");
      }
    });
  }
}
