export class Table {
  constructor(options = {}) {
    this.container = options.container;
    this.columns = options.columns || [];
    this.api = options.api;
    this.pageSize = options.pageSize || 10;
    this.actions = options.actions || {};
    this.formatters = options.formatters || {};
    this.entityName = options.entityName || "Item";

    this.currentPage = 0;
    this.totalPages = 0;
    this.totalElements = 0;
    this.searchTerm = "";
    this.data = [];

    this.init();
  }

  init() {
    this.render();
    this.loadData();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-box">
            <i class="search-icon">&#128269;</i>
            <input type="text" 
                   id="${this.container.id}-search" 
                   placeholder="Search ${this.entityName.toLowerCase()}..." 
                   class="search-input">
          </div>
          <button class="btn btn-primary add-btn" id="${this.container.id}-add">
            <i class="btn-icon">+</i> Add ${this.entityName}
          </button>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                ${this.renderHeaders()}
                <th class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody id="${this.container.id}-body">
              <tr>
                <td colspan="${this.columns.length + 1}" class="loading">
                  <div class="loader"></div>
                  <span>Loading ${this.entityName.toLowerCase()}...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="table-info" id="${this.container.id}-info"></div>
          <div class="pagination" id="${this.container.id}-pagination"></div>
        </div>
      </div>
    `;

    this.tableBody = document.getElementById(`${this.container.id}-body`);
    this.tableInfo = document.getElementById(`${this.container.id}-info`);
    this.paginationContainer = document.getElementById(
      `${this.container.id}-pagination`,
    );
  }

  renderHeaders() {
    return this.columns
      .map((col) => `<th>${col.label || col.key}</th>`)
      .join("");
  }

  async loadData(page = this.currentPage) {
    try {
      this.showLoading();

      const response = await this.api.getAll({
        page,
        size: this.pageSize,
        search: this.searchTerm,
      });

      if (response.content) {
        this.data = response.content;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.data.length;
      } else {
        this.data = response;
        this.totalPages = 1;
        this.totalElements = this.data.length;
      }

      this.currentPage = page;

      if (this.data.length === 0) {
        this.showNoData();
      } else {
        this.renderData();
      }

      this.updateTableInfo();
      this.renderPagination();
    } catch (error) {
      console.error("Table load error:", error);
      this.showError();
    }
  }

  renderData() {
    this.tableBody.innerHTML = "";

    this.data.forEach((item, index) => {
      const row = this.createRow(item, index);
      this.tableBody.appendChild(row);
    });
  }

  createRow(item, index) {
    const row = document.createElement("tr");
    row.setAttribute(
      "data-id",
      item.id || item.brandId || item.categoryId || item.attributeId,
    );

    this.columns.forEach((col) => {
      const cell = document.createElement("td");
      let value = this.getNestedValue(item, col.key);

      if (this.formatters[col.key]) {
        value = this.formatters[col.key](value, item);
      }

      if (col.className) {
        cell.className = col.className;
      }

      cell.innerHTML = value ?? "-";
      row.appendChild(cell);
    });

    row.appendChild(this.createActionCell(item));
    row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;

    return row;
  }

  createActionCell(item) {
    const cell = document.createElement("td");
    cell.className = "actions-cell";

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "action-buttons";

    if (this.actions.view) {
      const viewBtn = this.createActionButton("view", "&#128065;", "View", () =>
        this.actions.view(item),
      );
      actionsContainer.appendChild(viewBtn);
    }

    if (this.actions.edit) {
      const editBtn = this.createActionButton("edit", "&#9998;", "Edit", () =>
        this.actions.edit(item),
      );
      actionsContainer.appendChild(editBtn);
    }

    if (this.actions.delete) {
      const deleteBtn = this.createActionButton("delete", "&#128465;", "Delete", () =>
        this.actions.delete(item),
      );
      actionsContainer.appendChild(deleteBtn);
    }

    const customActions = Array.isArray(this.actions.custom)
      ? this.actions.custom
      : [];

    customActions.forEach((action) => {
      if (!action || typeof action.onClick !== "function") return;

      const type = action.type || "custom";
      const icon = action.icon || "?";
      const title = action.title || "Action";
      const button = this.createActionButton(type, icon, title, () =>
        action.onClick(item),
      );

      if (action.className) {
        button.classList.add(action.className);
      }

      actionsContainer.appendChild(button);
    });

    cell.appendChild(actionsContainer);
    return cell;
  }

  createActionButton(type, icon, tooltip, onClick) {
    const btn = document.createElement("button");
    btn.className = `action-btn ${type}-btn`;
    btn.innerHTML = icon;
    btn.title = tooltip;
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  }

  getNestedValue(obj, path) {
    if (!path) return null;
    if (!path.includes(".")) return obj[path];

    return path
      .split(".")
      .reduce(
        (current, key) =>
          current && current[key] !== undefined ? current[key] : null,
        obj,
      );
  }

  showLoading() {
    this.tableBody.innerHTML = `
      <tr>
        <td colspan="${this.columns.length + 1}" class="loading">
          <div class="loader"></div>
          <span>Loading ${this.entityName.toLowerCase()}...</span>
        </td>
      </tr>
    `;
  }

  showNoData() {
    this.tableBody.innerHTML = `
      <tr>
        <td colspan="${this.columns.length + 1}" class="no-data">
          <div class="no-data-icon">&#128237;</div>
          <h3>No ${this.entityName.toLowerCase()} found</h3>
          <p>Click the "Add ${this.entityName}" button to create your first ${this.entityName.toLowerCase()}.</p>
        </td>
      </tr>
    `;
  }

  showError() {
    this.tableBody.innerHTML = `
      <tr>
        <td colspan="${this.columns.length + 1}" class="error">
          <div class="error-icon">&#9888;</div>
          <h3>Failed to load data</h3>
          <p>Please try again or contact support if the problem persists.</p>
          <button class="btn btn-secondary retry-btn" onclick="location.reload()">
            Retry
          </button>
        </td>
      </tr>
    `;
  }

  updateTableInfo() {
    if (!this.tableInfo) return;

    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min(start + this.data.length - 1, this.totalElements);

    this.tableInfo.innerHTML = `
      Showing ${start} to ${end} of ${this.totalElements} ${this.entityName.toLowerCase()}
    `;
  }

  renderPagination() {
    if (!this.paginationContainer) return;
    if (this.totalPages <= 1) {
      this.paginationContainer.innerHTML = "";
      return;
    }

    const pagination = document.createElement("div");
    pagination.className = "pagination-buttons";

    if (this.currentPage > 0) {
      pagination.appendChild(
        this.createPageButton("<", this.currentPage - 1, "prev"),
      );
    }

    const pages = this.getVisiblePages();

    if (pages[0] > 0) {
      pagination.appendChild(this.createPageButton(1, 0));
      if (pages[0] > 1) {
        pagination.appendChild(this.createEllipsis());
      }
    }

    pages.forEach((page) => {
      pagination.appendChild(this.createPageButton(page + 1, page));
    });

    if (pages[pages.length - 1] < this.totalPages - 1) {
      if (pages[pages.length - 1] < this.totalPages - 2) {
        pagination.appendChild(this.createEllipsis());
      }
      pagination.appendChild(
        this.createPageButton(this.totalPages, this.totalPages - 1),
      );
    }

    if (this.currentPage < this.totalPages - 1) {
      pagination.appendChild(
        this.createPageButton(">", this.currentPage + 1, "next"),
      );
    }

    this.paginationContainer.innerHTML = "";
    this.paginationContainer.appendChild(pagination);
  }

  getVisiblePages() {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(0, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    return range;
  }

  createPageButton(text, page, className = "") {
    const button = document.createElement("button");
    button.className = `page-btn ${className}`;
    if (page === this.currentPage) {
      button.classList.add("active");
    }
    button.textContent = text;
    button.onclick = () => this.loadData(page);
    return button;
  }

  createEllipsis() {
    const span = document.createElement("span");
    span.className = "ellipsis";
    span.textContent = "...";
    return span;
  }

  setupEventListeners() {
    const searchInput = document.getElementById(`${this.container.id}-search`);
    if (searchInput) {
      let timeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchTerm = e.target.value;
          this.loadData(0);
        }, 300);
      });
    }

    const addBtn = document.getElementById(`${this.container.id}-add`);
    if (addBtn && this.actions.add) {
      addBtn.onclick = () => this.actions.add();
    }
  }

  refresh() {
    this.loadData(this.currentPage);
  }
}
