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
            
            <button id="btn-back-to-store" style="background: transparent; border: none; color: var(--color-texto); margin-top: 20px; cursor: pointer; text-decoration: underline; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width:100%;">
                ← Volver a la Tienda
            </button>
            
            <div id="login-alert" class="alert"></div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const btnBackStore = document.getElementById('btn-back-to-store');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const alertDiv = document.getElementById('login-alert');

        const resultado = loginAdmin(email, pass);

        alertDiv.classList.add('alert-visible');
        alertDiv.textContent = resultado.message;
        alertDiv.classList.remove('alert-success', 'alert-error');

        if (resultado.success) {
            alertDiv.classList.add('alert-success');
            setTimeout(() => {
                renderDashboard(container);
            }, 1000);
        } else {
            alertDiv.classList.add('alert-error');
        }
    });

    btnBackStore.addEventListener('click', () => {
        import('./storeView.js').then(module => {
            module.renderStore(container);
        });
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
                        <h2 style="margin:0; font-size:22px; letter-spacing:1px;">BOUTIQUE</h2>
                        <p style="margin:4px 0 0 0; opacity:0.6; font-size:12px;">Panel de Control</p>
                    </div>
                    <ul class="sidebar-menu">
                        <li><button id="menu-categories" class="active">📦 Categorías</button></li>
                        <li><button id="menu-products">👗 Productos</button></li>
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
                <div id="dashboard-view-body">
                    <p>Cargando información del módulo...</p>
                </div>
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

// ==========================================
// MÓDULO CATEGORÍAS (CRUD COMPLETO)
// ==========================================
export function renderCategoriesModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    viewActions.innerHTML = `
        <button id="btn-open-category-modal" class="btn-premium" style="padding: 8px 16px; font-size:12px;">
            + Agregar Categoría
        </button>
    `;

    const categories = getCategories();

    if (categories.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">No hay categorías registradas.</p>`;
    } else {
        const tableRows = categories.map(cat => `
            <tr style="border-bottom: 1px solid #E5E1DA;">
                <td style="padding: 12px; font-weight: bold; font-size:13px;">${cat.name}</td>
                <td style="padding: 12px; color: #666; font-size:13px;">${cat.description}</td>
                <td style="padding: 12px; text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn-edit-cat" data-id="${cat.id}" data-name="${cat.name}" data-desc="${cat.description}" style="background:none; border:none; color:var(--color-acento); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:11px;">
                        Editar
                    </button>
                    <button class="btn-delete-cat" data-id="${cat.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:11px;">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        viewBody.innerHTML = `
            <div class="table-scroll">
                <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
                    <thead>
                        <tr style="background-color: #333; color: #fff; text-align: left;">
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px; width:30%;">Nombre</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px; width:50%;">Descripción</th>
                            <th style="padding: 12px; text-align: right; text-transform:uppercase; font-size:11px; width:20%;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }

    const modalId = 'modal-new-category';
    let modalElement = document.getElementById(modalId);
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = modalId;
        viewBody.appendChild(modalElement);
    }

    modalElement.innerHTML = `
        <custom-modal id="cat-web-modal" title="Formulario de Categoría" open="false">
            <form id="form-create-category" style="margin-top: 10px; padding: 0 5px;">
                <input type="hidden" id="cat-edit-id" value="">
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Nombre de la Categoría</label>
                    <input type="text" id="cat-name" class="form-input" required placeholder="Ej: Karate, Aikido..." style="width:100%; box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label class="form-label" style="font-size:12px;">Descripción</label>
                    <textarea id="cat-desc" class="form-input" rows="3" required placeholder="Breve descripción..." style="resize:none; font-family:inherit; width:100%; box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" id="btn-submit-cat-modal" class="btn-premium" style="width: 100%; border-radius:6px; margin-top:15px; padding:10px;">Guardar Categoría</button>
            </form>
        </custom-modal>
    `;

    const webModal = document.getElementById('cat-web-modal');
    const formCreateCat = document.getElementById('form-create-category');
    const inputEditId = document.getElementById('cat-edit-id');
    const inputName = document.getElementById('cat-name');
    const inputDesc = document.getElementById('cat-desc');

    document.getElementById('btn-open-category-modal').addEventListener('click', () => {
        inputEditId.value = "";
        formCreateCat.reset();
        webModal.setAttribute('title', 'Nueva Categoría');
        webModal.setAttribute('open', 'true');
    });

    // Acción de Editar Categoría (Rellenar formulario)
    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            inputEditId.value = btn.getAttribute('data-id');
            inputName.value = btn.getAttribute('data-name');
            inputDesc.value = btn.getAttribute('data-desc');
            webModal.setAttribute('title', 'Editar Categoría');
            webModal.setAttribute('open', 'true');
        });
    });

    formCreateCat.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = inputEditId.value;
        const name = inputName.value.trim();
        const desc = inputDesc.value.trim();

        let response;
        if (id) {
            response = updateCategory(id, name, desc); // U de CRUD
        } else {
            response = saveCategory(name, desc); // C de CRUD
        }

        if (response.success) {
            webModal.setAttribute('open', 'false');
            alert(response.message); 
            renderCategoriesModule();
        }
    });

    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                const response = deleteCategory(id);
                if (response.success) {
                    alert(response.message);
                    renderCategoriesModule();
                }
            }
        });
    });
}

