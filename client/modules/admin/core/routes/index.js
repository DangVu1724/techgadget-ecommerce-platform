export const routes = {
  auth: {
    login: '../features/auth/login/login.html',
    logout: '../features/auth/logout.html'
  },
  dashboard: '../features/dashboard/dashboard.html',
  categories: '../features/category/category.html',
  brands: '../features/brands/brands.html',
  attributes: '../features/attributes/attributes.html',
  products: '../features/products/products.html',
  discounts: '../features/discounts/discounts.html',
  orders: '../features/order/orders.html',
  users: '../features/users/users.html'
};

export function navigateTo(path) {
  window.location.href = path;
}

export function getCurrentPath() {
  return window.location.pathname;
}

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}
