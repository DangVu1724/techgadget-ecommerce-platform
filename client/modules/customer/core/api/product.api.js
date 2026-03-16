const BASE_URL = "http://localhost:8080/api";

export const productApi = {
  // Lấy products với filter
  filterProducts: async (params = {}) => {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
      sortBy: params.sortBy ?? "id",
      sortDirection: params.sortDirection ?? "asc",
    });

    if (params.brandId) query.append("brandId", params.brandId);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    return res.json();
  },

  // Lấy chi tiết sản phẩm
  getById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching product by id:", error);
      throw error;
    }
  },
};
