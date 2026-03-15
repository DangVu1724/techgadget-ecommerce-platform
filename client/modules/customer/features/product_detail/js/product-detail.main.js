import { productApi } from "/modules/customer/core/api/product.api.js";
import {
  isSmartphoneCategory,
  groupSmartphoneVariants,
  getColorsFromGroup,
} from "./product-detail.utils.js";
import {
  renderSmartphoneGroups,
  renderSmartphoneColors,
  renderRegularVariants,
  updateVariantDetail,
  updateThumbnails,
  updateAttributesTable,
} from "./product-detail.render.js";
import { setText, formatPrice, formatStock } from "./product-detail.utils.js";

// ==================== STATE ====================
let currentProduct = null;
let variantGroups = null;
let selectedVariant = null;

// ==================== LOAD PRODUCT ====================
const loadProductFromDb = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
      console.error("No product ID in URL");
      return;
    }

    const product = await productApi.getById(productId);
    if (!product) {
      console.error("Product not found");
      return;
    }

    currentProduct = product;

    const productName = product.name || "No name";
    setText("#productTitle", productName);
    setText("#breadcrumbName", productName);
    document.title = `${productName} | TechGadget`;

    setText(
      "#productDescription",
      product.description || "No description available.",
    );
    setText(
      "#descriptionText",
      product.description || "No description available.",
    );
    setText("#productCategory", product.category?.name || "Unknown");
    setText("#productStars", "★★★★★");

    const images = product.images?.length
      ? product.images
      : [product.image || "/modules/customer/assets/images/macbook.png"];
    updateThumbnails(images);

    const isSmartphone = isSmartphoneCategory(product.category);

    const colorVariation = document.querySelector(
      ".p-variation:has(#colorOptions)",
    );
    const colorLabel = colorVariation?.querySelector(".v-label");

    if (colorLabel) {
      colorLabel.style.display = isSmartphone ? "block" : "none";
    }

    const variants = product.variants || [];

    if (isSmartphone && variants.length > 0) {
      variantGroups = groupSmartphoneVariants(variants);

      renderSmartphoneGroups(variantGroups, product, (group) => {
        renderSmartphoneColors(group, (variant) => {
          selectedVariant = variant;
          updateVariantDetail(product, variant);
        });

        const colors = getColorsFromGroup(group);
        if (colors.length > 0) {
          selectedVariant = colors[0].variant;
          updateVariantDetail(product, colors[0].variant);
        }
      });

      const firstGroup = Array.from(variantGroups.values())[0];
      if (firstGroup) {
        renderSmartphoneColors(firstGroup, (variant) => {
          selectedVariant = variant;
          updateVariantDetail(product, variant);
        });

        const firstColors = getColorsFromGroup(firstGroup);
        if (firstColors.length > 0) {
          selectedVariant = firstColors[0].variant;
          updateVariantDetail(product, firstColors[0].variant);
        }
      }
    } else {
      renderRegularVariants(variants, product, (variant) => {
        selectedVariant = variant;
        updateVariantDetail(product, variant);
        setText("#productPrice", formatPrice(variant.price));
        setText("#productStock", formatStock(variant.stock));
      });

      if (variants.length > 0) {
        selectedVariant = variants[0];
        updateVariantDetail(product, variants[0]);
        setText("#productPrice", formatPrice(variants[0].price));
        setText("#productStock", formatStock(variants[0].stock));
      }

      if (variants[0]?.attributes) {
        updateAttributesTable(variants[0].attributes);
      } else {
        updateAttributesTable(product.attributes || []);
      }
    }
  } catch (error) {
    console.error("Failed to load product:", error);
  }
};

// ==================== EVENT HANDLERS ====================
const setupWishlist = () => {
  const wishlistBtn = document.querySelector(".btn-wishlist");
  if (!wishlistBtn) return;

  wishlistBtn.addEventListener("click", function () {
    const icon = this.querySelector("i");
    icon.classList.toggle("fas");
    icon.classList.toggle("far");
    this.style.backgroundColor = icon.classList.contains("fas")
      ? "#FF6F42"
      : "";
  });
};

const setupTabs = () => {
  const tabs = document.querySelectorAll(".tab-link");
  const panes = {
    description: document.getElementById("tab-description"),
    information: document.getElementById("tab-information"),
    reviews: document.getElementById("tab-reviews"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      Object.values(panes).forEach((pane) => {
        if (pane) pane.style.display = "none";
      });

      const tabId = tab.dataset.tab;
      if (panes[tabId]) {
        panes[tabId].style.display = "block";
      }
    });
  });
};

// ==================== QUANTITY CONTROL ====================
window.changeQty = (amount) => {
  const input = document.getElementById("quantity");
  if (!input) return;

  const current = parseInt(input.value) || 1;
  const newValue = current + amount;

  if (newValue >= 1 && newValue <= 99) {
    input.value = newValue;
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  loadProductFromDb();
  setupWishlist();
  setupTabs();

  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Review submitted successfully!");
      reviewForm.reset();
    });
  }
});