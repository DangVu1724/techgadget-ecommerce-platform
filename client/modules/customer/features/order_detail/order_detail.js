import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { orderApi } from "/modules/customer/core/api/order.api.js";

const state = {
  order: null,
  orderId: null,
};

const elements = {
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  orderContent: document.getElementById("orderContent"),
  orderCode: document.getElementById("orderCode"),
  orderStatus: document.getElementById("orderStatus"),
  heroDescription: document.getElementById("heroDescription"),
  orderTimeline: document.getElementById("orderTimeline"),
  orderMeta: document.getElementById("orderMeta"),
  orderItems: document.getElementById("orderItems"),
  subtotal: document.getElementById("subtotal"),
  shippingFee: document.getElementById("shippingFee"),
  cancelOrderButton: document.getElementById("cancelOrderButton"),
  discountRow: document.getElementById("discountRow"),
  discount: document.getElementById("discount"),
  totalAmount: document.getElementById("totalAmount"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  customerAddress: document.getElementById("customerAddress"),
  errorMessage: document.getElementById("errorMessage"),
};

const STATUS_CONFIG = {
  PENDING: {
    className: "status-pending",
    label: "Pending",
    hero: "The order has been created and is waiting for confirmation or payment.",
  },
  CONFIRMED: {
    className: "status-processing",
    label: "Confirmed",
    hero: "The order has been confirmed and is queued for preparation.",
  },
  PROCESSING: {
    className: "status-processing",
    label: "Processing",
    hero: "The warehouse is preparing and packing the order.",
  },
  SHIPPING: {
    className: "status-shipping",
    label: "Shipping",
    hero: "The order has left the warehouse and is on the way.",
  },
  DELIVERED: {
    className: "status-delivered",
    label: "Delivered",
    hero: "The order was delivered successfully.",
  },
  CANCELLED: {
    className: "status-cancelled",
    label: "Cancelled",
    hero: "This order has been cancelled and will not continue through fulfillment.",
  },
  FAILED: {
    className: "status-failed",
    label: "Failed",
    hero: "This order failed during fulfillment or delivery.",
  },
};

const TIMELINE_STEPS = [
  {
    key: "PENDING",
    icon: "fa-receipt",
    title: "Pending",
    copy: "Order created",
  },
  {
    key: "CONFIRMED",
    icon: "fa-check",
    title: "Confirmed",
    copy: "Order reviewed",
  },
  {
    key: "PROCESSING",
    icon: "fa-box-open",
    title: "Processing",
    copy: "Preparing items",
  },
  {
    key: "SHIPPING",
    icon: "fa-truck-fast",
    title: "Shipping",
    copy: "On the way",
  },
  {
    key: "DELIVERED",
    icon: "fa-circle-check",
    title: "Delivered",
    copy: "Order completed",
  },
];

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value || "");
  return div.innerHTML;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB");
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("en-US")} VND`;
}

function formatPaymentMethod(method) {
  const map = {
    COD: "Cash on delivery",
    QR: "QR payment",
    BANK_TRANSFER: "Bank transfer",
    CREDIT_CARD: "Credit card",
    E_WALLET: "E-wallet",
  };
  return map[method] || method || "-";
}

function formatPaymentStatus(status) {
  const map = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
  };
  return map[status] || status || "-";
}

function showLoadingState() {
  elements.loadingState.style.display = "grid";
  elements.errorState.style.display = "none";
  elements.orderContent.style.display = "none";
}

function showErrorState(message) {
  elements.loadingState.style.display = "none";
  elements.errorState.style.display = "grid";
  elements.orderContent.style.display = "none";
  elements.errorMessage.textContent = message;
}

function showContent() {
  elements.loadingState.style.display = "none";
  elements.errorState.style.display = "none";
  elements.orderContent.style.display = "block";
}

function renderStatus() {
  const status = state.order?.orderStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  elements.orderStatus.className = `status-pill ${config.className}`;
  elements.orderStatus.textContent = config.label;
  elements.heroDescription.textContent = config.hero;
}

function renderTimeline() {
  const status = state.order?.orderStatus;
  const currentIndex = TIMELINE_STEPS.findIndex((step) => step.key === status);
  const isCancelledOrFailed = status === "CANCELLED" || status === "FAILED";

  let displaySteps = TIMELINE_STEPS;
  if (isCancelledOrFailed && status === "CANCELLED") {
    displaySteps = [
      {
        key: "PENDING",
        icon: "fa-receipt",
        title: "Pending",
        copy: "Order created",
      },
      {
        key: "CANCELLED",
        icon: "fa-ban",
        title: "Cancelled",
        copy: "Order was cancelled",
      },
    ];
  } else if (isCancelledOrFailed && status === "FAILED") {
    displaySteps = [
      {
        key: "PENDING",
        icon: "fa-receipt",
        title: "Pending",
        copy: "Order created",
      },
      {
        key: "FAILED",
        icon: "fa-triangle-exclamation",
        title: "Failed",
        copy: "Fulfillment failed",
      },
    ];
  }

  elements.orderTimeline.innerHTML = displaySteps
    .map((step, index) => {
      const classNames = ["timeline-step"];
      const stepKey = step.key;
      const isCompleted =
        !isCancelledOrFailed && currentIndex !== -1 && index < currentIndex;
      const isActive = stepKey === status;

      if (isCompleted) classNames.push("completed");
      if (isActive) classNames.push("active");
      if (stepKey === "CANCELLED") classNames.push("cancelled");
      if (stepKey === "FAILED") classNames.push("failed");

      return `
      <div class="${classNames.join(" ")}">
        <div class="timeline-step-icon">
          <i class="fas ${step.icon}"></i>
        </div>
        <div class="timeline-step-content">
          <strong class="timeline-step-title">${escapeHtml(step.title)}</strong>
          <span class="timeline-step-copy">${escapeHtml(step.copy)}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderMeta() {
  const order = state.order;
  const metaItems = [
    { label: "Order code", value: `#${order.orderCode || order.id || "-"}` },
    { label: "Placed at", value: formatDateTime(order.orderDate) },
    {
      label: "Payment method",
      value: formatPaymentMethod(order.paymentMethod),
    },
    {
      label: "Payment status",
      value: formatPaymentStatus(order.paymentStatus),
    },
  ];

  elements.orderMeta.innerHTML = metaItems
    .map(
      (item) => `
        <div class="meta-card">
          <span class="meta-label">${escapeHtml(item.label)}</span>
          <strong class="meta-value">${escapeHtml(item.value)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderItems() {
  const items = state.order?.items || [];
  if (!items.length) {
    elements.orderItems.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--detail-muted);">
        <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>No items found</p>
      </div>
    `;
    return;
  }

  elements.orderItems.innerHTML = items
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

      // Lấy URL ảnh từ nhiều nguồn khác nhau
      const productImage = item.image || null;

      // Tạo HTML cho thumbnail với fallback
      let thumbnailHtml = "";
      if (productImage) {
        thumbnailHtml = `
          <img 
            src="${escapeHtml(productImage)}" 
            alt="${escapeHtml(item.productName || "Product")}"
            loading="lazy"
            onerror="this.onerror=null; this.parentElement.classList.add('img-error'); this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-mobile-alt\'></i>'"
          >
        `;
      } else {
        thumbnailHtml = '<i class="fas fa-mobile-alt"></i>';
      }

      return `
        <div class="order-item">
          <div class="item-thumb">
            ${thumbnailHtml}
          </div>
          <div class="item-info">
            <h3 class="item-name">${escapeHtml(item.productName || "Product")}</h3>
            <div class="item-meta">
              <span><i class="fas fa-tag"></i> ${escapeHtml(item.variantName || "Standard")}</span>
              <span><i class="fas fa-dollar-sign"></i> ${escapeHtml(formatCurrency(item.price))}</span>
              <span><i class="fas fa-times"></i> ${escapeHtml(item.quantity)}</span>
            </div>
          </div>
          <div class="item-total">
            <span class="item-meta-label">Total</span>
            <strong>${escapeHtml(formatCurrency(lineTotal))}</strong>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderSummary() {
  const items = state.order?.items || [];
  const subtotal = Number(state.order?.amount) || 0;
  const shippingFee = 0;
  const discount = Number(state.order?.discountAmount || 0);
  const total = Number(
    state.order?.totalAmount || subtotal + shippingFee - discount,
  );

  elements.subtotal.textContent = formatCurrency(subtotal);
  elements.shippingFee.textContent = formatCurrency(shippingFee);
  elements.totalAmount.textContent = formatCurrency(total);

  if (discount > 0) {
    elements.discountRow.style.display = "flex";
    elements.discount.textContent = `-${formatCurrency(discount)}`;
  } else {
    elements.discountRow.style.display = "none";
  }
}

function renderShipping() {
  const user = authAPI.getUser() || {};
  elements.customerName.textContent = user.fullName || user.email || "Customer";
  elements.customerPhone.textContent =
    state.order?.phoneNumber || user.phone || "-";
  elements.customerAddress.textContent =
    state.order?.shippingAddress || user.address || "-";
}

function renderCancelButton() {
  const isPending = state.order?.orderStatus === "PENDING";
  if (!elements.cancelOrderButton) return;

  elements.cancelOrderButton.style.display = isPending ? "inline-flex" : "none";
  elements.cancelOrderButton.disabled = false;
  elements.cancelOrderButton.textContent = isPending
    ? "Cancel order"
    : elements.cancelOrderButton.textContent;
}

function renderOrder() {
  elements.orderCode.textContent = `#${state.order.orderCode || state.order.id || "-"}`;
  renderStatus();
  renderTimeline();
  renderMeta();
  renderItems();
  renderSummary();
  renderShipping();
  renderCancelButton();
}

