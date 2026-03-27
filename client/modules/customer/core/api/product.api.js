import { request } from "./base.api.js";

export const productApi = {
  filterProducts(keywordOrParams = "", params = {}) {
    const isKeywordOnlyObject =
      typeof keywordOrParams === "object" &&
      keywordOrParams !== null &&
      !Array.isArray(keywordOrParams);

    const keyword = isKeywordOnlyObject ? (keywordOrParams.keyword || "") : String(keywordOrParams || "");
    const finalParams = isKeywordOnlyObject ? keywordOrParams : params;

    const query = new URLSearchParams({
      page: finalParams.page ?? 0,
      size: finalParams.size ?? 20,
    });

    if (keyword) query.append("keyword", keyword);

    if (finalParams.brandId) query.append("brandId", finalParams.brandId);
    if (finalParams.categoryId)
      query.append("categoryId", finalParams.categoryId);
    if (finalParams.minPrice != null)
      query.append("minPrice", finalParams.minPrice);
    if (finalParams.maxPrice != null)
      query.append("maxPrice", finalParams.maxPrice);
    if (finalParams.ram) query.append("ram", finalParams.ram);
    if (finalParams.storage) query.append("storage", finalParams.storage);
    if (
      finalParams.attributeFilters &&
      Object.keys(finalParams.attributeFilters).length
    ) {
      query.append(
        "attributeFilters",
        JSON.stringify(finalParams.attributeFilters),
      );
    }

    return request(`/products?${query.toString()}`);
  },

  getFilters({ categoryId, brandId } = {}) {
    const query = new URLSearchParams();

    if (categoryId) query.append("categoryId", categoryId);
    if (brandId) query.append("brandId", brandId);

    return request(`/products/filters?${query.toString()}`);
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
    // Use the main filterProducts endpoint with keyword for smart search
    return this.filterProducts({
      keyword: keyword,
      page: 0,
      size: limit
    });
  },

  getById(id) {
    return request(`/products/${id}`);
  },

  getRelated(id, limit = 5) {
    return request(`/products/${id}/related?limit=${limit}`);
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
