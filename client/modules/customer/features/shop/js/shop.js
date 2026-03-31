import { productApi } from "/modules/customer/core/api/product.api.js";
import { brandApi } from "/modules/customer/core/api/brand.api.js";
import { categoryApi } from "/modules/customer/core/api/category.api.js";

const state = {
  currentProducts: [],
  currentPage: 1,
  totalPages: 1,
  queryParams: {},
  categoryBrands: [],
  dynamicFilters: [],
  dynamicFilterContext: {
    categoryId: null,
    brandId: null,
  },
  PAGE_SIZE: 20,
  filters: {
    minPrice: null,
    maxPrice: null,
    attributeFilters: {},
    uiSelections: {},
  },
};

const SORT_CONFIG = {
  default: null,
  "price-asc": { sortBy: "minPrice", sortDir: "asc" },
  "price-desc": { sortBy: "minPrice", sortDir: "desc" },
  "name-asc": { sortBy: "name", sortDir: "asc" },
  "name-desc": { sortBy: "name", sortDir: "desc" },
  newest: { sortBy: "createdAt", sortDir: "desc" },
};

const elements = {
  productList: null,
  emptyMessage: null,
  pagination: null,
  advancedFilters: null,
  toggleFilters: null,
  filterDropdown: null,
  filterBadge: null,
  filterSummary: null,
  breadcrumb: null,
  categoryBrandsWrapper: null,
  categoryBrandList: null,
  filterLabel: null,
  sortSelect: null,
  minPrice: null,
  maxPrice: null,
  applyFilters: null,
  clearFilters: null,
  dynamicFilterSections: null,
};

const HIDDEN_FILTERS = {
  smartphone: new Set(["color", "os", "screen_size"]),
  laptop: new Set(["opsys", "cpu_frequency_ghz", "os"]),
};

const LABEL_MAP = {
  typename: "Type",
  inches: "Screen Size",
  screenresolution: "Resolution",
  cpu_company: "CPU Brand",
  cpu_type: "CPU",
  ram_gb: "RAM",
  memory: "Storage",
  gpu_company: "GPU Brand",
  gpu_type: "GPU",
  weight_kg: "Weight",
  processor_brand: "Chipset",
  battery_capacity: "Battery",
  ram_capacity: "RAM",
  internal_memory: "Storage",
  refresh_rate: "Refresh Rate",
  num_rear_cameras: "Rear Cameras",
  "5g_or_not": "5G",
};

const UNIT_FORMATTERS = {
  inches: (value) => `${value}"`,
  ram_gb: (value) => `${value} GB`,
  memory: (value) => `${value} GB`,
  weight_kg: (value) => `${value} kg`,
  battery_capacity: (value) => `${value} mAh`,
  ram_capacity: (value) => `${value} GB`,
  internal_memory: (value) => `${value} GB`,
  screen_size: (value) => `${value}"`,
  refresh_rate: (value) => `${value} Hz`,
  num_rear_cameras: (value) => `${value} cameras`,
};

