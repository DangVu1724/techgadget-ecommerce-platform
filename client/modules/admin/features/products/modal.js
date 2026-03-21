// variantModal.js
import { categoryApi } from "/modules/admin/core/api/category.api.js";

let isSubmitting = false;

const validationRules = {
  price: (value) => {
    if (!value && value !== 0)
      return { isValid: false, message: "Giá không được để trống" };
    const num = Number(value);
    if (isNaN(num) || num <= 0)
      return { isValid: false, message: "Giá phải là số dương" };
    if (!Number.isInteger(num))
      return { isValid: false, message: "Giá phải là số nguyên" };
    return { isValid: true };
  },

  stock: (value) => {
    if (!value && value !== 0)
      return { isValid: false, message: "Số lượng không được để trống" };
    const num = Number(value);
    if (isNaN(num) || num < 0)
      return { isValid: false, message: "Số lượng phải là số không âm" };
    if (!Number.isInteger(num))
      return { isValid: false, message: "Số lượng phải là số nguyên" };
    return { isValid: true };
  },

  attributeValue: (value) => {
    if (!value || !value.trim())
      return { isValid: false, message: "Giá trị không được để trống" };
    if (value.length > 50)
      return {
        isValid: false,
        message: "Giá trị không được vượt quá 50 ký tự",
      };
    return { isValid: true };
  },
};

function validateField(input, rule) {
  if (!input) return true;
  const result = rule(input.value);

  const existingFeedback = input.nextElementSibling;
  if (existingFeedback?.classList.contains("feedback-message"))
    existingFeedback.remove();

  input.classList.remove("is-valid", "is-invalid");
  input.classList.add(result.isValid ? "is-valid" : "is-invalid");
  return result.isValid;
}

function setupValidation() {
  const priceInput = document.getElementById("variantPrice");
  const stockInput = document.getElementById("variantStock");

  [priceInput, stockInput].forEach((input) => {
    if (input) {
      input.addEventListener("input", () =>
        validateField(
          input,
          validationRules[input.id.replace("variant", "").toLowerCase()],
        ),
      );
      input.addEventListener("blur", () =>
        validateField(
          input,
          validationRules[input.id.replace("variant", "").toLowerCase()],
        ),
      );
    }
  });
}

function validateAllAttributes() {
  let isValid = true;
  const inputs = document.querySelectorAll(".attribute-value");

  inputs.forEach((input) => {
    if (!validateField(input, validationRules.attributeValue)) isValid = false;
  });

  return isValid;
}

export async function loadAttributes(categoryId) {
  try {
    const attributes = await categoryApi.getById(categoryId);
    const container = document.getElementById("variantAttributes");
    if (!container) return;

    if (!attributes?.length) {
      container.innerHTML =
        '<p class="attribute-empty">Không có thuộc tính nào</p>';
      return;
    }

    let html = '<div class="attributes-container">';
    attributes.forEach((attr) => {
      const id = attr.attributeId || attr.id;
      const name = attr.attributeName || attr.name || "Thuộc tính";
      html += `
        <div class="attribute-item">
          <label>${name}</label>
          <input type="text" 
                 class="attribute-value" 
                 data-attribute-id="${id}"
                 data-attribute-name="${name}"
                 placeholder="Nhập ${name.toLowerCase()}"
                 oninput="window.validateAttributeInput(this)"
                 onblur="window.validateAttributeInput(this)">
        </div>
      `;
    });
    html += "</div>";

    container.innerHTML = html;
    setupValidation();
  } catch (err) {
    console.error(err);
  }
}

window.validateAttributeInput = function (input) {
  validateField(input, validationRules.attributeValue);
};

export function collectAttributes() {
  const attributes = [];
  const inputs = document.querySelectorAll(".attribute-value");

  inputs.forEach((input) => {
    if (input.value.trim()) {
      attributes.push({
        attributeId: parseInt(input.dataset.attributeId),
        value: input.value.trim(),
      });
    }
  });

  return attributes;
}

export function resetAttributes() {
  const inputs = ["variantName", "variantPrice", "variantStock"];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.remove("is-valid", "is-invalid");
      input.value = "";
    }
  });

  const attrInputs = document.querySelectorAll(".attribute-value");
  attrInputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
    input.value = "";
  });
}

export function validateVariantForm() {
  let isValid = true;

  const priceInput = document.getElementById("variantPrice");
  const stockInput = document.getElementById("variantStock");

  if (!validateField(priceInput, validationRules.price)) isValid = false;
  if (!validateField(stockInput, validationRules.stock)) isValid = false;
  if (!validateAllAttributes()) isValid = false;

  const attrInputs = document.querySelectorAll(".attribute-value");
  if (attrInputs.length === 0) {
    alert("Không có thuộc tính nào để nhập");
    isValid = false;
  }

  return isValid;
}

export function setSubmitting(state) {
  isSubmitting = state;
  const submitBtn = document.querySelector(
    '.btn-primary[onclick="saveVariant()"]',
  );
  if (submitBtn) {
    submitBtn.disabled = state;
    submitBtn.innerHTML = state ? "Đang lưu..." : "Lưu Variant";
  }
}

export function getSubmitting() {
  return isSubmitting;
}
