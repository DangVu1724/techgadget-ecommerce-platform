import { navigate } from "../router.js";
import ADMIN_ROUTES from "../../../core/routes/admin/admin.routes.js";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem("adminLoggedIn", "true");

    navigate(ADMIN_ROUTES.DASHBOARD);
  } else {
    document.getElementById("error").innerText = "Sai tài khoản hoặc mật khẩu";
  }
});