const initElements = () => {
  elements.productList = document.getElementById("productList");
  elements.emptyMessage = document.getElementById("emptyMessage");
  elements.pagination = document.getElementById("pagination");
  elements.advancedFilters = document.getElementById("advancedFilters");
  elements.toggleFilters = document.getElementById("toggleFilters");
  elements.filterDropdown = document.getElementById("filterDropdown");
  elements.filterBadge = document.getElementById("filterBadge");
  elements.filterSummary = document.getElementById("filterSummary");
  elements.breadcrumb = document.getElementById("breadcrumb");
  elements.categoryBrandsWrapper = document.getElementById(
    "categoryBrandsWrapper",
  );
  elements.categoryBrandList = document.getElementById("categoryBrandList");
  elements.filterLabel = document.getElementById("filterLabel");
  elements.sortSelect = document.getElementById("sortSelect");
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

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const formatTitle = (value) =>
  String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

  if (categoryId || !brandId) {
    return;
  }

  try {
    const categories = await categoryApi.getByBrand(brandId);
    if (!Array.isArray(categories) || !categories.length) {
      return;
    }

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

const parseFilterValue = (value) => {
  if (value == null) return value;
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
};

const formatOptionValue = (filterName, value) => {
  const formatter = UNIT_FORMATTERS[filterName];
  if (formatter) {
    return formatter(value);
  }

  return String(value || "")
    .replaceAll("_", " ")
    .trim();
};

const toWeightBucket = (weight) => {
  const value = Number(weight);
  if (Number.isNaN(value)) return null;
  if (value < 1) return { id: "under_1kg", label: "Under 1 kg" };
  if (value < 1.5) return { id: "1_to_1_5kg", label: "1.0 - 1.5 kg" };
  if (value < 2) return { id: "1_5_to_2kg", label: "1.5 - 2.0 kg" };
  return { id: "over_2kg", label: "Over 2 kg" };
};

const buildWeightOptions = (filter) => {
  const buckets = new Map();

  filter.values.forEach((value) => {
    const bucket = toWeightBucket(value);
    if (!bucket) return;

    if (!buckets.has(bucket.id)) {
      buckets.set(bucket.id, {
        id: bucket.id,
        label: bucket.label,
        payloadValues: [],
      });
    }

    buckets.get(bucket.id).payloadValues.push(value);
  });

  return Array.from(buckets.values());
};

const buildBooleanOptions = (filter) => {
  const truthy = [];
  const falsy = [];

  filter.values.forEach((value) => {
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "co", "có"].includes(normalized)) {
      truthy.push(value);
    } else {
      falsy.push(value);
    }
  });

  const options = [];
  if (truthy.length) {
    options.push({
      id: "yes",
      label: "Có 5G",
      payloadValues: truthy,
    });
  }
  if (falsy.length) {
    options.push({
      id: "no",
      label: "Không 5G",
      payloadValues: falsy,
    });
  }
  return options;
};

const buildDefaultOptions = (filter) =>
  filter.values.map((value) => ({
    id: String(value),
    label: formatOptionValue(filter.name, value),
    payloadValues: [parseFilterValue(value)],
  }));

const transformFilters = (rawFilters, categoryName) => {
  const categoryKey = normalizeCategoryKey(categoryName);
  const hiddenFilters = HIDDEN_FILTERS[categoryKey] || new Set();

  return (rawFilters || [])
    .filter((filter) => !hiddenFilters.has(filter.name))
    .map((filter) => {
      let options = buildDefaultOptions(filter);

      if (filter.name === "weight_kg") {
        options = buildWeightOptions(filter);
      }

      if (filter.name === "5g_or_not") {
        options = buildBooleanOptions(filter);
      }

      return {
        name: filter.name,
        label: LABEL_MAP[filter.name] || formatTitle(filter.name),
        options,
      };
    })
    .filter((filter) => filter.options.length);
};

const getFilterValues = () => {
  const minPrice = elements.minPrice?.value
    ? Number(elements.minPrice.value)
    : null;
  const maxPrice = elements.maxPrice?.value
    ? Number(elements.maxPrice.value)
    : null;

  const attributeFilters = {};
  const uiSelections = {};

  document
    .querySelectorAll(".dynamic-filter-input:checked")
    .forEach((input) => {
      const key = input.dataset.filterName;
      if (!key) return;

      const optionId = input.value;
      const payloadValues = JSON.parse(input.dataset.payloadValues || "[]");

      if (!uiSelections[key]) {
        uiSelections[key] = [];
      }
      if (!attributeFilters[key]) {
        attributeFilters[key] = [];
      }

      uiSelections[key].push(optionId);
      payloadValues.forEach((value) => {
        if (
          !attributeFilters[key].some(
            (existing) => String(existing) === String(value),
          )
        ) {
          attributeFilters[key].push(value);
        }
      });
    });

  return {
    minPrice,
    maxPrice,
    attributeFilters,
    uiSelections,
  };
};

