// js/views/adminView.js
import { 
    getCategories, saveCategory, deleteCategory, updateCategory,
    getProducts, saveProduct, deleteProduct, updateProduct,
    loginAdmin, getOrders 
} from '../storage.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div class="login-card" style="padding: 20px; max-width: 360px; width: 90%; margin: 40px auto; box-sizing: border-box;">
            <h2 class="login-title">INICIAR SESIÓN</h2>
            <p class="login-subtitle">PANEL DE ADMINISTRACIÓN</p>
            <form id="login-form">
                <div class="form-group">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" id="login-email" class="form-input" required placeholder="admin@mail.com" style="width:100%; box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-top:15px;">
                    <label class="form-label">Contraseña</label>
                    <input type="password" id="login-password" class="form-input" required placeholder="******" style="width:100%; box-sizing:border-box;">
                </div>
                <button type="submit" class="btn-premium login-btn" style="width:100%; margin-top:20px;">Ingresar</button>
            </form>
            <button id="btn-back-to-store" style="background: transparent; border: none; color: var(--color-texto); margin-top: 20px; cursor: pointer; text-decoration: underline; font-size: 13px; text-transform: uppercase; width:100%;">
                ← Volver a la Tienda
            </button>
            <div id="login-alert" class="alert"></div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const alertDiv = document.getElementById('login-alert');

        const resultado = loginAdmin(email, pass);
        alertDiv.classList.add('alert-visible');
        alertDiv.textContent = resultado.message;

        if (resultado.success) {
            alertDiv.style.color = "green";
            setTimeout(() => renderDashboard(container), 1000);
        } else {
            alertDiv.style.color = "red";
        }
    });

    document.getElementById('btn-back-to-store').addEventListener('click', () => {
        import('./storeView.js').then(module => module.renderStore(container));
    });
}

export function renderDashboard(container) {
    container.innerHTML = `
        <style>
            .db-container { display: flex; flex-direction: column; min-height: 100vh; }
            .db-sidebar { width: 100%; background: #333; color: white; padding: 15px; box-sizing: border-box; }
            .db-main { flex: 1; padding: 15px; background: #f9f9f9; box-sizing: border-box; }
            .sidebar-menu { display: flex; flex-direction: row; gap: 10px; list-style: none; padding: 0; margin: 15px 0; flex-wrap: wrap; }
            .sidebar-menu button { background: none; border: 1px solid #555; color: #ccc; padding: 8px 12px; cursor: pointer; border-radius:4px; font-size:12px;}
            .sidebar-menu button.active { background: var(--color-acento, #b8926a); color: #fff; border-color: transparent;}
            .table-scroll { width: 100%; overflow-x: auto; margin-top: 15px; background:#fff; border: 1px solid #E5E1DA; }
            .content-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
            @media (min-width: 768px) {
                .db-container { flex-direction: row; }
                .db-sidebar { width: 240px; display: flex; flex-direction: column; justify-content: space-between; padding: 25px 20px; }
                .db-main { padding: 30px; }
                .sidebar-menu { flex-direction: column; gap: 15px; margin: 30px 0; }
                .sidebar-menu button { width: 100%; text-align: left; border: none; padding: 10px 0; font-size:14px; }
            }
        </style>

        <div class="db-container">
            <aside class="db-sidebar">
                <div>
                    <div class="sidebar-brand">
                        <h2 style="margin:0; font-size:22px; letter-spacing:1px;">TIENDA MARCIAL</h2>
                        <p style="margin:4px 0 0 0; opacity:0.6; font-size:12px;">Panel Control</p>
                    </div>
                    <ul class="sidebar-menu">
                        <li><button id="menu-categories" class="active">📦 Categorías</button></li>
                        <li><button id="menu-products">🥋 Productos</button></li>
                        <li><button id="menu-orders">📜 Pedidos</button></li>
                    </ul>
                </div>
                <div class="sidebar-footer">
                    <button id="btn-session-logout" style="width: 100%; padding: 10px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size:12px; font-weight:bold;">Cerrar Sesión</button>
                </div>
            </aside>
            <main class="db-main">
                <div class="content-header">
                    <h1 id="dashboard-view-title" style="margin:0; font-size:24px; font-weight:400; font-family:'Playfair Display', serif;">Categorías</h1>
                    <div id="content-actions"></div>
                </div>
                <div id="dashboard-view-body"></div>
            </main>
        </div>
    `;

    renderCategoriesModule();

    const viewTitle = document.getElementById('dashboard-view-title');
    const menuButtons = document.querySelectorAll('.sidebar-menu button');

    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            menuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.getElementById('content-actions').innerHTML = '';

            if (button.id === 'menu-categories') {
                viewTitle.textContent = 'Categorías';
                renderCategoriesModule();
            } else if (button.id === 'menu-products') {
                viewTitle.textContent = 'Productos';
                renderProductsModule(); 
            } else if (button.id === 'menu-orders') {
                viewTitle.textContent = 'Pedidos';
                renderOrdersModule();
            }
        });
    });

    document.getElementById('btn-session-logout').addEventListener('click', () => {
        localStorage.removeItem('admin_session'); 
        location.reload(); 
    });
}

