const BASE_URL = "http://localhost:8080/api";

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

  // Lấy product theo ID
  getById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Tạo product mới
  create: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Cập nhật product
  update: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Xóa product
  delete: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  getTopSelling: async (limit = 5) => {
    try {
      const res = await fetch(
        `${BASE_URL}/products/top-selling?limit=${limit}`,
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      throw error;
    }
  },

  // Lấy sản phẩm mới nhất
  getNewest: async (limit = 5) => {
    try {
      const res = await fetch(`${BASE_URL}/products/newest?limit=${limit}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching newest products:", error);
      throw error;
    }
  },
};
