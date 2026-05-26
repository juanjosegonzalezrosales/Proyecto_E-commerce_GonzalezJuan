// js/views/adminView.js
// Importamos de forma explícita usando la extensión .js y saliendo con '../'
import { loginAdmin } from '../storage.js';

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

        // Ejecutamos la lógica de validación
        const resultado = loginAdmin(email, pass);

        alertDiv.classList.add('alert-visible');
        alertDiv.textContent = resultado.message;
        alertDiv.classList.remove('alert-success', 'alert-error');

        if (resultado.success) {
            alertDiv.classList.add('alert-success');
            setTimeout(() => {
                alert('¡Felicidades! Aquí saltaremos al Dashboard en el siguiente paso.');
            }, 1500);
        } else {
            alertDiv.classList.add('alert-error');
        }
    });

    
}