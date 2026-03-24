import { authAPI } from "/modules/admin/core/api/auth.api.js";
import { showToast } from "/shared/ui/toast.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value || "";

    if (!validateEmail(email)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    try {
      const data = await authAPI.login(email, password);

      if (data.user?.role !== "ADMIN") {
        authAPI.logout();
        showToast("You do not have permission to access the admin area.", "error");
        return;
      }

      showToast("Login successful.", "success");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Admin login failed:", error);
    }
  });
}
