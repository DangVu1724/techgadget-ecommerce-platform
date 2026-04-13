import { cartAPI } from "/modules/customer/core/api/cart.api.js";
import { authAPI } from "/modules/customer/core/api/auth.api.js";
import { variantAPI } from "/modules/customer/core/api/variant.api.js";
import { checkoutAPI } from "/modules/customer/core/api/checkout.api.js";
import { couponAPI } from "/modules/customer/core/api/coupon.api.js";
import { showLoginModal } from "/modules/customer/components/login-modal/login-modal.js";
import { showToast } from "/shared/ui/toast.js";

let cartData = null;
let appliedCoupon = null;
let checkoutCoupons = [];
const PENDING_QR_KEY = "pendingQrTransactionId";
const BUY_NOW_KEY = "buyNowCheckoutItem";
const VIETMAP_API_KEY = "2afbba12ee7bbd16f433f5c982e4efef2001935467f8f540";
const VIETMAP_SEARCH_URL = "https://maps.vietmap.vn/api/search/v4";
const VIETMAP_PLACE_URL = "https://maps.vietmap.vn/api/place/v4";
const PROVINCES_API_BASE_URL = "https://provinces.open-api.vn/api/v2";
const ADDRESS_DEBOUNCE_MS = 300;
const PROVINCES_CACHE_KEY = "checkoutProvincesV2";
const WARDS_CACHE_PREFIX = "checkoutWardsV2:";
const ADMIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let selectedAddress = null;
let addressDebounceTimer = null;
let latestAutocompleteKeyword = "";
let provincesData = [];
let wardsByProvinceCode = {};
const checkoutMode =
  new URLSearchParams(window.location.search).get("mode") === "buy-now"
    ? "buy-now"
    : "cart";

const loadCartData = async () => {
  if (checkoutMode === "buy-now") {
    loadBuyNowData();
    return;
  }

  if (!authAPI.isLoggedIn()) {
    await showLoginModal(() => {
      window.location.href = "/login";
    });
    return;
  }

  try {
    const data = await cartAPI.getCart();
    cartData = data;

    if (data.items?.length) {
      cartData.items = await Promise.all(
        data.items.map(async (item) => {
          try {
            const variant = await variantAPI.getVariant(item.variantId);
            return { ...item, variant };
          } catch (error) {
            console.warn(`Failed to load variant ${item.variantId}:`, error);
            return item;
          }
        }),
      );
    }

    renderOrderSummary();
    prefillUserInfo();
    loadCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load checkout cart:", error);
    showToast("Unable to load checkout data.", "error");
    window.location.href = "/cart";
  }
};

const loadBuyNowData = () => {
  const rawItem = sessionStorage.getItem(BUY_NOW_KEY);
  if (!rawItem) {
    showToast("No Buy Now item found.", "warning");
    window.location.href = "/home";
    return;
  }

  try {
    const item = JSON.parse(rawItem);
    cartData = {
      mode: "buy-now",
      items: [
        {
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          variantName: item.variantName,
          image: item.image,
        },
      ],
    };

    renderOrderSummary();
    prefillUserInfo(item);
    loadCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load Buy Now checkout:", error);
    showToast("Unable to load Buy Now checkout.", "error");
    sessionStorage.removeItem(BUY_NOW_KEY);
    window.location.href = "/home";
  }
};

