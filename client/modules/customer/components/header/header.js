import { productApi } from "../../core/api/product.api.js";

const searchInput = document.querySelector(".search-input");
const searchForm = document.querySelector(".search-form");
const suggestionsDiv = document.querySelector(".search-suggestions");

let searchTimeout;

// Hiển thị suggestions khi gõ
if (searchInput) {
  // Khi focus hoặc gõ
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (keyword.length < 2) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.classList.remove("active");
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
      const productId = suggestionItem.dataset.productId;
      const productName = suggestionItem.querySelector("span")?.textContent?.trim() || "";
      searchInput.value = productName;
      window.location.href = `/modules/customer/features/product_detail/product_detail.html?id=${productId}`;
    }
  });
}

// Hàm load suggestions
async function loadSuggestions(keyword) {
  try {
    const response = await productApi.searchSuggestions(keyword);
    const products = response.content || response;
    const normalizedKeyword = normalizeText(keyword);
    const matchedProducts = (products || []).filter((product) =>
      normalizeText(product?.name).includes(normalizedKeyword)
    );

    if (!matchedProducts.length) {
      suggestionsDiv.innerHTML =
        '<div class="no-suggestions">Không tìm thấy sản phẩm</div>';
      suggestionsDiv.classList.add("active");
      return;
    }

    // Hiển thị top 5 suggestions
    const html = matchedProducts
      .slice(0, 5)
      .map(
        (product) =>
          `<div class="suggestion-item" data-product-id="${product.id}">
            <i class="fas fa-search"></i>
            <span>${escapeHtml(product.name)}</span>
            ${product.minPrice ? `<span class="price">$${product.minPrice}</span>` : ""}
          </div>`
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
