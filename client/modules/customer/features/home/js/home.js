import { categoryApi } from "/modules/customer/core/api/category.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";
import { productApi } from "/modules/customer/core/api/product.api.js";
import { popupApi } from "/modules/customer/core/api/popup.api.js";
import { showToast } from "/shared/ui/toast.js";

const categoryImages = {
  smartphone: "/modules/customer/assets/images/categories/phone.jpg",
  laptop: "/modules/customer/assets/images/categories/mac.jpg",
  headphone: "/modules/customer/assets/images/categories/headphone.png",
  tablet: "/modules/customer/assets/images/categories/tablet.png",
  camera: "/modules/customer/assets/images/categories/camera.png",
};

async function loadCategories() {
  const container = document.getElementById("categoryList");
  if (!container) return;

  try {
    const categories = await categoryApi.getAll();
    container.innerHTML = "";

    categories.forEach((category) => {
      const key = (category.name || "").toLowerCase();
      const image =
        categoryImages[key] ||
        "/modules/customer/assets/images/categories/default.png";

      const card = document.createElement("div");
      card.className = "cat-card";
      const url = `/modules/customer/features/shop/shop.html?categoryId=${category.id || ""}&categoryName=${encodeURIComponent(category.name || "")}`;
      card.innerHTML = `
        <a href="${url}" class="cat-link">
          <div class="cat-icon"><img src="${image}" alt="${category.name}"></div>
          <p>${category.name}</p>
        </a>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

async function loadBrands() {
  const container = document.getElementById("brandList");
  if (!container) return;

  try {
    const brands = await brandApi.getAll();
    container.innerHTML = "";

    brands.forEach((brand) => {
      const item = document.createElement("a");
      item.className = "brand-item";
      item.href = `/modules/customer/features/shop/shop.html?brandId=${brand.brandId || ""}&brandName=${encodeURIComponent(brand.brandName || "")}`;
      item.textContent = capitalizeFirstLetter(brand.brandName);
      container.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to load brands:", error);
  }
}

function capitalizeFirstLetter(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

async function loadNewProducts() {
  const container = document.getElementById("newProductList");
  if (!container) return;

  try {
    const products = await productApi.getNewest(5);
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "home-product-card";

      const image =
        product.image || "/modules/customer/assets/images/macbook.png";
      const price = formatPrice(product.minPrice);
      const promos = [
        "Save 5% today",
        "Bonus $20 voucher",
        "Free shipping nationwide",
        "Weekend deal",
      ];
      const promoText = promos[Math.floor(Math.random() * promos.length)];

      card.innerHTML = `
        <a href="/modules/customer/features/product_detail/product_detail.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <span class="badge-new">NEW</span>
            <img src="${image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <div class="product-promo"><i class="fas fa-bolt"></i><span>${promoText}</span></div>
            <div class="product-rating">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
              <span>(124)</span>
            </div>
            <div class="product-price">${price}</div>
          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load new products:", error);
  }
}

async function loadBestSellingProducts() {
  const container = document.getElementById("bestSellingProductList");
  if (!container) return;

  try {
    const products = await productApi.getTopSelling(5);
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "home-product-card";
      const image =
        product.image || "/modules/customer/assets/images/macbook.png";
      const price = formatPrice(product.minPrice);

      card.innerHTML = `
        <a href="/modules/customer/features/product_detail/product_detail.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <span class="badge-new">BEST SELLER</span>
            <img src="${image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <div class="product-rating">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
              <span>(124)</span>
            </div>
            <div class="product-price">${price}</div>
          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load top selling products:", error);
  }
}

async function initHome() {
  try {
    await Promise.all([
      loadCategories(),
      loadBrands(),
      loadNewProducts(),
      loadBestSellingProducts(),
    ]);
    await loadPromotionPopup();
  } catch (error) {
    console.error("Home initialization failed:", error);
    showToast("Some homepage sections could not be loaded.", "warning");
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function canShowPromotionPopup() {
  return !sessionStorage.getItem('popupShown');
}

function savePopupShownTime() {
  sessionStorage.setItem('popupShown', '1');
}

// Sửa lại hàm loadPromotionPopup
async function loadPromotionPopup() {
  try {
    if (!canShowPromotionPopup()) {
      console.log('Popup will show after 15 minutes from last display');
      return;
    }
    
    const popup = await popupApi.getActive();
    if (!popup) return;
    
    const delaySeconds = Number(popup.displayDelay || 0);
    const delayMs = Math.max(0, delaySeconds) * 1000;
    
    setTimeout(() => {
      renderPromotionPopup(popup);
      savePopupShownTime();
    }, delayMs);
  } catch (error) {
    console.error("Failed to load promotion popup:", error);
  }
}

function renderPromotionPopup(popup) {
  if (!popup) return;

  const existing = document.querySelector(".promo-popup-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "promo-popup-overlay";

  const couponCode = popup.couponCode || "";
  const shopLink = couponCode
    ? `/modules/customer/features/shop/shop.html?coupon=${encodeURIComponent(couponCode)}`
    : "/modules/customer/features/shop/shop.html";
  const imageUrl = resolvePopupImage(popup.imageUrl);

  const targetLink = popup.productId ? `/products/${popup.productId}` : "/shop";

  overlay.innerHTML = `
    <div class="promo-popup">
      <button class="promo-popup-close" aria-label="Close">x</button>
      <a class="promo-popup-link" href="${targetLink}">
        <div class="promo-popup-media">
          <img src="${imageUrl}" alt="${popup.title}">
        </div>
      </a>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const closePopup = () => {
    overlay.remove();
    document.body.style.overflow = "";
  };

  overlay
    .querySelector(".promo-popup-close")
    ?.addEventListener("click", closePopup);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePopup();
    }
  });
}

