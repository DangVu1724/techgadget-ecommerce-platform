import { productApi } from "/modules/customer/core/api/product.api.js";
import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { reviewAPI } from "/modules/customer/core/api/review.api.js";
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
let selectedVariant = null;

const BUY_NOW_KEY = "buyNowCheckoutItem";
const FILLED_STAR = "\u2605";
const EMPTY_STAR = "\u2606";
const PRODUCT_DETAIL_ROUTE_PATTERN = /\/product\/(\d+)/;
const REVIEWS_PER_PAGE = 5;
const AVATAR_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#34495E",
];

const setProductLoading = (isLoading) => {
  const skeleton = document.getElementById("productSkeleton");
  const content = document.getElementById("productContent");
  const breadcrumb = document.getElementById("productBreadcrumb");

  skeleton?.classList.toggle("is-hidden", !isLoading);
  content?.classList.toggle("is-hidden", isLoading);
  content?.setAttribute("aria-busy", String(isLoading));
  breadcrumb?.setAttribute("aria-busy", String(isLoading));
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getProductId = () => {
  const pathMatch = window.location.pathname.match(PRODUCT_DETAIL_ROUTE_PATTERN);
  if (pathMatch?.[1]) return Number(pathMatch[1]);

  const searchId = new URLSearchParams(window.location.search).get("id");
  return Number(searchId || 0);
};

const applyVariantSelection = (product, variant) => {
  selectedVariant = variant || null;

  if (variant) {
    setText("#productPrice", formatPrice(variant.price));
    setText("#productStock", formatStock(variant.stock));
    updateVariantDetail(product, variant);
    updateAttributesTable(variant.attributes || product.attributes || []);
    return;
  }

  setText("#productPrice", formatPrice(product.minPrice || 0));
  setText("#productStock", formatStock(product.stock || 0));
  updateVariantDetail(product, null);
  updateAttributesTable(product.attributes || []);
};

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
    .map((item) => {
      const image =
        item.image || "/modules/customer/assets/images/macbook.png";
      return `
        <a class="product-card-link" href="/product/${item.id}">
          <article class="product-card-simple">
            <div class="p-img-box">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(item.name || "Related product")}" />
            </div>
            <h4>${escapeHtml(item.name || "Unnamed product")}</h4>
            <p class="p-price">${formatPrice(item.minPrice || 0)}</p>
          </article>
        </a>
      `;
    })
    .join("");
};

const loadProductFromDb = async () => {
  const productId = getProductId();

  if (!productId) {
    showToast("Product ID is missing.", "warning");
    setProductLoading(false);
    return;
  }

  setProductLoading(true);

  try {
    const product = await productApi.getById(productId);
    if (!product) {
      showToast("Product not found.", "warning");
      return;
    }

    currentProduct = product;
    const productName = product.name || "Product";

    setText("#productTitle", productName);
    setText("#breadcrumbName", productName);
    setText(
      "#productDescription",
      product.description || "No description available.",
    );
    setText("#productCategory", product.category?.name || "Unknown");
    document.title = `${productName} | TechGadget`;

    updateThumbnails(buildGalleryImages(product));

    try {
      const related = await productApi.getRelated(product.id, 5);
      renderRelatedProducts(related || []);
    } catch (error) {
      console.error("Failed to load related products:", error);
      renderRelatedProducts([]);
    }

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const isSmartphone = isSmartphoneCategory(product.category);
    const colorVariation = document
      .getElementById("colorOptions")
      ?.closest(".p-variation");
    const colorLabel = colorVariation?.querySelector(".v-label");

    if (isSmartphone && variants.length > 0) {
      const variantGroups = groupSmartphoneVariants(variants);
      const firstGroup = Array.from(variantGroups.values())[0];

      renderSmartphoneGroups(variantGroups, product, (group) => {
        renderSmartphoneColors(group, (variant) => {
          applyVariantSelection(product, variant);
        });

        applyVariantSelection(product, getColorsFromGroup(group)[0]?.variant);
      });

      if (colorLabel) colorLabel.style.display = "block";
      if (firstGroup) {
        renderSmartphoneColors(firstGroup, (variant) => {
          applyVariantSelection(product, variant);
        });
        applyVariantSelection(product, getColorsFromGroup(firstGroup)[0]?.variant);
      }
    } else {
      renderRegularVariants(variants, product, (variant) => {
        applyVariantSelection(product, variant);
      });

      if (colorLabel) colorLabel.style.display = "none";
      applyVariantSelection(product, variants[0] || null);
    }
  } catch (error) {
    console.error("Failed to load product:", error);
    showToast("Unable to load product details.", "error");
  } finally {
    setProductLoading(false);
  }
};

const setupWishlist = () => {
  const wishlistBtn = document.querySelector(".btn-wishlist");
  if (!wishlistBtn) return;

  wishlistBtn.addEventListener("click", function () {
    const icon = this.querySelector("i");
    const isActive = icon?.classList.toggle("fas");

    icon?.classList.toggle("far", !isActive);
    this.style.backgroundColor = isActive ? "#FF6F42" : "";
  });
};

