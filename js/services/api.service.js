const ApiService = {

    async request(url, options = {}) {
        const token = SesionGuard.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        try {
            const res = await fetch(url, {
                ...options,
                headers,
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401) {
                SesionGuard.clearSession();
                SesionGuard._redirectToLogin();
                return null;
            }

            return {
                ok:     res.ok,
                status: res.status,
                data,
            };

        } catch (err) {
            console.error(`Error en ${url}:`, err);
            return {
                ok:     false,
                status: 0,
                data:   { success: false, message: 'Error de conexión con el servidor.' },
            };
        }
    },

    get(url) {
        return this.request(url, { method: 'GET' });
    },

    post(url, body) {
        return this.request(url, {
            method: 'POST',
            body:   JSON.stringify(body),
        });
    },

    put(url, body) {
        return this.request(url, {
            method: 'PUT',
            body:   JSON.stringify(body),
        });
    },

    patch(url, body) {
        return this.request(url, {
            method: 'PATCH',
            body:   JSON.stringify(body),
        });
    },

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },
};