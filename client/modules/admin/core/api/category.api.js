const BASE_URL = "http://localhost:8080/api";

export const categoryApi = {
  // Lấy tất cả categories (không phân trang)
  getAll: async (params = {}) => {
    try {
      let url = `${BASE_URL}/category`;
      
      // Thêm search param nếu có
      if (params.search) {
        url += `?search=${encodeURIComponent(params.search)}`;
      }
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Trả về format chuẩn cho table component
      return {
        content: data, // API trả về array trực tiếp
        totalPages: 1, // Vì không phân trang
        totalElements: data.length
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  // Lấy category theo ID
  getById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/category/${id}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },
  
  // Tạo category mới
  create: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  
  // Cập nhật category
  update: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },
  
  // Xóa category
  delete: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/category/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};