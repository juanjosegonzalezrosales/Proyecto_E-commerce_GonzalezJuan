// js/app.js
// Importaciones explícitas con extensiones .js completas
import { renderLogin } from './views/adminView.js';
import { isAdminLoggedIn } from './storage.js';

const appContainer = document.getElementById('app-container');

// Verificamos si el administrador ya está dentro del sistema
if (isAdminLoggedIn()) {
    appContainer.innerHTML = '<h1 style="text-align:center; margin-top:100px;">Ya estás logueado. Pronto diseñaremos este Dashboard.</h1>';
} else {
    // Si no ha iniciado sesión, le mostramos la pantalla de login
    renderLogin(appContainer);
}