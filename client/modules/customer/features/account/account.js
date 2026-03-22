
import { authAPI } from "/modules/customer/core/api/auth.api.js";

/**
 * Check login, nếu chưa đăng nhập thì redirect
 */
const checkLogin = () => {
  if (!authAPI.isLoggedIn()) {
    alert("Vui lòng đăng nhập trước!");
    window.location.href = "/login";
    return false;
  }
  return true;
};

/**
 * Render dashboard info
 */
const renderDashboard = () => {
  const user = authAPI.getUser();
  const container = document.getElementById("dashboard-info");

  if (user) {
    container.innerHTML = `
      <div class="info-item">
        <div class="info-label">Full Name</div>
        <div class="info-value">${user.fullName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${user.email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Role</div>
        <div class="info-value">${
          user.role === "admin"
            ? "Administrator"
            : user.role === "user"
              ? "Customer"
              : user.role
        }</div>
      </div>
    `;
  }
};

/**
 * Render orders list
 */
const renderOrders = () => {
  const container = document.getElementById("orders-list");

  // Thay thế bằng API call để lấy đơn hàng từ backend
  const mockOrders = [
    {
      id: "ORD-001",
      date: "2024-03-15",
      total: 2400.0,
      status: "Delivered",
    },
    {
      id: "ORD-002",
      date: "2024-03-10",
      total: 1200.0,
      status: "Processing",
    },
    {
      id: "ORD-003",
      date: "2024-03-05",
      total: 3500.0,
      status: "Shipped",
    },
  ];

  if (mockOrders.length === 0) {
    container.innerHTML =
      '<div class="empty-message">No orders found. <a href="/shop">Start shopping</a></div>';
    return;
  }

  const ordersHtml = mockOrders
    .map(
      (order) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${order.id}</div>
        <div class="order-date">Ordered on ${order.date}</div>
      </div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
      <div class="order-status">${order.status}</div>
    </div>
  `,
    )
    .join("");

  container.innerHTML = ordersHtml;
};

/**
 * Load profile form
 */
const loadProfileForm = () => {
  const user = authAPI.getUser();

  if (user) {
    document.getElementById("fullName").value = user.fullName || "";
    document.getElementById("email").value = user.email || "";
  }
};

/**
 * Initialize menu navigation
 */
const initMenuNavigation = () => {
  const menuLinks = document.querySelectorAll(".menu-link");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const section = link.getAttribute("data-section");
      if (!section) return;

      // Remove active class từ tất cả links
      menuLinks.forEach((l) => l.classList.remove("active"));

      // Add active class vào link hiện tại
      link.classList.add("active");

      // Hide tất cả sections
      document.querySelectorAll(".content-section").forEach((s) => {
        s.classList.remove("active");
      });

      // Show section được click
      const sectionEl = document.getElementById(section);
      if (sectionEl) {
        sectionEl.classList.add("active");

        // Load dữ liệu khi click vào section
        if (section === "profile") {
          loadProfileForm();
        } else if (section === "orders") {
          renderOrders();
        }
      }
    });
  });
};

/**
 * Logout handler
 */
const initLogout = () => {
  const logoutLink = document.getElementById("logout-link");

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      authAPI.logout();
      alert("Đã đăng xuất thành công!");
      window.location.href = "/home";
    }
  });
};

/**
 * Save profile handler
 */
const initSaveProfile = () => {
  const saveBtn = document.getElementById("save-profile");

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    if (!fullName) {
      alert("Vui lòng nhập tên!");
      return;
    }

    // Cập nhật user trong localStorage (tạm thời)
    const user = authAPI.getUser();
    if (user) {
      user.fullName = fullName;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Cập nhật thông tin thành công!");
      renderDashboard();
    }
  });
};

/**
 * Change password handler
 */
const initChangePassword = () => {
  const changePasswordBtn = document.getElementById("change-password");

  changePasswordBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng điền tất cả các trường!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // TODO: Gọi API để đổi mật khẩu
    alert("Đổi mật khẩu thành công!");
    document.getElementById("security-form").reset();
  });
};

/**
 * Initialize page
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check login
  if (!checkLogin()) return;

  // Render dashboard
  renderDashboard();

  // Initialize menu navigation
  initMenuNavigation();

  // Initialize logout
  initLogout();

  // Initialize save profile
  initSaveProfile();

  // Initialize change password
  initChangePassword();
});
document.addEventListener('DOMContentLoaded', function() {
    // 1. Quản lý chuyển Tab chính
    const menuItems = document.querySelectorAll('.sub-menu li, .menu-item[data-tab]');
    const tabs = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');
            if(!targetId) return;

            // Xóa active cũ
            document.querySelectorAll('.menu-item, .sub-menu li').forEach(el => el.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // Kích hoạt tab mới
            this.classList.add('active');
            if(this.closest('.menu-item')) this.closest('.menu-item').classList.add('active');
            document.getElementById(targetId).classList.add('active');
            
            // Nếu vào tab đơn mua, load mặc định "Tất cả"
            if(targetId === 'tab-donmua') renderOrders('all');
        });
    });

    // 2. Dữ liệu và Xử lý Đơn mua
    const orderListContent = document.getElementById('order-list-content');

// 1. Cấu trúc dữ liệu chi tiết hơn để đổ vào giao diện
const orders = {
    all: [
        { 
            shop: 'Sidotech Official', 
            isMall: true,
            status: 'HOÀN THÀNH', 
            price: '106.400đ', 
            name: 'Chuột máy tính có dây SIDOTECH B2 gaming silent tắt âm 6 nút bấm 8800 DPI có app laptop pc chơi game làm việc',
            variant: 'Phân loại hàng: Chuột B2 - Đen',
            quantity: 1,
            img: 'https://via.placeholder.com/80' // Bạn có thể thay bằng link ảnh thật từ hình
        },
        { 
            shop: 'Dược Phẩm Hoa Linh Miền Bắc', 
            isMall: true,
            status: 'HOÀN THÀNH', 
            price: '95.000đ', 
            name: 'Kem đánh răng dược liệu Ngọc Châu chuyên gia 170g',
            variant: 'Phân loại hàng: Tuýp 170g',
            quantity: 2,
            img: 'https://via.placeholder.com/80' // Bạn có thể thay bằng link ảnh thật từ hình
        }
    ],
    completed: [
        { 
            shop: 'Sidotech Official', 
            isMall: true,
            status: 'HOÀN THÀNH', 
            price: '106.400đ', 
            name: 'Chuột Gaming Sidotech B2',
            variant: 'Phân loại hàng: Chuột B2 - Đen',
            quantity: 1,
            img: 'https://via.placeholder.com/80'
        }
    ],
    // Các tab khác nếu chưa có dữ liệu sẽ hiện thông báo "Chưa có đơn hàng"
    pending: [],
    shipping: [],
    delivering: [],
    cancelled: [],
    refund: []
};

// 2. Hàm render đơn hàng chuẩn Shopee Dark Mode
function renderOrders(type) {
    const data = orders[type] || [];
    
    if (data.length === 0) {
        orderListContent.innerHTML = `
            <div style="text-align:center; padding:100px 0; background:#1a1a1a; margin-top:10px;">
                <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/5fafbb923393a712b96488590b8f781f.png" style="width:100px; opacity:0.5">
                <p style="color:#666; margin-top:20px;">Chưa có đơn hàng.</p>
            </div>`;
        return;
    }

    orderListContent.innerHTML = data.map(order => `
        <div class="order-card" style="background:#1a1a1a; margin-top:12px; border-radius:3px; border: 1px solid #333;">
            <div class="order-header" style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #262626; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${order.isMall ? '<span style="background:#d0011b; color:#fff; padding:1px 3px; border-radius:2px; font-size:10px; font-weight:bold;">Mall</span>' : ''}
                    <strong style="color:#fff; font-size:14px;">${order.shop}</strong>
                    <button style="background:#ee4d2d; color:#fff; border:none; padding:3px 8px; border-radius:2px; font-size:12px; cursor:pointer;"><i class="fas fa-comment-alt"></i> Chat</button>
                    <button style="background:transparent; color:#ccc; border:1px solid #444; padding:3px 8px; border-radius:2px; font-size:12px; cursor:pointer;"><i class="fas fa-store"></i> Xem Shop</button>
                </div>
                <div style="color:#ee4d2d; font-size:14px; text-transform:uppercase;">
                    <i class="fas fa-truck" style="color:#00bfa5; margin-right:5px; font-size:12px;"></i>
                    <span style="color:#00bfa5; text-transform:none; font-size:12px; margin-right:10px; border-right:1px solid #444; padding-right:10px;">Giao hàng thành công</span>
                    ${order.status}
                </div>
            </div>

            <div class="order-body" style="display:flex; padding:20px; gap:12px; cursor:pointer;">
                <img src="${order.img}" style="width:80px; height:80px; border:1px solid #333; object-fit:cover;">
                <div style="flex:1">
                    <h4 style="color:#efefef; font-weight:400; font-size:16px; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${order.name}</h4>
                    <p style="color:#888; font-size:14px; margin-bottom:5px;">${order.variant}</p>
                    <p style="color:#fff; font-size:14px;">x${order.quantity}</p>
                </div>
                <div style="text-align:right;">
                    <span style="color:#888; text-decoration:line-through; font-size:14px; margin-right:8px;">199.000đ</span>
                    <span style="color:#ee4d2d; font-size:16px;">${order.price}</span>
                </div>
            </div>

            <div class="order-footer" style="background:#1e1e1e; padding:20px; border-top:1px dashed #333;">
                <div style="text-align:right; margin-bottom:15px;">
                    <span style="color:#fff; font-size:14px;">
                        <i class="fas fa-shield-alt" style="color:#ee4d2d; margin-right:5px;"></i>
                        Thành tiền: 
                    </span>
                    <span style="font-size:24px; color:#ee4d2d; margin-left:10px;">${order.price}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="color:#888; font-size:12px;">Đánh giá sản phẩm trước 10-04-2026. Đánh giá ngay để nhận 200 Xu.</div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-primary" style="background:#ee4d2d; color:#fff; border:none; padding:10px 30px; border-radius:2px; font-weight:500;">Mua Lại</button>
                        <button style="background:transparent; color:#ccc; border:1px solid #444; padding:10px 20px; border-radius:2px;">Liên Hệ Người Bán</button>
                        <button style="background:transparent; color:#ccc; border:1px solid #444; padding:10px 20px; border-radius:2px;">Thiết Lập Khác</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Sự kiện chuyển Tab
document.querySelectorAll('.ot-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.ot-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        renderOrders(this.dataset.order);
    });
});

// Load mặc định tab "Tất cả"
renderOrders('all');
});