const renderOrderSummary = () => {
  const container = document.getElementById("order-items-container");

  if (!cartData?.items?.length) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #999;">
        <i class="fa-solid fa-shopping-cart" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
        <p>Your cart is empty.</p>
        <a href="/shop" style="color: #ff6b6b; text-decoration: none;">Continue Shopping →</a>
      </div>
    `;
    updateSummaryTotals(0);
    return;
  }

  container.innerHTML = cartData.items
    .map(
      (item) => `
      <div class="summary-item">
        <span class="item-name">${escapeHtml(item.productName)}${item.variantName ? ` - ${escapeHtml(item.variantName)}` : ""}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${formatPrice(parseFloat(item.price) * item.quantity)}</span>
      </div>
    `,
    )
    .join("");

  updateSummaryTotals();
};

const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const calculateSubtotal = () =>
  cartData?.items?.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  ) || 0;

const calculateShipping = (subtotal) => (subtotal > 99 ? 0 : 10);

const updateSummaryTotals = () => {
  const subtotal = calculateSubtotal();
  const shippingCost = calculateShipping(subtotal);
  const discountAmount = appliedCoupon?.discountAmount
    ? Number(appliedCoupon.discountAmount)
    : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const total = discountedSubtotal + shippingCost;

  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("summary-shipping").textContent = 
    shippingCost === 0 ? "FREE" : formatPrice(shippingCost);

  const discountRow = document.getElementById("summary-discount-row");
  const discountValue = document.getElementById("summary-discount");
  if (discountRow && discountValue) {
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      discountValue.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  document.getElementById("summary-total").textContent = formatPrice(total);
};

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const prefillUserInfo = (overrideUser = null) => {
  const user = overrideUser || authAPI.getUser();
  if (!user) {
    return;
  }

  if (user.fullName) document.getElementById("fullName").value = user.fullName;
  if (user.email) document.getElementById("email").value = user.email;
  if (user.phone) document.getElementById("phone").value = user.phone;
  if (user.address) {
    document.getElementById("address-line").value = user.address;
    document.getElementById("address").value = user.address;
  }
};

const setupVietnamAddressForm = async () => {
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
  });

  wardSelect?.addEventListener("change", () => {
    clearSelectedAddress();
    updateAddressInputState();
    triggerAddressSearch();
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
      citySelect.innerHTML = '<option value="">Khong tai duoc thanh pho</option>';
    }
    if (wardSelect) {
      wardSelect.innerHTML = '<option value="">Khong tai duoc phuong xa</option>';
    }
  }
};

const populateCityOptions = () => {
  const citySelect = document.getElementById("city-select");
  if (!citySelect) return;

  citySelect.innerHTML = provincesData.map(
    (city) => `
      <option value="${city.code}" ${isDefaultHanoi(city) ? "selected" : ""}>
        ${city.name}
      </option>
    `,
  ).join("");
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
        return `<option value="${escapeHtml(value)}" ${selected}>${ward}</option>`;
      })
      .join("");
  } catch (error) {
    console.error("Failed to load wards:", error);
    wardSelect.innerHTML = '<option value="">Khong tai duoc phuong xa</option>';
    showToast("Khong the tai danh sach phuong xa cua thanh pho da chon.", "warning");
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
    renderAddressSuggestions([], "Khong the tai goi y dia chi luc nay. Vui long thu lai nhe.");
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
    .filter((item) => normalizeVietnameseText(item.city) === normalizeVietnameseText(selectedCity))
    .filter((item) => matchesSelectedWard(item.ward, selectedWard));
};

const extractWardName = (item) => {
  if (item.boundary?.ward) return item.boundary.ward;
  if (item.boundary?.full_ward) return item.boundary.full_ward;

  const boundaries = Array.isArray(item.boundaries) ? item.boundaries : [];
  const wardBoundary = boundaries.find((boundary) => Number(boundary.type) === 2);
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
    showToast("Khong the tai chi tiet dia chi. He thong se dung thong tin co ban.", "warning");
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
      return rawDisplay.slice(0, rawDisplay.length - separator.length).replace(/[,\\s]+$/, "").trim();
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
    addressInput.value = selectedAddress.address || selectedAddress.display || "";
  }
  if (addressHidden) {
    addressHidden.value = fullAddress;
  }

  setAddressValidity("");

  hideAddressSuggestions();
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
    setAddressValidity(canEnterSpecificAddress()
      ? "Vui long chon mot dia chi hop le tu danh sach goi y."
      : "Hay chon thanh pho va phuong/xa truoc.");
  }
};

const buildManualShippingAddress = () => {
  const addressLine = document.getElementById("address-line")?.value?.trim() || "";
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

const normalizeVietnameseText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/thanh pho|tp\.?/gi, "")
    .replace(/phuong|xa/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

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

const isSelectedAddressValid = () => {
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

const extractAdministrativeTokens = (value) =>
  normalizeVietnameseText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

const handleCheckoutSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById("checkout-form");
  const cityValue = document.getElementById("city-select")?.value || "";
  const wardValue = document.getElementById("ward-select")?.value || "";

  if (!cityValue) {
    showToast("Please choose a city.", "warning");
    document.getElementById("city-select")?.focus();
    return;
  }

  if (!wardValue) {
    showToast("Please choose a ward/commune.", "warning");
    document.getElementById("ward-select")?.focus();
    return;
  }

  if (!isSelectedAddressValid()) {
    setAddressValidity("Vui long chon mot dia chi hop le tu danh sach goi y.");
    form?.reportValidity();
    return;
  }

  if (!form?.checkValidity()) {
    showToast("Please complete all required checkout fields.", "warning");
    return;
  }

  const formData = new FormData(form);
  const shippingAddress = document.getElementById("address")?.value?.trim();

  if (!shippingAddress) {
    showToast("Please complete your delivery address.", "warning");
    return;
  }

  const orderRequest = {
    shippingAddress,
    phoneNumber: formData.get("phone"),
    orderEmail: formData.get("email"),
    paymentMethod: formData.get("paymentMethod"),
    items: cartData.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
    })),
    couponCode: appliedCoupon?.code || null,
  };

  if (orderRequest.paymentMethod === "QR") {
    await handleQrPayment(orderRequest);
    return;
  }

  await submitCheckout(orderRequest);
};

const submitCheckout = async (orderRequest) => {
  const submitBtn = document.querySelector(".btn-checkout-submit");
  const originalText = submitBtn?.textContent || "PLACE ORDER";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }

    const result =
      checkoutMode === "buy-now"
        ? await checkoutAPI.checkoutBuyNow(orderRequest)
        : await checkoutAPI.checkoutFromCart(orderRequest);
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem(BUY_NOW_KEY);
    window.dispatchEvent(new Event("cartUpdated", { bubbles: true }));

    showToast(
      "Order placed successfully. Thank you for shopping with us!",
      "success",
    );
    window.location.href = "/home";
  } catch (error) {
    console.error("Checkout failed:", error);
    showToast(error?.message || "Checkout failed. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

const handleQrPayment = async (orderRequest) => {
  const submitBtn = document.querySelector(".btn-checkout-submit");
  const originalText = submitBtn?.textContent || "PLACE ORDER";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Redirecting...";
    }

    const payment =
      checkoutMode === "buy-now"
        ? await checkoutAPI.checkoutBuyNow(orderRequest)
        : await checkoutAPI.checkoutFromCart(orderRequest);

    if (!payment?.paymentUrl || !payment?.transactionId) {
      throw new Error("Unable to initialize QR payment.");
    }

    localStorage.setItem(PENDING_QR_KEY, payment.transactionId);
    window.location.href = payment.paymentUrl;
  } catch (error) {
    console.error("QR payment failed:", error);
    showToast(error?.message || "Unable to initialize QR payment.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

const handleApplyCoupon = async () => {
  const input = document.getElementById("coupon-code");
  const message = document.getElementById("coupon-message");
  const code = input?.value?.trim() || "";

  if (!code) {
    appliedCoupon = null;
    updateSummaryTotals();
    if (message) {
      message.textContent = "Please enter a coupon code.";
      message.style.color = "#d9534f";
    }
    return;
  }

  const subtotal = calculateSubtotal();
  if (subtotal <= 0) {
    if (message) {
      message.textContent = "Your cart is empty. Add items to apply coupon.";
      message.style.color = "#d9534f";
    }
    return;
  }

  try {
    const result = await couponAPI.validate(code, subtotal);
    appliedCoupon = {
      code: result.code,
      discountAmount: Number(result.discountAmount || 0),
      type: result.type,
      value: result.value,
    };

    updateSummaryTotals();
    if (message) {
      const discountText =
        appliedCoupon.type === "PERCENT"
          ? `${appliedCoupon.value}%`
          : `$${appliedCoupon.discountAmount.toFixed(2)}`;
      message.innerHTML = `<i class="fa-solid fa-check-circle"></i> Coupon "${result.code}" applied! You saved ${discountText}.`;
      message.style.color = "#28a745";
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      if (message && message.innerHTML.includes("applied")) {
        message.innerHTML = "";
      }
    }, 3000);
  } catch (error) {
    appliedCoupon = null;
    updateSummaryTotals();
    if (message) {
      message.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${error?.message || "Unable to apply coupon. Please check the code and try again."}`;
      message.style.color = "#d9534f";
    }
  }
};

