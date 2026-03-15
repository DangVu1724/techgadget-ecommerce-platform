// Header Component
class HeaderComponent {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  // Lấy tên trang hiện tại từ URL - Cập nhật cho đường dẫn features/
  getCurrentPage() {
    const path = window.location.pathname;

    // Log để debug (có thể xóa sau)
    console.log("Current path:", path);

    // TH1: Trang chủ
    if (path === "/" || path === "/index.html" || path.includes("home.html")) {
      return "home";
    }

    // TH2: Tách lấy tên file từ đường dẫn (shop.html, blog.html, etc)
    const fileName = path.split("/").pop(); // Lấy phần cuối cùng sau dấu /
    const pageName = fileName.split(".")[0]; // Bỏ phần .html

    console.log("Page name:", pageName);

    // Kiểm tra xem pageName có phải là trang hợp lệ không
    const validPages = ["home", "shop", "blog", "pages", "contact"];

    if (validPages.includes(pageName)) {
      return pageName;
    }

    // TH3: Nếu không tìm thấy, mặc định là home
    return "home";
  }

  // Load header vào trang
  async loadHeader() {
    try {
      // Xác định đường dẫn đến file header.html
      const headerPath = this.getHeaderPath();

      const response = await fetch(headerPath);
      const headerHtml = await response.text();

      // Kiểm tra xem đã có header chưa, nếu có thì xóa đi
      const existingHeader = document.querySelector("header");
      const existingTopBar = document.querySelector(".top-bar");

      if (existingHeader) existingHeader.remove();
      if (existingTopBar) existingTopBar.remove();

      // Chèn header vào đầu body
      document.body.insertAdjacentHTML("afterbegin", headerHtml);

      // Active menu dựa trên trang hiện tại
      this.activeCurrentMenu();

      // Load CSS cho header
      this.loadHeaderCSS();
    } catch (error) {
      console.error("Error loading header:", error);
      this.createDefaultHeader();
    }
  }

  // Xác định đường dẫn đến file header.html
  getHeaderPath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;

    if (path.includes("features/")) {
      return "/modules/customer/components/header/header.html";
    } else {
      return "/modules/customer/components/header/header.html";
    }
  }

  // Active menu hiện tại
  activeCurrentMenu() {
    const navLinks = document.querySelectorAll(".nav-link");
    console.log("Current page:", this.currentPage); // Debug

    navLinks.forEach((link) => {
      const page = link.dataset.page;
      if (page === this.currentPage) {
        link.classList.add("active");
        console.log("Active menu:", page); // Debug
      } else {
        link.classList.remove("active");
      }

      // Thêm sự kiện click
      link.addEventListener("click", function (e) {
        // Không remove active ngay vì sẽ chuyển trang
        // Để lại cho trang mới xử lý
      });
    });
  }

  // Load CSS cho header
  loadHeaderCSS() {
    const cssPath = "/modules/customer/assets/css/header.css";

    if (!document.querySelector('link[href*="header.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }
  }

  // Tạo header mặc định
  createDefaultHeader() {
    const defaultHeader = `
            <div class="top-bar">
                <div class="container flex-between">
                    <span>Free shipping on all orders over $99!</span>
                    <div class="top-links">Track Order | Help | Shop</div>
                </div>
            </div>
            <header>
                <div class="container flex-between">
                    <div class="logo">SHOP<span>LITE</span></div>
                    <nav>
                        <a href="/modules/customer/features/home/home.html" class="nav-link ${this.currentPage === "home" ? "active" : ""}" data-page="home">HOME</a>
                        <a href="/modules/customer/features/shop/shop.html" class="nav-link ${this.currentPage === "shop" ? "active" : ""}" data-page="shop">SHOP</a>
                        <a href="/modules/customer/features/blog/blog.html" class="nav-link ${this.currentPage === "blog" ? "active" : ""}" data-page="blog">BLOG</a>
                        <a href="/modules/customer/features/pages/pages.html" class="nav-link ${this.currentPage === "pages" ? "active" : ""}" data-page="pages">PAGES</a>
                        <a href="/modules/customer/features/contact/contact.html" class="nav-link ${this.currentPage === "contact" ? "active" : ""}" data-page="contact">CONTACT</a>
                    </nav>
                    <div class="header-icons">
                        <i class="fas fa-search"></i>
                        <i class="far fa-user"></i>
                        <i class="far fa-heart"></i>
                        <div class="cart-icon">
                            <i class="fas fa-shopping-bag"></i>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </header>
        `;
    document.body.insertAdjacentHTML("afterbegin", defaultHeader);
  }

  // Khởi tạo
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.loadHeader());
    } else {
      this.loadHeader();
    }
  }
}

// Khởi tạo header
new HeaderComponent();
