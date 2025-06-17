// ui-controller.js - Funciones de interfaz de usuario con soporte para subcategorías
window.Avika = window.Avika || {};

// Módulo de utilidades centralizado para funciones compartidas
Avika.utils = Avika.utils || {
    // Constantes de tiempo para toda la aplicación
    TIME_CONSTANTS: {
        FIVE_MINUTES_IN_SECONDS: 300,     // 5 minutos
        TEN_MINUTES_IN_SECONDS: 600,      // 10 minutos
        FIFTEEN_MINUTES_IN_SECONDS: 900,  // 15 minutos
        THIRTY_MINUTES_IN_SECONDS: 1800,  // 30 minutos
        NOTIFICATION_TIMEOUT_MS: 3000,    // 3 segundos
        AUTO_SAVE_INTERVAL_MS: 30000,     // 30 segundos
        TIMER_UPDATE_INTERVAL_MS: 2000    // 2 segundos
    },
    
    // La función isValidDate ha sido centralizada en Avika.utils.isValidDate
    
    // Funciones de acceso al DOM seguras
    getElement: function(id) {
        var el = document.getElementById(id);
        if (!el) this.log.warn('Elemento no encontrado:', id);
        return el;
    },
    
    // Sistema de logging configurable
    log: {
        level: 'info', // 'debug', 'info', 'warn', 'error', 'none'
        
        debug: function(msg, ...args) {
            if (['debug'].includes(this.level)) console.debug(msg, ...args);
        },
        
        info: function(msg, ...args) {
            if (['debug', 'info'].includes(this.level)) console.info(msg, ...args);
        },
        
        warn: function(msg, ...args) {
            if (['debug', 'info', 'warn'].includes(this.level)) console.warn(msg, ...args);
        },
        
        error: function(msg, ...args) {
            if (['debug', 'info', 'warn', 'error'].includes(this.level)) console.error(msg, ...args);
        }
    }
};

