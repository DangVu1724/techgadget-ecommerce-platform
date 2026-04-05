import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { popupApi } from "/modules/admin/core/api/popup.api.js";
import { couponApi } from "/modules/admin/core/api/coupon.api.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";
import { confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

new Sidebar();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    checkAdmin();
    initTable();
    registerToggleHandler();
  } catch (error) {
    console.error("Auth check failed:", error);
  }
});

function initTable() {
  window.popupTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Popup",
    pageSize: 10,
    columns: [
      { key: "id", label: "ID" },
      { key: "title", label: "Title" },
      { key: "couponCode", label: "Coupon" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "isActive", label: "Active" },
    ],
    api: popupApi,
    formatters: {
      startDate: (value) => formatDateTime(value),
      endDate: (value) => formatDateTime(value),
      couponCode: (value) => value || "-",
      isActive: (value, item) =>
        renderActiveSwitch(Boolean(value), item?.id),
    },
    actions: {
      add: () => openPopupModal(),
      edit: (popup) => openPopupModal(popup),
      delete: (popup) => deletePopup(popup),
      view: (popup) => viewPopup(popup),
    },
  });
}

function registerToggleHandler() {
  document.addEventListener("change", async (event) => {
    const target = event.target;
    if (!target?.classList.contains("popup-toggle")) return;

    const popupId = Number(target.dataset.id);
    if (!popupId || !window.popupTable?.data?.length) return;

    const popup = window.popupTable.data.find((item) => item.id === popupId);
    if (!popup) return;

    try {
      const payload = buildPopupPayload(popup, { isActive: target.checked });
      await popupApi.update(popupId, payload);
      showToast("Popup status updated.", "success");
      window.popupTable.refresh();
    } catch (error) {
      console.error("Toggle popup failed:", error);
      showToast("Could not update popup status.", "error");
      target.checked = !target.checked;
    }
  });
}

async function openPopupModal(popup = null) {
  try {
    const couponOptions = await loadCouponOptions();

    const modal = new Modal({
      title: popup ? "Edit Promotion Popup" : "Add Promotion Popup",
      size: "lg",
      data: buildModalData(popup),
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Enter popup title",
        },
        {
          name: "imageFile",
          label: "Upload Banner Image",
          type: "file",
          helpText: "Upload a banner image (optional).",
        },
        {
          name: "productId",
          label: "Target Product ID",
          type: "number",
          placeholder: "Enter product ID for redirect",
        },
        {
          name: "couponId",
          label: "Coupon",
          type: "select",
          options: couponOptions,
          placeholder: "Select coupon (optional)",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter popup description",
        },
        {
          name: "startDate",
          label: "Start Date",
          type: "datetime-local",
        },
        {
          name: "endDate",
          label: "End Date",
          type: "datetime-local",
        },
        {
          name: "isActive",
          label: "Active",
          type: "select",
          required: true,
          options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ],
          placeholder: "Select status",
        },
      ],
      onSave: async (formData) => {
        try {
          const payload = normalizePopupPayload(formData);
          const uploadFile = formData.imageFile instanceof File && formData.imageFile.size > 0
            ? formData.imageFile
            : null;

          if (uploadFile) {
            const imageUrl = await popupApi.uploadImage(uploadFile);
            payload.imageUrl = imageUrl;
          }

          if (popup) {
            await popupApi.update(popup.id, payload);
            showToast("Popup updated successfully.", "success");
          } else {
            await popupApi.create(payload);
            showToast("Popup created successfully.", "success");
          }

          modal.close();
          window.popupTable.refresh();
        } catch (error) {
          console.error("Save error:", error);
        }
      },
    });

    modal.open();
  } catch (error) {
    console.error("Failed to open popup modal:", error);
  }
}

async function deletePopup(popup) {
  const confirmed = await confirmModal(
    `Delete "${popup.title}"? This action cannot be undone.`,
    {
      title: "Delete popup",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) return;

  try {
    await popupApi.delete(popup.id);
    showToast("Popup deleted successfully.", "success");
    window.popupTable.refresh();
  } catch (error) {
    console.error("Delete error:", error);
  }
}

function viewPopup(popup) {
  const details = [
    `ID: ${popup.id}`,
    `Title: ${popup.title}`,
    `Coupon: ${popup.couponCode || "-"}`,
    `Start Date: ${formatDateTime(popup.startDate)}`,
    `End Date: ${formatDateTime(popup.endDate)}`,
    `Active: ${popup.isActive ? "Yes" : "No"}`,
  ];

  showToast(details.join(" | "), "info");
}

function renderActiveSwitch(isActive, id) {
  const checked = isActive ? "checked" : "";
  return `
    <label class="popup-switch">
      <input type="checkbox" class="popup-toggle" data-id="${id}" ${checked} />
      ${isActive ? "On" : "Off"}
    </label>
  `;
}

async function loadCouponOptions() {
  const result = await couponApi.getAll();
  const coupons = result.content || [];
  const options = [{ value: "", label: "No coupon" }];
  coupons.forEach((coupon) => {
    options.push({ value: coupon.id, label: coupon.code });
  });
  return options;
}

function buildModalData(popup) {
  if (!popup) {
    return {
      isActive: "true",
    };
  }
  return {
    ...popup,
    couponId: popup.couponId ?? "",
    startDate: toDateTimeInputValue(popup.startDate),
    endDate: toDateTimeInputValue(popup.endDate),
    isActive:
      popup.isActive === true ? "true" : popup.isActive === false ? "false" : "",
  };
}

function normalizePopupPayload(formData) {
  return {
    title: formData.title?.trim(),
    imageUrl: null,
    couponId: formData.couponId ? Number(formData.couponId) : null,
    productId: formData.productId ? Number(formData.productId) : null,
    description: formData.description?.trim() || null,
    startDate: normalizeDateTime(formData.startDate),
    endDate: normalizeDateTime(formData.endDate),
    isActive:
      formData.isActive === ""
        ? null
        : formData.isActive === "true",
  };
}

function buildPopupPayload(popup, overrides = {}) {
  return {
    title: popup.title,
    imageUrl: popup.imageUrl || null,
    couponId: popup.couponId ?? null,
    productId: popup.productId ?? null,
    description: popup.description || null,
    startDate: popup.startDate || null,
    endDate: popup.endDate || null,
    isActive: popup.isActive ?? false,
    ...overrides,
  };
}

function normalizeInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeDateTime(value) {
  if (!value) return null;
  if (value.length === 16) {
    return `${value}:00`;
  }
  return value;
}

function toDateTimeInputValue(value) {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    return value.substring(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}
