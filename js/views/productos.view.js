const ProductosView = {

    productoSeleccionado: null,

    async init() {
        if (!SesionGuard.check()) return;
        await this.cargarProductos();
        this.bindEventos();
    },

    async cargarProductos() {
        const res = await ProductosService.listar();
        if (res?.ok && res.data?.success) {
            this.renderTabla(res.data.data);
        }
    },

    renderTabla(productos) {
        const tbody = document.getElementById('productos-tbody');
        tbody.innerHTML = '';

        if (productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay productos registrados.</td></tr>';
            return;
        }

        for (const p of productos) {
            const tr = document.createElement('tr');

            const disponible = p.disponible
                ? '<span class="badge badge-success">Disponible</span>'
                : '<span class="badge badge-danger">No disponible</span>';

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria?.nombre ?? '-'}</td>
                <td>$${Number(p.precio).toLocaleString()}</td>
                <td>${disponible}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" data-id="${p.id}" data-action="editar">Editar</button>
                    <button class="btn btn-sm btn-danger" data-id="${p.id}" data-action="eliminar">Eliminar</button>
                </td>
            `;

            tbody.appendChild(tr);
        }
    },

    async guardar() {
        const data = this.getFormData();

        if (!data.nombre || !data.precio || !data.categoria_id) {
            UiService.toast('Complete todos los campos obligatorios.', 'error');
            return;
        }

        let res;
        if (this.productoSeleccionado) {
            res = await ProductosService.actualizar(this.productoSeleccionado.id, data);
        } else {
            res = await ProductosService.crear(data);
        }

        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            this.resetForm();
            await this.cargarProductos();
        } else {
            UiService.toast(res?.data?.message || 'Error al guardar.', 'error');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Está seguro de eliminar este producto?')) return;

        const res = await ProductosService.eliminar(id);
        if (res?.ok && res.data?.success) {
            UiService.toast(res.data.message, 'success');
            await this.cargarProductos();
        } else {
            UiService.toast(res?.data?.message || 'Error al eliminar.', 'error');
        }
    },

    editar(producto) {
        this.productoSeleccionado = producto;
        this.setFormData(producto);
    },

    getFormData() {
        return {
            nombre:       document.getElementById('input-nombre').value.trim(),
            descripcion:  document.getElementById('input-descripcion').value.trim(),
            precio:       parseFloat(document.getElementById('input-precio').value),
            disponible:   document.getElementById('input-disponible').checked,
            categoria_id: parseInt(document.getElementById('input-categoria').value),
        };
    },

    setFormData(producto) {
        document.getElementById('input-nombre').value      = producto.nombre;
        document.getElementById('input-descripcion').value = producto.descripcion ?? '';
        document.getElementById('input-precio').value      = producto.precio;
        document.getElementById('input-disponible').checked = producto.disponible;
        document.getElementById('input-categoria').value   = producto.categoria_id;
    },

    resetForm() {
        document.getElementById('producto-form').reset();
        this.productoSeleccionado = null;
    },

    bindEventos() {
        document.getElementById('producto-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardar();
        });

        document.getElementById('productos-tbody').addEventListener('click', async (e) => {
            const btn    = e.target.closest('[data-action]');
            if (!btn) return;
            const id     = parseInt(btn.dataset.id);
            const action = btn.dataset.action;

            if (action === 'eliminar') {
                await this.eliminar(id);
            } else if (action === 'editar') {
                const res = await ProductosService.obtener(id);
                if (res?.ok && res.data?.success) {
                    this.editar(res.data.data);
                }
            }
        });

        document.getElementById('btn-cancelar')?.addEventListener('click', () => {
            this.resetForm();
        });
    },
};

document.addEventListener('DOMContentLoaded', () => ProductosView.init());