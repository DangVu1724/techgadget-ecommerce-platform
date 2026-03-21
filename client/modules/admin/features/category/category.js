import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { categoryApi } from "/modules/admin/core/api/category.api.js";

// Initialize sidebar
new Sidebar();

// Check authentication
document.addEventListener("DOMContentLoaded", async () => {
  try {

    // Initialize table
    initTable();
  } catch (error) {
    console.error("Auth check failed:", error);
  }
});

function initTable() {
  window.categoryTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Category",
    pageSize: 10, // Số item mỗi trang
    columns: [
      {
        key: "id",
        label: "ID",
      },
      {
        key: "name",
        label: "Category Name",
      },
      {
        key: "description",
        label: "Description",
      },
      {
        key: "createdAt",
        label: "Created At",
      },
    ],
    api: categoryApi,
    formatters: {
      // Format ngày tháng
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
      // Format description - cắt ngắn nếu quá dài
      description: (value) => {
        if (!value) return "-";
        return value.length > 50 ? value.substring(0, 50) + "..." : value;
      },
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
  console.log("Category data:", category); // Debug: xem dữ liệu category

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
        placeholder: "Enter category name (e.g., Electronics, Fashion)",
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
        console.log("Saving category:", formData); // Debug

        if (category) {
          // Update existing category
          await categoryApi.update(category.id, formData);
          alert("Category updated successfully!");
        } else {
          // Create new category
          await categoryApi.create(formData);
          alert("Category created successfully!");
        }

        modal.close();
        window.categoryTable.refresh(); // Refresh table
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save category: " + error.message);
      }
    },
  });

  modal.open();
}

async function deleteCategory(category) {
  if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
    try {
      await categoryApi.delete(category.id);
      alert("Category deleted successfully!");
      window.categoryTable.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete category: " + error.message);
    }
  }
}

function viewCategory(category) {
  // Hiển thị chi tiết category
  alert(`
                Category Details:
                ID: ${category.id}
                Name: ${category.name}
                Description: ${category.description || "No description"}
                Created: ${category.createdAt ? new Date(category.createdAt).toLocaleString() : "N/A"}
            `);
}

// Thêm function để test API trực tiếp
window.testAPI = async () => {
  try {
    const data = await categoryApi.getAll();
    console.log("API Test - All categories:", data);
    alert(
      `Found ${data.content.length} categories. Check console for details.`,
    );
  } catch (error) {
    console.error("API Test failed:", error);
    alert("API Test failed: " + error.message);
  }
};
