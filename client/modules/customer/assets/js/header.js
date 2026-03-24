import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { cartAPI } from "/modules/customer/core/api/cart.api.js";

class HeaderComponent {
  constructor() {
    this.init();
  }

  async loadHeader() {
    try {
      const response = await fetch("/modules/customer/components/header/header.html");
      const headerHtml = await response.text();

      document.querySelector("header")?.remove();
      document.querySelector(".top-bar")?.remove();

      document.body.insertAdjacentHTML("afterbegin", headerHtml);
      this.initSearch();
      this.updateUserAccount();
      this.loadHeaderCSS();
      await this.loadCartCount();
      
      // Trigger event to notify header.js script that DOM is ready
      window.dispatchEvent(new Event("header-loaded"));
    } catch (error) {
      console.error("Error loading header:", error);
    }
  }

  updateUserAccount() {
    const userAccountLink = document.getElementById("user-account-link");
    const userAccountText = document.getElementById("user-account-text");
    if (!userAccountLink || !userAccountText) return;

    if (authAPI.isLoggedIn()) {
      const user = authAPI.getUser();
      const firstName = user?.fullName?.split(" ")?.[0];
      userAccountText.textContent = firstName || "Account";
      userAccountLink.href = "/account";
      return;
    }

    userAccountLink.href = "/login";
    userAccountText.textContent = "Account";
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
      const totalItems = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      cartCountEl.textContent = totalItems > 0 ? totalItems : "";
      cartCountEl.style.display = totalItems > 0 ? "inline-block" : "none";
    } catch (error) {
      console.error("Error loading cart count:", error);
      cartCountEl.style.display = "none";
    }
  }

  initSearch() {
    // Load header search functionality
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/modules/customer/components/header/header.js";
    document.body.appendChild(script);
  }

  loadHeaderCSS() {
    if (document.querySelector('link[href*="header.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/modules/customer/assets/css/header.css";
    document.head.appendChild(link);
  }

  init() {
    const load = () => {
      this.loadHeader();
      this.loadCartCount();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", load);
    } else {
      load();
    }

    window.addEventListener("cartUpdated", () => this.loadCartCount());
    window.addEventListener("login", () => {
      this.updateUserAccount();
      this.loadCartCount();
    });
    window.addEventListener("logout", () => {
      this.updateUserAccount();
      this.loadCartCount();
    });
  }
}

new HeaderComponent();
