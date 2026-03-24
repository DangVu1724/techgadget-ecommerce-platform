import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { categoryApi } from "/modules/admin/core/api/category.api.js";
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
  window.categoryTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Category",
    pageSize: 10,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Category Name" },
      { key: "description", label: "Description" },
      { key: "createdAt", label: "Created At" },
    ],
    api: categoryApi,
    formatters: {
      createdAt: (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-"),
      description: (value) => (!value ? "-" : value.length > 50 ? `${value.substring(0, 50)}...` : value),
    },
    actions: {
      add: () => openCategoryModal(),
      edit: (category) => openCategoryModal(category),
      delete: (category) => deleteCategory(category),
      view: (category) => viewCategory(category),
    },
  });
}

function openCategoryModal(category = null) {
  const modal = new Modal({
    title: category ? "Edit Category" : "Add Category",
    size: "md",
    data: category || {},
    fields: [
      {
        name: "name",
        label: "Category Name",
        type: "text",
        required: true,
        placeholder: "Enter category name",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter category description",
        rows: 4,
      },
    ],
    onSave: async (formData) => {
      try {
        if (category) {
          await categoryApi.update(category.id, formData);
          showToast("Category updated successfully.", "success");
        } else {
          await categoryApi.create(formData);
          showToast("Category created successfully.", "success");
        }

        modal.close();
        window.categoryTable.refresh();
      } catch (error) {
        console.error("Save error:", error);
      }
    },
  });

  modal.open();
}

async function deleteCategory(category) {
  const confirmed = await confirmModal(
    `Delete "${category.name}"? This action cannot be undone.`,
    {
      title: "Delete category",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await categoryApi.delete(category.id);
    showToast("Category deleted successfully.", "success");
    window.categoryTable.refresh();
  } catch (error) {
    console.error("Delete error:", error);
  }
}

function viewCategory(category) {
  alertModal(
    `ID: ${category.id}\nName: ${category.name}\nDescription: ${category.description || "No description"}`,
    { title: "Category details" },
  );
}
