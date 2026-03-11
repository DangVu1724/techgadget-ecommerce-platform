// detail.js
import { Sidebar } from "../../components/layouts/sidebar/sidebar.js";
import { requireAdmin } from "/modules/core/auth/auth.guard.js";
import { productApi } from "../../core/api/product.api.js";
import { variantApi } from "../../core/api/variant.api.js";
import {
  formatCurrency,
  formatDate,
  showLoading,
  renderAttributes,
} from "./helpers.js";
import { loadAttributes, collectAttributes, resetAttributes } from "./modal.js";
import { validateVariantForm, setSubmitting, getSubmitting } from "./modal.js";
// Initialize sidebar
new Sidebar();

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let currentProduct = null;
let currentVariant = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    requireAdmin();
    if (productId) {
      await loadProductDetails(productId);
    } else {
      alert("No product ID provided");
      goBack();
    }

    setupModalEvents();
  } catch (error) {
    console.error("Failed to load:", error);
  }
});

function setupModalEvents() {
  const modal = document.getElementById("variantModal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".btn-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeVariantModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeVariantModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeVariantModal();
    }
  });
}

async function loadProductDetails(id) {
  try {
    showLoading(true);
    const product = await productApi.getById(id);
    currentProduct = product;

    updateProductUI(product);
    loadVariants(product);

    showLoading(false);
  } catch (error) {
    console.error("Error loading product:", error);
    alert("Failed to load product details: " + error.message);
    showLoading(false);
  }
}

function updateProductUI(product) {
  document.getElementById("productName").textContent =
    product.name || "Unnamed Product";
  document.getElementById("productId").textContent = product.id || "-";
  document.getElementById("brandName").textContent =
    product.brand?.brandName || "-";
  document.getElementById("categoryName").textContent =
    product.category?.name || "-";

  const descElement = document.getElementById("productDescription");
  if (descElement) {
    descElement.textContent =
      product.description || "No description available.";
  }

  document.getElementById("minPrice").textContent = formatCurrency(
    product.minPrice,
  );
  document.getElementById("maxPrice").textContent = product.maxPrice
    ? formatCurrency(product.maxPrice)
    : "-";
  document.getElementById("totalStock").textContent = product.totalStock || 0;
  document.getElementById("sold").textContent = product.sold || 0;
  document.getElementById("createdAt").textContent = formatDate(
    product.createdAt,
  );
  document.getElementById("updatedAt").textContent = formatDate(
    product.updatedAt,
  );

  if (product.imageUrl) {
    const mainImage = document.getElementById("mainImage");
    mainImage.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}">`;
  }
}

function loadVariants(product) {
  const variants = product.variants || [];
  const tbody = document.getElementById("variantsList");
  if (!tbody) return;

  tbody.innerHTML = "";

  variants.forEach((variant) => {
    const row = document.createElement("tr");

    let stockClass = "high";
    let stockText = variant.stock;

    if (variant.stock === 0) {
      stockClass = "low";
      stockText = "Out of Stock";
    } else if (variant.stock < 10) {
      stockClass = "low";
      stockText = `${variant.stock} (Low)`;
    }

    row.innerHTML = `
      <td><span class="variant-sku">${variant.id}</span></td>
      <td>${variant.name || "-"}</td>
      <td><span class="variant-price">${formatCurrency(variant.price)}</span></td>
      <td><span class="variant-stock ${stockClass}">${stockText}</span></td>
      <td><span class="variant-attributes">${renderAttributes(variant.attributes)}</span></td>
      <td class="variant-actions">
        <button class="variant-btn edit" onclick="editVariant(${variant.id})">✏️</button>
        <button class="variant-btn delete" onclick="deleteVariant(${variant.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Tab switching
window.switchTab = function (tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.add("active");
};

// Navigation
window.goBack = () => (window.location.href = "products.html");

window.editProduct = () => {
  if (currentProduct) {
    window.location.href = `product-edit.html?id=${currentProduct.id}`;
  }
};

window.deleteProduct = async () => {
  if (!currentProduct) return;
  if (confirm(`Are you sure you want to delete "${currentProduct.name}"?`)) {
    try {
      await productApi.delete(currentProduct.id);
      alert("Product deleted successfully!");
      goBack();
    } catch (error) {
      alert("Failed to delete product: " + error.message);
    }
  }
};

// Variant functions
window.addVariant = async () => {
  currentVariant = null;
  const form = document.getElementById("variantForm");
  if (form) form.reset();

  const modalTitle = document.getElementById("variantModalLabel");
  if (modalTitle) modalTitle.textContent = "Add Variant";

  resetAttributes();
  await loadAttributes();

  const modal = document.getElementById("variantModal");
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.editVariant = async (variantId) => {
  currentVariant = variantId;
  const modalTitle = document.getElementById("variantModalLabel");
  if (modalTitle) modalTitle.textContent = "Edit Variant";

  resetAttributes();
  await loadAttributes();

  const modal = document.getElementById("variantModal");
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.closeVariantModal = () => {
  const modal = document.getElementById("variantModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
};

window.saveVariant = async () => {
  if (getSubmitting()) return;

  // Validate form
  if (!validateVariantForm()) {
    return;
  }

  const variantData = {
    productId: currentProduct.id,
    name: document.getElementById("variantName").value,
    price: parseFloat(document.getElementById("variantPrice").value),
    stock: parseInt(document.getElementById("variantStock").value),
    description: document.getElementById("variantDescription").value,
    attributes: collectAttributes(),
    productId: currentProduct.id,
  };

  try {
    if (currentVariant) {
      await variantApi.updateVariant(currentVariant, variantData);
      alert("Variant updated successfully");
    } else {
      await variantApi.createVariant(variantData);
      alert("Variant created successfully");
    }

    closeVariantModal();
    await loadProductDetails(currentProduct.id);
  } catch (err) {
    console.error(err);
    alert("Failed to save variant: " + err.message);
  }
};

window.deleteVariant = async (variantId) => {
  if (confirm("Are you sure you want to delete this variant?")) {
    try {
      await variantApi.deleteVariant(variantId);
      alert("Variant deleted successfully!");
      await loadProductDetails(currentProduct.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete variant: " + err.message);
    }
  }
};

// Image functions
window.uploadImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mainImage = document.getElementById("mainImage");
        if (mainImage) {
          mainImage.innerHTML = `<img src="${e.target.result}" alt="Product">`;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};
