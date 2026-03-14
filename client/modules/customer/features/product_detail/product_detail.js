// 1. Xử lý đổi ảnh chính
document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
        document.getElementById('mainImg').src = this.src;
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// 2. Xử lý Color & Size
function setupVariationToggle(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}
setupVariationToggle('colorOptions');
setupVariationToggle('sizeOptions');

// 3. Xử lý tăng giảm số lượng mua
window.changeQty = function(amount) {
    const input = document.getElementById('quantity');
    let current = parseInt(input.value) || 1;
    if (current + amount >= 1) {
        input.value = current + amount;
    }
};

// 4. Xử lý nút Thả tim (Wishlist)
const wishlistBtn = document.querySelector('.btn-wishlist');
if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.classList.toggle('fas'); // Đổi sang tim đặc
        icon.classList.toggle('far'); // Đổi sang tim rỗng
        this.style.color = icon.classList.contains('fas') ? '#FF6F42' : 'white';
    });
}