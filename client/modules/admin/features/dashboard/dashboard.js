import { orderApi } from "/modules/admin/core/api/order.api.js";
import { productApi } from "/modules/admin/core/api/product.api.js";

const DASHBOARD_REFRESH_INTERVAL = 300000;
const DEFAULT_FETCH_SIZE = 100;

const dashboardState = {
  orders: [],
  activePeriod: "week",
  refreshTimer: null,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

function getPaidRevenue(orders) {
  return orders
    .filter((order) => (order.paymentStatus || "").toUpperCase() === "PAID")
    .reduce(
      (sum, order) =>
        sum + Number(order.finalAmount ?? order.amount ?? 0),
      0,
    );
}

function getStatusCount(orders, statuses) {
  const expectedStatuses = new Set(
    statuses.map((status) => status.toUpperCase()),
  );
  return orders.filter((order) =>
    expectedStatuses.has((order.orderStatus || "").toUpperCase()),
  ).length;
}

function sortOrdersByDateDesc(orders = []) {
  return [...orders].sort((left, right) => {
    const leftTime = left?.orderDate ? new Date(left.orderDate).getTime() : 0;
    const rightTime = right?.orderDate
      ? new Date(right.orderDate).getTime()
      : 0;
    return rightTime - leftTime;
  });
}

function getChartBuckets(orders, period) {
  const now = new Date();
  const buckets = [];

  if (period === "week") {
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - offset);

      buckets.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        key: date.toISOString().slice(0, 10),
        revenue: 0,
        orders: 0,
      });
    }
  } else {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let startDay = 1; startDay <= totalDays; startDay += 7) {
      const endDay = Math.min(startDay + 6, totalDays);
      buckets.push({
        label: `${startDay}-${endDay}`,
        revenue: 0,
        orders: 0,
        range: { startDay, endDay, month: currentMonth, year: currentYear },
      });
    }
  }

  orders.forEach((order) => {
    if (!order.orderDate) return;

    const orderDate = new Date(order.orderDate);
    const paidRevenue =
      (order.paymentStatus || "").toUpperCase() === "PAID"
        ? Number(order.finalAmount ?? order.amount ?? 0)
        : 0;

    if (period === "week") {
      const key = orderDate.toISOString().slice(0, 10);
      const bucket = buckets.find((item) => item.key === key);

      if (bucket) {
        bucket.orders += 1;
        bucket.revenue += paidRevenue;
      }
      return;
    }

    const bucket = buckets.find(
      (item) =>
        item.range.year === orderDate.getFullYear() &&
        item.range.month === orderDate.getMonth() &&
        orderDate.getDate() >= item.range.startDay &&
        orderDate.getDate() <= item.range.endDay,
    );

    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += paidRevenue;
    }
  });

  return buckets;
}