const getActiveFilterCount = (filters = state.filters) => {
  const priceCount =
    filters.minPrice != null || filters.maxPrice != null ? 1 : 0;
  const attributeCount = Object.values(filters.uiSelections || {}).reduce(
    (total, selections) => total + selections.length,
    0,
  );

  return priceCount + attributeCount;
};

const updateFilterSummary = () => {
  const count = getActiveFilterCount();

  if (elements.filterBadge) {
    elements.filterBadge.textContent = String(count);
    elements.filterBadge.style.display = count ? "inline-flex" : "none";
  }

  if (!elements.filterSummary) {
    return;
  }

  if (!count) {
    elements.filterSummary.textContent = "No filters selected";
    return;
  }

  const summaryParts = [];

  if (state.filters.minPrice != null || state.filters.maxPrice != null) {
    const min = state.filters.minPrice ?? 0;
    const max = state.filters.maxPrice ?? "any";
    summaryParts.push(`Price ${min} - ${max}`);
  }

  Object.entries(state.filters.uiSelections || {}).forEach(
    ([filterName, selections]) => {
      if (!selections.length) return;

      const filter = state.dynamicFilters.find(
        (item) => item.name === filterName,
      );
      if (!filter) return;

      summaryParts.push(`${filter.label}: ${selections.length}`);
    },
  );

  elements.filterSummary.textContent = summaryParts.join(" • ");
};

const setFilterDropdownState = (isOpen) => {
  if (!elements.advancedFilters || !elements.toggleFilters) {
    return;
  }

  elements.advancedFilters.classList.toggle("show", isOpen);
  elements.toggleFilters.setAttribute("aria-expanded", String(isOpen));
};

const renderDynamicFilters = () => {
  if (!elements.dynamicFilterSections) return;

  elements.dynamicFilterSections.innerHTML = "";

  state.dynamicFilters.forEach((filter) => {
    const section = document.createElement("div");
    section.className = "filter-section";
    section.innerHTML = `
      <h4>${filter.label}<i class="fas fa-chevron-down"></i></h4>
      <div class="filter-content dynamic-filter-list"></div>
    `;

    const content = section.querySelector(".filter-content");
    filter.options.forEach((option) => {
      const label = document.createElement("label");
      label.className = "checkbox-label";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "dynamic-filter-input";
      input.dataset.filterName = filter.name;
      input.dataset.payloadValues = JSON.stringify(option.payloadValues);
      input.value = option.id;

      const selectedValues = state.filters.uiSelections?.[filter.name] || [];
      input.checked = selectedValues.includes(option.id);

      label.appendChild(input);
      label.append(` ${option.label}`);
      content.appendChild(label);
    });

    elements.dynamicFilterSections.appendChild(section);
  });

  bindFilterSectionToggles();
  updateFilterSummary();
};

const bindFilterSectionToggles = () => {
  document.querySelectorAll(".filter-section h4").forEach((header) => {
    header.onclick = () => {
      const section = header.closest(".filter-section");
      if (section) section.classList.toggle("collapsed");
    };
  });
};

const syncFilterInputs = () => {
  if (elements.minPrice) {
    elements.minPrice.value = state.filters.minPrice ?? "";
  }
  if (elements.maxPrice) {
    elements.maxPrice.value = state.filters.maxPrice ?? "";
  }

  document.querySelectorAll(".dynamic-filter-input").forEach((input) => {
    const key = input.dataset.filterName;
    const selectedValues = state.filters.uiSelections?.[key] || [];
    input.checked = selectedValues.includes(input.value);
  });

  updateFilterSummary();
};

const resetFilters = () => {
  state.filters = {
    minPrice: null,
    maxPrice: null,
    attributeFilters: {},
    uiSelections: {},
  };
  syncFilterInputs();
};

