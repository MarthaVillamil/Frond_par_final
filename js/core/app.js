const App = {

    config: {
        name:    'Restaurante XYZ',
        version: '1.0.0',
    },

    theme: {
        key: 'xyz-theme',
        get() { return localStorage.getItem(this.key) || 'dark'; },
        apply(theme = this.get()) {
            const selected = theme === 'light' ? 'light' : 'dark';
            document.documentElement.dataset.theme = selected;
            localStorage.setItem(this.key, selected);
            document.querySelectorAll('[data-theme-icon]').forEach(el => {
                el.innerHTML = selected === 'light' ? this.icons.dark : this.icons.light;
            });
        },
        toggle() { this.apply(this.get() === 'light' ? 'dark' : 'light'); },
        icons: {
            light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>',
            dark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7 7 0 1 0 11 11Z"/></svg>'
        }
    },

    init() {
        this.theme.apply();
        this._initToastContainer();
        this._initGlobalErrorHandler();
    },

    _initToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id        = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    },

    _initGlobalErrorHandler() {
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Error no manejado:', e.reason);
        });
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());