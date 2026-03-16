const BASE_URL = "http://localhost:8080/api";

export const brandApi = {
  getAll: async () => {
    try {
      const res = await fetch(`${BASE_URL}/brands`);
      if (!res.ok) {
        throw new Error("Failed to fetch brands");
      }
      return await res.json();
    } catch (error) {
      console.error("Brand API error:", error);
      return [];
    }
  },
  getByCategory: async (categoryId) => {
    try {
      const res = await fetch(`${BASE_URL}/brands/category/${categoryId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch brands by category");
      }
      return await res.json();
    } catch (error) {
      console.error("Brand API error:", error);
      return [];
    }
  },
};
