import { authAPI } from "../../../core/api/auth.api.js";

const ADMIN_BASE = "/client/modules/admin/features";

export class Sidebar {
  constructor() {
    this.init();
  }

  async init() {
    this.render();
    this.attachEvents();
    this.setActiveLink();
  }

  render() {
    const sidebarContainer = document.getElementById("sidebar-container");

    sidebarContainer.innerHTML = `
      <aside class="sidebar">

        <div class="sidebar-title">
          Tech Admin
        </div>

        <nav class="sidebar-menu">

          <a href="${ADMIN_BASE}/dashboard/dashboard.html" class="nav-link">
            Dashboard
          </a>

          <a href="${ADMIN_BASE}/category/category.html" class="nav-link">
            Categories
          </a>

          <a href="${ADMIN_BASE}/brands/brands.html" class="nav-link">
            Brands
          </a>

          <a href="${ADMIN_BASE}/attributes/attributes.html" class="nav-link">
            Attributes
          </a>

          <a href="${ADMIN_BASE}/products/products.html" class="nav-link">
            Products
          </a>

        </nav>

        <div class="sidebar-footer">
          <a href="#" class="nav-link logout" id="logoutBtn">
            Logout
          </a>
        </div>

      </aside>
    `;
  }

  attachEvents() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        try {
          await authAPI.logout();
          window.location.href = "../../auth/login/login.html";
        } catch (err) {
          console.error("Logout failed:", err);
        }
      });
    }
  }

  setActiveLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href && path.includes(href.split("/").pop())) {
        link.classList.add("active");
      }
    });
  }
}