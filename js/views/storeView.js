// js/views/storeView.js
import { 
    getProducts, getCategories, getCart, addToCart, getCartCount, 
    updateCartQuantity, removeFromCart, checkoutCart 
} from '../storage.js';

export function renderStore(container) {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--color-fondo)';
    document.body.style.opacity = '1';

    const products = getProducts();
    const categories = getCategories();

    container.innerHTML = `
        <style>
            .store-nav {
                background-color: var(--color-texto); color: var(--color-fondo); padding: 15px 20px; 
                display: flex; justify-content: space-between; align-items: center; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100;
                flex-wrap: wrap; gap: 15px;
            }
            .hero-title { font-size: 32px; }
            .products-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;
            }
            .search-bar-container {
                max-width: 500px; margin: 20px auto 0 auto; width: 100%; box-sizing: border-box;
            }
            .search-input {
                width: 100%; padding: 12px 20px; border: 1px solid #E5E1DA; border-radius: 30px;
                font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); outline: none; box-sizing: border-box;
                background-color: #FFF; color: #333;
            }
            @media (min-width: 768px) {
                .store-nav { padding: 20px 40px; }
                .hero-title { font-size: 42px; }
                .products-grid { gap: 30px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
            }
        </style>

        <div class="store-body-bg">
            <nav class="store-nav">
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" id="nav-brand-logo">
                    <img src="img/logo.png" alt="Logo" style="height: 30px; width: auto; object-fit: contain;">
                    <h1 style="font-family: 'Playfair Display', serif; font-size: 20px; letter-spacing: 2px; font-weight: 300; margin: 0;">TIENDA MARCIAL</h1>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <button id="btn-nav-cart" style="background: transparent; border: 1px solid var(--color-acento); color: var(--color-fondo); padding: 8px 16px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        🛍️ Mi Bolsa (${getCartCount()})
                    </button>
                    <button id="btn-go-to-login" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); padding: 8px 16px; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; border-radius: 4px;">
                        🔒 Admin
                    </button>
                </div>
            </nav>

            <header class="store-hero-banner" style="background-color: #6B685B; color: var(--color-blanco); text-align: center; padding: 40px 15px 45px 15px;">
                <h2 class="hero-title" style="font-family: 'Playfair Display', serif; font-weight: 300; letter-spacing: 2px; margin-bottom: 10px; color: var(--color-acento);">Nuestro Catálogo</h2>
                <p style="font-size: 14px; font-style: italic; opacity: 0.9; margin-bottom: 20px;">Explora el equipamiento e indumentaria tradicional de Keiko</p>
                
                <div class="search-bar-container">
                    <input type="text" id="store-search-input" class="search-input" placeholder="🔍 Buscar productos por nombre...">
                </div>

                <div id="category-filters-container" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; max-width: 800px; margin: 25px auto 0 auto;"></div>
            </header>

            <main class="store-container" style="max-width: 1200px; margin: 30px auto; padding: 10px 15px 40px 15px;">
                <div id="products-grid" class="products-grid"></div>
            </main>
        </div>
    `;

    document.getElementById('nav-brand-logo').addEventListener('click', () => renderStore(container));
    document.getElementById('btn-nav-cart').addEventListener('click', () => renderCartPage(container));
    document.getElementById('btn-go-to-login').addEventListener('click', () => {
        document.body.style.backgroundImage = "url('../img/login.jpg')"; 
        import('./adminView.js').then(module => module.renderLogin(container));
    });

    const filtersContainer = document.getElementById('category-filters-container');
    const productsGrid = document.getElementById('products-grid');
    const searchInput = document.getElementById('store-search-input');

    let activeCategory = 'todos';

    function displayProducts() {
        let filtered = products;
        if (activeCategory !== 'todos') {
            filtered = products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
        }

        const keyword = searchInput.value.toLowerCase().trim();
        if (keyword !== '') {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
        }

        if (filtered.length === 0) {
            productsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#888; padding:40px; font-style:italic;">No se encontraron productos que coincidan.</div>`;
            return;
        }

        productsGrid.innerHTML = filtered.map(prod => {
            const stockNum = parseInt(prod.stock) || 0;
            return `
                <div class="store-product-card" data-product-id="${prod.id}" style="cursor: pointer; background: #FFF; display: flex; flex-direction: column; height: 100%; border: 1px solid #E5E1DA; border-radius: 8px; overflow: hidden;">
                    <div style="height: 280px; overflow: hidden; position: relative;">
                        <img src="${prod.image}" alt="${prod.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:3px 8px; border-radius:3px;">Cód: ${prod.code || 'S/C'}</span>
                    </div>
                    <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <span style="font-size: 10px; text-transform: uppercase; color: #888; display: block; margin-bottom: 6px;">${prod.category}</span>
                            <h3 style="font-size: 15px; font-weight: 600; color: var(--color-texto); margin: 0 0 8px 0;">${prod.name}</h3>
                            <p style="color: #666; font-size: 13px; margin: 0 0 15px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${prod.description}</p>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 17px; font-weight: bold; color: var(--color-texto);">$${parseFloat(prod.price).toFixed(2)}</span>
                                <span style="font-size: 11px; color: ${stockNum > 0 ? '#388E3C' : '#D32F2F'}; font-weight: bold;">
                                    ${stockNum > 0 ? `Stock: ${stockNum}` : 'Agotado'}
                                </span>
                            </div>
                            <button class="btn-premium" style="width: 100%; font-size: 11px; padding: 10px; border-radius: 4px; text-transform: uppercase;">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        productsGrid.querySelectorAll('.store-product-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-product-id');
                renderProductDetail(container, id);
            });
        });
    }

    searchInput.addEventListener('input', displayProducts);

    const allButton = document.createElement('button');
    allButton.textContent = 'Ver Todos';
    allButton.style.padding = '8px 16px';
    allButton.style.border = '1px solid var(--color-acento)';
    allButton.style.background = 'var(--color-acento)';
    allButton.style.color = 'var(--color-texto)';
    allButton.style.cursor = 'pointer';
    allButton.style.borderRadius = '20px';
    allButton.style.fontSize = '12px';
    allButton.addEventListener('click', () => {
        activeCategory = 'todos';
        displayProducts();
    });
    filtersContainer.appendChild(allButton);

    categories.forEach(cat => {
        const catButton = document.createElement('button');
        catButton.textContent = cat.name;
        catButton.style.padding = '8px 16px';
        catButton.style.border = '1px solid rgba(255,255,255,0.4)';
        catButton.style.background = 'transparent';
        catButton.style.color = '#FFF';
        catButton.style.cursor = 'pointer';
        catButton.style.borderRadius = '20px';
        catButton.style.fontSize = '12px';
        catButton.addEventListener('click', () => {
            activeCategory = cat.name;
            displayProducts();
        });
        filtersContainer.appendChild(catButton);
    });

    displayProducts();
}

export function renderProductDetail(container, productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `<div style="padding:40px; text-align:center;"><h3>Producto no encontrado</h3><button id="btn-err-back" class="btn-premium">Volver al catálogo</button></div>`;
        document.getElementById('btn-err-back').addEventListener('click', () => renderStore(container));
        return;
    }

    const isAvailable = (parseInt(product.stock) || 0) > 0;

    container.innerHTML = `
        <style>
            .detail-nav { background-color: var(--color-texto); color: var(--color-fondo); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 10px; }
            .detail-flex-container { display: flex; flex-direction: column; gap: 20px; background: #FFFFFF; border: 1px solid #E5E1DA; border-radius: 8px; padding: 20px; }
            .detail-image-box { flex: 1 1 100%; text-align: center; }
            .detail-info-box { flex: 1 1 100%; display: flex; flex-direction: column; }
            @media (min-width: 768px) {
                .detail-nav { padding: 15px 40px; }
                .detail-flex-container { flex-direction: row; gap: 40px; padding: 30px; }
                .detail-image-box { flex: 1 1 450px; }
                .detail-info-box { flex: 1 1 450px; }
            }
        </style>

        <div style="background-color: var(--color-fondo); min-height: 100vh; padding-bottom: 60px;">
            <nav class="detail-nav">
                <button id="btn-back-nav" style="background: transparent; border: none; color: var(--color-acento); cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                    📂 <span>Volver al Catálogo</span>
                </button>
                <div style="font-family: 'Playfair Display', serif; font-size: 18px; letter-spacing: 1px; cursor:pointer;" id="nav-detail-logo">TIENDA MARCIAL</div>
                <button id="btn-detail-cart" style="background: transparent; border: none; color: var(--color-acento); cursor: pointer; font-weight: bold; font-size: 13px;">
                    🛍️ Mi Bolsa (${getCartCount()})
                </button>
            </nav>

            <main style="max-width: 1100px; margin: 20px auto; padding: 0 15px;">
                <div style="font-size: 11px; color: #777; margin-bottom: 15px; text-transform: uppercase;">
                    Tienda / Catálogo / ${product.category} / <span style="color: var(--color-texto); font-weight: 600;">${product.name}</span>
                </div>

                <div class="detail-flex-container">
                    <div class="detail-image-box">
                        <div style="border: 1px solid #F0EDE6; border-radius: 6px; overflow: hidden; display: inline-block; width: 100%; max-width: 450px;">
                            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; max-height: 500px; object-fit: cover;">
                        </div>
                    </div>

                    <div class="detail-info-box">
                        <span style="font-size: 11px; color:#888;">CÓDIGO: ${product.code || 'S/C'}</span>
                        <span style="font-size: 12px; color: var(--color-acento); text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">${product.category}</span>
                        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; color: var(--color-texto); margin: 0 0 15px 0;">${product.name}</h2>
                        <hr style="border: 0; border-top: 1px solid #E5E1DA; margin: 10px 0 20px 0;">

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 32px; font-weight: 300; color: var(--color-texto);">$${parseFloat(product.price).toFixed(2)}</span>
                        </div>

                        <div style="margin-bottom: 25px; display: flex; align-items: center; gap: 8px;">
                            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${isAvailable ? '#388E3C' : '#D32F2F'};"></span>
                            <span style="font-size: 14px; font-weight: 600; color: ${isAvailable ? '#388E3C' : '#D32F2F'};">
                                ${isAvailable ? `Disponible (Stock: ${product.stock} uds)` : 'Agotado'}
                            </span>
                        </div>

                        <div style="background-color: #FAF9F6; border: 1px solid #E5E1DA; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
                            <button id="btn-detail-add-cart" class="btn-premium" ${!isAvailable ? 'disabled style="background:#ccc; border-color:#ccc; cursor:not-allowed;"' : ''} style="width: 100%; padding: 12px; font-size: 13px; border-radius: 4px; text-transform: uppercase; font-weight: 600;">
                                ${isAvailable ? '🛒 Agregar a la Bolsa' : 'Agotado'}
                            </button>
                        </div>

                        <h3 style="font-size: 13px; font-weight: bold; color: var(--color-texto); margin-bottom: 10px; text-transform: uppercase;">Acerca de este artículo:</h3>
                        <p style="font-size:13px; color:#555; line-height:1.5; margin:0 0 15px 0;">${product.description}</p>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('btn-back-nav').addEventListener('click', () => renderStore(container));
    document.getElementById('nav-detail-logo').addEventListener('click', () => renderStore(container));
    document.getElementById('btn-detail-cart').addEventListener('click', () => renderCartPage(container));

    const btnAddCart = document.getElementById('btn-detail-add-cart');
    if (btnAddCart && isAvailable) {
        btnAddCart.addEventListener('click', () => {
            addToCart(product.id);
            alert("¡Producto añadido con éxito a tu carrito!");
            renderProductDetail(container, productId);
        });
    }
}

export function renderCartPage(container) {
    const cart = getCart();
    const totalOrder = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 0)), 0);

    container.innerHTML = `
        <style>
            .cart-nav { background-color: var(--color-texto); color: var(--color-fondo); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 10px; }
            .cart-flex-wrapper { display: flex; flex-direction: column; gap: 20px; align-items: stretch; }
            .cart-main-box { flex: 1 1 100%; }
            .cart-side-box { flex: 1 1 100%; }
            .cart-item-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F0EDE6; padding: 15px 0; gap: 15px; flex-wrap: wrap; }
            .checkout-form-container { background: #FAF9F6; border: 1px dashed var(--color-acento); border-radius: 8px; padding: 20px; margin-top: 20px; display: none; animation: fadeIn 0.4s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @media (min-width: 768px) {
                .cart-nav { padding: 15px 40px; }
                .cart-flex-wrapper { flex-direction: row; align-items: flex-start; }
                .cart-main-box { flex: 2 1 600px; }
                .cart-side-box { flex: 1 1 340px; }
                .cart-item-row { flex-wrap: nowrap; gap: 20px; }
            }
        </style>

        <div style="background-color: var(--color-fondo); min-height: 100vh; padding-bottom: 60px;">
            <nav class="cart-nav">
                <button id="btn-cart-back-to-store" style="background: transparent; border: none; color: var(--color-acento); cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                    ← Seguir Comprando
                </button>
                <div style="font-family: 'Playfair Display', serif; font-size: 18px; letter-spacing: 1px; cursor:pointer;" id="nav-cart-logo">TIENDA MARCIAL</div>
                <div style="font-size: 13px; font-weight: bold; color: var(--color-acento);">Artículos: (${getCartCount()})</div>
            </nav>

            <main style="max-width: 1100px; margin: 20px auto; padding: 0 15px;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: var(--color-texto); margin-bottom: 20px; font-weight: 400;">Carrito de Compras</h2>
                
                <div class="cart-flex-wrapper">
                    <div class="cart-main-box">
                        <div style="background: #FFFFFF; border: 1px solid #E5E1DA; border-radius: 8px; padding: 20px;">
                            <div id="cart-items-list"></div>
                        </div>
                        
                        <div id="checkout-form-section" class="checkout-form-container">
                            <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; margin: 0 0 15px 0; color: var(--color-texto);">Información de Despacho y Facturación</h3>
                            <form id="form-complete-order-details">
                                <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:12px;">
                                    <div style="flex: 1 1 200px;">
                                        <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Nombre Completo *</label>
                                        <input type="text" id="chk-fullname" required placeholder="Ej: Juan Pérez" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                                    </div>
                                    <div style="flex: 1 1 200px;">
                                        <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Nº de Identificación (DNI/Cédula) *</label>
                                        <input type="text" id="chk-doc-id" required placeholder="Ej: ID-9823423" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                                    </div>
                                </div>
                                <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:12px;">
                                    <div style="flex: 1 1 200px;">
                                        <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Teléfono de Contacto *</label>
                                        <input type="tel" id="chk-phone" required placeholder="Ej: +52 55 1234 5678" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                                    </div>
                                    <div style="flex: 1 1 200px;">
                                        <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Correo Electrónico *</label>
                                        <input type="email" id="chk-email" required placeholder="juan@mail.com" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                                    </div>
                                </div>
                                <div style="margin-bottom:12px;">
                                    <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Dirección de Entrega Completa *</label>
                                    <input type="text" id="chk-address" required placeholder="Calle, Número, Colonia, Ciudad" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                                </div>
                                
                                <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:12px;">
                                    <div style="flex: 1 1 200px;">
                                        <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Método de Pago Preferido *</label>
                                        <select id="chk-payment" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; font-family:inherit;">
                                            <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito Premium</option>
                                            <option value="Transferencia Bancaria (SPEI/PSE)">Transferencia Bancaria Directa</option>
                                            <option value="PayPal">PayPal Check</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="margin-bottom:12px;">
                                    <label style="font-size:11px; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Notas Especiales para el Repartidor</label>
                                    <textarea id="chk-notes" placeholder="Ej: Portería, dejar con el vecino, llamar al llegar..." style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; font-family:inherit; resize:none;" rows="2"></textarea>
                                </div>

                                <button type="submit" class="btn-premium" style="width:100%; padding:14px; font-weight:bold; text-transform:uppercase; font-size:13px; margin-top:10px;">
                                    Confirmar Orden de Compra ($${totalOrder.toFixed(2)})
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="cart-side-box" style="background: #FFFFFF; border: 1px solid #E5E1DA; border-radius: 8px; padding: 20px;">
                        <h3 style="font-size: 14px; text-transform: uppercase; margin: 0 0 15px 0;">Resumen</h3>
                        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #666; margin-bottom: 10px;">
                            <span>Subtotal:</span>
                            <span>$${totalOrder.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #666; margin-bottom: 15px;">
                            <span>Envío:</span>
                            <span style="color: #388E3C; font-weight: bold;">Gratis</span>
                        </div>
                        <hr style="border: 0; border-top: 1px solid #E5E1DA; margin: 15px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <span style="font-size: 15px; font-weight: bold;">Total:</span>
                            <span style="font-size: 22px; font-weight: bold;">$${totalOrder.toFixed(2)}</span>
                        </div>
                        <button id="btn-cart-page-checkout" class="btn-premium" style="width: 100%; padding: 14px; font-size: 13px; font-weight: bold; text-transform: uppercase;">
                            Proceder al Pago
                        </button>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('btn-cart-back-to-store').addEventListener('click', () => renderStore(container));
    document.getElementById('nav-cart-logo').addEventListener('click', () => renderStore(container));

    const itemsContainer = document.getElementById('cart-items-list');

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: #888; font-style: italic;">Tu bolsa de compras está vacía.</div>`;
        const btnPay = document.getElementById('btn-cart-page-checkout');
        if(btnPay) { btnPay.disabled = true; btnPay.style.background = '#ccc'; }
        return;
    }

    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 2 1 150px;">
                <h4 style="font-size: 14px; margin: 0 0 4px 0;">${item.name}</h4>
                <span style="font-size: 10px; background: #E5E1DA; padding: 3px 8px; border-radius: 10px;">${item.category}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn-page-minus" data-id="${item.id}" data-qty="${item.quantity}" style="background:#E5E1DA; border:none; width:28px; height:28px; cursor:pointer;">-</button>
                <span style="font-weight: bold;">${item.quantity}</span>
                <button class="btn-page-plus" data-id="${item.id}" data-qty="${item.quantity}" style="background:#E5E1DA; border:none; width:28px; height:28px; cursor:pointer;">+</button>
            </div>
            <div style="text-align: right; min-width: 90px;">
                <div style="font-size: 15px; font-weight: bold;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
            </div>
            <button class="btn-page-remove" data-id="${item.id}" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 20px;">&times;</button>
        </div>
    `).join('');

    itemsContainer.querySelectorAll('.btn-page-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const qty = parseInt(btn.getAttribute('data-qty'));
            updateCartQuantity(id, qty - 1);
            renderCartPage(container);
        });
    });

    itemsContainer.querySelectorAll('.btn-page-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const qty = parseInt(btn.getAttribute('data-qty'));
            updateCartQuantity(id, qty + 1);
            renderCartPage(container);
        });
    });

    itemsContainer.querySelectorAll('.btn-page-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.getAttribute('data-id'));
            renderCartPage(container);
        });
    });

    const btnCheckout = document.getElementById('btn-cart-page-checkout');
    const checkoutFormSection = document.getElementById('checkout-form-section');

    btnCheckout.addEventListener('click', () => {
        checkoutFormSection.style.display = 'block';
        checkoutFormSection.scrollIntoView({ behavior: 'smooth' });
        btnCheckout.disabled = true;
        btnCheckout.style.opacity = '0.5';
    });

    document.getElementById('form-complete-order-details').addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('chk-fullname').value.trim();
        const docId = document.getElementById('chk-doc-id').value.trim();
        const phone = document.getElementById('chk-phone').value.trim();
        const email = document.getElementById('chk-email').value.trim();
        const address = document.getElementById('chk-address').value.trim();
        const payment = document.getElementById('chk-payment').value;
        const notes = document.getElementById('chk-notes').value.trim() || 'Ninguna';

        // Estructura completa de auditoría para guardar en localStorage y verse en el Dashboard
        const auditInfo = `Nombre: ${fullName} | ID: ${docId} | Tel: ${phone} | Email: ${email} | Dir: ${address} | Pago: ${payment} | Notas: ${notes}`;

        const response = checkoutCart(auditInfo);
        if (response.success) {
            alert(`¡Compra Exitosa!\n\nGracias ${fullName}. Su pedido ha sido registrado con éxito.`);
            renderStore(container);
        }
    });
}