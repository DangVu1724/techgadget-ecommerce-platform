import { categoryApi } from "/client/modules/customer/core/api/category.api.js";
import { brandApi } from "/client/modules/customer/core/api/brand.api.js";
import { productApi } from "/client/modules/customer/core/api/product.api.js";

const categoryImages = {
  //   smartphone: "/assets/images/categories/smartphone.png",
  //   laptop: "/assets/images/categories/laptop.png",
  //   headphone: "/assets/images/categories/headphone.png",
  //   tablet: "/assets/images/categories/tablet.png",
  //   camera: "/assets/images/categories/camera.png",
};

async function loadCategories() {
  const container = document.getElementById("categoryList");

  const categories = await categoryApi.getAll();

  container.innerHTML = "";

  categories.forEach((category) => {
    const key = category.name.toLowerCase();

    const image =
      categoryImages[key] ||
      "/client/modules/customer/assets/images/categories/default.png";

    const card = document.createElement("div");
    card.className = "cat-card";

    card.innerHTML = `
      <img src="${image}" alt="${category.name}">
      <p>${category.name}</p>
    `;

    container.appendChild(card);
  });
}

async function loadBrands() {
  const container = document.getElementById("brandList");
  const brands = await brandApi.getAll();

  container.innerHTML = "";

  brands.forEach((brand) => {
    const item = document.createElement("span");

    item.className = "brand-item";
    item.textContent = capitalizeFirstLetter(brand.brandName);

    container.appendChild(item);
  });
}

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

async function loadNewProducts() {
  const container = document.getElementById("newProductList");

  try {
    const res = await productApi.getAll({
      page: 0,
      size: 5,
    });

    const products = res.content;

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-main";

      const image =
        product.thumbnail ||
        "/client/modules/customer/assets/images/macbook.png";

      card.innerHTML = `
        <img src="${image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>${formatPrice(product.minPrice)}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadBestSellingProducts() {
  const container = document.getElementById("bestSellingProductList");

  try {
    const res = await productApi.getAll({
      page: 0,
      size: 5,
    });

    const products = res.content;

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-main";

      const image =
        product.thumbnail ||
        "/client/modules/customer/assets/images/macbook.png";

      card.innerHTML = `
        <img src="${image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>${formatPrice(product.minPrice)}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}
async function initHome() {
  await Promise.all([
    loadCategories(),
    loadBrands(),
    loadNewProducts(),
    loadBestSellingProducts(),
  ]);
}

document.addEventListener("DOMContentLoaded", initHome);

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
