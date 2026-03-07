import { getCategories } from "../../../core/api/category.api.js";

const categoryTable = document.getElementById("categoryTable");

const loadingTemplate = document.getElementById("loading-template");
const noDataTemplate = document.getElementById("no-data-template");
const errorTemplate = document.getElementById("error-template");
const rowTemplate = document.getElementById("category-row-template");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    showLoading();

    const categories = await getCategories();

    console.log("Loaded categories:", categories);

    if (!categories || categories.length === 0) {
      showNoData();
      return;
    }

    renderCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);

    showError();
  }
});

function showLoading() {
  categoryTable.innerHTML = "";
  categoryTable.appendChild(loadingTemplate.content.cloneNode(true));
}

function showNoData() {
  categoryTable.innerHTML = "";
  categoryTable.appendChild(noDataTemplate.content.cloneNode(true));
}

function showError() {
  categoryTable.innerHTML = "";
  categoryTable.appendChild(errorTemplate.content.cloneNode(true));
}

function renderCategories(categories) {
  categoryTable.innerHTML = "";

  categories.forEach((category) => {
    const row = rowTemplate.content.cloneNode(true);

    row.querySelector(".category-id").textContent = category.id;
    row.querySelector(".category-name").textContent = category.name;

    row.querySelector(".description").textContent = category.description || "-";

    categoryTable.appendChild(row);
  });
}
