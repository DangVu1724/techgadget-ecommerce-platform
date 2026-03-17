// Header Component với Search functionality
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { cartAPI } from "/modules/customer/core/api/cart.api.js";

class HeaderComponent {
  constructor() {
    this.init();
  }

  async loadHeader() {
    try {
      const response = await fetch(
        "/modules/customer/components/header/header.html",
      );
      const headerHtml = await response.text();

      // Xóa header cũ
      document.querySelector("header")?.remove();
      document.querySelector(".top-bar")?.remove();

      document.body.insertAdjacentHTML("afterbegin", headerHtml);
      this.initSearch();
      this.updateUserAccount();
      this.loadHeaderCSS();
      await this.loadCartCount();
    } catch (error) {
      console.error("Error loading header:", error);
    }
  }

  updateUserAccount() {
    const userAccountLink = document.getElementById("user-account-link");
    const userAccountText = document.getElementById("user-account-text");

    if (authAPI.isLoggedIn()) {
      const user = authAPI.getUser();
      if (user && user.fullName) {
        // Lấy tên đầu tiên từ fullName
        const firstName = user.fullName.split(" ")[0];
        userAccountText.textContent = firstName;
        userAccountLink.href = "/account";
      }
    } else {
      // Chưa đăng nhập
      userAccountLink.href = "/login";
      userAccountText.textContent = "Account";
    }
  }

  async loadCartCount() {
    const cartCountEl = document.getElementById("cart-count");
    if (!cartCountEl) return;

    if (!authAPI.isLoggedIn()) {
      cartCountEl.style.display = "none";
      return;
    }

    try {
      const cart = await cartAPI.getCart();

      // Tính total items từ items array
      const totalItems = cart.items
        ? cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;

      cartCountEl.textContent = totalItems > 0 ? totalItems : "";
      cartCountEl.style.display = totalItems > 0 ? "inline-block" : "none";
      console.log("Cart count updated:", totalItems);
    } catch (error) {
      console.error("Error loading cart count:", error);
      cartCountEl.style.display = "none";
    }
  }

  initSearch() {
    const searchInput = document.querySelector(".search-input");
    const searchForm = document.querySelector(".search-form");

    if (searchInput) {
      // Xử lý tìm kiếm realtime (optional)
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
          this.getSearchSuggestions(query);
        }
      });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      });
    }
  }

  getSearchSuggestions(query) {
    // Call API để lấy gợi ý tìm kiếm
    console.log("Searching for:", query);
    // Implement API call here
  }

  loadHeaderCSS() {
    if (!document.querySelector('link[href*="header.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/modules/customer/assets/css/header.css";
      document.head.appendChild(link);
    }
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.loadHeader();
        this.loadCartCount();
      });
    } else {
      this.loadHeader();
      this.loadCartCount();
    }

    window.addEventListener("cartUpdated", async () => {
      await this.loadCartCount();
    });

    window.addEventListener("logout", () => {
      this.loadCartCount();
    });
  }
}

// Khởi tạo
new HeaderComponent();
