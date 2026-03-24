import { orderApi } from "/modules/admin/core/api/order.api.js";
import { productApi } from "/modules/admin/core/api/product.api.js";

// Load Top Products
async function loadTopProducts() {
  try {
    const products = await productApi.getTopSelling(5);
    const container = document.getElementById("topProductsList");
    if (!container) return;

    if (!products.length) {
      container.innerHTML = '<div class="no-data">No products found</div>';
      return;
    }

    const totalSold = products.reduce((sum, p) => sum + (p.totalSold || 0), 0);

    container.innerHTML = products
      .map((product) => {
        const sold = product.totalSold || 0;
        const percentage = totalSold > 0 ? (sold / totalSold) * 100 : 0;

        const price = product.price || 0;
        const revenue = product.totalRevenue || price * sold;

        return `
        <div class="top-product-item">
          <div class="product-info">
            <div style="display:flex;gap:10px;align-items:center;">
              ${
                product.image
                  ? `<img src="${product.image}" style="width:30px;height:30px;border-radius:5px;">`
                  : ""
              }
              <span>${product.name}</span>
            </div>
            <span>${sold} sold</span>
          </div>

          <div class="progress-bar">
            <div class="progress-fill" style="width:${percentage}%"></div>
          </div>

          <div class="product-details">
            <span>$${price.toLocaleString()}</span>
            <span>$${revenue.toLocaleString()}</span>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// Load Recent Orders
async function loadRecentOrders() {
  try {
    const ordersData = await orderApi.getAll({ page: 0, size: 5 });
    const orders = ordersData.content || [];

    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    tbody.innerHTML = orders
      .map((order) => {
        const status = order.orderStatus || "PENDING";

        const statusClass =
          status === "DELIVERED"
            ? "completed"
            : status === "CANCELLED"
              ? "cancelled"
              : "pending";

        return `
        <tr>
          <td>#${order.id}</td>
          <td>$${(order.amount || 0).toLocaleString()}</td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
          <td>${new Date(order.orderDate).toLocaleDateString()}</td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

// Load Sample Chart Data
function loadSampleChart() {
  const chartContainer = document.getElementById("salesChart");
  if (!chartContainer) return;

  // Sample data for the chart
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [65, 45, 75, 55, 85, 70, 60];

  // Find max value for scaling
  const maxValue = Math.max(...values);

  chartContainer.innerHTML = days
    .map((day, index) => {
      const height = (values[index] / maxValue) * 200; // Max height 200px
      return `
      <div class="bar-container">
        <div class="bar" style="height: ${height}px"></div>
        <span class="bar-label">${day}</span>
      </div>
    `;
    })
    .join("");
}

// Load Stats Cards (tính toán từ orders)
async function loadStatsCards() {
  try {
    const ordersData = await orderApi.getAll({ page: 0, size: 100 }); // Lấy nhiều orders để tính stats
    const orders = ordersData.content || [];

    // Tính toán stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );
    const completedOrders = orders.filter((o) =>
      ["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase() || ""),
    ).length;
    const pendingOrders = orders.filter((o) =>
      ["PENDING", "PROCESSING"].includes(o.status?.toUpperCase() || ""),
    ).length;

    // Tính phần trăm thay đổi (giả sử so với tháng trước)
    const orderChange = 12.5; // Sample data
    const revenueChange = 8.2; // Sample data

    const container = document.getElementById("statsContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-info">
          <h3>Total Orders</h3>
          <div class="stat-number">${totalOrders}</div>
          <div class="stat-change positive">
            <span>↑</span> ${orderChange}% from last month
          </div>
        </div>
        <div class="stat-icon">📦</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Total Revenue</h3>
          <div class="stat-number">$${totalRevenue.toLocaleString()}</div>
          <div class="stat-change positive">
            <span>↑</span> ${revenueChange}% from last month
          </div>
        </div>
        <div class="stat-icon">💰</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Completed Orders</h3>
          <div class="stat-number">${completedOrders}</div>
          <div class="stat-change positive">
            <span>✓</span> ${Math.round((completedOrders / totalOrders) * 100) || 0}% success rate
          </div>
        </div>
        <div class="stat-icon">✅</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <h3>Pending Orders</h3>
          <div class="stat-number">${pendingOrders}</div>
          <div class="stat-change">
            <span>⏳</span> Awaiting processing
          </div>
        </div>
        <div class="stat-icon">⏰</div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading stats:", error);
    // Fallback data nếu có lỗi
    const container = document.getElementById("statsContainer");
    if (container) {
      container.innerHTML = `
        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Orders</h3>
            <div class="stat-number">0</div>
          </div>
          <div class="stat-icon">📦</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Revenue</h3>
            <div class="stat-number">$0</div>
          </div>
          <div class="stat-icon">💰</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Completed Orders</h3>
            <div class="stat-number">0</div>
          </div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Pending Orders</h3>
            <div class="stat-number">0</div>
          </div>
          <div class="stat-icon">⏰</div>
        </div>
      `;
    }
  }
}

// Handle chart period buttons
function setupChartButtons() {
  const buttons = document.querySelectorAll(".chart-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      buttons.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      // Update chart based on period (you can implement real data here)
      const period = this.textContent.toLowerCase();
      updateChartData(period);
    });
  });
}

// Update chart data based on period
function updateChartData(period) {
  const chartContainer = document.getElementById("salesChart");
  if (!chartContainer) return;

  // Sample data for different periods
  let labels, values;

  switch (period) {
    case "week":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      values = [65, 45, 75, 55, 85, 70, 60];
      break;
    case "month":
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      values = [280, 320, 295, 350];
      break;
    case "year":
      labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      values = [
        1200, 1350, 1100, 1450, 1600, 1550, 1700, 1800, 1650, 1750, 1900, 2100,
      ];
      break;
    default:
      return;
  }

  const maxValue = Math.max(...values);

  chartContainer.innerHTML = labels
    .map((label, index) => {
      const height = (values[index] / maxValue) * 200;
      return `
      <div class="bar-container">
        <div class="bar" style="height: ${height}px"></div>
        <span class="bar-label">${label}</span>
      </div>
    `;
    })
    .join("");
}

// Initialize dashboard
export function initDashboard() {
  loadStatsCards();
  loadTopProducts();
  loadRecentOrders();
  loadSampleChart();
  setupChartButtons();

  // Refresh data every 5 minutes
  setInterval(() => {
    loadStatsCards();
    loadTopProducts();
    loadRecentOrders();
  }, 300000);
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initDashboard);
