const BASE_URL = "https://techgadget-ecommerce-platform.onrender.com/api";

export const productApi = {
  // Lấy products có phân trang
  getAll: async (params = {}) => {
    try {
      const page = params.page || 0;
      const size = params.size || 10;

      let url = `${BASE_URL}/products?page=${page}&size=${size}`;

      // Thêm search param nếu có
      if (params.search) {
        url += `&search=${encodeURIComponent(params.search)}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // API trả về dạng { content, totalPages, totalElements }
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
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
