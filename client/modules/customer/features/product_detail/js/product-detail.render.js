import {
  getColorsFromGroup,
  buildSmartphoneGroupLabel,
  buildRegularVariantLabel,
  getRamFromVariant,
  getStorageFromVariant,
  getColorFromVariant,
  formatPrice,
  formatStock,
  setText,
} from "./product-detail.utils.js";

// ==================== RENDER FUNCTIONS ====================
export const renderVariations = (
  containerId,
  items,
  onSelect,
  isColorOption = false,
) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!items || items.length === 0) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "v-btn active";
    btn.textContent = "Default";
    container.appendChild(btn);
    return;
  }

  items.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `v-btn ${index === 0 ? "active" : ""}`;

    if (typeof item === "object") {
      btn.textContent = item.label || item.name || "Option";
      btn.dataset.value = item.value || item.name || "";

      if (isColorOption && item.name) {
        btn.classList.add("color");
        container.classList.add("color-options");

        const colorStyles = {
          Black: "#000000",
          White: "#FFFFFF",
          Silver: "#C0C0C0",
          Gray: "#808080",
          Red: "#FF3B30",
          Blue: "#007AFF",
          Green: "#34C759",
          Yellow: "#FFD60A",
          Purple: "#AF52DE",
          Pink: "#FF2D55",
          Gold: "#D4AF37",
        };

        const colorCode = colorStyles[item.name] || "#ccc";

        btn.style.background = colorCode;
        btn.dataset.color = item.name;
        btn.textContent = "";
      }
    } else {
      btn.textContent = String(item);
      btn.dataset.value = String(item);
    }

    btn.addEventListener("click", function () {
      container
        .querySelectorAll(".v-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      if (typeof onSelect === "function") {
        onSelect(item.value || item);
      }
    });

    container.appendChild(btn);
  });
};

export const renderSmartphoneGroups = (groups, product, onGroupSelect) => {
  const container = document.getElementById("variantOptions");
  if (!container) return;

  container.innerHTML = "";

  const groupArray = Array.from(groups.values());

  groupArray.forEach((group, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `v-btn ${index === 0 ? "active" : ""}`;
    btn.textContent = buildSmartphoneGroupLabel(product.name, group);
    btn.dataset.groupKey = group.id;

    btn.addEventListener("click", function () {
      container
        .querySelectorAll(".v-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      if (typeof onGroupSelect === "function") {
        onGroupSelect(group);
      }
    });

    container.appendChild(btn);
  });
};

export const renderSmartphoneColors = (group, onColorSelect) => {
  const container = document.getElementById("colorOptions");
  if (!container) return;

  const colors = getColorsFromGroup(group);

  if (colors.length === 0) {
    container.innerHTML =
      '<button class="v-btn active">No color options</button>';
    return;
  }

  const colorItems = colors.map((c) => ({
    label: c.name,
    value: c.variant,
    name: c.name,
  }));

  renderVariations(
    "colorOptions",
    colorItems,
    (variant) => {
      if (typeof onColorSelect === "function") {
        onColorSelect(variant);
      }
    },
    true,
  );
};

export const renderRegularVariants = (variants, product, onVariantSelect) => {
  const container = document.getElementById("variantOptions");
  if (!container) return;

  if (!variants || variants.length === 0) {
    container.innerHTML = '<button class="v-btn active">Default</button>';
    return;
  }

  const variantItems = variants.map((v) => ({
    label: buildRegularVariantLabel(product.name, v),
    value: v,
  }));

  renderVariations("variantOptions", variantItems, (variant) => {
    if (typeof onVariantSelect === "function") {
      onVariantSelect(variant);
    }
  });

  const colorContainer = document.getElementById("colorOptions");
  if (colorContainer) {
    colorContainer.innerHTML = "";
    const colorLabel = colorContainer
      .closest(".p-variation")
      ?.querySelector(".v-label");
    if (colorLabel) colorLabel.style.display = "none";
  }
};

// ==================== ATTRIBUTES TABLE ====================
export const updateAttributesTable = (attributes) => {
  const container = document.getElementById("attributeTableContainer");
  if (!container) return;

  if (!attributes?.length) {
    container.innerHTML = '<p class="text-muted">No attributes available.</p>';
    return;
  }

  const filteredAttributes = attributes.filter(
    (attr) => attr.attributeName?.toLowerCase() !== "color",
  );

  if (filteredAttributes.length === 0) {
    container.innerHTML = '<p class="text-muted">No additional attributes.</p>';
    return;
  }

  const rows = filteredAttributes
    .map((attr) => {
      const name = attr.attributeName || "Attribute";
      const value = attr.value || "-";
      return `<tr><td>${name}</td><td>${value}</td></tr>`;
    })
    .join("");

  container.innerHTML = `
        <table class="attribute-table">
            <thead>
                <tr><th>Attribute</th><th>Value</th></tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

// ==================== GALLERY ====================
export const updateThumbnails = (images) => {
  const thumbs = document.querySelectorAll(".thumb");
  const mainImg = document.getElementById("mainImg");

  if (!thumbs.length || !mainImg) return;

  const defaultImage =
    images?.[0] || "/modules/customer/assets/images/macbook.png";

  thumbs.forEach((thumb, index) => {
    thumb.src = images?.[index] || defaultImage;
    thumb.alt = `Product thumbnail ${index + 1}`;

    thumb.addEventListener("click", function () {
      mainImg.src = this.src;
      thumbs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });

  mainImg.src = defaultImage;
};

// ==================== VARIANT DETAIL ====================
export const updateVariantDetail = (product, variant) => {
  if (!variant) {
    setText("#selectedVariantLabel", "");
    updateAttributesTable(product.attributes || []);
    return;
  }

  const attrs = variant.attributes || [];
  const ram = getRamFromVariant(variant);
  const storage = getStorageFromVariant(variant);
  const color = getColorFromVariant(variant);

  const selectedParts = [];
  if (variant.name) selectedParts.push(variant.name);
  if (ram) selectedParts.push(`${ram}GB RAM`);
  if (storage) selectedParts.push(`${storage}GB Storage`);
  if (color) selectedParts.push(color);

  setText(
    "#selectedVariantLabel",
    selectedParts.length ? `${selectedParts.join(" • ")}` : "",
  );

  updateAttributesTable(attrs.length ? attrs : product.attributes || []);

  setText("#productPrice", formatPrice(variant.price));
  setText("#productStock", formatStock(variant.stock));
};
