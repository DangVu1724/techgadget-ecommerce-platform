// constants.js - Constants for checkout module
export const PENDING_QR_KEY = "pendingQrTransactionId";
export const BUY_NOW_KEY = "buyNowCheckoutItem";
export const VIETMAP_API_KEY =
  "2afbba12ee7bbd16f433f5c982e4efef2001935467f8f540";
export const VIETMAP_SEARCH_URL = "https://maps.vietmap.vn/api/search/v4";
export const VIETMAP_PLACE_URL = "https://maps.vietmap.vn/api/place/v4";
export const PROVINCES_API_BASE_URL = "https://provinces.open-api.vn/api/v2";
export const ADDRESS_DEBOUNCE_MS = 300;
export const PROVINCES_CACHE_KEY = "checkoutProvincesV2";
export const WARDS_CACHE_PREFIX = "checkoutWardsV2:";
export const ADMIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const SHIPPING_FEES = {
  hanoiInner: 20000,
  hanoiOuter: 35000,
  otherProvince: 50000,
};
