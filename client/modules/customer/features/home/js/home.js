import { categoryApi } from "/modules/customer/core/api/category.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";
import { productApi } from "/modules/customer/core/api/product.api.js";

const categoryImages = {
  smartphone: "/modules/customer/assets/images/categories/phone.jpg",
  laptop: "/modules/customer/assets/images/categories/mac.jpg",
  headphone: "/modules/customer/assets/images/categories/headphone.png",
  tablet: "/modules/customer/assets/images/categories/tablet.png",
  camera: "/modules/customer/assets/images/categories/camera.png",
};

/**
 * Tải danh mục sản phẩm
 */
async function loadCategories() {
  const container = document.getElementById("categoryList");
  if (!container) return;

  const categories = await categoryApi.getAll();
  container.innerHTML = "";

  categories.forEach((category) => {
    const key = (category.name || "").toLowerCase();
    const image =
      categoryImages[key] ||
      "/modules/customer/assets/images/categories/default.png";

    const card = document.createElement("div");
    card.className = "cat-card";
    const url = `/modules/customer/features/shop/shop.html?categoryId=${category.id || ""}&categoryName=${encodeURIComponent(
      category.name || "",
    )}`;
    card.innerHTML = `
  <a href="${url}" class="cat-link">
    <div class="cat-icon">
      <img src="${image}" alt="${category.name}">
    </div>
    <p>${category.name}</p>
  </a>
`;
    container.appendChild(card);
  });
}

/**
 * Tải danh sách thương hiệu
 */
async function loadBrands() {
  const container = document.getElementById("brandList");
  if (!container) return;

  const brands = await brandApi.getAll();
  container.innerHTML = "";

  brands.forEach((brand) => {
    const item = document.createElement("a");
    item.className = "brand-item";
    item.href = `/modules/customer/features/shop/shop.html?brandId=${brand.brandId || ""}&brandName=${encodeURIComponent(
      brand.brandName || "",
    )}`;
    item.textContent = capitalizeFirstLetter(brand.brandName);
    container.appendChild(item);
  });
}

/**
 * Viết hoa chữ cái đầu
 */
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Tải sản phẩm mới (Có kết nối trang chi tiết)
 */
async function loadNewProducts() {
  const container = document.getElementById("newProductList");
  if (!container) return;

  try {
    const res = await productApi.getNewest(5);

    const products = res;
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "home-product-card";

      const image =
        product.image || "/modules/customer/assets/images/macbook.png";

      const price = formatPrice(product.minPrice);

      const promos = [
        "Giảm 5% hôm nay",
        "Tặng voucher $20",
        "Free ship toàn quốc",
        "Ưu đãi cuối tuần",
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

            <div class="product-promo">
             <i class="fas fa-bolt"></i>
              <span>${promoText}</span>
            </div>

            <div class="product-rating">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="far fa-star"></i>
              <span>(124)</span>
            </div>

            <div class="product-price">
              ${price}
            </div>

          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Lỗi tải sản phẩm mới:", error);
  }
}

/**
 * Tải sản phẩm bán chạy (Có kết nối trang chi tiết)
 */
async function loadBestSellingProducts() {
  const container = document.getElementById("bestSellingProductList");
  if (!container) return;

  try {
    const res = await productApi.getTopSelling(5);

    const products = res;
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
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="far fa-star"></i>
              <span>(124)</span>
            </div>

            <div class="product-price">
              ${price}
            </div>

          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Lỗi tải sản phẩm bán chạy:", error);
  }
}

/**
 * Khởi tạo trang Home
 */
async function initHome() {
  await Promise.all([
    loadCategories(),
    loadBrands(),
    loadNewProducts(),
    loadBestSellingProducts(),
  ]);
}

/**
 * Định dạng tiền tệ
 */
function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// Lắng nghe sự kiện khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initHome);

// Hero Slider functionality
document.addEventListener("DOMContentLoaded", function () {
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

      // Set initial active slide
      this.showSlide(this.currentIndex);

      // Event listeners
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.prevSlide());
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.nextSlide());
      }

      // Dot navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener("click", () => this.goToSlide(index));
      });

      // Auto play
      this.startAutoPlay();

      // Pause on hover
      const sliderContainer = document.querySelector(".slider-container");
      if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", () =>
          this.pauseAutoPlay(),
        );
        sliderContainer.addEventListener("mouseleave", () =>
          this.startAutoPlay(),
        );
      }

      // Touch events for mobile
      this.setupTouchEvents();
    },

    showSlide(index) {
      if (index < 0) index = this.slideCount - 1;
      if (index >= this.slideCount) index = 0;

      // Update wrapper position
      this.wrapper.style.transform = `translateX(-${index * 100}%)`;

      // Update active states
      this.slides.forEach((slide) => slide.classList.remove("active"));
      this.slides[index].classList.add("active");

      this.dots.forEach((dot) => dot.classList.remove("active"));
      this.dots[index].classList.add("active");

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

      this.wrapper.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
      });

      this.wrapper.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          // Minimum swipe distance
          if (diff > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        }
      });
    },
  };

  slider.init();
});
