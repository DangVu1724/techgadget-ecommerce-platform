import { productApi } from "/modules/customer/core/api/product.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";
import { categoryApi } from "/modules/customer/core/api/category.api.js";
import { createAdvancedFilterPanel } from "./advanced-filter-panel.js";
import { transformProductFilters } from "./product-filters.shared.js";

const SORT_CONFIG = {
  default: null,
  "price-asc": { sortBy: "minPrice", sortDir: "asc" },
  "price-desc": { sortBy: "minPrice", sortDir: "desc" },
  "name-asc": { sortBy: "name", sortDir: "asc" },
  "name-desc": { sortBy: "name", sortDir: "desc" },
  newest: { sortBy: "createdAt", sortDir: "desc" },
};

const state = {
  currentProducts: [],
  currentPage: 1,
  totalPages: 1,
  queryParams: {},
  categoryBrands: [],
  dynamicFilterContext: {
    categoryId: null,
    brandId: null,
  },
  dynamicFilters: [],
  PAGE_SIZE: 20,
};

const elements = {
  productList: null,
  shopSkeleton: null,
  emptyMessage: null,
  pagination: null,
  breadcrumb: null,
  categoryBrandsWrapper: null,
  categoryBrandList: null,
  filterLabel: null,
  sortSelect: null,
  filterDropdown: null,
  advancedFilters: null,
  toggleFilters: null,
  filterBadge: null,
  filterSummary: null,
  minPrice: null,
  maxPrice: null,
  applyFilters: null,
  clearFilters: null,
  dynamicFilterSections: null,
};

let advancedFilterPanel;

const initElements = () => {
  elements.productList = document.getElementById("productList");
  elements.shopSkeleton = document.getElementById("shopSkeleton");
  elements.emptyMessage = document.getElementById("emptyMessage");
  elements.pagination = document.getElementById("pagination");
  elements.breadcrumb = document.getElementById("breadcrumb");
  elements.categoryBrandsWrapper = document.getElementById(
    "categoryBrandsWrapper",
  );
  elements.categoryBrandList = document.getElementById("categoryBrandList");
  elements.filterLabel = document.getElementById("filterLabel");
  elements.sortSelect = document.getElementById("sortSelect");
  elements.filterDropdown = document.getElementById("filterDropdown");
  elements.advancedFilters = document.getElementById("advancedFilters");
  elements.toggleFilters = document.getElementById("toggleFilters");
  elements.filterBadge = document.getElementById("filterBadge");
  elements.filterSummary = document.getElementById("filterSummary");
  elements.minPrice = document.getElementById("minPrice");
  elements.maxPrice = document.getElementById("maxPrice");
  elements.applyFilters = document.getElementById("applyFilters");
  elements.clearFilters = document.getElementById("clearFilters");
  elements.dynamicFilterSections = document.getElementById(
    "dynamicFilterSections",
  );
};

const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    categoryId: params.get("categoryId"),
    categoryName: params.get("categoryName"),
    brandId: params.get("brandId"),
    brandName: params.get("brandName"),
    page: params.get("page"),
    sort: params.get("sort") || "default",
  };
};

const getPageFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  return page && !Number.isNaN(page) && page > 0 ? page : 1;
};

const updatePageInUrl = (page) => {
  const params = new URLSearchParams(window.location.search);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState({}, "", url);
};

