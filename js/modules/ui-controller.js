// ui-controller.js - Funciones de interfaz de usuario con soporte para subcategorías
window.Avika = window.Avika || {};

Avika.ui = {
    // Estado de la UI
    state: {
        lastSavedState: '',
        currentSubCategory: null, // Añadido para el seguimiento de subcategorías
        ticketMode: false, // Añadido para modo ticket
        ticketItems: [], // Añadido para almacenar elementos del ticket
        ticketService: 'comedor', // Servicio predeterminado para el ticket
        selectedTicketItem: {}, // Item seleccionado actualmente
        expandedTickets: {}
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

    showNotification: function(message) {
        var notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(function() {
            notification.style.display = 'none';
        }, 3000);
    },
    
    padZero: function(num) {
        return (num < 10 ? '0' : '') + num;
    },

    formatTime: function(date) {
        if (!date) return '--:--:--';
        
        var hours = this.padZero(date.getHours());
        var minutes = this.padZero(date.getMinutes());
        var seconds = this.padZero(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },
    
    // Función para manejar subcategorías
    selectCategory: function(category) {
        console.log("Seleccionando categoría:", category);
        
        Avika.data.currentCategory = category;
        document.getElementById('selected-category-title').textContent = Avika.config.categoryNames[category];
        
        var dishesContainer = document.getElementById('dishes-container');
        // Limpiar el contenedor completamente
        dishesContainer.innerHTML = '';
        
        // Verificar si hay datos de platillos
        if (!Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
            dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
            this.showSection('dishes-section');
            return;
        }
        
        // Añadir la sección de búsqueda rápida
        var searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar platillo...';
        searchInput.className = 'search-input';
        searchInput.id = 'dish-search';
        searchInput.addEventListener('input', function() {
            Avika.ui.filterDishes(this.value.toLowerCase());
        });
        searchContainer.appendChild(searchInput);
        dishesContainer.appendChild(searchContainer);
        
        // Crear un contenedor con estilo cuadrícula para los botones
        var gridContainer = document.createElement('div');
        gridContainer.className = 'dishes-grid-container';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(170px, 1fr))';
        gridContainer.style.gap = '10px';
        gridContainer.style.padding = '15px';
        dishesContainer.appendChild(gridContainer);
        
        // Verificar si hay subcategorías configuradas para esta categoría
        if (Avika.config.subCategories && 
            Avika.config.subCategories[category] && 
            Avika.config.subCategories[category].length > 0) {
            
            console.log("Procesando subcategorías para:", category);
            
            // Crear contenedor para subcategorías
            var subCategoriesContainer = document.createElement('div');
            subCategoriesContainer.className = 'subcategories-container';
            subCategoriesContainer.style.marginBottom = '15px';
            
            // Añadir botón para "Todos los platillos"
            var allButton = document.createElement('button');
            allButton.className = 'subcategory-btn active';
            allButton.textContent = 'Todos los platillos';
            allButton.style.padding = '8px 12px';
            allButton.style.margin = '0 5px 5px 0';
            allButton.style.borderRadius = '4px';
            allButton.onclick = function() {
                Avika.ui.selectSubCategory(category, null, gridContainer);
                
                // Marcar este botón como activo
                var buttons = subCategoriesContainer.querySelectorAll('.subcategory-btn');
                buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            };
            subCategoriesContainer.appendChild(allButton);
            
            // Añadir un botón para cada subcategoría
            Avika.config.subCategories[category].forEach(function(subcat) {
                var button = document.createElement('button');
                button.className = 'subcategory-btn';
                button.textContent = subcat.name;
                button.style.padding = '8px 12px';
                button.style.margin = '0 5px 5px 0';
                button.style.borderRadius = '4px';
                button.onclick = function() {
                    Avika.ui.selectSubCategory(category, subcat, gridContainer);
                    
                    // Marcar este botón como activo
                    var buttons = subCategoriesContainer.querySelectorAll('.subcategory-btn');
                    buttons.forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                };
                subCategoriesContainer.appendChild(button);
            });
            
            // Añadir el contenedor de subcategorías antes de la cuadrícula
            dishesContainer.insertBefore(subCategoriesContainer, gridContainer);
            
            // Mostrar todos los platillos inicialmente
            this.selectSubCategory(category, null, gridContainer);
        } else {
            // Si no hay subcategorías, mostrar todos los platillos directamente
            console.log("Mostrando todos los platillos para:", category);
            
            // Añadir todos los platillos como botones
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = this.createCompactDishButton(dish, category);
                gridContainer.appendChild(button);
            }
        }
        
        // Asegurarse de que se muestre la sección correcta
        this.showSection('dishes-section');
        console.log("Sección de platillos mostrada");
    },
    
    // Función auxiliar para crear botones de platillos más compactos
    createCompactDishButton: function(dish, category) {
        var button = document.createElement('button');
        button.className = 'dish-btn';
        button.setAttribute('data-dish', dish.toLowerCase());
        
        // Estilos para hacer el botón más compacto
        button.style.padding = '12px 8px';
        button.style.fontSize = '0.9rem';
        button.style.height = 'auto';
        button.style.minHeight = '50px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.textAlign = 'center';
        button.style.borderRadius = '6px';
        button.style.wordBreak = 'break-word';
        
        if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
            button.className += ' special-combo';
        }
        
        button.textContent = dish;
        button.onclick = function() {
            Avika.ui.selectDish(dish);
        };
        
        return button;
    },
    
    // Función para seleccionar una subcategoría
    selectSubCategory: function(category, subcategory, container) {
        console.log("Seleccionando subcategoría:", subcategory ? subcategory.name : "Todos");
        
        this.state.currentSubCategory = subcategory;
        
        // Si no se proporciona un contenedor, usar el predeterminado
        var dishesContainer = container || document.querySelector('.dishes-grid-container');
        if (!dishesContainer) {
            console.error("No se encontró el contenedor de platillos");
            return;
        }
        
        // Limpiar contenedor
        dishesContainer.innerHTML = '';
        
        // Si se seleccionó una subcategoría específica
        if (subcategory) {
            console.log("Mostrando platillos de subcategoría:", subcategory.name);
            
            // Mostrar solo los platillos de esta subcategoría
            subcategory.items.forEach(function(dish) {
                var button = Avika.ui.createCompactDishButton(dish, category);
                dishesContainer.appendChild(button);
            });
        } else {
            console.log("Mostrando todos los platillos de la categoría:", category);
            
            // Si se seleccionó "Todos", mostrar todos los platillos de la categoría
            if (!Avika.config.dishes[category]) {
                console.error("No se encontraron platillos para la categoría:", category);
                return;
            }
            
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = Avika.ui.createCompactDishButton(dish, category);
                dishesContainer.appendChild(button);
            }
        }
        
        console.log("Platillos añadidos:", dishesContainer.children.length);
    },
    
    // Función para filtrar platillos por búsqueda
    filterDishes: function(searchText) {
        var buttons = document.querySelectorAll('.dish-btn');
        var found = false;
        
        buttons.forEach(function(button) {
            var dishName = button.getAttribute('data-dish');
            if (dishName.indexOf(searchText) > -1) {
                button.style.display = '';
                found = true;
            } else {
                button.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no se encuentran platillos
        var noResultsMsg = document.getElementById('no-results-message');
        if (!found) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.textContent = 'No se encontraron platillos que coincidan con la búsqueda.';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.style.color = '#888';
                
                var container = document.querySelector('.dishes-grid-container');
                if (container) {
                    container.parentNode.insertBefore(noResultsMsg, container.nextSibling);
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },

    selectDish: function(dish) {
        Avika.data.currentDish = dish;
        document.getElementById('selected-dish-title').textContent = dish;
        
        Avika.data.isSpecialCombo = (Avika.config.specialCombos.indexOf(dish) !== -1);
        
        this.resetOptions();
        this.updatePersonalizationOptions();
        
        this.showSection('preparation-section');
    },

    resetOptions: function() {
        // Limpiar personalización
        Avika.data.currentCustomizations = [];
        
        // Resetear servicio
        document.getElementById('btn-comedor').classList.add('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        Avika.data.currentService = 'comedor';
        
        // Resetear cantidad
        Avika.data.currentQuantity = 1;
        document.getElementById('quantity-display').textContent = '1';
        
        // Limpiar notas
        document.getElementById('notes-input').value = '';
    },

    updatePersonalizationOptions: function() {
        var container = document.getElementById('customization-container');
        if (!container) {
            console.error("No se encontró el contenedor de personalizaciones #customization-container");
            return;
        }
        
        container.innerHTML = '';
        
        if (Avika.data.currentCategory === 'combos') {
            var optionGroup = document.getElementById('customization-options');
            if (optionGroup) {
                optionGroup.style.display = 'none';
            }
            return;
        }
        
        var optionGroup = document.getElementById('customization-options');
        if (optionGroup) {
            optionGroup.style.display = 'block';
        }
        
        for (var code in Avika.config.customizationOptions) {
            if (!Avika.config.customizationOptions.hasOwnProperty(code)) continue;
            
            var button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = Avika.config.customizationOptions[code];
            button.setAttribute('data-option', code);
            button.onclick = function() {
                Avika.ui.toggleOption(this, this.getAttribute('data-option'));
            };
            container.appendChild(button);
        }
    },

    toggleOption: function(button, option) {
        button.classList.toggle('selected');
        
        if (button.classList.contains('selected')) {
            if (Avika.data.currentCustomizations.indexOf(option) === -1) {
                Avika.data.currentCustomizations.push(option);
            }
        } else {
            Avika.data.currentCustomizations = Avika.data.currentCustomizations.filter(function(item) {
                return item !== option;
            });
        }
    },

    selectService: function(button, service) {
        document.getElementById('btn-comedor').classList.remove('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        Avika.data.currentService = service;
    },

    changeQuantity: function(change) {
        Avika.data.currentQuantity = Math.max(1, Avika.data.currentQuantity + change);
        document.getElementById('quantity-display').textContent = Avika.data.currentQuantity;
    },

    // Actualizar tabla de órdenes pendientes
    updatePendingTable: function() {
        var pendingBody = document.getElementById('pending-body');
        pendingBody.innerHTML = '';
        
        // Actualizar el contador en el encabezado
        var pendingCountElement = document.querySelector('.pending-orders-section h2');
        if (pendingCountElement) {
            var pendingCount = Avika.data.pendingOrders.length;
            pendingCountElement.textContent = 'Platillos en preparación ' + pendingCount;
        }
        
        // Obtener órdenes únicas agrupadas por ticket
        var ticketIds = new Set();
        var ticketGroups = [];
        
        // Identificar tickets únicos
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order.ticketId && !ticketIds.has(order.ticketId)) {
                ticketIds.add(order.ticketId);
                ticketGroups.push(order.ticketId);
            }
        }
        
        // Primero mostrar filas de tickets (encabezados)
        for (var i = 0; i < ticketGroups.length; i++) {
            var ticketId = ticketGroups[i];
            var ticketItems = Avika.data.pendingOrders.filter(function(item) {
                return item.ticketId === ticketId;
            });
            
            if (ticketItems.length > 0) {
                // Crear fila para el encabezado del ticket
                var headerRow = this.createTicketHeaderRow(ticketId, ticketItems);
                pendingBody.appendChild(headerRow);
                
                // Crear y añadir filas secundarias para cada platillo del ticket
                this.createTicketChildRows(ticketId, headerRow);
            }
        }
        
        // Luego mostrar filas de platillos individuales (sin ticket)
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            
            // Si no tiene ticket, mostrar como fila individual
            if (!order.ticketId) {
                var row = document.createElement('tr');
                
                // Platillo
                var dishCell = document.createElement('td');
                dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                row.appendChild(dishCell);
                
                // Inicio
                var startCell = document.createElement('td');
                startCell.textContent = order.startTimeFormatted;
                row.appendChild(startCell);
                
                // Tiempo transcurrido
                var timerCell = document.createElement('td');
                timerCell.className = 'timer-cell';
                timerCell.setAttribute('data-id', order.id);
                row.appendChild(timerCell);
                
                // Detalles
                var detailsCell = document.createElement('td');
                var details = Avika.config.serviceNames[order.serviceType];
                
                if (order.customizations && order.customizations.length > 0) {
                    details += ', ' + order.customizations.map(function(code) {
                        return Avika.config.customizationOptions[code] || code;
                    }).join(', ');
                }
                
                if (order.notes) {
                    details += ' - ' + order.notes;
                }
                
                detailsCell.textContent = details;
                row.appendChild(detailsCell);
                
                // Acción
                var actionCell = document.createElement('td');
                
                if (!order.isSpecialCombo) {
                    var finishBtn = document.createElement('button');
                    finishBtn.className = 'finish-btn';
                    finishBtn.textContent = 'Registrar';
                    finishBtn.onclick = (function(orderId) {
                        return function() {
                            Avika.orders.finishPreparation(orderId);
                        };
                    })(order.id);
                    actionCell.appendChild(finishBtn);
                } else {
                    // Para combos especiales, mostrar botones para cocina caliente y fría
                    if (!order.hotKitchenFinished) {
                        var hotKitchenBtn = document.createElement('button');
                        hotKitchenBtn.className = 'finish-btn hot-kitchen';
                        hotKitchenBtn.textContent = 'Cocina Caliente';
                        hotKitchenBtn.onclick = (function(orderId) {
                            return function() {
                                Avika.orders.finishHotKitchen(orderId);
                            };
                        })(order.id);
                        actionCell.appendChild(hotKitchenBtn);
                    }
                    
                    if (!order.coldKitchenFinished) {
                        var coldKitchenBtn = document.createElement('button');
                        coldKitchenBtn.className = 'finish-btn cold-kitchen';
                        coldKitchenBtn.textContent = 'Cocina Fría';
                        coldKitchenBtn.onclick = (function(orderId) {
                            return function() {
                                Avika.orders.finishColdKitchen(orderId);
                            };
                        })(order.id);
                        actionCell.appendChild(coldKitchenBtn);
                    }
                    
                    // Si ambos están terminados, mostrar botón para completar
                    if (order.hotKitchenFinished && order.coldKitchenFinished && !order.finished) {
                        var finishComboBtn = document.createElement('button');
                        finishComboBtn.className = 'finish-btn';
                        finishComboBtn.textContent = 'Listo';
                        finishComboBtn.onclick = (function(orderId) {
                            return function() {
                                Avika.orders.finishPreparation(orderId);
                            };
                        })(order.id);
                        actionCell.appendChild(finishComboBtn);
                    }
                }
                
                row.appendChild(actionCell);
                pendingBody.appendChild(row);
            }
        }
        
        // Actualizar temporizadores para todos los platillos
        this.updateAllTimers();
    },
    
    // Mejorar el formato de los tiempos transcurridos para mayor legibilidad
    formatElapsedTime: function(elapsedTime) {
        var hours = Math.floor(elapsedTime / 3600);
        var minutes = Math.floor((elapsedTime % 3600) / 60);
        var seconds = elapsedTime % 60;
        
        var formattedTime = '';
        
        if (hours > 0) {
            formattedTime += hours + ':';
            formattedTime += (minutes < 10 ? '0' : '') + minutes + ':';
        } else {
            formattedTime += minutes + ':';
        }
        
        formattedTime += (seconds < 10 ? '0' : '') + seconds;
        
        return formattedTime;
    },
    
    // Actualizar todos los temporizadores
    updateAllTimers: function() {
        var now = new Date();
        
        // Actualizar temporizadores para todas las celdas de timer
        var timerCells = document.querySelectorAll('.timer-cell');
        for (var i = 0; i < timerCells.length; i++) {
            var cell = timerCells[i];
            var orderId = cell.getAttribute('data-id');
            
            // Buscar el pedido por ID
            var order = null;
            for (var j = 0; j < Avika.data.pendingOrders.length; j++) {
                if (Avika.data.pendingOrders[j].id === orderId) {
                    order = Avika.data.pendingOrders[j];
                    break;
                }
            }
            
            if (order) {
                var startTime = new Date(order.startTime);
                var elapsedSeconds = Math.floor((now - startTime) / 1000);
                
                // Formatear el tiempo transcurrido en formato HH:MM:SS para mejor legibilidad
                var formattedTime = this.formatElapsedTime(elapsedSeconds);
                cell.textContent = formattedTime;
                
                // Añadir clases para alertas visuales según el tiempo transcurrido
                if (elapsedSeconds > 300) { // Más de 5 minutos
                    cell.classList.add('alert');
                    cell.classList.remove('warning');
                } else if (elapsedSeconds > 180) { // Más de 3 minutos
                    cell.classList.add('warning');
                    cell.classList.remove('alert');
                } else {
                    cell.classList.remove('warning', 'alert');
                }
            }
        }
    },
    
    // Funciones para el manejo de tickets o comandas
    enableTicketMode: function() {
        this.state.ticketMode = true;
        this.state.ticketItems = [];
        this.state.ticketService = 'comedor';
        
        // Mostrar modal para ingresar tickets
        this.showTicketModal();
    },
    
    showTicketModal: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('ticket-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ticket-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Ingreso de Ticket/Comanda</h2>
                    
                    <div class="ticket-input-group">
                        <label for="ticket-time">Hora de entrada:</label>
                        <div class="simple-time-picker">
                            <select id="ticket-hour" class="time-select">
                                ${this.generateHourOptions()}
                            </select>
                            <span>:</span>
                            <select id="ticket-minute" class="time-select">
                                ${this.generateMinuteOptions()}
                            </select>
                            <span class="time-select-label">hrs</span>
                        </div>
                    </div>
                    
                    <div class="ticket-items-container">
                        <h3>Platillos en este ticket: <span id="ticket-count">0</span></h3>
                        <div id="ticket-items-list" class="ticket-items-list"></div>
                    </div>
                    
                    <div class="ticket-service-selection">
                        <p>Tipo de servicio para todo el ticket:</p>
                        <div class="option-btns">
                            <button class="option-btn selected" id="ticket-btn-comedor">Comedor</button>
                            <button class="option-btn" id="ticket-btn-domicilio">Domicilio</button>
                            <button class="option-btn" id="ticket-btn-para-llevar">Ordena y Espera</button>
                        </div>
                    </div>
                    
                    <div class="ticket-notes">
                        <label for="ticket-notes-input">Notas para todo el ticket:</label>
                        <textarea id="ticket-notes-input" placeholder="Notas adicionales para todo el ticket"></textarea>
                    </div>
                    
                    <div class="ticket-buttons">
                        <button id="btn-add-ticket-item" class="action-btn">Agregar platillo</button>
                        <div class="modal-action-btns">
                            <button id="btn-cancel-ticket" class="action-btn cancel-btn">Cancelar</button>
                            <button id="btn-save-ticket" class="action-btn start-btn" disabled>Guardar ticket</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                Avika.ui.cancelTicket();
            };
            
            // Evento para agregar platillo
            document.getElementById('btn-add-ticket-item').onclick = function() {
                Avika.ui.showTicketItemSelection();
            };
            
            // Evento para guardar ticket
            document.getElementById('btn-save-ticket').onclick = function() {
                // Prevenir múltiples clics
                this.disabled = true;
                // Usar timeout para asegurar que el botón se actualiza visualmente antes de continuar
                setTimeout(function() {
                    Avika.ui.saveTicket();
                }, 50);
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-ticket').onclick = function() {
                Avika.ui.cancelTicket();
            };
            
            // Eventos de selección de servicio
            document.getElementById('ticket-btn-comedor').onclick = function() {
                Avika.ui.selectTicketService(this, 'comedor');
            };
            
            document.getElementById('ticket-btn-domicilio').onclick = function() {
                Avika.ui.selectTicketService(this, 'domicilio');
            };
            
            document.getElementById('ticket-btn-para-llevar').onclick = function() {
                Avika.ui.selectTicketService(this, 'para-llevar');
            };
        }
        
        // Inicializar hora actual
        var now = new Date();
        document.getElementById('ticket-hour').value = now.getHours();
        document.getElementById('ticket-minute').value = this.roundToFive(now.getMinutes());
        
        // Resetear lista de items
        this.state.ticketItems = [];
        document.getElementById('ticket-items-list').innerHTML = '';
        document.getElementById('ticket-count').textContent = '0';
        document.getElementById('btn-save-ticket').disabled = true;
        document.getElementById('ticket-notes-input').value = '';
        
        // Seleccionar servicio predeterminado (comedor)
        document.getElementById('ticket-btn-comedor').classList.add('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        this.state.ticketService = 'comedor';
        
        // Mostrar modal
        modal.style.display = 'block';
    },
    
    // Funciones de utilidad para el selector de hora
    generateHourOptions: function() {
        var options = '';
        for (var i = 0; i < 24; i++) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    generateMinuteOptions: function() {
        var options = '';
        for (var i = 0; i < 60; i += 5) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    roundToFive: function(num) {
        return Math.round(num / 5) * 5 % 60;
    },
    
    selectTicketService: function(button, service) {
        document.getElementById('ticket-btn-comedor').classList.remove('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        this.state.ticketService = service;
    },
    
    showTicketItemSelection: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('item-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Añadir Platillo al Ticket</h2>
                    
                    <div id="category-selection-step" class="selection-step">
                        <div class="step-header">
                            <h3>Selecciona Categoría</h3>
                        </div>
                        <div class="category-container mobile-friendly-select">
                            ${this.generateCategoryButtons()}
                        </div>
                    </div>
                    
                    <div id="dish-selection-step" class="selection-step" style="display: none;">
                        <div class="step-header">
                            <button class="back-to-category">&larr; Volver</button>
                            <h3>Selecciona Platillo</h3>
                        </div>
                        <div class="search-container">
                            <input type="text" id="modal-dish-search" class="search-input" placeholder="Buscar platillo...">
                        </div>
                        <div id="modal-dishes-container" class="dishes-container mobile-friendly-select"></div>
                    </div>
                    
                    <div id="quantity-selection-step" class="selection-step" style="display: none;">
                        <div class="step-header">
                            <button class="back-to-dish">&larr; Volver</button>
                            <h3>Cantidad y Notas</h3>
                        </div>
                        
                        <div class="item-quantity">
                            <p>Cantidad:</p>
                            <div class="qty-control">
                                <button id="item-btn-decrease" class="qty-btn">-</button>
                                <span id="item-quantity-display" class="qty-display">1</span>
                                <button id="item-btn-increase" class="qty-btn">+</button>
                            </div>
                        </div>
                        
                        <div class="item-notes">
                            <p>Notas para este platillo (opcional):</p>
                            <textarea id="item-notes-input" class="notes-input" placeholder="Agregar notas especiales para este platillo"></textarea>
                        </div>
                        
                        <div class="modal-action-btns">
                            <button id="btn-cancel-item" class="action-btn cancel-btn">Cancelar</button>
                            <button id="btn-add-item" class="action-btn start-btn">Agregar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
            
            // Eventos para categorías
            var categoryBtns = modal.querySelectorAll('.category-btn');
            categoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    var category = this.getAttribute('data-category');
                    Avika.ui.selectTicketCategory(category);
                    
                    // Mostrar paso de selección de platillos
                    document.getElementById('category-selection-step').style.display = 'none';
                    document.getElementById('dish-selection-step').style.display = 'block';
                };
            });
            
            // Botón para volver a categorías
            modal.querySelector('.back-to-category').onclick = function() {
                document.getElementById('category-selection-step').style.display = 'block';
                document.getElementById('dish-selection-step').style.display = 'none';
            };
            
            // Botón para volver a platillos
            modal.querySelector('.back-to-dish').onclick = function() {
                document.getElementById('dish-selection-step').style.display = 'block';
                document.getElementById('quantity-selection-step').style.display = 'none';
            };
            
            // Eventos de cantidad
            document.getElementById('item-btn-decrease').onclick = function() {
                Avika.ui.changeTicketItemQuantity(-1);
            };
            
            document.getElementById('item-btn-increase').onclick = function() {
                Avika.ui.changeTicketItemQuantity(1);
            };
            
            // Evento para agregar al ticket
            document.getElementById('btn-add-item').onclick = function() {
                Avika.ui.addItemToTicket();
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-item').onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Reiniciar selección
        this.state.selectedTicketItem = {
            category: '',
            dish: '',
            quantity: 1,
            notes: ''
        };
        
        // Mostrar modal en el primer paso (categorías)
        document.getElementById('category-selection-step').style.display = 'block';
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'none';
        
        // Resetear contenido
        document.getElementById('item-quantity-display').textContent = '1';
        document.getElementById('item-notes-input').value = '';
        document.getElementById('selected-category-name').textContent = '';
        document.getElementById('selected-dish-name').textContent = '';
        document.getElementById('modal-dishes-container').innerHTML = '';
        
        modal.style.display = 'block';
    },
    
    selectTicketCategory: function(category) {
        this.state.selectedTicketItem.category = category;
        document.getElementById('selected-category-name').textContent = Avika.config.categoryNames[category];
        
        var container = document.getElementById('modal-dishes-container');
        container.innerHTML = '';
        
        // Mostrar platillos de la categoría
        if (Avika.config.dishes[category]) {
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = document.createElement('button');
                button.className = 'dish-btn';
                
                if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
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
                           Avika.config.specialCombos.indexOf(this.state.selectedTicketItem.dish) !== -1)
        });
        
        // Actualizar lista de items
        this.updateTicketItemsList();
        
        // Cerrar modal de selección
        document.getElementById('item-modal').style.display = 'none';
        
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
                    <span class="ticket-item-category">${Avika.config.categoryNames[item.category]}</span>
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
        
        // Generar un ID de ticket único para agrupar los platillos
        var ticketId = 'ticket-' + Date.now();
        
        try {
            // Procesar cada item del ticket
            this.state.ticketItems.forEach(function(item) {
                var preparation = {
                    id: Date.now().toString() + Math.floor(Math.random() * 1000),
                    ticketId: ticketId, // Añadir ID del ticket para agrupar
                    dish: item.dish,
                    category: item.category,
                    categoryDisplay: Avika.config.categoryNames[item.category],
                    quantity: item.quantity,
                    customizations: [],
                    serviceType: ticketService,
                    notes: item.notes + (ticketNotes ? ' | ' + ticketNotes : ''),
                    startTime: ticketTime,
                    startTimeFormatted: Avika.ui.formatTime(ticketTime),
                    isSpecialCombo: item.isSpecialCombo,
                    isFromTicket: true,
                    finished: false, // Asegurarnos que comienza como no terminado
                    allTicketItemsFinished: false // Inicializar como no terminado
                };
                
                if (item.isSpecialCombo) {
                    preparation.hotKitchenFinished = false;
                    preparation.coldKitchenFinished = false;
                }
                
                // Crear una copia para evitar referencias directas
                Avika.data.pendingOrders.push(JSON.parse(JSON.stringify(preparation)));
            });
            
            // Actualizar la UI
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
            
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

    // Crear filas secundarias para los platillos de un ticket
    createTicketChildRows: function(ticketId, parentRow) {
        var childItems = [];
        
        // Recopilar todos los platillos del mismo ticket
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                childItems.push(item);
            }
        }
        
        // Verificar si todos los platillos del ticket están terminados
        var allTicketItemsFinished = childItems.every(function(item) {
            if (item.isSpecialCombo) {
                return item.hotKitchenFinished && item.coldKitchenFinished;
            } else {
                return item.finished;
            }
        });
        
        // Actualizar la propiedad allTicketItemsFinished en todos los platillos del ticket
        for (var i = 0; i < childItems.length; i++) {
            childItems[i].allTicketItemsFinished = allTicketItemsFinished;
        }
        
        // Crear y agregar las filas secundarias
        var fragment = document.createDocumentFragment();
        var table = parentRow.parentElement;
        
        for (var i = 0; i < childItems.length; i++) {
            var item = childItems[i];
            var childRow = this.createTicketChildRow(item, allTicketItemsFinished);
            childRow.classList.add('ticket-item-row');
            childRow.style.display = this.state.expandedTickets[ticketId] ? 'table-row' : 'none';
            fragment.appendChild(childRow);
        }
        
        // Insertar después del encabezado del ticket
        if (parentRow.nextElementSibling) {
            table.insertBefore(fragment, parentRow.nextElementSibling);
        } else {
            table.appendChild(fragment);
        }
    },

    // Crear fila para un platillo individual dentro de un ticket
    createTicketChildRow: function(item, allTicketItemsFinished) {
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = item.dish + (item.quantity > 1 ? ' (' + item.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.textContent = item.startTimeFormatted;
        row.appendChild(startCell);
        
        // Celda de tiempo transcurrido o tiempo de preparación individual si ya está terminado
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        if (item.finished || (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
            timerCell.textContent = item.individualPrepTime || '--:--';
            timerCell.classList.add('finished-time');
        } else {
            timerCell.textContent = '00:00';
        }
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        var details = '';
        
        // Mostrar estado del platillo individual
        if (item.isSpecialCombo) {
            if (item.hotKitchenFinished) details += "✓ Cocina Caliente, ";
            else details += "⚪ Cocina Caliente, ";
            
            if (item.coldKitchenFinished) details += "✓ Cocina Fría";
            else details += "⚪ Cocina Fría";
        } else {
            if (item.finished) details += "✓ Terminado";
            else if (item.kitchenFinished) details += "✓ Listo en cocina";
            else details += "⚪ En preparación";
        }
        
        if (item.customizations && item.customizations.length > 0) {
            details += ', ' + item.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
        }
        
        if (item.notes) {
            details += ' - ' + item.notes;
        }
        
        // Añadir información sobre el ticket
        details += ' | Parte de ticket';
        if (allTicketItemsFinished) {
            details += ' (Listo para entrega)';
        }
        
        detailsCell.textContent = details;
        row.appendChild(detailsCell);
        
        // Celda de acción para el platillo individual
        var actionCell = document.createElement('td');
        actionCell.className = 'action-cell';
        
        // Mostrar acción de salida/entrega en el nivel de ticket si todos los platillos están listos
        if (allTicketItemsFinished) {
            // Si es domicilio o para llevar, mostrar botones correspondientes
            if ((item.serviceType === 'domicilio' || item.serviceType === 'para-llevar')) {
                var ticketBtnGroup = document.createElement('div');
                ticketBtnGroup.style.display = 'flex';
                ticketBtnGroup.style.flexDirection = 'column';
                ticketBtnGroup.style.gap = '5px';
                
                // Si no ha salido el repartidor aún
                if (!item.deliveryDepartureTime) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'finish-btn delivery';
                    departureBtn.textContent = 'Salida del Repartidor';
                    departureBtn.onclick = (function(orderId) {
                        return function(e) {
                            e.stopPropagation(); // Evitar que el clic llegue a la fila
                            Avika.orders.markDeliveryDeparture(orderId);
                        };
                    })(item.id);
                    ticketBtnGroup.appendChild(departureBtn);
                }
                // Si ya se registró la salida pero no la entrega
                else if (!item.deliveryArrivalTime) {
                    var arrivalBtn = document.createElement('button');
                    arrivalBtn.className = 'finish-btn delivery-arrived';
                    arrivalBtn.textContent = 'Entrega de Pedido';
                    arrivalBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(item.id);
                    };
                    ticketBtnGroup.appendChild(arrivalBtn);
                }
                
                actionCell.appendChild(ticketBtnGroup);
            }
            // Para platillos de comedor, el botón de completar aparece solo en el encabezado
            else {
                // Mostrar estado terminado
                var doneLabel = document.createElement('span');
                doneLabel.className = 'done-status';
                doneLabel.textContent = 'Listo';
                actionCell.appendChild(doneLabel);
            }
        }
        // Si el platillo no está terminado, mostrar botones para marcar como terminado
        else if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            if (!item.hotKitchenFinished) {
                var hotKitchenBtn = document.createElement('button');
                hotKitchenBtn.className = 'finish-btn hot-kitchen';
                hotKitchenBtn.textContent = 'Cocina Caliente';
                hotKitchenBtn.onclick = (function(orderId) {
                    return function(e) {
                        e.stopPropagation(); // Evitar que el clic llegue a la fila
                        Avika.orders.finishHotKitchen(orderId);
                    };
                })(item.id);
                buttonGroup.appendChild(hotKitchenBtn);
            }
            
            if (!item.coldKitchenFinished) {
                var coldKitchenBtn = document.createElement('button');
                coldKitchenBtn.className = 'finish-btn cold-kitchen';
                coldKitchenBtn.textContent = 'Cocina Fría';
                coldKitchenBtn.onclick = (function(orderId) {
                    return function(e) {
                        e.stopPropagation(); // Evitar que el clic llegue a la fila
                        Avika.orders.finishColdKitchen(orderId);
                    };
                })(item.id);
                buttonGroup.appendChild(coldKitchenBtn);
            }
            
            actionCell.appendChild(buttonGroup);
        } 
        // Para platillos normales que no están terminados
        else if (!item.finished) {
            var finishBtn = document.createElement('button');
            finishBtn.className = 'finish-btn';
            finishBtn.textContent = 'Listo';
            finishBtn.onclick = (function(orderId) {
                return function(e) {
                    e.stopPropagation(); // Evitar que el clic llegue a la fila
                    Avika.orders.finishIndividualItem(orderId);
                };
            })(item.id);
            actionCell.appendChild(finishBtn);
        }
        // Si el platillo ya está terminado pero el ticket aún no está completo
        else {
            var ticketLabel = document.createElement('span');
            ticketLabel.className = 'done-status';
            ticketLabel.textContent = 'Terminado';
            actionCell.appendChild(ticketLabel);
        }
        
        row.appendChild(actionCell);
        
        return row;
    },

    startPreparation: function() {
        console.log("Iniciando preparación para:", Avika.data.currentDish);
        
        // Validar que se ha seleccionado un platillo
        if (!Avika.data.currentDish) {
            this.showNotification('Por favor, selecciona un platillo primero.');
            return;
        }
        
        // Crear orden
        var preparation = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            dish: Avika.data.currentDish,
            category: Avika.data.currentCategory,
            categoryDisplay: Avika.config.categoryNames[Avika.data.currentCategory],
            quantity: Avika.data.currentQuantity,
            customizations: Avika.data.currentCustomizations,
            serviceType: Avika.data.currentService,
            notes: document.getElementById('notes-input').value,
            startTime: new Date(),
            startTimeFormatted: this.formatTime(new Date()),
            isSpecialCombo: Avika.data.isSpecialCombo
        };
        
        // Si es combo especial, inicializar estados de cocinas
        if (Avika.data.isSpecialCombo) {
            preparation.hotKitchenFinished = false;
            preparation.coldKitchenFinished = false;
        }
        
        // Agregar a pendientes
        Avika.data.pendingOrders.push(preparation);
        
        // Actualizar UI
        this.updatePendingTable();
        
        // Mostrar notificación
        this.showNotification('Preparación iniciada para: ' + Avika.data.currentDish);
        
        // Guardar datos
        Avika.storage.guardarDatosLocales();
        
        // Volver a la sección de categorías
        this.showSection('categories-section');
    },
    
    // Mostrar mensaje de error para el usuario
    showErrorMessage: function(message) {
        try {
            var errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '50%';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translate(-50%, -50%)';
            errorDiv.style.background = 'white';
            errorDiv.style.padding = '20px';
            errorDiv.style.border = '1px solid #ff4757';
            errorDiv.style.borderRadius = '8px';
            errorDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
            errorDiv.style.zIndex = '10000';
            errorDiv.style.maxWidth = '90%';
            errorDiv.style.width = '300px';
            errorDiv.style.textAlign = 'center';
            
            var titleText = document.createElement('h3');
            titleText.textContent = 'Error al inicializar la aplicación';
            titleText.style.margin = '0 0 10px 0';
            titleText.style.color = '#ff4757';
            
            var messageText = document.createElement('p');
            messageText.textContent = message;
            messageText.style.margin = '0 0 15px 0';
            
            var closeButton = document.createElement('button');
            closeButton.textContent = 'Cerrar';
            closeButton.style.padding = '8px 20px';
            closeButton.style.background = '#ff4757';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            
            closeButton.onclick = function() {
                document.body.removeChild(errorDiv);
            };
            
            errorDiv.appendChild(titleText);
            errorDiv.appendChild(messageText);
            errorDiv.appendChild(closeButton);
            
            document.body.appendChild(errorDiv);
        } catch (e) {
            // Si falla incluso el mostrar el error, usar alert como respaldo
            alert('Error: ' + message);
        }
    },
    
    // Inicializar eventos cuando se carga la página
    initEvents: function() {
        try {
            console.log("Iniciando configuración de eventos...");
            
            // Detectar tipo de dispositivo y adaptar interfaz
            this.detectDevice();
            
            // Verificación de elementos esenciales
            if (!document.querySelector('.category-btn[data-category]')) {
                this.showErrorMessage('No se encontraron botones de categoría. Es posible que el HTML no se haya cargado correctamente.');
                console.error('Error crítico: No se encontraron botones de categoría');
                return false;
            }
            
            // Inicializar botones de categoría por atributo data-category
            var categoryButtons = document.querySelectorAll('.category-btn[data-category]');
            console.log("Botones de categoría encontrados:", categoryButtons.length);
            
            categoryButtons.forEach(function(btn) {
                var category = btn.getAttribute('data-category');
                if (category) {
                    btn.addEventListener('click', function() {
                        console.log("Clic en botón de categoría:", category);
                        Avika.ui.selectCategory(category);
                    });
                } else {
                    console.warn("Botón de categoría sin atributo data-category");
                }
            });
            
            // Inicializar botones de servicio
            var btnComedor = document.getElementById('btn-comedor');
            var btnDomicilio = document.getElementById('btn-domicilio');
            var btnParaLlevar = document.getElementById('btn-para-llevar');
            
            if (btnComedor) {
                btnComedor.onclick = null; // Eliminar onclick inline
                btnComedor.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'comedor');
                });
            }
            
            if (btnDomicilio) {
                btnDomicilio.onclick = null; // Eliminar onclick inline
                btnDomicilio.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'domicilio');
                });
            }
            
            if (btnParaLlevar) {
                btnParaLlevar.onclick = null; // Eliminar onclick inline
                btnParaLlevar.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'para-llevar');
                });
            }
            
            // Inicializar botones de cantidad
            var quantityBtns = document.querySelectorAll('.qty-btn');
            quantityBtns.forEach(function(btn) {
                btn.onclick = null; // Eliminar onclick inline
                
                if (btn.textContent === '-') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(-1);
                    });
                } else if (btn.textContent === '+') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(1);
                    });
                }
            });
            
            // Inicializar botón para iniciar preparación
            var btnStart = document.getElementById('btn-start');
            if (btnStart) {
                btnStart.onclick = null; // Eliminar onclick inline
                btnStart.addEventListener('click', function() {
                    Avika.ui.startPreparation();
                });
            }
            
            // Inicializar botón para cancelar
            var btnCancel = document.getElementById('btn-cancel');
            if (btnCancel) {
                btnCancel.onclick = null; // Eliminar onclick inline
                btnCancel.addEventListener('click', function() {
                    Avika.ui.showSection('dishes-section');
                });
            }
            
            // Inicializar botón para volver a categorías
            var btnBackToCategories = document.getElementById('btn-back-to-categories');
            if (btnBackToCategories) {
                btnBackToCategories.addEventListener('click', function() {
                    Avika.ui.showSection('categories-section');
                });
            }
            
            // Inicializar ticket/comanda
            var newTicketBtn = document.getElementById('btn-new-ticket');
            if (newTicketBtn) {
                newTicketBtn.addEventListener('click', function() {
                    Avika.ui.enableTicketMode();
                });
            }
            
            // Inicializar botón para desbloquear tickets
            var forceCompleteBtn = document.getElementById('btn-force-complete');
            if (forceCompleteBtn) {
                forceCompleteBtn.addEventListener('click', function() {
                    Avika.ui.showForceCompleteModal();
                });
            }
            
            // Inicializar filtros de historial
            var filterBtns = {
                showAll: document.getElementById('btn-show-all-history'),
                showRecent: document.getElementById('btn-show-recent'),
                showStats: document.getElementById('btn-show-stats'),
                clearHistory: document.getElementById('btn-clear-history')
            };
            
            if (filterBtns.showAll) {
                filterBtns.showAll.addEventListener('click', function() {
                    Avika.ui.updateCompletedTable(true);
                    this.classList.add('active');
                    if (filterBtns.showRecent) filterBtns.showRecent.classList.remove('active');
                    if (filterBtns.showStats) filterBtns.showStats.classList.remove('active');
                });
            }
            
            if (filterBtns.showRecent) {
                filterBtns.showRecent.addEventListener('click', function() {
                    Avika.ui.updateCompletedTable(false);
                    this.classList.add('active');
                    if (filterBtns.showAll) filterBtns.showAll.classList.remove('active');
                    if (filterBtns.showStats) filterBtns.showStats.classList.remove('active');
                });
            }
            
            if (filterBtns.showStats) {
                filterBtns.showStats.addEventListener('click', function() {
                    if (Avika.stats && typeof Avika.stats.showStatistics === 'function') {
                        Avika.stats.showStatistics();
                        this.classList.add('active');
                        if (filterBtns.showAll) filterBtns.showAll.classList.remove('active');
                        if (filterBtns.showRecent) filterBtns.showRecent.classList.remove('active');
                    } else {
                        console.error("Función showStatistics no disponible");
                    }
                });
            }
            
            if (filterBtns.clearHistory) {
                filterBtns.clearHistory.addEventListener('click', function() {
                    if (confirm('¿Estás seguro de que deseas eliminar todo el historial de platillos completados?')) {
                        if (Avika.orders && typeof Avika.orders.clearCompletedOrders === 'function') {
                            Avika.orders.clearCompletedOrders();
                        } else if (Avika.storage && typeof Avika.storage.limpiarHistorial === 'function') {
                            Avika.storage.limpiarHistorial();
                        } else {
                            console.error("No se encontró función para limpiar historial");
                        }
                    }
                });
            }
            
            // Agregar función de exportar datos si existe el botón
            var exportBtn = document.getElementById('btn-export');
            if (exportBtn) {
                exportBtn.addEventListener('click', function() {
                    if (Avika.stats && typeof Avika.stats.exportData === 'function') {
                        Avika.stats.exportData();
                    } else if (Avika.stats && typeof Avika.stats.exportarDatos === 'function') {
                        Avika.stats.exportarDatos();
                    } else {
                        console.error("Función de exportar datos no disponible");
                    }
                });
            }
            
            console.log("Eventos inicializados correctamente");
            return true;
        } catch (e) {
            console.error("Error durante la inicialización de eventos:", e);
            console.error("Detalles del error:", e.message);
            console.error("Stack:", e.stack);
            
            // Mostrar mensaje de error al usuario
            this.showErrorMessage('Hubo un problema al inicializar la aplicación: ' + e.message);
            return false;
        }
    },

    // Generar botones de categoría para modales
    generateCategoryButtons: function() {
        var html = '';
        
        // Categorías principales
        var categories = [
            { id: 'frio', name: 'Platillos Fríos' },
            { id: 'entrada-fria', name: 'Entradas Frías' },
            { id: 'caliente', name: 'Platillos Calientes' },
            { id: 'entrada-caliente', name: 'Entradas Calientes' },
            { id: 'combos', name: 'Combos' }
        ];
        
        // Generar HTML para cada categoría
        categories.forEach(function(cat) {
            html += `<button class="category-btn" data-category="${cat.id}">${cat.name}</button>`;
        });
        
        return html;
    },

    // Detectar tipo de dispositivo y adaptar interfaz
    detectDevice: function() {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var isSmallScreen = window.innerWidth < 480;
        
        if (isMobile || isSmallScreen) {
            document.body.classList.add('mobile-device');
            console.log("Dispositivo móvil detectado. Adaptando interfaz...");
            
            // Si es dispositivo móvil, reducir el tamaño de los textos y elementos
            this.adaptMobileInterface();
        } else {
            document.body.classList.remove('mobile-device');
            console.log("Dispositivo de escritorio detectado");
        }
        
        // Registrar evento de cambio de tamaño de ventana
        window.addEventListener('resize', function() {
            var isSmallScreen = window.innerWidth < 480;
            if (isSmallScreen) {
                document.body.classList.add('mobile-device');
                Avika.ui.adaptMobileInterface();
            } else {
                document.body.classList.remove('mobile-device');
            }
        });
        
        return isMobile || isSmallScreen;
    },
    
    // Adaptar interfaz para móviles
    adaptMobileInterface: function() {
        try {
            console.log("Adaptando interfaz para móviles...");
            
            // Reducir altura de encabezado
            var header = document.querySelector('header');
            if (header) {
                header.style.padding = '8px';
            }
            
            // Aplicar estilos adicionales para categorías en móviles
            var categoryContainer = document.querySelector('.category-container');
            if (categoryContainer) {
                // Asegurar que tenga máximo 3 botones por fila
                var buttons = categoryContainer.querySelectorAll('.category-btn');
                var screenWidth = window.innerWidth;
                var maxButtons = screenWidth < 360 ? 2 : 3;
                
                // Asignar ancho aproximado para mostrar 2 o 3 botones por fila
                var buttonWidth = (screenWidth - 40) / maxButtons;
                buttons.forEach(function(btn) {
                    // Establecer ancho fijo para cada botón
                    btn.style.width = (buttonWidth - 10) + 'px';
                    btn.style.margin = '3px';
                    
                    // Ajustar texto para que quepa mejor
                    var text = btn.textContent;
                    if (text.includes("Platillos")) {
                        btn.textContent = text.replace("Platillos", "Plat.");
                    }
                    if (text.includes("Entradas")) {
                        btn.textContent = text.replace("Entradas", "Ent.");
                    }
                });
            }
            
            console.log("Interfaz móvil adaptada correctamente");
        } catch (e) {
            console.error("Error al adaptar interfaz móvil:", e);
        }
    },
    
    // Activar consola de depuración para móviles
    enableMobileDebugging: function() {
        try {
            // Verificar si estamos en un dispositivo móvil
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                console.log("Dispositivo móvil detectado, activando consola de depuración...");
                
                // Crear elemento script para cargar eruda
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/eruda';
                script.onload = function() {
                    // Una vez cargado, iniciar eruda
                    if (typeof eruda !== 'undefined') {
                        eruda.init();
                        console.log("Consola de depuración móvil activada");
                    }
                };
                script.onerror = function() {
                    console.error("No se pudo cargar la consola de depuración móvil");
                };
                
                // Agregar script al documento
                document.head.appendChild(script);
            }
        } catch (e) {
            console.error("Error al activar depuración móvil:", e);
        }
    }
};