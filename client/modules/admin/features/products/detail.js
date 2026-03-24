import { Sidebar } from "../../components/layouts/sidebar/sidebar.js";
import { productApi } from "../../core/api/product.api.js";
import { variantApi } from "../../core/api/variant.api.js";
import {
  formatCurrency,
  formatDate,
  showLoading,
  renderAttributes,
} from "./helpers.js";
import {
  loadAttributes,
  collectAttributes,
  resetAttributes,
  validateVariantForm,
  getSubmitting,
  setSubmitting,
} from "/modules/admin/features/products/modal.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";
import { confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

new Sidebar();

const productId = window.location.pathname.split("/").pop();
let currentProduct = null;
let currentVariant = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    checkAdmin();
    if (!productId) {
      showToast("No product ID provided.", "warning");
      goBack();
      return;
    }

    await loadProductDetails(productId);
    setupModalEvents();
  } catch (error) {
    console.error("Failed to load product detail page:", error);
  }
});

function setupModalEvents() {
  const modal = document.getElementById("variantModal");
  if (!modal) return;

  modal.querySelectorAll(".btn-close, .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", closeVariantModal);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
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
  } catch (error) {
    console.error("Error loading product:", error);
    showToast("Failed to load product details.", "error");
  } finally {
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
  document.getElementById("productDescription").textContent =
    product.description || "No description available.";
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
}

function loadVariants(product) {
  const tbody = document.getElementById("variantsList");
  if (!tbody) return;

  tbody.innerHTML = (product.variants || [])
    .map((variant) => {
      let stockClass = "high";
      let stockText = variant.stock;
      if (variant.stock === 0) {
        stockClass = "low";
        stockText = "Out of Stock";
      } else if (variant.stock < 10) {
        stockClass = "low";
        stockText = `${variant.stock} (Low)`;
      }

      return `
      <tr>
        <td><span class="variant-sku">${variant.id}</span></td>
        <td>${variant.sku || "-"}</td>
        <td><span class="variant-price">${formatCurrency(variant.price)}</span></td>
        <td><span class="variant-stock ${stockClass}">${stockText}</span></td>
        <td><span class="variant-attributes">${renderAttributes(variant.attributes)}</span></td>
        <td class="variant-actions">
          <button class="variant-btn edit" onclick="editVariant(${variant.id})">✏️</button>
          <button class="variant-btn delete" onclick="deleteVariant(${variant.id})">🗑️</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function normalizeAttributes(attributes = []) {
  return [...attributes]
    .map((attribute) => ({
      attributeId: Number(attribute.attributeId),
      value: String(attribute.value || "").trim(),
    }))
    .sort((left, right) => left.attributeId - right.attributeId);
}

function getVariantFormData() {
  return {
    productId: currentProduct.id,
    price: parseFloat(document.getElementById("variantPrice").value),
    stock: parseInt(document.getElementById("variantStock").value, 10),
    description: document.getElementById("variantDescription").value.trim(),
    attributes: collectAttributes(),
  };
}

function populateVariantForm(variant) {
  document.getElementById("variantPrice").value = variant.price ?? "";
  document.getElementById("variantStock").value = variant.stock ?? "";
  document.getElementById("variantDescription").value =
    variant.description || "";
}

function buildVariantUpdatePayload(originalVariant, formData) {
  const payload = {};

  if (Number(originalVariant.price) !== Number(formData.price)) {
    payload.price = formData.price;
  }

  if (Number(originalVariant.stock) !== Number(formData.stock)) {
    payload.stock = formData.stock;
  }

  if ((originalVariant.description || "") !== formData.description) {
    payload.description = formData.description;
  }

  const originalAttributes = normalizeAttributes(originalVariant.attributes);
  const currentAttributes = normalizeAttributes(formData.attributes);
  if (
    JSON.stringify(originalAttributes) !== JSON.stringify(currentAttributes)
  ) {
    payload.attributes = formData.attributes;
  }

  return payload;
}

window.goBack = () => (window.location.href = "/admin/products");
const goBack = window.goBack;

window.deleteProduct = async () => {
  if (!currentProduct) return;

  const confirmed = await confirmModal(`Delete "${currentProduct.name}"?`, {
    title: "Delete product",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    await productApi.delete(currentProduct.id);
    showToast("Product deleted successfully.", "success");
    goBack();
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
};

window.addVariant = async () => {
  currentVariant = null;
  document.getElementById("variantForm")?.reset();
  document.getElementById("variantModalLabel").textContent = "Add Variant";
  resetAttributes();

  if (currentProduct?.category?.id) {
    await loadAttributes(currentProduct.category.id);
  }

  document.getElementById("variantModal")?.classList.add("show");
  document.body.style.overflow = "hidden";
};

window.editVariant = async (variantId) => {
  try {
    const variant = await variantApi.getById(variantId);
    currentVariant = variant;
    document.getElementById("variantModalLabel").textContent = "Edit Variant";
    document.getElementById("variantForm")?.reset();
    resetAttributes();
    populateVariantForm(variant);
    await loadAttributes(
      currentProduct?.category?.id,
      variant.attributes || [],
    );
    document.getElementById("variantModal")?.classList.add("show");
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Failed to load variant details:", error);
    showToast("Failed to load variant details.", "error");
  }
};

window.closeVariantModal = () => {
  document.getElementById("variantModal")?.classList.remove("show");
  document.body.style.overflow = "";
};
const closeVariantModal = window.closeVariantModal;

window.saveVariant = async () => {
  if (getSubmitting() || !validateVariantForm()) return;

  const variantData = getVariantFormData();

  try {
    setSubmitting(true);

    if (currentVariant) {
      const changedFields = buildVariantUpdatePayload(
        currentVariant,
        variantData,
      );
      if (Object.keys(changedFields).length === 0) {
        showToast("No variant changes detected.", "warning");
        return;
      }

      await variantApi.updateVariant(currentVariant.id, changedFields);
      showToast("Variant updated successfully.", "success");
    } else {
      await variantApi.createVariant(variantData);
      showToast("Variant created successfully.", "success");
    }

    closeVariantModal();
    await loadProductDetails(currentProduct.id);
  } catch (error) {
    console.error("Failed to save variant:", error);
  } finally {
    setSubmitting(false);
  }
};

window.deleteVariant = async (variantId) => {
  const confirmed = await confirmModal("Delete this variant?", {
    title: "Delete variant",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    await variantApi.deleteVariant(variantId);
    showToast("Variant deleted successfully.", "success");
    await loadProductDetails(currentProduct.id);
  } catch (error) {
    console.error("Failed to delete variant:", error);
  }
};

window.uploadImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const mainImage = document.getElementById("mainImage");
      if (mainImage) {
        mainImage.innerHTML = `<img src="${loadEvent.target.result}" alt="Product">`;
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
};
