import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { attributeApi } from "../../core/api/attribute.api.js";

new Sidebar();

document.addEventListener("DOMContentLoaded", async () => {
  try {

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
      {
        key: "attributeId",
        label: "ID",
      },

      {
        key: "attributeName",
        label: "Attribute Name",
      },

      {
        key: "dataType",
        label: "Data Type",
      },
    ],

    api: attributeApi,

    formatters: {
      createdAt: (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },

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
        placeholder: "Enter attribute name (RAM, CPU, Screen Size...)",
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
          alert("Attribute updated successfully!");
        } else {
          await attributeApi.create(formData);
          alert("Attribute created successfully!");
        }

        modal.close();
        window.attributeTable.refresh();
      } catch (error) {
        console.error(error);
        alert("Failed to save attribute: " + error.message);
      }
    },
  });

  modal.open();
}

async function deleteAttribute(attribute) {
  if (
    confirm(`Are you sure you want to delete "${attribute.attributeName}"?`)
  ) {
    try {
      await attributeApi.delete(attribute.attributeId);

      alert("Attribute deleted successfully!");

      window.attributeTable.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete attribute: " + error.message);
    }
  }
}

function viewAttribute(attribute) {
  alert(`
Attribute Details:

ID: ${attribute.attributeId}

Name: ${attribute.attributeName}

Data Type: ${attribute.dataType}

`);
}
