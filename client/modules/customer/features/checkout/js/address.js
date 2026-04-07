// address.js - Address handling for checkout
import { showToast } from "/shared/ui/toast.js";
import {
  escapeHtml,
  normalizeVietnameseText,
  extractAdministrativeTokens,
} from "./utils.js";
import {
  VIETMAP_API_KEY,
  VIETMAP_SEARCH_URL,
  VIETMAP_PLACE_URL,
  PROVINCES_API_BASE_URL,
  ADDRESS_DEBOUNCE_MS,
  PROVINCES_CACHE_KEY,
  WARDS_CACHE_PREFIX,
  ADMIN_CACHE_TTL_MS,
} from "./constants.js";

let selectedAddress = null;
let addressDebounceTimer = null;
let latestAutocompleteKeyword = "";
let provincesData = [];
let wardsByProvinceCode = {};

export const getSelectedAddress = () => selectedAddress;
export const setSelectedAddress = (address) => {
  selectedAddress = address;
};

export const getSelectedCity = () => {
  const citySelect = document.getElementById("city-select");
  const selectedCode = Number(citySelect?.value);
  return (
    provincesData.find((city) => Number(city.code) === selectedCode) || null
  );
};

export const getSelectedWard = () => {
  const wardSelect = document.getElementById("ward-select");
  return wardSelect?.value || null;
};

export const getSelectedWardMeta = () => {
  const wardSelect = document.getElementById("ward-select");
  const option = wardSelect?.options?.[wardSelect.selectedIndex];
  if (!option?.value) {
    return null;
  }

  return {
    name: option.value,
    code: option.dataset.wardCode ? Number(option.dataset.wardCode) : null,
    divisionType: option.dataset.divisionType || "",
  };
};

export const setupVietnamAddressForm = async () => {
  await loadAdministrativeData();

  const citySelect = document.getElementById("city-select");
  const wardSelect = document.getElementById("ward-select");
  const addressInput = document.getElementById("address-line");

  updateAddressInputState();

  citySelect?.addEventListener("change", async () => {
    await populateWardOptions(getSelectedCityConfig());
    clearSelectedAddress();
    updateAddressInputState();
    triggerAddressSearch();
    // Dispatch event to update shipping cost
    window.dispatchEvent(new CustomEvent("addressChanged"));
  });

  wardSelect?.addEventListener("change", () => {
    clearSelectedAddress();
    updateAddressInputState();
    triggerAddressSearch();
    // Dispatch event to update shipping cost
    window.dispatchEvent(new CustomEvent("addressChanged"));
  });

  addressInput?.addEventListener("input", () => {
    clearSelectedAddress(true);
    triggerAddressSearch();
  });

  addressInput?.addEventListener("blur", () => {
    window.setTimeout(hideAddressSuggestions, 180);
  });
};

const loadAdministrativeData = async () => {
  const citySelect = document.getElementById("city-select");
  const wardSelect = document.getElementById("ward-select");

  if (citySelect) {
    citySelect.innerHTML = '<option value="">Dang tai thanh pho...</option>';
  }
  if (wardSelect) {
    wardSelect.innerHTML = '<option value="">Chon thanh pho truoc</option>';
  }

  try {
    const cachedProvinces = readCache(PROVINCES_CACHE_KEY);
    if (cachedProvinces) {
      provincesData = cachedProvinces;
    } else {
      const response = await fetch(`${PROVINCES_API_BASE_URL}/?depth=1`);
      if (!response.ok) {
        throw new Error("Failed to load provinces.");
      }

      const payload = await response.json();
      provincesData = normalizeProvinceList(payload);
      writeCache(PROVINCES_CACHE_KEY, provincesData);
    }

    populateCityOptions();
    await populateWardOptions(getSelectedCityConfig());
  } catch (error) {
    console.error("Failed to load administrative data:", error);
    showToast("Khong the tai danh sach thanh pho/phuong luc nay.", "warning");

    if (citySelect) {
      citySelect.innerHTML =
        '<option value="">Khong tai duoc thanh pho</option>';
    }
    if (wardSelect) {
      wardSelect.innerHTML =
        '<option value="">Khong tai duoc phuong xa</option>';
    }
  }
};

