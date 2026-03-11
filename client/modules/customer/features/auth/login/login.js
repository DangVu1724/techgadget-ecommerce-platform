import { authAPI } from "/modules/core/auth/auth.api.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await authAPI.login(username, password);

    if (res.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/home";
    }

  } catch (err) {
    alert("Login failed");
  }
});