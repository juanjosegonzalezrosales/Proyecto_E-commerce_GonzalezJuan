// js/app.js
// Importaciones explícitas con extensiones .js completas
import './components/CustomModal.js'; // <-- Cargamos el Web Component globalmente
import { renderLogin, renderDashboard } from './views/adminView.js';
import { isAdminLoggedIn } from './storage.js';

const appContainer = document.getElementById('app-container');

// Verificamos si el administrador ya está dentro del sistema
if (isAdminLoggedIn()) {
    renderDashboard(appContainer);
} else {
    // Si no ha iniciado sesión, le mostramos la pantalla de login
    renderLogin(appContainer);
}