export function renderCategoriesModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    viewActions.innerHTML = `<button id="btn-open-category-modal" class="btn-premium" style="padding: 8px 16px; font-size:12px;">+ Agregar Categoría</button>`;
    const categories = getCategories();

    if (categories.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; font-style: italic;">No hay categorías registradas.</p>`;
    } else {
        viewBody.innerHTML = `
            <div class="table-scroll">
                <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
                    <thead>
                        <tr style="background-color: #333; color: #fff; text-align: left;">
                            <th style="padding: 12px; font-size:11px;">Nombre</th>
                            <th style="padding: 12px; font-size:11px;">Descripción</th>
                            <th style="padding: 12px; text-align: right; font-size:11px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat => `
                            <tr style="border-bottom: 1px solid #E5E1DA;">
                                <td style="padding: 12px; font-weight: bold; font-size:13px;">${cat.name}</td>
                                <td style="padding: 12px; color: #666; font-size:13px;">${cat.description}</td>
                                <td style="padding: 12px; text-align: right;">
                                    <button class="btn-edit-cat" data-id="${cat.id}" data-name="${cat.name}" data-desc="${cat.description}" style="background:none; border:none; color:var(--color-acento); cursor:pointer; font-size:11px;">Editar</button>
                                    <button class="btn-delete-cat" data-id="${cat.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-size:11px; margin-left:8px;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    const webModal = document.createElement('div');
    webModal.innerHTML = `
        <custom-modal id="cat-web-modal" title="Formulario" open="false">
            <form id="form-create-category">
                <input type="hidden" id="cat-edit-id" value="">
                <div class="form-group"><label style="font-size:12px;">Nombre</label><input type="text" id="cat-name" required class="form-input" style="width:100%;"></div>
                <div class="form-group" style="margin-top:10px;"><label style="font-size:12px;">Descripción</label><textarea id="cat-desc" required class="form-input" rows="3" style="width:100%;"></textarea></div>
                <button type="submit" class="btn-premium" style="width: 100%; margin-top:15px; padding:10px;">Guardar</button>
            </form>
        </custom-modal>
    `;
    viewBody.appendChild(webModal);

    const cModal = document.getElementById('cat-web-modal');
    document.getElementById('btn-open-category-modal').addEventListener('click', () => {
        document.getElementById('cat-edit-id').value = "";
        document.getElementById('form-create-category').reset();
        cModal.setAttribute('open', 'true');
    });

    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('cat-edit-id').value = btn.getAttribute('data-id');
            document.getElementById('cat-name').value = btn.getAttribute('data-name');
            document.getElementById('cat-desc').value = btn.getAttribute('data-desc');
            cModal.setAttribute('open', 'true');
        });
    });

    document.getElementById('form-create-category').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-edit-id').value;
        const name = document.getElementById('cat-name').value.trim();
        const desc = document.getElementById('cat-desc').value.trim();

        if (id) updateCategory(id, name, desc);
        else saveCategory(name, desc);

        cModal.setAttribute('open', 'false');
        alert("¡Categoría procesada con éxito!");
        renderCategoriesModule();
    });

    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar categoría?')) {
                deleteCategory(btn.getAttribute('data-id'));
                alert("Eliminado con éxito.");
                renderCategoriesModule();
            }
        });
    });
}

