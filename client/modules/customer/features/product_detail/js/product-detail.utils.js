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

export const getPrimaryProductImage = (product) => {
  if (product?.image) return product.image;
  if (Array.isArray(product?.images) && product.images.length)
    return product.images[0];

  return "/modules/customer/assets/images/macbook.png";
};

export const buildGalleryImages = (product) => {
  const primaryImage = product?.image || getPrimaryProductImage(product);
  const categoryName = (product?.category?.name || "").toLowerCase();

  const categoryAssets = {
    phone: [
      "/modules/customer/assets/images/categories/phone.jpg",
      "/modules/customer/assets/images/ip17.png",
    ],
    laptop: [
      "/modules/customer/assets/images/mb_air.png",
      "/modules/customer/assets/images/laptop_mb.png",
    ],
    tablet: [
      "/modules/customer/assets/images/categories/tablet.png",
      "/modules/customer/assets/images/categories/phone.jpg",
    ],
    headphone: [
      "/modules/customer/assets/images/categories/headphone.png",
      "/modules/customer/assets/images/categories/default.png",
    ],
    default: [
      "/modules/customer/assets/images/categories/default.png",
      "/modules/customer/assets/images/categories/phone.jpg",
    ],
  };

  let assetImages = categoryAssets.default;

  if (
    categoryName.includes("phone") ||
    categoryName.includes("smartphone") ||
    categoryName.includes("điện thoại")
  ) {
    assetImages = categoryAssets.phone;
  } else if (
    categoryName.includes("macbook") ||
    categoryName.includes("laptop") ||
    categoryName.includes("notebook") ||
    categoryName.includes("máy tính") ||
    categoryName.includes("computer")
  ) {
    assetImages = categoryAssets.laptop;
  } else if (categoryName.includes("tablet")) {
    assetImages = categoryAssets.tablet;
  } else if (
    categoryName.includes("headphone") ||
    categoryName.includes("audio") ||
    categoryName.includes("tai nghe")
  ) {
    assetImages = categoryAssets.headphone;
  }

  return [primaryImage, ...assetImages.slice(0, 2)];
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
