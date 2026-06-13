const App = {
    config: {
        name:    'Restaurante XYZ',
        version: '1.0.0',
    },

    init() {
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