Avika.ui = {
    // Estado de la UI
    state: {
        lastSavedState: '',
        currentSubCategory: null, // Añadido para el seguimiento de subcategorías
        ticketMode: false, // Añadido para modo ticket
        ticketItems: [], // Añadido para almacenar elementos del ticket
        ticketService: 'comedor', // Servicio predeterminado para el ticket
        selectedTicketItem: {}, // Item seleccionado actualmente
        expandedTickets: {},
        currentBarFilter: 'todos' // Filtro de tiempo para órdenes en barra
    },

    // Función para actualizar la tabla de órdenes en barra
    updateBarTable: function() {
        console.log("Actualizando tabla de órdenes en barra");
        
        var tbody = document.getElementById('bar-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        var count = 0;
        var renderedTickets = new Set(); // Para rastrear los tickets ya mostrados
        
        Avika.data.barOrders.forEach(function(order) {
            var isFirstItem = false;
            if (order.ticketId && !renderedTickets.has(order.ticketId)) {
                isFirstItem = true;
                renderedTickets.add(order.ticketId);
            }
            
            var row = this.createBarRow(order, isFirstItem); // Pasar el flag a createBarRow
            if (row) {
                tbody.appendChild(row);
                count++;
            }
        }.bind(this));
        
        // Actualizar contador
        document.getElementById('bar-count').textContent = count;

        this.applyStylesToAllTickets();
    },

    // Función para crear fila de orden en barra (refactorizada)
    createBarRow: function(order, isFirstItemOfTicket) {
        if (!order) return null;

        var row = document.createElement('tr');
        row.className = 'order-row';
        row.setAttribute('data-service-type', order.serviceType);

        // Tiempos
        var now = new Date();
        var barTime = Math.floor((now - new Date(order.exitTime)) / 1000);
        var barTimeStr = Avika.utils.formatElapsedTime(barTime);

        // Alerta visual por tiempo de espera en barra
        if (barTime > Avika.utils.TIME_CONSTANTS.TEN_MINUTES_IN_SECONDS) { // Más de 10 minutos
            row.classList.add('warning-danger');
        } else if (barTime > Avika.utils.TIME_CONSTANTS.FIVE_MINUTES_IN_SECONDS) { // Más de 5 minutos
            row.classList.add('warning');
        }

        // Celda Platillo
        const dishCell = document.createElement('td');
        if (order.ticketId && isFirstItemOfTicket) {
            const ticketInfo = document.createElement('div');
            ticketInfo.className = 'ticket-label';
            ticketInfo.setAttribute('data-ticket-id', order.ticketId);
            // Usamos slice para mostrar solo una parte del ID y que no sea tan largo
            ticketInfo.textContent = `Ticket #${order.ticketId.slice(-6)}`;
            dishCell.appendChild(ticketInfo);
        }
        dishCell.appendChild(document.createTextNode(order.dish));
        row.appendChild(dishCell);

        // Celda Salida
        const exitCell = document.createElement('td');
        exitCell.textContent = Avika.utils.formatTime(new Date(order.exitTime));
        row.appendChild(exitCell);

        // Celda Tiempo en Barra
        const timeCell = document.createElement('td');
        timeCell.textContent = barTimeStr;
        row.appendChild(timeCell);

        // Celda Detalles (Notas)
        const detailsCell = document.createElement('td');
        detailsCell.className = 'mobile-hide-sm';
        detailsCell.textContent = order.notes || '';
        row.appendChild(detailsCell);

        // Celda Acciones
        const actionsCell = document.createElement('td');
        const listoBtn = document.createElement('button');
        listoBtn.className = 'action-btn';
        listoBtn.textContent = 'Listo';

        // El botón "Listo" siempre finaliza un platillo individualmente desde la barra.
        listoBtn.onclick = function() { Avika.orders.finishFromBar(order.id); };
        actionsCell.appendChild(listoBtn);

        // Botón de reparto (si aplica)
        if (order.serviceType === 'domicilio') {
            const repartoBtn = document.createElement('button');
            repartoBtn.className = 'action-btn';
            repartoBtn.textContent = 'Reparto';
            repartoBtn.onclick = function() { Avika.orders.finishDeliveryFromBar(order.id); };
            actionsCell.appendChild(repartoBtn);
        }
        row.appendChild(actionsCell);

        // Aplicar color según servicio
        if (order.serviceType) {
            row.style.backgroundColor = this.TICKET_COLORS[order.serviceType] || '#fff';
        }

        return row;
    },

    // Función para aplicar filtros a órdenes en barra
    applyBarFilters: function() {
        var filterTime = document.getElementById('filter-bar-time').value;
        this.state.currentBarFilter = filterTime;
        
        var tbody = document.getElementById('bar-body');
        if (!tbody) return;
        
        var now = new Date();
        
        Array.from(tbody.children).forEach(function(row) {
            var order = this.obtenerDatosOrdenDeFila(row);
            if (!order) return;
            
            var barTime = Math.floor((now - order.exitTime) / 1000);
            
            if (filterTime === 'todos' || 
                (filterTime === '5' && barTime >= 300) ||
                (filterTime === '10' && barTime >= 600) ||
                (filterTime === '15' && barTime >= 900)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }.bind(this));
    },

    // Función para limpiar filtros de órdenes en barra
    clearBarFilters: function() {
        this.state.currentBarFilter = 'todos';
        document.getElementById('filter-bar-time').value = 'todos';
        this.applyBarFilters();
    },
    
    // Funciones básicas de UI
    showSection: function(sectionId) {
        console.log("Mostrando sección:", sectionId); // Añadido para depuración
        
        // Ocultar todas las secciones primero
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('dishes-section').style.display = 'none';
        document.getElementById('preparation-section').style.display = 'none';
        
        // Mostrar la sección solicitada
        var section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            
            // Forzar un reflow para asegurar que los cambios de CSS se apliquen
            void section.offsetWidth;
            
            console.log("Sección " + sectionId + " configurada como visible");
            
            // Verificación adicional para dishes-section
            if (sectionId === 'dishes-section') {
                var dishesContainer = document.getElementById('dishes-container');
                if (dishesContainer) {
                    console.log("Contenedor de platillos encontrado, cantidad de hijos:", dishesContainer.children.length);
                    
                    // Verificar los botones de platillos
                    var buttons = dishesContainer.querySelectorAll('.dish-btn');
                    console.log("Botones de platillos encontrados:", buttons.length);
                    
                    // Verificar si los botones tienen estilos que los ocultan
                    if (buttons.length > 0) {
                        var buttonStyle = window.getComputedStyle(buttons[0]);
                        console.log("Estilo de botón:", 
                                    "display=" + buttonStyle.display, 
                                    "visibility=" + buttonStyle.visibility,
                                    "opacity=" + buttonStyle.opacity);
                    }
                } else {
                    console.error("No se encontró el contenedor de platillos");
                }
            }
        } else {
            console.error("Sección no encontrada:", sectionId);
        }
    },
    // Función mejorada para mostrar notificaciones con tipos
    showNotification: function(message, type) {
        var notification = Avika.utils.getElement('notification');
        if (!notification) {
            Avika.utils.log.warn('Elemento de notificación no encontrado');
            return;
        }
        
        // Eliminar clases anteriores
        notification.className = '';
        notification.classList.add('notification');
        
        // Añadir clase según el tipo
        type = type || 'info'; // Tipos: 'info', 'success', 'warning', 'error'
        notification.classList.add('notification-' + type);
        
        // Establecer el mensaje
        notification.textContent = message;
        
        // Mostrar con animación
        notification.style.display = 'block';
        notification.style.opacity = '0';
        
        // Animación de entrada
        setTimeout(function() {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Usar constante definida centralmente
        var timeout = Avika.utils.TIME_CONSTANTS.NOTIFICATION_TIMEOUT_MS;
        
        // Limpiar cualquier temporizador existente para evitar solapamientos
        if (this._notificationTimer) {
            clearTimeout(this._notificationTimer);
        }
        
        // Guardar referencia al temporizador
        this._notificationTimer = setTimeout(function() {
            // Animación de salida
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            // Ocultar después de la animación
            setTimeout(function() {
                notification.style.display = 'none';
            }, 300);
        }, timeout);
    },
    
    // Función para manejar subcategorías
        selectCategory: function(category) {
        console.log("Seleccionando categoría:", category);
        Avika.data.currentCategory = category;
        document.getElementById('selected-category-title').textContent = Avika.config.getActiveMenu().categoryNames[category];

        var dishesContainer = document.getElementById('dishes-container');
        dishesContainer.innerHTML = ''; // Limpiar contenedor

        const activeMenu = Avika.config.getActiveMenu();
        if (!activeMenu.dishes[category] || activeMenu.dishes[category].length === 0) {
            dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
            this.showSection('dishes-section');
            return;
        }

        // Añadir búsqueda
        var searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar platillo...';
        searchInput.className = 'search-input';
        searchInput.id = 'dish-search';
        searchInput.oninput = () => this.filterDishes(searchInput.value);
        searchContainer.appendChild(searchInput);
        dishesContainer.appendChild(searchContainer);

        var gridContainer = document.createElement('div');
        gridContainer.className = 'dishes-grid-container';
        dishesContainer.appendChild(gridContainer);

        // Lógica de subcategorías
        const subCategories = activeMenu.subCategories ? activeMenu.subCategories[category] : [];
        if (subCategories && subCategories.length > 0) {
            var subCategoriesContainer = document.createElement('div');
            subCategoriesContainer.className = 'subcategories-container';

            // Botón "Todos"
            var allButton = document.createElement('button');
            allButton.className = 'subcategory-btn active';
            allButton.textContent = 'Todos';
            allButton.onclick = (e) => {
                this.selectSubCategory(category, null, gridContainer);
                subCategoriesContainer.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            };
            subCategoriesContainer.appendChild(allButton);

            // Botones para cada subcategoría
            subCategories.forEach(subcat => {
                var button = document.createElement('button');
                button.className = 'subcategory-btn';
                button.textContent = subcat.name;
                button.onclick = (e) => {
                    this.selectSubCategory(category, subcat, gridContainer);
                    subCategoriesContainer.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                };
                subCategoriesContainer.appendChild(button);
            });
            dishesContainer.insertBefore(subCategoriesContainer, gridContainer);
            this.selectSubCategory(category, null, gridContainer); // Mostrar todos por defecto
        } else {
            this.selectSubCategory(category, null, gridContainer); // Sin subcategorías, mostrar todos
        }

        this.showSection('dishes-section');
    },

    selectSubCategory: function(category, subCategory, gridContainer) {
        gridContainer.innerHTML = '';
        this.state.currentSubCategory = subCategory ? subCategory.name : null;
        const activeMenu = Avika.config.getActiveMenu();
        const dishes = activeMenu.dishes[category];

        const filteredDishes = subCategory ?
            dishes.filter(dish => dish.subCategory === subCategory.name) :
            dishes;

        filteredDishes.forEach(dish => {
            var button = this.createCompactDishButton(dish.name, category);
            gridContainer.appendChild(button);
        });
    },

    filterDishes: function(searchText) {
        const gridContainer = document.querySelector('.dishes-grid-container');
        if (!gridContainer) return;
        const buttons = gridContainer.querySelectorAll('.dish-btn');
        searchText = searchText.toLowerCase();

        buttons.forEach(button => {
            const dishName = button.textContent.toLowerCase();
            if (dishName.includes(searchText)) {
                button.style.display = '';
            } else {
                button.style.display = 'none';
            }
        });
    },

    createCompactDishButton: function(dish, category) {
        var button = document.createElement('button');
        button.className = 'dish-btn compact';
        button.textContent = dish;
        button.onclick = function() {
            Avika.ui.showPreparationView(dish, category);
        };
        return button;
    },

    // --- Funciones para el modo Ticket ---
    enableTicketMode: function() {
        this.state.ticketMode = true;
        this.state.ticketItems = [];
        this.state.ticketService = 'comedor';
        this.showTicketModal();
    },

    showTicketModal: function() {
        var modal = document.getElementById('ticket-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ticket-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Nuevo Ticket/Comanda</h2>
                    <div class="ticket-main-controls">
                        <div class="ticket-service-select">
                            <input type="radio" id="ticket-btn-comedor" name="service-type" value="comedor" checked>
                            <label for="ticket-btn-comedor" class="service-btn">Comedor</label>
                            <input type="radio" id="ticket-btn-domicilio" name="service-type" value="domicilio">
                            <label for="ticket-btn-domicilio" class="service-btn">Domicilio</label>
                            <input type="radio" id="ticket-btn-para-llevar" name="service-type" value="para-llevar">
                            <label for="ticket-btn-para-llevar" class="service-btn">Para llevar</label>
                        </div>
                        <div class="ticket-time-select">
                            <select id="ticket-hour"></select> : <select id="ticket-minute"></select>
                        </div>
                    </div>
                    <div class="ticket-items-section">
                        <h3>Platillos (<span id="ticket-count">0</span>)</h3>
                        <div id="ticket-items-list"></div>
                        <button id="btn-add-ticket-item" class="action-btn">Agregar platillo</button>
                    </div>
                    <div class="ticket-notes-section">
                        <h3>Notas generales del ticket:</h3>
                        <textarea id="ticket-notes-input" placeholder="Ej: Cliente en mesa 5, alergias, etc."></textarea>
                    </div>
                    <div class="modal-action-btns">
                        <button id="btn-cancel-ticket" class="action-btn cancel-btn">Cancelar</button>
                        <button id="btn-save-ticket" class="action-btn start-btn" disabled>Guardar ticket</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // --- Eventos del modal principal de ticket ---
            modal.querySelector('.close-modal').onclick = () => this.cancelTicket();
            document.getElementById('btn-cancel-ticket').onclick = () => this.cancelTicket();
            document.getElementById('btn-add-ticket-item').onclick = () => this.showTicketItemSelection();
            document.getElementById('btn-save-ticket').onclick = () => this.saveTicket();

            document.getElementById('ticket-hour').innerHTML = this.generateHourOptions();
            document.getElementById('ticket-minute').innerHTML = this.generateMinuteOptions();
        }

        // Asignar evento de cambio al contenedor de los radio buttons
        modal.querySelector('.ticket-service-select').onchange = (e) => {
            if (e.target.name === 'service-type') {
                this.selectTicketService(e.target.value);
            }
        };

        // --- Resetear y mostrar modal ---
        var now = new Date();
        document.getElementById('ticket-hour').value = now.getHours();
        document.getElementById('ticket-minute').value = now.getMinutes();
        this.state.ticketItems = [];
        this.updateTicketItemsList(); // Limpia y actualiza el contador
        document.getElementById('ticket-notes-input').value = '';
        // Seleccionar 'comedor' por defecto
        document.getElementById('ticket-btn-comedor').checked = true;
        this.selectTicketService('comedor'); 
        modal.style.display = 'block';
    },

    selectTicketService: function(service) {
        // Guarda el tipo de servicio seleccionado. El estado visual es manejado por el radio button.
        this.state.ticketService = service;
        console.log("Servicio seleccionado:", service);
    },

    generateHourOptions: function() {
        let options = '';
        for (let i = 0; i < 24; i++) {
            const padded = String(i).padStart(2, '0');
            options += `<option value="${i}">${padded}</option>`;
        }
        return options;
    },

    generateMinuteOptions: function() {
        let options = '';
        for (let i = 0; i < 60; i++) {
            const padded = String(i).padStart(2, '0');
            options += `<option value="${i}">${padded}</option>`;
        }
        return options;
    },

    showTicketItemSelection: function() {
        var modal = document.getElementById('item-selection-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-selection-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Seleccionar platillo</h2>
                    <div id="item-selection-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
        }

        this.renderCategorySelection();
        modal.style.display = 'block';
    },

    renderCategorySelection: function() {
        const activeMenu = Avika.config.getActiveMenu();
        const categoryNames = activeMenu.categoryNames;
        let buttonsHTML = Object.keys(categoryNames).map(key => {
            // Solo mostrar categorías que tienen platillos
            if (activeMenu.dishes[key] && activeMenu.dishes[key].length > 0) {
                return `<button class="category-btn" data-category="${key}">${categoryNames[key]}</button>`;
            }
            return '';
        }).join('');

        const content = `
            <h3>Categorías</h3>
            <div class="category-container">${buttonsHTML}</div>
        `;
        
        const container = document.getElementById('item-selection-content');
        container.innerHTML = content;

        container.querySelectorAll('.category-btn').forEach(button => {
            button.onclick = (e) => {
                const categoryKey = e.target.getAttribute('data-category');
                this.renderDishSelection(categoryKey);
            };
        });
    },

    renderDishSelection: function(categoryKey) {
        const activeMenu = Avika.config.getActiveMenu();
        const dishes = activeMenu.dishes[categoryKey];
        const categoryName = activeMenu.categoryNames[categoryKey];

        let dishesHTML = dishes.map(dish => 
            `<button class="dish-btn" data-dish-name="${dish}">${dish}</button>`
        ).join('');

        const content = `
            <div class="step-header">
                <button class="back-to-categories">« Categorías</button>
                <h3>${categoryName}</h3>
            </div>
            <div class="dishes-container">${dishesHTML}</div>
        `;
        
        const container = document.getElementById('item-selection-content');
        container.innerHTML = content;

        container.querySelector('.back-to-categories').onclick = () => this.renderCategorySelection();
        container.querySelectorAll('.dish-btn').forEach(button => {
            button.onclick = (e) => {
                const dishName = e.target.getAttribute('data-dish-name');
                this.state.selectedTicketItem = { dish: dishName, category: categoryKey, quantity: 1, notes: '' };
                this.renderQuantitySelection(dishName, categoryKey);
            };
        });
    },

    renderQuantitySelection: function(dishName, categoryKey) {
        const content = `
            <div class="step-header">
                 <button class="back-to-dishes">« Platillos</button>
                <h3>${dishName}</h3>
            </div>
            <div class="item-quantity">
                <label>Cantidad:</label>
                <div class="qty-control">
                    <button class="qty-btn" id="item-btn-decrease">-</button>
                    <span class="qty-display" id="item-quantity-display">1</span>
                    <button class="qty-btn" id="item-btn-increase">+</button>
                </div>
            </div>
            <div class="item-notes">
                <label>Notas para este platillo:</label>
                <textarea id="item-notes-input" placeholder="Notas específicas..."></textarea>
            </div>
            <div class="modal-action-btns">
                <button id="btn-cancel-item" class="action-btn cancel-btn">Cancelar</button>
                <button id="btn-add-to-ticket" class="action-btn start-btn">Agregar al ticket</button>
            </div>
        `;
        const container = document.getElementById('item-selection-content');
        container.innerHTML = content;

        // Eventos
        container.querySelector('.back-to-dishes').onclick = () => this.renderDishSelection(categoryKey);
        document.getElementById('item-btn-decrease').onclick = () => this.changeItemQuantity(-1);
        document.getElementById('item-btn-increase').onclick = () => this.changeItemQuantity(1);
        document.getElementById('btn-cancel-item').onclick = () => { document.getElementById('item-selection-modal').style.display = 'none'; };
        document.getElementById('btn-add-to-ticket').onclick = () => {
            this.addItemToTicket();
            document.getElementById('item-selection-modal').style.display = 'none';
        };
    },

    changeItemQuantity: function(amount) {
        let quantityDisplay = document.getElementById('item-quantity-display');
        let currentQuantity = parseInt(quantityDisplay.textContent, 10);
        let newQuantity = Math.max(1, currentQuantity + amount);
        quantityDisplay.textContent = newQuantity;
        this.state.selectedTicketItem.quantity = newQuantity;
    },

    addItemToTicket: function() {
        const notesInput = document.getElementById('item-notes-input');
        this.state.selectedTicketItem.notes = notesInput ? notesInput.value : '';
        this.state.ticketItems.push(this.state.selectedTicketItem);
        this.updateTicketItemsList();
    },

    updateTicketItemsList: function() {
        const listContainer = document.getElementById('ticket-items-list');
        const countSpan = document.getElementById('ticket-count');
        const saveBtn = document.getElementById('btn-save-ticket');

        if (this.state.ticketItems.length === 0) {
            listContainer.innerHTML = '<p>No hay platillos agregados.</p>';
            countSpan.textContent = '0';
            saveBtn.disabled = true;
        } else {
            listContainer.innerHTML = this.state.ticketItems.map((item, index) => `
                <div class="ticket-item" data-index="${index}">
                    <span>${item.quantity}x ${item.dish}</span>
                    <button class="remove-item-btn">&times;</button>
                </div>
            `).join('');
            countSpan.textContent = this.state.ticketItems.length;
            saveBtn.disabled = false;

            // Eventos para remover items
            listContainer.querySelectorAll('.remove-item-btn').forEach(button => {
                button.onclick = (e) => {
                    const index = e.target.parentElement.getAttribute('data-index');
                    this.state.ticketItems.splice(index, 1);
                    this.updateTicketItemsList();
                };
            });
        }
    },

    saveTicket: function() {
        const hour = document.getElementById('ticket-hour').value;
        const minute = document.getElementById('ticket-minute').value;
        const notes = document.getElementById('ticket-notes-input').value;

        this.state.ticketItems.forEach(item => {
            Avika.orders.start(item.dish, item.category, {
                service: this.state.ticketService,
                quantity: item.quantity,
                notes: item.notes,
                generalNotes: notes,
                entryTime: `${hour}:${minute}`
            });
        });

        document.getElementById('ticket-modal').style.display = 'none';
        this.showNotification(`Ticket guardado con ${this.state.ticketItems.length} platillo(s).`);
    },

    cancelTicket: function() {
        document.getElementById('ticket-modal').style.display = 'none';
    },

    selectTicketCategory: function(category) {
        this.state.selectedTicketItem.category = category;
        document.getElementById('selected-category-name').textContent = Avika.config.getActiveMenu().categoryNames[category];
        
        var container = document.getElementById('dishes-selection-container');
        container.innerHTML = '';
        
        // Mostrar platillos de la categoría
        const activeMenu = Avika.config.getActiveMenu();
        if (activeMenu.dishes[category]) {
            for (var i = 0; i < activeMenu.dishes[category].length; i++) {
                var dish = activeMenu.dishes[category][i];
                var button = document.createElement('button');
                button.className = 'dish-btn';
                button.setAttribute('data-dish', dish.toLowerCase()); // Añadir para búsqueda
                
                if (category === 'combos' && activeMenu.specialCombos.indexOf(dish) !== -1) {
                    button.className += ' special-combo';
                }
                
                button.textContent = dish;
                button.onclick = (function(selectedDish) {
                    return function() {
                        Avika.ui.selectTicketDish(selectedDish);
                    };
                })(dish);
                
                container.appendChild(button);
            }
        }
    },
    selectTicketDish: function(dish) {
        this.state.selectedTicketItem.dish = dish;
        this.state.selectedTicketItem.quantity = 1;
        
        // Mostrar el nombre del platillo seleccionado
        document.getElementById('selected-dish-name').textContent = dish;
        
        // Ir al paso de cantidad
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'block';
    },
    
    changeTicketItemQuantity: function(change) {
        var quantityDisplay = document.getElementById('item-quantity-display');
        var currentQty = parseInt(quantityDisplay.textContent);
        var newQty = Math.max(1, currentQty + change);
        
        quantityDisplay.textContent = newQty;
        this.state.selectedTicketItem.quantity = newQty;
    },
    
    addItemToTicket: function() {
        var notes = document.getElementById('item-notes-input').value;
        this.state.selectedTicketItem.notes = notes;
        
        // Agregar al ticket actual
        this.state.ticketItems.push({
            category: this.state.selectedTicketItem.category,
            dish: this.state.selectedTicketItem.dish,
            quantity: this.state.selectedTicketItem.quantity,
            notes: this.state.selectedTicketItem.notes,
            isSpecialCombo: (this.state.selectedTicketItem.category === 'combos' && 
                           Avika.config.getActiveMenu().specialCombos.indexOf(this.state.selectedTicketItem.dish) !== -1)
        });
        
        // Actualizar lista de items
        this.updateTicketItemsList();
        
        // Cerrar modal de selección
        document.getElementById('item-selection-modal').style.display = 'none';
        
        // Habilitar botón de guardar si hay items
        document.getElementById('btn-save-ticket').disabled = false;
    },
    
    updateTicketItemsList: function() {
        var container = document.getElementById('ticket-items-list');
        container.innerHTML = '';
        
        this.state.ticketItems.forEach(function(item, index) {
            var itemElement = document.createElement('div');
            itemElement.className = 'ticket-item';
            itemElement.innerHTML = `
                <div class="ticket-item-info">
                    <span class="ticket-item-name">${item.dish} ${item.quantity > 1 ? '(' + item.quantity + ')' : ''}</span>
                    <span class="ticket-item-category">${Avika.config.getActiveMenu().categoryNames[item.category]}</span>
                    ${item.notes ? '<span class="ticket-item-notes">Notas: ' + item.notes + '</span>' : ''}
                </div>
                <button class="ticket-item-remove" data-index="${index}">×</button>
            `;
            container.appendChild(itemElement);
        });
        
        // Actualizar contador
        document.getElementById('ticket-count').textContent = this.state.ticketItems.length;
        
        // Agregar eventos para remover items
        var removeBtns = container.querySelectorAll('.ticket-item-remove');
        removeBtns.forEach(function(btn) {
            btn.onclick = function() {
                var index = parseInt(this.getAttribute('data-index'));
                Avika.ui.removeTicketItem(index);
            };
        });
    },
    
    removeTicketItem: function(index) {
        this.state.ticketItems.splice(index, 1);
        this.updateTicketItemsList();
        
        // Deshabilitar botón de guardar si no hay items
        document.getElementById('btn-save-ticket').disabled = (this.state.ticketItems.length === 0);
    },
    saveTicket: function() {
        // Deshabilitar botón inmediatamente para evitar múltiples envíos
        var saveButton = document.getElementById('btn-save-ticket');
        if (saveButton) {
            saveButton.disabled = true;
        }
        
        // Validar que haya platillos en el ticket
        if (!this.state.ticketItems || this.state.ticketItems.length === 0) {
            this.showNotification('El ticket debe contener al menos un platillo');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        // Obtener datos del ticket
        var ticketTime = new Date();
        
        // Obtener hora seleccionada con validación
        var hourElement = document.getElementById('ticket-hour');
        var minuteElement = document.getElementById('ticket-minute');
        
        if (!hourElement || !minuteElement) {
            this.showNotification('Error al obtener la hora seleccionada');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        var hour = parseInt(hourElement.value);
        var minute = parseInt(minuteElement.value);
        
        // Validar valores
        if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
            this.showNotification('Por favor ingrese valores válidos para la hora');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        // Establecer hora y minutos
        ticketTime.setHours(hour);
        ticketTime.setMinutes(minute);
        ticketTime.setSeconds(0);
        
        var ticketService = this.state.ticketService || 'comedor';
        var ticketNotes = document.getElementById('ticket-notes-input')?.value || '';
        
        // Validar que haya una fecha válida
        if (isNaN(ticketTime.getTime())) {
            this.showNotification('Por favor ingrese una hora válida');
            if (saveButton) {
                saveButton.disabled = false; // Re-habilitar el botón si hay error
            }
            return;
        }
        
        try {
            // Usar el módulo orderService para guardar el ticket
            var success = Avika.orderService.saveTicket(
                this.state.ticketItems,
                ticketService,
                ticketNotes,
                ticketTime,
                ticketTime // Pasar la hora de entrada como parámetro adicional
            );
            
            if (success) {
                // Actualizar la UI
                Avika.orderService.updatePendingTable();
                
                // Mostrar notificación
                this.showNotification('Ticket agregado con ' + this.state.ticketItems.length + ' platillos');
                
                // Cerrar modal - Primero verificar que todavía existe
                var modal = document.getElementById('ticket-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Restablecer estado
                this.state.ticketMode = false;
                this.state.ticketItems = [];
            } else {
                throw new Error('Error al guardar el ticket');
            }
            
        } catch (error) {
            // Capturar cualquier error y mostrar una notificación
            console.error('Error al guardar ticket:', error);
            this.showNotification('Error al guardar ticket: ' + (error.message || 'Error desconocido'));
            
            // Re-habilitar el botón si hay error
            if (saveButton) {
                saveButton.disabled = false;
            }
        }
    },
    
    cancelTicket: function() {
        document.getElementById('ticket-modal').style.display = 'none';
        this.state.ticketMode = false;
        this.state.ticketItems = [];
    },

    // Función para forzar a completar un ticket entero (desbloquear tickets atorados)
    forceCompleteTicket: function(ticketId) {
        var ticketItems = [];
        var itemsToRemove = [];
        
        // Encontrar todos los elementos del ticket
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                // Marcar todos los platillos como terminados
                item.finished = true;
                item.allItemsFinished = true;
                item.allTicketItemsFinished = true;
                item.kitchenFinished = true;
                
                if (item.isSpecialCombo) {
                    item.hotKitchenFinished = true;
                    item.coldKitchenFinished = true;
                }
                
                // Si no tiene ya un tiempo de finalización, establecerlo
                if (!item.finishTime) {
                    item.finishTime = new Date();
                    item.finishTimeFormatted = this.formatTime(item.finishTime);
                }
                
                // Si es domicilio o para llevar, preparar para la entrega
                if (item.serviceType === 'domicilio' || item.serviceType === 'para-llevar') {
                    item.readyForDelivery = true;
                }
                
                ticketItems.push(item);
            }
        }
        
        this.showNotification('Ticket desbloqueado: ' + ticketItems.length + ' platillos marcados como terminados. Este procedimiento debe usarse solo en casos excepcionales.');
        this.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },
    // Función para mostrar el modal de selección de ticket a desbloquear
    showForceCompleteModal: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('force-complete-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'force-complete-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Desbloquear Ticket (Emergencia)</h2>
                    <p>Esta función es para situaciones excepcionales donde un ticket quedó "atorado" por algún error.</p>
                    <p><strong>Nota importante:</strong> Normalmente, el botón "Salida del Repartidor" aparece automáticamente una vez que todos los platillos del ticket están marcados como terminados.</p>
                    <p>Esta función solo debe usarse cuando por alguna razón el flujo normal falló y necesita desbloquear un ticket.</p>
                    <div id="ticket-list" class="ticket-list-container"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Llenar la lista de tickets pendientes
        var ticketListContainer = document.getElementById('ticket-list');
        ticketListContainer.innerHTML = '';
        
        var uniqueTickets = {};
        
        // Recopilar tickets únicos
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order.ticketId && !uniqueTickets[order.ticketId]) {
                uniqueTickets[order.ticketId] = {
                    ticketId: order.ticketId,
                    serviceType: order.serviceType,
                    startTime: order.startTimeFormatted
                };
            }
        }
        
        // Crear botones para cada ticket
        var ticketCount = 0;
        for (var tid in uniqueTickets) {
            var ticket = uniqueTickets[tid];
            ticketCount++;
            
            var ticketItem = document.createElement('div');
            ticketItem.className = 'force-ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-info">
                    <span class="ticket-id">Ticket #${ticketCount}</span>
                    <span class="ticket-details">${Avika.config.serviceNames[ticket.serviceType]} - ${ticket.startTime}</span>
                </div>
                <button class="force-complete-btn" data-ticket-id="${ticket.ticketId}">Desbloquear</button>
            `;
            ticketListContainer.appendChild(ticketItem);
        }
        
        // Si no hay tickets, mostrar mensaje
        if (ticketCount === 0) {
            ticketListContainer.innerHTML = '<p>No hay tickets pendientes para desbloquear</p>';
        } else {
            // Agregar eventos a los botones
            var buttons = ticketListContainer.querySelectorAll('.force-complete-btn');
            buttons.forEach(function(btn) {
                btn.onclick = function() {
                    var ticketId = this.getAttribute('data-ticket-id');
                    Avika.ui.forceCompleteTicket(ticketId);
                    modal.style.display = 'none';
                };
            });
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
    },
    // Función para aplicar filtros a la tabla de órdenes pendientes
    aplicarFiltros: function() {
        var filtroCategoria = document.getElementById('filter-category').value;
        var filtroServicio = document.getElementById('filter-service').value;
        var filtroTiempo = parseInt(document.getElementById('filter-time').value);
        
        var filas = document.querySelectorAll('#pending-body tr');
        var totalFiltrado = 0;
        var totalFilas = filas.length;
        
        filas.forEach(function(fila) {
            // Obtener datos de la fila para filtrar
            var datosOrden = this.obtenerDatosOrdenDeFila(fila);
            var mostrar = true;
            
            // Filtrar por categoría
            if (filtroCategoria !== 'todos' && datosOrden.categoria !== filtroCategoria) {
                mostrar = false;
            }
            
            // Filtrar por servicio
            if (filtroServicio !== 'todos' && datosOrden.servicio !== filtroServicio) {
                mostrar = false;
            }
            
            // Filtrar por tiempo transcurrido
            if (!isNaN(filtroTiempo) && filtroTiempo > 0) {
                var tiempoTranscurrido = this.calcularTiempoTranscurrido(datosOrden.inicio);
                if (tiempoTranscurrido < filtroTiempo * 60) { // Convertir minutos a segundos
                    mostrar = false;
                }
            }
            
            // Aplicar visibilidad
            if (mostrar) {
                fila.classList.remove('row-filtered');
                totalFiltrado++;
            } else {
                fila.classList.add('row-filtered');
            }
        }.bind(this));
        
        // Mostrar resumen de filtrado
        this.showNotification('Mostrando ' + totalFiltrado + ' de ' + totalFilas + ' platillos');
    },

    // Función para obtener datos de una orden a partir de una fila
    obtenerDatosOrdenDeFila: function(fila) {
        var id = fila.querySelector('.timer-cell')?.getAttribute('data-id');
        var orden = null;
        
        // Buscar la orden por ID
        if (id) {
            orden = this.findOrderById(id);
        }
        
        if (orden) {
            return {
                id: orden.id,
                platillo: orden.dish,
                categoria: orden.category,
                servicio: orden.serviceType,
                inicio: orden.startTime
            };
        }
        
        // Si no encontramos la orden, extraer datos directamente de la fila
        return {
            platillo: fila.cells[0]?.textContent || '',
            inicio: fila.cells[1]?.textContent || '',
            servicio: this.extraerServicioDeFila(fila),
            categoria: 'unknown'
        };
    },
    // Extraer servicio del texto en la celda de detalles
    extraerServicioDeFila: function(fila) {
        var detalles = fila.cells[3]?.textContent || '';
        if (detalles.includes('Comedor')) return 'comedor';
        if (detalles.includes('Domicilio')) return 'domicilio';
        if (detalles.includes('Ordena y')) return 'para-llevar';
        return 'unknown';
    },

    // Calcular tiempo transcurrido en segundos
    calcularTiempoTranscurrido: function(inicioStr) {
        var inicio;
        
        if (typeof inicioStr === 'string' && inicioStr.includes(':')) {
            // Si es un string de hora (HH:MM:SS)
            var partes = inicioStr.split(':');
            if (partes.length === 3) {
                var ahora = new Date();
                inicio = new Date();
                inicio.setHours(parseInt(partes[0]), parseInt(partes[1]), parseInt(partes[2]));
                
                // Si la hora de inicio es mayor que la actual, asumimos que es de ayer
                if (inicio > ahora) {
                    inicio.setDate(inicio.getDate() - 1);
                }
            } else {
                return 0;
            }
        } else if (inicioStr instanceof Date || (typeof inicioStr === 'string' && !isNaN(new Date(inicioStr).getTime()))) {
            // Si es un objeto Date o un string de fecha válido
            inicio = new Date(inicioStr);
        } else {
            return 0;
        }
        
        return Math.floor((new Date() - inicio) / 1000);
    },

    // Función para limpiar filtros
    limpiarFiltros: function() {
        document.getElementById('filter-category').value = 'todos';
        document.getElementById('filter-service').value = 'todos';
        document.getElementById('filter-time').value = 'todos';
        
        // Mostrar todas las filas
        var filas = document.querySelectorAll('#pending-body tr');
        filas.forEach(function(fila) {
            fila.classList.remove('row-filtered');
        });
        
        this.showNotification('Filtros eliminados');
    },

    // Función para aplicar filtros a la tabla de reparto
    filtrarReparto: function(tiempoMinutos) {
        if (tiempoMinutos === 'todos') {
            this.limpiarFiltrosReparto();
            return;
        }
        
        var filas = document.querySelectorAll('#delivery-body tr');
        var totalFiltrado = 0;
        var totalFilas = filas.length;
        var tiempoLimite = parseInt(tiempoMinutos) * 60; // Convertir a segundos
        
        filas.forEach(function(fila) {
            var timerCell = fila.querySelector('.delivery-timer, .ready-timer');
            if (!timerCell) return;
            
            var tiempoTexto = timerCell.textContent;
            var partes = tiempoTexto.split(':');
            var tiempoTotal = parseInt(partes[0]) * 3600 + parseInt(partes[1]) * 60 + parseInt(partes[2]);
            
            if (tiempoTotal >= tiempoLimite) {
                fila.classList.remove('row-filtered');
                totalFiltrado++;
            } else {
                fila.classList.add('row-filtered');
            }
        });
        
        this.showNotification('Mostrando ' + totalFiltrado + ' de ' + totalFilas + ' repartos');
    },
    // Función para limpiar filtros de reparto
    limpiarFiltrosReparto: function() {
        var filas = document.querySelectorAll('#delivery-body tr');
        filas.forEach(function(fila) {
            fila.classList.remove('row-filtered');
        });
        
        this.showNotification('Filtros de reparto eliminados');
    },

    // Mostrar indicador de carga
    showLoading: function() {
        document.body.classList.add('loading-active');
    },

    // Ocultar indicador de carga
    hideLoading: function() {
        document.body.classList.remove('loading-active');
    },

    // Función para formatear tiempo transcurrido (utiliza directamente la implementación centralizada)
    formatElapsedTime: function(seconds) {
        return Avika.utils.formatElapsedTime(seconds);
    },
    
    // Función para formatear fecha en formato HH:MM:SS (utiliza directamente la implementación centralizada)
    formatTime: function(date) {
        return Avika.utils.formatTime(date);
    },

    // Actualizar todos los temporizadores - Versión optimizada
    updateAllTimers: function() {
        // Delegar a la función optimizada en orderService si está disponible
        if (Avika.orderService && typeof Avika.orderService.updateAllTimers === 'function') {
            return Avika.orderService.updateAllTimers();
        }
        
        // Implementación de respaldo si orderService no está disponible
        try {
            // Verificar que los datos existen antes de actualizar
            if (!Avika.data) {
                if (Avika.utils && Avika.utils.log) {
                    Avika.utils.log.warn('Avika.data no está disponible para actualizar temporizadores');
                } else {
                    console.warn('Avika.data no está disponible para actualizar temporizadores');
                }
                return;
            }
            
            // Actualizar temporizadores de platillos en preparación
            if (Array.isArray(Avika.data.pendingOrders) && Avika.data.pendingOrders.length > 0) {
                this.updatePendingTimers();
            }
            
            // Actualizar temporizadores de platillos en reparto
            if (Array.isArray(Avika.data.deliveryOrders) && Avika.data.deliveryOrders.length > 0) {
                this.updateDeliveryTimers();
            }
        } catch (error) {
            if (Avika.utils && Avika.utils.log) {
                Avika.utils.log.error('Error al actualizar temporizadores desde UI:', error);
            } else {
                console.error('Error al actualizar temporizadores desde UI:', error);
            }
        }
    },

    // Función para activar/desactivar modo ultra-compacto
    toggleCompactMode: function() {
        var body = document.body;
        
        // Verificar si ya está en modo compacto
        var isCompactMode = body.classList.contains('ultra-compact-mode');
        
        if (isCompactMode) {
            // Desactivar modo compacto
            body.classList.remove('ultra-compact-mode');
            document.getElementById('compact-icon').textContent = '🔍';
            localStorage.setItem('avika_compact_mode', 'false');
            this.showNotification('Modo normal activado');
        } else {
            // Activar modo compacto
            body.classList.add('ultra-compact-mode');
            document.getElementById('compact-icon').textContent = '📱';
            localStorage.setItem('avika_compact_mode', 'true');
            this.showNotification('Modo ultra-compacto activado');
        }
    },
    
    // Función para realizar búsqueda global de platillos en todas las categorías
    performGlobalDishSearch: function(searchText) {
        // Si el texto de búsqueda está vacío, ocultar resultados y volver a categorías
        if (!searchText || searchText.trim() === '') {
            document.getElementById('search-results-step').style.display = 'none';
            document.getElementById('category-selection-step').style.display = 'block';
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        var resultsContainer = document.getElementById('search-results-container');
        resultsContainer.innerHTML = '';
        
        var resultsFound = 0;
        var searchResults = [];
        
        // Buscar en todas las categorías
        const activeMenu = Avika.config.getActiveMenu();
        for (var category in activeMenu.dishes) {
            var dishes = activeMenu.dishes[category];
            
            dishes.forEach(function(dishName) {
                // En este caso, dishName es una cadena, no un objeto
                if (dishName.toLowerCase().includes(searchText)) {
                    searchResults.push({
                        category: category,
                        dishName: dishName
                    });
                }
            });
        }
        
        // Mostrar resultados
        if (searchResults.length > 0) {
            // Ordenar resultados alfabéticamente por nombre del platillo
            searchResults.sort(function(a, b) {
                return a.dishName.localeCompare(b.dishName);
            });
            
            // Crear botones para cada resultado
            searchResults.forEach(function(result) {
                var dishBtn = document.createElement('button');
                dishBtn.className = 'dish-btn';
                dishBtn.setAttribute('data-category', result.category);
                dishBtn.setAttribute('data-dish-name', result.dishName);
                
                var categoryLabel = document.createElement('span');
                categoryLabel.className = 'category-label';
                categoryLabel.textContent = Avika.config.getActiveMenu().categoryNames[result.category];
                
                var dishName = document.createElement('span');
                dishName.className = 'dish-name';
                dishName.textContent = result.dishName;
                
                dishBtn.appendChild(categoryLabel);
                dishBtn.appendChild(dishName);
                
                // Evento para seleccionar el platillo
                dishBtn.onclick = function() {
                    var category = this.getAttribute('data-category');
                    var dishNameValue = this.getAttribute('data-dish-name');
                    
                    Avika.ui.state.selectedTicketItem.category = category;
                    Avika.ui.state.selectedTicketItem.dish = dishNameValue;
                    
                    document.getElementById('selected-dish-name').textContent = dishNameValue;
                    document.getElementById('search-results-step').style.display = 'none';
                    document.getElementById('quantity-selection-step').style.display = 'block';
                };
                
                resultsContainer.appendChild(dishBtn);
                resultsFound++;
            });
        }
        
        // Si no hay resultados, mostrar mensaje
        if (resultsFound === 0) {
            var noResults = document.createElement('p');
            noResults.textContent = 'No se encontraron platillos que coincidan con "' + searchText + '"';
            noResults.style.padding = '15px';
            noResults.style.textAlign = 'center';
            resultsContainer.appendChild(noResults);
        }
        
        // Mostrar sección de resultados y ocultar otras
        document.getElementById('search-results-step').style.display = 'block';
        document.getElementById('category-selection-step').style.display = 'none';
        document.getElementById('dish-selection-step').style.display = 'none';
    },
    
    // Colores consistentes para cada tipo de servicio
    TICKET_COLORS: {
        'comedor': '#e6f2ff',      // Azul claro
        'domicilio': '#ffe6e6',    // Rojo claro
        'para-llevar': '#e6ffe6',  // Verde claro
        'ordena-y-espera': '#fff9e6', // Amarillo claro
        'otro': '#f5f5f5'          // Gris claro
    },
    
    // Función para aplicar colores consistentes a los tickets
    applyStylesToAllTickets: function() {
        // Tablas a procesar
        const tables = ['pending-body', 'delivery-body', 'completed-body', 'bar-body'];
        
        tables.forEach(tableId => {
            const tableBody = document.getElementById(tableId);
            if (!tableBody) return;
            
            // Agrupar filas por ticket
            const ticketGroups = {};
            let currentTicketId = null;
            let currentServiceType = null;
            
            // Recorrer todas las filas para identificar tickets
            Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
                // Buscar etiqueta de ticket
                const ticketLabel = row.querySelector('.ticket-label');
                
                // Si encontramos una etiqueta de ticket, es el inicio de un nuevo ticket
                if (ticketLabel) {
                    const ticketText = ticketLabel.textContent;
                    const ticketMatch = ticketText.match(/Ticket #([\w\d-]+)/);
                    if (ticketMatch) {
                        currentTicketId = ticketMatch[1];
                        
                        // Determinar el tipo de servicio
                        currentServiceType = row.getAttribute('data-service-type') || 'otro';
                        if (!currentServiceType || currentServiceType === 'undefined') {
                            const serviceTypeElements = row.querySelectorAll('.service-type');
                            if (serviceTypeElements.length > 0) {
                                const serviceText = serviceTypeElements[0].textContent.toLowerCase();
                                if (serviceText.includes('comedor')) {
                                    currentServiceType = 'comedor';
                                } else if (serviceText.includes('domicilio')) {
                                    currentServiceType = 'domicilio';
                                } else if (serviceText.includes('para llevar')) {
                                    currentServiceType = 'para-llevar';
                                } else if (serviceText.includes('ordena y espera')) {
                                    currentServiceType = 'para-llevar';
                                } else {
                                    currentServiceType = 'otro';
                                }
                            }
                        }
                        
                        // Inicializar grupo de ticket
                        if (!ticketGroups[currentTicketId]) {
                            ticketGroups[currentTicketId] = { rows: [], serviceType: currentServiceType }; // Inicializar grupo
                        }
                    }
                }
                
                // Si tenemos un ticket actual, agregar la fila a su grupo
                if (currentTicketId && ticketGroups[currentTicketId]) {
                    ticketGroups[currentTicketId].rows.push(row);
                    
                    // Verificar si es la última fila del ticket
                    const nextRow = row.nextElementSibling;
                    if (!nextRow || nextRow.querySelector('.ticket-label')) {
                        currentTicketId = null;
                        currentServiceType = null;
                    }
                }
            });
            
            // Aplicar colores consistentes a cada grupo de ticket
            for (const ticketId in ticketGroups) {
                const group = ticketGroups[ticketId];
                const color = this.TICKET_COLORS[group.serviceType] || this.TICKET_COLORS.otro;
                
                // Aplicar color a todas las filas del ticket
                group.rows.forEach((row, index) => {
                    row.style.backgroundColor = color;
                    
                    // Limpiar estilos de borde previos para evitar acumulaciones
                    row.style.borderTop = '';
                    row.style.borderBottom = '';
                    
                    // Aplicar estilos de agrupación si el ticket tiene más de una fila
                    if (group.rows.length > 1) {
                         if (index === 0) {
                            row.style.borderTop = '2px solid #777';
                        }
                        if (index === group.rows.length - 1) {
                            row.style.borderBottom = '2px solid #777';
                        } else {
                            row.style.borderBottom = '1px dashed #bbb';
                        }
                    }
                });
            }
        });
    }
};