const loadCheckoutCoupons = async () => {
  const list = document.getElementById("coupon-list");
  if (!list) return;

  try {
    const subtotal = calculateSubtotal();
    checkoutCoupons = await couponAPI.getCheckoutList(subtotal);
    renderCheckoutCoupons();
  } catch (error) {
    console.error("Failed to load coupons:", error);
    list.innerHTML = "";
  }
};

const renderCheckoutCoupons = () => {
  const list = document.getElementById("coupon-list");
  if (!list) return;

  if (!checkoutCoupons?.length) {
    list.innerHTML = "";
    return;
  }

  const visibleCoupons = checkoutCoupons.filter(
    (coupon) => coupon?.isActive !== false,
  );

  if (!visibleCoupons.length) {
    list.innerHTML = "";
    return;
  }

  // Add "View Vouchers" button instead of displaying all coupons
  list.innerHTML = `
    <button type="button" id="view-vouchers-btn" class="view-vouchers-btn">
      <i class="fa-solid fa-ticket"></i>
      View Available Vouchers (${visibleCoupons.length})
    </button>
  `;

  const viewBtn = document.getElementById("view-vouchers-btn");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      showVoucherModal(visibleCoupons);
    });
  }
};

const showVoucherModal = (coupons) => {
  const modal = document.getElementById("voucher-modal");
  const modalBody = document.getElementById("voucher-modal-body");

  if (!modal || !modalBody) return;

  // Sort coupons: valid ones first
  const sortedCoupons = [...coupons].sort((a, b) => {
    const aValid = a?.valid ? 1 : 0;
    const bValid = b?.valid ? 1 : 0;
    return bValid - aValid;
  });

  modalBody.innerHTML = sortedCoupons
    .map((coupon) => renderModalCouponCard(coupon))
    .join("");

  // Add event listeners for apply buttons in modal
  modalBody.querySelectorAll("[data-coupon-apply]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = btn.getAttribute("data-code");
      const input = document.getElementById("coupon-code");
      if (input && code) {
        input.value = code;
        handleApplyCoupon();
        closeVoucherModal();
        showToast(`Applied coupon ${code} successfully!`, "success");
      }
    });
  });

  // Add click handlers for coupon cards to show details
  modalBody.querySelectorAll("[data-coupon-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const target = event.target;
      if (
        target &&
        (target.closest("[data-coupon-apply]") ||
          target.closest(".coupon-card__btn"))
      ) {
        return;
      }
      const details = card.querySelector("[data-coupon-details]");
      if (!details) return;
      const isVisible = details.style.display === "block";
      details.style.display = isVisible ? "none" : "block";
    });
  });

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Close modal when clicking overlay or close button
  const overlay = modal.querySelector(".voucher-modal-overlay");
  const closeBtn = modal.querySelector("#voucher-modal-close");

  const closeModal = () => {
    closeVoucherModal();
  };

  overlay?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);
};

