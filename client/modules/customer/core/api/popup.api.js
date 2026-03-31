import { request } from "./base.api.js";

export const popupApi = {
  getActive() {
    return request("/public/popups/active");
  },
};
