// ============================================================
//  ConnectFarm — cart.js
//  Cart & Wishlist management
// ============================================================

const CF_CART = {
  _cartKey: 'cf_cart',
  _wishlistKey: 'cf_wishlist',

  // ─── Cart ───
  getCart() {
    return JSON.parse(localStorage.getItem(this._cartKey) || '[]');
  },
  saveCart(cart) {
    localStorage.setItem(this._cartKey, JSON.stringify(cart));
    this.updateCartUI();
  },
  addItem(productId, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      const product = CF_DATA.products.find(p => p.id === productId);
      if (!product) return;
      cart.push({ productId, qty, name: product.name, price: product.price, unit: product.unit, emoji: product.emoji, gradient: product.gradient });
    }
    this.saveCart(cart);
    CF_APP.toast(`Added to cart! 🛒`, 'success');
  },
  removeItem(productId) {
    const cart = this.getCart().filter(i => i.productId !== productId);
    this.saveCart(cart);
  },
  updateQty(productId, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
      if (qty <= 0) return this.removeItem(productId);
      item.qty = qty;
      this.saveCart(cart);
    }
  },
  clearCart() {
    localStorage.removeItem(this._cartKey);
    this.updateCartUI();
  },
  getTotal() {
    return this.getCart().reduce((sum, i) => sum + (i.price * i.qty), 0);
  },
  getCount() {
    return this.getCart().reduce((sum, i) => sum + i.qty, 0);
  },

  // ─── Wishlist ───
  getWishlist() {
    return JSON.parse(localStorage.getItem(this._wishlistKey) || '[]');
  },
  toggleWishlist(productId) {
    let wl = this.getWishlist();
    const idx = wl.indexOf(productId);
    if (idx === -1) {
      wl.push(productId);
      CF_APP.toast('Added to wishlist! 💚', 'success');
    } else {
      wl.splice(idx, 1);
      CF_APP.toast('Removed from wishlist', 'info');
    }
    localStorage.setItem(this._wishlistKey, JSON.stringify(wl));
    this.updateWishlistUI();
    return idx === -1; // returns true if added
  },
  isWishlisted(productId) {
    return this.getWishlist().includes(productId);
  },

  // ─── UI Updates ───
  updateCartUI() {
    const count = this.getCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
    this.renderCartSidebar();
  },
  updateWishlistUI() {
    const wl = this.getWishlist();
    document.querySelectorAll('.product-wishlist-btn').forEach(btn => {
      const pid = btn.dataset.productId;
      btn.classList.toggle('active', wl.includes(pid));
      btn.textContent = wl.includes(pid) ? '❤️' : '🤍';
    });
  },

  // ─── Render Cart Sidebar ───
  renderCartSidebar() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    const cart = this.getCart();
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-state" style="padding:var(--space-12)">
          <div class="empty-icon">🛒</div>
          <h3>Cart is empty</h3>
          <p>Add some fresh produce to get started!</p>
        </div>`;
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" id="cart-item-${item.productId}">
          <div class="cart-item-emoji" style="background:${item.gradient}">${item.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${CF_APP.formatPrice(item.price * item.qty)}</div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" onclick="CF_CART.updateQty('${item.productId}', ${item.qty - 1})">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="CF_CART.updateQty('${item.productId}', ${item.qty + 1})">+</button>
          </div>
          <button class="btn-icon" style="width:28px;height:28px;font-size:0.8rem" onclick="CF_CART.removeItem('${item.productId}')">🗑️</button>
        </div>
      `).join('');
    }

    // Update summary
    const subtotal = this.getTotal();
    const delivery = subtotal > 0 ? 20 : 0;
    const discount = subtotal > 300 ? Math.floor(subtotal * 0.05) : 0;
    const total = subtotal + delivery - discount;

    const summary = document.getElementById('cart-summary');
    if (summary) {
      summary.innerHTML = `
        <div class="cart-summary-row"><span>Subtotal</span><span>${CF_APP.formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row"><span>Delivery</span><span>${delivery > 0 ? CF_APP.formatPrice(delivery) : '<span style="color:var(--primary)">FREE</span>'}</span></div>
        ${discount > 0 ? `<div class="cart-summary-row" style="color:var(--primary)"><span>Discount (5%)</span><span>−${CF_APP.formatPrice(discount)}</span></div>` : ''}
        <div class="cart-summary-row total"><span>Total</span><span style="color:var(--primary)">${CF_APP.formatPrice(total)}</span></div>
      `;
    }
  },

  // ─── Checkout ───
  checkout() {
    const cart = this.getCart();
    if (cart.length === 0) { CF_APP.toast('Cart is empty!', 'warning'); return; }
    CF_APP.openModal('checkout-modal');
  },

  placeOrder(paymentMethod, address) {
    const cart = this.getCart();
    const user = CF_AUTH.getCurrentUser();
    const subtotal = this.getTotal();
    const delivery = 20;
    const discount = subtotal > 300 ? Math.floor(subtotal * 0.05) : 0;
    const total = subtotal + delivery - discount;

    const productIds = cart.map(i => i.productId);
    const farmerId = CF_DATA.autoAssignFarmer(productIds);

    const order = {
      id: CF_DATA.generateOrderId(),
      customerId: user.id,
      farmerId: farmerId, // Customer never sees this!
      deliveryAgentId: null,
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price, unit: i.unit })),
      subtotal, deliveryFee: delivery, discount, total,
      status: 'placed',
      paymentMethod,
      address,
      placedAt: new Date().toISOString(),
      tracking: [{ status: 'placed', time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}), msg: 'Order placed successfully!' }]
    };

    // Save to localStorage orders
    const orders = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('cf_orders', JSON.stringify(orders));

    this.clearCart();
    CF_APP.closeModal('checkout-modal');
    CF_APP.closeModal('cart-sidebar');
    CF_APP.toast(`Order #${order.id} placed! 🎉`, 'success', 5000);

    // Simulate order progression
    this._simulateOrderProgress(order.id);

    return order;
  },

  // ─── Simulate live order status updates ───
  _simulateOrderProgress(orderId) {
    const steps = [
      { status: 'confirmed', delay: 8000, msg: 'Farmer confirmed your order' },
      { status: 'packed', delay: 25000, msg: 'Order packed and ready for pickup' },
      { status: 'picked', delay: 45000, msg: 'Delivery agent picked up your order' },
      { status: 'out_for_delivery', delay: 90000, msg: 'Out for delivery!' },
    ];
    steps.forEach(({ status, delay, msg }) => {
      setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('cf_orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
          order.status = status;
          order.tracking = order.tracking || [];
          order.tracking.push({ status, time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}), msg });
          localStorage.setItem('cf_orders', JSON.stringify(orders));
          // Trigger UI refresh if on orders page
          if (typeof CF_CUSTOMER !== 'undefined' && CF_CUSTOMER.currentSection === 'orders') {
            CF_CUSTOMER.renderOrders();
          }
        }
      }, delay);
    });
  },

  // ─── Toggle cart sidebar ───
  toggleCartSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    }
  }
};

window.CF_CART = CF_CART;
