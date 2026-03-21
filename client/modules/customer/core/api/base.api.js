const BASE_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

export const request = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = "Something went wrong";
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
};
