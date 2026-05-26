// js/views/adminView.js
import { getCategories, saveCategory, deleteCategory, getProducts, saveProduct, deleteProduct, loginAdmin } from '../storage.js';

// ==========================================
// 1. MÓDULO DE INICIO DE SESIÓN
// ==========================================
export function renderLogin(container) {
    container.innerHTML = `
        <div class="login-card">
            <h2 class="login-title">INICIAR SESIÓN</h2>
            <p class="login-subtitle">PANEL DE ADMINISTRACIÓN</p>
            
            <form id="login-form">
                <div class="form-group">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" id="login-email" class="form-input" required placeholder="admin@mail.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input type="password" id="login-password" class="form-input" required placeholder="******">
                </div>
                
                <button type="submit" class="btn-premium login-btn">Ingresar</button>
            </form>
            
            <div id="login-alert" class="alert"></div>
        </div>
    `;

    const form = document.getElementById('login-form');
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
}

// ==========================================
// 2. ENTORNO PRINCIPAL (DASHBOARD LAYOUT)
// ==========================================
export function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-layout">
            
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <h2>BOUTIQUE</h2>
                    <p>Panel de Control</p>
                </div>
                
                <ul class="sidebar-menu">
                    <li class="menu-item">
                        <button id="menu-categories" class="active">📦 Categorías</button>
                    </li>
                    <li class="menu-item">
                        <button id="menu-products">👗 Productos</button>
                    </li>
                    <li class="menu-item">
                        <button id="menu-orders">📜 Pedidos</button>
                    </li>
                </ul>
                
                <div class="sidebar-footer">
                    <button id="btn-session-logout" class="btn-logout">Cerrar Sesión</button>
                </div>
            </aside>

            <main class="main-content">
                <div class="content-header">
                    <h1 id="dashboard-view-title" class="content-title">Categorías</h1>
                    <div id="content-actions"></div>
                </div>
                
                <div id="dashboard-view-body">
                    <p>Cargando información del módulo...</p>
                </div>
            </main>

        </div>
    `;

    // Carga inicial por defecto (Categorías)
    renderCategoriesModule();

    const viewTitle = document.getElementById('dashboard-view-title');
    const menuButtons = document.querySelectorAll('.sidebar-menu button');
    const btnLogout = document.getElementById('btn-session-logout');

    menuButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            menuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Limpiamos el contenedor de acciones para evitar residuos visuales
            document.getElementById('content-actions').innerHTML = '';

            if (button.id === 'menu-categories') {
                viewTitle.textContent = 'Categorías';
                renderCategoriesModule();
            } else if (button.id === 'menu-products') {
                viewTitle.textContent = 'Productos';
                renderProductsModule(); 
            } else if (button.id === 'menu-orders') {
                viewTitle.textContent = 'Pedidos';
                document.getElementById('dashboard-view-body').innerHTML = '<p style="font-style:italic; color:#888;">Módulo de pedidos en desarrollo...</p>';
            }
        });
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('admin_session'); 
        location.reload(); 
    });
}

// ==========================================
// 3. MÓDULO INTERNO DE GESTIÓN DE CATEGORÍAS
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
        viewBody.innerHTML = `
            <p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">
                No hay categorías registradas actualmente. Presiona el botón de arriba para crear una.
            </p>
        `;
    } else {
        const tableRows = categories.map(cat => `
            <tr style="border-bottom: 1px solid #E5E1DA;">
                <td style="padding: 15px; font-weight: bold;">${cat.name}</td>
                <td style="padding: 15px; color: #666;">${cat.description}</td>
                <td style="padding: 15px; text-align: right;">
                    <button class="btn-delete-cat" data-id="${cat.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:12px;">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        viewBody.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; background: #FFF; border: 1px solid #E5E1DA;">
                <thead>
                    <tr style="background-color: var(--color-texto); color: var(--color-fondo); text-align: left;">
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Nombre</th>
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Descripción</th>
                        <th style="padding: 15px; text-align: right; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
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
        <custom-modal id="cat-web-modal" title="Nueva Categoría" open="false">
            <form id="form-create-category" style="margin-top: 10px;">
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Nombre de la Categoría</label>
                    <input type="text" id="cat-name" class="form-input" required placeholder="Ej: Camisas, Calzado...">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Descripción</label>
                    <textarea id="cat-desc" class="form-input" rows="3" required placeholder="Breve descripción de la categoría..." style="resize:none; font-family:inherit;"></textarea>
                </div>
                <button type="submit" class="btn-premium" style="width: 100%; border-radius:6px; margin-top:10px;">Guardar Categoría</button>
            </form>
        </custom-modal>
    `;

    const webModal = document.getElementById('cat-web-modal');
    const btnOpenModal = document.getElementById('btn-open-category-modal');
    const formCreateCat = document.getElementById('form-create-category');

    btnOpenModal.addEventListener('click', () => {
        webModal.setAttribute('open', 'true');
    });

    formCreateCat.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const desc = document.getElementById('cat-desc').value;
        const response = saveCategory(name, desc);
        if (response.success) {
            webModal.setAttribute('open', 'false');
            alert(response.message); 
            renderCategoriesModule();
        }
    });

    const deleteButtons = document.querySelectorAll('.btn-delete-cat');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
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
// 4. MÓDULO INTERNO DE GESTIÓN DE PRODUCTOS 
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
        viewBody.innerHTML = `
            <p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">
                No hay productos en el inventario. Presiona el botón de arriba para registrar uno.
            </p>
        `;
    } else {
        const tableRows = products.map(prod => `
            <tr style="border-bottom: 1px solid #E5E1DA;">
                <td style="padding: 10px;"><img src="${prod.image}" alt="${prod.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #E5E1DA;"></td>
                <td style="padding: 15px; font-weight: bold;">${prod.name}</td>
                <td style="padding: 15px; color: var(--color-acento); font-weight: bold;">$${prod.price.toFixed(2)}</td>
                <td style="padding: 15px;">${prod.stock} uds</td>
                <td style="padding: 15px;"><span style="background: #E5E1DA; padding: 4px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">${prod.category}</span></td>
                <td style="padding: 15px; text-align: right;">
                    <button class="btn-delete-prod" data-id="${prod.id}" style="background:none; border:none; color:var(--color-error); cursor:pointer; font-weight:bold; text-transform:uppercase; font-size:12px;">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        viewBody.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; background: #FFF; border: 1px solid #E5E1DA;">
                <thead>
                    <tr style="background-color: var(--color-texto); color: var(--color-fondo); text-align: left;">
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px;">Foto</th>
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px;">Producto</th>
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px;">Precio</th>
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px;">Stock</th>
                        <th style="padding: 15px; text-transform:uppercase; font-size:12px;">Categoría</th>
                        <th style="padding: 15px; text-align: right; text-transform:uppercase; font-size:12px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
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
        <custom-modal id="prod-web-modal" title="Nuevo Producto" open="false">
            <form id="form-create-product" style="margin-top: 10px;">
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Nombre del Producto</label>
                    <input type="text" id="prod-name" class="form-input" required placeholder="Ej: Camisa Lino Slim">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Categoría</label>
                    <select id="prod-category" class="form-input" required style="font-family:inherit;">
                        <option value="" disabled selected>Seleccione una categoría...</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" style="font-size:12px;">Precio ($)</label>
                        <input type="number" id="prod-price" class="form-input" step="0.01" min="0.1" required placeholder="29.99">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" style="font-size:12px;">Cantidad (Stock)</label>
                        <input type="number" id="prod-stock" class="form-input" min="1" required placeholder="10">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">URL de la Imagen del Producto</label>
                    <input type="url" id="prod-img" class="form-input" placeholder="Ej: https://enlace-de-la-imagen.com/foto.jpg">
                    <small style="color: #666; font-size: 11px; display: block; margin-top: 4px;">Dejar vacío para usar la imagen por defecto.</small>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:12px;">Descripción</label>
                    <textarea id="prod-desc" class="form-input" rows="2" required placeholder="Detalles de la prenda..." style="resize:none; font-family:inherit;"></textarea>
                </div>
                <button type="submit" class="btn-premium" style="width: 100%; border-radius:6px; margin-top:5px;">Guardar Producto</button>
            </form>
        </custom-modal>
    `;

    const webModal = document.getElementById('prod-web-modal');
    const btnOpenModal = document.getElementById('btn-open-product-modal');
    const formCreateProd = document.getElementById('form-create-product');

    btnOpenModal.addEventListener('click', () => {
        if (categories.length === 0) {
            alert('Atención: Debe registrar al menos una categoría en el sistema antes de poder agregar productos.');
            return;
        }
        webModal.setAttribute('open', 'true');
    });

    formCreateProd.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        price: document.getElementById('prod-price').value,
        stock: document.getElementById('prod-stock').value,
        // 🌟 MEJORA: Capturamos directamente el valor del input (la URL de internet)
        image: document.getElementById('prod-img').value,
        description: document.getElementById('prod-desc').value
    };

    const response = saveProduct(productData);

    if (response.success) {
        webModal.setAttribute('open', 'false');
        alert(response.message);
        renderProductsModule(); 
    }
});

    const deleteButtons = document.querySelectorAll('.btn-delete-prod');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Desea eliminar este producto del inventario?')) {
                const response = deleteProduct(id);
                if (response.success) {
                    alert(response.message);
                    renderProductsModule();
                }
            }
        });
    });
}