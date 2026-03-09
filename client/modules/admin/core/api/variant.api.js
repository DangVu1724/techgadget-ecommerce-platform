const BASE_URL = "http://localhost:8080/api";

export const variantApi = {

  createVariant: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error creating variant:', error);
      throw error;
    }
  },
  
  // Cập nhật variant
  updateVariant: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/variants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Error updating variant ${id}:`, error);
      throw error;
    }
  },
  
  // Xóa variant
  deleteVariant: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/variants/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP error! status: ${res.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting variant ${id}:`, error);
      throw error;
    }
  }
};