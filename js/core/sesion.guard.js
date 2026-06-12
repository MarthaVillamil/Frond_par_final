const SesionGuard = {

    check() {
        const token = sessionStorage.getItem('xyz_token');
        if (!token) {
            this._redirectToLogin();
            return false;
        }
        return true;
    },

    getUser() {
        const raw = sessionStorage.getItem('xyz_user');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    setSession(token, usuario) {
        sessionStorage.setItem('xyz_token', token);
        sessionStorage.setItem('xyz_user', JSON.stringify(usuario));
    },

    getToken() {
        return sessionStorage.getItem('xyz_token');
    },

    clearSession() {
        sessionStorage.removeItem('xyz_token');
        sessionStorage.removeItem('xyz_user');
    },

    isLogged() {
        return !!this.getToken();
    },

    _redirectToLogin() {
        const file = window.location.pathname.split('/').pop();
        if (file !== 'index.html') {
            window.location.href = '../index.html';
        }
    },

    redirectToDashboard() {
        const file = window.location.pathname.split('/').pop();
        if (file === 'index.html' || file === '') {
            window.location.href = 'pages/dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    },
};