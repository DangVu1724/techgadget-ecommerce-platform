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
  setupReviews();
});

// ─── Review Feature ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#E74C3C", "#3498DB", "#2ECC71", "#F39C12",
  "#9B59B6", "#1ABC9C", "#E67E22", "#34495E",
];

function getAvatarColor(name = "") {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function renderLetterAvatar(name = "?") {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const bg = getAvatarColor(name);
  return `<div class="letter-avatar" style="background:${bg}">${letter}</div>`;
}

function renderStars(rating = 0) {
  const starSvg = `<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.6939 2.10179C8.02403 1.43287 8.97789 1.43287 9.30802 2.10179L10.8291 5.18384L14.2304 5.67807C14.9685 5.78534 15.2633 6.69251 14.7291 7.2132L12.268 9.61224L12.849 12.9997C12.9751 13.735 12.2034 14.2956 11.5431 13.9485L8.50096 12.3491L5.45879 13.9485C4.79853 14.2956 4.02684 13.735 4.15294 12.9997L4.73394 9.61224L2.27277 7.2132C1.73861 6.69251 2.03336 5.78534 2.77156 5.67807L6.17281 5.18384L7.6939 2.10179Z" fill="currentColor"/>
  </svg>`;
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? "#F39C12" : "#ccc"}">${starSvg}</span>`)
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function updateReviewSummary(reviews = []) {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
    : 0;
  const counts = [0, 0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const value = Number(review.rating || 0);
    if (value >= 1 && value <= 5) counts[value] += 1;
  });

  const averageRatingEl = document.getElementById("averageRating");
  const averageStarsEl = document.getElementById("averageStars");
  const reviewTotalEl = document.getElementById("reviewTotal");

  if (averageRatingEl) averageRatingEl.textContent = average ? average.toFixed(1) : "0.0";
  if (reviewTotalEl) reviewTotalEl.textContent = total;
  if (averageStarsEl) {
    const starSvg = `<svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.6939 2.10179C8.02403 1.43287 8.97789 1.43287 9.30802 2.10179L10.8291 5.18384L14.2304 5.67807C14.9685 5.78534 15.2633 6.69251 14.7291 7.2132L12.268 9.61224L12.849 12.9997C12.9751 13.735 12.2034 14.2956 11.5431 13.9485L8.50096 12.3491L5.45879 13.9485C4.79853 14.2956 4.02684 13.735 4.15294 12.9997L4.73394 9.61224L2.27277 7.2132C1.73861 6.69251 2.03336 5.78534 2.77156 5.67807L6.17281 5.18384L7.6939 2.10179Z" fill="currentColor"/>
    </svg>`;
    averageStarsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < Math.round(average) ? "#F39C12" : "#ddd"}">${starSvg}</span>`
    ).join("");
  }

  const maxCount = Math.max(total, 1);
  for (let star = 1; star <= 5; star += 1) {
    const bar = document.getElementById(`bar${star}`);
    const countEl = document.getElementById(`count${star}`);
    const value = counts[star] || 0;
    if (bar) bar.style.width = `${Math.round((value / maxCount) * 100)}%`;
    if (countEl) countEl.textContent = value;
  }
}

function renderReviewList(reviews = [], currentUserId = null, isAdmin = false) {
  const container = document.getElementById("reviewList");
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML = '<p class="review-empty">There are no reviews yet. Be the first to leave one!</p>';
    container.innerHTML = '<p class="review-empty">No reviews yet. Be the first to review!</p>';
    return;
  }

  container.innerHTML = reviews.map((r) => {
    const canEdit = currentUserId && r.userId === currentUserId;
    const canDelete = canEdit || isAdmin;
    const actions = (canEdit || canDelete) ? `
      <div class="review-actions">
        ${canEdit ? `<button class="review-btn-edit" data-id="${r.id}" data-rating="${r.rating}" data-comment="${encodeURIComponent(r.comment)}">Chỉnh sửa</button>` : ""}
        ${canDelete ? `<button class="review-btn-delete" data-id="${r.id}">Xóa</button>` : ""}
        ${canEdit ? `<button class="review-btn-edit" data-id="${r.id}" data-rating="${r.rating}" data-comment="${encodeURIComponent(r.comment)}">Edit</button>` : ""}
        ${canDelete ? `<button class="review-btn-delete" data-id="${r.id}">Delete</button>` : ""}
      </div>` : "";

    return `
      <div class="review-item" data-review-id="${r.id}">
        ${renderLetterAvatar(r.userName)}
        <div class="review-body">
          <div class="stars">${renderStars(r.rating)}</div>
          <p class="review-meta">
            <strong>${r.userName}</strong> – ${formatDate(r.createdAt)}
          </p>
          <p class="review-text">${r.comment}</p>
          ${actions}
        </div>
      </div>`;
  }).join("");
}

