// utils.js - Utility functions for checkout module
import { SHIPPING_FEES } from "./constants.js";

export const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

export const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const calculateSubtotal = (cartData) =>
  cartData?.items?.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  ) || 0;

export const calculateShipping = (selectedCity = null, selectedWardMeta = null) =>
  getShippingRule(selectedCity, selectedWardMeta).fee;

export const getShippingRule = (selectedCity = null, selectedWardMeta = null) => {
  if (!selectedCity || !selectedWardMeta?.name) {
    return {
      zone: "pending",
      label: "Chon dia chi",
      fee: 0,
    };
  }

  const cityName = normalizeVietnameseText(selectedCity.name || selectedCity);
  if (cityName !== "ha noi") {
    return {
      zone: "other-province",
      label: "Tinh khac",
      fee: SHIPPING_FEES.otherProvince,
    };
  }

  const divisionType = normalizeDivisionType(selectedWardMeta.divisionType);
  const wardName = normalizeDivisionType(selectedWardMeta.name);

  if (
    divisionType.includes("phuong") ||
    wardName.startsWith("phuong ")
  ) {
    return {
      zone: "hanoi-inner",
      label: "Noi thanh Ha Noi",
      fee: SHIPPING_FEES.hanoiInner,
    };
  }

  if (
    divisionType.includes("xa") ||
    divisionType.includes("thi tran") ||
    wardName.startsWith("xa ") ||
    wardName.startsWith("thi tran ")
  ) {
    return {
      zone: "hanoi-outer",
      label: "Ngoai thanh Ha Noi",
      fee: SHIPPING_FEES.hanoiOuter,
    };
  }

  // If Hanoi is selected but ward type metadata is missing, prefer outer-city fallback
  // instead of incorrectly treating it as another province.
  return {
    zone: "hanoi-outer",
    label: "Ngoai thanh Ha Noi",
    fee: SHIPPING_FEES.hanoiOuter,
  };
};

export const formatDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${formatDateOnly(date)}`;
};

export const formatUsd = (value) => {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
};

export const normalizeVietnameseText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/thanh pho|tp\.?/gi, "")
    .replace(/phuong|xa/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const extractAdministrativeTokens = (value) =>
  normalizeVietnameseText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

export const normalizeDivisionType = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
