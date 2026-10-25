/* ==========================================================================
   StyleHub - Shared Frontend Logic & Utilities
   Handles cart storage, mobile navigation, toast alerts, and header dynamics
   ========================================================================== */

// Cart Storage Key
const CART_STORAGE_KEY = 'stylehub_cart_items';

/**
 * Format number into USD currency string
 * @param {number} amount
 * @returns {string} e.g. "$49.99"
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Retrieve current cart from localStorage
 * @returns {Array} Array of cart items
 */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading cart from localStorage', err);
    return [];
  }
}

/**
 * Save cart items to localStorage and update UI badge
 * @param {Array} cart
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  } catch (err) {
    console.error('Error saving cart to localStorage', err);
  }
}

/**
 * Add an item to the shopping cart
 * @param {Object} product - Product object
 * @param {string} size - Selected size
 * @param {number} quantity - Quantity to add
 */
function addToCart(product, size, quantity = 1) {
  if (!size) {
    showToast('Please select a size first', 'warning');
    return false;
  }

  const cart = getCart();
  // Check if item with same product ID AND size already exists
  const existingIndex = cart.findIndex(
    item => item.id === product.id && item.selectedSize === size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      selectedSize: size,
      color: product.color || '',
      image_url: product.image_url,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" (${size}) to cart!`, 'success');
  return true;
}

/**
 * Update the numeric badge on the cart icon in navbar
 */
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? 'flex' : 'none';
}

/**
 * Show a sleek floating toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 1.1rem;">${iconMap[type] || 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 3.2 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * Setup mobile menu toggle and sticky header listeners
 */
function initGlobalUI() {
  // Update cart badge initially
  updateCartBadge();

  // Sticky header shadow on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isOpen = navLinks.classList.contains('active');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Newsletter signup form handling
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast(`Thank you! ${input.value.trim()} has been subscribed to StyleHub.`, 'success');
        input.value = '';
      }
    });
  }
}

// Run on DOM load
document.addEventListener('DOMContentLoaded', initGlobalUI);
