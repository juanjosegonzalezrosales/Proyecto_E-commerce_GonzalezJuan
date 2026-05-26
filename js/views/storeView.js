// js/views/storeView.js
import { 
    getProducts, getCategories, getCart, addToCart, getCartCount, 
    updateCartQuantity, removeFromCart, clearCart 
} from '../storage.js';

export function renderStore(container) {
    // Limpieza dinámica del body para ocultar los karatekas en la tienda
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--color-fondo)';
    document.body.style.opacity = '1';

    const products = getProducts();
    const categories = getCategories();

    // Inyectamos la estructura con la barra de navegación que incluye el carrito
    container.innerHTML = `
        <div class="store-body-bg">
            
            <nav style="background-color: var(--color-texto); color: var(--color-fondo); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="img/logo.png" alt="Logo" style="height: 30px; width: auto; object-fit: contain;">
                    <h1 style="font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 3px; font-weight: 300; margin: 0;">BOUTIQUE PREMIUM</h1>
                </div>
                
                <div style="display: flex; align-items: center; gap: 20px;">
                    <button id="btn-open-cart" style="background: transparent; border: none; color: var(--color-fondo); display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 5px 10px; position: relative; transition: opacity 0.3s;">
                        <span style="font-size: 20px;">🛍️</span>
                        <span id="cart-counter" style="background-color: var(--color-acento); color: var(--color-texto); font-size: 11px; font-weight: bold; border-radius: 50%; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; padding: 2px; position: absolute; top: -5px; right: -5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            ${getCartCount()}
                        </span>
                    </button>

                    <button id="btn-go-to-login" style="background: transparent; border: 1px solid var(--color-acento); color: var(--color-acento); padding: 8px 16px; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; transition: all 0.3s; border-radius: 4px;">
                        🔒 Área Admin
                    </button>
                </div>
            </nav>

            <header class="store-hero-banner" style="background-color: #6B685B; color: var(--color-blanco); text-align: center; padding: 50px 20px; box-shadow: inset 0 -5px 15px rgba(0,0,0,0.05);">
                <h2 style="font-size: 42px; font-family: 'Playfair Display', serif; font-weight: 300; letter-spacing: 2px; margin-bottom: 10px; color: var(--color-acento);">Nuestro Catálogo</h2>
                <p style="font-size: 15px; font-style: italic; opacity: 0.9; letter-spacing: 0.5px; margin-bottom: 30px;">Explora nuestras prendas exclusivas diseñadas para ti</p>
                <div id="category-filters-container" style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; max-width: 800px; margin: 0 auto;"></div>
            </header>

            <main class="store-container" style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
                <div id="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;"></div>
            </main>

        </div>
    `;

    const filtersContainer = document.getElementById('category-filters-container');
    const productsGrid = document.getElementById('products-grid');
    const btnGoToLogin = document.getElementById('btn-go-to-login');
    const btnOpenCart = document.getElementById('btn-open-cart');
    const cartCounter = document.getElementById('cart-counter');

    // Escuchador para abrir el modal de la bolsa de compras
    btnOpenCart.addEventListener('click', () => {
        openCartModal(container);
    });

    // Navegar al Login restaurando el fondo
    btnGoToLogin.addEventListener('click', () => {
        document.body.style.backgroundImage = "url('../img/login.jpg')"; 
        import('./adminView.js').then(module => {
            module.renderLogin(container);
        });
    });

    // FUNCIÓN PARA RENDERIZAR LAS TARJETAS Y ASIGNAR EL EVENTO DE AGREGAR
    function displayProducts(productsList) {
        if (productsList.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px 0; font-style: italic; background: #FFF; border-radius: 8px; border: 1px solid #E5E1DA;">
                    No se encontraron productos disponibles en esta sección.
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = productsList.map(prod => `
            <div class="store-product-card">
                <div class="store-product-card-img-container">
                    <img src="${prod.image}" alt="${prod.name}">
                </div>
                <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; background: #FFF;">
                    <div>
                        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 6px;">${prod.category}</span>
                        <h3 style="font-size: 17px; font-weight: bold; color: var(--color-texto); margin-bottom: 8px; font-family: 'Segoe UI', sans-serif;">${prod.name}</h3>
                        <p style="color: #666; font-size: 13px; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">${prod.description}</p>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 19px; font-weight: bold; color: var(--color-texto);">$${prod.price.toFixed(2)}</span>
                            <span style="font-size: 11px; color: ${prod.stock > 0 ? '#388E3C' : '#D32F2F'}; font-weight: bold;">
                                ${prod.stock > 0 ? `Stock: ${prod.stock}` : 'Agotado'}
                            </span>
                        </div>
                        <button class="btn-add-to-cart btn-premium" data-id="${prod.id}" ${prod.stock === 0 ? 'disabled style="background:#ccc; border-color:#ccc; cursor:not-allowed;"' : ''} style="width: 100%; font-size: 12px; padding: 10px; border-radius: 6px;">
                            ${prod.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // 🌟 ASIGNAR INTERACTIVIDAD A LOS BOTONES "AGREGAR AL CARRITO"
        const addButtons = productsGrid.querySelectorAll('.btn-add-to-cart');
        addButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitamos efectos colaterales de clicks
                const id = btn.getAttribute('data-id');
                
                // Procesamos la inserción lógica en el storage
                const result = addToCart(id);
                
                if (result.success) {
                    // Actualizamos inmediatamente el número dorado de la Navbar en tiempo real
                    cartCounter.textContent = getCartCount();
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            });
        });
    }

    displayProducts(products);

    // GENERAR FILTROS DE CATEGORÍAS
    const allButton = document.createElement('button');
    allButton.textContent = 'Ver Todos';
    allButton.className = 'btn-filter active';
    styleFilterButton(allButton, true);
    
    allButton.addEventListener('click', () => {
        setActiveFilterButton(allButton);
        displayProducts(products);
    });
    filtersContainer.appendChild(allButton);

    categories.forEach(cat => {
        const catButton = document.createElement('button');
        catButton.textContent = cat.name;
        catButton.className = 'btn-filter';
        styleFilterButton(catButton, false);

        catButton.addEventListener('click', () => {
            setActiveFilterButton(catButton);
            const filtered = products.filter(prod => prod.category.toLowerCase() === cat.name.toLowerCase());
            displayProducts(filtered);
        });
        filtersContainer.appendChild(catButton);
    });

    function styleFilterButton(btn, isActive) {
        btn.style.padding = '8px 24px';
        btn.style.border = isActive ? '1px solid var(--color-acento)' : '1px solid rgba(255,255,255,0.4)';
        btn.style.background = isActive ? 'var(--color-acento)' : 'transparent';
        btn.style.color = isActive ? 'var(--color-texto)' : '#FFFFFF';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.style.textTransform = 'uppercase';
        btn.style.letterSpacing = '1px';
        btn.style.transition = 'all 0.3s ease';
        btn.style.borderRadius = '25px';
        btn.style.fontWeight = '500';
    }

    function setActiveFilterButton(activeBtn) {
        const allButtons = filtersContainer.querySelectorAll('.btn-filter');
        allButtons.forEach(btn => styleFilterButton(btn, false));
        styleFilterButton(activeBtn, true);
    }
}

// ==========================================
// RENDERIZADO DEL MODAL DEL CARRITO DE COMPRAS
// ==========================================
export function openCartModal(container) {
    const modalId = 'modal-store-cart';
    let modalElement = document.getElementById(modalId);
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = modalId;
        container.appendChild(modalElement);
    }

    const cart = getCart();
    const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCounter = document.getElementById('cart-counter');

    let cartHTML = '';
    if (cart.length === 0) {
        cartHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #888; font-style: italic;">
                Tu carrito de compras está vacío. ¡Explora el catálogo para agregar prendas!
            </div>
        `;
    } else {
        const cartRows = cart.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5E1DA; padding: 12px 0; gap: 15px;">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #E5E1DA;">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 14px; margin: 0; color: var(--color-texto); font-weight: 600;">${item.name}</h4>
                    <span style="font-size: 12px; color: var(--color-acento); font-weight: bold;">$${item.price.toFixed(2)} c/u</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-cart-minus" data-id="${item.id}" data-qty="${item.quantity}" style="background: #E5E1DA; border: none; width: 24px; height: 24px; cursor: pointer; border-radius: 4px; font-weight: bold;">-</button>
                    <span style="font-size: 14px; font-weight: bold; width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="btn-cart-plus" data-id="${item.id}" data-qty="${item.quantity}" style="background: #E5E1DA; border: none; width: 24px; height: 24px; cursor: pointer; border-radius: 4px; font-weight: bold;">+</button>
                </div>
                <button class="btn-cart-remove" data-id="${item.id}" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 18px; font-weight: bold; padding: 0 5px;">&times;</button>
            </div>
        `).join('');

        cartHTML = `
            <div style="max-height: 50vh; overflow-y: auto; padding-right: 5px;">
                ${cartRows}
            </div>
            <div style="margin-top: 20px; border-top: 2px solid var(--color-texto); padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: 'Playfair Display', serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Total Estimado:</span>
                <span style="font-size: 22px; font-weight: bold; color: var(--color-texto);">$${totalOrder.toFixed(2)}</span>
            </div>
            <button id="btn-checkout-cart" class="btn-premium" style="width: 100%; border-radius: 6px; margin-top: 20px; padding: 12px; font-size: 13px;">
                🛍 *Finalizar Pedido*
            </button>
        `;
    }

    modalElement.innerHTML = `
        <custom-modal id="store-web-modal" title="Bolsa de Compras" open="true">
            <div style="margin-top: 10px;">
                ${cartHTML}
            </div>
        </custom-modal>
    `;

    const webModal = document.getElementById('store-web-modal');

    // Eventos internos del modal sincronizados con la Navbar
    modalElement.querySelectorAll('.btn-cart-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const currentQty = parseInt(btn.getAttribute('data-qty'));
            updateCartQuantity(id, currentQty - 1);
            if (cartCounter) cartCounter.textContent = getCartCount(); // Refresca contador de barra
            openCartModal(container); 
        });
    });

    modalElement.querySelectorAll('.btn-cart-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const currentQty = parseInt(btn.getAttribute('data-qty'));
            const res = updateCartQuantity(id, currentQty + 1);
            if (!res.success) alert(res.message);
            if (cartCounter) cartCounter.textContent = getCartCount(); 
            openCartModal(container); 
        });
    });

    modalElement.querySelectorAll('.btn-cart-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            removeFromCart(id);
            if (cartCounter) cartCounter.textContent = getCartCount(); 
            openCartModal(container); 
        });
    });

    const btnCheckout = document.getElementById('btn-checkout-cart');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            alert('¡Procesando pedido! En el siguiente paso lo vincularemos con el Módulo de Pedidos del Administrador.');
            clearCart();
            if (cartCounter) cartCounter.textContent = 0;
            webModal.setAttribute('open', 'false');
        });
    }
}