import { categoryApi } from "/modules/customer/core/api/category.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";
import { productApi } from "/modules/customer/core/api/product.api.js";

const categoryImages = {
  // smartphone: "/assets/images/categories/smartphone.png",
  // laptop: "/assets/images/categories/laptop.png",
  // headphone: "/assets/images/categories/headphone.png",
  // tablet: "/assets/images/categories/tablet.png",
  // camera: "/assets/images/categories/camera.png",
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
    const key = category.name.toLowerCase();
    const image = categoryImages[key] || "/modules/customer/assets/images/categories/default.png";

    const card = document.createElement("div");
    card.className = "cat-card";
    card.innerHTML = `
      <img src="${image}" alt="${category.name}">
      <p>${category.name}</p>
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
    const item = document.createElement("span");
    item.className = "brand-item";
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
    const res = await productApi.getAll({
      page: 0,
      size: 5,
    });

    const products = res.content;
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-main";

      const image = product.thumbnail || "/modules/customer/assets/images/macbook.png";

      // CẬP NHẬT: Thẻ <a> bao bọc ảnh và tiêu đề để click chuyển trang
      card.innerHTML = `
        <a href="/modules/customer/features/product_detail/product_detail.html" class="product-link" style="text-decoration: none; color: inherit; display: block;">
          <div class="p-img-box">
            <img src="${image}" alt="${product.name}">
          </div>
          <h4>${product.name}</h4>
        </a>
        <p class="p-price">${formatPrice(product.minPrice)}</p>
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
    const res = await productApi.getAll({
      page: 0,
      size: 5,
    });

    const products = res.content;
    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-main";

      const image = product.thumbnail || "/modules/customer/assets/images/macbook.png";

      // CẬP NHẬT: Kết nối đồng bộ với trang chi tiết
      card.innerHTML = `
        <a href="/modules/customer/features/product_detail/product_detail.html" class="product-link" style="text-decoration: none; color: inherit; display: block;">
          <div class="p-img-box">
            <img src="${image}" alt="${product.name}">
          </div>
          <h4>${product.name}</h4>
        </a>
        <p class="p-price">${formatPrice(product.minPrice)}</p>
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