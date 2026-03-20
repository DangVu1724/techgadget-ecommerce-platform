import { showLoginRequiredModal } from "/shared/ui/modal.js";

export const showLoginModal = (onLoginClick = null) =>
  showLoginRequiredModal(onLoginClick || (() => {
    window.location.href = "/login";
  }));
