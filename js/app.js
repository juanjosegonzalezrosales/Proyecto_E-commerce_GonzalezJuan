// js/app.js
import './components/CustomModal.js';
import { renderStore } from './views/storeView.js'; // 🌟 Importación corregida a storeView.js
import { renderDashboard } from './views/adminView.js';
import { isAdminLoggedIn } from './storage.js';

const appContainer = document.getElementById('app-container');

if (isAdminLoggedIn()) {
    renderDashboard(appContainer);
} else {
    renderStore(appContainer); // Carga la tienda pública inicialmente
}