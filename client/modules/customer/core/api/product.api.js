import { request } from "./base.api.js";

export const productApi = {
  filterProducts(keywordOrParams = "", params = {}) {
    const isKeywordOnlyObject =
      typeof keywordOrParams === "object" &&
      keywordOrParams !== null &&
      !Array.isArray(keywordOrParams);

    const keyword = isKeywordOnlyObject ? "" : String(keywordOrParams || "");
    const finalParams = isKeywordOnlyObject ? keywordOrParams : params;

    const query = new URLSearchParams({
      page: finalParams.page ?? 0,
      size: finalParams.size ?? 20,
    });

    if (keyword) query.append("name", keyword);

    if (finalParams.brandId) query.append("brandId", finalParams.brandId);
    if (finalParams.categoryId)
      query.append("categoryId", finalParams.categoryId);
    if (finalParams.minPrice != null)
      query.append("minPrice", finalParams.minPrice);
    if (finalParams.maxPrice != null)
      query.append("maxPrice", finalParams.maxPrice);
    if (finalParams.ram) query.append("ram", finalParams.ram);
    if (finalParams.storage) query.append("storage", finalParams.storage);

    return request(`/products?${query.toString()}`);
  },

  search(keyword, params = {}) {
    const query = new URLSearchParams({
      name: String(keyword || ""),
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return request(`/products/search?${query.toString()}`);
  },

  searchSuggestions(keyword, limit = 5) {
    return this.search(keyword, { page: 0, size: limit });
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
