import { getToken, clearAuthSession, redirectToLogin } from "/shared/core/auth/session.js";
import { showToast } from "/shared/ui/toast.js";

const BASE_URL = "https://techgadget-ecommerce-platform.onrender.com/api";

async function parseJsonSafely(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function request(url, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const payload = await parseJsonSafely(response);
  const message =
    payload?.message ||
    response.statusText ||
    "Something went wrong. Please try again.";

  if (!response.ok || payload?.success === false) {
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;

    showToast(error.message, "error");
    window.dispatchEvent(new CustomEvent("api:error", { detail: error }));

    if (response.status === 401) {
      clearAuthSession();
      redirectToLogin();
    }

    throw error;
  }

  window.dispatchEvent(
    new CustomEvent("api:success", {
      detail: {
        url,
        method: options.method || "GET",
        message: payload?.message,
        data: payload?.data,
      },
    }),
  );

  return payload?.data ?? null;
}
