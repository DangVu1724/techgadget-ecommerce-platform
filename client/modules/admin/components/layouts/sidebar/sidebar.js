import { authAPI } from "/modules/admin/core/api/auth.api.js";

const ADMIN_BASE = "/admin";
export class Sidebar {
  constructor() {
    this.init();
  }

  async init() {
    this.render();
    this.setActiveLink();
    this.initLogout(); // Gọi hàm initLogout
  }

  render() {
    const sidebarContainer = document.getElementById("sidebar-container");

    sidebarContainer.innerHTML = `
      <aside class="sidebar">

        <div class="sidebar-title">
          Tech Admin
        </div>

        <nav class="sidebar-menu">

          <a href="${ADMIN_BASE}/dashboard" class="nav-link">
            Dashboard
          </a>

          <a href="${ADMIN_BASE}/category" class="nav-link">
            Categories
          </a>

          <a href="${ADMIN_BASE}/brands" class="nav-link">
            Brands
          </a>

          <a href="${ADMIN_BASE}/attributes" class="nav-link">
            Attributes
          </a>

          <a href="${ADMIN_BASE}/products" class="nav-link">
            Products
          </a>

          <a href="${ADMIN_BASE}/order" class="nav-link">
            Orders
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

  initLogout() {
    // Sửa từ const thành method
    const logoutBtn = document.getElementById("logoutBtn"); // Sửa id từ "logout-link" thành "logoutBtn"

    if (logoutBtn) {
      // Kiểm tra element tồn tại
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
          authAPI.logout();
          alert("Đã đăng xuất thành công!");
          window.location.href = "/home";
        }
      });
    }
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
