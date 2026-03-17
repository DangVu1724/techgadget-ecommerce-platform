import { productApi } from "/modules/customer/core/api/product.api.js";

let currentProducts = [];
let currentPage = 1;
let totalPages = 1;
const PAGE_SIZE = 20;

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

const setText = (selector, text) => {
  const el = document.getElementById(selector);
  if (el) el.textContent = text;
};

const getPageFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  if (!page || Number.isNaN(page) || page < 1) return 1;
  return page;
};

const updatePageInUrl = (page) => {
  const params = new URLSearchParams(window.location.search);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", url);
};

const renderPagination = (currentP, totalP) => {
  const container = document.getElementById("pagination");
  if (!container || totalP <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  const createBtn = (label, value, active = false, disabled = false) => {
    const btn = document.createElement("button");
    btn.className = `page-btn ${active ? "active" : ""}`;
    btn.type = "button";
    btn.disabled = disabled;
    btn.textContent = label;
    btn.dataset.page = String(value);
    return btn;
  };

  container.appendChild(
    createBtn("◀", Math.max(1, currentP - 1), false, currentP === 1),
  );

  const maxPages = 5;
  let start = Math.max(1, currentP - 2);
  let end = Math.min(totalP, start + maxPages - 1);
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1);
  }

  for (let i = start; i <= end; i += 1) {
    container.appendChild(createBtn(String(i), i, i === currentP));
  }

  container.appendChild(
    createBtn("▶", Math.min(totalP, currentP + 1), false, currentP === totalP),
  );

  container.querySelectorAll(".page-btn").forEach((btn) => {
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
  const list = document.getElementById("productList");
  const empty = document.getElementById("emptyMessage");
  if (!list) return;

  list.innerHTML = "";

  if (!products.length) {
    if (empty) empty.classList.add("show");
    return;
  }

  if (empty) empty.classList.remove("show");

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-main";

    const image =
      product.thumbnail || "/modules/customer/assets/images/macbook.png";
    const productLink = `/modules/customer/features/product_detail/product_detail.html?id=${product.id}`;

    card.innerHTML = `
    
      <a href="${productLink}" style="text-decoration:none;color:inherit;">
        <div class="p-img-box"><img src="${image}" alt="${product.name || "Product"}" loading="lazy" /></div>
        <h4>${product.name || "Unnamed product"}</h4>
      </a>
      <p class="p-price">${product.minPrice ? `$${Number(product.minPrice).toFixed(2)}` : "$0.00"}</p>
    `;

    list.appendChild(card);
  });
};

const setupFilters = () => {
  const toggleBtn = document.getElementById("toggleFilters");
  const advancedFilters = document.getElementById("advancedFilters");

  if (toggleBtn && advancedFilters) {
    toggleBtn.addEventListener("click", () => {
      advancedFilters.classList.toggle("show");
      const icon = toggleBtn.querySelector("i:last-child");
      if (icon) {
        icon.style.transform = advancedFilters.classList.contains("show")
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

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      // UI only - no data manipulation
    });
  }

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".view-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const productList = document.getElementById("productList");
      if (productList) {
        if (btn.dataset.view === "list") {
          productList.classList.add("list-view");
        } else {
          productList.classList.remove("list-view");
        }
      }
    });
  });
};

const loadShopProducts = async () => {
  const { categoryId, categoryName, brandId, brandName } = getQueryParams();
  currentPage = getPageFromQuery();
  const pageZero = currentPage > 0 ? currentPage - 1 : 0;

  const titleParts = [];
  if (categoryName)
    titleParts.push(`Danh mục: ${decodeURIComponent(categoryName)}`);
  if (brandName)
    titleParts.push(`Thương hiệu: ${decodeURIComponent(brandName)}`);
  const title = titleParts.length ? titleParts.join(" • ") : "Tất cả sản phẩm";

  setText("shopTitle", "Danh sách sản phẩm");
  setText("shopSubtitle", title);

  const filterLabel = [];
  if (categoryName)
    filterLabel.push(`Danh mục: ${decodeURIComponent(categoryName)}`);
  if (brandName)
    filterLabel.push(`Thương hiệu: ${decodeURIComponent(brandName)}`);
  setText(
    "filterLabel",
    filterLabel.length ? filterLabel.join(" | ") : "Hiển thị tất cả sản phẩm",
  );

  try {
    let res;
    if (categoryId) {
      res = await productApi.getByCategory(categoryId, {
        page: pageZero,
        size: PAGE_SIZE,
      });
    } else if (brandId) {
      res = await productApi.getByBrand(brandId, {
        page: pageZero,
        size: PAGE_SIZE,
      });
    } else {
      res = await productApi.getAll({
        page: pageZero,
        size: PAGE_SIZE,
      });
    }

    currentProducts = res.content || [];
    renderProducts(currentProducts);

    totalPages = Number.isFinite(res.totalPages) ? res.totalPages : 1;
    const safeCurrent = Math.min(
      Math.max(1, currentPage),
      Math.max(1, totalPages),
    );
    renderPagination(safeCurrent, totalPages);
  } catch (error) {
    console.error("Load shop products error:", error);
    renderProducts([]);
    renderPagination(1, 1);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadShopProducts();
  setupFilters();
});
