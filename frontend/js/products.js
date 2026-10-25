/* ==========================================================================
   StyleHub - Shop Catalog Logic
   Manages product filtering, searching, sorting, and URL sync
   Communicates with REST API (with seamless fallback to local dataset)
   ========================================================================== */

// Active Filter State
const shopState = {
  gender: 'all',
  category: 'all',
  size: 'all',
  maxPrice: 200,
  search: '',
  sort: 'featured',
  products: []
};

/**
 * Fetch products from backend API, or fallback to SAMPLE_PRODUCTS
 */
async function loadProducts() {
  const grid = document.getElementById('shop-products-grid');
  if (grid) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">Loading fashion collection...</div>';
  }

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        shopState.products = data;
        applyFiltersAndRender();
        return;
      }
    }
  } catch (err) {
    // API not yet running or network unavailable; fall back gracefully to local dataset
    console.info('Backend API offline, utilizing sample clothing catalog.');
  }

  // Fallback to SAMPLE_PRODUCTS
  if (typeof SAMPLE_PRODUCTS !== 'undefined') {
    shopState.products = [...SAMPLE_PRODUCTS];
  } else {
    shopState.products = [];
  }

  applyFiltersAndRender();
}

/**
 * Filter, sort, and render products according to current shopState
 */
function applyFiltersAndRender() {
  const grid = document.getElementById('shop-products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  let filtered = [...shopState.products];

  // 1. Gender Filter
  if (shopState.gender !== 'all') {
    filtered = filtered.filter(p => p.gender && p.gender.toLowerCase() === shopState.gender.toLowerCase());
  }

  // 2. Category Filter
  if (shopState.category !== 'all') {
    filtered = filtered.filter(p => p.category && p.category.toLowerCase() === shopState.category.toLowerCase());
  }

  // 3. Size Filter
  if (shopState.size !== 'all') {
    filtered = filtered.filter(p => {
      if (Array.isArray(p.sizes)) {
        return p.sizes.includes(shopState.size);
      }
      if (typeof p.sizes === 'string') {
        return p.sizes.split(',').map(s => s.trim()).includes(shopState.size);
      }
      return false;
    });
  }

  // 4. Max Price Filter
  filtered = filtered.filter(p => Number(p.price) <= shopState.maxPrice);

  // 5. Search Filter
  if (shopState.search.trim()) {
    const q = shopState.search.toLowerCase().trim();
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.color && p.color.toLowerCase().includes(q))
    );
  }

  // 6. Sorting
  switch (shopState.sort) {
    case 'price-low':
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-high':
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'newest':
      filtered.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      break;
  }

  // Update product count label
  if (countEl) {
    countEl.textContent = filtered.length;
  }

  // Empty state check
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛍️</div>
        <h3>No clothing matches your filters</h3>
        <p>Try clearing some filters or searching with a different term.</p>
        <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  // Render cards
  grid.innerHTML = filtered.map(renderShopProductCard).join('');
}

/**
 * Generate HTML for an individual product card
 */
function renderShopProductCard(product) {
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : ['M']);

  const sizesHtml = sizes.map(s => `<span class="size-chip">${s}</span>`).join('');
  const badgeHtml = product.is_new 
    ? '<span class="product-badge new">New</span>' 
    : (product.original_price ? '<span class="product-badge sale">Sale</span>' : '');

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-wrapper">
        ${badgeHtml}
        <img src="${product.image_url}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span>${product.gender}</span>
          <span>${product.category}</span>
        </div>
        <h3 class="product-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-sizes-chips">
          ${sizesHtml}
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          ${product.original_price ? `<span class="product-original-price">${formatPrice(product.original_price)}</span>` : ''}
        </div>
        <div class="product-card-actions">
          <button class="btn-add-cart" onclick="shopQuickAddToCart(${product.id})">
            🛒 Add to Cart
          </button>
          <a href="product.html?id=${product.id}" class="btn-view-details" title="View details">
            👁
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Quick add helper from shop page
 */
function shopQuickAddToCart(id) {
  const product = shopState.products.find(p => p.id === id);
  if (!product) return;
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : ['M']);
  const defaultSize = sizes[0] || 'M';
  addToCart(product, defaultSize, 1);
}

/**
 * Reset all active filters to default state
 */
function resetFilters() {
  shopState.gender = 'all';
  shopState.category = 'all';
  shopState.size = 'all';
  shopState.maxPrice = 200;
  shopState.search = '';
  shopState.sort = 'featured';

  // Sync inputs
  document.querySelectorAll('input[name="gender-filter"]').forEach(r => r.checked = (r.value === 'all'));
  document.querySelectorAll('input[name="category-filter"]').forEach(r => r.checked = (r.value === 'all'));
  document.querySelectorAll('.size-filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.size === 'all'));

  const range = document.getElementById('price-range');
  if (range) range.value = 200;
  const priceVal = document.getElementById('price-indicator-val');
  if (priceVal) priceVal.textContent = 'Up to $200';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  applyFiltersAndRender();
}

/**
 * Initialize event listeners and parse URL query parameters
 */
function initShopEvents() {
  // Parse URL params (e.g. ?gender=men or ?category=shirts)
  const urlParams = new URLSearchParams(window.location.search);
  const paramGender = urlParams.get('gender');
  const paramCategory = urlParams.get('category');
  const paramSearch = urlParams.get('search');

  if (paramGender) {
    shopState.gender = paramGender.toLowerCase();
    const radio = document.querySelector(`input[name="gender-filter"][value="${shopState.gender}"]`);
    if (radio) radio.checked = true;

    const pageTitle = document.getElementById('shop-page-title');
    if (pageTitle) {
      pageTitle.textContent = `${paramGender.charAt(0).toUpperCase() + paramGender.slice(1)}'s Collection`;
    }
  }

  if (paramCategory) {
    shopState.category = paramCategory.toLowerCase();
    const radio = document.querySelector(`input[name="category-filter"][value="${shopState.category}"]`);
    if (radio) radio.checked = true;
  }

  if (paramSearch) {
    shopState.search = paramSearch;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = paramSearch;
  }

  // Gender Radio Listeners
  document.querySelectorAll('input[name="gender-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      shopState.gender = e.target.value;
      applyFiltersAndRender();
    });
  });

  // Category Radio Listeners
  document.querySelectorAll('input[name="category-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      shopState.category = e.target.value;
      applyFiltersAndRender();
    });
  });

  // Size Button Listeners
  document.querySelectorAll('.size-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      shopState.size = btn.dataset.size;
      applyFiltersAndRender();
    });
  });

  // Price Slider Listener
  const priceRange = document.getElementById('price-range');
  const priceVal = document.getElementById('price-indicator-val');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      shopState.maxPrice = Number(e.target.value);
      if (priceVal) priceVal.textContent = `Up to $${e.target.value}`;
      applyFiltersAndRender();
    });
  }

  // Search Input Listener with Debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        shopState.search = e.target.value;
        applyFiltersAndRender();
      }, 250);
    });
  }

  // Sort Dropdown Listener
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      shopState.sort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }

  // Load products
  loadProducts();
}

document.addEventListener('DOMContentLoaded', initShopEvents);
