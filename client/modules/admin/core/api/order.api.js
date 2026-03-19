const BASE_URL = "http://localhost:8080/api";

export const orderApi = {
  getAll: async (params = {}) => {
    try {
      const page = params.page || 0;
      const size = params.size || 10;

      let url = `${BASE_URL}/orders?page=${page}&size=${size}`;

      // Thêm search param nếu có
      if (params.search) {
        url += `&search=${encodeURIComponent(params.search)}`;
      }

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // 🔍 lấy order theo status
  getByStatus: async (params = {}) => {
    try {
      const status = params.status || "PENDING";
      const page = params.page || 0;
      const size = params.size || 10;

      const url = `${BASE_URL}/orders/status?status=${status}&page=${page}&size=${size}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      throw error;
    }
  },

  // 🔍 lấy order theo ID
  getById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await fetch(
        `${BASE_URL}/orders/${id}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },
};
