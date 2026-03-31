import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { couponApi } from "/modules/admin/core/api/coupon.api.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";
import { alertModal, confirmModal } from "/shared/ui/modal.js";
import { showToast } from "/shared/ui/toast.js";

new Sidebar();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    checkAdmin();
    initTable();
  } catch (error) {
    console.error("Auth check failed:", error);
  }
});

function initTable() {
  window.couponTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Voucher",
    pageSize: 10,
    columns: [
      { key: "id", label: "ID" },
      { key: "code", label: "Code" },
      { key: "type", label: "Type" },
      { key: "value", label: "Value" },
      { key: "minOrderAmount", label: "Min Order" },
      { key: "maxDiscountAmount", label: "Max Discount" },
      { key: "startAt", label: "Start At" },
      { key: "endAt", label: "End At" },
      { key: "usageLimit", label: "Usage Limit" },
      { key: "usageLimitPerUser", label: "Số lượt/user" },
      { key: "usedCount", label: "Used" },
      { key: "isActive", label: "Active" },
    ],
    api: couponApi,
    formatters: {
      type: (value) => (value ? value : "-"),
      value: (value, item) => formatCouponValue(value, item?.type),
      minOrderAmount: (value) => formatNumber(value),
      maxDiscountAmount: (value) => formatNumber(value),
      startAt: (value) => formatDateTime(value),
      endAt: (value) => formatDateTime(value),
      usageLimit: (value) => (value ?? "-"),
      usageLimitPerUser: (value) => (value ?? "-"),
      usedCount: (value) => (value ?? "-"),
      isActive: (value) => (value === true ? "Yes" : value === false ? "No" : "-"),
    },
    actions: {
      add: () => openCouponModal(),
      edit: (coupon) => openCouponModal(coupon),
      delete: (coupon) => deleteCoupon(coupon),
      view: (coupon) => viewCoupon(coupon),
    },
  });
}

function openCouponModal(coupon = null) {
  const modal = new Modal({
    title: coupon ? "Edit Voucher" : "Add Voucher",
    size: "md",
    data: buildModalData(coupon),
    fields: [
      {
        name: "code",
        label: "Voucher Code",
        type: "text",
        required: true,
        placeholder: "Enter voucher code",
      },
      {
        name: "type",
        label: "Discount Type",
        type: "select",
        required: true,
        options: [
          { value: "PERCENT", label: "Percent (%)" },
          { value: "FIXED", label: "Fixed amount" },
        ],
        placeholder: "Select discount type",
      },
      {
        name: "value",
        label: "Discount Value",
        type: "number",
        required: true,
        placeholder: "Enter discount value",
      },
      {
        name: "minOrderAmount",
        label: "Min Order Amount",
        type: "number",
        placeholder: "Minimum order amount",
      },
      {
        name: "maxDiscountAmount",
        label: "Max Discount Amount",
        type: "number",
        placeholder: "Maximum discount amount",
      },
      {
        name: "startAt",
        label: "Start At",
        type: "datetime-local",
      },
      {
        name: "endAt",
        label: "End At",
        type: "datetime-local",
      },
      {
        name: "usageLimit",
        label: "Usage Limit",
        type: "number",
        placeholder: "Total usage limit",
      },
      {
        name: "usageLimitPerUser",
        label: "Số lượt dùng mỗi tài khoản",
        type: "number",
        placeholder: "Nhập số lượt dùng mỗi tài khoản",
      },
      {
        name: "usedCount",
        label: "Used Count",
        type: "number",
        placeholder: "Used count",
      },
      {
        name: "isActive",
        label: "Active",
        type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
        placeholder: "Select status",
      },
    ],
    onSave: async (formData) => {
      try {
        const payload = normalizeCouponPayload(formData);

        if (coupon) {
          await couponApi.update(coupon.id, payload);
          showToast("Voucher updated successfully.", "success");
        } else {
          await couponApi.create(payload);
          showToast("Voucher created successfully.", "success");
        }

        modal.close();
        window.couponTable.refresh();
      } catch (error) {
        console.error("Save error:", error);
      }
    },
  });

  modal.open();
}

async function deleteCoupon(coupon) {
  const confirmed = await confirmModal(
    `Delete "${coupon.code}"? This action cannot be undone.`,
    {
      title: "Delete voucher",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await couponApi.delete(coupon.id);
    showToast("Voucher deleted successfully.", "success");
    window.couponTable.refresh();
  } catch (error) {
    console.error("Delete error:", error);
  }
}

function viewCoupon(coupon) {
  const details = [
    `ID: ${coupon.id}`,
    `Code: ${coupon.code}`,
    `Type: ${coupon.type || "-"}`,
    `Value: ${formatCouponValue(coupon.value, coupon.type)}`,
    `Min Order: ${formatNumber(coupon.minOrderAmount)}`,
    `Max Discount: ${formatNumber(coupon.maxDiscountAmount)}`,
    `Start At: ${formatDateTime(coupon.startAt)}`,
    `End At: ${formatDateTime(coupon.endAt)}`,
    `Usage Limit: ${coupon.usageLimit ?? "-"}`,
    `Per User Limit: ${coupon.usageLimitPerUser ?? "-"}`,
    `Used Count: ${coupon.usedCount ?? "-"}`,
    `Active: ${coupon.isActive === true ? "Yes" : coupon.isActive === false ? "No" : "-"}`,
  ];

  alertModal(details.join("\n"), { title: "Voucher details" });
}

function buildModalData(coupon) {
  if (!coupon) return {};
  return {
    ...coupon,
    startAt: toDateTimeInputValue(coupon.startAt),
    endAt: toDateTimeInputValue(coupon.endAt),
    isActive:
      coupon.isActive === true ? "true" : coupon.isActive === false ? "false" : "",
  };
}

function normalizeCouponPayload(formData) {
  return {
    code: formData.code?.trim(),
    type: formData.type || null,
    value: normalizeNumber(formData.value),
    minOrderAmount: normalizeNumber(formData.minOrderAmount),
    maxDiscountAmount: normalizeNumber(formData.maxDiscountAmount),
    startAt: normalizeDateTime(formData.startAt),
    endAt: normalizeDateTime(formData.endAt),
    usageLimit: normalizeInteger(formData.usageLimit),
    usageLimitPerUser: normalizeInteger(formData.usageLimitPerUser),
    usedCount: normalizeInteger(formData.usedCount),
    isActive:
      formData.isActive === ""
        ? null
        : formData.isActive === "true",
  };
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat("vi-VN").format(parsed);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function formatCouponValue(value, type) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  if (type === "PERCENT") {
    return `${numeric}%`;
  }
  return new Intl.NumberFormat("vi-VN").format(numeric);
}
