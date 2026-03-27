export const GLOBAL_FILTER_KEYS = {
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  brand: "brandId",
  sort: "sort",
};

export const FILTER_CONFIG = {
  laptop: {
    filters: [
      {
        key: "cpuBrand",
        label: "CPU Brand",
        type: "select",
        multiple: true,
        attributeName: "CPU_Company",
      },
      {
        key: "cpuType",
        label: "CPU",
        type: "select",
        multiple: true,
        attributeName: "CPU_Type",
      },
      {
        key: "gpuBrand",
        label: "GPU Brand",
        type: "select",
        multiple: true,
        attributeName: "GPU_Company",
      },
      {
        key: "gpuType",
        label: "GPU",
        type: "select",
        multiple: true,
        attributeName: "GPU_Type",
      },
      {
        key: "ram",
        label: "RAM",
        type: "select",
        multiple: true,
        attributeName: "RAM (GB)",
        formatOptionLabel: (value) => `${value}GB`,
      },
      {
        key: "storage",
        label: "Storage",
        type: "select",
        multiple: true,
        attributeName: "Memory",
      },
      {
        key: "screenSize",
        label: "Screen Size",
        type: "select",
        multiple: true,
        attributeName: "Inches",
        formatOptionLabel: (value) => `${value}"`,
      },
      {
        key: "screenResolution",
        label: "Screen Resolution",
        type: "select",
        multiple: true,
        attributeName: "ScreenResolution",
      },
      {
        key: "os",
        label: "OS",
        type: "select",
        multiple: true,
        attributeName: "OpSys",
      },
      {
        key: "weightKg",
        label: "Weight",
        type: "select",
        multiple: true,
        attributeName: "Weight (kg)",
        formatOptionLabel: (value) => `${value}kg`,
      },
      {
        key: "type",
        label: "Type",
        type: "select",
        multiple: true,
        attributeName: "TypeName",
      },
    ],
  },
  smartphone: {
    filters: [
      {
        key: "chipset",
        label: "Chipset",
        type: "select",
        multiple: true,
        attributeName: "processor_brand",
      },
      {
        key: "ram",
        label: "RAM",
        type: "select",
        multiple: true,
        attributeName: "ram_capacity",
        formatOptionLabel: (value) => `${value}GB`,
      },
      {
        key: "storage",
        label: "Storage",
        type: "select",
        multiple: true,
        attributeName: "internal_memory",
        formatOptionLabel: (value) => `${value}GB`,
      },
      {
        key: "battery",
        label: "Battery",
        type: "select",
        multiple: true,
        attributeName: "battery_capacity",
        formatOptionLabel: (value) => `${value}mAh`,
      },
      {
        key: "refreshRate",
        label: "Refresh Rate",
        type: "select",
        multiple: true,
        attributeName: "refresh_rate",
        formatOptionLabel: (value) => `${value}Hz`,
      },
      {
        key: "screenSize",
        label: "Screen Size",
        type: "select",
        multiple: true,
        attributeName: "screen_size",
        formatOptionLabel: (value) => `${value}"`,
      },
      {
        key: "camera",
        label: "Rear Cameras",
        type: "select",
        multiple: true,
        attributeName: "num_rear_cameras",
        formatOptionLabel: (value) => `${value} cameras`,
      },
      {
        key: "os",
        label: "OS",
        type: "select",
        multiple: true,
        attributeName: "os",
      },
      {
        key: "is5G",
        label: "5G",
        type: "boolean",
        attributeName: "5G_or_not",
        trueValue: "1",
        trueLabel: "5G supported",
      },
    ],
  },
};

export const normalizeCategoryKey = (categoryName = "") =>
  String(categoryName).trim().toLowerCase();

export const getCategoryFilterConfig = (categoryName) => {
  const categoryKey = normalizeCategoryKey(categoryName);
  return FILTER_CONFIG[categoryKey]?.filters || [];
};

export const getFilterFieldByKey = (categoryName, filterKey) =>
  getCategoryFilterConfig(categoryName).find((field) => field.key === filterKey);
