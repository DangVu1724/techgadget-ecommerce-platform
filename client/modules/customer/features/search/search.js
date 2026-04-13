import { productApi } from "../../core/api/product.api.js";

const SORT_CONFIG = {
  relevance: null,
  "price-asc": { sortBy: "minPrice", sortDir: "asc" },
  "price-desc": { sortBy: "minPrice", sortDir: "desc" },
  newest: { sortBy: "createdAt", sortDir: "desc" },
  popular: null,
};

const state = {
  keyword: "",
  currentPage: 0,
  pageSize: 12,
  totalResults: 0,
  sortBy: "relevance",
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
};

const formatPrice = (value) => {
  if (!value || isNaN(value)) return "Contact Us";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  state.keyword = params.get("q") || "";

  attachEventListeners();

  if (!state.keyword) {
    elements.searchKeyword.textContent = "";
    elements.resultsCount.textContent = "0";
    elements.emptyState.style.display = "flex";
    return;
  }

  elements.searchKeyword.textContent = state.keyword;
  elements.searchInput.value = state.keyword;
  await loadProducts();
}

async function loadProducts() {
  if (!state.keyword) {
    elements.productGrid.innerHTML = "";
    elements.pagination.innerHTML = "";
    elements.resultsCount.textContent = "0";
    elements.emptyState.style.display = "flex";
    return;
  }

  try {
    elements.loading.style.display = "flex";
    elements.productGrid.innerHTML = "";
    elements.emptyState.style.display = "none";

    const sortConfig = SORT_CONFIG[state.sortBy] || null;
    const response = await productApi.filterProducts({
      page: state.currentPage,
      size: state.pageSize,
      keyword: state.keyword,
      sortBy: sortConfig?.sortBy,
      sortDir: sortConfig?.sortDir,
    });

    const products = response?.content || [];
    state.totalResults = response?.totalElements || products.length;
    elements.resultsCount.textContent = String(state.totalResults);

    if (!products.length) {
      elements.emptyState.style.display = "flex";
      elements.pagination.innerHTML = "";
      return;
    }

    renderProducts(sortProducts(products));
    renderPagination(response?.totalPages || 1);
  } catch (error) {
    console.error("Error loading search products:", error);
    showErrorMessage("Error loading products. Please try again.");
  } finally {
    elements.loading.style.display = "none";
  }
}

function sortProducts(products) {
  const sorted = [...products];
  if (state.sortBy === "popular") {
    return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return sorted;
}

function renderProducts(products) {
  elements.productGrid.innerHTML = products
    .map((product) => {
      const image = getProductImage(product);
      const description = getProductDescription(product);
      const priceHtml = `<strong class="price">${formatPrice(product.minPrice)}</strong>`;

      return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${image}" alt="${escapeHtml(product.name || "Product")}" loading="lazy" />
          <div class="product-overlay">
            <button class="btn-quick-view" data-product-id="${product.id}">
              <i class="fas fa-eye"></i> Details
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
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
      `;
    })
    .join("");

  elements.productGrid.querySelectorAll(".btn-quick-view").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const productId = event.currentTarget.dataset.productId;
      window.location.href = `/modules/customer/features/product_detail/product_detail.html?id=${productId}`;
    });
  });

  elements.productGrid.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const productId = event.currentTarget.dataset.productId;
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
      ? `<button class="pagination-btn" data-page="${state.currentPage - 1}">Previous</button>`
      : "";

  for (let page = 0; page < totalPages; page += 1) {
    html += `<button class="pagination-btn ${page === state.currentPage ? "active" : ""}" data-page="${page}">${page + 1}</button>`;
  }

  html +=
    state.currentPage < totalPages - 1
      ? `<button class="pagination-btn" data-page="${state.currentPage + 1}">Next</button>`
      : "";

  elements.pagination.innerHTML = html;
  elements.pagination.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      state.currentPage =
        Number.parseInt(event.currentTarget.dataset.page, 10) || 0;
      loadProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function attachEventListeners() {
  elements.searchForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const keyword = elements.searchInput.value.trim();
    if (!keyword) return;

    state.keyword = keyword;
    state.currentPage = 0;
    elements.searchKeyword.textContent = keyword;
    window.history.replaceState(
      {},
      "",
      `/search?q=${encodeURIComponent(keyword)}`,
    );
    await loadProducts();
  });

  elements.sortSelect?.addEventListener("change", async (event) => {
    state.sortBy = event.target.value;
    state.currentPage = 0;
    await loadProducts();
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
  if (product.categoryName) return `Category: ${product.categoryName}`;
  return "Genuine tech products with good warranty.";
}

// Lấy thẻ button
const backToTopBtn = document.getElementById("backToTop");

// Theo dõi sự kiện cuộn chuột
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  // Nếu cuộn xuống quá 300px thì hiện nút, ngược lại thì ẩn
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
}

// Khi người dùng nhấn vào nút
backToTopBtn.onclick = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Cuộn mượt mà
  });
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showErrorMessage(message) {
  elements.emptyState.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Error</h3>
    <p>${message}</p>
    <a href="/shop" class="btn-back">Back to Shop</a>
  `;
  elements.emptyState.style.display = "flex";
}

init();