// ==========================================
// MÓDULO PRODUCTOS (CRUD COMPLETO)
// ==========================================
export function renderProductsModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    viewActions.innerHTML = `
        <button id="btn-open-product-modal" class="btn-premium" style="padding: 8px 16px; font-size:12px;">
            + Agregar Producto
        </button>
    `;

    const products = getProducts();
    const categories = getCategories();

    if (products.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">No hay productos en el inventario.</p>`;
    } else {
        const tableRows = products.map(prod => `
            <tr style="border-bottom: 1px solid #E5E1DA;">
                <td style="padding: 8px;"><img src="${prod.image}" alt="${prod.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                <td style="padding: 12px; font-weight: bold; font-size:13px;">${prod.name}</td>
                <td style="padding: 12px; color: var(--color-acento); font-weight: bold; font-size:13px;">$${parseFloat(prod.price).toFixed(2)}</td>
                <td style="padding: 12px; font-size:13px;">${prod.stock} uds</td>
                <td style="padding: 12px;"><span style="background: #E5E1DA; padding: 4px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">${prod.category}</span></td>
                <td style="padding: 12px; text-align: right; display:flex; gap:8px; justify-content:flex-end; align-items:center; height:56px;">
                    <button class="btn-edit-prod" 
                        data-id="${prod.id}" data-name="${prod.name}" data-category="${prod.category}"
                        data-price="${prod.price}" data-stock="${prod.stock}" data-image="${prod.image}" 
                        data-desc="${prod.description}"
                        style="background:none; border:none; color:var(--color-acento); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:11px;">
                        Editar
                    </button>
                    <button class="btn-delete-prod" data-id="${prod.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:11px;">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        viewBody.innerHTML = `
            <div class="table-scroll">
                <table style="width: 100%; border-collapse: collapse; min-width: 650px;">
                    <thead>
                        <tr style="background-color: #333; color: #fff; text-align: left;">
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Foto</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Producto</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Precio</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Stock</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Categoría</th>
                            <th style="padding: 12px; text-align: right; text-transform:uppercase; font-size:11px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }

    const categoryOptions = categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');

    const modalId = 'modal-new-product';
    let modalElement = document.getElementById(modalId);
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = modalId;
        viewBody.appendChild(modalElement);
    }

    modalElement.innerHTML = `
        <custom-modal id="prod-web-modal" title="Formulario de Producto" open="false">
            <form id="form-create-product" style="margin-top: 10px; padding:0 5px;">
                <input type="hidden" id="prod-edit-id" value="">
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Nombre del Producto</label>
                    <input type="text" id="prod-name" class="form-input" required placeholder="Ej: Gi Tradicional Karate" style="width:100%; box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label class="form-label" style="font-size:12px;">Categoría</label>
                    <select id="prod-category" class="form-input" required style="font-family:inherit; width:100%; box-sizing:border-box;">
                        <option value="" disabled selected>Seleccione una categoría...</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div style="display: flex; gap: 15px; margin-top:10px;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" style="font-size:12px;">Precio ($)</label>
                        <input type="number" id="prod-price" class="form-input" step="0.01" min="0.1" required placeholder="29.99" style="width:100%; box-sizing:border-box;">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" style="font-size:12px;">Cantidad (Stock)</label>
                        <input type="number" id="prod-stock" class="form-input" min="0" required placeholder="10" style="width:100%; box-sizing:border-box;">
                    </div>
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label class="form-label" style="font-size:12px;">Ruta/URL de la Imagen</label>
                    <input type="text" id="prod-img" class="form-input" placeholder="Ej: img/kumiteKarate.jpg" style="width:100%; box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label class="form-label" style="font-size:12px;">Descripción</label>
                    <textarea id="prod-desc" class="form-input" rows="2" required placeholder="Detalles del producto..." style="resize:none; font-family:inherit; width:100%; box-sizing:border-box;"></textarea>
                </div>
                <button type="submit" class="btn-premium" style="width: 100%; border-radius:6px; margin-top:15px; padding:10px;">Guardar Producto</button>
            </form>
        </custom-modal>
    `;

    const webModal = document.getElementById('prod-web-modal');
    const formCreateProd = document.getElementById('form-create-product');
    const inputProdId = document.getElementById('prod-edit-id');
    const inputProdName = document.getElementById('prod-name');
    const inputProdCat = document.getElementById('prod-category');
    const inputProdPrice = document.getElementById('prod-price');
    const inputProdStock = document.getElementById('prod-stock');
    const inputProdImg = document.getElementById('prod-img');
    const inputProdDesc = document.getElementById('prod-desc');

    document.getElementById('btn-open-product-modal').addEventListener('click', () => {
        if (categories.length === 0) {
            alert('Atención: Debe registrar al menos una categoría antes de agregar productos.');
            return;
        }
        inputProdId.value = "";
        formCreateProd.reset();
        webModal.setAttribute('title', 'Nuevo Producto');
        webModal.setAttribute('open', 'true');
    });

    // Acción de Editar Producto (Rellenar campos)
    document.querySelectorAll('.btn-edit-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            inputProdId.value = btn.getAttribute('data-id');
            inputProdName.value = btn.getAttribute('data-name');
            inputProdCat.value = btn.getAttribute('data-category');
            inputProdPrice.value = btn.getAttribute('data-price');
            inputProdStock.value = btn.getAttribute('data-stock');
            inputProdImg.value = btn.getAttribute('data-image');
            inputProdDesc.value = btn.getAttribute('data-desc');
            webModal.setAttribute('title', 'Editar Producto');
            webModal.setAttribute('open', 'true');
        });
    });

    formCreateProd.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = inputProdId.value;
        const productData = {
            name: inputProdName.value.trim(),
            category: inputProdCat.value,
            price: inputProdPrice.value,
            stock: inputProdStock.value,
            image: inputProdImg.value.trim(),
            description: inputProdDesc.value.trim()
        };

        let response;
        if (id) {
            response = updateProduct(id, productData); // U de CRUD
        } else {
            response = saveProduct(productData); // C de CRUD
        }

        if (response.success) {
            webModal.setAttribute('open', 'false');
            alert(response.message);
            renderProductsModule(); 
        }
    });

    document.querySelectorAll('.btn-delete-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Desea eliminar este producto?')) {
                const response = deleteProduct(id);
                if (response.success) {
                    alert(response.message);
                    renderProductsModule();
                }
            }
        });
    });
}

