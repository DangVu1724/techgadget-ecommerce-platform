import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { orderApi } from "/modules/admin/core/api/order.api.js";
import { showToast } from "/shared/ui/toast.js";

class OrderManager {
  constructor() {
    this.sidebar = new Sidebar();
    this.currentPage = 0;
    this.currentStatus = "all";
    this.totalPages = 0;
    this.currentOrderId = null;
    this.ordersData = [];
    this.statusFlow = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    this.init();
  }

  init() {
    this.loadOrders();
    this.bindEvents();
    this.addModalStyles();
  }

  bindEvents() {
    // Tab click events
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", (e) => this.handleTabClick(e));
    });

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => this.handleOutsideClick(e));
  }

  handleTabClick(event) {
    const tab = event.currentTarget;
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    this.currentStatus = tab.dataset.status;
    this.currentPage = 0;
    this.loadOrders(0, this.currentStatus);
  }

  handleSearch(event) {
    // Search functionality removed
    this.currentPage = 0;
    this.loadOrders(0, this.currentStatus);
  }

  handleOutsideClick(event) {
    const modal = document.getElementById("updateStatusModal");
    if (event.target === modal) {
      this.closeModal();
    }
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

  getPaymentText(status) {
    const paymentMap = {
      PAID: "Đã thanh toán",
      UNPAID: "Chưa thanh toán",
      PENDING: "Chờ thanh toán",
    };
    return paymentMap[status] || status;
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

  async loadOrders(page = 0, status = this.currentStatus) {
    try {
      this.showLoading();

      let response;
      if (status === "all") {
        response = await orderApi.getAll({ page, size: 10 });
      } else {
        response = await orderApi.getByStatus({ status, page, size: 10 });
      }

      this.ordersData = response.content || [];
      this.renderOrders(this.ordersData);
      this.updatePagination(response);
      this.updateStats(this.ordersData);
      this.hideError();
    } catch (error) {
      this.showError("Không thể tải danh sách đơn hàng");
      console.error("Error loading orders:", error);
    }
  }

  showLoading() {
    const tbody = document.getElementById("ordersTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr class="loading">
          <td colspan="9">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải dữ liệu...
          </td>
        </tr>
      `;
    }
  }

  renderOrders(orders) {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px;">
            <i class="fas fa-box-open" style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"></i>
            <p style="color: #6b7280;">Không có đơn hàng nào</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders
      .map((order) => this.renderOrderRow(order))
      .join("");
  }

  renderOrderRow(order) {
    const nextStatuses = this.getNextStatuses(order.orderStatus);
    const canUpdate = nextStatuses.length > 0;

    return `
      <tr onclick="window.orderManager.viewOrderDetail(${order.id})" style="cursor: pointer;">
        <td><strong>#${order.id}</strong></td>
        <td>${order.customerName || "Khách hàng"}</td>
        <td>${this.formatDate(order.orderDate)}</td>
        <td class="amount">${this.formatCurrency(order.amount)}</td>
        <td class="amount">${this.formatCurrency(order.discountAmount || 0)}</td>
        <td class="amount">${this.formatCurrency(order.finalAmount ?? order.amount)}</td>
        <td>
          <span class="status-badge ${this.getStatusColorClass(order.orderStatus)}">
            ${this.getStatusText(order.orderStatus)}
          </span>
        </td>
        <td>
          <span class="payment-badge payment-${(order.paymentStatus || "pending").toLowerCase()}">
            ${this.getPaymentText(order.paymentStatus)}
          </span>
        </td>
        <td onclick="event.stopPropagation()">
          ${
            canUpdate
              ? `
            <button class="action-btn update-btn" onclick="window.orderManager.openUpdateModal(${order.id}, '${order.orderStatus}')">
              <i class="fas fa-edit"></i>
              Cập nhật
            </button>
          `
              : `
            <span class="no-action">-</span>
          `
          }
        </td>
      </tr>
    `;
  }

  updateStats(orders) {
    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const shippingOrders = document.getElementById("shippingOrders");
    const deliveredOrders = document.getElementById("deliveredOrders");

    if (totalOrders) totalOrders.textContent = orders.length;
    if (pendingOrders) {
      pendingOrders.textContent = orders.filter(
        (o) => o.orderStatus === "PENDING",
      ).length;
    }
    if (shippingOrders) {
      shippingOrders.textContent = orders.filter(
        (o) => o.orderStatus === "SHIPPING",
      ).length;
    }
    if (deliveredOrders) {
      deliveredOrders.textContent = orders.filter(
        (o) => o.orderStatus === "DELIVERED",
      ).length;
    }
  }

  updatePagination(response) {
    this.totalPages = response.totalPages;
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    let html = "";

    if (this.currentPage > 0) {
      html += `<button class="page-btn" onclick="window.orderManager.goToPage(${this.currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
      </button>`;
    }

    for (let i = 0; i < this.totalPages; i++) {
      if (
        i === 0 ||
        i === this.totalPages - 1 ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        html += `<button class="page-btn ${i === this.currentPage ? "active" : ""}" 
          onclick="window.orderManager.goToPage(${i})">${i + 1}</button>`;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        html += `<button class="page-btn" disabled>...</button>`;
      }
    }

    if (this.currentPage < this.totalPages - 1) {
      html += `<button class="page-btn" onclick="window.orderManager.goToPage(${this.currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
      </button>`;
    }

    pagination.innerHTML = html;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadOrders(page);
  }

  viewOrderDetail(orderId) {
    window.location.href = `/admin/order/${orderId}`;
  }

  openUpdateModal(orderId, currentStatus) {
    if (event) event.stopPropagation();

    this.currentOrderId = orderId;

    const modal = document.getElementById("updateStatusModal");
    const select = document.getElementById("statusSelect");

    if (!modal || !select) return;

    select.innerHTML = "";

    const nextStatuses = this.getNextStatuses(currentStatus);

    if (nextStatuses.length === 0) {
      this.showError("Không thể cập nhật trạng thái cho đơn hàng này");
      return;
    }

    nextStatuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = this.getStatusText(status);

      // Thêm class cho option dựa trên status
      option.className = `status-option status-${status.toLowerCase()}`;

      select.appendChild(option);
    });

    modal.style.display = "flex";
  }

  closeModal() {
    const modal = document.getElementById("updateStatusModal");
    if (modal) {
      modal.style.display = "none";
    }
    this.currentOrderId = null;
  }

  async confirmUpdateStatus() {
    try {
      const newStatus = document.getElementById("statusSelect").value;
      await orderApi.updateStatus(this.currentOrderId, newStatus);
      this.closeModal();
      await this.loadOrders(this.currentPage, this.currentStatus);
      this.showSuccess("Cập nhật trạng thái thành công");
    } catch (error) {
      this.showError("Không thể cập nhật trạng thái");
      console.error("Error updating status:", error);
    }
  }

  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    if (errorElement && errorText) {
      errorText.textContent = message;
      errorElement.classList.add("show");

      setTimeout(() => {
        errorElement.classList.remove("show");
      }, 3000);
    }
  }

  hideError() {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.classList.remove("show");
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
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
      }

      /* Màu sắc cho từng option */
      .status-option[value="PENDING"],
      .status-option.status-pending {
        background-color: #fef3c7;
        color: #d97706;
      }

      .status-option[value="CONFIRMED"],
      .status-option.status-confirmed {
        background-color: #dbeafe;
        color: #2563eb;
      }

      .status-option[value="PROCESSING"],
      .status-option.status-processing {
        background-color: #e0f2fe;
        color: #0891b2;
      }

      .status-option[value="SHIPPING"],
      .status-option.status-shipping {
        background-color: #ede9fe;
        color: #7c3aed;
      }

      .status-option[value="DELIVERED"],
      .status-option.status-delivered {
        background-color: #dcfce7;
        color: #16a34a;
      }

      .status-option[value="CANCELLED"],
      .status-option.status-cancelled {
        background-color: #fee2e2;
        color: #dc2626;
      }

      /* Hover effect */
      .status-option:hover {
        filter: brightness(95%);
      }

      .no-action {
        color: #9ca3af;
        font-size: 14px;
      }

      .action-btn.update-btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .action-btn.update-btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
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

      .error.show {
        display: flex;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.orderManager = new OrderManager();
});

// Export for use in HTML
window.orderManager = window.orderManager || {};
