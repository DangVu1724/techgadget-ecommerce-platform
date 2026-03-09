// variantModal.js
import { attributeApi } from "../../core/api/attribute.api.js";

let selectedAttributes = new Map();
let isSubmitting = false;

const validationRules = {
  name: (value) => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Tên không được để trống' };
    }
    if (value.length < 3) {
      return { isValid: false, message: 'Tên phải có ít nhất 3 ký tự' };
    }
    if (value.length > 50) {
      return { isValid: false, message: 'Tên không được vượt quá 50 ký tự' };
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      return { isValid: false, message: 'Tên chỉ được chứa chữ, số, dấu cách, - và _' };
    }
    return { isValid: true };
  },

  price: (value) => {
    if (!value && value !== 0) {
      return { isValid: false, message: 'Giá không được để trống' };
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return { isValid: false, message: 'Giá phải là số dương' };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, message: 'Giá phải là số nguyên' };
    }
    if (num > 999999999) {
      return { isValid: false, message: 'Giá không được vượt quá 999,999,999' };
    }
    return { isValid: true };
  },

  // Stock: bắt buộc, số nguyên dương, tối đa 6 chữ số
  stock: (value) => {
    if (!value && value !== 0) {
      return { isValid: false, message: 'Số lượng không được để trống' };
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return { isValid: false, message: 'Số lượng phải là số không âm' };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, message: 'Số lượng phải là số nguyên' };
    }
    if (num > 999999) {
      return { isValid: false, message: 'Số lượng không được vượt quá 999,999' };
    }
    return { isValid: true };
  },

  // Mô tả: không bắt buộc, tối đa 200 ký tự
  description: (value) => {
    if (value && value.length > 200) {
      return { isValid: false, message: 'Mô tả không được vượt quá 200 ký tự' };
    }
    return { isValid: true };
  },

  // Attribute value: bắt buộc, 1-50 ký tự
  attributeValue: (value) => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Giá trị không được để trống' };
    }
    if (value.length > 50) {
      return { isValid: false, message: 'Giá trị không được vượt quá 50 ký tự' };
    }
    return { isValid: true };
  }
};

// Validate single field
function validateField(input, rule) {
  if (!input) return true;
  
  const result = rule(input.value);
  
  // Remove old feedback
  const existingFeedback = input.nextElementSibling;
  if (existingFeedback && existingFeedback.classList.contains('feedback-message')) {
    existingFeedback.remove();
  }
  
  // Update input class
  input.classList.remove('is-valid', 'is-invalid');
  
    
  if (result.isValid) {
    input.classList.add('is-valid');
  } else {
    input.classList.add('is-invalid');
  }
  
  return result.isValid;
}

// Validate all attributes
function validateAttributes() {
  let isValid = true;
  const rows = document.querySelectorAll(".attribute-row");
  
  rows.forEach((row) => {
    const select = row.querySelector(".attribute-select");
    const input = row.querySelector(".attribute-value");
    
    // Check if attribute is selected
    if (!select.value) {
      select.classList.add('is-invalid');
      
      // Add feedback if not exists
      let feedback = select.nextElementSibling;
      if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        select.after(feedback);
      }
      feedback.textContent = 'Vui lòng chọn thuộc tính';
      
      isValid = false;
    } else {
      select.classList.remove('is-invalid');
      const feedback = select.nextElementSibling;
      if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.remove();
      }
    }
    
    // Validate attribute value
    if (!validateField(input, validationRules.attributeValue)) {
      isValid = false;
    }
    
    // Check for duplicate attributes
    if (select.value) {
      const attributeId = parseInt(select.value);
      const duplicateRows = Array.from(rows).filter(r => {
        const s = r.querySelector(".attribute-select");
        return s && s !== select && parseInt(s.value) === attributeId;
      });
      
      if (duplicateRows.length > 0) {
        select.classList.add('is-invalid');
        
        let feedback = select.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          select.after(feedback);
        }
        feedback.textContent = 'Thuộc tính này đã được chọn';
        
        isValid = false;
      }
    }
  });
  
  return isValid;
}

// Setup real-time validation
function setupValidation() {
  const nameInput = document.getElementById("variantName");
  const priceInput = document.getElementById("variantPrice");
  const stockInput = document.getElementById("variantStock");
  const descInput = document.getElementById("variantDescription");
  
  if (nameInput) {
    nameInput.addEventListener('input', () => validateField(nameInput, validationRules.name));
    nameInput.addEventListener('blur', () => validateField(nameInput, validationRules.name));
  }
  
  if (priceInput) {
    priceInput.addEventListener('input', () => validateField(priceInput, validationRules.price));
    priceInput.addEventListener('blur', () => validateField(priceInput, validationRules.price));
  }
  
  if (stockInput) {
    stockInput.addEventListener('input', () => validateField(stockInput, validationRules.stock));
    stockInput.addEventListener('blur', () => validateField(stockInput, validationRules.stock));
  }
  
  if (descInput) {
    descInput.addEventListener('input', () => validateField(descInput, validationRules.description));
    descInput.addEventListener('blur', () => validateField(descInput, validationRules.description));
  }
}

