// Header Component với Search functionality
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
      this.loadHeaderCSS();
    } catch (error) {
      console.error("Error loading header:", error);
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
      document.addEventListener("DOMContentLoaded", () => this.loadHeader());
    } else {
      this.loadHeader();
    }
  }
}

// Khởi tạo
new HeaderComponent();
