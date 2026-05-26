// js/components/CustomModal.js

class CustomModal extends HTMLElement {
    constructor() {
        super();
        // Activamos el Shadow DOM para aislar los estilos del modal
        this.attachShadow({ mode: 'open' });
    }

    // Este método se ejecuta cuando el componente se inserta en el DOM
    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    // Escuchamos si cambian los atributos (por ejemplo, si abrimos o cerramos el modal)
    static get observedAttributes() {
        return ['open', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this.shadowRoot) {
            const modalOverlay = this.shadowRoot.querySelector('.modal-overlay');
            if (newValue === 'true') {
                modalOverlay.classList.add('active');
            } else {
                modalOverlay.classList.remove('active');
            }
        }
        if (name === 'title' && this.shadowRoot) {
            const modalTitle = this.shadowRoot.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = newValue;
        }
    }

    // js/components/CustomModal.js (Reemplazar la función render)

    render() {
        const title = this.getAttribute('title') || 'Ventana';
        
        this.shadowRoot.innerHTML = `
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(43, 38, 37, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 9999;
                }
                
                .modal-overlay.active {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .modal-container {
                    background-color: #FFFFFF;
                    width: 90%;
                    max-width: 500px;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    transform: translateY(-20px);
                    transition: transform 0.3s ease;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    
                    /* 🌟 SOLUCIÓN AL CORTE DE PANTALLA: Control de alto máximo */
                    max-height: 85vh; /* El modal nunca ocupará más del 85% de la altura de la pantalla */
                    display: flex;
                    flex-direction: column; /* Alinea header y contenido verticalmente */
                }
                
                .modal-overlay.active .modal-container {
                    transform: translateY(0);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #E5E1DA;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                    flex-shrink: 0; /* Evita que el título se aplaste con el scroll */
                }
                
                .modal-title {
                    font-size: 18px;
                    font-family: 'Playfair Display', serif;
                    color: #2B2625;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                
                .btn-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #888;
                    transition: color 0.2s;
                }
                
                .btn-close:hover {
                    color: #D32F2F;
                }

                /* 🌟 EL CONTENEDOR MÁGICO CON SCROLL INTERNO */
                .modal-content {
                    overflow-y: auto; /* Activa el scroll vertical dinámico si el contenido se desborda */
                    padding-right: 5px; /* Pequeño espacio para que la barra de scroll no tape el texto */
                }

                /* Estilo premium personalizado para la barra de scroll dentro del modal */
                .modal-content::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-content::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .modal-content::-webkit-scrollbar-thumb {
                    background: var(--color-acento, #D4AF37);
                    border-radius: 10px;
                }
            </style>
            
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-content">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
    }
    setupEvents() {
        // Al hacer clic en la equis (&times;), cerramos el modal
        const closeBtn = this.shadowRoot.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            this.setAttribute('open', 'false');
        });

        // Al hacer clic fuera de la caja blanca (en la sombra), también se cierra
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.setAttribute('open', 'false');
            }
        });
    }
}

// Registramos nuestro nuevo tag personalizado ante el navegador
customElements.define('custom-modal', CustomModal);