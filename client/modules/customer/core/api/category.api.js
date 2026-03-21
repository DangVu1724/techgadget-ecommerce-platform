const BASE_URL = "http://localhost:8080/api";

export const categoryApi = {
  getAll: async () => {
    try {
      const res = await fetch(`${BASE_URL}/category`);
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      return await res.json();
    } catch (error) {
      console.error("Category API error:", error);
      return [];
    }
  },
  getByBrand: async (brandId) => {
    try {
      const res = await fetch(`${BASE_URL}/category/brand/${brandId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch categories by brand");
      }
      return await res.json();
    } catch (error) {
      console.error("Category API error:", error);
      return [];
    }
  },
};