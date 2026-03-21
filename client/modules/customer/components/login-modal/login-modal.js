/**
 * Login Modal Component
 * Hiển thị popup thông báo khi user chưa đăng nhập
 */
export const showLoginModal = (onLoginClick = null) => {
  // Xóa modal cũ nếu tồn tại
  const existingModal = document.getElementById("login-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }

  // Tạo modal overlay
  const overlay = document.createElement("div");
  overlay.id = "login-modal-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // Tạo modal content
  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 40px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
    animation: slideUp 0.3s ease-out;
  `;

  modal.innerHTML = `
    <div style="margin-bottom: 20px;">
      <i class="fas fa-lock" style="font-size: 3rem; color: #007bff; margin-bottom: 15px;"></i>
    </div>
    <h2 style="margin-bottom: 15px; font-size: 1.5rem; color: #333;">Yêu cầu đăng nhập</h2>
    <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
      Vui lòng đăng nhập để tiếp tục thao tác này.
    </p>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="modal-login-btn" style="
        flex: 1;
        padding: 12px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
      ">
        Đăng nhập
      </button>
      <button id="modal-cancel-btn" style="
        flex: 1;
        padding: 12px 20px;
        background-color: #e0e0e0;
        color: #333;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
      ">
        Hủy
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Thêm animation CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    #modal-login-btn:hover {
      background-color: #0056b3 !important;
    }
    
    #modal-cancel-btn:hover {
      background-color: #d0d0d0 !important;
    }
  `;
  document.head.appendChild(style);

  // Event listeners
  const loginBtn = document.getElementById("modal-login-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");

  loginBtn.addEventListener("click", () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = "/login";
    }
  });

  cancelBtn.addEventListener("click", () => {
    overlay.remove();
  });

  // Close modal khi click overlay
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
};
