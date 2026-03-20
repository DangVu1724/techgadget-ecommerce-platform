import { request } from "./base.api.js";

export const productApi = {
  filterProducts(params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    if (params.brandId) query.append("brandId", params.brandId);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.minPrice != null) query.append("minPrice", params.minPrice);
    if (params.maxPrice != null) query.append("maxPrice", params.maxPrice);
    if (params.ram) query.append("ram", params.ram);
    if (params.storage) query.append("storage", params.storage);

    return request(`/products?${query.toString()}`);
  },

  getById(id) {
    return request(`/products/${id}`);
  },

  getByCategory(categoryId, params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/products/category/${categoryId}?${query.toString()}`);
  },

  getByBrand(brandId, params = {}) {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/products/brand/${brandId}?${query.toString()}`);
  },

  getTopSelling(limit = 5) {
    return request(`/products/top-selling?limit=${limit}`);
  },

  getNewest(limit = 5) {
    return request(`/products/newest?limit=${limit}`);
  },
};
