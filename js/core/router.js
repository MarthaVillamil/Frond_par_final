const Router = {

    rutas: {
        'dashboard': 'dashboard.html',
        'reservas':  'reservas.html',
        'productos': 'productos.html',
        'pedidos':   'pedidos.html',
    },

    navegar(ruta) {
        if (this.rutas[ruta]) {
            window.location.href = this.rutas[ruta];
        }
    },

    paginaActual() {
        return window.location.pathname.split('/').pop().replace('.html', '');
    },

    marcarActivo() {
        const actual = this.paginaActual();
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href')?.includes(actual)) {
                item.classList.add('active');
            }
        });
    },
};

document.addEventListener('DOMContentLoaded', () => Router.marcarActivo());