import { authAPI } from "/modules/admin/core/api/auth.api.js";

// ===== VALIDATION =====
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!validateEmail(email)) return alert("Email không hợp lệ");
    if (!validatePassword(password)) return alert("Mật khẩu >= 6 ký tự");

    try {
      const data = await authAPI.login(email, password);

      if (data.user?.role !== "ADMIN") {
        alert("Bạn không có quyền truy cập admin!");
        return;
      }

      // 🔐 lưu token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/admin";
    } catch (err) {
      alert(err.message);
    }
  });
}
