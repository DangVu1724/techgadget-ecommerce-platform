import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { brandApi } from "../../core/api/brand.api.js";
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
  window.brandTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Brand",
    pageSize: 10,
    columns: [
      { key: "brandId", label: "ID" },
      { key: "brandName", label: "Brand Name" },
      { key: "createdAt", label: "Created At" },
    ],
    api: brandApi,
    formatters: {
      createdAt: (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-"),
    },
    actions: {
      add: () => openBrandModal(),
      edit: (brand) => openBrandModal(brand),
      delete: (brand) => deleteBrand(brand),
      view: (brand) => viewBrand(brand),
    },
  });
}

function openBrandModal(brand = null) {
  const modal = new Modal({
    title: brand ? "Edit Brand" : "Add Brand",
    size: "sm",
    data: brand || {},
    fields: [
      {
        name: "brandName",
        label: "Brand Name",
        type: "text",
        required: true,
        placeholder: "Enter brand name",
      },
    ],
    onSave: async (formData) => {
      try {
        if (brand) {
          await brandApi.update(brand.brandId, formData);
          showToast("Brand updated successfully.", "success");
        } else {
          await brandApi.create(formData);
          showToast("Brand created successfully.", "success");
        }

        modal.close();
        window.brandTable.refresh();
      } catch (error) {
        console.error("Save error:", error);
      }
    },
  });

  modal.open();
}

async function deleteBrand(brand) {
  const confirmed = await confirmModal(
    `Delete "${brand.brandName}"? This action cannot be undone.`,
    {
      title: "Delete brand",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await brandApi.delete(brand.brandId);
    showToast("Brand deleted successfully.", "success");
    window.brandTable.refresh();
  } catch (error) {
    console.error("Delete error:", error);
  }
}

function viewBrand(brand) {
  alertModal(
    `ID: ${brand.brandId}\nName: ${brand.brandName}\nCreated: ${brand.createdAt ? new Date(brand.createdAt).toLocaleString() : "N/A"}`,
    { title: "Brand details" },
  );
}
