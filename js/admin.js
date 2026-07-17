// ============================================================
//  ConnectFarm — admin.js
//  Admin dashboard: full CRUD, analytics, delivery management
// ============================================================

let CF_ADMIN_USER = null;
let allOrdersCache = [];
let allProductsCache = [];
let adminOrderFilter = '';
let adminProductSearch = '';

const CF_ADMIN = {
  currentSection: 'overview',

  init() {
    CF_ADMIN_USER = CF_APP.initPage('admin');
    if (!CF_ADMIN_USER) return;

    // Build data caches
    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    allOrdersCache = [...saved, ...CF_DATA.orders].filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i);
    allProductsCache = [...CF_DATA.products];

    this.renderAdminStats();
    this.renderAdminRecentOrders();
    this.renderTopFarmers();
    this.renderActivityFeed();
    this.initCharts();

    // Live activity feed update every 30s
    setInterval(() => this.renderActivityFeed(), 30000);
  },

  showSection(section) {
    this.currentSection = section;
    ['overview','analytics','orders','farmers','customers','products','delivery','settings'].forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === section ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === section));
    const titles = {
      overview: ['Platform Overview', 'ConnectFarm Admin Panel'],
      analytics: ['Analytics', 'Deep platform insights'],
      orders: ['All Orders', 'Manage & assign orders'],
      farmers: ['Farmer Management', 'Verified farmer profiles'],
      customers: ['Customer Management', 'All registered customers'],
      products: ['Product Catalog', 'Manage all product listings'],
      delivery: ['Delivery Agents', 'Fleet management'],
      settings: ['Settings', 'Platform configuration']
    };
    const [title, sub] = titles[section] || ['—', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = sub;

    if (section === 'orders') this.renderOrdersTable();
    if (section === 'farmers') this.renderFarmersTable();
    if (section === 'customers') this.renderCustomersTable();
    if (section === 'products') this.renderProductsTable();
    if (section === 'delivery') this.renderDeliveryAgents();
    if (section === 'analytics') this.renderAnalytics();
  },

  // ─── Stats ───
  renderAdminStats() {
    const el = document.getElementById('admin-stats-grid');
    if (!el) return;
    const s = CF_DATA.adminStats;
    const items = [
      { icon:'💰', label:'Total Revenue', value:`₹${(s.totalRevenue/100000).toFixed(1)}L`, change:'↑ 22% YoY', color:'rgba(16,185,129,0.15)', c:'up' },
      { icon:'📦', label:'Total Orders', value:s.totalOrders.toLocaleString('en-IN'), change:`${s.pendingOrders} pending`, color:'rgba(245,158,11,0.15)', c:'up' },
      { icon:'🌾', label:'Active Farmers', value:s.activeFarmers, change:`${s.totalFarmers} total`, color:'rgba(139,92,246,0.15)', c:'up' },
      { icon:'👥', label:'Active Customers', value:s.activeCustomers.toLocaleString('en-IN'), change:`${s.totalCustomers.toLocaleString()} total`, color:'rgba(59,130,246,0.15)', c:'up' }
    ];
    el.innerHTML = items.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-info">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
          <div class="stat-change ${s.c}">${s.change}</div>
        </div>
      </div>`).join('');
  },

  // ─── Activity Feed ───
  renderActivityFeed() {
    const el = document.getElementById('activity-feed');
    if (!el) return;
    const activities = [
      { icon:'🛒', text:'New order #ORD-' + Math.floor(Math.random()*9000+1000), time:'just now' },
      { icon:'🌾', text:'Farmer Kumar marked order packed', time:'2 min ago' },
      { icon:'🚚', text:'Rahul picked up delivery in Mumbai', time:'5 min ago' },
      { icon:'👩', text:'New customer registered from Pune', time:'8 min ago' },
      { icon:'⭐', text:'5-star review received for tomatoes', time:'12 min ago' },
      { icon:'📦', text:'Order ORD-2025-002 delivered', time:'18 min ago' }
    ];
    el.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon">${a.icon}</div>
        <div>
          <div class="activity-text">${a.text}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>`).join('');
  },

  // ─── Recent Orders (overview) ───
  renderAdminRecentOrders() {
    const el = document.getElementById('admin-recent-orders');
    if (!el) return;
    const orders = allOrdersCache.slice(0, 5);
    const statusColors = { placed:'var(--accent)', confirmed:'var(--info)', packed:'var(--secondary)', out_for_delivery:'var(--secondary)', delivered:'var(--primary)' };
    el.innerHTML = `
      <table style="width:100%">
        <tbody>
          ${orders.map(o => `<tr>
            <td style="padding:var(--space-3) 0;font-size:var(--text-sm);font-weight:600">#${o.id}</td>
            <td style="padding:var(--space-3) 0;font-size:var(--text-sm);color:var(--text-secondary)">₹${o.total}</td>
            <td style="padding:var(--space-3) 0"><span style="padding:3px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(255,255,255,0.05);color:${statusColors[o.status]||'var(--text-primary)'}">● ${o.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  },

  // ─── Top Farmers ───
  renderTopFarmers() {
    const el = document.getElementById('top-farmers');
    if (!el) return;
    const farmers = CF_DATA.users.filter(u => u.role === 'farmer');
    el.innerHTML = farmers.map((f, i) => `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--border)">
        <div style="width:28px;height:28px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:var(--text-sm);flex-shrink:0">${i+1}</div>
        <div style="font-size:1.5rem">${f.avatar || '👨‍🌾'}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:var(--text-sm)">${f.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${f.farmName || 'Farm'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:var(--primary);font-size:var(--text-sm)">₹${((f.totalEarnings || 80000)/1000).toFixed(0)}k</div>
          <div style="font-size:10px;color:var(--secondary)">${f.rating || 4.5} ★</div>
        </div>
      </div>`).join('');
  },

  // ─── Orders Table ───
  renderOrdersTable(search = '', filterStatus = adminOrderFilter) {
    const tbody = document.getElementById('admin-orders-table');
    if (!tbody) return;
    let orders = allOrdersCache;
    if (filterStatus) orders = orders.filter(o => o.status === filterStatus);
    if (search) orders = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()));

    const statusColors = { placed:'var(--accent)', confirmed:'var(--info)', packed:'var(--secondary)', out_for_delivery:'var(--secondary)', delivered:'var(--primary)', cancelled:'var(--danger)' };
    const customer = (id) => CF_DATA.users.find(u => u.id === id)?.name || 'Unknown';
    const agent = (id) => id ? CF_DATA.users.find(u => u.id === id)?.name || 'Unassigned' : 'Unassigned';

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td class="td-primary">#${o.id}</td>
        <td>${customer(o.customerId)}</td>
        <td>${o.items.length} items</td>
        <td style="color:var(--primary);font-weight:700">₹${o.total}</td>
        <td><span style="padding:3px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(255,255,255,0.05);color:${statusColors[o.status]||'var(--text-primary)'}">● ${o.status}</span></td>
        <td>${agent(o.deliveryAgentId)}</td>
        <td class="hide-mobile">${new Date(o.placedAt).toLocaleDateString('en-IN')}</td>
        <td>
          <div class="admin-table-actions">
            ${!o.deliveryAgentId && o.status !== 'delivered' ? `<button class="btn btn-primary btn-sm" onclick="CF_ADMIN.assignDelivery('${o.id}')">Assign 🚚</button>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="CF_APP.toast('Order ${o.id} details viewed','info')">View</button>
          </div>
        </td>
      </tr>`).join('');
  },

  searchOrders(val) { this.renderOrdersTable(val, adminOrderFilter); },
  filterAdminOrders(status) { adminOrderFilter = status; this.renderOrdersTable('', status); },

  assignDelivery(orderId) {
    // Auto-assign to available agent
    const agent = CF_DATA.users.find(u => u.role === 'delivery');
    const saved = JSON.parse(localStorage.getItem('cf_orders') || '[]');
    const idx = saved.findIndex(o => o.id === orderId);
    if (idx !== -1) { saved[idx].deliveryAgentId = agent?.id || 'u_delivery1'; localStorage.setItem('cf_orders', JSON.stringify(saved)); }
    CF_APP.toast(`Assigned to ${agent?.name || 'Rahul Sharma'}! 🚚`, 'success');
    allOrdersCache = [...saved, ...CF_DATA.orders].filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i);
    this.renderOrdersTable();
  },

  // ─── Farmers Table ───
  renderFarmersTable() {
    const tbody = document.getElementById('farmers-table');
    if (!tbody) return;
    const farmers = CF_DATA.users.filter(u => u.role === 'farmer');
    tbody.innerHTML = farmers.map(f => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">${f.avatar||'👨‍🌾'}</div>
            <div><div class="td-primary">${f.name}</div><div style="font-size:var(--text-xs);color:var(--text-tertiary)">${f.phone||''}</div></div>
          </div>
        </td>
        <td class="td-primary">${f.farmName||'—'}</td>
        <td class="hide-mobile">${f.city||'—'}</td>
        <td>${CF_DATA.products.filter(p=>p.farmerId===f.id).length}</td>
        <td><span style="color:var(--secondary)">${f.rating||4.5} ★</span></td>
        <td style="color:var(--primary);font-weight:600">₹${((f.totalEarnings||80000)/1000).toFixed(0)}k</td>
        <td><span class="badge ${f.verified?'badge-success':'badge-warning'}">${f.verified?'✅ Verified':'⏳ Pending'}</span></td>
        <td>
          <div class="admin-table-actions">
            <button class="btn btn-ghost btn-sm" onclick="CF_APP.toast('Farmer profile opened','info')">View</button>
            ${!f.verified ? `<button class="btn btn-primary btn-sm" onclick="CF_APP.toast('${f.name} verified!','success')">Verify</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="CF_APP.toast('Action taken','info')">Block</button>
          </div>
        </td>
      </tr>`).join('');
  },

  // ─── Customers Table ───
  renderCustomersTable() {
    const tbody = document.getElementById('customers-table');
    if (!tbody) return;
    const customers = CF_DATA.users.filter(u => u.role === 'customer');
    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-emerald);display:flex;align-items:center;justify-content:center;font-size:1.2rem">${c.avatar||'👤'}</div>
            <div class="td-primary">${c.name}</div>
          </div>
        </td>
        <td class="hide-mobile">${c.email}</td>
        <td>${c.city||'—'}</td>
        <td>${c.totalOrders||0}</td>
        <td style="color:var(--secondary)">${c.loyaltyPoints||0} pts</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <div class="admin-table-actions">
            <button class="btn btn-ghost btn-sm" onclick="CF_APP.toast('Customer profile viewed','info')">View</button>
            <button class="btn btn-danger btn-sm" onclick="CF_APP.toast('Account suspended','warning')">Suspend</button>
          </div>
        </td>
      </tr>`).join('');
  },

  // ─── Products Table ───
  renderProductsTable(search = '') {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;
    let products = allProductsCache;
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase()));
    const farmer = (id) => CF_DATA.users.find(u => u.id === id)?.name || 'Unknown';
    tbody.innerHTML = products.slice(0, 20).map(p => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:36px;height:36px;border-radius:var(--radius);background:${p.gradient};display:flex;align-items:center;justify-content:center;font-size:1.2rem">${p.emoji}</div>
            <div class="td-primary">${p.name}</div>
          </div>
        </td>
        <td class="hide-mobile">${farmer(p.farmerId)}</td>
        <td><span class="badge badge-neutral">${p.category}</span></td>
        <td style="color:var(--primary);font-weight:600">₹${p.price}/${p.unit}</td>
        <td>${p.stock} ${p.unit}</td>
        <td><span style="color:var(--secondary)">${p.rating} ★ (${p.reviews})</span></td>
        <td><span class="badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}">${p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
        <td>
          <div class="admin-table-actions">
            <button class="btn btn-ghost btn-sm" onclick="CF_APP.toast('Product details viewed','info')">View</button>
            <button class="btn btn-danger btn-sm" onclick="CF_APP.toast('Product hidden from customers','warning')">Hide</button>
          </div>
        </td>
      </tr>`).join('');
  },
  searchProducts(val) { this.renderProductsTable(val); },

  // ─── Delivery Agents ───
  renderDeliveryAgents() {
    const el = document.getElementById('delivery-agents-grid');
    if (!el) return;
    const agents = CF_DATA.users.filter(u => u.role === 'delivery');
    // Add dummy agents for admin view
    const dummyAgents = [
      { id:'da2', name:'Amit Singh', avatar:'🚛', vehicleType:'Tata Ace', vehicleNo:'MH-04-TS-7823', rating:4.6, totalDeliveries:542, city:'Mumbai', status:'available' },
      { id:'da3', name:'Suraj Yadav', avatar:'🏍️', vehicleType:'Honda Activa', vehicleNo:'MH-01-HA-5590', rating:4.4, totalDeliveries:289, city:'Mumbai', status:'busy' }
    ];
    const allAgents = [...agents, ...dummyAgents];
    el.innerHTML = allAgents.map(a => `
      <div class="card card-hover">
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--gradient-amber);display:flex;align-items:center;justify-content:center;font-size:2rem">${a.avatar||'🚚'}</div>
          <div>
            <div style="font-weight:700;font-size:var(--text-base)">${a.name}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary)">${a.vehicleType||'Vehicle'}</div>
            <span class="badge ${a.status==='busy'?'badge-warning':'badge-success'}" style="margin-top:4px">${a.status==='busy'?'● Delivering':'● Available'}</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
          <div style="background:var(--surface);border-radius:var(--radius);padding:var(--space-3);text-align:center">
            <div style="font-weight:700;color:var(--primary)">${a.totalDeliveries||0}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Deliveries</div>
          </div>
          <div style="background:var(--surface);border-radius:var(--radius);padding:var(--space-3);text-align:center">
            <div style="font-weight:700;color:var(--secondary)">${a.rating||4.5} ★</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Rating</div>
          </div>
        </div>
        <div style="margin-top:var(--space-4);padding-top:var(--space-3);border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:var(--text-xs);color:var(--text-tertiary)">${a.vehicleNo||'—'}</span>
          <button class="btn btn-primary btn-sm" onclick="CF_APP.toast('Agent ${a.name} assigned!','success')">Assign</button>
        </div>
      </div>`).join('');
  },

  // ─── Analytics ───
  renderAnalytics() {
    const el = document.getElementById('analytics-stats');
    if (!el) return;
    const items = [
      { icon:'📦', label:'Avg Order Value', value:'₹342', change:'↑ 12% vs last month', color:'rgba(16,185,129,0.15)', c:'up' },
      { icon:'⏱️', label:'Avg Delivery Time', value:'3.2 hrs', change:'↓ 0.4 hrs improved', color:'rgba(59,130,246,0.15)', c:'up' },
      { icon:'😊', label:'Satisfaction Score', value:'94%', change:'↑ 3% this month', color:'rgba(245,158,11,0.15)', c:'up' }
    ];
    el.innerHTML = items.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-change ${s.c}">${s.change}</div></div>
      </div>`).join('');
    setTimeout(() => this.initWeeklyChart(), 100);
  },

  initWeeklyChart() {
    const ctx = document.getElementById('weekly-orders-chart');
    if (ctx && !ctx._chart) {
      ctx._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets: [
            { label:'Orders', data: CF_DATA.weeklyOrders, backgroundColor: 'rgba(16,185,129,0.6)', borderColor: '#10b981', borderWidth: 1, borderRadius: 6 },
            { label:'Deliveries', data: CF_DATA.weeklyOrders.map(v => Math.round(v * 0.92)), backgroundColor: 'rgba(245,158,11,0.5)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 6 }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { display: false } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
      });
    }
  },

  // ─── Charts ───
  initCharts() {
    setTimeout(() => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const ctx1 = document.getElementById('admin-revenue-chart');
      if (ctx1) {
        new Chart(ctx1, {
          type: 'line',
          data: {
            labels: months,
            datasets: [
              { label: 'Revenue (₹)', data: CF_DATA.monthlyRevenue, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointBackgroundColor: '#10b981' },
              { label: 'Platform Fee (₹)', data: CF_DATA.monthlyRevenue.map(v => Math.round(v * 0.08)), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.06)', fill: true, tension: 0.4, borderWidth: 2 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
        });
      }
      const ctx2 = document.getElementById('admin-cat-chart');
      if (ctx2) {
        new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs'],
            datasets: [{ data: [35, 28, 22, 10, 5], backgroundColor: ['#10b981','#f59e0b','#8b5cf6','#3b82f6','#22c55e'], borderWidth: 0, spacing: 2 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', padding: 8, font: { size: 10 } } } }, cutout: '60%' }
        });
      }
    }, 200);
  },

  updateRevenueChart() { CF_APP.toast('Chart updated!', 'info'); }
};

window.addEventListener('DOMContentLoaded', () => CF_ADMIN.init());
