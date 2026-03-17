const BASE_URL = "http://localhost:8080/api";

export const attributeApi = {
  // Lấy tất cả attributes (không phân trang)
  getAll: async (params = {}) => {
    try {
      let url = `${BASE_URL}/attributes`;
      
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
        totalPages: 1,
        totalElements: data.length
      };
    } catch (error) {
      console.error('Error fetching attributes:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/attributes/${id}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Error fetching brand ${id}:`, error);
      throw error;
    }
  },
  
  // Tạo brand mới
  create: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/attributes`, {
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
      console.error('Error creating brand:', error);
      throw error;
    }
  },
  
  // Cập nhật brand
  update: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/attributes/${id}`, {
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
      console.error(`Error updating brand ${id}:`, error);
      throw error;
    }
  },
  
  // Xóa brand
  delete: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/attributes/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting brand ${id}:`, error);
      throw error;
    }
  }
};