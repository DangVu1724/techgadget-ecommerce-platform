import { productApi } from "/modules/customer/core/api/product.api.js";
import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import {
  isSmartphoneCategory,
  groupSmartphoneVariants,
  getColorsFromGroup,
  setText,
  formatPrice,
  formatStock,
  buildGalleryImages,
} from "./product-detail.utils.js";
import {
  renderSmartphoneGroups,
  renderSmartphoneColors,
  renderRegularVariants,
  updateVariantDetail,
  updateThumbnails,
  updateAttributesTable,
} from "./product-detail.render.js";
import { showToast } from "/shared/ui/toast.js";

let currentProduct = null;
let variantGroups = null;
let selectedVariant = null;
const BUY_NOW_KEY = "buyNowCheckoutItem";

const renderRelatedProducts = (products = []) => {
  const container = document.getElementById("relatedProductsGrid");
  if (!container) return;

  const relatedItems = products.slice(0, 5);
  if (!relatedItems.length) {
    container.innerHTML =
      '<p class="related-empty">No related products available.</p>';
    return;
  }

  container.innerHTML = relatedItems
    .map(
      (item) => `
      <a class="product-card-link" href="/products/${item.id}">
        <article class="product-card-simple">
          <div class="p-img-box">
            <img
              src="${item.image || "/modules/customer/assets/images/macbook.png"}"
              alt="${item.name || "Related product"}"
            />
          </div>
          <h4>${item.name || "Unnamed product"}</h4>
          <p class="p-price">${formatPrice(item.minPrice || 0)}</p>
        </article>
      </a>
    `,
    )
    .join("");
};

const loadProductFromDb = async () => {
  try {
    // Extract product ID from URL path (/products/:id) or query string (?id=123)
    let productId = null;

    // Try URL path first: /products/123
    const pathMatch = window.location.pathname.match(/\/products\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      productId = pathMatch[1];
    } else {
      // Fallback to query string: ?id=123
      const params = new URLSearchParams(window.location.search);
      productId = params.get("id");
    }

    if (!productId) return;

    const product = await productApi.getById(productId);
    if (!product) return;

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
    try {
      const related = await productApi.getRelated(product.id, 5);
      renderRelatedProducts(related || []);
    } catch (error) {
      console.error("Failed to load related products:", error);
      renderRelatedProducts(product.relatedProducts || []);
    }

    const images = buildGalleryImages(product);

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

      return;
    }

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

    updateAttributesTable(variants[0]?.attributes || product.attributes || []);
  } catch (error) {
    console.error("Failed to load product:", error);
    showToast("Unable to load product details.", "error");
  }
};

const setupWishlist = () => {
  const wishlistBtn = document.querySelector(".btn-wishlist");
  if (!wishlistBtn) return;

  wishlistBtn.addEventListener("click", function () {
    const icon = this.querySelector("i");
    icon?.classList.toggle("fas");
    icon?.classList.toggle("far");
    this.style.backgroundColor = icon?.classList.contains("fas")
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
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      Object.values(panes).forEach(
        (pane) => pane && (pane.style.display = "none"),
      );
      const tabId = tab.dataset.tab;
      if (panes[tabId]) {
        panes[tabId].style.display = "block";
      }
    });
  });
};

window.changeQty = (amount) => {
  const input = document.getElementById("quantity");
  if (!input) return;

  const current = parseInt(input.value || "1", 10);
  const nextValue = current + amount;
  if (nextValue >= 1 && nextValue <= 99) {
    input.value = nextValue;
  }
};

const setupAddToCart = () => {
  const addToCartBtn = document.querySelector(".btn-secondary");
  if (!addToCartBtn) return;

  addToCartBtn.addEventListener("click", async () => {
    if (!authAPI.isLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      await showLoginModal(() => {
        window.location.href = "/login";
      });
      return;
    }

    if (!selectedVariant) {
      showToast("Please select a variant first.", "warning");
      return;
    }

    const quantity = parseInt(
      document.getElementById("quantity")?.value || "1",
      10,
    );

    try {
      await cartAPI.addToCart(selectedVariant.id, quantity);
      showToast("Item added to cart.", "success");
      window.dispatchEvent(new Event("cartUpdated", { bubbles: true }));
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  });
};

const setupOrderNow = () => {
  const orderNowBtn = document.querySelector(".btn-primary");
  if (!orderNowBtn) return;

  orderNowBtn.addEventListener("click", async () => {
    if (!authAPI.isLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      await showLoginModal(() => {
        window.location.href = "/login";
      });
      return;
    }

    if (!selectedVariant) {
      showToast("Please select a variant first.", "warning");
      return;
    }

    const quantity = parseInt(
      document.getElementById("quantity")?.value || "1",
      10,
    );
    if (quantity < 1) {
      showToast("Invalid quantity.", "warning");
      return;
    }

    const user = authAPI.getUser();
    sessionStorage.setItem(
      BUY_NOW_KEY,
      JSON.stringify({
        productId: currentProduct?.id,
        productName: currentProduct?.name || "Product",
        variantId: selectedVariant.id,
        variantName: selectedVariant.name || "",
        quantity,
        price: selectedVariant.price,
        image:
          currentProduct?.images?.[0] ||
          currentProduct?.image ||
          "/modules/customer/assets/images/macbook.png",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        fullName: user?.fullName || "",
      }),
    );

    window.location.href = "/checkout?mode=buy-now";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  loadProductFromDb();
  setupWishlist();
  setupTabs();
  setupAddToCart();
  setupOrderNow();

  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showToast("Review submitted successfully.", "success");
      reviewForm.reset();
    });
  }
});
// Lấy thẻ button
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
