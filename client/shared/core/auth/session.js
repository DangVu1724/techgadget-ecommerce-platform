const TOKEN_KEY = "token";
const USER_KEY = "user";

function getLoginPath() {
  return window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function saveAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new CustomEvent("login", { detail: { user } }));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("redirectAfterLogin");
  sessionStorage.removeItem("cart");
  window.dispatchEvent(new Event("logout"));
}

export function redirectToLogin() {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginPath = getLoginPath();
  const isAlreadyOnLoginPage = window.location.pathname === loginPath;

  if (loginPath === "/login" && !currentPath.includes("/login")) {
    localStorage.setItem("redirectAfterLogin", currentPath);
  }

  if (isAlreadyOnLoginPage) {
    return;
  }

  window.location.href = loginPath;
}