function renderStats({ orders, products, topProducts }) {
  const container = document.getElementById("statsContainer");
  if (!container) return;

  const totalOrders = orders.totalElements || orders.content.length;
  const totalRevenue = getPaidRevenue(orders.content);
  const totalProducts = products.totalElements || products.content.length;
  const lowStockProducts = products.content.filter(
    (product) => Number(product.totalStock || 0) < 10,
  ).length;
  const deliveredOrders = getStatusCount(orders.content, ["DELIVERED"]);
  const processingOrders = getStatusCount(orders.content, [
    "PENDING",
    "PROCESSING",
  ]);
  const bestSeller = topProducts[0];

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-info">
        <h3>Total Orders</h3>
        <div class="stat-number">${formatCompactNumber(totalOrders)}</div>
        <div class="stat-change">${deliveredOrders} delivered</div>
      </div>
      <div class="stat-icon">ORD</div>
    </div>
    <div class="stat-card">
      <div class="stat-info">
        <h3>Total Revenue</h3>
        <div class="stat-number">${formatCurrency(totalRevenue)}</div>
        <div class="stat-change">Paid orders only</div>
      </div>
      <div class="stat-icon">REV</div>
    </div>
    <div class="stat-card">
      <div class="stat-info">
        <h3>Products</h3>
        <div class="stat-number">${formatCompactNumber(totalProducts)}</div>
        <div class="stat-change">${lowStockProducts} low stock</div>
      </div>
      <div class="stat-icon">SKU</div>
    </div>
    <div class="stat-card">
      <div class="stat-info">
        <h3>Processing</h3>
        <div class="stat-number">${formatCompactNumber(processingOrders)}</div>
        <div class="stat-change">${bestSeller ? `${bestSeller.name} is leading` : "No sales data yet"}</div>
      </div>
      <div class="stat-icon">OPS</div>
    </div>
  `;
}

function renderSalesChart(orders, period = dashboardState.activePeriod) {
  const chartContainer = document.getElementById("salesChart");
  const chartSummary = document.getElementById("salesChartSummary");
  if (!chartContainer || !chartSummary) return;

  const buckets = getChartBuckets(orders, period);
  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 0);
  const totalRevenue = buckets.reduce((sum, bucket) => sum + bucket.revenue, 0);
  const totalOrders = buckets.reduce((sum, bucket) => sum + bucket.orders, 0);

  chartSummary.innerHTML = `
    <div>
      <span class="chart-summary-label">Revenue</span>
      <strong>${formatCurrency(totalRevenue)}</strong>
    </div>
    <div>
      <span class="chart-summary-label">Orders</span>
      <strong>${formatCompactNumber(totalOrders)}</strong>
    </div>
  `;

  chartContainer.innerHTML = buckets
    .map((bucket) => {
      const height =
        maxRevenue > 0
          ? Math.max(
              (bucket.revenue / maxRevenue) * 220,
              bucket.revenue > 0 ? 16 : 8,
            )
          : 8;

      return `
        <div class="bar-container" title="${bucket.label}: ${formatCurrency(bucket.revenue)} from ${bucket.orders} orders">
          <div class="bar" style="height:${height}px"></div>
          <span class="bar-value">${bucket.revenue > 0 ? formatCompactNumber(bucket.revenue) : ""}</span>
          <span class="bar-label">${bucket.label}</span>
        </div>
      `;
    })
    .join("");
}

function renderOrderStatus(orders) {
  const container = document.getElementById("orderStatusList");
  if (!container) return;

  const statusItems = [
    ["Pending", getStatusCount(orders, ["PENDING"])],
    ["Processing", getStatusCount(orders, ["PROCESSING"])],
    ["Delivered", getStatusCount(orders, ["DELIVERED"])],
    ["Cancelled", getStatusCount(orders, ["CANCELLED"])],
  ];

  const total = statusItems.reduce((sum, [, count]) => sum + count, 0) || 1;

  container.innerHTML = statusItems
    .map(([label, count]) => {
      const percentage = Math.round((count / total) * 100);
      return `
        <div class="status-row">
          <div>
            <div class="status-title">${label}</div>
            <div class="status-subtitle">${percentage}% of tracked orders</div>
          </div>
          <div class="status-metric">${count}</div>
        </div>
      `;
    })
    .join("");
}

function renderTopProducts(products) {
  const container = document.getElementById("topProductsList");
  if (!container) return;

  if (!products.length) {
    container.innerHTML =
      '<div class="no-data">No delivered-product data yet.</div>';
    return;
  }

  const maxSold = Math.max(
    ...products.map((product) => Number(product.totalSold || 0)),
    0,
  );

  container.innerHTML = products
    .map((product) => {
      const sold = Number(product.totalSold || 0);
      const percentage = maxSold > 0 ? (sold / maxSold) * 100 : 0;
      const priceLabel =
        Number(product.minPrice || 0) === Number(product.maxPrice || 0)
          ? formatCurrency(product.minPrice)
          : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`;

      return `
        <div class="list-card">
          <div class="list-card-header">
            <div>
              <div class="list-card-title">${product.name}</div>
              <div class="list-card-subtitle">${priceLabel}</div>
            </div>
            <div class="list-card-metric">${sold} sold</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderNewestProducts(products) {
  const container = document.getElementById("newestProductsList");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<div class="no-data">No product data found.</div>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const priceLabel =
        Number(product.minPrice || 0) === Number(product.maxPrice || 0)
          ? formatCurrency(product.minPrice)
          : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`;

      return `
        <div class="list-card">
          <div class="list-card-header">
            <div>
              <div class="list-card-title">${product.name}</div>
              <div class="list-card-subtitle">Product #${product.id}</div>
            </div>
            <div class="list-card-metric">${priceLabel}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getTopRatedProducts(products = [], limit = 5) {
  return [...products]
    .filter((product) => Number(product.totalReviews || 0) > 0)
    .sort((left, right) => {
      const ratingDiff =
        Number(right.averageRating || 0) - Number(left.averageRating || 0);
      if (ratingDiff !== 0) return ratingDiff;

      const reviewsDiff =
        Number(right.totalReviews || 0) - Number(left.totalReviews || 0);
      if (reviewsDiff !== 0) return reviewsDiff;

      return Number(right.totalSold || 0) - Number(left.totalSold || 0);
    })
    .slice(0, limit);
}

function renderTopRatedProducts(products) {
  const container = document.getElementById("topRatedProductsList");
  if (!container) return;

  if (!products.length) {
    container.innerHTML =
      '<div class="no-data">Chưa có dữ liệu đánh giá sản phẩm.</div>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const averageRating = Number(product.averageRating || 0);
      const totalReviews = Number(product.totalReviews || 0);
      const priceLabel =
        Number(product.minPrice || 0) === Number(product.maxPrice || 0)
          ? formatCurrency(product.minPrice)
          : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`;

      return `
        <div class="list-card">
          <div class="list-card-header">
            <div>
              <div class="list-card-title">${product.name}</div>
              <div class="list-card-subtitle">${priceLabel}</div>
            </div>
            <div class="rating-badge">${averageRating.toFixed(1)} ★</div>
          </div>
          <div class="list-card-footer">
            <span>${totalReviews} đánh giá</span>
            <span>${Number(product.totalSold || 0)} đã bán</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getStatusBadgeClass(status) {
  const normalizedStatus = (status || "").toUpperCase();
  if (normalizedStatus === "DELIVERED") return "completed";
  if (normalizedStatus === "CANCELLED") return "cancelled";
  if (normalizedStatus === "PROCESSING") return "processing";
  return "pending";
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="no-data">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = sortOrdersByDateDesc(orders)
    .slice(0, 6)
    .map(
      (order) => `
      <tr>
        <td>#${order.orderCode || order.id}</td>
        <td>${formatCurrency(order.finalAmount ?? order.amount)}</td>
        <td><span class="status-badge ${getStatusBadgeClass(order.orderStatus)}">${order.orderStatus || "-"}</span></td>
        <td>${order.paymentStatus || "-"}</td>
        <td>${formatDateTime(order.orderDate)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderDashboardError() {
  const statsContainer = document.getElementById("statsContainer");
  const salesChart = document.getElementById("salesChart");
  const salesChartSummary = document.getElementById("salesChartSummary");
  const orderStatusList = document.getElementById("orderStatusList");
  const topProductsList = document.getElementById("topProductsList");
  const topRatedProductsList = document.getElementById("topRatedProductsList");
  const newestProductsList = document.getElementById("newestProductsList");
  const ordersTableBody = document.getElementById("ordersTableBody");

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-info">
          <h3>Dashboard Error</h3>
          <div class="stat-number">0</div>
          <div class="stat-change">Unable to load dashboard data.</div>
        </div>
        <div class="stat-icon">ERR</div>
      </div>
    `;
  }

  if (salesChartSummary) {
    salesChartSummary.innerHTML = "";
  }

  if (salesChart) {
    salesChart.innerHTML =
      '<div class="no-data">Failed to load chart data.</div>';
  }

  if (orderStatusList) {
    orderStatusList.innerHTML =
      '<div class="no-data">Failed to load order status.</div>';
  }

  if (topProductsList) {
    topProductsList.innerHTML =
      '<div class="no-data">Failed to load top products.</div>';
  }

  if (topRatedProductsList) {
    topRatedProductsList.innerHTML =
      '<div class="no-data">Failed to load rated products.</div>';
  }

  if (newestProductsList) {
    newestProductsList.innerHTML =
      '<div class="no-data">Failed to load newest products.</div>';
  }

  if (ordersTableBody) {
    ordersTableBody.innerHTML =
      '<tr><td colspan="5" class="no-data">Failed to load orders.</td></tr>';
  }
}

function setDashboardUser() {
  const userName = document.getElementById("userName");
  if (!userName) return;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    userName.textContent = user?.fullName || user?.email || "Admin";
  } catch {
    userName.textContent = "Admin";
  }
}

function syncChartButtons() {
  document.querySelectorAll(".chart-btn").forEach((button) => {
    const isActive = button.dataset.period === dashboardState.activePeriod;
    button.classList.toggle("active", isActive);
  });
}

function bindChartButtons() {
  document.querySelectorAll(".chart-btn").forEach((button) => {
    if (button.dataset.bound === "true") {
      return;
    }

    button.addEventListener("click", () => {
      dashboardState.activePeriod = button.dataset.period || "week";
      syncChartButtons();
      renderSalesChart(dashboardState.orders, dashboardState.activePeriod);
    });

    button.dataset.bound = "true";
  });
}

async function loadDashboardData() {
  const [ordersData, productsData, topProducts, newestProducts] =
    await Promise.all([
      orderApi.getAll({ page: 0, size: DEFAULT_FETCH_SIZE }),
      productApi.getAll({ page: 0, size: DEFAULT_FETCH_SIZE }),
      productApi.getTopSelling(5),
      productApi.getNewest(5),
    ]);

  dashboardState.orders = ordersData.content || [];
  const productItems = productsData.content || [];
  const topRatedProducts = getTopRatedProducts(productItems, 5);

  renderStats({
    orders: ordersData,
    products: productsData,
    topProducts: topProducts || [],
  });
  syncChartButtons();
  renderSalesChart(dashboardState.orders, dashboardState.activePeriod);
  renderOrderStatus(dashboardState.orders);
  renderTopProducts(topProducts || []);
  renderTopRatedProducts(topRatedProducts);
  renderNewestProducts(newestProducts || []);
  renderRecentOrders(dashboardState.orders);
}

export async function initDashboard() {
  setDashboardUser();
  bindChartButtons();

  try {
    await loadDashboardData();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    renderDashboardError();
  }

  if (dashboardState.refreshTimer) {
    window.clearInterval(dashboardState.refreshTimer);
  }

  dashboardState.refreshTimer = window.setInterval(async () => {
    try {
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  }, DASHBOARD_REFRESH_INTERVAL);
}
