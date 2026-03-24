import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { orderApi } from "/modules/admin/core/api/order.api.js";
import { showToast } from "/shared/ui/toast.js";

class OrderDetailManager {
  constructor() {
    this.sidebar = new Sidebar();
    this.orderDetail = null;
    this.orderId = this.getOrderIdFromPath();
    this.statusFlow = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (this.orderId) {
      this.init();
    } else {
      this.showError("Không tìm thấy mã đơn hàng");
    }
  }

  init() {
    this.loadOrderDetail();
    this.addModalStyles();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("click", (e) => this.handleOutsideClick(e));
  }

  handleOutsideClick(event) {
    const modal = document.getElementById("updateStatusModal");
    if (event.target === modal) {
      this.closeModal();
    }
  }

  getOrderIdFromPath() {
    const parts = window.location.pathname.split("/");
    const id = parts.pop();
    return id && !isNaN(id) ? id : null;
  }

  getNextStatuses(currentStatus) {
    return this.statusFlow[currentStatus] || [];
  }

  getStatusText(status) {
    const statusMap = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang chuẩn bị hàng",
      SHIPPING: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  }

  getStatusColorClass(status) {
    const colorMap = {
      PENDING: "status-pending",
      CONFIRMED: "status-confirmed",
      PROCESSING: "status-processing",
      SHIPPING: "status-shipping",
      DELIVERED: "status-delivered",
      CANCELLED: "status-cancelled",
    };
    return colorMap[status] || "";
  }

  getPaymentMethodText(method) {
    const methodMap = {
      COD: "Thanh toán khi nhận hàng",
      BANKING: "Chuyển khoản ngân hàng",
      MOMO: "Ví MoMo",
      VNPAY: "VNPay",
    };
    return methodMap[method] || method;
  }

