import { Sidebar } from "/modules/admin/components/layouts/sidebar/sidebar.js";
import { Table } from "/modules/admin/components/data/table/Table.js";
import { userApi } from "/modules/admin/core/api/user.api.js";
import { checkAdmin } from "/modules/admin/core/auth/adminGuard.js";

new Sidebar();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await checkAdmin();

    // Initialize users table
    window.userTable = new Table({
      container: document.getElementById("table-container"),
      entityName: "User",
      pageSize: 10,
      columns: [
        { key: "id", label: "ID" },
        { key: "email", label: "Email" },
        { key: "fullName", label: "Tên người dùng" },
        { key: "role", label: "Vai trò" },
      ],
      api: userApi,
      formatters: {
        role: (value) => {
          const roleMap = {
            ADMIN: "Quản trị viên",
            USER: "Người dùng",
            CUSTOMER: "Khách hàng",
          };
          return roleMap[value] || value;
        },
      },
      actions: {
        view: (record) => {
          console.log("View user:", record);
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi khởi tạo Users Management:", error);
  }
});
