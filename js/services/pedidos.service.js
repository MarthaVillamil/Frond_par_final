const PedidosService = {

    listar() {
        return ApiService.get(`${API.PEDIDOS}/pedidos`);
    },

    listarPorEstado(estado) {
        return ApiService.get(`${API.PEDIDOS}/pedidos/estado/${estado}`);
    },

    obtener(id) {
        return ApiService.get(`${API.PEDIDOS}/pedidos/${id}`);
    },

    crear(data) {
        return ApiService.post(`${API.PEDIDOS}/pedidos`, data);
    },

    actualizarEstado(id, estado) {
        return ApiService.patch(`${API.PEDIDOS}/pedidos/${id}/estado`, { estado });
    },

    eliminar(id) {
        return ApiService.delete(`${API.PEDIDOS}/pedidos/${id}`);
    },

    agregarDetalle(id, data) {
        return ApiService.post(`${API.PEDIDOS}/pedidos/${id}/detalles`, data);
    },

    actualizarDetalle(id, detalleId, data) {
        return ApiService.put(`${API.PEDIDOS}/pedidos/${id}/detalles/${detalleId}`, data);
    },

    eliminarDetalle(id, detalleId) {
        return ApiService.delete(`${API.PEDIDOS}/pedidos/${id}/detalles/${detalleId}`);
    },
};