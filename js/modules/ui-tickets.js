// ui-tickets.js - Funciones para el manejo de tickets
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Funciones para el manejo de tickets o comandas
Avika.ui.enableTicketMode = function() {
    Avika.ui.state.ticketMode = true;
    Avika.ui.state.ticketItems = [];
    Avika.ui.state.ticketService = 'comedor'; // Servicio predeterminado
    
    // Mostrar modal de ticket
    this.showTicketModal();
};

// Mostrar modal de ticket
Avika.ui.showTicketModal = function() {
    // Crear modal si no existe
    var modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Crear Ticket/Comanda</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="ticket-service-selection">
                        <h3>Tipo de servicio</h3>
                        <div class="service-buttons">
                            <button class="service-btn active" data-service="comedor">Comedor</button>
                            <button class="service-btn" data-service="domicilio">Domicilio</button>
                            <button class="service-btn" data-service="para-llevar">Ordena y Recoge</button>
                        </div>
                    </div>
                    
                    <div class="ticket-items-list">
                        <h3>Platillos en el ticket</h3>
                        <div id="ticket-items-container">
                            <div class="empty-ticket">No hay platillos añadidos</div>
                        </div>
                    </div>
                    
                    <div class="ticket-actions">
                        <button id="add-ticket-item" class="action-btn">Añadir platillo</button>
                        <button id="save-ticket" class="action-btn">Guardar ticket</button>
                        <button id="cancel-ticket" class="action-btn cancel-btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        modal.querySelector('.close-modal').onclick = function() {
            Avika.ui.cancelTicket();
        };
        
        // Botones de servicio
        var serviceButtons = modal.querySelectorAll('.service-btn');
        for (var i = 0; i < serviceButtons.length; i++) {
            serviceButtons[i].onclick = function() {
                var service = this.getAttribute('data-service');
                Avika.ui.selectTicketService(this, service);
            };
        }
        
        // Botón de añadir platillo
        document.getElementById('add-ticket-item').onclick = function() {
            Avika.ui.showTicketItemSelection();
        };
        
        // Botón de guardar ticket
        document.getElementById('save-ticket').onclick = function() {
            Avika.ui.saveTicket();
        };
        
        // Botón de cancelar
        document.getElementById('cancel-ticket').onclick = function() {
            Avika.ui.cancelTicket();
        };
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Actualizar lista de platillos
    this.updateTicketItemsList();
};

// Seleccionar servicio para el ticket
Avika.ui.selectTicketService = function(button, service) {
    // Actualizar estado
    Avika.ui.state.ticketService = service;
    
    // Actualizar clases de botones
    var buttons = document.querySelectorAll('.service-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    button.classList.add('active');
};

// Funciones de utilidad para el selector de hora
Avika.ui.generateHourOptions = function() {
    var options = '';
    for (var i = 0; i < 24; i++) {
        var hour = i < 10 ? '0' + i : i;
        options += '<option value="' + hour + '">' + hour + '</option>';
    }
    return options;
};

Avika.ui.generateMinuteOptions = function() {
    var options = '';
    for (var i = 0; i < 60; i += 5) {
        var minute = i < 10 ? '0' + i : i;
        options += '<option value="' + minute + '">' + minute + '</option>';
    }
    return options;
};

// Método para mostrar el modal de selección de platillos con búsqueda global
Avika.ui.showTicketItemSelection = function() {
    // Crear modal si no existe
    var modal = document.getElementById('ticket-item-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-item-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Seleccionar platillo</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="search-container">
                        <input type="text" id="ticket-dish-search" placeholder="Buscar platillo...">
                    </div>
                    
                    <div id="ticket-dish-selection" class="dish-selection">
                        <div id="ticket-categories-container" class="categories-container">
                            <!-- Categorías se cargarán dinámicamente -->
                        </div>
                        
                        <div id="ticket-dishes-container" class="dishes-container">
                            <!-- Platillos se cargarán dinámicamente -->
                        </div>
                        
                        <div id="ticket-no-search-results" class="no-search-results" style="display: none;">
                            No se encontraron resultados
                        </div>
                    </div>
                    
                    <div id="ticket-dish-customization" class="dish-customization" style="display: none;">
                        <h3 id="selected-ticket-dish-title">Platillo seleccionado</h3>
                        
                        <div class="customization-section">
                            <h4>Cantidad</h4>
                            <div class="quantity-control">
                                <button id="ticket-decrease-quantity" class="quantity-btn">-</button>
                                <span id="ticket-quantity-display">1</span>
                                <button id="ticket-increase-quantity" class="quantity-btn">+</button>
                            </div>
                        </div>
                        
                        <div class="customization-section">
                            <h4>Personalizaciones</h4>
                            <div id="ticket-options-container" class="options-container">
                                <!-- Opciones se cargarán dinámicamente -->
                            </div>
                        </div>
                        
                        <div class="ticket-item-actions">
                            <button id="add-to-ticket" class="action-btn">Añadir al ticket</button>
                            <button id="cancel-ticket-item" class="action-btn cancel-btn">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        modal.querySelector('.close-modal').onclick = function() {
            modal.style.display = 'none';
        };
        
        // Campo de búsqueda
        var searchInput = document.getElementById('ticket-dish-search');
        searchInput.oninput = function() {
            Avika.ui.filterTicketDishes(this.value);
        };
        
        // Botones de cantidad
        document.getElementById('ticket-decrease-quantity').onclick = function() {
            Avika.ui.changeTicketItemQuantity(-1);
        };
        
        document.getElementById('ticket-increase-quantity').onclick = function() {
            Avika.ui.changeTicketItemQuantity(1);
        };
        
        // Botón de añadir al ticket
        document.getElementById('add-to-ticket').onclick = function() {
            Avika.ui.addItemToTicket();
        };
        
        // Botón de cancelar
        document.getElementById('cancel-ticket-item').onclick = function() {
            document.getElementById('ticket-dish-selection').style.display = 'block';
            document.getElementById('ticket-dish-customization').style.display = 'none';
        };
        
        // Cargar categorías
        this.loadTicketCategories();
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Mostrar sección de selección
    document.getElementById('ticket-dish-selection').style.display = 'block';
    document.getElementById('ticket-dish-customization').style.display = 'none';
    
    // Limpiar búsqueda
    var searchInput = document.getElementById('ticket-dish-search');
    if (searchInput) {
        searchInput.value = '';
        this.filterTicketDishes('');
    }
};

// Cargar categorías para el selector de platillos del ticket
Avika.ui.loadTicketCategories = function() {
    var container = document.getElementById('ticket-categories-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear botones para cada categoría
    for (var categoryName in Avika.config.menu) {
        var button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', categoryName);
        button.textContent = categoryName;
        
        // Evento de clic
        button.onclick = function() {
            var category = this.getAttribute('data-category');
            Avika.ui.selectTicketCategory(category);
        };
        
        container.appendChild(button);
    }
    
    // Seleccionar primera categoría
    if (container.firstChild) {
        var firstCategory = container.firstChild.getAttribute('data-category');
        this.selectTicketCategory(firstCategory);
    }
};
