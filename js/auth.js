// ============================================================
//  ConnectFarm — auth.js
//  Authentication, login, logout, session management
// ============================================================

const CF_AUTH = {

  // ─── Get current user from localStorage ───
  getCurrentUser() {
    const raw = localStorage.getItem('cf_user');
    return raw ? JSON.parse(raw) : null;
  },

  // ─── Login ───
  login(email, password) {
    const user = CF_DATA.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Invalid email or password.' };
    // Store session (omit password)
    const session = { ...user };
    delete session.password;
    localStorage.setItem('cf_user', JSON.stringify(session));
    return { success: true, user: session };
  },

  // ─── Logout ───
  logout() {
    localStorage.removeItem('cf_user');
    window.location.href = CF_AUTH._rootPath() + 'index.html';
  },

  // ─── Check role and redirect ───
  requireRole(role) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = CF_AUTH._rootPath() + 'index.html';
      return null;
    }
    if (user.role !== role) {
      // Redirect to their correct dashboard
      this.redirectToDashboard(user.role);
      return null;
    }
    return user;
  },

  // ─── Redirect to correct dashboard ───
  redirectToDashboard(role) {
    const base = CF_AUTH._rootPath() + 'pages/';
    const map = {
      customer: base + 'customer.html',
      farmer: base + 'farmer.html',
      admin: base + 'admin.html',
      delivery: base + 'delivery.html'
    };
    window.location.href = map[role] || CF_AUTH._rootPath() + 'index.html';
  },

  // ─── Get root path relative to current page ───
  _rootPath() {
    const path = window.location.pathname;
    return path.includes('/pages/') ? '../' : './';
  },

  // ─── Update user in localStorage ───
  updateUser(updates) {
    const user = this.getCurrentUser();
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem('cf_user', JSON.stringify(updated));
    return updated;
  }
};

window.CF_AUTH = CF_AUTH;
