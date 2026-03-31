import { request } from "./base.api.js";
import { normalizeCollection } from "/shared/core/api/collection.js";

export const popupApi = {
  async getAll() {
    const response = await request("/admin/popups");
    return normalizeCollection(response);
  },

  getById(id) {
    return request(`/admin/popups/${id}`);
  },

  create(data) {
    return request("/admin/popups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/admin/popups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/admin/popups/${id}`, {
      method: "DELETE",
    });
  },

  uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return request("/admin/popups/upload", {
      method: "POST",
      body: formData,
    });
  },
};