export function renderProductsModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    viewActions.innerHTML = `<button id="btn-open-product-modal" class="btn-premium" style="padding: 8px 16px; font-size:12px;">+ Agregar Producto</button>`;
    const products = getProducts();
    const categories = getCategories();

    if (products.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; font-style: italic;">No hay productos registrados.</p>`;
    } else {
        viewBody.innerHTML = `
            <div class="table-scroll">
                <table style="width: 100%; border-collapse: collapse; min-width: 650px;">
                    <thead>
                        <tr style="background-color: #333; color: #fff; text-align: left;">
                            <th style="padding: 12px; font-size:11px;">Código</th>
                            <th style="padding: 12px; font-size:11px;">Producto</th>
                            <th style="padding: 12px; font-size:11px;">Precio</th>
                            <th style="padding: 12px; font-size:11px;">Stock</th>
                            <th style="padding: 12px; font-size:11px;">Categoría</th>
                            <th style="padding: 12px; text-align: right; font-size:11px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr style="border-bottom: 1px solid #E5E1DA;">
                                <td style="padding: 12px; font-size:12px; font-weight:600; color:#555;">${p.code || 'S/C'}</td>
                                <td style="padding: 12px; font-weight: bold; font-size:13px;">${p.name}</td>
                                <td style="padding: 12px; color: var(--color-acento); font-weight: bold;">$${parseFloat(p.price).toFixed(2)}</td>
                                <td style="padding: 12px; font-size:13px;">${p.stock} uds</td>
                                <td style="padding: 12px;"><span style="background: #E5E1DA; padding: 4px 8px; border-radius: 12px; font-size: 11px;">${p.category}</span></td>
                                <td style="padding: 12px; text-align: right;">
                                    <button class="btn-edit-prod" data-id="${p.id}" data-code="${p.code || ''}" data-name="${p.name}" data-category="${p.category}" data-price="${p.price}" data-stock="${p.stock}" data-image="${p.image}" data-desc="${p.description}" style="background:none; border:none; color:var(--color-acento); cursor:pointer; font-size:11px;">Editar</button>
                                    <button class="btn-delete-prod" data-id="${p.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-size:11px; margin-left:8px;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    const pModalEl = document.createElement('div');
    pModalEl.innerHTML = `
        <custom-modal id="prod-web-modal" title="Formulario de Producto" open="false">
            <form id="form-create-product">
                <input type="hidden" id="prod-edit-id" value="">
                <div class="form-group">
                    <label style="font-size:12px;">Código del Producto *</label>
                    <input type="text" id="prod-code" required placeholder="Ej: TM-001" class="form-input" style="width:100%;">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label style="font-size:12px;">Nombre del Producto *</label>
                    <input type="text" id="prod-name" required class="form-input" style="width:100%;">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label style="font-size:12px;">Categoría *</label>
                    <select id="prod-category" required class="form-input" style="width:100%;">
                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 15px; margin-top:10px;">
                    <div style="flex:1;"><label style="font-size:12px;">Precio ($)</label><input type="number" step="0.01" id="prod-price" required class="form-input" style="width:100%;"></div>
                    <div style="flex:1;"><label style="font-size:12px;">Stock</label><input type="number" id="prod-stock" required class="form-input" style="width:100%;"></div>
                </div>
                <div class="form-group" style="margin-top:10px;"><label style="font-size:12px;">URL de Imagen</label><input type="text" id="prod-img" class="form-input" style="width:100%;"></div>
                <div class="form-group" style="margin-top:10px;"><label style="font-size:12px;">Descripción</label><textarea id="prod-desc" required class="form-input" rows="2" style="width:100%;"></textarea></div>
                <button type="submit" class="btn-premium" style="width: 100%; margin-top:15px; padding:10px;">Guardar Producto</button>
            </form>
        </custom-modal>
    `;
    viewBody.appendChild(pModalEl);

    const prModal = document.getElementById('prod-web-modal');
    document.getElementById('btn-open-product-modal').addEventListener('click', () => {
        if(categories.length === 0) { alert('Registre primero una categoría'); return; }
        document.getElementById('prod-edit-id').value = "";
        document.getElementById('form-create-product').reset();
        prModal.setAttribute('open', 'true');
    });

    document.querySelectorAll('.btn-edit-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('prod-edit-id').value = btn.getAttribute('data-id');
            document.getElementById('prod-code').value = btn.getAttribute('data-code');
            document.getElementById('prod-name').value = btn.getAttribute('data-name');
            document.getElementById('prod-category').value = btn.getAttribute('data-category');
            document.getElementById('prod-price').value = btn.getAttribute('data-price');
            document.getElementById('prod-stock').value = btn.getAttribute('data-stock');
            document.getElementById('prod-img').value = btn.getAttribute('data-image');
            document.getElementById('prod-desc').value = btn.getAttribute('data-desc');
            prModal.setAttribute('open', 'true');
        });
    });

    document.getElementById('form-create-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-edit-id').value;
        const data = {
            code: document.getElementById('prod-code').value.trim(),
            name: document.getElementById('prod-name').value.trim(),
            category: document.getElementById('prod-category').value,
            price: document.getElementById('prod-price').value,
            stock: document.getElementById('prod-stock').value,
            image: document.getElementById('prod-img').value.trim(),
            description: document.getElementById('prod-desc').value.trim()
        };

        if(id) updateProduct(id, data);
        else saveProduct(data);

        prModal.setAttribute('open', 'false');
        alert("¡Inventario actualizado!");
        renderProductsModule();
    });

    document.querySelectorAll('.btn-delete-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar producto?')) {
                deleteProduct(btn.getAttribute('data-id'));
                renderProductsModule();
            }
        });
    });
}

export function renderOrdersModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const orders = getOrders(); // Ya se extraen ordenados por fecha en el storage

    if (orders.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; font-style: italic;">No hay pedidos registrados.</p>`;
        return;
    }

    viewBody.innerHTML = `
        <div class="table-scroll">
            <table style="width: 100%; border-collapse: collapse; min-width: 650px;">
                <thead>
                    <tr style="background-color: #333; color: #fff; text-align: left;">
                        <th style="padding: 12px; font-size:11px;">Fecha</th>
                        <th style="padding: 12px; font-size:11px;">Resumen Cliente</th>
                        <th style="padding: 12px; font-size:11px;">Total Pagado</th>
                        <th style="padding: 12px; text-align: right; font-size:11px;">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        // Extraemos la primera parte del string para la vista rápida
                        const shortName = order.customerName.split('|')[0] || order.customerName;
                        return `
                            <tr style="border-bottom: 1px solid #E5E1DA;">
                                <td style="padding: 12px; font-size:13px; color:#666;">${order.date}</td>
                                <td style="padding: 12px; font-weight: bold; font-size:13px;">${shortName}</td>
                                <td style="padding: 12px; color: var(--color-acento); font-weight: bold;">$${parseFloat(order.total).toFixed(2)}</td>
                                <td style="padding: 12px; text-align: right;">
                                    <button class="btn-view-order-details" data-full-info="${order.customerName}" data-summary="${order.productsSummary}" data-total="${order.total}" data-date="${order.date}" style="background:none; border:none; color:var(--color-acento); cursor:pointer; font-weight:bold; font-size:11px; text-transform:uppercase;">
                                        🔍 Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    // 🌟 REQUERIMIENTO COMPLETADO: MODAL DINÁMICO DE DETALLES COMPLETOS POR PEDIDO
    const oModalEl = document.createElement('div');
    oModalEl.innerHTML = `
        <custom-modal id="order-detail-modal" title="Auditoría de Pedido Completa" open="false">
            <div style="padding: 5px; font-size:13px; line-height:1.6;">
                <p><strong>Fecha Registro:</strong> <span id="od-date"></span></p>
                <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
                <p style="background:#FAF9F6; padding:10px; border-left:3px solid var(--color-acento); font-style:italic;">
                    <strong>Ficha del Cliente:</strong><br><span id="od-customer"></span>
                </p>
                <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
                <p><strong>Artículos Adquiridos:</strong></p>
                <div id="od-summary" style="background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:12px;"></div>
                <h3 style="text-align:right; margin-top:15px; color:var(--color-texto);">Total: $<span id="od-total"></span></h3>
            </div>
        </custom-modal>
    `;
    viewBody.appendChild(oModalEl);

    const ordModal = document.getElementById('order-detail-modal');

    document.querySelectorAll('.btn-view-order-details').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('od-date').textContent = btn.getAttribute('data-date');
            document.getElementById('od-customer').innerHTML = btn.getAttribute('data-full-info').split('|').join('<br>');
            document.getElementById('od-summary').textContent = btn.getAttribute('data-summary');
            document.getElementById('od-total').textContent = parseFloat(btn.getAttribute('data-total')).toFixed(2);
            ordModal.setAttribute('open', 'true');
        });
    });
}