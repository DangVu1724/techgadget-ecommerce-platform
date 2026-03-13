import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { Modal } from "/modules/admin/components/data/table/Modal.js";
import { productApi } from "../../core/api/product.api.js";
import { brandApi } from "../../core/api/brand.api.js";
import { categoryApi } from "../../core/api/category.api.js";
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
      minPrice: (value) => {
        return `<span class="price">${formatCurrency(value)}</span>`;
      },
      maxPrice: (value) => {
        if (!value) return "-";
        return `<span class="price">${formatCurrency(value)}</span>`;
      },
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
          text = `${value}`;
        }

        return `<span class="stock-badge ${status}">${text}</span>`;
      },
      createdAt: (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("vi-VN");
      },
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
  console.log("Product data:", product);
  const categoriesRes = await categoryApi.getAll();
  const brandsRes = await brandApi.getAll();

    console.log("Product data:", categoriesRes);


  const categories = categoriesRes.content;
  const brands = brandsRes.content;

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const brandOptions = brands.map((b) => ({
    value: b.brandId,
    label: b.brandName,
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
        name: "totalStock",
        label: "Stock Quantity",
        type: "number",
        required: true,
        placeholder: "0",
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
        // Convert string to numbers
        const productData = {
          ...formData,
          minPrice: parseFloat(formData.minPrice) || 0,
          maxPrice: parseFloat(formData.maxPrice) || null,
          totalStock: parseInt(formData.totalStock) || 0,
        };

        console.log("Saving product:", productData);

        if (product) {
          await productApi.update(product.id, productData);
          alert("Product updated successfully!");
        } else {
          await productApi.create(productData);
          alert("Product created successfully!");
        }

        modal.close();
        window.productTable.refresh();
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save product: " + error.message);
      }
    },
  });

  modal.open();
}

async function deleteProduct(product) {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    try {
      await productApi.delete(product.id);
      alert("Product deleted successfully!");
      window.productTable.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product: " + error.message);
    }
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