// ==========================================
// MÓDULO PEDIDOS (HISTORIAL/READ)
// ==========================================
export function renderOrdersModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    viewActions.innerHTML = `<span style="color: #666; font-size: 13px; font-style: italic;">Historial de ventas en tiempo real</span>`;

    const orders = getOrders();

    if (orders.length === 0) {
        viewBody.innerHTML = `<p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">No se han registrado pedidos en el sistema todavía.</p>`;
    } else {
        const tableRows = orders.map(order => `
            <tr style="border-bottom: 1px solid #E5E1DA;">
                <td style="padding: 12px; font-weight: bold; font-size:13px;">#${order.id.slice(-6)}</td>
                <td style="padding: 12px; color: #666; font-size:13px;">${order.date}</td>
                <td style="padding: 12px; font-size:13px; max-width: 200px; white-space: normal; word-break: break-word;">${order.customerName}</td>
                <td style="padding: 12px; max-width: 250px; font-size: 12px; white-space: normal; word-break: break-word;">${order.productsSummary}</td>
                <td style="padding: 12px; color: var(--color-acento); font-weight: bold; font-size:13px;">$${parseFloat(order.total).toFixed(2)}</td>
            </tr>
        `).join('');

        viewBody.innerHTML = `
            <div class="table-scroll">
                <table style="width: 100%; border-collapse: collapse; min-width: 650px;">
                    <thead>
                        <tr style="background-color: #333; color: #fff; text-align: left;">
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">ID Pedido</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Fecha</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Cliente e Info Postal</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Productos</th>
                            <th style="padding: 12px; text-transform:uppercase; font-size:11px;">Total Pagado</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }
}