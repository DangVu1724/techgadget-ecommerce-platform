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
};
