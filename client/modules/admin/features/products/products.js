import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { productApi } from "../../core/api/product.api.js";
import { brandApi } from "../../core/api/brand.api.js";
import { categoryApi } from "../../core/api/category.api.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";
import { confirmModal } from "/shared/ui/modal.js";
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
  window.productTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "Product",
    pageSize: 10,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Product Name" },
      { key: "minPrice", label: "Min Price" },
      { key: "maxPrice", label: "Max Price" },
      { key: "totalStock", label: "Stock" },
      { key: "createdAt", label: "Created" },
    ],
    api: productApi,
    formatters: {
      minPrice: (value) => `<span class="price">${formatCurrency(value)}</span>`,
      maxPrice: (value) => (value ? `<span class="price">${formatCurrency(value)}</span>` : "-"),
      totalStock: (value) => {
        let status = "high";
        let text = value;

        if (value === 0) {
          status = "low";
          text = "Out of Stock";
        } else if (value < 10) {
          status = "low";
          text = `${value} (Low)`;
        } else if (value < 50) {
          status = "medium";
        }

        return `<span class="stock-badge ${status}">${text}</span>`;
      },
      createdAt: (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-"),
    },
    actions: {
      add: () => openProductModal(),
      edit: (product) => openProductModal(product),
      delete: (product) => deleteProduct(product),
      view: (product) => viewProduct(product),
    },
  });
}

async function openProductModal(product = null) {
  try {
    const categoriesRes = await categoryApi.getAll();
    const brandsRes = await brandApi.getAll();

    const categoryOptions = categoriesRes.content.map((category) => ({
      value: category.id,
      label: category.name,
    }));

    const brandOptions = brandsRes.content.map((brand) => ({
      value: brand.brandId,
      label: brand.brandName,
    }));

    const modal = new Modal({
      title: product ? "Edit Product" : "Add Product",
      size: "lg",
      data: product || {},
      fields: [
        {
          name: "name",
          label: "Product Name",
          type: "text",
          required: true,
          placeholder: "Enter product name",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter product description",
        },
        {
          name: "categoryId",
          label: "Category",
          type: "select",
          required: true,
          options: categoryOptions,
        },
        {
          name: "brandId",
          label: "Brand",
          type: "select",
          required: true,
          options: brandOptions,
        },
      ],
      onSave: async (formData) => {
        try {
          if (product) {
            await productApi.update(product.id, formData);
            showToast("Product updated successfully.", "success");
          } else {
            await productApi.create(formData);
            showToast("Product created successfully.", "success");
          }

          modal.close();
          window.productTable.refresh();
        } catch (error) {
          console.error("Save error:", error);
        }
      },
    });

    modal.open();
  } catch (error) {
    console.error("Failed to open product modal:", error);
  }
}

async function deleteProduct(product) {
  const confirmed = await confirmModal(
    `Delete "${product.name}"? This action cannot be undone.`,
    {
      title: "Delete product",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
  );

  if (!confirmed) {
    return;
  }

  try {
    await productApi.delete(product.id);
    showToast("Product deleted successfully.", "success");
    window.productTable.refresh();
  } catch (error) {
    console.error("Delete error:", error);
  }
}

function viewProduct(product) {
  window.location.href = `/admin/products/${product.id}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}
