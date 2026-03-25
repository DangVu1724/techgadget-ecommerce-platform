import { productApi } from "../../core/api/product.api.js";
import { categoryApi } from "../../core/api/category.api.js";
import { brandApi } from "../../core/api/brand.api.js";

const state = {
  keyword: "",
  currentPage: 0,
  pageSize: 12,
  allMatchedProducts: [],
  minPrice: null,
  maxPrice: null,
  categoryId: null,
  brandId: null,
  ram: null,
  sortBy: "relevance",
  totalResults: 0,
};

const elements = {
  searchKeyword: document.getElementById("search-keyword"),
  resultsCount: document.getElementById("results-count"),
  searchInput: document.getElementById("search-input"),
  searchForm: document.getElementById("search-form"),
  productGrid: document.getElementById("productGrid"),
  pagination: document.getElementById("pagination"),
  loading: document.getElementById("loading"),
  emptyState: document.getElementById("emptyState"),
  sortSelect: document.getElementById("sort-select"),
  categoryList: document.getElementById("categoryList"),
  brandList: document.getElementById("brandList"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  clearFilters: document.getElementById("clearFilters"),
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  state.keyword = params.get("q") || "";

  attachEventListeners();
<<<<<<< HEAD
  updatePricePresetState();
=======
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe

  if (!state.keyword) {
    elements.searchKeyword.textContent = "";
    elements.resultsCount.textContent = "0";
    elements.emptyState.style.display = "flex";
    return;
  }

  elements.searchKeyword.textContent = state.keyword;
  elements.searchInput.value = state.keyword;
<<<<<<< HEAD
  syncPriceInputs();
=======
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe

  await Promise.all([loadCategories(), loadBrands()]);
  await loadProducts();
}

async function loadProducts() {
  try {
    elements.loading.style.display = "flex";
    elements.productGrid.innerHTML = "";
    elements.emptyState.style.display = "none";

    const hasFilter =
      state.categoryId ||
      state.brandId ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.ram;

    // Backend hiện tách endpoint search và filter, nên khi có filter
    // sẽ lấy danh sách theo filter rồi lọc keyword tại client.
    let products = [];
    if (hasFilter) {
      const response = await productApi.filterProducts({
        page: 0,
        size: 200,
        categoryId: state.categoryId,
        brandId: state.brandId,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        ram: state.ram,
      });
      const filteredByServer = response?.content || [];
      products = filterProductsByKeyword(filteredByServer, state.keyword);
    } else {
      const response = await productApi.search(state.keyword, {
        page: 0,
        size: 200,
      });
      products = response?.content || [];
    }

    state.allMatchedProducts = sortProducts(products);
    state.totalResults = state.allMatchedProducts.length;
    const totalPages = Math.max(
      1,
      Math.ceil(state.totalResults / state.pageSize),
    );

    elements.resultsCount.textContent = String(state.totalResults);

    if (state.totalResults === 0) {
      elements.emptyState.style.display = "flex";
      elements.pagination.innerHTML = "";
      return;
    }

    const start = state.currentPage * state.pageSize;
    const end = start + state.pageSize;
    const pagedProducts = state.allMatchedProducts.slice(start, end);
    renderProducts(pagedProducts);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error loading search products:", error);
    showErrorMessage("Lỗi khi tải sản phẩm. Vui lòng thử lại.");
  } finally {
    elements.loading.style.display = "none";
  }
}

function sortProducts(products) {
  const sorted = [...products];
  switch (state.sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
    case "popular":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "newest":
      return sorted.reverse();
    default:
      return sorted;
  }
}

function renderProducts(products) {
  elements.productGrid.innerHTML = products
    .map((product) => {
      const image = getProductImage(product);
      const description = getProductDescription(product);
      const priceHtml = product.minPrice
        ? `<strong class="price">$${Number(product.minPrice).toLocaleString()}</strong>`
        : "Liên hệ";

      return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${image}" alt="${escapeHtml(product.name || "Product")}" loading="lazy" />
          <div class="product-overlay">
            <button class="btn-quick-view" data-product-id="${product.id}">
              <i class="fas fa-eye"></i> Xem chi tiết
            </button>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">
            <a href="/modules/customer/features/product_detail/product_detail.html?id=${product.id}">${escapeHtml(product.name || "Sản phẩm")}</a>
          </h3>
          <p class="product-desc">${escapeHtml(description)}</p>
          <div class="product-price">${priceHtml}</div>
          <button class="btn-add-cart" data-product-id="${product.id}">
            <i class="fas fa-shopping-bag"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
      `;
    })
    .join("");

  elements.productGrid.querySelectorAll(".btn-quick-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.dataset.productId;
      window.location.href = `/modules/customer/features/product_detail/product_detail.html?id=${productId}`;
    });
  });

  elements.productGrid.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.dataset.productId;
      window.location.href = `/modules/customer/features/product_detail/product_detail.html?id=${productId}`;
    });
  });
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  let html =
    state.currentPage > 0
      ? `<button class="pagination-btn" data-page="${state.currentPage - 1}">Trang trước</button>`
      : "";

  for (let i = 0; i < totalPages; i += 1) {
    html += `<button class="pagination-btn ${i === state.currentPage ? "active" : ""}" data-page="${i}">${i + 1}</button>`;
  }

  html +=
    state.currentPage < totalPages - 1
      ? `<button class="pagination-btn" data-page="${state.currentPage + 1}">Trang sau</button>`
      : "";

  elements.pagination.innerHTML = html;

  elements.pagination.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
<<<<<<< HEAD
      state.currentPage =
        Number.parseInt(e.currentTarget.dataset.page, 10) || 0;
=======
      state.currentPage = Number.parseInt(e.currentTarget.dataset.page, 10) || 0;
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
      loadProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function loadCategories() {
  try {
    const categories = await categoryApi.getAll();
    elements.categoryList.innerHTML = (categories || [])
      .map(
        (cat) => `
        <label class="checkbox-label">
          <input type="checkbox" value="${cat.id}" class="category-filter" />
          ${escapeHtml(cat.name)}
        </label>
      `,
      )
      .join("");

<<<<<<< HEAD
    elements.categoryList
      .querySelectorAll(".category-filter")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          state.categoryId = e.target.checked ? e.target.value : null;
          state.currentPage = 0;
          enforceSingleChecked(".category-filter", e.target);
          loadProducts();
        });
      });
=======
    elements.categoryList.querySelectorAll(".category-filter").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        state.categoryId = e.target.checked ? e.target.value : null;
        state.currentPage = 0;
        enforceSingleChecked(".category-filter", e.target);
        loadProducts();
      });
    });
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadBrands() {
  try {
    const brands = await brandApi.getAll();
    elements.brandList.innerHTML = (brands || [])
      .map(
        (brand) => `
        <label class="checkbox-label">
<<<<<<< HEAD
          <input type="checkbox" value="${brand.brandId}" class="brand-filter" />
          ${escapeHtml(brand.brandName)}
=======
          <input type="checkbox" value="${brand.id}" class="brand-filter" />
          ${escapeHtml(brand.name)}
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
        </label>
      `,
      )
      .join("");

    elements.brandList.querySelectorAll(".brand-filter").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        state.brandId = e.target.checked ? e.target.value : null;
        state.currentPage = 0;
        enforceSingleChecked(".brand-filter", e.target);
        loadProducts();
      });
    });
  } catch (error) {
    console.error("Error loading brands:", error);
  }
}

function attachEventListeners() {
  elements.searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = elements.searchInput.value.trim();
    if (!keyword) return;

    state.keyword = keyword;
    state.currentPage = 0;
    elements.searchKeyword.textContent = keyword;
    const nextUrl = `/search?q=${encodeURIComponent(keyword)}`;
    window.history.replaceState({}, "", nextUrl);
    loadProducts();
  });

  elements.sortSelect?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    loadProducts();
  });

  elements.minPrice?.addEventListener("change", (e) => {
    state.minPrice = e.target.value ? Number(e.target.value) : null;
<<<<<<< HEAD
    normalizePriceRange();
    syncPriceInputs();
    updatePricePresetState();
=======
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
    state.currentPage = 0;
    loadProducts();
  });

  elements.maxPrice?.addEventListener("change", (e) => {
    state.maxPrice = e.target.value ? Number(e.target.value) : null;
<<<<<<< HEAD
    normalizePriceRange();
    syncPriceInputs();
    updatePricePresetState();
=======
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
    state.currentPage = 0;
    loadProducts();
  });

  document.querySelectorAll(".price-preset").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const min = Number(e.currentTarget.dataset.min);
      const max = Number(e.currentTarget.dataset.max);
<<<<<<< HEAD
      state.minPrice = min;
      state.maxPrice = max;
      syncPriceInputs();
      updatePricePresetState();
=======
      elements.minPrice.value = String(min);
      elements.maxPrice.value = String(max);
      state.minPrice = min;
      state.maxPrice = max;
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
      state.currentPage = 0;
      loadProducts();
    });
  });

  document.querySelectorAll(".ram-filter").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      state.ram = e.target.checked ? e.target.value : null;
      state.currentPage = 0;
      enforceSingleChecked(".ram-filter", e.target);
      loadProducts();
    });
  });

  elements.clearFilters?.addEventListener("click", () => {
    state.minPrice = null;
    state.maxPrice = null;
    state.categoryId = null;
    state.brandId = null;
    state.ram = null;
    state.currentPage = 0;
<<<<<<< HEAD
    syncPriceInputs();
    updatePricePresetState();
=======
    elements.minPrice.value = "";
    elements.maxPrice.value = "";
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe

    document.querySelectorAll(".checkbox-label input").forEach((input) => {
      input.checked = false;
    });
    loadProducts();
  });
}

<<<<<<< HEAD
function syncPriceInputs() {
  if (elements.minPrice) {
    elements.minPrice.value =
      state.minPrice != null ? String(state.minPrice) : "";
  }
  if (elements.maxPrice) {
    elements.maxPrice.value =
      state.maxPrice != null ? String(state.maxPrice) : "";
  }
}

function normalizePriceRange() {
  if (state.minPrice == null || state.maxPrice == null) return;
  if (state.minPrice <= state.maxPrice) return;

  const nextMin = state.maxPrice;
  state.maxPrice = state.minPrice;
  state.minPrice = nextMin;
}

function updatePricePresetState() {
  document.querySelectorAll(".price-preset").forEach((btn) => {
    const min = Number(btn.dataset.min);
    const max = Number(btn.dataset.max);
    const isActive = state.minPrice === min && state.maxPrice === max;
    btn.classList.toggle("active", isActive);
  });
}

=======
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
function enforceSingleChecked(selector, currentInput) {
  if (!currentInput.checked) return;
  document.querySelectorAll(selector).forEach((input) => {
    if (input !== currentInput) input.checked = false;
  });
}

function getProductImage(product) {
  return (
    product.image ||
    product.thumbnail ||
    product.imageUrl ||
    "/modules/customer/assets/images/default-pro.png"
  );
}

function getProductDescription(product) {
  if (product.shortDescription) return product.shortDescription;
  if (product.description) return product.description;
  if (product.categoryName && product.brandName) {
    return `${product.brandName} - ${product.categoryName}`;
  }
  if (product.categoryName) return `Danh mục: ${product.categoryName}`;
  return "Sản phẩm công nghệ chính hãng, bảo hành tốt.";
}

function filterProductsByKeyword(products, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return products || [];

  return (products || []).filter((product) =>
    normalizeText(product?.name).includes(normalizedKeyword),
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function normalizeText(text) {
  return String(text || "").toLowerCase();
}

function showErrorMessage(message) {
  elements.emptyState.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Lỗi</h3>
    <p>${message}</p>
    <a href="/shop" class="btn-back">Quay lại cửa hàng</a>
  `;
  elements.emptyState.style.display = "flex";
}

<<<<<<< HEAD
init();
=======
init();
>>>>>>> 0d1447f841e86f3d9bd36e4a4c807fa3fab006fe
