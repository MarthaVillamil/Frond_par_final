const PedidosView = {

    pedidoSeleccionado: null,
    detallesTemp: [],

    async init() {
        if (!SesionGuard.check()) return;
        await this.cargarPedidos();
        await this.cargarProductosSelect();
        this.bindEventos();
    },

    async cargarPedidos() {
        const res = await PedidosService.listar();
        if (res?.ok && res.data?.success) {
            this.renderTabla(res.data.data);
        }
    },

    async cargarProductosSelect() {
        const res = await ProductosService.listarDisponibles();
        if (res?.ok && res.data?.success) {
            const select = document.getElementById('input-producto');
            select.innerHTML = '<option value="">Seleccione un producto</option>';
            for (const p of res.data.data) {
                select.innerHTML += `<option value="${p.id}" data-precio="${p.precio}" data-nombre="${p.nombre}">${p.nombre} - $${Number(p.precio).toLocaleString()}</option>`;
            }
        }
    },

    renderTabla(pedidos) {
        const tbody = document.getElementById('pedidos-tbody');
        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay pedidos registrados.</td></tr>';
            return;
        }

        for (const p of pedidos) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>Mesa ${p.mesa_id}</td>
                <td>${p.fecha} ${p.hora}</td>
                <td>${p.detalles?.length ?? 0} productos</td>
                <td>$${Number(p.total).toLocaleString()}</td>
                <td><span class="badge badge-${this.getBadge(p.estado)}">${p.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" data-id="${p.id}" data-action="ver">Ver</button>
                    <button class="btn btn-sm btn-warning" data-id="${p.id}" data-action="estado">Estado</button>
                    <button class="btn btn-sm btn-danger" data-id="${p.id}" data-action="eliminar">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    },

    renderDetallesTemp() {
        const tbody = document.getElementById('detalles-tbody');
        tbody.innerHTML = '';

        if (this.detallesTemp.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay productos agregados.</td></tr>';
            return;
        }

        let total = 0;
        for (const [index, d] of this.detallesTemp.entries()) {
            const subtotal = d.precio_unitario * d.cantidad;
            total += subtotal;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${d.nombre_producto}</td>
                <td>${d.cantidad}</td>
                <td>$${Number(d.precio_unitario).toLocaleString()}</td>
                <td>$${Number(subtotal).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" data-index="${index}" data-action="quitar">Quitar</button>
                </td>
            `;
            tbody.appendChild(tr);
        }

        document.getElementById('pedido-total').textContent = `$${Number(total).toLocaleString()}`;
    },

    getBadge(estado) {
        const badges = {
            pendiente:      'warning',
            en_preparacion: 'info',
            entregado:      'success',
            pagado:         'success',
            cancelado:      'danger',
        };
        return badges[estado] ?? 'secondary';
    },

    agregarProducto() {
        const select   = document.getElementById('input-producto');
        const cantidad = parseInt(document.getElementById('input-cantidad').value);
        const option   = select.options[select.selectedIndex];

        if (!select.value) {
            UiService.toast('Seleccione un producto.', 'error');
            return;
        }

        if (!cantidad || cantidad < 1) {
            UiService.toast('La cantidad debe ser mayor a cero.', 'error');
            return;
        }

        const existente = this.detallesTemp.find(d => d.producto_id === parseInt(select.value));
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            this.detallesTemp.push({
                producto_id:    parseInt(select.value),
                nombre_producto: option.dataset.nombre,
                cantidad,
                precio_unitario: parseFloat(option.dataset.precio),
            });
        }

        this.renderDetallesTemp();
        document.getElementById('input-cantidad').value = 1;
        select.value = '';
    },

    async guardar() {
        const mesa_id = parseInt(document.getElementById('input-mesa-pedido').value);
        const fecha   = document.getElementById('input-fecha-pedido').value;
        const hora    = document.getElementById('input-hora-pedido').value;

        if (!mesa_id || !fecha || !hora) {
            UiService.toast('Complete todos los campos.', 'error');
            return;
        }

        if (this.detallesTemp.length === 0) {
            UiService.toast('Agregue al menos un producto.', 'error');
            return;
        }

        const data = { mesa_id, fecha, hora, detalles: this.detallesTemp };
        const res  = await PedidosService.crear(data);

        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            this.resetForm();
            await this.cargarPedidos();
        } else {
            UiService.toast(res?.data?.message || 'Error al guardar.', 'error');
        }
    },

    async cambiarEstado(id) {
        const estado = prompt('Ingrese el nuevo estado (pendiente, en_preparacion, entregado, pagado, cancelado):');
        if (!estado) return;

        const res = await PedidosService.actualizarEstado(id, estado);
        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            await this.cargarPedidos();
        } else {
            UiService.toast(res?.data?.message || 'Error al cambiar estado.', 'error');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Está seguro de eliminar este pedido?')) return;

        const res = await PedidosService.eliminar(id);
        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            await this.cargarPedidos();
        } else {
            UiService.toast(res?.data?.message || 'Error al eliminar.', 'error');
        }
    },

    async verDetalle(id) {
        const res = await PedidosService.obtener(id);
        if (res?.ok && res.data?.success) {
            const p = res.data.data;
            let detalles = p.detalles.map(d =>
                `${d.nombre_producto} x${d.cantidad} = $${Number(d.subtotal).toLocaleString()}`
            ).join('\n');
            alert(`Pedido #${p.id}\nMesa: ${p.mesa_id}\nEstado: ${p.estado}\nTotal: $${Number(p.total).toLocaleString()}\n\nProductos:\n${detalles}`);
        }
    },

    resetForm() {
        document.getElementById('pedido-form').reset();
        this.detallesTemp = [];
        this.renderDetallesTemp();
    },

    bindEventos() {
        document.getElementById('pedido-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardar();
        });

        document.getElementById('btn-agregar-producto')?.addEventListener('click', () => {
            this.agregarProducto();
        });

        document.getElementById('detalles-tbody').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            if (btn.dataset.action === 'quitar') {
                this.detallesTemp.splice(parseInt(btn.dataset.index), 1);
                this.renderDetallesTemp();
            }
        });

        document.getElementById('pedidos-tbody').addEventListener('click', async (e) => {
            const btn    = e.target.closest('[data-action]');
            if (!btn) return;
            const id     = parseInt(btn.dataset.id);
            const action = btn.dataset.action;

            if (action === 'ver')      await this.verDetalle(id);
            if (action === 'estado')   await this.cambiarEstado(id);
            if (action === 'eliminar') await this.eliminar(id);
        });

        document.getElementById('filtro-estado-pedido')?.addEventListener('change', async (e) => {
            const estado = e.target.value;
            if (!estado) {
                await this.cargarPedidos();
                return;
            }
            const res = await PedidosService.listarPorEstado(estado);
            if (res?.ok && res.data?.success) this.renderTabla(res.data.data);
        });

        document.getElementById('btn-cancelar-pedido')?.addEventListener('click', () => this.resetForm());
    },
};

document.addEventListener('DOMContentLoaded', () => PedidosView.init());