async function init() {
  showLoadingState();

  try {
    const urlParams = new URLSearchParams(window.location.search);
    state.orderId = urlParams.get("id");

    if (!state.orderId) {
      throw new Error("Order ID was not found.");
    }

    state.order = await orderApi.getOrderById(state.orderId);
    if (!state.order) {
      throw new Error("Order details were not found.");
    }

    renderOrder();
    showContent();
  } catch (error) {
    console.error("Failed to load order detail:", error);
    showErrorState(error.message || "Unable to load the order details.");
  }
}

function printOrder() {
  window.print();
}

async function cancelOrder() {
  if (!state.order || state.order.orderStatus !== "PENDING") {
    return;
  }

  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this pending order?",
  );
  if (!confirmCancel) {
    return;
  }

  if (elements.cancelOrderButton) {
    elements.cancelOrderButton.disabled = true;
    elements.cancelOrderButton.textContent = "Cancelling...";
  }

  try {
    await orderApi.cancelOrder(
      state.orderId,
      "Customer cancelled pending order",
    );
    state.order.orderStatus = "CANCELLED";
    renderOrder();
    window.alert("Order has been cancelled successfully.");
  } catch (error) {
    console.error("Failed to cancel order:", error);
    window.alert(error.message || "Unable to cancel this order.");
    renderOrder();
  }
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.href = "/account";
}

document.addEventListener("DOMContentLoaded", init);

window.printOrder = printOrder;
window.cancelOrder = cancelOrder;
window.goBack = goBack;