const updateQueryParamsInUrl = (updates = {}) => {
  const params = new URLSearchParams(window.location.search);

  Object.entries(updates).forEach(([key, value]) => {
    if (value == null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState({}, "", url);
};

const getSortParams = (sortValue) => SORT_CONFIG[sortValue] || null;

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const renderBreadcrumb = (categoryName, brandName) => {
  if (!elements.breadcrumb) return;

  const fragments = [{ name: "Home", href: "/" }];

  if (categoryName) {
    fragments.push({
      name: capitalize(categoryName),
      href: `/modules/customer/features/shop/shop.html?categoryId=${state.queryParams.categoryId}`,
    });
  }

  if (brandName) {
    fragments.push({ name: capitalize(brandName), href: "#" });
  }

  elements.breadcrumb.innerHTML = fragments
    .map((item, index) =>
      index === fragments.length - 1
        ? `<span class="breadcrumb-item active">${item.name}</span>`
        : `<a href="${item.href}" class="breadcrumb-item">${item.name}</a>`,
    )
    .join('<span class="breadcrumb-separator">/</span>');
};

const showSkeleton = () => {
  elements.shopSkeleton?.classList.remove("hidden");
  elements.productList?.classList.add("hidden");
  elements.emptyMessage?.classList.remove("show");
  elements.pagination?.classList.add("hidden");
};

const hideSkeleton = () => {
  elements.shopSkeleton?.classList.add("hidden");
  elements.productList?.classList.remove("hidden");
  elements.pagination?.classList.remove("hidden");
};

const renderPagination = (currentPage, totalPages) => {
  if (!elements.pagination || totalPages <= 1) {
    if (elements.pagination) elements.pagination.innerHTML = "";
    return;
  }

  elements.pagination.innerHTML = "";

  const createBtn = (label, value, active = false, disabled = false) => {
    const btn = document.createElement("button");
    btn.className = `page-btn ${active ? "active" : ""}`;
    btn.type = "button";
    btn.disabled = disabled;
    btn.textContent = label;
    btn.dataset.page = String(value);
    return btn;
  };

  elements.pagination.appendChild(
    createBtn("◀", Math.max(1, currentPage - 1), false, currentPage === 1),
  );

  const maxPages = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxPages - 1);
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1);
  }

  for (let page = start; page <= end; page += 1) {
    elements.pagination.appendChild(
      createBtn(String(page), page, page === currentPage),
    );
  }

  elements.pagination.appendChild(
    createBtn(
      "▶",
      Math.min(totalPages, currentPage + 1),
      false,
      currentPage === totalPages,
    ),
  );

  elements.pagination.querySelectorAll(".page-btn").forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (Number.isNaN(page)) return;
      updatePageInUrl(page);
      loadShopProducts();
    });
  });
};

const renderProducts = (products) => {
  if (!elements.productList) return;

  elements.productList.innerHTML = "";

  if (!products.length) {
    elements.emptyMessage?.classList.add("show");
    return;
  }

  elements.emptyMessage?.classList.remove("show");

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-main";

    const image =
      product.image || "/modules/customer/assets/images/macbook.png";
    const productLink = `/modules/customer/features/product_detail/product_detail.html?id=${product.id}`;
    const price = Number(product.minPrice || 0);
    const oldPrice = price * 1.15;
    const rating = ((product.id % 2) + 4).toFixed(1);

    const stars = Array(5)
      .fill()
      .map((_, index) =>
        index < Math.round(rating)
          ? `<i class="fas fa-star"></i>`
          : `<i class="far fa-star"></i>`,
      )
      .join("");

    card.innerHTML = `
      <a href="${productLink}" class="product-link">
        <div class="p-img-box">
          <img src="${image}" alt="${product.name || "Product"}" loading="lazy">
        </div>
        <h4>${product.name || "Unnamed product"}</h4>
        <div class="product-rating">
          <div class="stars">${stars}</div>
          <span class="rating-count">(${Math.floor(Math.random() * 200) + 20})</span>
        </div>
        <div class="product-price">
          <span class="current-price">${formatPrice(price)}</span>
          ${oldPrice ? `<span class="old-price">${formatPrice(oldPrice)}</span>` : ""}
        </div>
      </a>
    `;

    elements.productList.appendChild(card);
  });
};

