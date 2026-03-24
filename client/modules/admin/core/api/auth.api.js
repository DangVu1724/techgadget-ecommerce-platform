import { request } from "./base.api.js";
import {
  clearAuthSession,
  getUser,
  isLoggedIn,
  saveAuthSession,
} from "/shared/core/auth/session.js";

export const authAPI = {
  register(data) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(email, password) {
    const session = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveAuthSession(session);
    return session;
  },

  logout() {
    clearAuthSession();
  },

  getUser,
  isLoggedIn,
};
