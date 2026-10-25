/* ==========================================================================
   StyleHub - Product Details Script
   Renders product data, handles size selection, quantity increments, 
   stock validation, and related product recommendations
   ========================================================================== */

let currentProduct = null;
let selectedSize = '';
let selectedQuantity = 1;

/**
 * Load product details based on ?id= query param
 */
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'), 10);

  const container = document.getElementById('product-details-content');
  if (!productId) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
          <h2>Product Not Found</h2>
          <p style="color: var(--text-muted); margin: 1rem 0 2rem;">Please browse our shop to pick an item.</p>
          <a href="shop.html" class="btn btn-primary">Go to Shop</a>
        </div>
      `;
    }
    return;
  }

  // Attempt to fetch from backend API
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (res.ok) {
      currentProduct = await res.json();
    }
  } catch (err) {
    console.info('Backend API offline, looking up product in sample catalog.');
  }

  // Fallback to sample data if not fetched from backend
  if (!currentProduct && typeof SAMPLE_PRODUCTS !== 'undefined') {
    currentProduct = SAMPLE_PRODUCTS.find(p => p.id === productId);
  }

  if (!currentProduct) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
          <h2>Product Not Found</h2>
          <p style="color: var(--text-muted); margin: 1rem 0 2rem;">The requested product could not be located.</p>
          <a href="shop.html" class="btn btn-primary">Explore Products</a>
        </div>
      `;
    }
    return;
  }

  // Update Breadcrumb & Document Title
  document.title = `${currentProduct.name} | StyleHub`;
  const breadcrumbName = document.getElementById('breadcrumb-product-name');
  if (breadcrumbName) {
    breadcrumbName.textContent = currentProduct.name;
  }

  // Normalize sizes
  const sizes = Array.isArray(currentProduct.sizes)
    ? currentProduct.sizes
    : (typeof currentProduct.sizes === 'string' ? currentProduct.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L']);

  // Set default size
  selectedSize = sizes[0] || 'M';

  // Render Product Details UI
  container.innerHTML = `
    <!-- Gallery -->
    <div class="detail-gallery">
      <div class="main-image-container">
        <img id="main-product-img" src="${currentProduct.image_url}" alt="${currentProduct.name}">
      </div>
    </div>

    <!-- Info & Actions -->
    <div class="detail-info">
      <div class="detail-tag">${currentProduct.gender} &bull; ${currentProduct.category}</div>
      <h1 class="detail-title">${currentProduct.name}</h1>
      
      <div class="detail-price-row">
        <span class="detail-price">${formatPrice(currentProduct.price)}</span>
        ${currentProduct.original_price ? `<span class="detail-original-price">${formatPrice(currentProduct.original_price)}</span>` : ''}
        <span class="stock-badge">
          ● ${currentProduct.stock > 5 ? `In Stock (${currentProduct.stock} left)` : `Low Stock: Only ${currentProduct.stock} left!`}
        </span>
      </div>

      <p class="detail-desc">${currentProduct.description}</p>

      ${currentProduct.color ? `
        <div class="color-pill">
          <span>Selected Color:</span>
          <strong style="color: var(--primary);">${currentProduct.color}</strong>
        </div>
      ` : ''}

      <!-- Size Selection -->
      <div class="selector-label">
        <span>Select Size</span>
        <span style="font-weight: 500; font-size: 0.85rem; color: var(--accent);">Size Guide</span>
      </div>
      <div class="size-selector-grid" id="size-options-container">
        ${sizes.map((s, index) => `
          <button type="button" class="size-option-btn ${index === 0 ? 'selected' : ''}" data-size="${s}">
            ${s}
          </button>
        `).join('')}
      </div>

      <!-- Quantity Selection -->
      <div class="selector-label">
        <span>Quantity</span>
      </div>
      <div class="quantity-control-row">
        <div class="quantity-picker">
          <button type="button" class="qty-btn" id="btn-qty-minus" aria-label="Decrease quantity">-</button>
          <input type="text" class="qty-input" id="qty-input" value="1" readonly>
          <button type="button" class="qty-btn" id="btn-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-row">
        <button type="button" class="btn btn-primary" id="btn-detail-add-cart">
          🛒 Add to Shopping Cart
        </button>
      </div>

      <!-- Perks Box -->
      <div class="perks-box">
        <div>📦 <strong>Free standard delivery</strong> on orders over $75</div>
        <div>🔄 <strong>30-day effortless returns</strong> & instant exchanges</div>
        <div>🌿 <strong>Sustainably sourced</strong> cotton & ethical manufacturing</div>
      </div>
    </div>
  `;

  // Attach event listeners for size and quantity
  attachDetailEvents();

  // Render related products
  renderRelatedProducts();
}

/**
 * Wire size buttons, qty increment/decrement, and add to cart button
 */
function attachDetailEvents() {
  // Size selection
  const sizeBtns = document.querySelectorAll('.size-option-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.size;
    });
  });

  // Quantity controls
  const qtyInput = document.getElementById('qty-input');
  const minusBtn = document.getElementById('btn-qty-minus');
  const plusBtn = document.getElementById('btn-qty-plus');

  minusBtn.addEventListener('click', () => {
    if (selectedQuantity > 1) {
      selectedQuantity--;
      qtyInput.value = selectedQuantity;
    }
  });

  plusBtn.addEventListener('click', () => {
    const maxStock = currentProduct.stock || 50;
    if (selectedQuantity < maxStock) {
      selectedQuantity++;
      qtyInput.value = selectedQuantity;
    } else {
      showToast(`Cannot add more than available stock (${maxStock})`, 'warning');
    }
  });

  // Add to cart click
  const addCartBtn = document.getElementById('btn-detail-add-cart');
  addCartBtn.addEventListener('click', () => {
    if (!selectedSize) {
      showToast('Please select a clothing size first', 'warning');
      return;
    }

    addToCart(currentProduct, selectedSize, selectedQuantity);
  });
}

/**
 * Render related products from same gender or category
 */
function renderRelatedProducts() {
  const container = document.getElementById('related-products-grid');
  if (!container || !currentProduct || typeof SAMPLE_PRODUCTS === 'undefined') return;

  const related = SAMPLE_PRODUCTS.filter(p => 
    p.id !== currentProduct.id && 
    (p.gender === currentProduct.gender || p.category === currentProduct.category)
  ).slice(0, 4);

  if (related.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = related.map(product => {
    const sizes = Array.isArray(product.sizes) ? product.sizes : ['M'];
    const sizesHtml = sizes.map(s => `<span class="size-chip">${s}</span>`).join('');

    return `
      <div class="product-card">
        <div class="product-image-wrapper">
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
          </div>
          <div class="product-card-actions">
            <a href="product.html?id=${product.id}" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center;">
              View Piece →
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadProductDetails);
