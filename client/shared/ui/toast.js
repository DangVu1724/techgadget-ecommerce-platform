const TOAST_CONTAINER_ID = "global-toast-container";
const TOAST_STYLE_ID = "global-toast-styles";

function ensureToastStyles() {
  if (document.getElementById(TOAST_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = TOAST_STYLE_ID;
  style.textContent = `
    #${TOAST_CONTAINER_ID} {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 12000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }

    .app-toast {
      pointer-events: auto;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: start;
      padding: 14px 16px;
      border-radius: 14px;
      color: #14213d;
      background: #ffffff;
      border: 1px solid rgba(20, 33, 61, 0.08);
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
      transform: translateY(-8px);
      opacity: 0;
      transition: transform 0.2s ease, opacity 0.2s ease;
      overflow: hidden;
    }

    .app-toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    .app-toast::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      border-radius: 14px 0 0 14px;
      background: var(--toast-accent, #2563eb);
    }

    .app-toast__icon {
      font-size: 16px;
      line-height: 1.2;
      margin-top: 2px;
    }

    .app-toast__message {
      font-size: 14px;
      line-height: 1.45;
      font-weight: 500;
    }

    .app-toast__close {
      border: none;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
    }

    .app-toast--success { --toast-accent: #16a34a; }
    .app-toast--error { --toast-accent: #dc2626; }
    .app-toast--warning { --toast-accent: #d97706; }
    .app-toast--info { --toast-accent: #2563eb; }
  `;

  document.head.appendChild(style);
}

function ensureToastContainer() {
  ensureToastStyles();

  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    document.body.appendChild(container);
  }

  return container;
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "!";
    case "warning":
      return "!";
    default:
      return "i";
  }
}

export function showToast(message, type = "info", duration = 4000) {
  if (!message) {
    return null;
  }

  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `app-toast app-toast--${type}`;
  toast.innerHTML = `
    <span class="app-toast__icon">${getToastIcon(type)}</span>
    <div class="app-toast__message">${message}</div>
    <button type="button" class="app-toast__close" aria-label="Close notification">×</button>
  `;

  const removeToast = () => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector(".app-toast__close")?.addEventListener("click", removeToast);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(removeToast, duration);
  return toast;
}

window.showToast = showToast;
