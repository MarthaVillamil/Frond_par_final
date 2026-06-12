const AuthService = {

    login(identificador, contrasena) {
        return ApiService.post(`${API.AUTH}/login`, {
            identificador,
            contrasena,
        });
    },

    logout() {
        return ApiService.post(`${API.AUTH}/logout`, {});
    },

    validar() {
        return ApiService.get(`${API.AUTH}/validar`);
    },
};