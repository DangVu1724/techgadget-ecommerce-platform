import { collectAttributeFilters } from "./product-filters.shared.js";

const DEFAULT_TEXT = {
  empty: "No filters selected",
  noCategory: "Select a category to see advanced filters.",
  noAdvanced: "No advanced filters available for this category.",
};

export function createAdvancedFilterPanel(config) {
  const state = {
    dynamicFilters: [],
    filters: {
      minPrice: null,
      maxPrice: null,
      attributeFilters: {},
      uiSelections: {},
    },
  };

  const elements = {
    root: config.root,
    empty: config.empty ?? null,
    minPriceInput: config.minPriceInput ?? null,
    maxPriceInput: config.maxPriceInput ?? null,
    filterBadge: config.filterBadge ?? null,
    filterSummary: config.filterSummary ?? null,
    dropdownRoot: config.dropdownRoot ?? null,
    panel: config.panel ?? null,
    toggleButton: config.toggleButton ?? null,
    applyButton: config.applyButton ?? null,
    clearButton: config.clearButton ?? null,
    overlay: document.getElementById("filterOverlay"),
    closeButton: document.getElementById("closeFilters"),
  };

  const options = {
    texts: {
      ...DEFAULT_TEXT,
      ...(config.texts || {}),
    },
    onChange: config.onChange ?? (() => {}),
    onApply: config.onApply ?? null,
    onClear: config.onClear ?? null,
  };

  const getActiveFilterCount = () => {
    const priceCount =
      state.filters.minPrice != null || state.filters.maxPrice != null ? 1 : 0;
    const attributeCount = Object.values(
      state.filters.uiSelections || {},
    ).reduce((total, selections) => total + selections.length, 0);

    return priceCount + attributeCount;
  };

  const updateSummary = () => {
    const count = getActiveFilterCount();

    if (elements.filterBadge) {
      elements.filterBadge.textContent = String(count);
      elements.filterBadge.style.display = count ? "inline-flex" : "none";
    }

    if (!elements.filterSummary) return;

    if (!count) {
      elements.filterSummary.textContent = options.texts.empty;
      return;
    }

    const parts = [];

    if (state.filters.minPrice != null || state.filters.maxPrice != null) {
      const min = state.filters.minPrice ?? 0;
      const max = state.filters.maxPrice ?? "any";
      parts.push(`Price ${min} - ${max}`);
    }

    Object.entries(state.filters.uiSelections || {}).forEach(
      ([filterName, selections]) => {
        if (!selections.length) return;

        const filter = state.dynamicFilters.find(
          (item) => item.name === filterName,
        );
        if (!filter) return;

        parts.push(`${filter.label}: ${selections.length}`);
      },
    );

    elements.filterSummary.textContent = parts.join(" • ");
  };

  const setDropdownOpen = (isOpen) => {
    if (!elements.panel || !elements.toggleButton) return;

    elements.panel.classList.toggle("show", isOpen);
    elements.toggleButton.setAttribute("aria-expanded", String(isOpen));
    
    // Handle overlay visibility
    if (elements.overlay) {
      elements.overlay.classList.toggle("show", isOpen);
    }
    
    // Toggle header visibility and body state
    document.body.classList.toggle("filter-panel-open", isOpen);
    
    // Prevent body scroll when filter panel is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const syncPriceInputs = () => {
    if (elements.minPriceInput) {
      elements.minPriceInput.value = state.filters.minPrice ?? "";
    }
    if (elements.maxPriceInput) {
      elements.maxPriceInput.value = state.filters.maxPrice ?? "";
    }

    document.querySelectorAll(".price-preset").forEach((btn) => {
      const min = Number(btn.dataset.min);
      const max = Number(btn.dataset.max);
      btn.classList.toggle(
        "active",
        state.filters.minPrice === min && state.filters.maxPrice === max,
      );
    });
  };

  const syncAttributeInputs = () => {
    elements.root
      ?.querySelectorAll(".dynamic-filter-input")
      .forEach((input) => {
        const selected =
          state.filters.uiSelections?.[input.dataset.filterName] || [];
        input.checked = selected.includes(input.value);
      });
  };

  const syncUi = () => {
    syncPriceInputs();
    syncAttributeInputs();
    updateSummary();
  };

  const readFiltersFromUi = () => {
    state.filters.minPrice = elements.minPriceInput?.value
      ? Number(elements.minPriceInput.value)
      : null;
    state.filters.maxPrice = elements.maxPriceInput?.value
      ? Number(elements.maxPriceInput.value)
      : null;

    if (
      state.filters.minPrice != null &&
      state.filters.maxPrice != null &&
      state.filters.minPrice > state.filters.maxPrice
    ) {
      const nextMin = state.filters.maxPrice;
      state.filters.maxPrice = state.filters.minPrice;
      state.filters.minPrice = nextMin;
      syncPriceInputs();
    }

    const { attributeFilters, uiSelections } = collectAttributeFilters(
      `${config.scopeSelector || ""} .dynamic-filter-input:checked`.trim(),
    );
    state.filters.attributeFilters = attributeFilters;
    state.filters.uiSelections = uiSelections;

    updateSummary();
    return getFilters();
  };

  const bindDynamicInputs = () => {
    elements.root
      ?.querySelectorAll(".dynamic-filter-input")
      .forEach((input) => {
        input.addEventListener("change", () => {
          const filters = readFiltersFromUi();
          options.onChange(filters);
        });
      });
  };

  const bindSectionToggles = () => {
    const container = elements.panel || elements.root;
    container
      ?.querySelectorAll(".filter-section-header")
      .forEach((header) => {
        header.onclick = () => {
          const section = header.closest(".filter-section");
          if (section) section.classList.toggle("collapsed");
        };
      });
  };

  const render = ({ dynamicFilters = [], hasCategory = false } = {}) => {
    state.dynamicFilters = dynamicFilters;

    if (!elements.root) return;

    elements.root.innerHTML = "";

    if (elements.empty) {
      const shouldShowEmpty = !hasCategory || !dynamicFilters.length;
      elements.empty.style.display = shouldShowEmpty ? "block" : "none";
      elements.empty.textContent = !hasCategory
        ? options.texts.noCategory
        : options.texts.noAdvanced;
    }

    if (!hasCategory || !dynamicFilters.length) {
      updateSummary();
      return;
    }

    dynamicFilters.forEach((filter) => {
      const section = document.createElement("div");
      section.className = "filter-section collapsed";
      section.innerHTML = `
        <div class="filter-section-header">
          <h3>
            <i class="fas fa-circle-check"></i>
            ${filter.label}
          </h3>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="filter-content dynamic-filter-list"></div>
      `;

      const content = section.querySelector(".filter-content");
      filter.options.forEach((option) => {
        const label = document.createElement("label");
        label.className = "checkbox-label";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "dynamic-filter-input";
        input.dataset.filterName = filter.name;
        input.dataset.payloadValues = JSON.stringify(option.payloadValues);
        input.value = option.id;

        const selected = state.filters.uiSelections?.[filter.name] || [];
        input.checked = selected.includes(option.id);

        label.appendChild(input);
        label.append(` ${option.label}`);
        content.appendChild(label);
      });

      elements.root.appendChild(section);
    });

    bindSectionToggles();
    bindDynamicInputs();
    syncUi();
  };

  const reset = () => {
    state.filters = {
      minPrice: null,
      maxPrice: null,
      attributeFilters: {},
      uiSelections: {},
    };
    syncUi();
  };

  const setFilters = (filters = {}) => {
    state.filters = {
      minPrice: filters.minPrice ?? null,
      maxPrice: filters.maxPrice ?? null,
      attributeFilters: filters.attributeFilters ?? {},
      uiSelections: filters.uiSelections ?? {},
    };
    syncUi();
  };

  const getFilters = () => ({
    minPrice: state.filters.minPrice,
    maxPrice: state.filters.maxPrice,
    attributeFilters: { ...state.filters.attributeFilters },
    uiSelections: { ...state.filters.uiSelections },
  });

  const bindStaticEvents = () => {
    if (elements.toggleButton && elements.panel) {
      elements.toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        setDropdownOpen(!elements.panel.classList.contains("show"));
      });
    }

    // Close button handler
    if (elements.closeButton) {
      elements.closeButton.addEventListener("click", () => {
        setDropdownOpen(false);
      });
    }
    
    // Overlay click handler
    if (elements.overlay) {
      elements.overlay.addEventListener("click", () => {
        setDropdownOpen(false);
      });
    }

    if (elements.dropdownRoot) {
      document.addEventListener("click", (event) => {
        if (!elements.dropdownRoot.contains(event.target) && 
            !elements.panel.classList.contains("show")) {
          setDropdownOpen(false);
        }
      });
    }

    elements.minPriceInput?.addEventListener("input", () => {
      const filters = readFiltersFromUi();
      options.onChange(filters);
    });

    elements.maxPriceInput?.addEventListener("input", () => {
      const filters = readFiltersFromUi();
      options.onChange(filters);
    });

    document.querySelectorAll(".price-preset").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (elements.minPriceInput) {
          elements.minPriceInput.value = btn.dataset.min || "";
        }
        if (elements.maxPriceInput) {
          elements.maxPriceInput.value = btn.dataset.max || "";
        }

        const filters = readFiltersFromUi();
        options.onChange(filters);
      });
    });

    elements.clearButton?.addEventListener("click", () => {
      reset();
      options.onClear?.(getFilters());
    });

    elements.applyButton?.addEventListener("click", () => {
      const filters = readFiltersFromUi();
      setDropdownOpen(false);
      options.onApply?.(filters);
    });

    updateSummary();
  };

  bindStaticEvents();

  return {
    getFilters,
    render,
    reset,
    setFilters,
    setDropdownOpen,
  };
}
