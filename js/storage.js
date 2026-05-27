// js/storage.js

// 1. Base de datos inicial (Productos con rutas reales)
const INITIAL_PRODUCTS = [
    {
        id: "prod_1",
        name: "Bokken de Aikido",
        category: "aikido",
        price: 850000,
        stock: 12,
        image: "img/bokkenAikido.jpg",
        description: "Bokken de madera de roble blanco seleccionado, ideal para la práctica intensiva de Aikido y Kata."
    },
    {
        id: "prod_2",
        name: "Gi tradicional",
        category: "karate",
        price: 200000,
        stock: 8,
        image: "img/kumiteKarate.jpg",
        description: "Uniforme tradicional de algodón de alta resistencia, corte cómodo ideal para principiantes y avanzados."
    },
    {
        id: "prod_3",
        name: "casco para Muai Thai",
        category: "muay thai",
        price: 150000,
        stock: 5,
        image: "img/cascoMuaiThai.jpg",
        description: "casco especial para campeonatos"
    },
    {
        id: "prod_4",
        name: "cinturon",
        category: "karate",
        price: 100000,
        stock: 15,
        image: "img/cinturon.jpg",
        description: "cinturon negro de karate."
    },
    {
        id: "prod_5",
        name: "hakama",
        category: "aikido",
        price: 200000,
        stock: 15,
        image: "img/hakamaAikido.jpg",
        description: "pantalon tradicional para practicar aikido."
    },
    {
        id: "prod_6",
        name: "peto",
        category: "muay thai",
        price: 100000,
        stock: 15,
        image: "img/petoMuaTay.jpg",
        description: "peto especial para competencias"
    },
    {
        id: "prod_7",
        name: "protector de puños",
        category: "muay thai",
        price: 100000,
        stock: 15,
        image: "img/protector de puños.png",
        description: "protector de puños especial para competencias"
    },
    {
        id: "prod_8",
        name: "protector de canillas",
        category: "muay thai",
        price: 100000,
        stock: 15,
        image: "img/protectorCanillapieMuaThai.jpg",
        description: "protector de canillas y pies especial para competencias"
    },
    {
        id: "prod_9",
        name: "protector de canillas",
        category: "karate",
        price: 100000,
        stock: 15,
        image: "img/Tokaido Espinillera .jpg",
        description: "protector de canillas especial para competencias"
    }

];

const INITIAL_CATEGORIES = [
    { id: "cat_1", name: "karate", description: "Implementos de madera tradicionales para la práctica" },
    { id: "cat_2", name: "aikido", description: "Vestimenta e indumentaria tradicional de Keiko" },
    { id: "cat_3", name: "muay thai", description: "Vestimenta e indumentaria tradicional de Keiko" }
];

// Inicializar LocalStorage si está vacío
if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
}
if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(INITIAL_CATEGORIES));
}
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}
if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
}

// 2. Funciones de Productos
export function getProducts() {
    return JSON.stringify(localStorage.getItem('products')) ? JSON.parse(localStorage.getItem('products')) : [];
}

export function saveProduct(productData) {
    const products = getProducts();
    const newProduct = {
        id: 'prod_' + Date.now(),
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price) || 0,
        stock: parseInt(productData.stock) || 0,
        image: productData.image || 'img/logo.png',
        description: productData.description
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    return { success: true, message: 'Producto guardado exitosamente.' };
}

export function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    return { success: true, message: 'Producto eliminado del sistema.' };
}

// 3. Funciones de Categorías
export function getCategories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

export function saveCategory(name, description) {
    const categories = getCategories();
    const newCat = { id: 'cat_' + Date.now(), name, description };
    categories.push(newCat);
    localStorage.setItem('categories', JSON.stringify(categories));
    return { success: true, message: 'Categoría añadida.' };
}

export function deleteCategory(id) {
    let categories = getCategories();
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(categories));
    return { success: true, message: 'Categoría eliminada.' };
}

// 4. Funciones del Carrito
export function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

export function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export function addToCart(productId) {
    const products = getProducts();
    const cart = getCart();
    const product = products.find(p => p.id === productId);

    if (!product || product.stock <= 0) {
        return { success: false, message: 'No hay stock disponible.' };
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity >= product.stock) {
            return { success: false, message: 'Has alcanzado el límite de stock disponible.' };
        }
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, message: `"${product.name}" agregado a la bolsa.` };
}

export function updateCartQuantity(productId, newQty) {
    let cart = getCart();
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (newQty <= 0) {
        return removeFromCart(productId);
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem && product) {
        if (newQty > product.stock) {
            return { success: false, message: `Solo quedan ${product.stock} unidades en almacén.` };
        }
        cartItem.quantity = newQty;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true };
}

export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, message: 'Artículo removido.' };
}

export function checkoutCart(customerName) {
    const cart = getCart();
    let products = getProducts();

    if (cart.length === 0) return { success: false, message: 'El carrito está vacío.' };

    // Verificar e inflar decremento de stock
    for (const item of cart) {
        const prod = products.find(p => p.id === item.id);
        if (!prod || prod.stock < item.quantity) {
            return { success: false, message: `Stock insuficiente para el artículo: ${item.name}` };
        }
    }

    // Decrementar
    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod) prod.stock -= item.quantity;
    });

    // Registrar Pedido
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const summary = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');

    orders.push({
        id: 'ord_' + Date.now(),
        date: new Date().toLocaleDateString(),
        customerName,
        productsSummary: summary,
        total
    });

    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cart', JSON.stringify([])); // Limpiar bolsa

    return { success: true, message: `¡Gracias por tu compra, ${customerName}! Tu pedido ha sido procesado.` };
}

// 5. Autenticación Administrador
export function loginAdmin(email, password) {
    if (email === 'admin@mail.com' && password === '123456') {
        localStorage.setItem('admin_session', 'active');
        return { success: true, message: 'Acceso concedido. Bienvenido.' };
    }
    return { success: false, message: 'Credenciales inválidas.' };
}

export function isAdminLoggedIn() {
    return localStorage.getItem('admin_session') === 'active';
}

export function getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
} 
// AGREGAR ESTAS DOS FUNCIONES EN TU js/storage.js

export function updateCategory(id, name, description) {
    let categories = getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories[index].name = name;
        categories[index].description = description;
        localStorage.setItem('categories', JSON.stringify(categories));
        return { success: true, message: "Categoría actualizada correctamente." };
    }
    return { success: false, message: "Categoría no encontrada." };
}

export function updateProduct(id, updatedData) {
    let products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: updatedData.name,
            category: updatedData.category,
            price: parseFloat(updatedData.price) || 0,
            stock: parseInt(updatedData.stock) || 0,
            image: updatedData.image,
            description: updatedData.description
        };
        localStorage.setItem('products', JSON.stringify(products));
        return { success: true, message: "Producto actualizado correctamente." };
    }
    return { success: false, message: "Producto no encontrado." };
}