function getProductId() {
  const pathMatch = window.location.pathname.match(/\/products\/(\d+)/);
  if (pathMatch) return Number(pathMatch[1]);
  return Number(new URLSearchParams(window.location.search).get("id"));
}

const setupReviews = () => {
  const productId = getProductId();
  if (!productId) return;

  let activeRating = null;
  let allReviews = [];
  const currentUser = authAPI.getUser();
  const currentUserId = currentUser?.id ?? null;
  const isAdmin = currentUser?.role === "ADMIN";

  // Load reviews from API
  const loadReviews = async (rating = null) => {
    try {
      const reviews = await reviewAPI.getByProduct(productId, rating);
      renderReviewList(reviews || [], currentUserId, isAdmin);

      if (!allReviews.length) {
        allReviews = await reviewAPI.getByProduct(productId);
      }

      updateReviewSummary(allReviews);
      if (rating === null) {
        const countEl = document.getElementById("reviewCount");
        if (countEl) countEl.textContent = (allReviews || []).length;
      // Chỉ cập nhật count khi không filter (hiển thị tổng)
      if (rating === null) {
        const countEl = document.getElementById("reviewCount");
        if (countEl) countEl.textContent = (reviews || []).length;
      }
    }} catch {
      const container = document.getElementById("reviewList");
      if (container) container.innerHTML = '<p class="review-empty">Failed to load reviews.</p>';
    }
  };

  loadReviews();

  // Filter buttons
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.dataset.rating;
      activeRating = val === "all" ? null : Number(val);
      loadReviews(activeRating);
    });
  });

  // Auth gate: show form or login prompt
  const formWrapper = document.getElementById("reviewFormWrapper");
  const loginPrompt = document.getElementById("reviewLoginPrompt");

  if (authAPI.isLoggedIn()) {
    formWrapper && (formWrapper.style.display = "block");
    loginPrompt && (loginPrompt.style.display = "none");
  } else {
    formWrapper && (formWrapper.style.display = "none");
    loginPrompt && (loginPrompt.style.display = "block");
  }

  // Star rating interaction
  let selectedRating = 0;
  const starIcons = document.querySelectorAll(".star-icon");

  const updateStarDisplay = (rating) => {
    starIcons.forEach((s) => {
      const value = Number(s.dataset.value);
      s.classList.toggle("active", value <= rating);
    });
  };

  starIcons.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const val = Number(star.dataset.value);
      updateStarDisplay(val);
    });

    star.addEventListener("mouseleave", () => {
      updateStarDisplay(selectedRating);
  starIcons.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const val = Number(star.dataset.value);
      starIcons.forEach((s) => {
        s.textContent = Number(s.dataset.value) <= val ? "★" : "☆";
      });
    });

    star.addEventListener("mouseleave", () => {
      starIcons.forEach((s) => {
        s.textContent = Number(s.dataset.value) <= selectedRating ? "★" : "☆";
      });
    });

    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      updateStarDisplay(selectedRating);
      starIcons.forEach((s) => {
        s.textContent = Number(s.dataset.value) <= selectedRating ? "★" : "☆";
      });
    });
  });


    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      starIcons.forEach((s) => {
        s.textContent = Number(s.dataset.value) <= selectedRating ? "★" : "☆";
      });
    });
  });

  // Form submit (create)
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!selectedRating) {
        showToast("Please select a star rating.", "warning");
        return;
      }

      const comment = document.getElementById("reviewText")?.value?.trim();
      if (!comment) {
        showToast("Please write your review.", "warning");
        return;
      }

      try {
        await reviewAPI.create({ productId, rating: selectedRating, comment });
        showToast("Review submitted successfully.", "success");
        reviewForm.reset();
        selectedRating = 0;
        starIcons.forEach((s) => (s.textContent = "☆"));
        loadReviews(activeRating);
      } catch {
        // error toast handled by request.js
      }
    });
  }

  const reviewList = document.getElementById("reviewList");
  if (reviewList) {
    reviewList.addEventListener("click", async (e) => {
      // DELETE
      if (e.target.classList.contains("review-btn-delete")) {
        const reviewId = Number(e.target.dataset.id);
        if (!confirm("Delete this review?")) return;
        try {
          await reviewAPI.delete(reviewId);
          showToast("Review deleted.", "success");
          loadReviews(activeRating);
        } catch {
          // handled by request.js
        }
      }

      // EDIT — open inline edit form
      if (e.target.classList.contains("review-btn-edit")) {
        const reviewId = Number(e.target.dataset.id);
        const oldRating = Number(e.target.dataset.rating);
        const oldComment = decodeURIComponent(e.target.dataset.comment);
        const reviewItem = e.target.closest(".review-item");
        if (!reviewItem) return;

        if (reviewItem.querySelector(".inline-edit-form")) return;

        let editRating = oldRating;
        const starsHtml = Array.from({ length: 5 }, (_, i) => {
          const v = i + 1;
          return `<span class="star-icon-edit" data-value="${v}" style="cursor:pointer;font-size:22px;color:#F39C12">${v <= oldRating ? "★" : "☆"}</span>`;
        }).join("");

        const form = document.createElement("div");
        form.className = "inline-edit-form";
        form.innerHTML = `
          <div class="inline-edit-stars">${starsHtml}</div>
          <textarea class="inline-edit-textarea">${oldComment}</textarea>
          <div class="inline-edit-btns">
            <button class="review-btn-save" data-id="${reviewId}">Save</button>
            <button class="review-btn-cancel">Cancel</button>
          </div>`;

        reviewItem.appendChild(form);

        form.querySelectorAll(".star-icon-edit").forEach((s) => {
          s.addEventListener("click", () => {
            editRating = Number(s.dataset.value);
            form.querySelectorAll(".star-icon-edit").forEach((x) => {
              x.textContent = Number(x.dataset.value) <= editRating ? "★" : "☆";
            });
          });
        });

        form.querySelector(".review-btn-cancel").addEventListener("click", () => form.remove());

        form.querySelector(".review-btn-save").addEventListener("click", async () => {
          const comment = form.querySelector(".inline-edit-textarea").value.trim();
          if (!comment) { showToast("Comment cannot be empty.", "warning"); return; }
          try {
            await reviewAPI.update(reviewId, { rating: editRating, comment });
            showToast("Review updated.", "success");
            loadReviews(activeRating);
          } catch {
            // handled by request.js
          }
        });
      }
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
if (backToTopBtn) {
  backToTopBtn.onclick = function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
}

backToTopBtn.onclick = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Edit / Delete via event delegation on reviewList
  const reviewList = document.getElementById("reviewList");
  if (!reviewList) return;

  reviewList.addEventListener("click", async (e) => {
    // DELETE
    if (e.target.classList.contains("review-btn-delete")) {
      const reviewId = Number(e.target.dataset.id);
      if (!confirm("Delete this review?")) return;
      try {
        await reviewAPI.delete(reviewId);
        showToast("Review deleted.", "success");
        loadReviews(activeRating);
      } catch {
        // handled by request.js
      }
    }

    // EDIT — open inline edit form
    if (e.target.classList.contains("review-btn-edit")) {
      const reviewId = Number(e.target.dataset.id);
      const oldRating = Number(e.target.dataset.rating);
      const oldComment = decodeURIComponent(e.target.dataset.comment);
      const reviewItem = e.target.closest(".review-item");
      if (!reviewItem) return;

      // Prevent duplicate inline forms
      if (reviewItem.querySelector(".inline-edit-form")) return;

      let editRating = oldRating;
      const starsHtml = Array.from({ length: 5 }, (_, i) => {
        const v = i + 1;
        return `<span class="star-icon-edit" data-value="${v}" style="cursor:pointer;font-size:22px;color:#F39C12">${v <= oldRating ? "★" : "☆"}</span>`;
      }).join("");

      const form = document.createElement("div");
      form.className = "inline-edit-form";
      form.innerHTML = `
        <div class="inline-edit-stars">${starsHtml}</div>
        <textarea class="inline-edit-textarea">${oldComment}</textarea>
        <div class="inline-edit-btns">
          <button class="review-btn-save" data-id="${reviewId}">Save</button>
          <button class="review-btn-cancel">Cancel</button>
        </div>`;

      reviewItem.appendChild(form);

      // Star interaction inside inline form
      form.querySelectorAll(".star-icon-edit").forEach((s) => {
        s.addEventListener("click", () => {
          editRating = Number(s.dataset.value);
          form.querySelectorAll(".star-icon-edit").forEach((x) => {
            x.textContent = Number(x.dataset.value) <= editRating ? "★" : "☆";
          });
        });
      });

      form.querySelector(".review-btn-cancel").addEventListener("click", () => form.remove());

      form.querySelector(".review-btn-save").addEventListener("click", async () => {
        const comment = form.querySelector(".inline-edit-textarea").value.trim();
        if (!comment) { showToast("Comment cannot be empty.", "warning"); return; }
        try {
          await reviewAPI.update(reviewId, { rating: editRating, comment });
          showToast("Review updated.", "success");
          loadReviews(activeRating);
        } catch {
          // handled by request.js
        }
      });
    }
  });
}};
