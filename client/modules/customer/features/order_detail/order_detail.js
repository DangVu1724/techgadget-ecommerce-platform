import { orderApi } from "../../core/api/order.api.js";

// State management
const state = {
    order: null,
    orderId: null,
    loading: true,
    error: null
};

// DOM elements
const elements = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    orderContent: document.getElementById('orderContent'),
    orderStatus: document.getElementById('orderStatus'),
    orderCode: document.getElementById('orderCode'),
    orderDate: document.getElementById('orderDate'),
    orderTime: document.getElementById('orderTime'),
    deliveryDate: document.getElementById('deliveryDate'),
    deliveryTime: document.getElementById('deliveryTime'),
    paymentMethod: document.getElementById('paymentMethod'),
    paymentStatus: document.getElementById('paymentStatus'),
    orderItems: document.getElementById('orderItems'),
    subtotal: document.getElementById('subtotal'),
    shippingFee: document.getElementById('shippingFee'),
    discountRow: document.getElementById('discountRow'),
    discount: document.getElementById('discount'),
    totalAmount: document.getElementById('totalAmount'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    customerAddress: document.getElementById('customerAddress'),
    errorMessage: document.getElementById('errorMessage')
};

// State management functions
function showLoading() {
    state.loading = true;
    showLoadingState();
}

function showError(message) {
    state.loading = false;
    state.error = message;
    showErrorState(message);
}

function showContent() {
    state.loading = false;
    state.error = null;
    if (elements.orderContent) elements.orderContent.style.display = 'block';
    hideLoadingState();
}
// Initialize page
async function init() {
    console.log("Order detail page initializing...");
    
    // Check if all required elements exist
    const missingElements = [];
    Object.keys(elements).forEach(key => {
        if (!elements[key]) {
            missingElements.push(key);
        }
    });
    
    if (missingElements.length > 0) {
        console.error("Missing DOM elements:", missingElements);
        showError("Thiếu elements trên trang: " + missingElements.join(", "));
        return;
    }
    
    showLoading();
    
    try {
        // Get order ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        state.orderId = urlParams.get('id');
        
        console.log("Order ID from URL:", state.orderId);
        
        if (!state.orderId) {
            throw new Error('Order ID not found');
        }
        
        // Load order details
        await loadOrderDetails();
        
        // Render order details
        renderOrderDetails();
        
        // Show content
        showContent();
        
    } catch (error) {
        console.error('Init error:', error);
        showError(error.message || 'Không thể tải thông tin đơn hàng');
    }
}

// Load order details from API
async function loadOrderDetails() {
    try {
        state.loading = true;
        state.error = null;
        
        // Show loading state
        showLoadingState();
        
        // Call API to get order details
        state.order = await orderApi.getOrderById(state.orderId);
        
        if (!state.order) {
            throw new Error('Order not found');
        }
        
        state.loading = false;
        
    } catch (error) {
        state.loading = false;
        state.error = error.message;
        throw error;
    }
}

// Render order details
function renderOrderDetails() {
    if (!state.order) return;
    
    hideLoadingState();
    
    // Update order status
    updateOrderStatus(state.order.orderStatus || state.order.status);
    
    // Update order info
    elements.orderCode.textContent = `#${state.order.orderCode || state.order.id}`;
    elements.orderDate.textContent = formatDate(state.order.orderDate || state.order.createdAt);
    elements.orderTime.textContent = formatTime(state.order.orderDate || state.order.createdAt);
    
    // Update delivery info
    if (state.order.deliveryDate || state.order.estimatedDelivery) {
        elements.deliveryDate.textContent = formatDate(state.order.deliveryDate || state.order.estimatedDelivery);
        elements.deliveryTime.textContent = state.order.deliveryTime || '09:00 - 12:00';
    }
    
    // Update payment info
    updatePaymentInfo(state.order.paymentMethod, state.order.paymentStatus);
    
    // Render order items
    renderOrderItems(state.order.items || state.order.orderItems || []);
    
    // Render order summary
    renderOrderSummary(state.order);
    
    // Update shipping address
    updateShippingAddress(state.order.shippingAddress || state.order.address);
}

