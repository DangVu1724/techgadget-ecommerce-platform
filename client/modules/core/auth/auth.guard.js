import { authAPI } from "/modules/core/auth/auth.api.js";

export function requireAdmin() {
  const user = authAPI.checkAuth();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  if (user.role !== "admin" && user.role !== "manager") {
    window.location.href = "/home";
  }
}
