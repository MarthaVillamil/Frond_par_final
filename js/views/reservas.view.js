const ReservasView = {

    reservaSeleccionada: null,
    mesaSeleccionada: null,

    async init() {
        if (!SesionGuard.check()) return;
        await this.cargarMesas();
        await this.cargarReservas();
        this.bindEventos();
    },

    async cargarMesas() {
        const res = await ReservasService.listarMesas();
        if (res?.ok && res.data?.success) {
            this.renderTablaMesas(res.data.data);
            this.cargarSelectMesas(res.data.data);
        }
    },

    async cargarReservas() {
        const res = await ReservasService.listarReservas();
        if (res?.ok && res.data?.success) {
            this.renderTablaReservas(res.data.data);
        }
    },

    renderTablaMesas(mesas) {
        const tbody = document.getElementById('mesas-tbody');
        tbody.innerHTML = '';

        if (mesas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay mesas registradas.</td></tr>';
            return;
        }

        for (const m of mesas) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.id}</td>
                <td>${m.numero}</td>
                <td>${m.capacidad} personas</td>
                <td><span class="badge badge-${this.getBadgeMesa(m.estado)}">${m.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" data-id="${m.id}" data-action="editar-mesa">Editar</button>
                    <button class="btn btn-sm btn-warning" data-id="${m.id}" data-action="estado-mesa">Estado</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    },

    renderTablaReservas(reservas) {
        const tbody = document.getElementById('reservas-tbody');
        tbody.innerHTML = '';

        if (reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay reservas registradas.</td></tr>';
            return;
        }

        for (const r of reservas) {
            const esCancelada = r.estado === 'cancelada';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${r.nombre_cliente}</td>
                <td>${r.telefono_cliente}</td>
                <td>${r.cantidad_personas}</td>
                <td>${r.fecha}</td>
                <td>${r.hora}</td>
                <td><span class="badge badge-${this.getBadgeReserva(r.estado)}">${r.estado}</span></td>
                <td>
                    ${!esCancelada ? `<button class="btn btn-sm btn-secondary" data-id="${r.id}" data-action="editar-reserva">Editar</button>` : ''}
                    ${!esCancelada ? `<button class="btn btn-sm btn-danger" data-id="${r.id}" data-action="cancelar-reserva">Cancelar</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        }
    },

    cargarSelectMesas(mesas) {
        const select = document.getElementById('input-mesa');
        select.innerHTML = '<option value="">Seleccione una mesa</option>';
        for (const m of mesas) {
            if (m.estado !== 'fuera_servicio') {
                select.innerHTML += `<option value="${m.id}">Mesa ${m.numero} (${m.capacidad} personas)</option>`;
            }
        }
    },

    getBadgeMesa(estado) {
        const badges = {
            disponible:     'success',
            reservada:      'warning',
            ocupada:        'danger',
            fuera_servicio: 'secondary',
        };
        return badges[estado] ?? 'secondary';
    },

    getBadgeReserva(estado) {
        const badges = {
            pendiente:  'warning',
            confirmada: 'success',
            cancelada:  'danger',
            finalizada: 'secondary',
        };
        return badges[estado] ?? 'secondary';
    },

    async guardarMesa() {
        const data = {
            numero:    document.getElementById('input-numero-mesa').value.trim(),
            capacidad: parseInt(document.getElementById('input-capacidad').value),
        };

        if (!data.numero || !data.capacidad) {
            UiService.toast('Complete todos los campos.', 'error');
            return;
        }

        let res;
        if (this.mesaSeleccionada) {
            res = await ReservasService.actualizarMesa(this.mesaSeleccionada.id, data);
        } else {
            res = await ReservasService.crearMesa(data);
        }

        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            this.resetFormMesa();
            await this.cargarMesas();
        } else {
            UiService.toast(res?.data?.message || 'Error al guardar.', 'error');
        }
    },

    async guardarReserva() {
        const data = {
            nombre_cliente:    document.getElementById('input-nombre-cliente').value.trim(),
            telefono_cliente:  document.getElementById('input-telefono').value.trim(),
            cantidad_personas: parseInt(document.getElementById('input-personas').value),
            fecha:             document.getElementById('input-fecha').value,
            hora:              document.getElementById('input-hora').value,
            observaciones:     document.getElementById('input-observaciones').value.trim(),
            mesa_id:           parseInt(document.getElementById('input-mesa').value),
        };

        const estadoEl = document.getElementById('input-estado-reserva');
        if (estadoEl && estadoEl.value) {
            data.estado = estadoEl.value;
        }

        if (!data.nombre_cliente || !data.telefono_cliente || !data.fecha || !data.hora || !data.mesa_id) {
            UiService.toast('Complete todos los campos obligatorios.', 'error');
            return;
        }

        let res;
        if (this.reservaSeleccionada) {
            res = await ReservasService.actualizarReserva(this.reservaSeleccionada.id, data);
        } else {
            res = await ReservasService.crearReserva(data);
        }

        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            this.resetFormReserva();
            await this.cargarReservas();
            await this.cargarMesas();
        } else {
            UiService.toast(res?.data?.message || 'Error al guardar.', 'error');
        }
    },

    async cancelarReserva(id) {
        if (!confirm('¿Está seguro de cancelar esta reserva?')) return;

        const res = await ReservasService.cancelarReserva(id);
        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            await this.cargarReservas();
            await this.cargarMesas();
        } else {
            UiService.toast(res?.data?.message || 'Error al cancelar.', 'error');
        }
    },

    async cambiarEstadoMesa(id) {
        const estado = prompt('Ingrese el nuevo estado (disponible, reservada, ocupada, fuera_servicio):');
        if (!estado) return;

        const res = await ReservasService.cambiarEstadoMesa(id, estado);
        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            await this.cargarMesas();
        } else {
            UiService.toast(res?.data?.message || 'Error al cambiar estado.', 'error');
        }
    },

    resetFormMesa() {
        document.getElementById('mesa-form').reset();
        this.mesaSeleccionada = null;
    },

    resetFormReserva() {
        document.getElementById('reserva-form').reset();
        this.reservaSeleccionada = null;
        const estadoGroup = document.getElementById('grupo-estado-reserva');
        if (estadoGroup) estadoGroup.classList.add('hidden');
    },

    bindEventos() {
        document.getElementById('mesa-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarMesa();
        });

        document.getElementById('reserva-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarReserva();
        });

        document.getElementById('mesas-tbody').addEventListener('click', async (e) => {
            const btn    = e.target.closest('[data-action]');
            if (!btn) return;
            const id     = parseInt(btn.dataset.id);
            const action = btn.dataset.action;

            if (action === 'editar-mesa') {
                const res = await ReservasService.obtenerMesa(id);
                if (res?.ok && res.data?.success) {
                    this.mesaSeleccionada = res.data.data;
                    document.getElementById('input-numero-mesa').value = this.mesaSeleccionada.numero;
                    document.getElementById('input-capacidad').value   = this.mesaSeleccionada.capacidad;
                }
            } else if (action === 'estado-mesa') {
                await this.cambiarEstadoMesa(id);
            }
        });

        document.getElementById('reservas-tbody').addEventListener('click', async (e) => {
            const btn    = e.target.closest('[data-action]');
            if (!btn) return;
            const id     = parseInt(btn.dataset.id);
            const action = btn.dataset.action;

            if (action === 'editar-reserva') {
                const res = await ReservasService.obtenerReserva(id);
                if (res?.ok && res.data?.success) {
                    this.reservaSeleccionada = res.data.data;
                    const r = this.reservaSeleccionada;
                    document.getElementById('input-nombre-cliente').value = r.nombre_cliente;
                    document.getElementById('input-telefono').value       = r.telefono_cliente;
                    document.getElementById('input-personas').value       = r.cantidad_personas;
                    document.getElementById('input-fecha').value          = r.fecha;
                    document.getElementById('input-hora').value           = r.hora;
                    document.getElementById('input-observaciones').value  = r.observaciones ?? '';
                    document.getElementById('input-mesa').value           = r.mesa_id;

                    const estadoGroup = document.getElementById('grupo-estado-reserva');
                    const estadoEl    = document.getElementById('input-estado-reserva');
                    if (estadoGroup) estadoGroup.classList.remove('hidden');
                    if (estadoEl)    estadoEl.value = r.estado;
                }
            } else if (action === 'cancelar-reserva') {
                await this.cancelarReserva(id);
            }
        });

        document.getElementById('btn-cancelar-mesa')?.addEventListener('click', () => this.resetFormMesa());
        document.getElementById('btn-cancelar-reserva')?.addEventListener('click', () => this.resetFormReserva());

        document.getElementById('filtro-fecha')?.addEventListener('change', async (e) => {
            const fecha = e.target.value;
            if (!fecha) { await this.cargarReservas(); return; }
            const res = await ReservasService.listarReservasPorFecha(fecha);
            if (res?.ok && res.data?.success) this.renderTablaReservas(res.data.data);
        });

        document.getElementById('filtro-estado')?.addEventListener('change', async (e) => {
            const estado = e.target.value;
            if (!estado) { await this.cargarReservas(); return; }
            const res = await ReservasService.listarReservasPorEstado(estado);
            if (res?.ok && res.data?.success) this.renderTablaReservas(res.data.data);
        });
    },
};

document.addEventListener('DOMContentLoaded', () => ReservasView.init());