// Update order status display
function updateOrderStatus(status) {
    const statusConfig = {
        'PENDING': { class: 'processing', icon: 'fa-clock', text: 'Chờ xử lý' },
        'PROCESSING': { class: 'processing', icon: 'fa-cog', text: 'Đang xử lý' },
        'SHIPPING': { class: 'shipped', icon: 'fa-truck', text: 'Đang giao hàng' },
        'SHIPPED': { class: 'shipped', icon: 'fa-truck', text: 'Đã giao hàng' },
        'DELIVERED': { class: 'delivered', icon: 'fa-check-circle', text: 'Đã giao hàng' },
        'CANCELLED': { class: 'cancelled', icon: 'fa-times-circle', text: 'Đã hủy' },
        'CONFIRMED': { class: 'processing', icon: 'fa-check', text: 'Đã xác nhận' }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    
    elements.orderStatus.className = `order-status-badge ${config.class}`;
    elements.orderStatus.innerHTML = `
        <i class="fas ${config.icon}"></i>
        <span>${config.text}</span>
    `;
}

// Update payment information
function updatePaymentInfo(paymentMethod, paymentStatus) {
    const paymentMethods = {
        'COD': 'Thanh toán khi nhận hàng (COD)',
        'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
        'CREDIT_CARD': 'Thẻ tín dụng/Ghi nợ',
        'E_WALLET': 'Ví điện tử'
    };
    
    const paymentStatuses = {
        'PENDING': 'Chưa thanh toán',
        'PAID': 'Đã thanh toán',
        'FAILED': 'Thanh toán thất bại'
    };
    
    elements.paymentMethod.textContent = paymentMethods[paymentMethod] || paymentMethod;
    
    const statusText = paymentStatuses[paymentStatus] || paymentStatus;
    elements.paymentStatus.textContent = statusText;
    elements.paymentStatus.className = `payment-status ${paymentStatus.toLowerCase()}`;
}

// Render order items
function renderOrderItems(items) {
    if (!items || items.length === 0) {
        elements.orderItems.innerHTML = '<p class="no-items">Không có sản phẩm nào trong đơn hàng.</p>';
        return;
    }
    
    const itemsHtml = items.map(item => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.productImage || '/images/product-placeholder.jpg'}" 
                     alt="${item.productName}" 
                     onerror="this.src='/images/product-placeholder.jpg'">
            </div>
            <div class="item-details">
                <h3 class="item-name">
                    <a href="/modules/customer/features/product_detail/product_detail.html?id=${item.productId}">
                        ${item.productName}
                    </a>
                </h3>
                ${item.variant ? `<p class="item-variant">${item.variant}</p>` : ''}
                <p class="item-price">${formatCurrency(item.price)}</p>
                <p class="item-quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="item-total">
                <p class="item-total-price">${formatCurrency(item.price * item.quantity)}</p>
                <p class="item-total-label">Thành tiền</p>
            </div>
        </div>
    `).join('');
    
    elements.orderItems.innerHTML = itemsHtml;
}

// Render order summary
function renderOrderSummary(order) {
    const subtotal = order.subtotal || order.amount || calculateSubtotal(order.items || order.orderItems);
    const shippingFee = order.shippingFee || order.shippingCost || 0;
    const discount = order.discount || 0;
    const total = order.totalAmount || order.amount || (subtotal + shippingFee - discount);
    
    elements.subtotal.textContent = formatCurrency(subtotal);
    elements.shippingFee.textContent = formatCurrency(shippingFee);
    
    if (discount > 0) {
        elements.discountRow.style.display = 'flex';
        elements.discount.textContent = `-${formatCurrency(discount)}`;
    } else {
        elements.discountRow.style.display = 'none';
    }
    
    elements.totalAmount.textContent = formatCurrency(total);
}

// Update shipping address
function updateShippingAddress(address) {
    if (!address) {
        // Fallback to order address fields if no shipping address object
        if (state.order) {
            elements.customerName.textContent = state.order.customerName || state.order.recipientName || 'N/A';
            elements.customerPhone.textContent = state.order.customerPhone || state.order.phoneNumber || 'N/A';
            const addressText = [
                state.order.address,
                state.order.ward,
                state.order.district,
                state.order.province || state.order.city
            ].filter(Boolean).join(', ');
            elements.customerAddress.textContent = addressText || 'N/A';
        }
        return;
    }
    
    elements.customerName.textContent = address.recipientName || address.customerName || 'N/A';
    elements.customerPhone.textContent = address.phoneNumber || address.customerPhone || 'N/A';
    elements.customerAddress.textContent = formatAddress(address);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

function formatAddress(address) {
    if (!address) return 'N/A';
    
    const parts = [
        address.streetAddress,
        address.ward,
        address.district,
        address.province
    ].filter(Boolean);
    
    return parts.join(', ');
}

function calculateSubtotal(items) {
    if (!items) return 0;
    
    return items.reduce((total, item) => {
        return total + ((item.price || item.unitPrice) * (item.quantity || item.qty));
    }, 0);
}

// UI state functions
function showLoadingState() {
    if (elements.loadingState) elements.loadingState.style.display = 'block';
    if (elements.errorState) elements.errorState.style.display = 'none';
    if (elements.orderContent) elements.orderContent.style.display = 'none';
}

function hideLoadingState() {
    if (elements.loadingState) elements.loadingState.style.display = 'none';
    if (elements.errorState) elements.errorState.style.display = 'none';
}

function showErrorState(message) {
    if (elements.loadingState) elements.loadingState.style.display = 'none';
    if (elements.errorState) {
        elements.errorState.style.display = 'block';
        if (elements.errorMessage) elements.errorMessage.textContent = message;
    }
    if (elements.orderContent) elements.orderContent.style.display = 'none';
}

// Action functions
function trackOrder() {
    // Navigate to order tracking page
    window.location.href = `/modules/customer/features/order_tracking/order_tracking.html?id=${state.orderId}`;
}

function printOrder() {
    // Print current page
    window.print();
}

function contactSupport() {
    // Navigate to contact page or open chat
    window.location.href = '/modules/customer/features/contact/contact.html';
}

function editAddress() {
    // Navigate to address edit page
    window.location.href = `/modules/customer/features/address/edit_address.html?orderId=${state.orderId}`;
}

function goBack() {
    // Go back to previous page or account page
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/modules/customer/features/account/account.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for global access
window.trackOrder = trackOrder;
window.printOrder = printOrder;
window.contactSupport = contactSupport;
window.editAddress = editAddress;
window.goBack = goBack;
