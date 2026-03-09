// helpers.js
export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("vi-VN");
  } catch {
    return "-";
  }
}

export function showLoading(show) {
  const loadingState = document.getElementById("loadingState");
  const productContent = document.getElementById("productContent");

  if (loadingState && productContent) {
    loadingState.style.display = show ? "flex" : "none";
    productContent.style.display = show ? "none" : "block";
  }
}

export function renderAttributes(attributes) {
  if (!attributes || attributes.length === 0) return "-";
  return attributes
    .map((attr) => `${attr.attributeName}: ${attr.value}`)
    .join("<br>");
}