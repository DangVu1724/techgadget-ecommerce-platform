// ==================== UTILITY FUNCTIONS ====================
export const setText = (selector, text) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = text || "";
};

export const formatPrice = (price) => {
  return price ? `$${Number(price).toFixed(2)}` : "$0.00";
};

export const formatStock = (stock) => {
  return stock ? `${stock} in stock` : "Out of stock";
};

export const getAttributeValue = (attributes, attributeName) => {
  if (!attributes || !Array.isArray(attributes)) return null;

  const attr = attributes.find(
    (a) => a.attributeName?.toLowerCase() === attributeName.toLowerCase(),
  );

  return attr?.value || null;
};

export const getColorFromVariant = (variant) => {
  return getAttributeValue(variant.attributes, "Color");
};

export const getRamFromVariant = (variant) => {
  return getAttributeValue(variant.attributes, "RAM");
};

export const getStorageFromVariant = (variant) => {
  return getAttributeValue(variant.attributes, "Storage");
};

// ==================== CATEGORY DETECTION ====================
export const isSmartphoneCategory = (category) => {
  if (!category) return false;

  if (category.id === 2) return true;

  const smartphoneKeywords = [
    "smartphone",
    "phone",
    "điện thoại",
    "mobile",
    "iphone",
    "android",
  ];
  const categoryName = (category.name || "").toLowerCase();

  return smartphoneKeywords.some((keyword) => categoryName.includes(keyword));
};

// ==================== VARIANT HANDLING FOR SMARTPHONES ====================
export const getSmartphoneVariantKey = (variant) => {
  const ram = getRamFromVariant(variant) || "";
  const storage = getStorageFromVariant(variant) || "";

  return `${ram}_${storage}`.toLowerCase().trim();
};

export const groupSmartphoneVariants = (variants) => {
  const groups = new Map();

  variants.forEach((variant) => {
    const key = getSmartphoneVariantKey(variant);

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        specs: {
          ram: getRamFromVariant(variant),
          storage: getStorageFromVariant(variant),
        },
        variants: [],
        price: variant.price,
        sku: variant.sku,
        description: variant.description,
      });
    }

    groups.get(key).variants.push(variant);
  });

  return groups;
};

export const buildSmartphoneGroupLabel = (productName, group) => {
  const parts = [productName || "Product"];

  if (group.specs.ram) parts.push(`${group.specs.ram}GB RAM`);
  if (group.specs.storage) parts.push(`${group.specs.storage}GB Storage`);

  return parts.join(" - ");
};

export const getColorsFromGroup = (group) => {
  const colors = [];

  group.variants.forEach((variant) => {
    const color = getColorFromVariant(variant);
    if (color && !colors.includes(color)) {
      colors.push({
        name: color,
        variant: variant,
      });
    }
  });

  return colors;
};

// ==================== VARIANT HANDLING FOR OTHER PRODUCTS ====================
export const buildRegularVariantLabel = (productName, variant) => {
  if (!variant) return "Default";

  const ram = getRamFromVariant(variant);
  const storage = getStorageFromVariant(variant);
  const color = getColorFromVariant(variant);

  const parts = [productName || "Product"];

  if (ram) parts.push(`${ram}GB RAM`);
  if (storage) parts.push(`${storage}GB`);
  if (color && !parts.includes(color)) parts.push(color);

  return parts.join(" - ");
};
