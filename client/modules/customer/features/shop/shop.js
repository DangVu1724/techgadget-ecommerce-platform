import { productApi } from "/modules/customer/core/api/product.api.js";
import { categoryApi } from "/modules/customer/core/api/category.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";

// ===== State Management =====
const state = {
  currentProducts: [],
  currentPage: 1,
  totalPages: 1,
  queryParams: {},
  categoryBrands: [],
  PAGE_SIZE: 20,
};

// ===== DOM Cache =====
const elements = {
  productList: null,
  emptyMessage: null,
  pagination: null,
  advancedFilters: null,
  toggleFilters: null,
  breadcrumb: null,
  categoryBrandsWrapper: null,
  categoryBrandList: null,
  filterLabel: null,
  sortSelect: null,
};

const initElements = () => {
  elements.productList = document.getElementById("productList");
  elements.emptyMessage = document.getElementById("emptyMessage");
  elements.pagination = document.getElementById("pagination");
  elements.advancedFilters = document.getElementById("advancedFilters");
  elements.toggleFilters = document.getElementById("toggleFilters");
  elements.breadcrumb = document.getElementById("breadcrumb");
  elements.categoryBrandsWrapper = document.getElementById(
    "categoryBrandsWrapper",
  );
  elements.categoryBrandList = document.getElementById("categoryBrandList");
  elements.filterLabel = document.getElementById("filterLabel");
  elements.sortSelect = document.getElementById("sortSelect");
};

// ===== URL & Query Params =====
const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    categoryId: params.get("categoryId"),
    categoryName: params.get("categoryName"),
    brandId: params.get("brandId"),
    brandName: params.get("brandName"),
    page: params.get("page"),
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

// ===== Breadcrumb Rendering =====
const renderBreadcrumb = (categoryName, brandName) => {
  if (!elements.breadcrumb) return;

  const fragments = [{ name: "Trang chủ", href: "/" }];

  if (categoryName) {
    fragments.push({
      name: capitalize(categoryName),
      href: `/modules/customer/features/shop/shop.html?categoryId=${state.queryParams.categoryId}`,
    });
  }

  if (brandName) {
    fragments.push({
      name: capitalize(brandName),
      href: "#",
    });
  }

  elements.breadcrumb.innerHTML = fragments
    .map((item, idx) =>
      idx === fragments.length - 1
        ? `<span class="breadcrumb-item active">${item.name}</span>`
        : `<a href="${item.href}" class="breadcrumb-item">${item.name}</a>`,
    )
    .join('<span class="breadcrumb-separator">/</span>');
};

// ===== Pagination Rendering =====
const renderPagination = (currentP, totalP) => {
  if (!elements.pagination || totalP <= 1) {
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
    createBtn("◀", Math.max(1, currentP - 1), false, currentP === 1),
  );

  const maxPages = 5;
  let start = Math.max(1, currentP - 2);
  let end = Math.min(totalP, start + maxPages - 1);
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1);
  }

  for (let i = start; i <= end; i += 1) {
    elements.pagination.appendChild(createBtn(String(i), i, i === currentP));
  }

  elements.pagination.appendChild(
    createBtn("▶", Math.min(totalP, currentP + 1), false, currentP === totalP),
  );

  elements.pagination.querySelectorAll(".page-btn").forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (!Number.isNaN(page)) {
        updatePageInUrl(page);
        loadShopProducts();
      }
    });
  });
};

// ===== Product List Rendering =====
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
      product.thumbnail || "/modules/customer/assets/images/macbook.png";
    const productLink = `/modules/customer/features/product_detail/product_detail.html?id=${product.id}`;
    const price = Number(product.minPrice || 0);
    const oldPrice = price * 1.15;
    const rating = ((product.id % 2) + 4).toFixed(1);

    const stars = Array(5)
      .fill()
      .map((_, i) =>
        i < Math.round(rating)
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
          <span class="current-price">$${price.toFixed(2)}</span>
          <span class="old-price">$${oldPrice.toFixed(2)}</span>
        </div>
      </a>
    `;

    elements.productList.appendChild(card);
  });
};

// ===== Category Brands Rendering =====
const renderCategoryBrands = async (categoryId) => {
  if (!elements.categoryBrandsWrapper || !elements.categoryBrandList) return;

  categoryId = Number(categoryId);

  if (!categoryId) {
    elements.categoryBrandsWrapper.style.display = "none";
    return;
  }

  try {
    const brands = await brandApi.getByCategory(categoryId);

    if (!brands || brands.length === 0) {
      elements.categoryBrandsWrapper.style.display = "none";
      return;
    }

    elements.categoryBrandsWrapper.style.display = "block";
    elements.categoryBrandList.innerHTML = "";

    brands.forEach((brand) => {
      const item = document.createElement("a");
      item.className = "brand-item";
      item.href = `/modules/customer/features/shop/shop.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(
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

// ===== Filter Setup =====
const setupFilters = () => {
  if (elements.toggleFilters && elements.advancedFilters) {
    elements.toggleFilters.addEventListener("click", () => {
      elements.advancedFilters.classList.toggle("show");
      const icon = elements.toggleFilters.querySelector("i:last-child");
      if (icon) {
        icon.style.transform = elements.advancedFilters.classList.contains(
          "show",
        )
          ? "rotate(180deg)"
          : "rotate(0)";
      }
    });
  }

  document.querySelectorAll(".filter-section h4").forEach((header) => {
    header.addEventListener("click", () => {
      const section = header.closest(".filter-section");
      if (section) section.classList.toggle("collapsed");
    });
  });

  document.querySelectorAll(".price-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const minInput = document.getElementById("minPrice");
      const maxInput = document.getElementById("maxPrice");
      if (minInput && maxInput) {
        minInput.value = btn.dataset.min;
        maxInput.value = btn.dataset.max;
      }
    });
  });

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener("change", (e) => {
      // UI only - no data manipulation
    });
  }

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".view-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (elements.productList) {
        if (btn.dataset.view === "list") {
          elements.productList.classList.add("list-view");
        } else {
          elements.productList.classList.remove("list-view");
        }
      }
    });
  });
};

// ===== Load Shop Products =====
const loadShopProducts = async () => {
  state.queryParams = getQueryParams();
  state.currentPage = getPageFromQuery();
  const pageZero = state.currentPage - 1;

  try {
    const res = await productApi.filterProducts({
      page: pageZero,
      size: state.PAGE_SIZE,
      categoryId: state.queryParams.categoryId,
      brandId: state.queryParams.brandId,
    });

    state.currentProducts = res.content || [];
    state.totalPages = res.totalPages || 1;

    renderProducts(state.currentProducts);
    renderPagination(state.currentPage, state.totalPages);
    renderBreadcrumb(
      state.queryParams.categoryName,
      state.queryParams.brandName,
    );

    if (state.queryParams.categoryId && !state.queryParams.brandId) {
      await renderCategoryBrands(state.queryParams.categoryId);
    } else {
      if (elements.categoryBrandsWrapper) {
        elements.categoryBrandsWrapper.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error loading shop products:", error);
  }
};

// ===== Utility Functions =====
const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  initElements();
  loadShopProducts();
  setupFilters();
});
