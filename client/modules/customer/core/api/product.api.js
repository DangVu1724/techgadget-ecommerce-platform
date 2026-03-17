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
    if (params.minPrice !== null && params.minPrice !== undefined)
      query.append("minPrice", params.minPrice);
    if (params.maxPrice !== null && params.maxPrice !== undefined)
      query.append("maxPrice", params.maxPrice);
    if (params.ram) query.append("ram", params.ram);
    if (params.storage) query.append("storage", params.storage);

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

  // Lấy chi tiết sản phẩm theo ID
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

  getByCategory: async (categoryId, params = {}) => {
    try {
      const page = params.page || 0;
      const size = params.size || 20;
      const sortBy = params.sortBy || "id";
      const sortDirection = params.sortDirection || "asc";

      const url = `${BASE_URL}/products/category/${categoryId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      return data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  getByBrand: async (brandId, params = {}) => {
  try {
    const page = params.page || 0;
    const size = params.size || 20;
    const sortBy = params.sortBy || "id";
    const sortDirection = params.sortDirection || "asc";

    const url = `${BASE_URL}/products/brand/${brandId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
},
};