const loadDynamicFilters = async () => {
  const { categoryId, brandId, categoryName } = state.queryParams;

  if (!categoryId) {
    state.dynamicFilters = [];
    state.dynamicFilterContext = { categoryId: null, brandId: null };
    renderDynamicFilters();
    resetFilters();
    return;
  }

  const nextContext = {
    categoryId: String(categoryId),
    brandId: brandId ? String(brandId) : null,
  };

  const shouldRefresh =
    state.dynamicFilterContext.categoryId !== nextContext.categoryId ||
    state.dynamicFilterContext.brandId !== nextContext.brandId;

  if (!shouldRefresh) {
    return;
  }

  const response = await productApi.getFilters({
    categoryId,
    brandId,
  });

  state.dynamicFilters = transformFilters(response, categoryName);
  state.dynamicFilterContext = nextContext;
  resetFilters();
  renderDynamicFilters();
};

const setupFilters = () => {
  if (elements.toggleFilters && elements.advancedFilters) {
    elements.toggleFilters.addEventListener("click", (event) => {
      event.stopPropagation();
      setFilterDropdownState(
        !elements.advancedFilters.classList.contains("show"),
      );
    });
  }

  document.addEventListener("click", (event) => {
    if (!elements.filterDropdown?.contains(event.target)) {
      setFilterDropdownState(false);
    }
  });

  if (elements.applyFilters) {
    elements.applyFilters.addEventListener("click", () => {
      state.currentPage = 1;
      updatePageInUrl(1);
      setFilterDropdownState(false);
      loadShopProducts();
    });
  }

  if (elements.clearFilters) {
    elements.clearFilters.addEventListener("click", () => {
      resetFilters();
      state.currentPage = 1;
      updatePageInUrl(1);
      loadShopProducts();
    });
  }

  document.querySelectorAll(".price-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const minInput = document.getElementById("minPrice");
      const maxInput = document.getElementById("maxPrice");
      if (minInput && maxInput) {
        minInput.value = btn.dataset.min;
        maxInput.value = btn.dataset.max;
        state.filters = getFilterValues();
        updateFilterSummary();
      }
    });
  });

  elements.minPrice?.addEventListener("input", () => {
    state.filters = getFilterValues();
    updateFilterSummary();
  });

  elements.maxPrice?.addEventListener("input", () => {
    state.filters = getFilterValues();
    updateFilterSummary();
  });

  document.addEventListener("change", (event) => {
    if (
      event.target instanceof Element &&
      event.target.matches(".dynamic-filter-input")
    ) {
      state.filters = getFilterValues();
      updateFilterSummary();
    }
  });

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener("change", () => {
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
  }

  bindFilterSectionToggles();
  updateFilterSummary();
};

const loadShopProducts = async () => {
  state.queryParams = getQueryParams();
  state.currentPage = getPageFromQuery();
  const pageZero = state.currentPage - 1;
  const sortConfig = getSortParams(state.queryParams.sort);

  try {
    await ensureCategoryContext();
    state.filters = getFilterValues();
    await loadDynamicFilters();
    state.filters = getFilterValues();

    if (elements.sortSelect) {
      elements.sortSelect.value = state.queryParams.sort || "default";
    }

    const res = await productApi.filterProducts({
      page: pageZero,
      size: state.PAGE_SIZE,
      categoryId: state.queryParams.categoryId,
      brandId: state.queryParams.brandId,
      minPrice: state.filters.minPrice,
      maxPrice: state.filters.maxPrice,
      attributeFilters: state.filters.attributeFilters,
      sortBy: sortConfig?.sortBy,
      sortDir: sortConfig?.sortDir,
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
    } else if (elements.categoryBrandsWrapper) {
      elements.categoryBrandsWrapper.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading shop products:", error);
  }
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const setupShopSearch = () => {
  const searchForm = document.getElementById("shop-search-form");
  const searchInput = document.getElementById("shop-search-input");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initElements();
  setupFilters();
  setupShopSearch();
  loadShopProducts();
});