export async function loadAttributes() {
  try {
    const response = await attributeApi.getAll();
    const container = document.getElementById("variantAttributes");
    if (!container) return;

    container.innerHTML = "";

    let attributes = [];
    if (response?.content) {
      attributes = Array.isArray(response.content)
        ? response.content
        : Object.values(response.content);
    } else if (Array.isArray(response)) {
      attributes = response;
    } else if (response?.data) {
      attributes = Array.isArray(response.data) ? response.data : [];
    }

    if (!attributes || attributes.length === 0) {
      container.innerHTML =
        '<p class="attribute-empty">Không có thuộc tính nào</p>';
      return;
    }

    window.availableAttributes = attributes;

    const table = document.createElement("table");
    table.className = "attributes-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Thuộc tính</th>
          <th>Giá trị</th>
          <th style="width: 40px"></th>
        </tr>
      </thead>
      <tbody id="attributesTableBody"></tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 0.5rem; text-align: left;">
            <button type="button" class="btn-add-attribute" onclick="window.addAttributeRow()">
              + Thêm thuộc tính
            </button>
          </td>
        </tr>
      </tfoot>
    `;

    container.appendChild(table);
    
    // Setup validation after loading
    setupValidation();
    
  } catch (err) {
    console.error(err);
    const container = document.getElementById("variantAttributes");
    if (container) {
      container.innerHTML = '<p class="attribute-empty">Lỗi tải thuộc tính</p>';
    }
  }
}

window.addAttributeRow = async function () {
  const attributes = window.availableAttributes || [];
  const tbody = document.getElementById("attributesTableBody");
  if (!tbody) return;

  const rowId = "row_" + Date.now();
  
  // Filter out selected attributes
  const selectedIds = Array.from(document.querySelectorAll('.attribute-select'))
    .map(select => select.value)
    .filter(value => value !== '');
  
  const availableAttributes = attributes.filter(attr => {
    const id = attr.attributeId || attr.id;
    return !selectedIds.includes(id.toString());
  });

  const options = ['<option value="">-- Chọn thuộc tính --</option>'];
  
  availableAttributes.forEach((attr) => {
    const id = attr.attributeId || attr.id;
    const name = attr.attributeName || attr.name || "Thuộc tính";
    options.push(`<option value="${id}">${name}</option>`);
  });

  const row = document.createElement("tr");
  row.id = rowId;
  row.className = "attribute-row";

  row.innerHTML = `
    <td>
      <select 
        class="attribute-select" 
        data-row="${rowId}"
        onchange="window.handleAttributeChange(this)">
        ${options.join("")}
      </select>
    </td>
    <td>
      <input 
        type="text"
        class="attribute-value"
        data-row="${rowId}"
        placeholder="Nhập giá trị"
        oninput="window.handleAttributeInput(this)"
        onblur="window.handleAttributeInput(this)"
      >
    </td>
    <td>
      <button 
        type="button"
        class="btn-remove-row"
        onclick="window.removeAttributeRow('${rowId}')"
        title="Xóa">
        ×
      </button>
    </td>
  `;

  tbody.appendChild(row);
};

window.handleAttributeChange = function(select) {
  // Remove invalid class when changed
  select.classList.remove('is-invalid');
  const feedback = select.nextElementSibling;
  if (feedback && feedback.classList.contains('invalid-feedback')) {
    feedback.remove();
  }
};

window.handleAttributeInput = function(input) {
  validateField(input, validationRules.attributeValue);
};

window.removeAttributeRow = function (rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    const select = row.querySelector(".attribute-select");
    if (select && select.value) {
      selectedAttributes.delete(parseInt(select.value));
    }
    row.remove();
  }
};

export function collectAttributes() {
  const attributes = [];
  const rows = document.querySelectorAll(".attribute-row");

  rows.forEach((row) => {
    const select = row.querySelector(".attribute-select");
    const input = row.querySelector(".attribute-value");

    if (select.value && input.value.trim()) {
      attributes.push({
        attributeId: parseInt(select.value),
        value: input.value.trim(),
      });
      selectedAttributes.set(parseInt(select.value), true);
    }
  });

  return attributes;
}

export function resetAttributes() {
  selectedAttributes.clear();
  const tbody = document.getElementById("attributesTableBody");
  if (tbody) tbody.innerHTML = "";
  
  // Reset validation
  const inputs = ['variantName', 'variantPrice', 'variantStock', 'variantDescription'];
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.remove('is-valid', 'is-invalid');
      const feedback = input.nextElementSibling;
      if (feedback && (feedback.classList.contains('valid-feedback') || feedback.classList.contains('invalid-feedback'))) {
        feedback.remove();
      }
    }
  });
}

export function validateVariantForm() {
  let isValid = true;
  
  const nameInput = document.getElementById("variantName");
  const priceInput = document.getElementById("variantPrice");
  const stockInput = document.getElementById("variantStock");
  
  if (!validateField(nameInput, validationRules.name)) isValid = false;
  if (!validateField(priceInput, validationRules.price)) isValid = false;
  if (!validateField(stockInput, validationRules.stock)) isValid = false;
  
  const descInput = document.getElementById("variantDescription");
  if (descInput && descInput.value) {
    if (!validateField(descInput, validationRules.description)) isValid = false;
  }
  
  if (!validateAttributes()) isValid = false;
  
  const rows = document.querySelectorAll(".attribute-row");
  if (rows.length === 0) {
    alert('Vui lòng thêm ít nhất một thuộc tính');
    isValid = false;
  }
  
  return isValid;
}

export function setSubmitting(state) {
  isSubmitting = state;
  const submitBtn = document.querySelector('.btn-primary[onclick="saveVariant()"]');
  if (submitBtn) {
    submitBtn.disabled = state;
    submitBtn.innerHTML = state 
      ? '<span class="spinner-border spinner-border-sm"></span> Đang lưu...' 
      : 'Lưu Variant';
  }
}

export function getSubmitting() {
  return isSubmitting;
}