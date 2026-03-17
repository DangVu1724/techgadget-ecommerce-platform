// modal.js
export class Modal {
  constructor(options = {}) {
    this.title = options.title || 'Modal';
    this.size = options.size || 'md';
    this.onClose = options.onClose;
    this.onSave = options.onSave;
    this.fields = options.fields || [];
    this.data = options.data || {};
    
    this.createModal();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    
    this.modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-wrapper">
        <div class="modal-content modal-${this.size}">
          <div class="modal-header">
            <h2 class="modal-title">${this.title}</h2>
            <button class="modal-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <form class="modal-form" id="modalForm">
              ${this.renderFields()}
            </form>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button class="btn btn-primary" id="saveBtn">Save changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    
    this.form = this.modal.querySelector('#modalForm');
    this.setupEventListeners();
  }

  renderFields() {
    return this.fields.map(field => {
      const value = this.data[field.name] || '';
      const required = field.required ? 'required' : '';
      const helpText = field.helpText ? `<span class="field-help">${field.helpText}</span>` : '';
      
      switch (field.type) {
        case 'textarea':
          return `
            <div class="form-field">
              <label class="field-label" for="${field.name}">
                ${field.label}
                ${field.required ? '<span class="required-mark">*</span>' : ''}
              </label>
              <textarea 
                class="field-input"
                id="${field.name}" 
                name="${field.name}" 
                ${required}
                placeholder="${field.placeholder || ''}"
                rows="${field.rows || 3}"
              >${value}</textarea>
              ${helpText}
            </div>
          `;
          
        case 'select':
          return `
            <div class="form-field">
              <label class="field-label" for="${field.name}">
                ${field.label}
                ${field.required ? '<span class="required-mark">*</span>' : ''}
              </label>
              <div class="select-wrapper">
                <select class="field-input" id="${field.name}" name="${field.name}" ${required}>
                  <option value="">${field.placeholder || 'Select an option'}</option>
                  ${field.options?.map(opt => `
                    <option value="${opt.value}" ${value == opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>
                <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
              ${helpText}
            </div>
          `;
          
        default:
          return `
            <div class="form-field">
              <label class="field-label" for="${field.name}">
                ${field.label}
                ${field.required ? '<span class="required-mark">*</span>' : ''}
              </label>
              <input 
                class="field-input"
                type="${field.type || 'text'}" 
                id="${field.name}" 
                name="${field.name}" 
                value="${value}"
                placeholder="${field.placeholder || ''}"
                ${required}
              >
              ${helpText}
            </div>
          `;
      }
    }).join('');
  }

  setupEventListeners() {
    const closeBtn = this.modal.querySelector('.modal-close');
    const cancelBtn = this.modal.querySelector('#cancelBtn');
    const saveBtn = this.modal.querySelector('#saveBtn');
    const backdrop = this.modal.querySelector('.modal-backdrop');

    closeBtn.onclick = () => this.close();
    cancelBtn.onclick = () => this.close();
    backdrop.onclick = () => this.close();
    
    if (this.onSave) {
      saveBtn.onclick = () => {
        if (this.form.checkValidity()) {
          const formData = new FormData(this.form);
          const data = Object.fromEntries(formData.entries());
          this.onSave(data);
        } else {
          this.form.reportValidity();
        }
      };
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    if (this.onClose) {
      this.onClose();
    }
  }

  destroy() {
    this.modal.remove();
    document.body.style.overflow = '';
  }
}