class FooterComponent {
  constructor() {
    this.init();
  }

  getFooterPath() {
    return "/modules/customer/components/footer/footer.html";
  }

  async loadFooter() {
    try {
      const response = await fetch(this.getFooterPath());
      const footerHtml = await response.text();

      const existingFooter = document.querySelector("footer.footer");
      if (existingFooter) existingFooter.remove();

      document.body.insertAdjacentHTML("beforeend", footerHtml);
      this.loadFooterCSS();
    } catch (error) {
      console.error("Error loading footer:", error);
    }
  }

  loadFooterCSS() {
    const cssPath = "/modules/customer/assets/css/footer.css";
    if (!document.querySelector(`link[href='${cssPath}']`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.loadFooter());
    } else {
      this.loadFooter();
    }
  }
}

new FooterComponent();
