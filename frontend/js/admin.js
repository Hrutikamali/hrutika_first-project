/* ==========================================================================
   StyleHub - Admin Dashboard Operations
   Provides product CRUD, stats aggregation, auth protection, and modal control
   ========================================================================== */

let adminProducts = [];
const adminToken = localStorage.getItem('stylehub_admin_token');

// Redirect if not logged in
if (!adminToken) {
  window.location.href = 'login.html';
}

/**
 * Fetch all products from API or fallback
 */
async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading inventory data...</td></tr>';
  }

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        adminProducts = data;
        renderAdminTable();
        return;
      }
    }
  } catch (err) {
    console.info('Backend API offline, displaying sample inventory catalog.');
  }

  // Fallback to sample data
  if (typeof SAMPLE_PRODUCTS !== 'undefined') {
    adminProducts = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
  } else {
    adminProducts = [];
  }

  renderAdminTable();
}

/**
 * Render the product list into the admin table and update statistics
 */
function renderAdminTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  // Update Stats
  updateAdminMetrics();

  if (adminProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No products found in inventory. Click <strong>+ Add New Product</strong> above to add one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminProducts.map(p => {
    const sizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || 'M');
    const isLowStock = p.stock <= 15;

    return `
      <tr data-id="${p.id}">
        <td>
          <img src="${p.image_url}" alt="${p.name}" class="table-thumb" onerror="this.src='https://placehold.co/48x56?text=Item'">
        </td>
        <td>
          <strong style="color: var(--primary);">${p.name}</strong>
          ${p.color ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${p.color}</div>` : ''}
        </td>
        <td><span style="text-transform: capitalize;">${p.category}</span></td>
        <td><span style="text-transform: capitalize;">${p.gender}</span></td>
        <td><strong>${formatPrice(p.price)}</strong></td>
        <td>
          <span class="stock-tag ${isLowStock ? 'low-stock' : 'in-stock'}">
            ${p.stock} units
          </span>
        </td>
        <td style="font-size: 0.8rem; color: var(--secondary);">${sizes}</td>
        <td>
          <button type="button" class="btn-action-edit" onclick="openEditModal(${p.id})">Edit</button>
          <button type="button" class="btn-action-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Compute and display overview statistics
 */
function updateAdminMetrics() {
  const totalProductsEl = document.getElementById('stat-total-products');
  const totalStockEl = document.getElementById('stat-total-stock');
  const avgPriceEl = document.getElementById('stat-avg-price');
  const lowStockEl = document.getElementById('stat-low-stock');

  const count = adminProducts.length;
  const totalStock = adminProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const avgPrice = count > 0 ? adminProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / count : 0;
  const lowStock = adminProducts.filter(p => Number(p.stock) <= 15).length;

  if (totalProductsEl) totalProductsEl.textContent = count;
  if (totalStockEl) totalStockEl.textContent = totalStock;
  if (avgPriceEl) avgPriceEl.textContent = formatPrice(avgPrice);
  if (lowStockEl) lowStockEl.textContent = lowStock;
}

/**
 * Open modal to Create a new product
 */
function openCreateModal() {
  const modal = document.getElementById('product-modal');
  const heading = document.getElementById('modal-heading');
  const form = document.getElementById('product-form');

  form.reset();
  document.getElementById('form-product-id').value = '';
  heading.textContent = 'Add New Clothing Product';
  modal.classList.add('open');
}

/**
 * Open modal to Edit an existing product
 */
function openEditModal(productId) {
  const product = adminProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('product-modal');
  const heading = document.getElementById('modal-heading');

  document.getElementById('form-product-id').value = product.id;
  document.getElementById('form-name').value = product.name;
  document.getElementById('form-gender').value = product.gender || 'men';
  document.getElementById('form-category').value = product.category || 'shirts';
  document.getElementById('form-price').value = product.price;
  document.getElementById('form-stock').value = product.stock;
  document.getElementById('form-sizes').value = Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || 'M');
  document.getElementById('form-color').value = product.color || '';
  document.getElementById('form-image').value = product.image_url;
  document.getElementById('form-desc').value = product.description || '';

  heading.textContent = `Edit Product: ${product.name}`;
  modal.classList.add('open');
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('open');
}

/**
 * Handle form submission for Add or Edit
 */
async function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('form-product-id').value;
  const name = document.getElementById('form-name').value.trim();
  const gender = document.getElementById('form-gender').value;
  const category = document.getElementById('form-category').value;
  const price = parseFloat(document.getElementById('form-price').value);
  const stock = parseInt(document.getElementById('form-stock').value, 10);
  const sizesRaw = document.getElementById('form-sizes').value.trim();
  const sizes = sizesRaw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const color = document.getElementById('form-color').value.trim();
  const image_url = document.getElementById('form-image').value.trim();
  const description = document.getElementById('form-desc').value.trim();

  const payload = {
    name,
    gender,
    category,
    price,
    stock,
    sizes,
    color,
    image_url,
    description
  };

  const isEditing = Boolean(id);
  const endpoint = isEditing ? `/api/products/${id}` : '/api/products';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const saved = await res.json();
      if (isEditing) {
        const index = adminProducts.findIndex(p => p.id === parseInt(id, 10));
        if (index > -1) adminProducts[index] = saved.product || { ...payload, id: parseInt(id, 10) };
      } else {
        adminProducts.unshift(saved.product || { ...payload, id: saved.id || Date.now() });
      }
      closeModal();
      renderAdminTable();
      showToast(`Product ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      return;
    }
  } catch (err) {
    console.info('API call failed; saving changes to active memory.');
  }

  // Local fallback save
  if (isEditing) {
    const targetId = parseInt(id, 10);
    const index = adminProducts.findIndex(p => p.id === targetId);
    if (index > -1) {
      adminProducts[index] = { ...adminProducts[index], ...payload };
    }
  } else {
    const newId = Math.max(0, ...adminProducts.map(p => p.id)) + 1;
    adminProducts.unshift({ ...payload, id: newId });
  }

  closeModal();
  renderAdminTable();
  showToast(`Product ${isEditing ? 'updated' : 'created'} locally!`, 'success');
}

/**
 * Delete a product
 */
async function deleteProduct(productId) {
  const product = adminProducts.find(p => p.id === productId);
  if (!product) return;

  if (!confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (res.ok) {
      adminProducts = adminProducts.filter(p => p.id !== productId);
      renderAdminTable();
      showToast('Product deleted from inventory', 'info');
      return;
    }
  } catch (err) {
    console.info('API call failed; deleting from active memory.');
  }

  adminProducts = adminProducts.filter(p => p.id !== productId);
  renderAdminTable();
  showToast('Product deleted from inventory', 'info');
}

/**
 * Handle admin logout
 */
function handleLogout() {
  localStorage.removeItem('stylehub_admin_token');
  localStorage.removeItem('stylehub_admin_user');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Display user name if stored
  const userJson = localStorage.getItem('stylehub_admin_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const displayEl = document.getElementById('admin-user-display');
      if (displayEl && user.email) {
        displayEl.textContent = `Logged in as: ${user.email}`;
      }
    } catch (_) {}
  }

  loadAdminProducts();

  // Attach buttons
  document.getElementById('btn-open-create-modal')?.addEventListener('click', openCreateModal);
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
  document.getElementById('product-form')?.addEventListener('submit', handleProductFormSubmit);
  document.getElementById('btn-admin-logout')?.addEventListener('click', handleLogout);
});
