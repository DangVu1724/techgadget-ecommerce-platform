const HIDDEN_FILTERS = {
  smartphone: new Set(["color", "os", "screen_size"]),
  laptop: new Set(["opsys", "cpu_frequency_ghz", "os"]),
};

const LABEL_MAP = {
  typename: "Type",
  inches: "Screen Size",
  screenresolution: "Resolution",
  cpu_company: "CPU Brand",
  cpu_type: "CPU",
  ram_gb: "RAM",
  memory: "Storage",
  gpu_company: "GPU Brand",
  gpu_type: "GPU",
  weight_kg: "Weight",
  processor_brand: "Chipset",
  battery_capacity: "Battery",
  ram_capacity: "RAM",
  internal_memory: "Storage",
  refresh_rate: "Refresh Rate",
  num_rear_cameras: "Rear Cameras",
  "5g_or_not": "5G",
};

const UNIT_FORMATTERS = {
  inches: (value) => `${value}"`,
  ram_gb: (value) => `${value} GB`,
  memory: (value) => `${value} GB`,
  weight_kg: (value) => `${value} kg`,
  battery_capacity: (value) => `${value} mAh`,
  ram_capacity: (value) => `${value} GB`,
  internal_memory: (value) => `${value} GB`,
  screen_size: (value) => `${value}"`,
  refresh_rate: (value) => `${value} Hz`,
  num_rear_cameras: (value) => `${value} cameras`,
};

export const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const formatTitle = (value) =>
  String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const parseFilterValue = (value) => {
  if (value == null) return value;
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
};

const formatOptionValue = (filterName, value) => {
  const formatter = UNIT_FORMATTERS[filterName];
  if (formatter) {
    return formatter(value);
  }

  return String(value || "")
    .replaceAll("_", " ")
    .trim();
};

const toWeightBucket = (weight) => {
  const value = Number(weight);
  if (Number.isNaN(value)) return null;
  if (value < 1) return { id: "under_1kg", label: "Under 1 kg" };
  if (value < 1.5) return { id: "1_to_1_5kg", label: "1.0 - 1.5 kg" };
  if (value < 2) return { id: "1_5_to_2kg", label: "1.5 - 2.0 kg" };
  return { id: "over_2kg", label: "Over 2 kg" };
};

const buildWeightOptions = (filter) => {
  const buckets = new Map();

  filter.values.forEach((value) => {
    const bucket = toWeightBucket(value);
    if (!bucket) return;

    if (!buckets.has(bucket.id)) {
      buckets.set(bucket.id, {
        id: bucket.id,
        label: bucket.label,
        payloadValues: [],
      });
    }

    buckets.get(bucket.id).payloadValues.push(value);
  });

  return Array.from(buckets.values());
};

const buildBooleanOptions = (filter) => {
  const truthy = [];
  const falsy = [];

  filter.values.forEach((value) => {
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "co", "có"].includes(normalized)) {
      truthy.push(value);
    } else {
      falsy.push(value);
    }
  });

  const options = [];
  if (truthy.length) {
    options.push({
      id: "yes",
      label: "Có 5G",
      payloadValues: truthy,
    });
  }
  if (falsy.length) {
    options.push({
      id: "no",
      label: "Không 5G",
      payloadValues: falsy,
    });
  }
  return options;
};

const buildDefaultOptions = (filter) =>
  filter.values.map((value) => ({
    id: String(value),
    label: formatOptionValue(filter.name, value),
    payloadValues: [parseFilterValue(value)],
  }));

export const transformProductFilters = (rawFilters, categoryName) => {
  const categoryKey = normalizeCategoryKey(categoryName);
  const hiddenFilters = HIDDEN_FILTERS[categoryKey] || new Set();

  return (rawFilters || [])
    .filter((filter) => !hiddenFilters.has(filter.name))
    .map((filter) => {
      let options = buildDefaultOptions(filter);

      if (filter.name === "weight_kg") {
        options = buildWeightOptions(filter);
      }

      if (filter.name === "5g_or_not") {
        options = buildBooleanOptions(filter);
      }

      return {
        name: filter.name,
        label: LABEL_MAP[filter.name] || formatTitle(filter.name),
        options,
      };
    })
    .filter((filter) => filter.options.length);
};

export const collectAttributeFilters = (selector = ".dynamic-filter-input:checked") => {
  const attributeFilters = {};
  const uiSelections = {};

  document.querySelectorAll(selector).forEach((input) => {
    const key = input.dataset.filterName;
    if (!key) return;

    const optionId = input.value;
    const payloadValues = JSON.parse(input.dataset.payloadValues || "[]");

    if (!uiSelections[key]) {
      uiSelections[key] = [];
    }
    if (!attributeFilters[key]) {
      attributeFilters[key] = [];
    }

    uiSelections[key].push(optionId);
    payloadValues.forEach((value) => {
      if (
        !attributeFilters[key].some(
          (existing) => String(existing) === String(value),
        )
      ) {
        attributeFilters[key].push(value);
      }
    });
  });

  return {
    attributeFilters,
    uiSelections,
  };
};
