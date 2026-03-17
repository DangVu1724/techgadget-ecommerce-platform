import { request } from "./base.api.js";

export const variantAPI = {
  getVariant: async (variantId) => {
    const res = await request(`/variants/${variantId}`);
    return normalizeVariant(res);
  },
};

function normalizeVariant(data) {
  return {
    id: data.id,
    name: data.name,
    sku: data.sku || "N/A",
    price: data.price,
    stock: data.stock,
    description: data.description,

    // fallback nếu backend null
    product: {
      id: data.productId || null,
      name: data.productName || "Unknown Product",
    },

    // convert attributes → object dễ dùng
    attributes: mapAttributes(data.attributes),
  };
}

function mapAttributes(attrs = []) {
  const result = {};

  attrs.forEach((item) => {
    result[item.attributeName] = formatAttributeValue(
      item.attributeName,
      item.value,
    );
  });

  return result;
}

function formatAttributeValue(name, value) {
  switch (name) {
    case "RAM":
      return `${value} GB`;
    case "Weight (kg)":
      return `${value} kg`;
    case "Screen Size":
      return `${value}"`;
    case "CPU_Frequency (GHz)":
      return `${value} GHz`;
    default:
      return value;
  }
}
