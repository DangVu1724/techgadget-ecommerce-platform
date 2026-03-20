import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { showToast } from "/shared/ui/toast.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("firstName")?.value?.trim();
    const lastName = document.getElementById("lastName")?.value?.trim();
    const email = document.getElementById("registerEmail")?.value?.trim();
    const password = document.getElementById("registerPassword")?.value || "";

    if (!validateEmail(email)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    try {
      await authAPI.register({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });

      showToast("Registration successful. Please log in.", "success");
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  });
}

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
      await authAPI.login(email, password);
      showToast("Login successful.", "success");

      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectUrl;
        return;
      }

      window.location.href = "/home";
    } catch (error) {
      console.error("Customer login failed:", error);
    }
  });
}
