const BASE_URL = "https://techgadget-ecommerce-platform.onrender.com/api";

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
  }
};