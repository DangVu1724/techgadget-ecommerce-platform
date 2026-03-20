import { categoryApi } from "/modules/admin/core/api/category.api.js";
import { showToast } from "/shared/ui/toast.js";

let isSubmitting = false;

const validationRules = {
  price: (value) => {
    if (!value && value !== 0) return { isValid: false };
    const num = Number(value);
    if (Number.isNaN(num) || num <= 0 || !Number.isInteger(num)) return { isValid: false };
    return { isValid: true };
  },
  stock: (value) => {
    if (!value && value !== 0) return { isValid: false };
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) return { isValid: false };
    return { isValid: true };
  },
  attributeValue: (value) => ({ isValid: Boolean(value?.trim()) && value.length <= 50 }),
};

function validateField(input, rule) {
  if (!input) return true;
  const result = rule(input.value);
  input.classList.remove("is-valid", "is-invalid");
  input.classList.add(result.isValid ? "is-valid" : "is-invalid");
  return result.isValid;
}

function setupValidation() {
  const priceInput = document.getElementById("variantPrice");
  const stockInput = document.getElementById("variantStock");

  [priceInput, stockInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => validateField(input, validationRules[input.id.replace("variant", "").toLowerCase()]));
    input.addEventListener("blur", () => validateField(input, validationRules[input.id.replace("variant", "").toLowerCase()]));
  });
}

function validateAllAttributes() {
  let isValid = true;
  document.querySelectorAll(".attribute-value").forEach((input) => {
    if (!validateField(input, validationRules.attributeValue)) {
      isValid = false;
    }
  });
  return isValid;
}

export async function loadAttributes(categoryId) {
  try {
    const attributes = await categoryApi.getById(categoryId);
    const container = document.getElementById("variantAttributes");
    if (!container) return;

    if (!attributes?.length) {
      container.innerHTML = '<p class="attribute-empty">No attributes available.</p>';
      return;
    }

    container.innerHTML = `
      <div class="attributes-container">
        ${attributes.map((attr) => {
          const id = attr.attributeId || attr.id;
          const name = attr.attributeName || attr.name || "Attribute";
          return `
            <div class="attribute-item">
              <label>${name}</label>
              <input
                type="text"
                class="attribute-value"
                data-attribute-id="${id}"
                data-attribute-name="${name}"
                placeholder="Enter ${name.toLowerCase()}"
                oninput="window.validateAttributeInput(this)"
                onblur="window.validateAttributeInput(this)"
              >
            </div>
          `;
        }).join("")}
      </div>
    `;

    setupValidation();
  } catch (error) {
    console.error("Failed to load attributes:", error);
  }
}

window.validateAttributeInput = function validateAttributeInput(input) {
  validateField(input, validationRules.attributeValue);
};

export function collectAttributes() {
  const attributes = [];
  document.querySelectorAll(".attribute-value").forEach((input) => {
    if (input.value.trim()) {
      attributes.push({
        attributeId: parseInt(input.dataset.attributeId, 10),
        value: input.value.trim(),
      });
    }
  });
  return attributes;
}

export function resetAttributes() {
  ["variantName", "variantPrice", "variantStock"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.remove("is-valid", "is-invalid");
      input.value = "";
    }
  });

  document.querySelectorAll(".attribute-value").forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
    input.value = "";
  });
}

export function validateVariantForm() {
  let isValid = true;

  if (!validateField(document.getElementById("variantPrice"), validationRules.price)) isValid = false;
  if (!validateField(document.getElementById("variantStock"), validationRules.stock)) isValid = false;
  if (!validateAllAttributes()) isValid = false;

  if (!document.querySelectorAll(".attribute-value").length) {
    showToast("No attributes are available for this variant.", "warning");
    isValid = false;
  }

  return isValid;
}

export function setSubmitting(state) {
  isSubmitting = state;
  const submitBtn = document.querySelector('.btn-primary[onclick="saveVariant()"]');
  if (submitBtn) {
    submitBtn.disabled = state;
    submitBtn.innerHTML = state ? "Saving..." : "Save Variant";
  }
}

export function getSubmitting() {
  return isSubmitting;
}