function resolvePopupImage(imageUrl) {
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl && imageUrl.startsWith("/")) {
    return `http://localhost:8080${imageUrl}`;
  }

  return imageUrl || "/modules/customer/assets/images/banner1.png";
}

document.addEventListener("DOMContentLoaded", initHome);

document.addEventListener("DOMContentLoaded", () => {
  const slider = {
    wrapper: document.querySelector(".slider-wrapper"),
    slides: document.querySelectorAll(".slide"),
    dots: document.querySelectorAll(".dot"),
    prevBtn: document.querySelector(".slider-arrow.prev"),
    nextBtn: document.querySelector(".slider-arrow.next"),
    currentIndex: 0,
    slideCount: 0,
    autoPlayInterval: null,

    init() {
      this.slideCount = this.slides.length;
      if (this.slideCount === 0) return;

      this.showSlide(this.currentIndex);
      this.prevBtn?.addEventListener("click", () => this.prevSlide());
      this.nextBtn?.addEventListener("click", () => this.nextSlide());
      this.dots.forEach((dot, index) => {
        dot.addEventListener("click", () => this.goToSlide(index));
      });
      this.startAutoPlay();

      const sliderContainer = document.querySelector(".slider-container");
      sliderContainer?.addEventListener("mouseenter", () =>
        this.pauseAutoPlay(),
      );
      sliderContainer?.addEventListener("mouseleave", () =>
        this.startAutoPlay(),
      );
      this.setupTouchEvents();
    },

    showSlide(index) {
      if (index < 0) index = this.slideCount - 1;
      if (index >= this.slideCount) index = 0;
      this.wrapper.style.transform = `translateX(-${index * 100}%)`;
      this.slides.forEach((slide) => slide.classList.remove("active"));
      this.slides[index]?.classList.add("active");
      this.dots.forEach((dot) => dot.classList.remove("active"));
      this.dots[index]?.classList.add("active");
      this.currentIndex = index;
    },

    nextSlide() {
      this.showSlide(this.currentIndex + 1);
    },
    prevSlide() {
      this.showSlide(this.currentIndex - 1);
    },
    goToSlide(index) {
      this.showSlide(index);
    },

    startAutoPlay() {
      if (this.autoPlayInterval) return;
      this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    },

    pauseAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    },

    setupTouchEvents() {
      let startX = 0;
      let endX = 0;

      this.wrapper?.addEventListener("touchstart", (event) => {
        startX = event.touches[0].clientX;
      });

      this.wrapper?.addEventListener("touchend", (event) => {
        endX = event.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.nextSlide() : this.prevSlide();
        }
      });
    },
  };

  slider.init();
});