const closeVoucherModal = () => {
  const modal = document.getElementById("voucher-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
};

const renderModalCouponCard = (coupon) => {
  const isValid = Boolean(coupon.valid);
  const statusText = isValid
    ? "✓ Available"
    : "✗ " + (coupon.invalidReason || "Not available");
  const statusColor = isValid ? "#16a34a" : "#dc2626";
  const btnDisabled = isValid ? "" : "disabled";
  const btnText = isValid ? "Apply Now" : "Not Available";
  const remainingUses = getRemainingUses(coupon);

  // Format discount text
  // Sửa phần format discountText
let discountText = "";
if (coupon.type === "PERCENT") {
  discountText = `Reduce ${Number(coupon.value)}%`;
} else {
  discountText = `Reduce ${formatPrice(coupon.value)}`;
}
  return `
    <div data-coupon-card="1" class="coupon-card ${isValid ? "" : "coupon-card--disabled"}">
      <div class="coupon-card__head">
        <div>
          <div class="coupon-card__code">${escapeHtml(coupon.code)}</div>
          <div class="coupon-card__meta">${discountText}</div>
        </div>
        <span class="coupon-card__status" style="color: ${statusColor}; background: ${isValid ? "#e8f5e9" : "#ffebee"}">
          ${statusText}
        </span>
      </div>
      <div data-coupon-details="1" class="coupon-card__details" style="display: none;">
        ${renderModalCouponDetails(coupon, remainingUses)}
      </div>
      <div class="coupon-card__actions">
        <button type="button" data-coupon-apply="1" data-code="${coupon.code}" class="coupon-card__btn" ${btnDisabled}>
          ${btnText}
        </button>
      </div>
    </div>
  `;
};

const renderModalCouponDetails = (coupon, remainingUses) => {
  const lines = [];

  // Discount details
  if (coupon.type === "PERCENT") {
    lines.push(`🎯 ${coupon.value}% discount on your order`);
  } else {
    lines.push(`💰 Save $${Number(coupon.value).toFixed(2)} on your order`);
  }

  // Min order requirement
  // Sửa các dòng hiển thị điều kiện
  if (coupon.minOrderAmount > 0) {
    lines.push(`📦 Minimum order: ${formatPrice(coupon.minOrderAmount)}`);
  }
  if (coupon.maxDiscountAmount > 0) {
    lines.push(`🏷️ Maximum discount: ${formatPrice(coupon.maxDiscountAmount)}`);
  }
  // Valid until
  const endDate = coupon.endAt ? formatDateTime(coupon.endAt) : null;
  if (endDate) {
    lines.push(`⏰ Valid until: ${endDate}`);
  }

  // Usage limit
  if (remainingUses !== null) {
    if (Number(remainingUses) <= 0) {
      lines.push(`⚠️ You have no remaining uses for this voucher`);
    } else {
      lines.push(`✨ You have ${remainingUses} use(s) remaining`);
    }
  }

  if (!lines.length) {
    return "<div>No additional conditions.</div>";
  }

  return lines.map((line) => `<div>${line}</div>`).join("");
};

const formatDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${formatDateOnly(date)}`;
};

const getRemainingUses = (coupon) => {
  if (
    coupon.userRemainingUses !== null &&
    coupon.userRemainingUses !== undefined
  ) {
    return coupon.userRemainingUses;
  }
  if (
    coupon.usageLimitPerUser !== null &&
    coupon.usageLimitPerUser !== undefined &&
    coupon.userUsedCount !== null &&
    coupon.userUsedCount !== undefined
  ) {
    return Math.max(
      Number(coupon.usageLimitPerUser) - Number(coupon.userUsedCount),
      0,
    );
  }
  return null;
};

const formatUsd = (value) => {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
};

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVoucherModal();
  }
});

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  const modal = document.getElementById("voucher-modal");
  if (modal && modal.style.display === "flex") {
    const container = modal.querySelector(".voucher-modal-container");
    if (
      container &&
      !container.contains(event.target) &&
      !event.target.closest("#view-vouchers-btn")
    ) {
      closeVoucherModal();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setupVietnamAddressForm();
  loadCartData();
  document
    .getElementById("checkout-form")
    ?.addEventListener("submit", handleCheckoutSubmit);
  document
    .getElementById("apply-coupon-btn")
    ?.addEventListener("click", handleApplyCoupon);

  const couponToggle = document.getElementById("coupon-list-toggle");
  const couponList = document.getElementById("coupon-list");
  if (couponToggle && couponList) {
    couponToggle.addEventListener("click", () => {
      couponList.classList.toggle("is-collapsed");
      const expanded = !couponList.classList.contains("is-collapsed");
      couponToggle.classList.toggle("is-expanded", expanded);
      couponToggle.setAttribute("aria-expanded", String(expanded));
    });
  }
});

// Lấy thẻ button
const backToTopBtn = document.getElementById("backToTop");

// Theo dõi sự kiện cuộn chuột
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  // Nếu cuộn xuống quá 300px thì hiện nút, ngược lại thì ẩn
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
}

// Khi người dùng nhấn vào nút
backToTopBtn.onclick = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Cuộn mượt mà
  });
};
