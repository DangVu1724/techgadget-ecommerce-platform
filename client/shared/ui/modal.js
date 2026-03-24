const MODAL_ROOT_ID = "global-modal-root";
const MODAL_STYLE_ID = "global-modal-styles";

function ensureModalStyles() {
  if (document.getElementById(MODAL_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = MODAL_STYLE_ID;
  style.textContent = `
    #${MODAL_ROOT_ID} {
      position: fixed;
      inset: 0;
      z-index: 13000;
      pointer-events: none;
    }

    .app-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      pointer-events: auto;
    }

    .app-modal {
      width: min(460px, 100%);
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
      padding: 24px;
      color: #0f172a;
      animation: app-modal-enter 0.18s ease;
    }

    .app-modal__title {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 10px;
    }

    .app-modal__message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px;
      white-space: pre-line;
    }

    .app-modal__actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .app-modal__btn {
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .app-modal__btn--secondary {
      background: #e2e8f0;
      color: #0f172a;
    }

    .app-modal__btn--primary {
      background: #2563eb;
      color: #fff;
    }

    .app-modal__btn--danger {
      background: #dc2626;
      color: #fff;
    }

    @keyframes app-modal-enter {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureModalRoot() {
  ensureModalStyles();

  let root = document.getElementById(MODAL_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = MODAL_ROOT_ID;
    document.body.appendChild(root);
  }

  return root;
}

function openModal({
  title = "Notice",
  message = "",
  confirmText = "OK",
  cancelText = "",
  variant = "primary",
  dismissible = true,
}) {
  const root = ensureModalRoot();

  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "app-modal-backdrop";
    backdrop.innerHTML = `
      <div class="app-modal" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
        <h3 class="app-modal__title" id="app-modal-title">${title}</h3>
        <p class="app-modal__message">${message}</p>
        <div class="app-modal__actions">
          ${cancelText ? `<button type="button" class="app-modal__btn app-modal__btn--secondary" data-action="cancel">${cancelText}</button>` : ""}
          <button type="button" class="app-modal__btn app-modal__btn--${variant}" data-action="confirm">${confirmText}</button>
        </div>
      </div>
    `;

    const close = (result) => {
      backdrop.remove();
      resolve(result);
    };

    backdrop.addEventListener("click", (event) => {
      if (dismissible && event.target === backdrop) {
        close(false);
      }
    });

    backdrop.querySelector('[data-action="confirm"]')?.addEventListener("click", () => close(true));
    backdrop.querySelector('[data-action="cancel"]')?.addEventListener("click", () => close(false));

    const onKeyDown = (event) => {
      if (dismissible && event.key === "Escape") {
        document.removeEventListener("keydown", onKeyDown);
        close(false);
      }
    };

    document.addEventListener("keydown", onKeyDown, { once: true });
    root.appendChild(backdrop);
  });
}

export function confirmModal(message, options = {}) {
  return openModal({
    title: options.title || "Please confirm",
    message,
    confirmText: options.confirmText || "Confirm",
    cancelText: options.cancelText || "Cancel",
    variant: options.variant || "danger",
  });
}

export function alertModal(message, options = {}) {
  return openModal({
    title: options.title || "Notice",
    message,
    confirmText: options.confirmText || "OK",
    variant: options.variant || "primary",
    dismissible: options.dismissible ?? true,
  });
}

export async function showLoginRequiredModal(onConfirm) {
  const confirmed = await confirmModal(
    "Please log in to continue this action.",
    {
      title: "Login required",
      confirmText: "Go to login",
      cancelText: "Cancel",
      variant: "primary",
    },
  );

  if (confirmed) {
    onConfirm?.();
  }

  return confirmed;
}

window.showAlertModal = alertModal;
window.showConfirmModal = confirmModal;