  getPaymentStatusText(status) {
    const statusMap = {
      PAID: "Đã thanh toán",
      UNPAID: "Chưa thanh toán",
      PENDING: "Chờ thanh toán",
    };
    return statusMap[status] || status;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async loadOrderDetail() {
    try {
      this.showProductsLoading();

      this.orderDetail = await orderApi.getById(this.orderId);
      this.renderOrderDetail();
    } catch (error) {
      this.showError("Không thể tải thông tin đơn hàng");
      console.error("Error loading order detail:", error);
    }
  }

  showProductsLoading() {
    const productsList = document.getElementById("productsList");
    if (productsList) {
      productsList.innerHTML = `
        <tr>
          <td colspan="4" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải...
          </td>
        </tr>
      `;
    }
  }

  renderOrderDetail() {
    if (!this.orderDetail) return;

    this.renderBasicInfo();
    this.renderCustomerInfo();
    this.renderPaymentInfo();
    this.renderOrderNotes();
    this.renderStatusTimeline();
    this.renderProducts();
    this.updateActionButtons();
  }

  renderBasicInfo() {
    const orderIdElement = document.getElementById("orderId");
    const orderDateElement = document.getElementById("orderDate");
    const orderStatusElement = document.getElementById("orderStatus");

    if (orderIdElement) {
      orderIdElement.textContent = `Đơn hàng #${this.orderDetail.id}`;
    }

    if (orderDateElement) {
      orderDateElement.textContent = this.formatDate(
        this.orderDetail.orderDate,
      );
    }

    if (orderStatusElement) {
      orderStatusElement.textContent = this.getStatusText(
        this.orderDetail.orderStatus,
      );
      orderStatusElement.className = `order-status-large ${this.getStatusColorClass(this.orderDetail.orderStatus)}`;
    }
  }

  renderCustomerInfo() {
    const elements = {
      customerName: this.orderDetail.customerName || "Khách hàng",
      customerPhone: this.orderDetail.phoneNumber || "Chưa cập nhật",
      customerAddress: this.orderDetail.shippingAddress || "Chưa cập nhật",
      customerEmail: this.orderDetail.customerEmail || "Chưa cập nhật",
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  renderPaymentInfo() {
    const paymentMethod = document.getElementById("paymentMethod");
    const paymentStatus = document.getElementById("paymentStatus");
    const subtotalElement = document.getElementById("subtotal");
    const shippingFeeElement = document.getElementById("shippingFee");
    const totalAmountElement = document.getElementById("totalAmount");

    if (paymentMethod) {
      paymentMethod.textContent = this.getPaymentMethodText(
        this.orderDetail.paymentMethod,
      );
    }

    if (paymentStatus) {
      paymentStatus.textContent = this.getPaymentStatusText(
        this.orderDetail.paymentStatus,
      );
    }

    const subtotal = this.orderDetail.amount;
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    if (subtotalElement) {
      subtotalElement.textContent = this.formatCurrency(subtotal);
    }

    if (shippingFeeElement) {
      shippingFeeElement.textContent = this.formatCurrency(shippingFee);
    }

    if (totalAmountElement) {
      totalAmountElement.textContent = this.formatCurrency(total);
    }
  }

  renderOrderNotes() {
    const orderNotes = document.getElementById("orderNotes");
    if (orderNotes) {
      orderNotes.textContent = this.orderDetail.notes || "Không có ghi chú";
    }
  }

  renderStatusTimeline() {
    const statuses = [
      { key: "PENDING", label: "Chờ xác nhận", icon: "fa-clock" },
      { key: "CONFIRMED", label: "Đã xác nhận", icon: "fa-check-circle" },
      { key: "PROCESSING", label: "Chuẩn bị hàng", icon: "fa-box" },
      { key: "SHIPPING", label: "Đang giao", icon: "fa-truck" },
      { key: "DELIVERED", label: "Đã giao", icon: "fa-check-double" },
    ];

    const currentStatusIndex = statuses.findIndex(
      (s) => s.key === this.orderDetail.orderStatus,
    );

    const timelineHtml = statuses
      .map((status, index) => {
        let statusClass = "";
        if (index < currentStatusIndex) {
          statusClass = "completed";
        } else if (index === currentStatusIndex) {
          statusClass = "active";
        }

        return `
          <div class="status-step ${statusClass}">
            <i class="fas ${status.icon}"></i>
            <div class="step-label">${status.label}</div>
            ${
              index <= currentStatusIndex
                ? `
              <div class="step-date">${this.formatDate(this.orderDetail.orderDate)}</div>
            `
                : ""
            }
          </div>
        `;
      })
      .join("");

    const timelineElement = document.getElementById("statusTimeline");
    if (timelineElement) {
      timelineElement.innerHTML = timelineHtml;
    }
  }

  renderProducts() {
    const productsList = document.getElementById("productsList");
    if (!productsList) return;

    if (!this.orderDetail.items || this.orderDetail.items.length === 0) {
      productsList.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 20px;">
            Không có sản phẩm
          </td>
        </tr>
      `;
      return;
    }

    const productsHtml = this.orderDetail.items
      .map((item) => this.renderProductRow(item))
      .join("");

    productsList.innerHTML = productsHtml;
  }

  renderProductRow(item) {
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="product-image">
              <i class="fas fa-box"></i>
            </div>
            <div>
              <div class="product-name">${item.productName || "Sản phẩm"}</div>
              <small style="color: #6b7280;">SKU: ${item.sku || "N/A"}</small>
            </div>
          </div>
        </td>
        <td class="product-price">${this.formatCurrency(item.price)}</td>
        <td>${item.quantity}</td>
        <td class="product-price">${this.formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `;
  }

  updateActionButtons() {
    const nextStatuses = this.getNextStatuses(this.orderDetail.orderStatus);
    const updateBtn = document.querySelector(".btn-primary");
    const cancelBtn = document.querySelector(".btn-danger");

    if (updateBtn) {
      updateBtn.style.display =
        nextStatuses.length === 0 ? "none" : "inline-flex";
    }

    if (cancelBtn) {
      const cannotCancel = ["DELIVERED", "CANCELLED"].includes(
        this.orderDetail.orderStatus,
      );
      cancelBtn.style.display = cannotCancel ? "none" : "inline-flex";
    }
  }

  openUpdateStatusModal() {
    const nextStatuses = this.getNextStatuses(this.orderDetail.orderStatus);

    if (nextStatuses.length === 0) {
      this.showError("Không thể cập nhật trạng thái cho đơn hàng này");
      return;
    }

    const modal = document.getElementById("updateStatusModal");
    const select = document.getElementById("statusSelect");

    if (!modal || !select) return;

    select.innerHTML = "";

    nextStatuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = this.getStatusText(status);
      select.appendChild(option);
    });

    modal.style.display = "flex";
  }

  async confirmUpdateStatus() {
    try {
      const newStatus = document.getElementById("statusSelect").value;
      await orderApi.updateStatus(this.orderId, newStatus);
      this.closeModal();
      await this.loadOrderDetail();
      this.showSuccess("Cập nhật trạng thái thành công");
    } catch (error) {
      this.showError("Không thể cập nhật trạng thái");
      console.error("Error updating status:", error);
    }
  }

  async cancelOrder() {
    const confirmed = await window.showConfirmModal?.("Cancel this order?", {
      title: "Cancel order",
      confirmText: "Cancel order",
      cancelText: "Keep order",
      variant: "danger",
    });
    if (!confirmed) return;

    const allowedCancellation = ["PENDING", "CONFIRMED", "PROCESSING"].includes(
      this.orderDetail.orderStatus,
    );

    if (!allowedCancellation) {
      this.showError("Không thể hủy đơn hàng ở trạng thái hiện tại");
      return;
    }

    try {
      await orderApi.updateStatus(this.orderId, "CANCELLED");
      await this.loadOrderDetail();
      this.showSuccess("Đã hủy đơn hàng");
    } catch (error) {
      this.showError("Không thể hủy đơn hàng");
      console.error("Error cancelling order:", error);
    }
  }

  printOrder() {
    window.print();
  }

  closeModal() {
    const modal = document.getElementById("updateStatusModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.style.display = "flex";

      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 3000);
    }
  }

  showSuccess(message) {
    showToast(message, "success");
  }

  addModalStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .status-processing {
        background: #e0f2fe;
        color: #0891b2;
      }

      .error {
        background: #fee2e2;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: none;
        align-items: center;
        gap: 8px;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
      }

      .modal-content h3 {
        margin-bottom: 16px;
        color: #111827;
      }

      .modal-content select {
        width: 100%;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .btn-cancel {
        padding: 10px 20px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
      }

      .btn-confirm {
        padding: 10px 20px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      .btn-confirm:hover {
        background: #1d4ed8;
      }

      .btn-cancel:hover {
        background: #f3f4f6;
      }

      @media print {
        .back-btn, .action-buttons, .modal, .error {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.orderDetailManager = new OrderDetailManager();
});

// Export for use in HTML
window.orderDetailManager = window.orderDetailManager || {};
