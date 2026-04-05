import { productApi } from "../../core/api/product.api.js";

const searchInput = document.querySelector(".search-input");
const searchForm = document.querySelector(".search-form");
const suggestionsDiv = document.querySelector(".search-suggestions");
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

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
    const isTypoCorrected = products.some(product => 
      product.name.toLowerCase().includes(keyword.toLowerCase()) === false &&
      (product.name.toLowerCase().includes('iphone') && keyword.toLowerCase().includes('ihone')) ||
      (product.name.toLowerCase().includes('samsung') && keyword.toLowerCase().includes('samung')) ||
      (product.name.toLowerCase().includes('macbook') && keyword.toLowerCase().includes('macbok'))
    );

    // Hiển thị kết quả với smart search
    let html = '';
    
    // Nếu có typo correction, hiển thị thông báo
    if (isTypoCorrected) {
      html += `<div class="typo-correction">
        <i class="fas fa-magic"></i>
        <span>Searching with the corrected keyword: "${products[0]?.name?.split(' ')[0] || '...'}"</span>
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
