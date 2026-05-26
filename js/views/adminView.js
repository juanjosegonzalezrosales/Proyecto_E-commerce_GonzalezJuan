// js/views/adminView.js
// Importamos de forma explícita usando la extensión .js y saliendo con '../'
import { loginAdmin } from '../storage.js';

export function renderLogin(container) 
{
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

        // Ejecutamos la lógica de validación
        const resultado = loginAdmin(email, pass);

        alertDiv.classList.add('alert-visible');
        alertDiv.textContent = resultado.message;
        alertDiv.classList.remove('alert-success', 'alert-error');

        if (resultado.success) {
            alertDiv.classList.add('alert-success');
            setTimeout(() => {
                // MODIFICACIÓN: En vez de un alert vacío, llamamos al Dashboard directamente
                renderDashboard(container);
            }, 1000); // Bajamos a 1 segundo para mejorar la UX
        } else {
            alertDiv.classList.add('alert-error');
        }
    });
}

// Al final de js/views/adminView.js

// UBICACIÓN: Dentro de js/views/adminView.js

export function renderDashboard(container) {
    // ==========================================
    // PUNTO 1: INYECTAR LA ESTRUCTURA BASE
    // ==========================================
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
                    <div id="content-actions">
                        </div>
                </div>
                
                <div id="dashboard-view-body">
                    <p>Cargando información del módulo...</p>
                </div>
            </main>

        </div>
    `;

    // 🌟 LÍNEA NUEVA DEL PASO 4 (A): 
    // Apenas se dibuja el Dashboard por primera vez, mandamos a pintar el listado de categorías por defecto.
    renderCategoriesModule();


    // ==========================================
    // PUNTO 2: CAPTURAR ELEMENTOS INTERNOS
    // ==========================================
    const viewTitle = document.getElementById('dashboard-view-title');
    const menuButtons = document.querySelectorAll('.sidebar-menu button');
    const btnLogout = document.getElementById('btn-session-logout');


    // ==========================================
    // PUNTO 3: LÓGICA DE LOS CLICKS EN EL MENÚ
    // ==========================================
    menuButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Quitamos la clase active de todos los botones
            menuButtons.forEach(btn => btn.classList.remove('active'));
            // Se la ponemos solo al botón seleccionado
            button.classList.add('active');

            // Evaluamos a qué botón se le dio clic:
            if (button.id === 'menu-categories') {
                viewTitle.textContent = 'Categorías';
                
                // 🌟 LÍNEA NUEVA DEL PASO 4 (B):
                // Si hace clic en el botón de Categorías, volvemos a renderizar el módulo para actualizar la tabla.
                renderCategoriesModule();

            } else if (button.id === 'menu-products') {
                viewTitle.textContent = 'Productos';
                // (Próximamente limpiaremos el contenedor y cargaremos los productos)
                document.getElementById('content-actions').innerHTML = '';
                document.getElementById('dashboard-view-body').innerHTML = '<p>Módulo de productos en construcción...</p>';

            } else if (button.id === 'menu-orders') {
                viewTitle.textContent = 'Pedidos';
                // (Próximamente limpiaremos el contenedor y cargaremos los pedidos)
                document.getElementById('content-actions').innerHTML = '';
                document.getElementById('dashboard-view-body').innerHTML = '<p>Módulo de pedidos en construcción...</p>';
            }
        });
    });


    // ==========================================
    // PUNTO 4: LÓGICA DEL BOTÓN CERRAR SESIÓN
    // ==========================================
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('admin_session'); 
        location.reload(); 
    });
}

// Al final de js/views/adminView.js
import { getCategories, saveCategory, deleteCategory } from '../storage.js';

// Función para renderizar el listado y formulario de categorías
export function renderCategoriesModule() {
    const viewBody = document.getElementById('dashboard-view-body');
    const viewActions = document.getElementById('content-actions');

    // 1. Definimos el botón de acción en la cabecera
    viewActions.innerHTML = `
        <button id="btn-open-category-modal" class="btn-premium" style="padding: 8px 16px; font-size:12px;">
            + Agregar Categoría
        </button>
    `;

    // 2. Traemos las categorías actuales desde nuestro cerebro de datos (storage)
    const categories = getCategories();

    // 3. Diseñamos la tabla o el mensaje de vacío
    if (categories.length === 0) {
        viewBody.innerHTML = `
            <p style="text-align: center; color: #888; margin-top: 40px; font-style: italic;">
                No hay categorías registradas actualmente. Presiona el botón de arriba para crear una.
            </p>
        `;
    } else {
        // Generamos las filas de la tabla dinámicamente con un .map()
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

    // 4. Inyectamos nuestro WEB COMPONENT de modal al final del cuerpo de la vista
    // Nota cómo metemos el formulario DENTRO de las etiquetas de nuestro custom component
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

    // 5. ESCUCHA DE EVENTOS DEL MÓDULO
    const webModal = document.getElementById('cat-web-modal');
    const btnOpenModal = document.getElementById('btn-open-category-modal');
    const formCreateCat = document.getElementById('form-create-category');

    // Evento para Abrir el modal usando la API de nuestro Web Component
    btnOpenModal.addEventListener('click', () => {
        webModal.setAttribute('open', 'true');
    });

    // Evento para procesar el envío del formulario
    formCreateCat.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const desc = document.getElementById('cat-desc').value;

        // Guardamos en storage
        const response = saveCategory(name, desc);

        if (response.success) {
            // Cerramos el modal cambiando el atributo del componente
            webModal.setAttribute('open', 'false');
            // Emitimos mensaje de confirmación (Exigido en consideraciones adicionales)
            alert(response.message); 
            // Recargamos el módulo para ver la nueva categoría reflejada en la tabla de inmediato
            renderCategoriesModule();
        }
    });

    // Evento para Eliminar categoría utilizando delegación de eventos
    const deleteButtons = document.querySelectorAll('.btn-delete-cat');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
                const response = deleteCategory(id);
                if (response.success) {
                    alert(response.message);
                    renderCategoriesModule(); // Refrescamos la lista
                }
            }
        });
    });
}