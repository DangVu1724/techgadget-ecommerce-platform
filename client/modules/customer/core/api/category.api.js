import { request } from "./base.api.js";

export const categoryApi = {
  getAll() {
    return request("/category");
  },

  getByBrand(brandId) {
    return request(`/category/brand/${brandId}`);
  },
};