const populateCityOptions = () => {
  const citySelect = document.getElementById("city-select");
  if (!citySelect) return;

  citySelect.innerHTML = provincesData
    .map(
      (city) => `
      <option value="${city.code}" ${isDefaultHanoi(city) ? "selected" : ""}>
        ${city.name}
      </option>
    `,
    )
    .join("");
};

const populateWardOptions = async (cityConfig) => {
  const wardSelect = document.getElementById("ward-select");
  if (!wardSelect || !cityConfig) return;

  wardSelect.innerHTML = '<option value="">Dang tai phuong xa...</option>';

  try {
    const wards = await loadWardOptions(cityConfig.code);

    wardSelect.innerHTML = ["Chon phuong/xa", ...wards.map((ward) => ward.name)]
      .map((ward, index) => {
        const selected = index === 0 ? "selected" : "";
        const value = index === 0 ? "" : ward;
        const wardMeta =
          index === 0 ? null : wards.find((item) => item.name === ward);
        return `<option value="${escapeHtml(value)}" data-ward-code="${escapeHtml(String(wardMeta?.code || ""))}" data-division-type="${escapeHtml(wardMeta?.divisionType || "")}" ${selected}>${ward}</option>`;
      })
      .join("");
  } catch (error) {
    console.error("Failed to load wards:", error);
    wardSelect.innerHTML = '<option value="">Khong tai duoc phuong xa</option>';
    showToast(
      "Khong the tai danh sach phuong xa cua thanh pho da chon.",
      "warning",
    );
  }
};

const loadWardOptions = async (provinceCode) => {
  const numericProvinceCode = Number(provinceCode);
  const memoryCached = wardsByProvinceCode[numericProvinceCode];
  if (memoryCached?.length) {
    return memoryCached;
  }

  const cacheKey = `${WARDS_CACHE_PREFIX}${numericProvinceCode}`;
  const storageCached = readCache(cacheKey);
  if (storageCached) {
    wardsByProvinceCode[numericProvinceCode] = storageCached;
    return storageCached;
  }

  const response = await fetch(
    `${PROVINCES_API_BASE_URL}/p/${numericProvinceCode}?depth=2`,
  );
  if (!response.ok) {
    throw new Error("Failed to load wards.");
  }

  const payload = await response.json();
  const wards = extractWardOptions(payload);
  wardsByProvinceCode[numericProvinceCode] = wards;
  writeCache(cacheKey, wards);
  return wards;
};

const normalizeProvinceList = (payload) =>
  (Array.isArray(payload) ? payload : [])
    .map((province) => ({
      code: province.code,
      name: province.name,
      divisionType: province.division_type,
    }))
    .sort((left, right) => {
      if (isDefaultHanoi(left)) return -1;
      if (isDefaultHanoi(right)) return 1;
      return left.name.localeCompare(right.name, "vi");
    });

const getSelectedCityConfig = () => {
  const citySelect = document.getElementById("city-select");
  const selectedCode = Number(citySelect?.value);
  return (
    provincesData.find((city) => Number(city.code) === selectedCode) ||
    provincesData.find((city) => isDefaultHanoi(city)) ||
    provincesData[0]
  );
};

const extractWardOptions = (provincePayload) => {
  const directWards = Array.isArray(provincePayload?.wards)
    ? provincePayload.wards
    : [];

  if (directWards.length) {
    return directWards
      .map((ward) => ({
        code: ward.code,
        name: ward.name,
        divisionType: ward.division_type,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "vi"));
  }

  const nestedWards = Array.isArray(provincePayload?.districts)
    ? provincePayload.districts.flatMap((district) => district.wards || [])
    : [];

  return nestedWards
    .map((ward) => ({
      code: ward.code,
      name: ward.name,
      divisionType: ward.division_type,
    }))
    .filter(
      (ward, index, collection) =>
        collection.findIndex((item) => item.code === ward.code) === index,
    )
    .sort((left, right) => left.name.localeCompare(right.name, "vi"));
};

const isDefaultHanoi = (city) =>
  normalizeVietnameseText(city?.name) === "ha noi";

const readCache = (key) => {
  try {
    const rawValue = sessionStorage.getItem(key);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data ?? null;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
      }),
    );
  } catch {
    // Ignore storage quota or private mode issues.
  }
};

