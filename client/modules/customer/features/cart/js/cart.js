/**
 * Cập nhật số lượng và tính toán lại tiền
 */
window.updateCartQty = function(btn, change) {
    const cartItem = btn.closest('.cart-item');
    const input = cartItem.querySelector('.qty-input');
    const unitPrice = parseFloat(cartItem.querySelector('.unit-price').getAttribute('data-price'));
    const subtotalCell = cartItem.querySelector('.subtotal-cell');

    let currentQty = parseInt(input.value) || 1;
    let newQty = currentQty + change;

    if (newQty >= 1) {
        input.value = newQty;
        
        // Cập nhật Subtotal của từng dòng
        const newSubtotal = newQty * unitPrice;
        subtotalCell.innerText = `$${newSubtotal.toFixed(2)}`;
        
        // Cập nhật tổng tiền cuối cùng của cả giỏ hàng
        calculateFinalTotal();
    }
};

/**
 * Tính tổng tiền toàn bộ giỏ hàng
 */
function calculateFinalTotal() {
    let finalTotal = 0;
    const items = document.querySelectorAll('.cart-item');
    
    items.forEach(item => {
        const subtotal = parseFloat(item.querySelector('.subtotal-cell').innerText.replace('$', ''));
        finalTotal += subtotal;
    });

    const totalString = `$${finalTotal.toFixed(2)}`;
    
    // Cập nhật vào khu vực hiển thị tổng tiền
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.innerText = totalString;
    if (totalEl) totalEl.innerText = totalString;
}

/**
 * Xác nhận và xóa sản phẩm
 */
window.confirmRemove = function(btn) {
    const cartItem = btn.closest('.cart-item');
    const productName = cartItem.querySelector('h4').innerText;

    // Sử dụng bảng hỏi mặc định của trình duyệt
    if (confirm(`Bạn có muốn xóa sản phẩm "${productName}" khỏi giỏ hàng không?`)) {
        cartItem.style.opacity = '0';
        cartItem.style.transform = 'translateX(20px)';
        cartItem.style.transition = '0.3s';
        
        setTimeout(() => {
            cartItem.remove();
            calculateFinalTotal();
        }, 300);
    }
};