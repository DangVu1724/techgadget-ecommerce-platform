import { productApi } from "../../core/api/product.api.js";

const searchInput = document.querySelector(".search-input");
const searchForm = document.querySelector(".search-form");
const suggestionsDiv = document.querySelector(".search-suggestions");
const SEARCH_HISTORY_KEY = "searchHistory";

const formatPrice = (value) => {
  if (!value || isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

function getSearchHistory() {
  return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
}

function saveSearchHistory(keyword) {
  let history = getSearchHistory();
  history = history.filter((item) => item !== keyword); // remove duplicates
  history.unshift(keyword); // add to front
  history = history.slice(0, 10); // limit to 10
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

let searchTimeout;

// Hiển thị suggestions khi gõ
if (searchInput) {
  // Khi focus
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() === "") {
      const history = getSearchHistory();
      if (history.length > 0) {
        let html =
          '<div class="history-header">Lịch sử tìm kiếm</div>' +
          history
            .map(
              (item) =>
                `<div class="suggestion-item history-item" data-keyword="${escapeHtml(item)}"><i class="fas fa-history"></i><span>${escapeHtml(item)}</span></div>`,
            )
            .join("");
        suggestionsDiv.innerHTML = html;
        suggestionsDiv.classList.add("active");
      }
    }
  });

  // Khi gõ
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (keyword.length < 2) {
      if (keyword === "") {
        // Show history if empty
        const history = getSearchHistory();
        if (history.length > 0) {
          let html =
            '<div class="history-header">Lịch sử tìm kiếm</div>' +
            history
              .map(
                (item) =>
                  `<div class="suggestion-item history-item" data-keyword="${escapeHtml(item)}"><i class="fas fa-history"></i><span>${escapeHtml(item)}</span></div>`,
              )
              .join("");
          suggestionsDiv.innerHTML = html;
          suggestionsDiv.classList.add("active");
        } else {
          suggestionsDiv.innerHTML = "";
          suggestionsDiv.classList.remove("active");
        }
      } else {
        suggestionsDiv.innerHTML = "";
        suggestionsDiv.classList.remove("active");
      }
      return;
    }

    // Debounce 300ms
    searchTimeout = setTimeout(() => {
      loadSuggestions(keyword);
    }, 300);
  });

  // Ẩn suggestions khi focus ra
  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionsDiv.classList.remove("active");
    }, 200);
  });

  // Cho phép click vào suggestion
  suggestionsDiv.addEventListener("click", (e) => {
    const suggestionItem = e.target.closest(".suggestion-item");
    if (suggestionItem) {
      if (suggestionItem.classList.contains("history-item")) {
        const keyword = suggestionItem.dataset.keyword;
        searchInput.value = keyword;
        searchForm.dispatchEvent(new Event("submit"));
      } else {
        const productId = suggestionItem.dataset.productId;
        const productName =
          suggestionItem.querySelector("span")?.textContent?.trim() || "";
        searchInput.value = productName;
        window.location.href = `/product/${productId}`;
      }
    }
  });
}

// Hàm load suggestions
async function loadSuggestions(keyword) {
  try {
    // Sử dụng smart search API với fuzzy matching
    const response = await productApi.searchSuggestions(keyword, 5);
    const products = response?.content || [];

    if (!products.length) {
      suggestionsDiv.innerHTML =
        '<div class="no-suggestions">Không tìm thấy sản phẩm</div>';
      suggestionsDiv.classList.add("active");
      return;
    }

    // Kiểm tra xem có typo correction không
    const searchUrl = `/api/products?keyword=${encodeURIComponent(keyword)}`;
    const isTypoCorrected = products.some(
      (product) =>
        (product.name.toLowerCase().includes(keyword.toLowerCase()) === false &&
          product.name.toLowerCase().includes("iphone") &&
          keyword.toLowerCase().includes("ihone")) ||
        (product.name.toLowerCase().includes("samsung") &&
          keyword.toLowerCase().includes("samung")) ||
        (product.name.toLowerCase().includes("macbook") &&
          keyword.toLowerCase().includes("macbok")),
    );

    // Hiển thị kết quả với smart search
    let html = "";

    // Nếu có typo correction, hiển thị thông báo
    if (isTypoCorrected) {
      html += `<div class="typo-correction">
        <i class="fas fa-magic"></i>
        <span>Searching with the corrected keyword: "${products[0]?.name?.split(" ")[0] || "..."}"</span>
      </div>`;
    }

    html += products
      .slice(0, 5)
      .map(
        (product) =>
          `<div class="suggestion-item" data-product-id="${product.id}">
            <i class="fas fa-search"></i>
            <span>${escapeHtml(product.name)}</span>
            ${product.minPrice ? `<span class="price">${formatPrice(product.minPrice)}</span>` : ""}
          </div>`,
      )
      .join("");

    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add("active");
  } catch (error) {
    console.error("Error loading suggestions:", error);
    suggestionsDiv.innerHTML =
      '<div class="no-suggestions">Lỗi khi tìm kiếm</div>';
    suggestionsDiv.classList.add("active");
  }
}

// Xử lý form submit - chuyển đến trang search
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();
    if (keyword) {
      saveSearchHistory(keyword);
      window.location.href = `/modules/customer/features/search/search.html?q=${encodeURIComponent(keyword)}`;
    }
  });
}

// Helper: escape HTML để tránh XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function normalizeText(text) {
  return String(text || "").toLowerCase();
}
