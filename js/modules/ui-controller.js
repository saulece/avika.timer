// ui-controller.js - Funciones de interfaz de usuario con soporte para subcategorías
window.Avika = window.Avika || {};

// Módulo de utilidades centralizado para funciones compartidas
Avika.utils = Avika.utils || {
    // Constantes de tiempo para toda la aplicación
    TIME_CONSTANTS: {
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

            // Si el platillo ya está marcado como listo en barra, deshabilitar el botón
            if (order.barFinished) {
                repartoBtn.textContent = 'Listo ✓';
                repartoBtn.disabled = true;
                repartoBtn.style.backgroundColor = '#cccccc'; // Color gris para indicar inactividad
                repartoBtn.style.cursor = 'not-allowed';
            } else {
                repartoBtn.textContent = 'Reparto';
                repartoBtn.onclick = function() { Avika.orders.finishDeliveryFromBar(order.id); };
            }

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
        var container = document.getElementById('personalization-options');
        container.innerHTML = '';
        
        if (Avika.data.currentCategory === 'combos') {
            document.getElementById('personalization-section').style.display = 'none';
            return;
        }
        
        document.getElementById('personalization-section').style.display = 'block';
        
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
    // MODIFICADO: Actualizar tabla de órdenes completadas para mostrar detalles correctamente en móviles
    updateCompletedTable: function(showAll) {
        var completedBody = document.getElementById('completed-body');
        completedBody.innerHTML = '';
        
        // Detectar si estamos en un dispositivo móvil
        var isMobile = window.innerWidth <= 768;
        
        // Actualizar también el encabezado de la tabla para mostrar columnas adecuadas según dispositivo
        var completedHeader = document.getElementById('completed-header');
        if (completedHeader) {
            if (isMobile) {
                // Versión simplificada para móviles
                completedHeader.innerHTML = `
                    <tr>
                        <th style="width: 50%">Platillo</th>
                        <th style="width: 50%">Fin</th>
                    </tr>
                `;
            } else {
                // Versión completa para escritorio
                completedHeader.innerHTML = `
                    <tr>
                        <th style="width: 20%">Platillo</th>
                        <th style="width: 15%">Inicio</th>
                        <th style="width: 15%">Fin</th>
                        <th style="width: 50%">Detalles</th>
                    </tr>
                `;
            }
        }
        
        var displayOrders = showAll ? Avika.data.completedOrders : Avika.data.completedOrders.slice(0, 5);
        
        // Agrupar órdenes por ticketId
        var ticketGroups = {};
        var individualOrders = [];
        
        // Primero, separar órdenes por ticket
        for (var i = 0; i < displayOrders.length; i++) {
            var order = displayOrders[i];
            if (order.ticketId) {
                if (!ticketGroups[order.ticketId]) {
                    ticketGroups[order.ticketId] = {
                        orders: [],
                        serviceType: order.serviceType
                    };
                }
                ticketGroups[order.ticketId].orders.push(order);
            } else {
                individualOrders.push(order);
            }
        }
        
        // Función para aplicar estilos a las filas de un ticket
        function applyTicketStyles(rows, ticketId, serviceType) {
            var ticketColor = '';
            
            // Asignar color según tipo de servicio
            if (serviceType === 'comedor') {
                ticketColor = '#f0f8ff'; // Azul claro para comedor
            } else if (serviceType === 'domicilio') {
                ticketColor = '#fff0f0'; // Rojo claro para domicilio
            } else if (serviceType === 'para-llevar') {
                ticketColor = '#f0fff0'; // Verde claro para llevar
            } else {
                ticketColor = '#f5f5f5'; // Gris claro para otros
            }
            
            // Aplicar estilos a cada fila
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                row.style.backgroundColor = ticketColor;
                
                // Primera fila del ticket
                if (i === 0) {
                    row.classList.add('ticket-first-row');
                    
                    // Añadir información del ticket en la primera fila
                    var firstCell = row.cells[0];
                    var ticketLabel = document.createElement('div');
                    ticketLabel.className = 'ticket-label';
                    ticketLabel.textContent = 'Ticket #' + ticketId.substring(ticketId.length - 5);
                    ticketLabel.style.fontSize = '0.8em';
                    ticketLabel.style.fontWeight = 'bold';
                    ticketLabel.style.marginBottom = '3px';
                    ticketLabel.style.color = '#555';
                    
                    // Insertar el label al principio de la celda
                    if (firstCell.firstChild) {
                        firstCell.insertBefore(ticketLabel, firstCell.firstChild);
                    } else {
                        firstCell.appendChild(ticketLabel);
                    }
                }
                
                // Última fila del ticket
                if (i === rows.length - 1) {
                    row.classList.add('ticket-last-row');
                    row.style.borderBottom = '2px solid #999';
                }
                
                // Añadir borde izquierdo a todas las filas del ticket
                row.style.borderLeft = '3px solid #999';
            }
        }
        
        // Añadir órdenes agrupadas por ticket
        for (var ticketId in ticketGroups) {
            var ticketRows = [];
            var group = ticketGroups[ticketId];
            
            // Crear filas para cada orden del ticket
            for (var i = 0; i < group.orders.length; i++) {
                var order = group.orders[i];
                var row = this.createCompletedRow(order);
                completedBody.appendChild(row);
                ticketRows.push(row);
            }
            
            // Aplicar estilos a las filas del ticket
            applyTicketStyles(ticketRows, ticketId, group.serviceType);
        }
        
        // Añadir órdenes individuales
        for (var i = 0; i < individualOrders.length; i++) {
            var row = this.createCompletedRow(individualOrders[i]);
            completedBody.appendChild(row);
            
            // Estilo para órdenes individuales
            row.style.backgroundColor = '#ffffff'; // Blanco para órdenes individuales
        }
        
        // Añadir botón para limpiar historial si hay pedidos completados
        if (Avika.data.completedOrders.length > 0) {
            var clearHistoryContainer = document.getElementById('clear-history-container');
            if (!clearHistoryContainer) {
                clearHistoryContainer = document.createElement('div');
                clearHistoryContainer.id = 'clear-history-container';
                clearHistoryContainer.style.textAlign = 'center';
                clearHistoryContainer.style.margin = '10px 0';
                
                var completedTable = document.getElementById('completed-table');
                if (completedTable) {
                    completedTable.parentNode.insertBefore(clearHistoryContainer, completedTable.nextSibling);
                }
            }
            
            clearHistoryContainer.innerHTML = '';
            var clearBtn = document.createElement('button');
            clearBtn.className = 'action-btn cancel-btn';
            clearBtn.textContent = 'Limpiar Historial';
            clearBtn.onclick = function() {
                if (confirm('¿Está seguro que desea limpiar el historial de platillos terminados?')) {
                    Avika.orders.clearCompletedOrders();
                    
                    // Ocultar el botón después de limpiar
                    document.getElementById('clear-history-container').style.display = 'none';
                }
            };
            
            clearHistoryContainer.appendChild(clearBtn);
        }
    },

    // Función para crear fila para un platillo completado
    createCompletedRow: function(order) {
        var row = document.createElement('tr');
        var isMobile = window.innerWidth <= 768;
        
        // Celda del platillo con información adicional en móviles
        var dishCell = document.createElement('td');
        if (isMobile) {
            // En móviles, incluimos más información en la celda del platillo
            var dishInfo = document.createElement('div');
            dishInfo.style.fontWeight = 'bold';
            dishInfo.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
            dishCell.appendChild(dishInfo);
            
            // Añadir información adicional en líneas separadas
            var extraInfo = document.createElement('div');
            extraInfo.style.fontSize = '0.8em';
            extraInfo.style.color = '#555';
            
            var infoText = '';
            
            // Añadir información de servicio y ticket
            if (order.serviceType) {
                infoText += Avika.config.serviceNames[order.serviceType] || order.serviceType;
            }
            
            if (order.ticketId) {
                infoText += ' | #' + order.ticketId.substring(order.ticketId.length - 5);
            }
            
            if (order.category) {
                infoText += ' | ' + (Avika.config.categoryNames[order.category] || order.category);
            }
            
            extraInfo.textContent = infoText;
            dishCell.appendChild(extraInfo);
            
            // Si hay personalizaciones, añadirlas en otra línea
            if (order.customizations && order.customizations.length > 0) {
                var customInfo = document.createElement('div');
                customInfo.style.fontSize = '0.8em';
                customInfo.style.color = '#555';
                customInfo.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                dishCell.appendChild(customInfo);
            }
            
            // Si hay notas, añadirlas en otra línea
            if (order.notes) {
                var notesInfo = document.createElement('div');
                notesInfo.style.fontSize = '0.8em';
                notesInfo.style.fontStyle = 'italic';
                notesInfo.style.color = '#555';
                notesInfo.textContent = 'Notas: ' + order.notes;
                dishCell.appendChild(notesInfo);
            }
        } else {
            // En escritorio, mejor formato para el nombre del platillo
            dishCell.className = 'dish-cell';
            
            // Nombre del platillo con mejor formato
            var dishNameDiv = document.createElement('div');
            dishNameDiv.className = 'dish-name';
            
            // Si hay cantidad mayor a 1, mostrarla
            if (order.quantity > 1) {
                var quantitySpan = document.createElement('span');
                quantitySpan.className = 'dish-quantity';
                quantitySpan.textContent = order.quantity + 'x ';
                dishNameDiv.appendChild(quantitySpan);
            }
            
            // Agregar el nombre del platillo
            dishNameDiv.appendChild(document.createTextNode(order.dish));
            dishCell.appendChild(dishNameDiv);
            
            // Si es parte de un ticket, mostrar el ID del ticket
            if (order.ticketId) {
                var ticketIdDiv = document.createElement('div');
                ticketIdDiv.className = 'ticket-id';
                ticketIdDiv.textContent = 'Ticket #' + order.ticketId.substring(order.ticketId.length - 5);
                dishCell.appendChild(ticketIdDiv);
            }
        }
        row.appendChild(dishCell);
        
        // En móviles, solo mostramos la celda de fin
        // En escritorio, mostramos todas las celdas
        if (!isMobile) {
            // Celda de inicio (solo en escritorio)
            var startCell = document.createElement('td');
            startCell.textContent = order.startTimeFormatted || '--:--:--';
            row.appendChild(startCell);
        }
        
        // Celda de fin (siempre visible)
        var endCell = document.createElement('td');
        if (isMobile) {
            // En móviles, añadir información de entrega si existe
            var endTimeDiv = document.createElement('div');
            endTimeDiv.style.fontWeight = 'bold';
            endTimeDiv.textContent = order.endTimeFormatted || order.finishTimeFormatted || '--:--:--';
            endCell.appendChild(endTimeDiv);
            
            if (order.deliveryDepartureTimeFormatted || order.deliveryArrivalTimeFormatted) {
                var deliveryInfo = document.createElement('div');
                deliveryInfo.style.fontSize = '0.8em';
                deliveryInfo.style.color = '#555';
                
                var deliveryText = '';
                
                if (order.deliveryDepartureTimeFormatted) {
                    deliveryText += 'Salida: ' + order.deliveryDepartureTimeFormatted;
                }
                
                if (order.deliveryArrivalTimeFormatted) {
                    if (deliveryText) deliveryText += ' | ';
                    deliveryText += 'Entrega: ' + order.deliveryArrivalTimeFormatted;
                }
                
                deliveryInfo.textContent = deliveryText;
                endCell.appendChild(deliveryInfo);
            }
        } else {
            // En escritorio, solo la hora de fin
            endCell.textContent = order.endTimeFormatted || order.finishTimeFormatted || '--:--:--';
        }
        row.appendChild(endCell);
        
        if (!isMobile) {
            // Celda de detalles (solo en escritorio)
            var detailsCell = document.createElement('td');
            detailsCell.className = 'details-container';
            
            // Tipo de servicio
            if (order.serviceType) {
                var serviceDiv = document.createElement('div');
                serviceDiv.className = 'service-type';
                serviceDiv.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
                if (order.isSpecialCombo) {
                    serviceDiv.textContent += ' (Combo Especial)';
                }
                detailsCell.appendChild(serviceDiv);
            }
            
            // Categoría
            if (order.category) {
                var categoryDiv = document.createElement('div');
                categoryDiv.className = 'dish-category';
                categoryDiv.textContent = Avika.config.categoryNames[order.category] || order.category;
                detailsCell.appendChild(categoryDiv);
            }
            
            // Personalizaciones
            if (order.customizations && order.customizations.length > 0) {
                var customDiv = document.createElement('div');
                customDiv.className = 'dish-customization';
                customDiv.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                detailsCell.appendChild(customDiv);
            }
            
            // Notas
            if (order.notes && order.notes.trim() !== '') {
                var notesDiv = document.createElement('div');
                notesDiv.className = 'order-notes';
                notesDiv.textContent = order.notes;
                detailsCell.appendChild(notesDiv);
            }
            
            // Información de entrega
            if (order.deliveryDepartureTimeFormatted || order.deliveryArrivalTimeFormatted) {
                var deliveryDiv = document.createElement('div');
                deliveryDiv.className = 'dish-details';
                var deliveryText = '';
                
                if (order.deliveryDepartureTimeFormatted) {
                    deliveryText += 'Salida: ' + order.deliveryDepartureTimeFormatted;
                }
                
                if (order.deliveryArrivalTimeFormatted) {
                    if (deliveryText) deliveryText += ' | ';
                    deliveryText += 'Entrega: ' + order.deliveryArrivalTimeFormatted;
                }
                
                if (order.deliveryTimeFormatted) {
                    if (deliveryText) deliveryText += ' | ';
                    deliveryText += 'Tiempo: ' + order.deliveryTimeFormatted;
                }
                
                deliveryDiv.textContent = deliveryText;
                detailsCell.appendChild(deliveryDiv);
            }
            
            // Si no hay detalles, mostrar un mensaje
            if (detailsCell.children.length === 0) {
                var noDetailsDiv = document.createElement('div');
                noDetailsDiv.className = 'dish-details';
                noDetailsDiv.textContent = 'Sin detalles';
                detailsCell.appendChild(noDetailsDiv);
            }
            
            row.appendChild(detailsCell);
        }
        
        return row;
    },
    // Función para filtrar platillos en el modal de tickets
    filterTicketDishes: function(searchText) {
        var buttons = document.querySelectorAll('#dishes-selection-container .dish-btn');
        var found = false;
        
        buttons.forEach(function(button) {
            var dishName = button.textContent.toLowerCase();
            if (dishName.includes(searchText)) {
                button.style.display = '';
                found = true;
            } else {
                button.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no se encuentran platillos
        var noResultsMsg = document.getElementById('ticket-no-results-message');
        if (!found) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.id = 'ticket-no-results-message';
                noResultsMsg.textContent = 'No se encontraron platillos que coincidan con la búsqueda.';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.style.color = '#888';
                
                var container = document.getElementById('dishes-selection-container');
                if (container) {
                    container.parentNode.insertBefore(noResultsMsg, container.nextSibling);
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },
    // Actualizar tabla de órdenes pendientes
    updatePendingTable: function() {
        var pendingBody = document.getElementById('pending-body');
        pendingBody.innerHTML = '';
        
        // Agrupar órdenes por ticketId
        var ticketGroups = {};
        var individualOrders = [];
        
        // Primero, separar órdenes por ticket
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order.ticketId) {
                if (!ticketGroups[order.ticketId]) {
                    ticketGroups[order.ticketId] = {
                        orders: [],
                        serviceType: order.serviceType
                    };
                }
                ticketGroups[order.ticketId].orders.push(order);
            } else {
                individualOrders.push(order);
            }
        }
        
        // Función para aplicar estilos a las filas de un ticket
        function applyTicketStyles(rows, ticketId, serviceType) {
            var ticketColor = '';
            
            // Asignar color según tipo de servicio
            if (serviceType === 'comedor') {
                ticketColor = '#f0f8ff'; // Azul claro para comedor
            } else if (serviceType === 'domicilio') {
                ticketColor = '#fff0f0'; // Rojo claro para domicilio
            } else if (serviceType === 'para-llevar') {
                ticketColor = '#f0fff0'; // Verde claro para llevar
            } else {
                ticketColor = '#f5f5f5'; // Gris claro para otros
            }
            
            // Aplicar estilos a cada fila
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                row.style.backgroundColor = ticketColor;
                
                // Primera fila del ticket
                if (i === 0) {
                    row.classList.add('ticket-first-row');
                    
                    // Añadir información del ticket en la primera fila
                    var firstCell = row.cells[0];
                    var ticketLabel = document.createElement('div');
                    ticketLabel.className = 'ticket-label';
                    ticketLabel.textContent = 'Ticket #' + ticketId.substring(ticketId.length - 5);
                    ticketLabel.style.fontSize = '0.8em';
                    ticketLabel.style.fontWeight = 'bold';
                    ticketLabel.style.marginBottom = '3px';
                    ticketLabel.style.color = '#555';
                    
                    // Insertar el label al principio de la celda
                    if (firstCell.firstChild) {
                        firstCell.insertBefore(ticketLabel, firstCell.firstChild);
                    } else {
                        firstCell.appendChild(ticketLabel);
                    }
                }
                
                // Última fila del ticket
                if (i === rows.length - 1) {
                    row.classList.add('ticket-last-row');
                    row.style.borderBottom = '2px solid #999';
                }
                
                // Añadir borde izquierdo a todas las filas del ticket
                row.style.borderLeft = '3px solid #999';
            }
        }
        
        // Añadir órdenes agrupadas por ticket
        for (var ticketId in ticketGroups) {
            var ticketRows = [];
            var group = ticketGroups[ticketId];
            
            // Crear filas para cada orden del ticket
            for (var i = 0; i < group.orders.length; i++) {
                var order = group.orders[i];
                var row = this.createOrderRow(order);
                pendingBody.appendChild(row);
                ticketRows.push(row);
            }
            
            // Aplicar estilos a las filas del ticket
            applyTicketStyles(ticketRows, ticketId, group.serviceType);
        }
        
        // Añadir órdenes individuales
        for (var i = 0; i < individualOrders.length; i++) {
            var row = this.createOrderRow(individualOrders[i]);
            pendingBody.appendChild(row);
            
            // Estilo para órdenes individuales
            row.style.backgroundColor = '#ffffff'; // Blanco para órdenes individuales
        }
        
        // Actualizar contador de órdenes pendientes
        var pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = Avika.data.pendingOrders.length;
        }

        this.applyStylesToAllTickets();
    },
    // Actualizar tabla de órdenes en reparto
    updateDeliveryTable: function() {
        // Actualizar contador primero
        document.getElementById('delivery-count').textContent = Avika.data.deliveryOrders.length;
        
        var deliveryBody = document.getElementById('delivery-body');
        
        // Si no hay órdenes en reparto, limpiamos la tabla
        if (Avika.data.deliveryOrders.length === 0) {
            deliveryBody.innerHTML = '';
            return;
        }
        
        // Reconstruir la tabla completamente
        deliveryBody.innerHTML = '';
        
        // Agrupar órdenes por ticketId
        var ticketGroups = {};
        var individualOrders = [];
        
        // Primero, separar órdenes por ticket
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            var order = Avika.data.deliveryOrders[i];
            if (order.ticketId) {
                if (!ticketGroups[order.ticketId]) {
                    ticketGroups[order.ticketId] = {
                        orders: [],
                        serviceType: order.serviceType
                    };
                }
                ticketGroups[order.ticketId].orders.push(order);
            } else {
                individualOrders.push(order);
            }
        }
        
        // Función para aplicar estilos a las filas de un ticket
        function applyTicketStyles(rows, ticketId, serviceType) {
            var ticketColor = '';
            
            // Asignar color según tipo de servicio
            if (serviceType === 'comedor') {
                ticketColor = '#f0f8ff'; // Azul claro para comedor
            } else if (serviceType === 'domicilio') {
                ticketColor = '#fff0f0'; // Rojo claro para domicilio
            } else if (serviceType === 'para-llevar') {
                ticketColor = '#f0fff0'; // Verde claro para llevar
            } else {
                ticketColor = '#f5f5f5'; // Gris claro para otros
            }
            
            // Aplicar estilos a cada fila
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                row.style.backgroundColor = ticketColor;
                
                // Primera fila del ticket
                if (i === 0) {
                    row.classList.add('ticket-first-row');
                    
                    // Añadir información del ticket en la primera fila
                    var firstCell = row.cells[0];
                    var ticketLabel = document.createElement('div');
                    ticketLabel.className = 'ticket-label';
                    ticketLabel.textContent = 'Ticket #' + ticketId.substring(ticketId.length - 5);
                    ticketLabel.style.fontSize = '0.8em';
                    ticketLabel.style.fontWeight = 'bold';
                    ticketLabel.style.marginBottom = '3px';
                    ticketLabel.style.color = '#555';
                    
                    // Insertar el label al principio de la celda
                    if (firstCell.firstChild) {
                        firstCell.insertBefore(ticketLabel, firstCell.firstChild);
                    } else {
                        firstCell.appendChild(ticketLabel);
                    }
                }
                
                // Última fila del ticket
                if (i === rows.length - 1) {
                    row.classList.add('ticket-last-row');
                    row.style.borderBottom = '2px solid #999';
                }
                
                // Añadir borde izquierdo a todas las filas del ticket
                row.style.borderLeft = '3px solid #999';
            }
        }
        
        // Añadir órdenes agrupadas por ticket
        for (var ticketId in ticketGroups) {
            var ticketRows = [];
            var group = ticketGroups[ticketId];
            
            // Crear filas para cada orden del ticket
            for (var i = 0; i < group.orders.length; i++) {
                var order = group.orders[i];
                var row = this.createDeliveryRow(order);
                deliveryBody.appendChild(row);
                ticketRows.push(row);
            }
            
            // Aplicar estilos a las filas del ticket
            applyTicketStyles(ticketRows, ticketId, group.serviceType);
        }
        
        // Añadir órdenes individuales
        for (var i = 0; i < individualOrders.length; i++) {
            var row = this.createDeliveryRow(individualOrders[i]);
            deliveryBody.appendChild(row);
            
            // Estilo para órdenes individuales
            row.style.backgroundColor = '#ffffff'; // Blanco para órdenes individuales
        }

        this.applyStylesToAllTickets();
    },
    
    // Crear fila para una orden en reparto
    createDeliveryRow: function(order) {
        var row = document.createElement('tr');
        var isMobile = window.innerWidth <= 768;
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.className = 'dish-cell';
        
        // Nombre del platillo con mejor formato
        var dishNameDiv = document.createElement('div');
        dishNameDiv.className = 'dish-name';
        
        // Si hay cantidad mayor a 1, mostrarla
        if (order.quantity > 1) {
            var quantitySpan = document.createElement('span');
            quantitySpan.className = 'dish-quantity';
            quantitySpan.textContent = order.quantity + 'x ';
            dishNameDiv.appendChild(quantitySpan);
        }
        
        // Agregar el nombre del platillo
        dishNameDiv.appendChild(document.createTextNode(order.dish));
        dishCell.appendChild(dishNameDiv);
        
        // Si es parte de un ticket, mostrar el ID del ticket
        if (order.ticketId) {
            var ticketIdDiv = document.createElement('div');
            ticketIdDiv.className = 'ticket-id';
            ticketIdDiv.textContent = 'Ticket #' + order.ticketId.substring(order.ticketId.length - 5);
            dishCell.appendChild(ticketIdDiv);
        }
        
        // Categoría del platillo si está disponible
        if (order.category) {
            var categoryDiv = document.createElement('div');
            categoryDiv.className = 'dish-category';
            categoryDiv.textContent = Avika.config.categoryNames[order.category] || order.category;
            dishCell.appendChild(categoryDiv);
        }
        
        // Mostrar las notas directamente en la columna del platillo con estilo destacado
        if (order.notes && order.notes.trim() !== '') {
            var notesDiv = document.createElement('div');
            notesDiv.className = 'order-notes-highlight';
            notesDiv.style.fontStyle = 'italic';
            notesDiv.style.color = '#e67e22';
            notesDiv.style.fontWeight = 'bold';
            notesDiv.style.marginTop = '5px';
            notesDiv.style.padding = '3px';
            notesDiv.style.borderLeft = '3px solid #e67e22';
            notesDiv.textContent = '✏️ ' + order.notes;
            dishCell.appendChild(notesDiv);
        }
        
        // Si hay notas del ticket, también mostrarlas
        if (order.ticketNotes && order.ticketNotes.trim() !== '') {
            var ticketNotesDiv = document.createElement('div');
            ticketNotesDiv.className = 'ticket-notes-highlight';
            ticketNotesDiv.style.fontStyle = 'italic';
            ticketNotesDiv.style.color = '#3498db';
            ticketNotesDiv.style.fontWeight = 'bold';
            ticketNotesDiv.style.marginTop = '5px';
            ticketNotesDiv.style.padding = '3px';
            ticketNotesDiv.style.borderLeft = '3px solid #3498db';
            ticketNotesDiv.textContent = '🎫 ' + order.ticketNotes;
            dishCell.appendChild(ticketNotesDiv);
        }
        
        // En móviles, añadir información de servicio en la celda del platillo
        if (isMobile) {
            // Tipo de servicio
            var serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-type';
            serviceDiv.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
            dishCell.appendChild(serviceDiv);
            
            // Personalizaciones
            if (order.customizations && order.customizations.length > 0) {
                var customDiv = document.createElement('div');
                customDiv.className = 'dish-customization';
                customDiv.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                dishCell.appendChild(customDiv);
            }
            
            // Notas
            if (order.notes && order.notes.trim() !== '') {
                var notesDiv = document.createElement('div');
                notesDiv.className = 'order-notes';
                notesDiv.textContent = order.notes;
                dishCell.appendChild(notesDiv);
            }
        }
        
        row.appendChild(dishCell);
        
        // Celda de hora de salida (o estado "Listo para salida")
        var departureCell = document.createElement('td');
        departureCell.className = 'mobile-hide-sm';
        if (order.deliveryDepartureTime) {
            departureCell.textContent = order.deliveryDepartureTimeFormatted || '--:--:--';
        } else {
            departureCell.innerHTML = '<span style="color: #f39c12;">Listo para salida</span>';
        }
        row.appendChild(departureCell);
        
        // Celda de tiempo en reparto o tiempo desde que está listo
        var timerCell = document.createElement('td');
        if (order.deliveryDepartureTime) {
            // Si ya salió para entrega, mostrar tiempo desde la salida
            timerCell.className = 'delivery-timer';
            timerCell.setAttribute('data-departure-time', order.deliveryDepartureTime);
        } else if (order.finishTime) {
            // Si está listo pero aún no ha salido, mostrar tiempo desde que está listo
            timerCell.className = 'ready-timer';
            timerCell.setAttribute('data-ready-time', order.finishTime);
        } else {
            // Caso de respaldo (no debería ocurrir)
            timerCell.className = 'ready-timer';
            timerCell.setAttribute('data-ready-time', new Date().toISOString());
        }
        timerCell.setAttribute('data-id', order.id);
        timerCell.textContent = '00:00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        detailsCell.className = 'details-container';
        
        // Tipo de servicio
        var serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-type';
        serviceDiv.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
        detailsCell.appendChild(serviceDiv);
        
        // Personalizaciones
        if (order.customizations && order.customizations.length > 0) {
            var customDiv = document.createElement('div');
            customDiv.className = 'dish-customization';
            customDiv.textContent = order.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
            detailsCell.appendChild(customDiv);
        }
        
        // Notas
        if (order.notes && order.notes.trim() !== '') {
            var notesDiv = document.createElement('div');
            notesDiv.className = 'order-notes';
            notesDiv.textContent = order.notes;
            detailsCell.appendChild(notesDiv);
        }
        
        // Notas del ticket en la columna de detalles
        if (order.ticketNotes && order.ticketNotes.trim() !== '') {
            var ticketNotesDiv = document.createElement('div');
            ticketNotesDiv.className = 'ticket-notes';
            ticketNotesDiv.textContent = 'Ticket: ' + order.ticketNotes;
            detailsCell.appendChild(ticketNotesDiv);
        }
        
        row.appendChild(detailsCell);

        // Celda de acción
        var actionCell = document.createElement('td');

        // Determinar qué botón mostrar según el estado
        if (order.deliveryDepartureTime) {
            // Si ya se registró la salida, mostrar botón "Registrar Entrega"
            var arrivalBtn = document.createElement('button');
            arrivalBtn.className = 'action-btn arrival-btn';
            arrivalBtn.textContent = 'Registrar Entrega';
            arrivalBtn.onclick = function() {
                Avika.orders.markDeliveryArrival(order.id);
            };
            actionCell.appendChild(arrivalBtn);
        } else {
            // Si aún no se ha registrado la salida, mostrar botón "Registrar Salida"
            var departureBtn = document.createElement('button');
            departureBtn.className = 'action-btn departure-btn';
            departureBtn.textContent = 'Registrar Salida';
            departureBtn.onclick = function() {
                Avika.orders.markDeliveryDeparture(order.id);
            };
            actionCell.appendChild(departureBtn);
        }

        row.appendChild(actionCell);
        return row;
    },
    createOrderRow: function(order) {
        var row = document.createElement('tr');
        var isMobile = window.innerWidth <= 768;
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.className = 'dish-cell';
        
        // Nombre del platillo con mejor formato
        var dishNameDiv = document.createElement('div');
        dishNameDiv.className = 'dish-name';
        
        // Si hay cantidad mayor a 1, mostrarla
        if (order.quantity > 1) {
            var quantitySpan = document.createElement('span');
            quantitySpan.className = 'dish-quantity';
            quantitySpan.textContent = order.quantity + 'x ';
            dishNameDiv.appendChild(quantitySpan);
        }
        
        // Agregar el nombre del platillo
        dishNameDiv.appendChild(document.createTextNode(order.dish));
        dishCell.appendChild(dishNameDiv);
        
        // Mostrar las notas directamente en la columna del platillo con estilo destacado
        if (order.notes && order.notes.trim() !== '') {
            var notesDiv = document.createElement('div');
            notesDiv.className = 'order-notes-highlight';
            notesDiv.style.fontStyle = 'italic';
            notesDiv.style.color = '#e67e22';
            notesDiv.style.fontWeight = 'bold';
            notesDiv.style.marginTop = '5px';
            notesDiv.style.padding = '3px';
            notesDiv.style.borderLeft = '3px solid #e67e22';
            notesDiv.textContent = '✏️ ' + order.notes;
            dishCell.appendChild(notesDiv);
        }
        
        // Si hay notas del ticket, también mostrarlas
        if (order.ticketNotes && order.ticketNotes.trim() !== '') {
            var ticketNotesDiv = document.createElement('div');
            ticketNotesDiv.className = 'ticket-notes-highlight';
            ticketNotesDiv.style.fontStyle = 'italic';
            ticketNotesDiv.style.color = '#3498db';
            ticketNotesDiv.style.fontWeight = 'bold';
            ticketNotesDiv.style.marginTop = '5px';
            ticketNotesDiv.style.padding = '3px';
            ticketNotesDiv.style.borderLeft = '3px solid #3498db';
            ticketNotesDiv.textContent = '🎫 ' + order.ticketNotes;
            dishCell.appendChild(ticketNotesDiv);
        }
        
        // En móviles, añadir información de servicio en la celda del platillo
        if (isMobile) {
            var serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-type';
            serviceDiv.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
            dishCell.appendChild(serviceDiv);
            
            // Personalizaciones
            if (order.customizations && order.customizations.length > 0) {
                var customDiv = document.createElement('div');
                customDiv.className = 'dish-customization';
                customDiv.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                dishCell.appendChild(customDiv);
            }
            
            // Notas
            if (order.notes && order.notes.trim() !== '') {
                var notesDiv = document.createElement('div');
                notesDiv.className = 'order-notes';
                notesDiv.textContent = order.notes;
                dishCell.appendChild(notesDiv);
            }
        }
        
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.className = 'mobile-hide-sm';
        startCell.textContent = order.startTimeFormatted;
        row.appendChild(startCell);
        
        // Celda de temporizador
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        timerCell.setAttribute('data-id', order.id);
        timerCell.textContent = '00:00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        detailsCell.className = 'details-container';
        
        // Tipo de servicio
        var serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-type';
        serviceDiv.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
        detailsCell.appendChild(serviceDiv);
        
        // Personalizaciones
        if (order.customizations && order.customizations.length > 0) {
            var customDiv = document.createElement('div');
            customDiv.className = 'dish-customization';
            customDiv.textContent = order.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
            detailsCell.appendChild(customDiv);
        }
        
        // Notas
        if (order.notes && order.notes.trim() !== '') {
            var notesDiv = document.createElement('div');
            notesDiv.className = 'order-notes';
            notesDiv.textContent = order.notes;
            detailsCell.appendChild(notesDiv);
        }
        
        // Notas del ticket en la columna de detalles
        if (order.ticketNotes && order.ticketNotes.trim() !== '') {
            var ticketNotesDiv = document.createElement('div');
            ticketNotesDiv.className = 'ticket-notes';
            ticketNotesDiv.textContent = 'Ticket: ' + order.ticketNotes;
            detailsCell.appendChild(ticketNotesDiv);
        }
        
        row.appendChild(detailsCell);
        
        // Celda de acciones
        var actionsCell = document.createElement('td');
        
        // Si es un combo especial, mostrar botones para cada cocina
        if (order.isSpecialCombo) {
            // Crear un contenedor para los botones de cocina
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            var hotKitchenBtn = document.createElement('button');
            hotKitchenBtn.className = 'action-btn kitchen-btn' + (order.hotKitchenFinished ? ' disabled' : '');
            hotKitchenBtn.textContent = order.hotKitchenFinished ? 'Cocina Cal. ✓' : 'Cocina Cal.';
            hotKitchenBtn.disabled = order.hotKitchenFinished;
            hotKitchenBtn.style.backgroundColor = '#ff5252'; // Color rojo para cocina caliente
            hotKitchenBtn.onclick = function() {
                Avika.orders.finishHotKitchen(order.id);
            };
            buttonGroup.appendChild(hotKitchenBtn);
            
            var coldKitchenBtn = document.createElement('button');
            coldKitchenBtn.className = 'action-btn kitchen-btn' + (order.coldKitchenFinished ? ' disabled' : '');
            coldKitchenBtn.textContent = order.coldKitchenFinished ? 'Cocina Fría ✓' : 'Cocina Fría';
            coldKitchenBtn.disabled = order.coldKitchenFinished;
            coldKitchenBtn.style.backgroundColor = '#4caf50'; // Color verde para cocina fría
            coldKitchenBtn.onclick = function() {
                Avika.orders.finishColdKitchen(order.id);
            };
            buttonGroup.appendChild(coldKitchenBtn);
            
            actionsCell.appendChild(buttonGroup);
            // Si ambas cocinas están listas y es a domicilio, verificar si todos los platillos del ticket están terminados
            if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
                // Solo mostrar el botón de salida si este platillo pertenece a un ticket donde todos los platillos están terminados
                if (order.ticketId) {
                    // Primero verificar si todos los platillos del ticket están terminados
                    var allTicketItemsFinished = true;
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                                allTicketItemsFinished = false;
                                break;
                            } else if (!item.isSpecialCombo && !item.finished) {
                                allTicketItemsFinished = false;
                                break;
                            }
                        }
                    }
                    
                    // Solo mostrar botón de salida si todos los platillos están terminados
                    if (allTicketItemsFinished && !order.deliveryDepartureTime) {
                        var departureBtn = document.createElement('button');
                        departureBtn.className = 'action-btn departure-btn';
                        departureBtn.textContent = 'Registrar Salida';
                        departureBtn.onclick = function() {
                            Avika.orders.markDeliveryDeparture(order.id);
                        };
                        actionsCell.appendChild(departureBtn);
                    }
                    // Si ya se registró la salida pero no la entrega
                    else if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                        var arrivalBtn = document.createElement('button');
                        arrivalBtn.className = 'action-btn arrival-btn';
                        arrivalBtn.textContent = 'Registrar Entrega';
                        arrivalBtn.onclick = function() {
                            Avika.orders.markDeliveryArrival(order.id);
                        };
                        actionsCell.appendChild(arrivalBtn);
                    }
                }
                else if (!order.kitchenFinished) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                    actionsCell.appendChild(departureBtn);
                }
            }
        } 
        // Si es a domicilio, mostrar botón de "Listo" y luego "Registrar Salida"
        else if (order.serviceType === 'domicilio' || order.serviceType === 'para-llevar') {
            // Si es parte de un ticket
            if (order.ticketId) {
                // Verificar si todos los platillos del ticket están terminados
                var allTicketItemsFinished = true;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                            allTicketItemsFinished = false;
                            break;
                        } else if (!item.isSpecialCombo && !item.finished) {
                            allTicketItemsFinished = false;
                            break;
                        }
                    }
                }
                // Si este platillo no está terminado, mostrar botón "Listo"
                if (!order.finished) {
                    var doneBtn = document.createElement('button');
                    doneBtn.className = 'action-btn';
                    doneBtn.textContent = 'Listo';
                    
                    // Si es parte de un ticket, usar finishIndividualItem en lugar de finishPreparation
                    if (order.ticketId) {
                        doneBtn.onclick = function() {
                            Avika.orders.finishIndividualItem(order.id);
                        };
                    } else {
                        doneBtn.onclick = function() {
                            Avika.orders.finishPreparation(order.id);
                        };
                    }
                    
                    actionsCell.appendChild(doneBtn);
                }
                // Si todos los platillos del ticket están terminados, mostrar "Registrar Salida"
                else if (allTicketItemsFinished && !order.deliveryDepartureTime) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                    actionsCell.appendChild(departureBtn);
                }
                // Si ya se registró la salida pero no la entrega
                else if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                    var arrivalBtn = document.createElement('button');
                    arrivalBtn.className = 'action-btn arrival-btn';
                    arrivalBtn.textContent = 'Registrar Entrega';
                    arrivalBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(order.id);
                    };
                    actionsCell.appendChild(arrivalBtn);
                }
                // Platillo terminado pero esperando que otros platillos del ticket estén listos
                else if (order.finished && !allTicketItemsFinished) {
                    var statusText = document.createElement('span');
                    statusText.className = 'status-text';
                    statusText.textContent = 'Esperando otros platillos';
                    actionsCell.appendChild(statusText);
                }
            }
            // Platillo individual (sin ticket)
            else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                
                // Mostrar el botón adecuado según el estado
                if (!order.kitchenFinished) {
                    doneBtn.textContent = 'Listo';
                    doneBtn.onclick = function() {
                        Avika.orders.finishKitchenForDelivery(order.id);
                    };
                } else if (!order.deliveryDepartureTime) {
                    doneBtn.textContent = 'Registrar Salida';
                    doneBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                } else if (!order.deliveryArrivalTime) {
                    doneBtn.textContent = 'Registrar Entrega';
                    doneBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(order.id);
                    };
                }
                
                actionsCell.appendChild(doneBtn);
            }
        }
        // Para platillos normales no a domicilio, mostrar botón de listo
        else {
            // Si es parte de un ticket y ya está terminado, mostrar "Esperando otros platillos"
            if (order.ticketId && order.finished) {
                var statusText = document.createElement('span');
                statusText.className = 'status-text';
                statusText.textContent = 'Esperando otros platillos';
                actionsCell.appendChild(statusText);
            } else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                doneBtn.textContent = 'Listo';
                
                // Si es parte de un ticket, usar finishIndividualItem en lugar de finishPreparation
                if (order.ticketId) {
                    doneBtn.onclick = function() {
                        Avika.orders.finishIndividualItem(order.id);
                    };
                } else {
                    doneBtn.onclick = function() {
                        Avika.orders.finishPreparation(order.id);
                    };
                }
                
                actionsCell.appendChild(doneBtn);
            }
        }
        
        row.appendChild(actionsCell);
        
        return row;
    },
    // Actualizar temporizadores de platillos en preparación
    updatePendingTimers: function() {
        var self = this; // Guardar referencia a this para evitar problemas de contexto
        var pendingBody = Avika.utils.getElement('pending-body');
        if (!pendingBody) return;
        
        var timerCells = pendingBody.querySelectorAll('.timer-cell');
        if (timerCells.length === 0) return;
        
        var now = new Date(); // Calcular la hora actual una sola vez
        var visibleTimers = 0;
        var MAX_INVISIBLE_TIMERS = 10; // Límite de temporizadores invisibles a actualizar
        
        // Usar constantes definidas centralmente
        var TEN_MINUTES = Avika.utils.TIME_CONSTANTS.TEN_MINUTES_IN_SECONDS;
        var FIFTEEN_MINUTES = Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS;
        
        // Crear un mapa de órdenes para búsqueda más eficiente
        var orderMap = {};
        if (Array.isArray(Avika.data.pendingOrders)) {
            Avika.data.pendingOrders.forEach(function(order) {
                if (order && order.id) {
                    orderMap[order.id] = order;
                }
            });
        }
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            
            // Solo actualizar temporizadores visibles (mejora de rendimiento)
            var isVisible = self.isElementInViewport(timerCell);
            if (!isVisible && visibleTimers > MAX_INVISIBLE_TIMERS) continue;
            
            var orderId = timerCell.getAttribute('data-id');
            if (!orderId) continue;
            
            // Buscar la orden usando el mapa (mucho más eficiente)
            var order = orderMap[orderId];
            if (!order) continue;
            
            visibleTimers++;
            
            // Validar que startTime sea una fecha válida
            var startTime;
            try {
                startTime = new Date(order.startTime);
                if (!Avika.utils.isValidDate(startTime)) throw new Error("Fecha inválida");
            } catch (e) {
                Avika.utils.log.warn("Formato de fecha inválido para la orden:", orderId);
                timerCell.textContent = "--:--:--";
                continue;
            }
            
            var elapsedMillis = now - startTime;
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = self.formatElapsedTime(elapsedSeconds);
            
            // Añadir clases de advertencia según el tiempo transcurrido
            timerCell.classList.remove('warning', 'alert');
            
            // Más de 10 minutos: advertencia
            if (elapsedSeconds >= TEN_MINUTES) {
                timerCell.classList.add('warning');
            }
            
            // Más de 15 minutos: alerta
            if (elapsedSeconds >= FIFTEEN_MINUTES) {
                timerCell.classList.add('alert');
            }
        }
    },

    // Actualizar temporizadores de reparto
    updateDeliveryTimers: function() {
        var self = this; // Guardar referencia a this para evitar problemas de contexto
        var deliveryBody = Avika.utils.getElement('delivery-body');
        if (!deliveryBody) return;
        
        var timerCells = deliveryBody.querySelectorAll('.delivery-timer');
        if (timerCells.length === 0) return;
        
        var now = new Date();
        var THIRTY_MINUTES = Avika.utils.TIME_CONSTANTS.THIRTY_MINUTES_IN_SECONDS;
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            var departureTimeStr = timerCell.getAttribute('data-departure-time');
            
            if (!departureTimeStr) continue;
            
            // Validar formato de fecha
            var departureTime;
            try {
                departureTime = new Date(departureTimeStr);
                if (isNaN(departureTime.getTime())) {
                    console.warn('Formato de fecha inválido:', departureTimeStr);
                    continue;
                }
            } catch (e) {
                console.warn('Error al parsear fecha:', e);
                continue;
            }
            
            var elapsedMillis = now - departureTime;
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = self.formatElapsedTime(elapsedSeconds);
            
            // Añadir clase de advertencia para tiempos largos
            timerCell.classList.remove('warning');
            if (elapsedSeconds >= THIRTY_MINUTES) {
                timerCell.classList.add('warning');
            }
        }
    },
    
    // Verificar si un elemento está visible en el viewport
    isElementInViewport: function(el) {
        // Validar que el elemento exista
        if (!el) return false;
        
        try {
            var rect = el.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Añadir un buffer para pre-cargar elementos cercanos al viewport
            var buffer = 200; // píxeles de margen para pre-carga
            
            return (
                (rect.top >= -buffer && rect.top <= windowHeight + buffer) ||
                (rect.bottom >= -buffer && rect.bottom <= windowHeight + buffer)
            ) && (
                rect.left >= 0 &&
                rect.right <= windowWidth
            );
        } catch (e) {
            if (Avika.utils && Avika.utils.log) {
                Avika.utils.log.warn("Error al verificar visibilidad del elemento:", e);
            } else {
                console.warn("Error al verificar visibilidad del elemento:", e);
            }
            return false;
        }
    },
    
    // Búsqueda optimizada de órdenes
    findOrderById: function(id) {
        if (!id || !Avika.data || !Array.isArray(Avika.data.pendingOrders)) {
            return null;
        }
        
        // Primero intentar búsqueda directa si existe un mapa de órdenes
        if (this._orderCache && this._orderCache[id]) {
            return this._orderCache[id];
        }
        
        // Búsqueda tradicional si no hay caché
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order && order.id === id) {
                // Actualizar caché para futuras búsquedas
                if (!this._orderCache) this._orderCache = {};
                this._orderCache[id] = order;
                return order;
            }
        }
        return null;
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
        document.getElementById('ticket-minute').value = now.getMinutes(); // Usar el valor directamente
        
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

    selectTicketService: function(button, service) {
        document.getElementById('ticket-btn-comedor').classList.remove('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        this.state.ticketService = service;
    },

    // Funciones de utilidad para el selector de hora
    generateHourOptions: function() {
        var options = '';
        for (var i = 0; i < 24; i++) {
            // Usar padZero de utils en lugar de this.padZero
            var paddedHour = Avika.utils && Avika.utils.padZero ? 
                              Avika.utils.padZero(i) : 
                              (i < 10 ? '0' + i : i);
            options += `<option value="${i}">${paddedHour}</option>`;
        }
        return options;
    },
    
    generateMinuteOptions: function() {
        var options = '';
        for (var i = 0; i < 60; i += 1) {
            // Usar padZero de utils en lugar de this.padZero
            var paddedMinute = Avika.utils && Avika.utils.padZero ? 
                               Avika.utils.padZero(i) : 
                               (i < 10 ? '0' + i : i);
            options += `<option value="${i}">${paddedMinute}</option>`;
        }
        return options;
    },
    // MODIFICADO: Método para mostrar el modal de selección de platillos con búsqueda global
    showTicketItemSelection: function() {
        // Crear modal de selección de platillo
        var modal = document.getElementById('item-selection-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-selection-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Seleccionar platillo</h2>
                    
                    <!-- NUEVA SECCIÓN: Barra de búsqueda global -->
                    <div class="search-container" style="margin-bottom: 15px;">
                        <input type="text" id="global-dish-search" class="search-input" placeholder="Buscar platillo en todas las categorías...">
                    </div>
                    
                    <div class="mobile-friendly-select">
                        <!-- Sección de resultados de búsqueda global (inicialmente oculta) -->
                        <div class="selection-step" id="search-results-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-categories">« Volver a categorías</button>
                                <h3>Resultados de búsqueda</h3>
                            </div>
                            <div id="search-results-container" class="dishes-container"></div>
                        </div>
                    
                        <div class="selection-step" id="category-selection-step">
                            <h3>Categoría:</h3>
                            <div class="category-container">
                                <button class="category-btn" data-category="frio">Platillos Fríos</button>
                                <button class="category-btn" data-category="entrada-fria">Entradas Frías</button>
                                <button class="category-btn" data-category="caliente">Platillos Calientes</button>
                                <button class="category-btn" data-category="entrada-caliente">Entradas Calientes</button>
                                <button class="category-btn" data-category="combos">Combos</button>
                            </div>
                        </div>
                        
                        <div class="selection-step" id="dish-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-category">« Atrás</button>
                                <h3>Platillo: <span id="selected-category-name"></span></h3>
                            </div>
                            
                            <!-- Búsqueda específica de categoría -->
                            <div class="search-container" style="margin-bottom: 15px;">
                                <input type="text" id="ticket-dish-search" class="search-input" placeholder="Buscar en esta categoría...">
                            </div>
                            
                            <div id="dishes-selection-container" class="dishes-container"></div>
                        </div>
                        
                        <div class="selection-step" id="quantity-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-dish">« Atrás</button>
                                <h3>Platillo: <span id="selected-dish-name"></span></h3>
                            </div>
                            <div class="item-quantity">
                                <h3>Cantidad:</h3>
                                <div class="qty-control">
                                    <button class="qty-btn" id="item-btn-decrease">-</button>
                                    <span class="qty-display" id="item-quantity-display">1</span>
                                    <button class="qty-btn" id="item-btn-increase">+</button>
                                </div>
                            </div>
                            <div class="item-notes">
                                <h3>Notas para este platillo:</h3>
                                <textarea id="item-notes-input" placeholder="Notas específicas para este platillo"></textarea>
                            </div>
                            
                            <div class="item-buttons">
                                <div class="modal-action-btns">
                                    <button id="btn-cancel-item" class="action-btn cancel-btn">Cancelar</button>
                                    <button id="btn-add-to-ticket" class="action-btn start-btn">Agregar al ticket</button>
                                </div>
                            </div>
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
            
            // NUEVO: Evento para la búsqueda global
            var globalSearchInput = document.getElementById('global-dish-search');
            if (globalSearchInput) {
                globalSearchInput.addEventListener('input', function() {
                    Avika.ui.performGlobalDishSearch(this.value.trim());
                });
            }
            
            // Evento para barra de búsqueda específica de categoría
            var categorySearchInput = document.getElementById('ticket-dish-search');
            if (categorySearchInput) {
                categorySearchInput.addEventListener('input', function() {
                    Avika.ui.filterTicketDishes(this.value.trim().toLowerCase());
                });
            }
            
            // Eventos para categorías
            var categoryBtns = modal.querySelectorAll('.category-btn');
            categoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    var category = this.getAttribute('data-category');
                    Avika.ui.selectTicketCategory(category);
                    
                    // Mostrar paso de selección de platillos
                    document.getElementById('category-selection-step').style.display = 'none';
                    document.getElementById('dish-selection-step').style.display = 'block';
                    document.getElementById('search-results-step').style.display = 'none';
                };
            });
            
            // Botón para volver a categorías desde resultados de búsqueda
            var backToCategoryBtns = modal.querySelectorAll('.back-to-categories');
            backToCategoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    document.getElementById('search-results-step').style.display = 'none';
                    document.getElementById('category-selection-step').style.display = 'block';
                    document.getElementById('global-dish-search').value = '';
                };
            });
            
            // Botón para volver a categorías
            modal.querySelector('.back-to-category').onclick = function() {
                document.getElementById('category-selection-step').style.display = 'block';
                document.getElementById('dish-selection-step').style.display = 'none';
                document.getElementById('search-results-step').style.display = 'none';
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
            document.getElementById('btn-add-to-ticket').onclick = function() {
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
        
        // Limpiar campos de búsqueda
        if (document.getElementById('global-dish-search')) {
            document.getElementById('global-dish-search').value = '';
        }
        if (document.getElementById('ticket-dish-search')) {
            document.getElementById('ticket-dish-search').value = '';
        }
        
        // Mostrar la vista de categorías por defecto
        document.getElementById('category-selection-step').style.display = 'block';
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'none';
        if (document.getElementById('search-results-step')) {
            document.getElementById('search-results-step').style.display = 'none';
        }
        
        // Resetear otros contenidos
        document.getElementById('item-quantity-display').textContent = '1';
        document.getElementById('item-notes-input').value = '';
        document.getElementById('selected-category-name').textContent = '';
        document.getElementById('selected-dish-name').textContent = '';
        document.getElementById('dishes-selection-container').innerHTML = '';
        if (document.getElementById('search-results-container')) {
            document.getElementById('search-results-container').innerHTML = '';
        }
        
        modal.style.display = 'block';
    },

    selectTicketCategory: function(category) {
        this.state.selectedTicketItem.category = category;
        document.getElementById('selected-category-name').textContent = Avika.config.categoryNames[category];
        
        var container = document.getElementById('dishes-selection-container');
        container.innerHTML = '';
        
        // Mostrar platillos de la categoría
        if (Avika.config.dishes[category]) {
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = document.createElement('button');
                button.className = 'dish-btn';
                button.setAttribute('data-dish', dish.toLowerCase()); // Añadir para búsqueda
                
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
                this.updatePendingTable();
                
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
        for (var category in Avika.config.dishes) {
            var dishes = Avika.config.dishes[category];
            
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
                categoryLabel.textContent = Avika.config.categoryNames[result.category];
                
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
