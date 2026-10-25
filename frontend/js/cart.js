/* ==========================================================================
   StyleHub - Shopping Cart Logic
   Handles cart rendering, item updates, deletions, promo codes, and checkout
   ========================================================================== */

let appliedDiscountPercent = 0; // 0.20 when STYLE20 is active

/**
 * Render all cart items or display empty state
 */
function renderCartPage() {
  const container = document.getElementById('cart-items-list');
  const wrapper = document.getElementById('cart-content-wrapper');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (wrapper) {
      wrapper.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 4.5rem 1.5rem;">
          <div class="empty-state-icon">🛒</div>
          <h2>Your Shopping Bag is Currently Empty</h2>
          <p>Explore our latest seasonal styles, premium shirts, and denim essentials.</p>
          <a href="shop.html" class="btn btn-primary" style="margin-top: 1rem;">
            Explore Collections →
          </a>
        </div>
      `;
    }
    return;
  }

  // Render list of items
  container.innerHTML = cart.map((item, index) => {
    const lineTotal = Number(item.price) * (item.quantity || 1);
    return `
      <div class="cart-item-row" data-index="${index}">
        <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
        
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <div class="cart-item-meta">
            <span>Size: <strong>${item.selectedSize}</strong></span>
            ${item.color ? `<span>Color: <strong>${item.color}</strong></span>` : ''}
          </div>
          <div class="cart-item-price">${formatPrice(item.price)} each</div>
        </div>

        <div class="cart-qty-controls">
          <button type="button" class="cart-qty-btn" onclick="updateItemQuantity(${index}, -1)" aria-label="Decrease quantity">-</button>
          <span class="cart-qty-val">${item.quantity || 1}</span>
          <button type="button" class="cart-qty-btn" onclick="updateItemQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
        </div>

        <div class="cart-item-total">
          <div class="cart-item-total-price">${formatPrice(lineTotal)}</div>
          <button type="button" class="btn-remove-item" onclick="removeCartItem(${index})">
            ✕ Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Calculate and update order summary totals
  calculateTotals(cart);
}

/**
 * Adjust the quantity of an item at a specific index
 */
function updateItemQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;

  const newQty = (cart[index].quantity || 1) + delta;
  if (newQty <= 0) {
    removeCartItem(index);
    return;
  }

  cart[index].quantity = newQty;
  saveCart(cart);
  renderCartPage();
}

/**
 * Remove an item from the cart
 */
function removeCartItem(index) {
  const cart = getCart();
  if (!cart[index]) return;

  const removedName = cart[index].name;
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
  showToast(`Removed "${removedName}" from cart`, 'info');
}

/**
 * Calculate Subtotal, Shipping, Discount, Tax, and Grand Total
 */
function calculateTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  // Free shipping threshold: $75
  const freeShippingThreshold = 75;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 7.99;

  // Promo discount
  const discountAmount = subtotal * appliedDiscountPercent;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Estimated Tax: 6%
  const tax = discountedSubtotal * 0.06;

  // Final Total
  const total = discountedSubtotal + (subtotal > 0 ? shipping : 0) + tax;

  // DOM Elements
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

  if (discountRow && discountEl) {
    if (appliedDiscountPercent > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (taxEl) taxEl.textContent = formatPrice(tax);
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Free Shipping Progress Tracker
  const trackerText = document.getElementById('shipping-tracker-text');
  const trackerBar = document.getElementById('shipping-tracker-bar');
  if (trackerText && trackerBar) {
    if (subtotal >= freeShippingThreshold) {
      trackerText.innerHTML = '🎉 You unlocked <strong>FREE Express Shipping</strong>!';
      trackerBar.style.width = '100%';
      trackerBar.style.background = 'var(--success)';
    } else {
      const remaining = freeShippingThreshold - subtotal;
      const percent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      trackerText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more for FREE Express Shipping`;
      trackerBar.style.width = `${percent}%`;
    }
  }
}

/**
 * Handle promo code submission
 */
function handlePromoCode() {
  const input = document.getElementById('promo-input');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a promo code', 'warning');
    return;
  }

  if (code === 'STYLE20') {
    appliedDiscountPercent = 0.20;
    showToast('Promo code STYLE20 applied! 20% discount granted.', 'success');
    renderCartPage();
  } else {
    showToast('Invalid promotional coupon code', 'error');
  }
}

/**
 * Simulate checkout
 */
function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty', 'warning');
    return;
  }

  // Visual success confirmation
  const totalEl = document.getElementById('cart-total');
  const finalPrice = totalEl ? totalEl.textContent : '$0.00';

  if (confirm(`Confirm checkout of ${cart.length} item(s) for a total of ${finalPrice}? (Demo order simulation)`)) {
    // Clear cart
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadge();
    
    // Replace layout with order confirmation screen
    const wrapper = document.getElementById('cart-content-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 4.5rem 1.5rem; text-align: center;">
          <div style="font-size: 3.5rem; color: var(--success); margin-bottom: 1rem;">✓</div>
          <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Order Successfully Placed!</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem;">
            Order reference <strong>#SH-${Math.floor(100000 + Math.random() * 900000)}</strong>. A confirmation email has been logged. Thank you for shopping with StyleHub!
          </p>
          <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
    }
    showToast('Order confirmed successfully!', 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  const promoBtn = document.getElementById('btn-apply-promo');
  if (promoBtn) {
    promoBtn.addEventListener('click', handlePromoCode);
  }

  const promoInput = document.getElementById('promo-input');
  if (promoInput) {
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePromoCode();
      }
    });
  }

  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
});
