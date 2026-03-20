import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { attributeApi } from "../../core/api/attribute.api.js";
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
  window.attributeTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Attribute",
    pageSize: 10,
    columns: [
      { key: "attributeId", label: "ID" },
      { key: "attributeName", label: "Attribute Name" },
      { key: "dataType", label: "Data Type" },
    ],
    api: attributeApi,
    actions: {
      add: () => openAttributeModal(),
      edit: (attribute) => openAttributeModal(attribute),
      delete: (attribute) => deleteAttribute(attribute),
      view: (attribute) => viewAttribute(attribute),
    },
  });
}

function openAttributeModal(attribute = null) {
  const modal = new Modal({
    title: attribute ? "Edit Attribute" : "Add Attribute",
    size: "sm",
    data: attribute || {},
    fields: [
      {
        name: "attributeName",
        label: "Attribute Name",
        type: "text",
        required: true,
        placeholder: "Enter attribute name",
      },
      {
        name: "dataType",
        label: "Data Type",
        type: "select",
        required: true,
        options: [
          { value: "TEXT", label: "TEXT" },
          { value: "NUMBER", label: "NUMBER" },
          { value: "BOOLEAN", label: "BOOLEAN" },
        ],
      },
    ],
    onSave: async (formData) => {
      try {
        if (attribute) {
          await attributeApi.update(attribute.attributeId, formData);
          showToast("Attribute updated successfully.", "success");
        } else {
          await attributeApi.create(formData);
          showToast("Attribute created successfully.", "success");
        }

        modal.close();
        window.attributeTable.refresh();
      } catch (error) {
        console.error("Failed to save attribute:", error);
      }
    },
  });

  modal.open();
}

async function deleteAttribute(attribute) {
  const confirmed = await confirmModal(
    `Delete "${attribute.attributeName}"? This action cannot be undone.`,
    {
      title: "Delete attribute",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await attributeApi.delete(attribute.attributeId);
    showToast("Attribute deleted successfully.", "success");
    window.attributeTable.refresh();
  } catch (error) {
    console.error("Failed to delete attribute:", error);
  }
}

function viewAttribute(attribute) {
  alertModal(
    `ID: ${attribute.attributeId}\nName: ${attribute.attributeName}\nData Type: ${attribute.dataType}`,
    { title: "Attribute details" },
  );
}
