import { authAPI } from "/modules/customer/core/api/auth.api.js";

// ===== VALIDATION =====
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

// ===== REGISTER =====
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    if (!validateEmail(email)) return alert("Email không hợp lệ");
    if (!validatePassword(password)) return alert("Mật khẩu >= 6 ký tự");

    try {
      await authAPI.register({
        fullName: `${firstName} ${lastName}`,
        email,
        password,
      });
      window.location.href = "/login";
    } catch (err) {
      alert(err.message);
    }
  });
}

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

      // 🔐 lưu token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirectByRole = (user) => {
        switch (user?.role) {
          case "ADMIN":
            return "/admin";
          default:
            return "/home";
        }
      };
      window.location.href = redirectByRole(data.user);
    } catch (err) {
      alert(err.message);
    }
  });
}

