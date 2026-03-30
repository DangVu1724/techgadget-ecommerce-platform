import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { userApi } from "/modules/admin/core/api/user.api.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";
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
  window.userTable = new Table({
    container: document.getElementById("table-container"),
    entityName: "User",
    pageSize: 10,
    columns: [
      { key: "id", label: "ID" },
      { key: "email", label: "Email" },
      { key: "fullName", label: "Full name" },
      { key: "role", label: "Role" },
      { key: "createdAt", label: "Created At" },
    ],
    api: userApi,
    formatters: {
      createdAt: (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-"),
    },
    actions: {
      view: (user) => viewUser(user),
      delete: (user) => deleteUser(user),
    },
  });
}

function viewUser(user) {
  showToast(`User: ${user.email} (${user.fullName || "No name"})`, "info");
}

async function deleteUser(user) {
  // Optional: implement delete endpoint and confirmation.
  showToast("Delete user is not implemented yet.", "warning");
}