const triggerAddressSearch = () => {
  const addressInput = document.getElementById("address-line");
  const keyword = addressInput?.value?.trim() || "";

  if (!canEnterSpecificAddress()) {
    hideAddressSuggestions();
    toggleAddressLoading(false);
    return;
  }

  window.clearTimeout(addressDebounceTimer);

  if (keyword.length < 2) {
    hideAddressSuggestions();
    toggleAddressLoading(false);
    return;
  }

  addressDebounceTimer = window.setTimeout(() => {
    searchSpecificAddress(keyword);
  }, ADDRESS_DEBOUNCE_MS);
};

const searchSpecificAddress = async (keyword) => {
  latestAutocompleteKeyword = keyword;
  toggleAddressLoading(true);

  try {
    const params = new URLSearchParams({
      apikey: VIETMAP_API_KEY,
      text: keyword,
      display_type: "1",
    });
    const response = await fetch(`${VIETMAP_SEARCH_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error("VietMap service is temporarily unavailable.");
    }

    const payload = await response.json();
    const suggestions = filterAddressSuggestions(payload || []);

    if (latestAutocompleteKeyword !== keyword) {
      return;
    }

    renderAddressSuggestions(suggestions);
  } catch (error) {
    console.error("VietMap autocomplete failed:", error);
    renderAddressSuggestions(
      [],
      "Khong the tai goi y dia chi luc nay. Vui long thu lai nhe.",
    );
  } finally {
    if (latestAutocompleteKeyword === keyword) {
      toggleAddressLoading(false);
    }
  }
};

const filterAddressSuggestions = (items) => {
  const selectedCity = getSelectedCityConfig()?.name || "Hà Nội";
  const selectedWard = document.getElementById("ward-select")?.value || "";

  return items
    .map((item) => ({
      refId: item.ref_id,
      display: item.display || "",
      address: extractSpecificAddress(item),
      ward: extractWardName(item),
      city: extractCityName(item),
    }))
    .filter(
      (item) =>
        normalizeVietnameseText(item.city) ===
        normalizeVietnameseText(selectedCity),
    )
    .filter((item) => matchesSelectedWard(item.ward, selectedWard));
};

const extractWardName = (item) => {
  if (item.boundary?.ward) return item.boundary.ward;
  if (item.boundary?.full_ward) return item.boundary.full_ward;

  const boundaries = Array.isArray(item.boundaries) ? item.boundaries : [];
  const wardBoundary = boundaries.find(
    (boundary) => Number(boundary.type) === 2,
  );
  return wardBoundary?.full_name || wardBoundary?.name || "";
};

const extractCityName = (item) => {
  if (item.boundary?.city) return item.boundary.city;
  if (item.city) return item.city;

  const boundaries = Array.isArray(item.boundaries) ? item.boundaries : [];
  const cityBoundary =
    boundaries.find((boundary) => Number(boundary.type) === 0) ||
    boundaries.find((boundary) => Number(boundary.type) === 1);
  return cityBoundary?.full_name || cityBoundary?.name || "";
};

const extractSpecificAddress = (item) => {
  if (item.name && String(item.name).trim()) {
    return String(item.name).trim();
  }

  return extractSpecificAddressFromDisplay(
    item.display || item.address || "",
    extractWardName(item),
    extractCityName(item),
  );
};

const renderAddressSuggestions = (suggestions, errorMessage = "") => {
  const container = document.getElementById("address-suggestions");
  if (!container) return;

  if (errorMessage) {
    container.innerHTML = `<div class="address-suggestion-empty">${errorMessage}</div>`;
    container.classList.add("is-visible");
    return;
  }

  if (!suggestions.length) {
    container.innerHTML =
      '<div class="address-suggestion-empty">Không tìm thấy địa chỉ</div>';
    container.classList.add("is-visible");
    return;
  }

  container.innerHTML = suggestions
    .map(
      (item, index) => `
        <div
          class="address-suggestion-item ${index === 0 ? "is-active" : ""}"
          data-ref-id="${escapeHtml(item.refId || "")}"
          data-display="${escapeHtml(item.display)}"
          data-address="${escapeHtml(item.address)}"
          data-ward="${escapeHtml(item.ward)}"
          data-city="${escapeHtml(item.city)}"
        >
          <span class="address-suggestion-main">${escapeHtml(item.display)}</span>
          <span class="address-suggestion-sub">${escapeHtml(
            [item.address, item.ward, item.city].filter(Boolean).join(" | "),
          )}</span>
        </div>
      `,
    )
    .join("");

  container.classList.add("is-visible");

  container.querySelectorAll(".address-suggestion-item").forEach((node) => {
    node.addEventListener("click", () => selectAddressSuggestion(node));
  });
};

const selectAddressSuggestion = async (node) => {
  const refId = node.dataset.refId || "";
  const fallbackData = {
    display: node.dataset.display || "",
    address: node.dataset.address || "",
    ward: node.dataset.ward || "",
    city: node.dataset.city || "",
  };

  toggleAddressLoading(true);

  try {
    const placeDetail = await fetchPlaceDetail(refId);
    selectedAddress = {
      display: placeDetail.display || fallbackData.display,
      address: resolvePlaceSpecificAddress(placeDetail, fallbackData),
      ward: placeDetail.ward || fallbackData.ward,
      city: placeDetail.city || fallbackData.city,
      lat: placeDetail.lat ?? null,
      lng: placeDetail.lng ?? null,
    };
  } catch (error) {
    console.error("Failed to load place detail:", error);
    selectedAddress = {
      display: fallbackData.display,
      address: fallbackData.address,
      ward: fallbackData.ward,
      city: fallbackData.city,
      lat: null,
      lng: null,
    };
    showToast(
      "Khong the tai chi tiet dia chi. He thong se dung thong tin co ban.",
      "warning",
    );
  } finally {
    toggleAddressLoading(false);
  }

  applySelectedAddress();
};

const fetchPlaceDetail = async (refId) => {
  if (!refId) {
    throw new Error("Missing refId for place detail.");
  }

  const params = new URLSearchParams({
    apikey: VIETMAP_API_KEY,
    refid: refId,
  });
  const response = await fetch(`${VIETMAP_PLACE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to load address detail.");
  }

  return response.json();
};

const resolvePlaceSpecificAddress = (placeDetail, fallbackData) => {
  if (placeDetail.address && String(placeDetail.address).trim()) {
    return String(placeDetail.address).trim();
  }

  if (placeDetail.name && String(placeDetail.name).trim()) {
    return String(placeDetail.name).trim();
  }

  const extractedFromDisplay = extractSpecificAddressFromDisplay(
    placeDetail.display || "",
    placeDetail.ward || fallbackData.ward,
    placeDetail.city || fallbackData.city,
  );

  return extractedFromDisplay || fallbackData.address || fallbackData.display;
};

const extractSpecificAddressFromDisplay = (display, ward, city) => {
  const rawDisplay = String(display || "").trim();
  if (!rawDisplay) {
    return "";
  }

  const separators = [
    `,${ward || ""},${city || ""}`,
    `, ${ward || ""}, ${city || ""}`,
    `${ward || ""},${city || ""}`,
    `${ward || ""}, ${city || ""}`,
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  for (const separator of separators) {
    if (rawDisplay.endsWith(separator)) {
      return rawDisplay
        .slice(0, rawDisplay.length - separator.length)
        .replace(/[,\\s]+$/, "")
        .trim();
    }
  }

  const parts = rawDisplay
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return parts.slice(0, parts.length - 2).join(", ");
  }

  if (parts.length >= 2) {
    return parts[0];
  }

  return rawDisplay;
};

const applySelectedAddress = () => {
  const addressInput = document.getElementById("address-line");
  const addressHidden = document.getElementById("address");

  if (!selectedAddress) {
    return;
  }

  const fullAddress = selectedAddress.display || buildManualShippingAddress();

  if (addressInput) {
    addressInput.value =
      selectedAddress.address || selectedAddress.display || "";
  }
  if (addressHidden) {
    addressHidden.value = fullAddress;
  }

  setAddressValidity("");

  hideAddressSuggestions();

  // Dispatch event to update shipping cost
  window.dispatchEvent(new CustomEvent("addressChanged"));
};

const clearSelectedAddress = (keepInput = false) => {
  selectedAddress = null;
  document.getElementById("address").value = "";

  if (!keepInput) {
    const addressInput = document.getElementById("address-line");
    if (addressInput) {
      addressInput.value = "";
    }
  }

  if (keepInput) {
    setAddressValidity("Vui long chon mot dia chi hop le tu danh sach goi y.");
  } else {
    setAddressValidity(
      canEnterSpecificAddress()
        ? "Vui long chon mot dia chi hop le tu danh sach goi y."
        : "Hay chon thanh pho va phuong/xa truoc.",
    );
  }
};

const buildManualShippingAddress = () => {
  const addressLine =
    document.getElementById("address-line")?.value?.trim() || "";
  const ward = document.getElementById("ward-select")?.value?.trim() || "";
  const cityName = getSelectedCityConfig()?.name || "";

  return [addressLine, ward, cityName].filter(Boolean).join(", ");
};

const toggleAddressLoading = (visible) => {
  const loading = document.getElementById("address-loading");
  if (!loading) return;
  loading.classList.toggle("is-visible", visible);
};

const hideAddressSuggestions = () => {
  const container = document.getElementById("address-suggestions");
  if (!container) return;
  container.classList.remove("is-visible");
  container.innerHTML = "";
};

const canEnterSpecificAddress = () => {
  const citySelect = document.getElementById("city-select");
  const wardSelect = document.getElementById("ward-select");
  return Boolean(citySelect?.value && wardSelect?.value);
};

const updateAddressInputState = () => {
  const addressInput = document.getElementById("address-line");
  if (!addressInput) {
    return;
  }

  const enabled = canEnterSpecificAddress();
  addressInput.disabled = !enabled;
  addressInput.placeholder = enabled
    ? "Example: 12 Hang Bong"
    : "Select city and ward/commune first";

  if (!enabled) {
    hideAddressSuggestions();
    toggleAddressLoading(false);
    setAddressValidity("Hay chon thanh pho va phuong/xa truoc.");
    return;
  }

  setAddressValidity(
    selectedAddress
      ? ""
      : "Vui long chon mot dia chi hop le tu danh sach goi y.",
  );
};

const setAddressValidity = (message) => {
  const addressInput = document.getElementById("address-line");
  if (!addressInput) {
    return;
  }

  addressInput.setCustomValidity(message || "");
};

const matchesSelectedWard = (vietmapWard, selectedWard) => {
  if (!selectedWard) {
    return true;
  }

  const normalizedSelectedWard = normalizeVietnameseText(selectedWard);
  const normalizedVietmapWard = normalizeVietnameseText(vietmapWard);

  if (normalizedSelectedWard === normalizedVietmapWard) {
    return true;
  }

  const selectedTokens = extractAdministrativeTokens(selectedWard);
  const vietmapTokens = extractAdministrativeTokens(vietmapWard);

  if (!selectedTokens.length || !vietmapTokens.length) {
    return false;
  }

  return (
    selectedTokens.every((token) => vietmapTokens.includes(token)) ||
    vietmapTokens.every((token) => selectedTokens.includes(token))
  );
};

export const isSelectedAddressValid = () => {
  if (!selectedAddress) {
    return false;
  }

  const selectedCity = getSelectedCityConfig()?.name || "";
  const selectedWard = document.getElementById("ward-select")?.value || "";

  return (
    normalizeVietnameseText(selectedAddress.city) ===
      normalizeVietnameseText(selectedCity) &&
    matchesSelectedWard(selectedAddress.ward, selectedWard)
  );
};
