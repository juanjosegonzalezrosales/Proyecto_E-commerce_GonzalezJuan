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