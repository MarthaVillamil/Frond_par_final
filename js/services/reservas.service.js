const ReservasService = {

    listarMesas() {
        return ApiService.get(`${API.RESERVAS}/mesas`);
    },

    obtenerMesa(id) {
        return ApiService.get(`${API.RESERVAS}/mesas/${id}`);
    },

    crearMesa(data) {
        return ApiService.post(`${API.RESERVAS}/mesas`, data);
    },

    actualizarMesa(id, data) {
        return ApiService.put(`${API.RESERVAS}/mesas/${id}`, data);
    },

    cambiarEstadoMesa(id, estado) {
        return ApiService.patch(`${API.RESERVAS}/mesas/${id}/estado`, { estado });
    },

    listarReservas() {
        return ApiService.get(`${API.RESERVAS}/reservas`);
    },

    listarReservasPorFecha(fecha) {
        return ApiService.get(`${API.RESERVAS}/reservas/fecha/${fecha}`);
    },

    listarReservasPorCliente(nombre) {
        return ApiService.get(`${API.RESERVAS}/reservas/cliente/${nombre}`);
    },

    listarReservasPorEstado(estado) {
        return ApiService.get(`${API.RESERVAS}/reservas/estado/${estado}`);
    },

    obtenerReserva(id) {
        return ApiService.get(`${API.RESERVAS}/reservas/${id}`);
    },

    crearReserva(data) {
        return ApiService.post(`${API.RESERVAS}/reservas`, data);
    },

    actualizarReserva(id, data) {
        return ApiService.put(`${API.RESERVAS}/reservas/${id}`, data);
    },

    cancelarReserva(id) {
        return ApiService.post(`${API.RESERVAS}/reservas/${id}/cancelar`, {});
    },
};