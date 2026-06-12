const ProductosService = {

    listar() {
        return ApiService.get(`${API.PRODUCTOS}/productos`);
    },

    listarDisponibles() {
        return ApiService.get(`${API.PRODUCTOS}/productos/disponibles`);
    },

    listarPorCategoria(id) {
        return ApiService.get(`${API.PRODUCTOS}/productos/categoria/${id}`);
    },

    obtener(id) {
        return ApiService.get(`${API.PRODUCTOS}/productos/${id}`);
    },

    crear(data) {
        return ApiService.post(`${API.PRODUCTOS}/productos`, data);
    },

    actualizar(id, data) {
        return ApiService.put(`${API.PRODUCTOS}/productos/${id}`, data);
    },

    eliminar(id) {
        return ApiService.delete(`${API.PRODUCTOS}/productos/${id}`);
    },
};