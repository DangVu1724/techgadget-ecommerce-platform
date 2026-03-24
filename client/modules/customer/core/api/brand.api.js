import { request } from "./base.api.js";

export const brandApi = {
  getAll() {
    return request("/brands");
  },

  getByCategory(categoryId) {
    return request(`/brands/category/${categoryId}`);
  },
};
