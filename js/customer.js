// ============================================================
//  ConnectFarm — customer.js
//  Customer dashboard logic: shop, cart, orders, tracking, profile
// ============================================================

let CF_CUSTOMER_USER = null;
let currentFilter = 'all';
let currentSort = '';
let currentSearch = '';

const CF_CUSTOMER = {
  currentSection: 'shop',

  init() {
    CF_CUSTOMER_USER = CF_APP.initPage('customer');
    if (!CF_CUSTOMER_USER) return;

    this.renderCategoryFilters();
    this.renderProducts();
    this.updateCounts();
    CF_CART.updateCartUI();
    CF_CART.updateWishlistUI();
    this.fillProfile();
    this.preloadCheckoutAddress();

    // Live refresh every 10 seconds
    setInterval(() => {
      if (this.currentSection === 'orders') this.renderOrders();
      if (this.currentSection === 'track') {
        const inp = document.getElementById('track-input');
        if (inp && inp.value) this.trackOrder();
      }
    }, 10000);
  },

  showSection(section) {
    this.currentSection = section;
    const sections = ['shop', 'wishlist', 'orders', 'track', 'profile'];
    sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === section ? '' : 'none';
    });
    // Nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
    // Page title
    const titles = {
      shop: ['Browse Products', 'Fresh farm produce daily'],
      wishlist: ['Wishlist', 'Your saved items'],
      orders: ['My Orders', 'Track and manage orders'],
      track: ['Track Order', 'Real-time order tracking'],
      profile: ['My Profile', 'Manage your account']
    };
    const [title, sub] = titles[section] || ['—', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = sub;

    if (section === 'shop') { currentSearch = ''; document.getElementById('search-input').value = ''; this.renderProducts(); }
    if (section === 'wishlist') this.renderWishlist();
    if (section === 'orders') this.renderOrders();
    if (section === 'profile') this.fillProfile();
  },

  // ─── Category Filters ───
  renderCategoryFilters() {
    const el = document.getElementById('category-filters');
    if (!el) return;
    el.innerHTML = CF_DATA.categories.map(c => `
      <span class="filter-chip ${c.id === 'all' ? 'active' : ''}" onclick="CF_CUSTOMER.filterByCategory('${c.id}', this)">
        ${c.emoji} ${c.label}
      </span>`).join('');
  },

  filterByCategory(cat, el) {
    currentFilter = cat;
    document.querySelectorAll('#category-filters .filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderProducts();
  },

  handleSearch: CF_APP.debounce ? null : function(val) {
    currentSearch = val.toLowerCase();
    CF_CUSTOMER.renderProducts();
  },

  sortProducts(val) {
    currentSort = val;
    this.renderProducts();
  },

  // ─── Products Grid ───
  renderProducts() {
    const el = document.getElementById('products-grid');
    if (!el) return;
    let products = [...CF_DATA.products];
    if (currentFilter !== 'all') products = products.filter(p => p.category === currentFilter);
    if (currentSearch) products = products.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.description.toLowerCase().includes(currentSearch) ||
      p.subcategory.toLowerCase().includes(currentSearch)
    );
    if (currentSort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') products.sort((a, b) => b.rating - a.rating);

    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = `${products.length} products found`;

    if (products.length === 0) {
      el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div><h3>No products found</h3><p>Try a different search or category</p></div>`;
      return;
    }

    const wl = CF_CART.getWishlist();
    const cart = CF_CART.getCart();
    const discount = p => Math.round(((p.mrp - p.price) / p.mrp) * 100);

    el.innerHTML = products.map(p => {
      const inCart = cart.find(i => i.productId === p.id);
      const inWl = wl.includes(p.id);
      // Use real image if farmer uploaded one, else emoji
      const imgContent = p.image
        ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:0" />`
        : `<span style="font-size:3.5rem">${p.emoji}</span>`;
      return `
        <div class="product-card animate-fade-in" onclick="CF_CUSTOMER.openProductModal('${p.id}')">
          <div class="product-card-img" style="background:${p.gradient}">
            ${imgContent}
            ${discount(p) > 0 ? `<div class="product-card-tag">${discount(p)}% OFF</div>` : ''}
            <button class="product-wishlist-btn ${inWl ? 'active' : ''}" data-product-id="${p.id}"
              onclick="event.stopPropagation();CF_CUSTOMER.toggleWishlist('${p.id}', this)">
              ${inWl ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="product-card-body">
            <div class="product-name">${p.name}</div>
            <div class="product-category-label">${p.subcategory} • ${p.farmName}</div>
            <div class="product-rating">
              <span class="stars" style="color:var(--secondary);font-size:0.7rem">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
              <span class="count">(${p.reviews})</span>
            </div>
            <div class="product-price-row">
              <div><span class="product-price">₹${p.price}</span><span class="product-unit">/${p.unit}</span></div>
              <span class="product-mrp">₹${p.mrp}</span>
            </div>
          </div>
          <div class="product-card-actions">
            ${inCart
              ? `<div class="qty-control" style="flex:1;justify-content:center">
                  <button class="qty-btn" onclick="event.stopPropagation();CF_CART.updateQty('${p.id}',${inCart.qty-1})">−</button>
                  <span class="qty-value">${inCart.qty}</span>
                  <button class="qty-btn" onclick="event.stopPropagation();CF_CART.updateQty('${p.id}',${inCart.qty+1})">+</button>
                </div>`
              : `<button class="btn btn-primary w-full" style="font-size:var(--text-xs)"
                  onclick="event.stopPropagation();CF_CART.addItem('${p.id}');CF_CUSTOMER.renderProducts()">
                  🛒 Add to Cart
                </button>`}
          </div>
        </div>`;
    }).join('');
  },

  openProductModal(productId) {
    const p = CF_DATA.products.find(pr => pr.id === productId);
    if (!p) return;
    // Simple modal approach
    CF_APP.toast(`${p.emoji} ${p.name} — ${p.description.substring(0, 80)}...`, 'info', 4000);
  },

  toggleWishlist(productId, btn) {
    const added = CF_CART.toggleWishlist(productId);
    btn.classList.toggle('active', added);
    btn.textContent = added ? '❤️' : '🤍';
    this.updateCounts();
    if (this.currentSection === 'wishlist') this.renderWishlist();
  },

  // ─── Wishlist ───
  renderWishlist() {
    const el = document.getElementById('wishlist-grid');
    if (!el) return;
    const wl = CF_CART.getWishlist();
    if (wl.length === 0) {
      el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🤍</div><h3>Wishlist is empty</h3>
        <p>Heart products you love to save them here</p>
        <button class="btn btn-primary" style="margin-top:var(--space-4)" onclick="CF_CUSTOMER.showSection('shop')">Browse Products</button></div>`;
      return;
    }
    const products = wl.map(id => CF_DATA.products.find(p => p.id === id)).filter(Boolean);
    const discount = p => Math.round(((p.mrp - p.price) / p.mrp) * 100);
    el.innerHTML = products.map(p => {
      const imgContent = p.image
        ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:0" />`
        : `<span style="font-size:3.5rem">${p.emoji}</span>`;
      return `
      <div class="product-card animate-fade-in">
        <div class="product-card-img" style="background:${p.gradient}">
          ${imgContent}
          ${discount(p) > 0 ? `<div class="product-card-tag">${discount(p)}% OFF</div>` : ''}
          <button class="product-wishlist-btn active" data-product-id="${p.id}"
            onclick="CF_CUSTOMER.toggleWishlist('${p.id}', this)">❤️</button>
        </div>
        <div class="product-card-body">
          <div class="product-name">${p.name}</div>
          <div class="product-category-label">${p.subcategory}</div>
          <div class="product-price-row">
            <div><span class="product-price">₹${p.price}</span><span class="product-unit">/${p.unit}</span></div>
            <span class="product-mrp">₹${p.mrp}</span>
          </div>
        </div>
        <div class="product-card-actions">
          <button class="btn btn-primary w-full" style="font-size:var(--text-xs)"
            onclick="CF_CART.addItem('${p.id}');CF_APP.toast('Added to cart! 🛒','success')">
            🛒 Add to Cart
          </button>
        </div>
      </div>`;
    }).join('');
  },

  // ─── Orders ───
  renderOrders() {
    const el = document.getElementById('orders-list');
    if (!el || !CF_CUSTOMER_USER) return;
    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    const preloaded = CF_DATA.orders.filter(o => o.customerId === CF_CUSTOMER_USER.id);
    const allOrders = [...saved, ...preloaded].filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i);
    const userOrders = allOrders.filter(o => o.customerId === CF_CUSTOMER_USER.id);

    if (userOrders.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3>
        <p>Start shopping to see your orders here!</p>
        <button class="btn btn-primary" style="margin-top:var(--space-4)" onclick="CF_CUSTOMER.showSection('shop')">Shop Now</button></div>`;
      return;
    }

    const statusLabel = { placed:'Order Placed', confirmed:'Confirmed', packed:'Packed', picked:'Picked Up', out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled' };
    el.innerHTML = userOrders.map(order => `
      <div class="card" style="margin-bottom:var(--space-4);border-color:${order.status==='delivered'?'rgba(16,185,129,0.3)':order.status==='out_for_delivery'?'rgba(245,158,11,0.3)':'var(--border)'}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-4)">
          <div>
            <div style="font-weight:700;font-size:var(--text-base)">#${order.id}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${new Date(order.placedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} • ${order.paymentMethod}</div>
          </div>
          <span class="order-status ${order.status}">● ${statusLabel[order.status] || order.status}</span>
        </div>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-4)">
          ${order.items.map(item => {
            const p = CF_DATA.products.find(pr => pr.id === item.productId);
            return `<div style="display:flex;align-items:center;gap:var(--space-2);background:var(--surface);border-radius:var(--radius);padding:var(--space-2) var(--space-3)">
              <span style="font-size:1.3rem">${p ? p.emoji : '📦'}</span>
              <div>
                <div style="font-size:var(--text-xs);font-weight:600">${item.name}</div>
                <div style="font-size:10px;color:var(--text-tertiary)">${item.qty} ${item.unit} • ₹${item.price*item.qty}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:var(--space-3)">
          <div style="font-size:var(--text-sm)">Total: <strong style="color:var(--primary)">₹${order.total}</strong></div>
          <div style="display:flex;gap:var(--space-3)">
            <button class="btn btn-ghost btn-sm" onclick="CF_CUSTOMER.showTrackModal('${order.id}')">📍 Track</button>
            ${order.status === 'delivered' ? '<button class="btn btn-outline btn-sm" onclick="CF_APP.toast(\'Reorder placed! 🎉\',\'success\')">🔄 Reorder</button>' : ''}
          </div>
        </div>
        ${order.status !== 'delivered' && order.status !== 'cancelled' ? this._renderMiniTrack(order) : ''}
      </div>`).join('');
  },

  _renderMiniTrack(order) {
    const steps = ['placed','confirmed','packed','out_for_delivery','delivered'];
    const curIdx = steps.indexOf(order.status);
    return `<div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:0;position:relative">
        <div style="position:absolute;top:12px;left:0;right:0;height:2px;background:var(--border);z-index:0"></div>
        <div style="position:absolute;top:12px;left:0;height:2px;background:var(--gradient-primary);z-index:1;width:${Math.max(0,(curIdx/(steps.length-1))*100)}%;transition:width 1s"></div>
        ${steps.map((s, i) => {
          const labels = { placed:'Placed', confirmed:'Confirmed', packed:'Packed', out_for_delivery:'Shipped', delivered:'Delivered' };
          const done = i <= curIdx;
          return `<div style="flex:1;text-align:center;position:relative;z-index:2">
            <div style="width:24px;height:24px;border-radius:50%;background:${done?'var(--gradient-primary)':'var(--bg-elevated)'};border:2px solid ${done?'var(--primary)':'var(--border)'};margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all 0.5s">
              ${done ? '✓' : ''}
            </div>
            <div style="font-size:9px;color:${done?'var(--primary)':'var(--text-muted)'};font-weight:${done?700:400}">${labels[s]}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  showTrackModal(orderId) {
    this.showSection('track');
    document.getElementById('track-input').value = orderId;
    this.trackOrder();
  },

  // ─── Order Tracking ───
  trackOrder() {
    const input = document.getElementById('track-input');
    if (!input || !input.value.trim()) return;
    const orderId = input.value.trim();

    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    const allOrders = [...saved, ...CF_DATA.orders];
    const order = allOrders.find(o => o.id === orderId);
    const el = document.getElementById('track-result');
    if (!el) return;

    if (!order) {
      el.innerHTML = `<div class="card" style="border-color:var(--danger);text-align:center">
        <div style="font-size:2rem;margin-bottom:var(--space-3)">❌</div>
        <h3>Order not found</h3>
        <p>Check the order ID and try again</p></div>`;
      return;
    }

    const statusLabel = { placed:'Order Placed', confirmed:'Farmer Confirmed', packed:'Packed & Ready', picked:'Picked Up', out_for_delivery:'Out for Delivery', delivered:'✅ Delivered' };
    el.innerHTML = `
      <div class="card animate-fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5);flex-wrap:wrap;gap:var(--space-3)">
          <div>
            <h3>#${order.id}</h3>
            <p style="font-size:var(--text-sm)">Placed: ${new Date(order.placedAt).toLocaleString('en-IN')}</p>
          </div>
          <span class="order-status ${order.status}">● ${statusLabel[order.status] || order.status}</span>
        </div>
        <div style="margin-bottom:var(--space-6)">
          <h4 style="margin-bottom:var(--space-4)">Order Timeline</h4>
          <div class="tracking-timeline">
            ${(order.tracking || []).map((step, i) => `
              <div class="tracking-step ${i < (order.tracking.length-1) ? 'done' : 'current'}">
                <div class="tracking-step-title">${step.msg}</div>
                <div class="tracking-step-time">${step.time}</div>
              </div>`).join('')}
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:var(--space-4)">
          <h4 style="margin-bottom:var(--space-3)">Order Items</h4>
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            ${order.items.map(item => {
              const p = CF_DATA.products.find(pr => pr.id === item.productId);
              return `<div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--surface);border-radius:var(--radius)">
                <span style="font-size:1.5rem">${p ? p.emoji : '📦'}</span>
                <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">${item.name}</div></div>
                <div style="text-align:right;font-size:var(--text-sm)">
                  <div>${item.qty} ${item.unit}</div>
                  <div style="color:var(--primary);font-weight:700">₹${item.price * item.qty}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div style="margin-top:var(--space-4);text-align:right">
            <strong>Total: <span style="color:var(--primary)">₹${order.total}</span></strong>
          </div>
        </div>
        <div style="margin-top:var(--space-4);padding:var(--space-4);background:var(--surface);border-radius:var(--radius);font-size:var(--text-sm)">
          <div>📍 Delivering to: ${order.address}</div>
          <div style="margin-top:var(--space-2)">💳 Payment: ${order.paymentMethod}</div>
          ${order.status !== 'delivered' ? `<div style="margin-top:var(--space-2);color:var(--secondary)">🚚 Fulfilled by ConnectFarm</div>` : ''}
        </div>
      </div>`;
  },

  // ─── Checkout ───
  confirmOrder() {
    const address = document.getElementById('checkout-address')?.value.trim();
    const payment = document.getElementById('selected-payment')?.value;
    if (!address) { CF_APP.toast('Please enter delivery address', 'warning'); return; }
    CF_CART.placeOrder(payment || 'UPI', address);
    setTimeout(() => { this.showSection('orders'); }, 1500);
  },

  preloadCheckoutAddress() {
    const addrEl = document.getElementById('checkout-address');
    if (addrEl && CF_CUSTOMER_USER?.address) addrEl.value = CF_CUSTOMER_USER.address;
  },

  // ─── Profile ───
  fillProfile() {
    const u = CF_CUSTOMER_USER;
    if (!u) return;
    const fields = {
      'profile-name': u.name, 'profile-email': u.email,
      'profile-city': u.city || 'Not set',
      'profile-joined': CF_APP.formatDate(u.joined),
      'profile-points': u.loyaltyPoints || 0,
      'profile-orders-count': `${u.totalOrders || 0} orders`,
      'profile-avatar': u.avatar || '👤',
      'sidebar-avatar': u.avatar || '👤',
      'edit-name': null, 'edit-phone': null, 'edit-address': null
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== null) el.textContent = val;
    });
    const editName = document.getElementById('edit-name');
    const editPhone = document.getElementById('edit-phone');
    const editAddr = document.getElementById('edit-address');
    if (editName) editName.value = u.name;
    if (editPhone) editPhone.value = u.phone;
    if (editAddr) editAddr.value = u.address || '';

    CF_APP.animateCounter(document.getElementById('profile-points'), u.loyaltyPoints || 0, 1000);
  },

  saveProfile() {
    const name = document.getElementById('edit-name')?.value.trim();
    const phone = document.getElementById('edit-phone')?.value.trim();
    const address = document.getElementById('edit-address')?.value.trim();
    CF_AUTH.updateUser({ name, phone, address });
    CF_CUSTOMER_USER = CF_AUTH.getCurrentUser();
    CF_APP.toast('Profile updated! ✅', 'success');
    this.fillProfile();
  },

  // ─── Update counts ───
  updateCounts() {
    const wlCount = document.getElementById('wishlist-count');
    if (wlCount) wlCount.textContent = CF_CART.getWishlist().length;
  }
};

// Helpers
function selectPayment(method, el) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selected-payment').value = method;
  // Update preview
  const preview = document.getElementById('checkout-summary-preview');
  if (preview) {
    const subtotal = CF_CART.getTotal();
    preview.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)"><span>Subtotal</span><span>₹${subtotal}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)"><span>Delivery</span><span>₹20</span></div>
      ${subtotal > 300 ? `<div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);color:var(--primary)"><span>Discount (5%)</span><span>-₹${Math.floor(subtotal*0.05)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--border);padding-top:var(--space-2)"><span>Total</span><span style="color:var(--primary)">₹${subtotal + 20 - (subtotal > 300 ? Math.floor(subtotal*0.05) : 0)}</span></div>
      <div style="margin-top:var(--space-3);color:var(--text-secondary);font-size:var(--text-xs)">Payment: ${method}</div>`;
  }
}

// Auto init search debounce
CF_CUSTOMER.handleSearch = CF_APP.debounce(function(val) {
  currentSearch = val.toLowerCase().trim();
  CF_CUSTOMER.renderProducts();
}, 300);

// ─── Auto-init on page load ───
window.addEventListener('DOMContentLoaded', () => CF_CUSTOMER.init());
