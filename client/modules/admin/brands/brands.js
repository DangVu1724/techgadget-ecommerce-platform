import { getBrands } from "../../../core/api/brand.api.js";

// DOM elements
const brandTable = document.getElementById('brandTable');

// Templates
const loadingTemplate = document.getElementById('loading-template');
const noDataTemplate = document.getElementById('no-data-template');
const errorTemplate = document.getElementById('error-template');
const rowTemplate = document.getElementById('brand-row-template');

// Load brands from API
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading
        showLoading();
        
        // Fetch data
        const brands = await getBrands();
        console.log('Loaded brands:', brands);
        
        // Check data
        if (!brands || brands.length === 0) {
            showNoData();
            return;
        }
        
        // Render data
        renderBrands(brands);
        
    } catch (error) {
        console.error('Error loading brands:', error);
        showError();
    }
});

function showLoading() {
    brandTable.innerHTML = '';
    brandTable.appendChild(loadingTemplate.content.cloneNode(true));
}

function showNoData() {
    brandTable.innerHTML = '';
    brandTable.appendChild(noDataTemplate.content.cloneNode(true));
}

function showError() {
    brandTable.innerHTML = '';
    brandTable.appendChild(errorTemplate.content.cloneNode(true));
}

function renderBrands(brands) {
    brandTable.innerHTML = '';
    
    brands.forEach(brand => {
        // Clone template
        const row = rowTemplate.content.cloneNode(true);
        
        // Fill data
        row.querySelector('.brand-id').textContent = brand.brandId;
        row.querySelector('.brand-name').textContent = brand.brandName;
        row.querySelector('.created-at').textContent = brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-';
        
        // Add to table
        brandTable.appendChild(row);
    });
}