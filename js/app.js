// ============================================================
//  ConnectFarm — app.js
//  Shared utilities: theme, toast, page loader, reveal animations
// ============================================================

const CF_APP = {

  // ─── Theme ───
  initTheme() {
    const saved = localStorage.getItem('cf_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this._updateThemeIcon();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cf_theme', next);
    this._updateThemeIcon();
  },

  _updateThemeIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  },

  // ─── Toast Notifications ───
  toast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '🔔'}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ─── Page Loader ───
  showLoader() {
    let loader = document.getElementById('page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.innerHTML = `
        <div class="loader-inner">
          <div class="loader-logo">🌿 ConnectFarm</div>
          <div class="loader-bar"><div class="loader-bar-fill"></div></div>
        </div>`;
      document.body.prepend(loader);
    }
    loader.classList.remove('hide');
  },

  hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hide'), 300);
    }
  },

  // ─── Intersection Observer for reveal animations ───
  initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  },

  // ─── Format currency ───
  formatPrice(amount) {
    return '₹' + amount.toLocaleString('en-IN');
  },

  // ─── Format date ───
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  // ─── Star rating render ───
  renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  },

  // ─── Counter animation ───
  animateCounter(el, target, duration = 1500) {
    let start = 0;
    const step = target / (duration / 16);
    const run = () => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString('en-IN');
      if (start < target) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  },

  // ─── Debounce ───
  debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  },

  // ─── Modal helpers ───
  openModal(id) {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.add('show');
    if (overlay) overlay.classList.add('show');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  },

  // ─── Generate particles for hero ───
  generateParticles(containerId, count = 20) {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${Math.random() * 6 + 3}px;
        height: ${Math.random() * 6 + 3}px;
        animation-duration: ${Math.random() * 10 + 8}s;
        animation-delay: ${Math.random() * 8}s;
        opacity: ${Math.random() * 0.6 + 0.2};
      `;
      container.appendChild(p);
    }
  },

  // ─── Sidebar mobile toggle ───
  initMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !hamburger) return;

    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (overlay) overlay.classList.toggle('show');
    });
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
      });
    }
    // Close on nav item click (mobile)
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('mobile-open');
          if (overlay) overlay.classList.remove('show');
        }
      });
    });
  },

  // ─── Render sidebar user info ───
  renderSidebarUser(user) {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) avatarEl.textContent = user.avatar || '👤';
  },

  // ─── Page init sequence ───
  initPage(role) {
    this.showLoader();
    this.initTheme();
    const user = CF_AUTH.requireRole(role);
    if (!user) return null;

    setTimeout(() => {
      this.hideLoader();
      this.initRevealAnimations();
      this.initMobileSidebar();
      this.renderSidebarUser(user);
      CF_BOT.init();
    }, 600);
    return user;
  }
};

window.CF_APP = CF_APP;
