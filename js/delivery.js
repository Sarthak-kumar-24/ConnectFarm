// ============================================================
//  ConnectFarm — delivery.js
//  Delivery agent dashboard: map, deliveries, vehicle, earnings, expenses
// ============================================================

let CF_DELIVERY_USER = null;
let deliveryFilter = 'all';
let isAvailable = true;
let expenses = [];

const CF_DELIVERY = {
  currentSection: 'overview',

  init() {
    CF_DELIVERY_USER = CF_APP.initPage('delivery');
    if (!CF_DELIVERY_USER) return;

    expenses = JSON.parse(localStorage.getItem('cf_delivery_expenses') || '[]');
    if (expenses.length === 0) this._seedExpenses();

    this.renderDeliveryStats();
    this.renderActiveOrderCard();
    this.renderTodayDeliveries();
    this.initSpeedSimulation();

    // Load vehicle info
    this._populateVehicleInfo();
  },

  showSection(section) {
    this.currentSection = section;
    ['overview','deliveries','vehicle','tracking','earnings','expenses'].forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === section ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === section));
    const titles = {
      overview: ['Live Map', 'Active delivery tracking'],
      deliveries: ['My Deliveries', 'Manage all orders'],
      vehicle: ['Vehicle Details', 'Your fleet information'],
      tracking: ['GPS Tracking', 'Real-time route tracking'],
      earnings: ['Earnings', 'Revenue & payment history'],
      expenses: ['Expenses & Profit', 'Track costs & net income']
    };
    const [title, sub] = titles[section] || ['—', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = sub;

    if (section === 'deliveries') this.renderAllDeliveries();
    if (section === 'earnings') this.renderEarnings();
    if (section === 'expenses') this.renderExpenses();
  },

  // ─── Stats ───
  renderDeliveryStats() {
    const el = document.getElementById('delivery-stats-grid');
    if (!el || !CF_DELIVERY_USER) return;
    const u = CF_DELIVERY_USER;
    const items = [
      { icon:'📦', label:"Today's Deliveries", value:3, change:'2 completed', color:'rgba(16,185,129,0.15)', c:'up' },
      { icon:'💰', label:"Today's Earnings", value:'₹135', change:'₹12,600 this month', color:'rgba(245,158,11,0.15)', c:'up' },
      { icon:'⭐', label:'Rating', value:u.rating, change:`${u.totalDeliveries} total deliveries`, color:'rgba(139,92,246,0.15)', c:'up' },
      { icon:'🚗', label:'Km Today', value:'38.2 km', change:'Fuel saved: ₹0 (EV)', color:'rgba(59,130,246,0.15)', c:'up' }
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

    // Update today's earnings card
    const todayEl = document.getElementById('today-earnings');
    if (todayEl) todayEl.textContent = '₹135';
    const todayCount = document.getElementById('today-deliveries-count');
    if (todayCount) todayCount.textContent = '3 deliveries today';
  },

  // ─── Active Order ───
  renderActiveOrderCard() {
    const el = document.getElementById('active-order-card');
    if (!el) return;
    const active = CF_DATA.deliveryOrders.find(d => d.status === 'active');
    if (!active) { el.innerHTML = `<div style="text-align:center;padding:var(--space-4);color:var(--text-tertiary);font-size:var(--text-sm)">No active delivery right now</div>`; return; }
    el.innerHTML = `
      <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-2)">#${active.orderId}</div>
      <div style="font-size:var(--text-sm);margin-bottom:var(--space-2)">📍 ${active.pickupAddr}</div>
      <div style="font-size:var(--text-sm);margin-bottom:var(--space-3)">🏠 ${active.dropAddr}</div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:var(--space-3)">
        <span>Distance: ${active.distance}</span>
        <span style="color:var(--primary);font-weight:700">₹${active.earnings}</span>
      </div>
      <button class="btn btn-primary w-full btn-sm" onclick="CF_DELIVERY.markDelivered('${active.id}')">✅ Mark Delivered</button>`;
  },

  // ─── Today's Deliveries (overview) ───
  renderTodayDeliveries() {
    const el = document.getElementById('today-deliveries');
    if (!el) return;
    el.innerHTML = CF_DATA.deliveryOrders.map(d => this._deliveryCardHTML(d)).join('');
  },

  _deliveryCardHTML(d) {
    const statusBadge = { active: 'badge-success', pending: 'badge-warning', completed: 'badge-neutral' };
    const statusIcon = { active: '🚚', pending: '⏳', completed: '✅' };
    return `
      <div class="delivery-card ${d.status === 'active' ? 'active-delivery' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);flex-wrap:wrap;gap:var(--space-2)">
          <div>
            <div style="font-weight:700;font-size:var(--text-base)">${statusIcon[d.status]} ${d.orderId}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${d.customerName}</div>
          </div>
          <span class="badge ${statusBadge[d.status]}">${d.status.toUpperCase()}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-4)">
          <div style="background:var(--surface);padding:var(--space-3);border-radius:var(--radius);font-size:var(--text-xs)">
            <div style="color:var(--text-tertiary);margin-bottom:4px">PICKUP</div>
            <div style="font-weight:500">${d.pickupAddr}</div>
          </div>
          <div style="background:var(--surface);padding:var(--space-3);border-radius:var(--radius);font-size:var(--text-xs)">
            <div style="color:var(--text-tertiary);margin-bottom:4px">DROP</div>
            <div style="font-weight:500">${d.dropAddr}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:var(--text-sm)">
            📏 ${d.distance} &nbsp;•&nbsp; ⏱️ ${d.estimatedTime}
          </div>
          <div style="font-weight:700;color:var(--primary)">₹${d.earnings}</div>
        </div>
        ${d.status === 'pending' ? `<button class="btn btn-primary w-full btn-sm" style="margin-top:var(--space-3)" onclick="CF_DELIVERY.acceptDelivery('${d.id}')">Accept Delivery</button>` : ''}
        ${d.status === 'active' ? `<button class="btn btn-secondary w-full btn-sm" style="margin-top:var(--space-3)" onclick="CF_DELIVERY.markDelivered('${d.id}')">✅ Mark Delivered</button>` : ''}
      </div>`;
  },

  // ─── All Deliveries ───
  filterDeliveries(filter, el) {
    deliveryFilter = filter;
    document.querySelectorAll('#section-deliveries .filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderAllDeliveries();
  },

  renderAllDeliveries() {
    const el = document.getElementById('all-deliveries-list');
    if (!el) return;
    let orders = [...CF_DATA.deliveryOrders];
    if (deliveryFilter !== 'all') orders = orders.filter(d => d.status === deliveryFilter);
    if (orders.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No deliveries in this category</h3></div>`;
      return;
    }
    el.innerHTML = orders.map(d => this._deliveryCardHTML(d)).join('');
  },

  acceptDelivery(id) {
    const d = CF_DATA.deliveryOrders.find(o => o.id === id);
    if (d) { d.status = 'active'; }
    CF_APP.toast('Delivery accepted! Start navigation. 🗺️', 'success');
    this.renderAllDeliveries();
    this.renderTodayDeliveries();
    this.renderActiveOrderCard();
  },

  markDelivered(id) {
    const d = CF_DATA.deliveryOrders.find(o => o.id === id);
    if (d) { d.status = 'completed'; d.estimatedTime = 'Delivered'; }
    CF_APP.toast('Delivery marked as completed! ✅ +₹' + (d?.earnings || 45), 'success');
    this.renderAllDeliveries();
    this.renderTodayDeliveries();
    this.renderActiveOrderCard();
  },

  // ─── Availability toggle ───
  toggleAvailability() {
    isAvailable = !isAvailable;
    const btn = document.getElementById('availability-toggle');
    if (btn) {
      btn.style.background = isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
      btn.style.borderColor = isAvailable ? 'var(--primary)' : 'var(--danger)';
      btn.style.color = isAvailable ? 'var(--primary)' : 'var(--danger)';
      btn.textContent = isAvailable ? '● Available' : '● Unavailable';
    }
    CF_APP.toast(isAvailable ? 'You are now available for deliveries! 🚚' : 'You are now offline', isAvailable ? 'success' : 'info');
  },

  // ─── Earnings ───
  renderEarnings() {
    const el = document.getElementById('earnings-stats-delivery');
    if (!el) return;
    const items = [
      { icon:'💰', label:'This Month', value:'₹12,600', change:'↑ 15% vs last month', color:'rgba(16,185,129,0.15)', c:'up' },
      { icon:'📦', label:'Deliveries (Month)', value:248, change:'~8 per day avg', color:'rgba(245,158,11,0.15)', c:'up' },
      { icon:'⭐', label:'Avg Rating', value:'4.8 ★', change:'Top 10% earner', color:'rgba(139,92,246,0.15)', c:'up' }
    ];
    el.innerHTML = items.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}">${s.icon}</div>
        <div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-change ${s.c}">${s.change}</div></div>
      </div>`).join('');
    setTimeout(() => this.initEarningsChart(), 100);
  },

  initEarningsChart() {
    const ctx = document.getElementById('delivery-earnings-chart');
    if (ctx && !ctx._chart) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const data = [8200, 9400, 9800, 8600, 10200, 11000, 12100, 11600, 12800, 11900, 12400, 12600];
      ctx._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            { label: 'Gross (₹)', data, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, borderWidth: 2.5, pointBackgroundColor: '#f59e0b' },
            { label: 'Net (₹)', data: data.map(v => Math.round(v * 0.77)), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2 }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
      });
    }
  },

  // ─── Expenses ───
  _seedExpenses() {
    expenses = [
      { id:'e1', category:'Fuel/Charging', amount:450, desc:'EV charging at Andheri station', date:'2025-07-17' },
      { id:'e2', category:'Food', amount:180, desc:'Lunch during delivery run', date:'2025-07-16' },
      { id:'e3', category:'Maintenance', amount:1200, desc:'Monthly tyre check & air fill', date:'2025-07-14' },
      { id:'e4', category:'Mobile Recharge', amount:299, desc:'Monthly data plan', date:'2025-07-01' },
      { id:'e5', category:'Fuel/Charging', amount:380, desc:'EV charging overnight', date:'2025-07-10' },
      { id:'e6', category:'Other', amount:331, desc:'Misc expenses', date:'2025-07-13' }
    ];
    localStorage.setItem('cf_delivery_expenses', JSON.stringify(expenses));
  },

  renderExpenses() {
    const el = document.getElementById('expenses-list');
    if (!el) return;
    const catIcons = { 'Fuel/Charging':'⚡', 'Maintenance':'🔧', 'Food':'🍱', 'Mobile Recharge':'📱', 'Other':'📝' };
    el.innerHTML = expenses.map(e => `
      <div class="expense-row">
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:36px;height:36px;border-radius:var(--radius);background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:1.1rem">${catIcons[e.category]||'📝'}</div>
          <div>
            <div style="font-weight:500;font-size:var(--text-sm)">${e.desc}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${e.category} • ${new Date(e.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="font-weight:700;color:var(--danger)">-₹${e.amount}</div>
          <button class="btn-icon" style="width:28px;height:28px;font-size:0.8rem" onclick="CF_DELIVERY.deleteExpense('${e.id}')">🗑️</button>
        </div>
      </div>`).join('') || `<div style="text-align:center;padding:var(--space-8);color:var(--text-tertiary)">No expenses logged</div>`;
  },

  addExpense() {
    const form = document.getElementById('expense-form');
    if (form) form.style.display = '';
  },

  saveExpense() {
    const cat = document.getElementById('exp-category').value;
    const amount = parseFloat(document.getElementById('exp-amount').value);
    const desc = document.getElementById('exp-desc').value.trim();
    if (!amount || !desc) { CF_APP.toast('Fill all fields', 'warning'); return; }
    expenses.unshift({ id: 'e' + Date.now(), category: cat, amount, desc, date: new Date().toISOString().split('T')[0] });
    localStorage.setItem('cf_delivery_expenses', JSON.stringify(expenses));
    document.getElementById('expense-form').style.display = 'none';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-desc').value = '';
    CF_APP.toast('Expense logged! 🧾', 'success');
    this.renderExpenses();
  },

  deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem('cf_delivery_expenses', JSON.stringify(expenses));
    this.renderExpenses();
    CF_APP.toast('Expense removed', 'info');
  },

  // ─── Vehicle info ───
  _populateVehicleInfo() {
    const u = CF_DELIVERY_USER;
    if (!u) return;
    const modelEl = document.getElementById('vehicle-model-name');
    const typeEl = document.getElementById('vehicle-type-info');
    const plateEl = document.getElementById('vehicle-plate');
    if (modelEl) modelEl.textContent = u.vehicleModel || 'Vehicle';
    if (typeEl) typeEl.textContent = u.vehicleType || '—';
    if (plateEl) plateEl.textContent = u.vehicleNo || '—';
  },

  // ─── Speed simulation ───
  initSpeedSimulation() {
    const speedEl = document.getElementById('speed-counter');
    if (!speedEl) return;
    let speed = 42;
    setInterval(() => {
      speed = Math.max(0, Math.min(60, speed + (Math.random() - 0.5) * 8));
      speedEl.textContent = Math.round(speed);
      speedEl.style.color = speed > 50 ? 'var(--secondary)' : 'var(--primary)';
    }, 2000);
  }
};

window.addEventListener('DOMContentLoaded', () => CF_DELIVERY.init());
