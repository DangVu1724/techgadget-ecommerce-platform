const BASE_URL = "https://techgadget-ecommerce-platform.onrender.com/api";

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
};