const formatPrice = (value) => {
  if (!value || isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
const renderCategoryBrands = async (categoryId) => {
  if (!elements.categoryBrandsWrapper || !elements.categoryBrandList) return;

  const numericCategoryId = Number(categoryId);
  if (!numericCategoryId) {
    elements.categoryBrandsWrapper.style.display = "none";
    return;
  }

  try {
    const brands = await brandApi.getByCategory(numericCategoryId);
    state.categoryBrands = brands || [];

    if (!state.categoryBrands.length) {
      elements.categoryBrandsWrapper.style.display = "none";
      return;
    }

    elements.categoryBrandsWrapper.style.display = "block";
    elements.categoryBrandList.innerHTML = "";

    state.categoryBrands.forEach((brand) => {
      const item = document.createElement("a");
      item.className = "brand-item";
      item.href = `/modules/customer/features/shop/shop.html?categoryId=${numericCategoryId}&categoryName=${encodeURIComponent(
        state.queryParams.categoryName || "",
      )}&brandId=${brand.brandId || ""}&brandName=${encodeURIComponent(
        brand.brandName || "",
      )}`;
      item.textContent = capitalize(brand.brandName);
      elements.categoryBrandList.appendChild(item);
    });
  } catch (error) {
    console.error("Render category brands error:", error);
    elements.categoryBrandsWrapper.style.display = "none";
  }
};

const ensureCategoryContext = async () => {
  const { categoryId, brandId } = state.queryParams;
  if (categoryId || !brandId) return;

  try {
    const categories = await categoryApi.getByBrand(brandId);
    if (!Array.isArray(categories) || !categories.length) return;

    const [category] = categories;
    state.queryParams.categoryId = category.id;
    state.queryParams.categoryName = category.name;

    updateQueryParamsInUrl({
      categoryId: category.id,
      categoryName: category.name,
    });
  } catch (error) {
    console.error("Failed to resolve category from brand:", error);
  }
};

const loadDynamicFilters = async () => {
  const { categoryId, brandId, categoryName } = state.queryParams;

  if (!categoryId) {
    state.dynamicFilters = [];
    state.dynamicFilterContext = { categoryId: null, brandId: null };
    advancedFilterPanel.reset();
    advancedFilterPanel.render({ dynamicFilters: [], hasCategory: false });
    return;
  }

  const nextContext = {
    categoryId: String(categoryId),
    brandId: brandId ? String(brandId) : null,
  };

  const shouldRefresh =
    state.dynamicFilterContext.categoryId !== nextContext.categoryId ||
    state.dynamicFilterContext.brandId !== nextContext.brandId;

  if (!shouldRefresh) return;

  const response = await productApi.getFilters({ categoryId, brandId });
  state.dynamicFilters = transformProductFilters(response, categoryName);
  state.dynamicFilterContext = nextContext;
  advancedFilterPanel.reset();
  advancedFilterPanel.render({
    dynamicFilters: state.dynamicFilters,
    hasCategory: true,
  });
};

const syncFilterLabel = () => {
  if (!elements.filterLabel) return;

  const parts = [];
  if (state.queryParams.categoryName) {
    parts.push(capitalize(state.queryParams.categoryName));
  }
  if (state.queryParams.brandName) {
    parts.push(capitalize(state.queryParams.brandName));
  }

  elements.filterLabel.textContent = parts.length
    ? `Show: ${parts.join(" / ")}`
    : "Show all products";
};

const loadShopProducts = async () => {
  state.queryParams = getQueryParams();
  state.currentPage = getPageFromQuery();

  try {
    showSkeleton();
    await ensureCategoryContext();
    await loadDynamicFilters();
    syncFilterLabel();

    if (elements.sortSelect) {
      elements.sortSelect.value = state.queryParams.sort || "default";
    }

    const sortConfig = getSortParams(state.queryParams.sort);
    const filters = advancedFilterPanel.getFilters();

    const response = await productApi.filterProducts({
      page: state.currentPage - 1,
      size: state.PAGE_SIZE,
      categoryId: state.queryParams.categoryId,
      brandId: state.queryParams.brandId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      attributeFilters: filters.attributeFilters,
      sortBy: sortConfig?.sortBy,
      sortDir: sortConfig?.sortDir,
    });

    state.currentProducts = response.content || [];
    state.totalPages = response.totalPages || 1;

    renderProducts(state.currentProducts);
    renderPagination(state.currentPage, state.totalPages);
    renderBreadcrumb(
      state.queryParams.categoryName,
      state.queryParams.brandName,
    );

    if (state.queryParams.categoryId && !state.queryParams.brandId) {
      await renderCategoryBrands(state.queryParams.categoryId);
    } else if (elements.categoryBrandsWrapper) {
      elements.categoryBrandsWrapper.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading shop products:", error);
  } finally {
    hideSkeleton();
  }
};

const setupSort = () => {
  elements.sortSelect?.addEventListener("change", () => {
    state.currentPage = 1;
    updateQueryParamsInUrl({
      sort:
        elements.sortSelect.value && elements.sortSelect.value !== "default"
          ? elements.sortSelect.value
          : null,
      page: null,
    });
    loadShopProducts();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initElements();

  advancedFilterPanel = createAdvancedFilterPanel({
    root: elements.dynamicFilterSections,
    minPriceInput: elements.minPrice,
    maxPriceInput: elements.maxPrice,
    filterBadge: elements.filterBadge,
    filterSummary: elements.filterSummary,
    dropdownRoot: elements.filterDropdown,
    panel: elements.advancedFilters,
    toggleButton: elements.toggleFilters,
    applyButton: elements.applyFilters,
    clearButton: elements.clearFilters,
    texts: {
      empty: "No filters selected",
      noCategory: "Select a category to see advanced filters.",
      noAdvanced: "No advanced filters available for this category.",
    },
    onApply: () => {
      state.currentPage = 1;
      updatePageInUrl(1);
      loadShopProducts();
    },
    onClear: () => {
      state.currentPage = 1;
      updatePageInUrl(1);
      loadShopProducts();
    },
  });

  setupSort();
  loadShopProducts();
});

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