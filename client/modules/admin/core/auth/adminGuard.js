export function checkAdmin() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || user?.role !== "ADMIN") {
    window.location.href = "/admin/login";
  }
}
