import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { brandApi } from "../../core/api/brand.api.js";
import { requireAdmin } from "/modules/core/auth/auth.guard.js";

new Sidebar();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    requireAdmin();


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
      {
        key: "brandId",
        label: "ID",
      },
      {
        key: "brandName",
        label: "Brand Name",
      },
      {
        key: "createdAt",
        label: "Created At",
      },
    ],
    api: brandApi,
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
      add: () => openBrandModal(),
      edit: (brand) => openBrandModal(brand),
      delete: (brand) => deleteBrand(brand),
      view: (brand) => viewBrand(brand),
    },
  });
}

function openBrandModal(brand = null) {
  console.log("OPEN BRAND MODAL");

  console.log("Brand data:", brand);

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
        placeholder: "Enter brand name (e.g., Nike, Apple, Samsung)",
      },
    ],
    onSave: async (formData) => {
      try {
        console.log("Saving brand:", formData);

        if (brand) {
          await brandApi.update(brand.brandId, formData);
          alert("Brand updated successfully!");
        } else {
          await brandApi.create(formData);
          alert("Brand created successfully!");
        }

        modal.close();
        window.brandTable.refresh();
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save brand: " + error.message);
      }
    },
  });

  modal.open();
}

async function deleteBrand(brand) {
  if (confirm(`Are you sure you want to delete "${brand.brandName}"?`)) {
    try {
      await brandApi.delete(brand.brandId);
      alert("Brand deleted successfully!");
      window.brandTable.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete brand: " + error.message);
    }
  }
}

function viewBrand(brand) {
  alert(`
                Brand Details:
                ID: ${brand.brandId}
                Name: ${brand.brandName}
                Created: ${brand.createdAt ? new Date(brand.createdAt).toLocaleString() : "N/A"}
            `);
}

// Test API function
window.testBrandAPI = async () => {
  try {
    const data = await brandApi.getAll();
    console.log("API Test - All brands:", data);
    alert(`Found ${data.content.length} brands. Check console for details.`);
  } catch (error) {
    console.error("API Test failed:", error);
    alert("API Test failed: " + error.message);
  }
};