const setupTabs = () => {
  const tabs = Array.from(document.querySelectorAll(".tab-link"));
  const panes = {
    description: document.getElementById("tab-description"),
    information: document.getElementById("tab-information"),
    reviews: document.getElementById("tab-reviews"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      Object.values(panes).forEach((pane) => {
        if (pane) pane.style.display = "none";
      });

      tab.classList.add("active");
      const targetPane = panes[tab.dataset.tab];
      if (targetPane) targetPane.style.display = "block";
    });
  });
};

window.changeQty = (amount) => {
  const input = document.getElementById("quantity");
  if (!input) return;

  const current = Number.parseInt(input.value || "1", 10);
  const nextValue = current + amount;
  if (nextValue >= 1 && nextValue <= 99) {
    input.value = String(nextValue);
  }
};

const requireLogin = async () => {
  if (authAPI.isLoggedIn()) return true;

  localStorage.setItem("redirectAfterLogin", window.location.href);
  await showLoginModal(() => {
    window.location.href = "/login";
  });
  return false;
};

const getSelectedQuantity = () =>
  Number.parseInt(document.getElementById("quantity")?.value || "1", 10);

const setupAddToCart = () => {
  const addToCartBtn = document.querySelector(".btn-secondary");
  if (!addToCartBtn) return;

  addToCartBtn.addEventListener("click", async () => {
    if (!(await requireLogin())) return;
    if (!selectedVariant) {
      showToast("Please select a variant first.", "warning");
      return;
    }

    try {
      await cartAPI.addToCart(selectedVariant.id, getSelectedQuantity());
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
    if (!(await requireLogin())) return;
    if (!selectedVariant) {
      showToast("Please select a variant first.", "warning");
      return;
    }

    const quantity = getSelectedQuantity();
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

const getAvatarColor = (name = "") => {
  const code = name.trim().toUpperCase().charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const renderLetterAvatar = (name = "?") => {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return `<div class="letter-avatar" style="background:${getAvatarColor(name)}">${letter}</div>`;
};

const renderStars = (rating = 0) =>
  Array.from(
    { length: 5 },
    (_, index) =>
      `<span style="color:${index < rating ? "#F39C12" : "#D6D6D6"}">${FILLED_STAR}</span>`,
  ).join("");

const renderAverageStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) =>
    index < Math.round(rating) ? FILLED_STAR : EMPTY_STAR,
  ).join("");

const paintStarSelection = (starIcons, rating) => {
  starIcons.forEach((star) => {
    star.classList.toggle("active", Number(star.dataset.value) <= rating);
  });
};

const updateReviewSummary = (summary = null) => {
  const average = Number(summary?.averageRating) || 0;
  const total = Number(summary?.totalReviews) || 0;
  const ratingCounts = {
    1: Number(summary?.count1) || 0,
    2: Number(summary?.count2) || 0,
    3: Number(summary?.count3) || 0,
    4: Number(summary?.count4) || 0,
    5: Number(summary?.count5) || 0,
  };

  setText("#averageRating", average.toFixed(1));
  setText("#averageStars", renderAverageStars(average));
  setText("#reviewTotal", String(total));
  setText("#reviewCount", String(total));

  Object.entries(ratingCounts).forEach(([rating, count]) => {
    const countEl = document.getElementById(`count${rating}`);
    const barEl = document.getElementById(`bar${rating}`);
    const percentage = total ? (count / total) * 100 : 0;

    if (countEl) countEl.textContent = String(count);
    if (barEl) barEl.style.width = `${percentage}%`;
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

const renderReviewPagination = (currentPage, totalPages) => {
  const container = document.getElementById("reviewPagination");
  if (!container) return;

  if (totalPages <= 1) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const items = buildPaginationItems(currentPage, totalPages);
  container.hidden = false;
  container.innerHTML = `
    <button class="review-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>Prev</button>
    ${items
      .map((item) =>
        item === "..."
          ? '<span class="review-page-ellipsis">...</span>'
          : `<button class="review-page-btn ${item === currentPage ? "active" : ""}" data-page="${item}">${item}</button>`,
      )
      .join("")}
    <button class="review-page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
  `;
};

const renderReviewList = (reviews = [], currentUserId = null, isAdmin = false) => {
  const container = document.getElementById("reviewList");
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML =
      '<p class="review-empty">No reviews yet. Be the first to review!</p>';
    return;
  }

  container.innerHTML = reviews
    .map((review) => {
      const canEdit = currentUserId && review.userId === currentUserId;
      const canDelete = canEdit || isAdmin;

      return `
        <div class="review-item" data-review-id="${review.id}">
          ${renderLetterAvatar(review.userName || "?")}
          <div class="review-body">
            <div class="stars">${renderStars(Number(review.rating) || 0)}</div>
            <p class="review-meta">
              <strong>${escapeHtml(review.userName || "Anonymous")}</strong> - ${escapeHtml(formatDate(review.createdAt))}
            </p>
            <p class="review-text">${escapeHtml(review.comment || "")}</p>
            ${
              canEdit || canDelete
                ? `<div class="review-actions">
                    ${canEdit ? `<button class="review-btn-edit" data-id="${review.id}" data-rating="${review.rating}" data-comment="${encodeURIComponent(review.comment || "")}">Edit</button>` : ""}
                    ${canDelete ? `<button class="review-btn-delete" data-id="${review.id}">Delete</button>` : ""}
                  </div>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
};

const setupReviews = () => {
  const productId = getProductId();
  if (!productId) return;

  const currentUser = authAPI.getUser();
  const currentUserId = currentUser?.id ?? null;
  const isAdmin = currentUser?.role === "ADMIN";
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const reviewList = document.getElementById("reviewList");
  const reviewPagination = document.getElementById("reviewPagination");
  const reviewForm = document.getElementById("reviewForm");
  const starIcons = Array.from(document.querySelectorAll(".star-icon"));
  const formWrapper = document.getElementById("reviewFormWrapper");
  const loginPrompt = document.getElementById("reviewLoginPrompt");

  let activeRating = null;
  let currentPage = 1;
  let selectedRating = 0;

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getByProduct(productId, {
        rating: activeRating,
        page: currentPage - 1,
        size: REVIEWS_PER_PAGE,
      });

      const totalPages = Number(response?.totalPages) || 0;
      if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
        return loadReviews();
      }

      renderReviewList(response?.items || [], currentUserId, isAdmin);
      renderReviewPagination(currentPage, totalPages);
      updateReviewSummary(response?.summary || null);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      if (reviewList) {
        reviewList.innerHTML =
          '<p class="review-empty">Failed to load reviews.</p>';
      }
      if (reviewPagination) {
        reviewPagination.hidden = true;
        reviewPagination.innerHTML = "";
      }
      updateReviewSummary(null);
    }
  };

  if (authAPI.isLoggedIn()) {
    if (formWrapper) formWrapper.style.display = "block";
    if (loginPrompt) loginPrompt.style.display = "none";
  } else {
    if (formWrapper) formWrapper.style.display = "none";
    if (loginPrompt) loginPrompt.style.display = "block";
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeRating =
        button.dataset.rating === "all"
          ? null
          : Number(button.dataset.rating || 0);
      currentPage = 1;
      loadReviews();
    });
  });

  reviewPagination?.addEventListener("click", (event) => {
    const button = event.target.closest(".review-page-btn");
    if (!button || button.disabled) return;

    currentPage = Number(button.dataset.page || currentPage);
    loadReviews();
  });

  starIcons.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      paintStarSelection(starIcons, Number(star.dataset.value));
    });

    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      paintStarSelection(starIcons, selectedRating);
    });
  });

  document.getElementById("ratingStars")?.addEventListener("mouseleave", () => {
    paintStarSelection(starIcons, selectedRating);
  });

  reviewForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const comment = document.getElementById("reviewText")?.value?.trim();
    if (!selectedRating) {
      showToast("Please select a star rating.", "warning");
      return;
    }
    if (!comment) {
      showToast("Please write your review.", "warning");
      return;
    }

    try {
      await reviewAPI.create({ productId, rating: selectedRating, comment });
      reviewForm.reset();
      selectedRating = 0;
      paintStarSelection(starIcons, selectedRating);
      showToast("Review submitted successfully.", "success");
      currentPage = 1;
      loadReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  });

  reviewList?.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".review-btn-edit");
    const deleteButton = event.target.closest(".review-btn-delete");

    if (editButton) {
      const reviewId = Number(editButton.dataset.id);
      const initialRating = Number(editButton.dataset.rating || 0);
      const initialComment = decodeURIComponent(editButton.dataset.comment || "");
      const nextRating = Number(
        window.prompt("Rating (1-5):", String(initialRating)) || initialRating,
      );
      const nextComment = window.prompt("Edit your review:", initialComment);

      if (!nextComment || nextRating < 1 || nextRating > 5) return;

      try {
        await reviewAPI.update(reviewId, {
          productId,
          rating: nextRating,
          comment: nextComment.trim(),
        });
        showToast("Review updated.", "success");
        loadReviews();
      } catch (error) {
        console.error("Failed to update review:", error);
      }
      return;
    }

    if (deleteButton) {
      const reviewId = Number(deleteButton.dataset.id);
      if (!window.confirm("Delete this review?")) return;

      try {
        await reviewAPI.delete(reviewId);
        showToast("Review deleted.", "success");
        loadReviews();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  });

  loadReviews();
};

document.addEventListener("DOMContentLoaded", () => {
  loadProductFromDb();
  setupWishlist();
  setupTabs();
  setupAddToCart();
  setupOrderNow();
  setupReviews();
});
