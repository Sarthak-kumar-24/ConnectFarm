// ============================================================
//  ConnectFarm — farmer.js
//  Farmer dashboard: overview, orders, products, earnings
// ============================================================

let CF_FARMER_USER = null;
let farmerProducts = [];
let farmerOrderFilter = 'all';
let editingProductId = null;

const CF_FARMER = {
  currentSection: 'overview',

  init() {
    CF_FARMER_USER = CF_APP.initPage('farmer');
    if (!CF_FARMER_USER) return;

    // Load farmer's products from localStorage or default data
    const saved = JSON.parse(localStorage.getItem('cf_farmer_products') || 'null');
    farmerProducts = saved || CF_DATA.products.filter(p => p.farmerId === CF_FARMER_USER.id);

    this.renderOverviewStats();
    this.renderRecentOrders();
    this.initCharts();

    // Live update orders badge every 15s
    setInterval(() => {
      const pending = this.getFarmerOrders().filter(o => o.status === 'confirmed').length;
      const badge = document.getElementById('pending-orders-badge');
      if (badge) badge.textContent = pending;
    }, 15000);

    // Live-update page title with farm name
    const subtitle = document.getElementById('page-subtitle');
    if (subtitle) subtitle.textContent = CF_FARMER_USER.farmName || 'Your Farm Dashboard';

    // Product form live preview (name + emoji)
    ['fp-emoji','fp-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        const emoji = document.getElementById('fp-emoji')?.value || '🌿';
        const name = document.getElementById('fp-name')?.value || 'Product Preview';
        const prev = document.getElementById('preview-emoji');
        const prevName = document.getElementById('preview-name');
        if (prev) prev.textContent = emoji;
        if (prevName) prevName.textContent = name;
      });
    });
  },

  // ─── Image upload preview ───
  previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { CF_APP.toast('Image too large (max 5MB)', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      // Show in upload area
      const placeholder = document.getElementById('img-placeholder');
      const preview = document.getElementById('img-preview');
      if (placeholder) placeholder.style.display = 'none';
      if (preview) { preview.src = src; preview.style.display = 'block'; }
      // Show in product preview card
      const previewPhoto = document.getElementById('preview-photo');
      const previewEmoji = document.getElementById('preview-emoji');
      if (previewPhoto) { previewPhoto.src = src; previewPhoto.style.display = 'block'; }
      if (previewEmoji) previewEmoji.style.display = 'none';
    };
    reader.readAsDataURL(file);
  },

  showSection(section) {
    this.currentSection = section;
    ['overview','orders','products','add-product','earnings'].forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === section ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
    const titles = {
      overview: ['Farm Overview', CF_FARMER_USER?.farmName || 'Your dashboard'],
      orders: ['Orders', 'Manage incoming orders'],
      products: ['My Products', 'View and edit your listings'],
      'add-product': ['Add Product', 'List a new product on ConnectFarm'],
      earnings: ['Earnings', 'Revenue & financial analytics']
    };
    const [title, sub] = titles[section] || ['—', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = sub;

    if (section === 'orders') this.renderFarmerOrders();
    if (section === 'products') this.renderFarmerProducts();
    if (section === 'earnings') this.renderEarnings();
  },

  // ─── Overview Stats ───
  renderOverviewStats() {
    const el = document.getElementById('overview-stats');
    if (!el) return;
    const stats = CF_DATA.farmerStats;
    const items = [
      { icon:'💰', label:'This Month', value:`₹${stats.thisMonthEarnings.toLocaleString('en-IN')}`, change:'↑ 18%', color:'rgba(16,185,129,0.15)', changeClass:'up' },
      { icon:'📦', label:'Pending Orders', value:stats.pendingOrders, change:'2 new today', color:'rgba(245,158,11,0.15)', changeClass:'up' },
      { icon:'🥦', label:'Active Products', value:stats.activeProducts, change:`of ${stats.totalProducts} total`, color:'rgba(139,92,246,0.15)', changeClass:'up' },
      { icon:'⭐', label:'Farm Rating', value:stats.avgRating, change:`${stats.totalReviews} reviews`, color:'rgba(245,158,11,0.15)', changeClass:'up' }
    ];
    el.innerHTML = items.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-info">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
          <div class="stat-change ${s.changeClass}">${s.change}</div>
        </div>
      </div>`).join('');
  },

  // ─── Get Farmer Orders ───
  getFarmerOrders() {
    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    const all = [...saved, ...CF_DATA.orders];
    const unique = all.filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i);
    return unique.filter(o => o.farmerId === CF_FARMER_USER?.id);
  },

  renderRecentOrders() {
    const el = document.getElementById('recent-orders-farmer');
    if (!el) return;
    const orders = this.getFarmerOrders().slice(0, 3);
    if (orders.length === 0) {
      el.innerHTML = `<div class="empty-state" style="padding:var(--space-8)"><div class="empty-icon">📦</div><h3>No orders yet</h3></div>`;
      return;
    }
    el.innerHTML = this._renderOrderRows(orders.slice(0, 3));
  },

  filterOrders(filter, el) {
    farmerOrderFilter = filter;
    document.querySelectorAll('#section-orders .filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderFarmerOrders();
  },

  renderFarmerOrders() {
    const el = document.getElementById('farmer-orders-list');
    if (!el) return;
    let orders = this.getFarmerOrders();
    if (farmerOrderFilter !== 'all') orders = orders.filter(o => o.status === farmerOrderFilter);
    if (orders.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders in this category</h3></div>`;
      return;
    }
    el.innerHTML = this._renderOrderRows(orders);
  },

  _renderOrderRows(orders) {
    const statusLabel = { placed:'Placed', confirmed:'Confirmed', packed:'Packed', out_for_delivery:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };
    const statusColors = { placed:'var(--accent)', confirmed:'var(--info)', packed:'var(--secondary)', out_for_delivery:'var(--secondary)', delivered:'var(--primary)', cancelled:'var(--danger)' };
    return orders.map(order => `
      <div class="order-card-farmer">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);flex-wrap:wrap;gap:var(--space-2)">
          <div>
            <span style="font-weight:700">#${order.id}</span>
            <span style="margin-left:var(--space-3);font-size:var(--text-xs);color:var(--text-tertiary)">${new Date(order.placedAt).toLocaleDateString('en-IN')}</span>
          </div>
          <span style="padding:4px 10px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:700;background:rgba(255,255,255,0.05);color:${statusColors[order.status] || 'var(--text-primary)'}">
            ● ${statusLabel[order.status] || order.status}
          </span>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3)">
          ${order.items.map(item => {
            const p = CF_DATA.products.find(pr => pr.id === item.productId);
            return `<span style="background:var(--surface);border-radius:var(--radius);padding:4px 10px;font-size:var(--text-xs);font-weight:500">
              ${p ? p.emoji : '📦'} ${item.name} × ${item.qty}${item.unit}
            </span>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
          <div style="font-weight:700;color:var(--primary)">₹${(order.total * 0.92).toFixed(0)} <span style="font-size:var(--text-xs);color:var(--text-tertiary);font-weight:400">(after 8% platform fee)</span></div>
          <div style="display:flex;gap:var(--space-2)">
            ${order.status === 'confirmed' ? `<button class="btn btn-primary btn-sm" onclick="CF_FARMER.updateOrderStatus('${order.id}','packed')">✅ Mark Packed</button>` : ''}
            ${order.status === 'packed' ? `<span class="badge badge-warning">Awaiting pickup</span>` : ''}
            ${order.status === 'delivered' ? `<span class="badge badge-success">✅ Completed</span>` : ''}
          </div>
        </div>
      </div>`).join('');
  },

  updateOrderStatus(orderId, newStatus) {
    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    const idx = saved.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      saved[idx].status = newStatus;
      saved[idx].tracking = saved[idx].tracking || [];
      saved[idx].tracking.push({ status: newStatus, time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}), msg: newStatus === 'packed' ? 'Order packed and ready for pickup' : `Status: ${newStatus}` });
      localStorage.setItem('cf_orders', JSON.stringify(saved));
    }
    CF_APP.toast(`Order marked as ${newStatus}! 📦`, 'success');
    this.renderFarmerOrders();
    this.renderRecentOrders();
  },

  // ─── Farmer Products ───
  renderFarmerProducts() {
    const el = document.getElementById('farmer-products-list');
    if (!el) return;
    if (farmerProducts.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">🥦</div><h3>No products listed</h3>
        <p>Add your first product to start selling!</p>
        <button class="btn btn-primary" style="margin-top:var(--space-4)" onclick="CF_FARMER.showSection('add-product')">Add Product</button></div>`;
      return;
    }
    el.innerHTML = farmerProducts.map(p => `
      <div class="product-row">
        <div class="product-emoji-sm" style="background:${p.gradient};overflow:hidden;flex-shrink:0">
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"/>`
            : `<span style="font-size:1.8rem">${p.emoji}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:var(--text-sm)">${p.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${p.subcategory} • ${p.category}</div>
          <div style="display:flex;gap:var(--space-4);margin-top:4px">
            <span style="font-size:var(--text-xs);color:var(--primary);font-weight:600">₹${p.price}/${p.unit}</span>
            <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Stock: ${p.stock} ${p.unit}</span>
            <div class="stars" style="font-size:0.65rem;color:var(--secondary)">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</div>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-shrink:0">
          <button class="btn btn-ghost btn-sm" onclick="CF_FARMER.openEditProduct('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="CF_FARMER.deleteProduct('${p.id}')">🗑️</button>
        </div>
      </div>`).join('');
  },

  openEditProduct(productId) {
    editingProductId = productId;
    const p = farmerProducts.find(pr => pr.id === productId);
    if (!p) return;
    document.getElementById('edit-price').value = p.price;
    document.getElementById('edit-stock').value = p.stock;
    document.getElementById('edit-product-id').value = productId;
    CF_APP.openModal('edit-product-modal');
  },

  updateProduct() {
    const id = document.getElementById('edit-product-id').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const stock = parseInt(document.getElementById('edit-stock').value);
    const idx = farmerProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      farmerProducts[idx].price = price;
      farmerProducts[idx].stock = stock;
      this._saveProducts();
    }
    CF_APP.closeModal('edit-product-modal');
    CF_APP.toast('Product updated! ✅', 'success');
    this.renderFarmerProducts();
  },

  deleteProduct(productId) {
    if (!confirm('Delete this product? It will be removed from the marketplace.')) return;
    farmerProducts = farmerProducts.filter(p => p.id !== productId);
    this._saveProducts();
    CF_APP.toast('Product deleted', 'info');
    this.renderFarmerProducts();
  },

  _saveProducts() {
    localStorage.setItem('cf_farmer_products', JSON.stringify(farmerProducts));
    // Update global data
    CF_DATA.products = CF_DATA.products.filter(p => p.farmerId !== CF_FARMER_USER.id);
    CF_DATA.products.push(...farmerProducts);
  },

  // ─── Add/Save Product ───
  saveProduct() {
    const name = document.getElementById('fp-name').value.trim();
    const category = document.getElementById('fp-category').value;
    const sub = document.getElementById('fp-sub').value.trim() || category;
    const price = parseFloat(document.getElementById('fp-price').value);
    const mrp = parseFloat(document.getElementById('fp-mrp').value) || price * 1.3;
    const unit = document.getElementById('fp-unit').value;
    const stock = parseInt(document.getElementById('fp-stock').value) || 100;
    const emoji = document.getElementById('fp-emoji').value.trim() || '🌿';
    const desc = document.getElementById('fp-desc').value.trim();
    const tagsRaw = document.getElementById('fp-tags').value.trim();
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : ['fresh'];
    // Read stored image from preview
    const imgPreview = document.getElementById('img-preview');
    const image = (imgPreview && imgPreview.src && imgPreview.style.display !== 'none') ? imgPreview.src : null;

    if (!name || !price) { CF_APP.toast('Please fill name and price', 'warning'); return; }

    const gradients = {
      vegetables: 'linear-gradient(135deg, #16a34a, #22c55e)',
      fruits: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      dairy: 'linear-gradient(135deg, #64748b, #94a3b8)',
      grains: 'linear-gradient(135deg, #92400e, #d97706)',
      herbs: 'linear-gradient(135deg, #15803d, #4ade80)'
    };

    const newProduct = {
      id: 'fp_' + Date.now(), name, category, subcategory: sub,
      farmerId: CF_FARMER_USER.id, farmName: CF_FARMER_USER.farmName,
      price, mrp: Math.round(mrp), unit, minQty: 0.5, stock,
      rating: 0, reviews: 0, emoji, color: '#10b981',
      gradient: gradients[category] || gradients.vegetables,
      description: desc || `Fresh ${name} from ${CF_FARMER_USER.farmName}`,
      tags, deliveryTime: '2-4 hours',
      image: image  // base64 DataURL or null
    };

    farmerProducts.push(newProduct);
    this._saveProducts();
    CF_APP.toast(`${emoji} ${name} listed successfully! 🎉`, 'success');
    this.resetProductForm();
    this.showSection('products');
  },

  resetProductForm() {
    ['fp-name','fp-sub','fp-price','fp-mrp','fp-stock','fp-emoji','fp-desc','fp-tags'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Reset image upload
    const fp = document.getElementById('fp-image'); if (fp) fp.value = '';
    const imgPreview = document.getElementById('img-preview');
    const placeholder = document.getElementById('img-placeholder');
    const previewPhoto = document.getElementById('preview-photo');
    const previewEmoji = document.getElementById('preview-emoji');
    if (imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    if (placeholder) placeholder.style.display = '';
    if (previewPhoto) { previewPhoto.src = ''; previewPhoto.style.display = 'none'; }
    if (previewEmoji) { previewEmoji.style.display = ''; previewEmoji.textContent = '🌿'; }
    this.showSection('products');
  },

  // ─── Earnings ───
  renderEarnings() {
    const el = document.getElementById('earnings-stats');
    if (!el) return;
    const stats = CF_DATA.farmerStats;
    const items = [
      { icon:'💰', label:'This Month', value:`₹${stats.thisMonthEarnings.toLocaleString('en-IN')}`, color:'rgba(16,185,129,0.15)' },
      { icon:'📊', label:'Total Earnings', value:`₹${stats.allTimeEarnings.toLocaleString('en-IN')}`, color:'rgba(245,158,11,0.15)' },
      { icon:'📦', label:'Orders This Month', value:stats.thisMonthOrders, color:'rgba(139,92,246,0.15)' }
    ];
    el.innerHTML = items.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>
      </div>`).join('');

    const bigEl = document.getElementById('total-earnings-big');
    if (bigEl) { bigEl.textContent = '₹0'; CF_APP.animateCounter({ textContent: '' }, 0, 0); bigEl.textContent = `₹${stats.allTimeEarnings.toLocaleString('en-IN')}`; }

    const breakdown = document.getElementById('monthly-breakdown');
    if (breakdown) {
      const categories = [
        { name:'Vegetables', amount: Math.round(stats.thisMonthEarnings * 0.45), emoji:'🥦' },
        { name:'Fruits', amount: Math.round(stats.thisMonthEarnings * 0.30), emoji:'🍎' },
        { name:'Herbs', amount: Math.round(stats.thisMonthEarnings * 0.25), emoji:'🌿' }
      ];
      breakdown.innerHTML = categories.map(c => `
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
          <span style="font-size:1.2rem">${c.emoji}</span>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:4px">
              <span>${c.name}</span><span style="font-weight:600;color:var(--primary)">₹${c.amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round((c.amount/stats.thisMonthEarnings)*100)}%"></div></div>
          </div>
        </div>`).join('');
    }
    setTimeout(() => this.initEarningsChart(), 100);
  },

  // ─── Charts ───
  initCharts() {
    setTimeout(() => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const ctx1 = document.getElementById('revenue-chart');
      if (ctx1) {
        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{ label: 'Revenue (₹)', data: CF_DATA.monthlyRevenue, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4, pointHoverRadius: 6 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
        });
      }
      const ctx2 = document.getElementById('category-chart');
      if (ctx2) {
        new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Vegetables', 'Fruits', 'Herbs'],
            datasets: [{ data: [45, 35, 20], backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0, spacing: 3 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } }, cutout: '65%' }
        });
      }
    }, 200);
  },

  initEarningsChart() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const ctx = document.getElementById('earnings-chart');
    if (ctx && !ctx._chartInstance) {
      ctx._chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{ label: 'Net Earnings (₹)', data: CF_DATA.monthlyRevenue.map(v => Math.round(v * 0.92)), backgroundColor: 'rgba(16,185,129,0.6)', borderColor: '#10b981', borderWidth: 1, borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
      });
    }
  }
};

window.addEventListener('DOMContentLoaded', () => CF_FARMER.init());
