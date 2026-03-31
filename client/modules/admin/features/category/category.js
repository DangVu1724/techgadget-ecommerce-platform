import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { attributeApi } from "/modules/admin/core/api/attribute.api.js";
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
      { key: "attributes", label: "Linked Attributes" },
      { key: "createdAt", label: "Created At" },
    ],
    api: categoryApi,
    formatters: {
      createdAt: (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-"),
      description: (value) => (!value ? "-" : value.length > 50 ? `${value.substring(0, 50)}...` : value),
      attributes: (value) => formatAttributeSummary(value),
    },
    actions: {
      add: () => openCategoryModal(),
      edit: (category) => openCategoryModal(category),
      delete: (category) => deleteCategory(category),
      view: (category) => viewCategory(category),
    },
  });
}

async function openCategoryModal(category = null) {
  try {
    const attributeResponse = await attributeApi.getAll();
    const attributes = attributeResponse?.content || [];
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
          const payload = {
            ...formData,
            attributeIds: getSelectedAttributeIds(modal.modal),
          };

          if (category) {
            await categoryApi.update(category.id, payload);
            showToast("Category updated successfully.", "success");
          } else {
            await categoryApi.create(payload);
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
    renderAttributeSelector(modal.modal, attributes, category?.attributeIds || []);
  } catch (error) {
    console.error("Failed to load attributes for category modal:", error);
    showToast("Failed to load attributes.", "error");
  }
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
  const attributeNames = (category.attributes || [])
    .map((attribute) => attribute.attributeName)
    .join(", ");

  alertModal(
    `ID: ${category.id}\nName: ${category.name}\nDescription: ${category.description || "No description"}\nAttributes: ${attributeNames || "No linked attributes"}`,
    { title: "Category details" },
  );
}

function formatAttributeSummary(attributes = []) {
  if (!attributes.length) {
    return "-";
  }

  const names = attributes.map((attribute) => attribute.attributeName);
  if (names.length <= 2) {
    return names.join(", ");
  }

  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function renderAttributeSelector(modalElement, attributes, selectedIds = []) {
  const form = modalElement.querySelector("#modalForm");
  if (!form) return;

  const selectedSet = new Set((selectedIds || []).map(Number));
  const selectorMarkup = document.createElement("div");
  selectorMarkup.className = "form-field category-attribute-field";
  selectorMarkup.innerHTML = `
    <label class="field-label">Linked Attributes</label>
    <div class="category-attribute-selector">
      ${
        attributes.length
          ? attributes
              .map(
                (attribute) => `
                  <label class="category-attribute-option">
                    <input
                      type="checkbox"
                      class="category-attribute-checkbox"
                      value="${attribute.attributeId}"
                      ${selectedSet.has(Number(attribute.attributeId)) ? "checked" : ""}
                    />
                    <span class="category-attribute-name">${attribute.attributeName}</span>
                    <span class="category-attribute-type">${attribute.dataType}</span>
                  </label>
                `,
              )
              .join("")
          : '<div class="category-attribute-empty">No attributes available.</div>'
      }
    </div>
    <span class="field-help">Select the attributes that should be available for this category.</span>
  `;

  form.appendChild(selectorMarkup);
}

function getSelectedAttributeIds(modalElement) {
  return Array.from(
    modalElement.querySelectorAll(".category-attribute-checkbox:checked"),
  ).map((checkbox) => Number(checkbox.value));
}
