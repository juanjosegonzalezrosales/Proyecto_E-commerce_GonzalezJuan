// js/storage.js

const KEYS = {
    CATEGORIES: 'ecommerce_categories',
    PRODUCTS: 'ecommerce_products',
    ORDERS: 'ecommerce_orders'
};

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- GESTIÓN DE CATEGORÍAS ---
export function getCategories() {
    return getFromStorage(KEYS.CATEGORIES);
}

export function saveCategory(categoryName, categoryDescription) {
    const categories = getCategories();
    const newCategory = {
        id: Date.now().toString(),
        name: categoryName,
        description: categoryDescription
    };
    categories.push(newCategory);
    saveToStorage(KEYS.CATEGORIES, categories);
    return { success: true, message: '¡Categoría agregada con éxito!' };
}

export function deleteCategory(id) {
    let categories = getCategories();
    categories = categories.filter(cat => cat.id !== id);
    saveToStorage(KEYS.CATEGORIES, categories);
    return { success: true, message: 'Categoría eliminada correctamente.' };
}

// --- GESTIÓN DE PRODUCTOS ---
export function getProducts() {
    return getFromStorage(KEYS.PRODUCTS);
}

// --- GESTIÓN DE PRODUCTOS (Actualizado para URLs de imagen) ---
export function saveProduct(productData) {
    const products = getProducts();
    
    const newProduct = {
        id: Date.now().toString(),
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.category,
        // 🌟 MEJORA: Si el usuario ingresó algo, guardamos esa URL directa. Si no, usa la de defecto.
        image: productData.image ? productData.image.trim() : 'img/login.jpg'
    };

    products.push(newProduct);
    saveToStorage(KEYS.PRODUCTS, products);
    return { success: true, message: '¡Producto guardado exitosamente!' };
}

export function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(prod => prod.id !== id);
    saveToStorage(KEYS.PRODUCTS, products);
    return { success: true, message: 'Producto eliminado correctamente.' };
}

export function getOrders() {
    return getFromStorage(KEYS.ORDERS);
}

// --- AUTENTICACIÓN (LOGIN) ---
export function loginAdmin(email, password) {
    const ADMIN_EMAIL = 'admin@mail.com';
    const ADMIN_PASS = '123456';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        localStorage.setItem('admin_session', 'active');
        return { success: true, message: '¡Bienvenido al Panel de Administración!' };
    } else {
        return { success: false, message: 'Credenciales incorrectas. Inténtalo de nuevo.' };
    }
}

export function isAdminLoggedIn() {
    return localStorage.getItem('admin_session') === 'active';
}

export function logoutAdmin() {
    localStorage.removeItem('admin_session');
}

// --- GESTIÓN DEL CARRITO DE COMPRAS ---

// Claves de almacenamiento adicionales
KEYS.CART = 'boutique_cart';

// 1. Obtener los productos actuales del carrito
export function getCart() {
    return getFromStorage(KEYS.CART);
}

// 2. Agregar o actualizar un producto en el carrito controlando el stock
export function addToCart(productId) {
    const products = getFromStorage(KEYS.PRODUCTS);
    const cart = getCart();
    
    // Buscamos el producto en el inventario real
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        return { success: false, message: 'Lo sentimos, este producto no tiene stock disponible.' };
    }

    // Buscamos si ya existe dentro del carrito actual
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        // Si ya existe, validamos que no supere el stock total disponible
        if (cartItem.quantity >= product.stock) {
            return { success: false, message: `Límite alcanzado. Solo quedan ${product.stock} unidades disponibles.` };
        }
        cartItem.quantity += 1;
    } else {
        // Si es nuevo, lo registramos con cantidad inicial 1
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1,
            maxStock: product.stock // Guardamos el tope para validar en la interfaz del carrito
        });
    }

    saveToStorage(KEYS.CART, cart);
    return { success: true, message: '¡Prenda añadida al carrito con éxito!' };
}

// 3. Obtener el número total de prendas en el carrito (para el contador de la Navbar)
export function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// 4. Actualizar la cantidad de un artículo directamente en el carrito
export function updateCartQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        // Validamos que no sobrepase el stock máximo real
        if (newQuantity > item.maxStock) {
            return { success: false, message: `Límite de inventario alcanzado (${item.maxStock} uds).` };
        }
        
        item.quantity = newQuantity;
        
        // Si la cantidad llega a cero, lo removemos automáticamente
        if (item.quantity <= 0) {
            return removeFromCart(productId);
        }
    }

    saveToStorage(KEYS.CART, cart);
    return { success: true };
}

// 5. Eliminar por completo una prenda del carrito
export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveToStorage(KEYS.CART, cart);
    return { success: true, message: 'Artículo removido del carrito.' };
}

// 6. Vaciar todo el carrito (Útil para cuando se finalice la compra)
export function clearCart() {
    saveToStorage(KEYS.CART, []);
}