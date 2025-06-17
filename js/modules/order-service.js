// order-service.js - Funciones para el manejo de órdenes y tickets
window.Avika = window.Avika || {};

Avika.orderService = {
    // Caché para búsquedas optimizadas
    _orderCache: {},
    
    // Estado de tickets para seguimiento mejorado
    _ticketStatus: {},
    
    // Temporizador para notificaciones
    _notificationTimer: null,
    
    // Función para crear una nueva orden
    createOrder: function(dish, category, serviceType, notes, quantity, isSpecialCombo) {
        console.log("Creando nueva orden:", dish);
        
        // Verificar que Avika.data existe y está inicializado
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existe, inicializando objeto vacío');
        }
        
        // Verificar que pendingOrders existe
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        
        var now = new Date();
        var order = {
            id: now.getTime().toString() + Math.floor(Math.random() * 1000),
            dish: dish,
            category: category,
            categoryDisplay: Avika.config.categoryNames[category],
            quantity: quantity || 1,
            customizations: [],
            serviceType: serviceType || 'comedor',
            notes: notes || '',
            startTime: now,
            startTimeFormatted: this.formatTime(now),
            isSpecialCombo: isSpecialCombo || false,
            finished: false
        };
        
        // Si es un combo especial, inicializar estados de cocinas
        if (isSpecialCombo) {
            order.hotKitchenFinished = false;
            order.coldKitchenFinished = false;
        }
        
        // Agregar a órdenes pendientes
        Avika.data.pendingOrders.push(order);
        
        // Limpiar caché de búsqueda
        this._orderCache = {};
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        return order;
    },
    
    // Usar las funciones de formateo de tiempo del módulo utils con implementaciones de respaldo
    padZero: function(num) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.padZero === 'function') {
            return Avika.utils.padZero(num);
        }
        
        // Implementación de respaldo en caso de que Avika.utils no esté disponible
        return (num < 10 ? '0' : '') + num;
    },
    
    // La función isValidDate ha sido centralizada en Avika.utils.isValidDate
    // Usar Avika.utils.isValidDate en su lugar

    formatTime: function(date) {
        // Utilizar directamente la implementación centralizada
        return Avika.utils.formatTime(date);
    },

    // Función para formatear tiempo transcurrido (utiliza directamente la implementación centralizada)
    formatElapsedTime: function(seconds) {
        return Avika.utils.formatElapsedTime(seconds);
    },
    
    // Función para seleccionar una categoría
    selectCategory: function(category) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.selectCategory === 'function') {
            return Avika.ui.selectCategory(category);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Seleccionando categoría:", category);
        
        // Verificar si es una categoría válida
        if (!Avika.config.categories || !Avika.config.categories[category]) {
            console.error("Categoría no válida:", category);
            return;
        }
        
        // Limpiar selección anterior
        var categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(function(btn) {
            btn.classList.remove('selected');
        });
        
        // Marcar botón como seleccionado
        var selectedButton = document.querySelector('.category-button[data-category="' + category + '"]');
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        
        // Mostrar subcategorías o platillos según configuración
        var categoryConfig = Avika.config.categories[category];
        
        if (categoryConfig.subcategories && Object.keys(categoryConfig.subcategories).length > 0) {
            // Tiene subcategorías, mostrarlas
            this.showSubCategories(category);
        } else {
            // No tiene subcategorías, mostrar platillos directamente
            this.showDishes(category);
        }
    },
    
    // Función para marcar un platillo individual como terminado (para tickets)
    finishIndividualItem: function(orderId) {
        console.log("Finalizando item individual:", orderId);
        
        const orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden solicitada", "error");
            return;
        }
        
        const order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        
        this.showNotification('¡' + order.dish + ' marcado como listo!', 'success');

        // Si el item pertenece a un ticket, verificar si el ticket está completo
        if (order.ticketId) {
            const ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
            console.log("Estado del ticket:", ticketStatus);

            if (ticketStatus.isComplete) {
                console.log("Todos los platillos del ticket", ticketStatus.ticketId, "están terminados. Procesando...");
                // Usar un timeout para que el usuario vea la notificación del último platillo
                setTimeout(() => {
                    this.processCompletedTicket(ticketStatus.ticketId, ticketStatus.serviceType);
                }, 500); // 500ms de retraso
            } else {
                this.updatePendingTable();
            }
        } else {
            // Si es una orden individual (no de ticket), moverla directamente a la barra
            if (!Avika.data.barOrders) Avika.data.barOrders = [];
            order.barArrivalTime = new Date();
            Avika.data.barOrders.push(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            this.updatePendingTable();
            this.updateBarTable();
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    },

    processCompletedTicket: function(ticketId, serviceType) {
        console.log(`Procesando ticket completado: ${ticketId}, Servicio: ${serviceType}`);

        if (!Avika.data.barOrders) Avika.data.barOrders = [];
        if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];

        const itemsToMove = Avika.data.pendingOrders.filter(item => item.ticketId === ticketId);
        
        if (itemsToMove.length === 0) {
            return;
        }

        if (serviceType === 'domicilio') {
            itemsToMove.forEach(item => {
                item.deliveryDepartureTime = new Date();
                Avika.data.deliveryOrders.push(item);
            });
        } else { // comedor, para-llevar
            itemsToMove.forEach(item => {
                item.barArrivalTime = new Date();
                Avika.data.barOrders.push(item);
            });
        }

        Avika.data.pendingOrders = Avika.data.pendingOrders.filter(item => item.ticketId !== ticketId);

        this.updatePendingTable();
        this.updateBarTable();
        this.updateDeliveryTable();
    },

    updateBarTable: function() {
        if (Avika.ui && typeof Avika.ui.updateBarTable === 'function') {
            return Avika.ui.updateBarTable();
        }
        const tableBody = document.getElementById('bar-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!Avika.data.barOrders || Avika.data.barOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-table">No hay platillos en barra</td></tr>';
            return;
        }
        Avika.data.barOrders.forEach(order => {
            const row = document.createElement('tr');
            row.dataset.id = order.id;
            row.innerHTML = `
                <td>${this.formatTime(new Date(order.endTime))}</td>
                <td>${order.dish}</td>
                <td>${order.preparationTimeFormatted}</td>
                <td>${this.getServiceTypeDisplay(order.serviceType)}</td>
                <td><button class="action-btn" onclick="Avika.orderService.completeOrderFromBar('${order.id}')">Entregado</button></td>
            `;
            tableBody.appendChild(row);
        });
    },

    updateDeliveryTable: function() {
        if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
            return Avika.ui.updateDeliveryTable();
        }
        const tableBody = document.getElementById('delivery-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!Avika.data.deliveryOrders || Avika.data.deliveryOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-table">No hay platillos en reparto</td></tr>';
            return;
        }
        Avika.data.deliveryOrders.forEach(order => {
            const row = document.createElement('tr');
            row.dataset.id = order.id;
            row.innerHTML = `
                <td>${this.formatTime(new Date(order.deliveryDepartureTime))}</td>
                <td>${order.dish}</td>
                <td>${order.ticketNotes || '-'}</td>
                <td class="timer-cell" data-start-time="${order.deliveryDepartureTime}">00:00</td>
                <td><button class="action-btn" onclick="Avika.orderService.completeDelivery('${order.id}')">Entregado</button></td>
            `;
            tableBody.appendChild(row);
        });
    },

    completeOrderFromBar: function(orderId) {
        const orderIndex = Avika.data.barOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        const order = Avika.data.barOrders[orderIndex];
        if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
        Avika.data.completedOrders.push(order);
        Avika.data.barOrders.splice(orderIndex, 1);
        this.updateBarTable();
        this.showNotification(`${order.dish} entregado.`, 'success');
        if (Avika.storage) Avika.storage.guardarDatosLocales();
    },

    completeDelivery: function(orderId) {
        const orderIndex = Avika.data.deliveryOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        const order = Avika.data.deliveryOrders[orderIndex];
        if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
        Avika.data.completedOrders.push(order);
        Avika.data.deliveryOrders.splice(orderIndex, 1);
        this.updateDeliveryTable();
        this.showNotification(`${order.dish} entregado a domicilio.`, 'success');
        if (Avika.storage) Avika.storage.guardarDatosLocales();
        console.log("Finalizando item individual:", orderId);
        
        // Buscar el índice de la orden en el array de órdenes pendientes
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden solicitada", "error");
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        
        // Usar formatElapsedTime desde utils para consistencia
        try {
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        } catch (e) {
            console.warn("Error al formatear tiempo:", e);
            // Formateo de respaldo
            var mins = Math.floor(order.preparationTime / 60);
            var secs = order.preparationTime % 60;
            order.preparationTimeFormatted = this.padZero(mins) + ':' + this.padZero(secs);
        }
        
        // Si todos los platillos del ticket están terminados, actualizar estado del ticket
        if (order.ticketId) {
            var ticketId = order.ticketId;
            // Verificar si hay un registro de estado del ticket
            if (!this._ticketStatus) this._ticketStatus = {};
            
            if (!this._ticketStatus[ticketId]) {
                // Inicializar seguimiento de estado para este ticket
                this._ticketStatus[ticketId] = {
                    totalItems: 0,
                    finishedItems: 0,
                    serviceType: order.serviceType
                };
                
                // Contar todos los items de este ticket
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        this._ticketStatus[ticketId].totalItems++;
                        // Contar si ya está terminado
                        if (item.finished || 
                            (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
                            this._ticketStatus[ticketId].finishedItems++;
                        }
                    }
                }
            } else {
                // Incrementar contador de items terminados
                this._ticketStatus[ticketId].finishedItems++;
            }
            
            console.log("Estado del ticket:", ticketId, this._ticketStatus[ticketId]);
            
            // Verificar si todos los items están completos
            var ticketStatus = this._ticketStatus[ticketId];
            var allTicketItemsFinished = ticketStatus.finishedItems >= ticketStatus.totalItems;
            
            // Marcar todas las órdenes de este ticket como completadas
            if (allTicketItemsFinished) {
                console.log("Todos los platillos del ticket", ticketId, "están terminados");
                
                // Marcar todas las órdenes con el estado completado
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        item.allTicketItemsFinished = true;
                    }
                }
                
                // Si es a domicilio, gestionar transición a reparto
                // Los tickets de ordena y espera (para-llevar) ahora se comportan como comedor
                if (ticketStatus.serviceType === 'domicilio') {
                    console.log("Ticket a domicilio listo para reparto");
                    
                    // Forzar actualización de la tabla para mostrar botones de entrega
                    this.updatePendingTable();
                }
            }
        }
        
        // Actualizar la interfaz
        this.updatePendingTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡' + order.dish + ' marcado como listo!', 'success');
    },
    
    // Función para finalizar una cocina fría (para combos especiales)
    finishColdKitchen: function(orderId) {
        console.log("Finalizando cocina fría:", orderId);
        
        // Buscar el índice de la orden en el array de órdenes pendientes
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden solicitada", "error");
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        order.coldKitchenFinished = true;
        
        // Verificar si ambas cocinas están terminadas
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            order.finished = true;
            order.endTime = new Date();
            order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
            
            // Actualizar la interfaz
            this.updatePendingTable();
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡Cocina Fría de ' + order.dish + ' terminada!', 'success');
    },
    
    // Función para verificar si todos los platillos de un ticket están terminados
    checkTicketCompletionStatus: function(ticketId) {
        if (!ticketId) return false;
        
        var allItems = [];
        var finishedItems = 0;
        
        // Recopilar todos los platillos del ticket (pendientes y en reparto)
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                allItems.push(item);
                
                // Verificar si está terminado
                if (item.finished || 
                    (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
                    finishedItems++;
                }
            }
        }
        
        // También verificar en órdenes en reparto
        if (Avika.data.deliveryOrders) {
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === ticketId) {
                    allItems.push(item);
                    finishedItems++;  // Si está en reparto, ya está terminado
                }
            }
        }
        
        // Verificar en órdenes completadas
        if (Avika.data.completedOrders) {
            for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                var item = Avika.data.completedOrders[i];
                if (item.ticketId === ticketId) {
                    allItems.push(item);
                    finishedItems++;  // Si está completado, ya está terminado
                }
            }
        }
        
        // Calcular si todos están terminados
        var isComplete = finishedItems >= allItems.length && allItems.length > 0;
        
        // Determinar tipo de servicio del ticket (usar el primer item)
        var serviceType = allItems.length > 0 ? allItems[0].serviceType : null;
        
        return {
            ticketId: ticketId,
            totalItems: allItems.length,
            finishedItems: finishedItems,
            isComplete: isComplete,
            serviceType: serviceType
        };
    },
    
    // Función para mostrar notificaciones
    showNotification: function(message, type) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            return Avika.ui.showNotification(message, type);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Notificación (" + (type || 'info') + "):", message);
        
        // Crear elemento de notificación
        var notification = document.createElement('div');
        notification.className = 'notification ' + (type || 'info');
        notification.textContent = message;
        
        // Agregar al contenedor
        var container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Limpiar notificaciones anteriores
        if (this._notificationTimer) {
            clearTimeout(this._notificationTimer);
        }
        
        // Mostrar notificación
        container.innerHTML = '';
        container.appendChild(notification);
        container.style.display = 'block';
        
        // Configurar temporizador para ocultar
        this._notificationTimer = setTimeout(function() {
            container.style.display = 'none';
        }, 3000);
    },
    
    // Función para actualizar la tabla de órdenes pendientes
    updatePendingTable: function() {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            return Avika.ui.updatePendingTable();
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Actualizando tabla de órdenes pendientes");
        
        // Obtener el cuerpo de la tabla
        var tableBody = document.getElementById('pending-body');
        if (!tableBody) {
            console.warn("No se encontró el elemento de la tabla de órdenes pendientes");
            return;
        }
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Verificar que hay órdenes pendientes
        if (!Avika.data || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            var emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="empty-table">No hay órdenes pendientes</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Ordenar por tiempo de inicio (más antiguas primero)
        var sortedOrders = Avika.data.pendingOrders.slice().sort(function(a, b) {
            return new Date(a.startTime) - new Date(b.startTime);
        });
        
        // Crear filas para cada orden
        for (var i = 0; i < sortedOrders.length; i++) {
            var order = sortedOrders[i];
            
            // Crear fila
            var row = document.createElement('tr');
            row.className = 'order-row';
            row.setAttribute('data-id', order.id);
            
            // Aplicar clase según estado
            if (order.finished) {
                row.classList.add('finished');
            }
            
            // Crear celdas
            var timeCell = document.createElement('td');
            timeCell.className = 'time-cell';
            timeCell.textContent = order.startTimeFormatted;
            
            var dishCell = document.createElement('td');
            dishCell.className = 'dish-cell';
            dishCell.textContent = order.dish;
            
            var categoryCell = document.createElement('td');
            categoryCell.className = 'category-cell';
            categoryCell.textContent = order.categoryDisplay || order.category;
            
            var serviceCell = document.createElement('td');
            serviceCell.className = 'service-cell';
            serviceCell.textContent = this.getServiceTypeDisplay(order.serviceType);
            
            var notesCell = document.createElement('td');
            notesCell.className = 'notes-cell';
            notesCell.textContent = order.notes || '-';
            
            var actionsCell = document.createElement('td');
            actionsCell.className = 'actions-cell';
            
            // Botón de finalizar
            var finishButton = document.createElement('button');
            finishButton.className = 'finish-button';
            finishButton.textContent = 'Finalizar';
            finishButton.setAttribute('data-id', order.id);
            finishButton.onclick = function() {
                var orderId = this.getAttribute('data-id');
                Avika.orderService.finishIndividualItem(orderId);
            };
            
            // Agregar botón a celda de acciones
            actionsCell.appendChild(finishButton);
            
            // Agregar celdas a fila
            row.appendChild(timeCell);
            row.appendChild(dishCell);
            row.appendChild(categoryCell);
            row.appendChild(serviceCell);
            row.appendChild(notesCell);
            row.appendChild(actionsCell);
            
            // Agregar fila a tabla
            tableBody.appendChild(row);
        }
    },
    
    // Función auxiliar para obtener el texto de visualización del tipo de servicio
    getServiceTypeDisplay: function(serviceType) {
        var serviceTypes = {
            'comedor': 'Comedor',
            'domicilio': 'Domicilio',
            'para-llevar': 'Para Llevar',
            'ordenar-esperar': 'Ordena y Espera'
        };
        
        return serviceTypes[serviceType] || serviceType;
    },
    
    // Función para guardar un ticket completo con múltiples platillos
    saveTicket: function(items, serviceType, notes, deliveryTime, entryTime) {
        console.log("Guardando ticket con", items.length, "platillos");
        
        // Validar parámetros
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error("No hay platillos para guardar");
            return false;
        }
        
        // Verificar que Avika.data existe y está inicializado
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existe, inicializando objeto vacío');
        }
        
        // Verificar que pendingOrders existe
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        
        try {
            // Generar un ID único para el ticket
            var ticketId = new Date().getTime().toString() + Math.floor(Math.random() * 1000);
            var now = new Date();
            
            // Usar la hora de entrada especificada si existe, de lo contrario usar la hora actual
            var startTime = entryTime && Avika.utils.isValidDate(entryTime) ? entryTime : now;
            
            // Crear órdenes para cada platillo del ticket
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                
                // Crear la orden
                var order = {
                    id: now.getTime().toString() + Math.floor(Math.random() * 1000) + i,
                    ticketId: ticketId,
                    dish: item.dish,
                    category: item.category,
                    categoryDisplay: item.categoryDisplay || Avika.config.getActiveMenu().categoryNames[item.category],
                    quantity: item.quantity || 1,
                    customizations: item.customizations || [],
                    serviceType: serviceType || 'comedor',
                    notes: item.notes || '',  // Notas específicas del platillo
                    ticketNotes: notes || '',  // Notas generales del ticket
                    startTime: startTime,
                    startTimeFormatted: this.formatTime(startTime),
                    isSpecialCombo: item.isSpecialCombo || false,
                    finished: false
                };
                
                // Si es un combo especial, inicializar estados de cocinas
                if (item.isSpecialCombo) {
                    order.hotKitchenFinished = false;
                    order.coldKitchenFinished = false;
                }
                
                // Agregar a órdenes pendientes
                Avika.data.pendingOrders.push(order);
            }
            
            // Limpiar caché de búsqueda
            this._orderCache = {};
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            return true;
        } catch (error) {
            console.error("Error al guardar ticket:", error);
            return false;
        }
    },
    
    // Función para actualizar todos los temporizadores
    updateAllTimers: function() {
        try {
            // Verificar que los datos existen antes de actualizar
            if (!Avika.data) {
                console.warn('Avika.data no está disponible para actualizar temporizadores');
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
            console.error('Error al actualizar temporizadores:', error);
        }
    },
    
    // Actualizar temporizadores de platillos en preparación
    updatePendingTimers: function() {
        var pendingBody = document.getElementById('pending-body');
        if (!pendingBody) return;
        
        var timerCells = pendingBody.querySelectorAll('.timer-cell');
        if (timerCells.length === 0) return;
        
        var now = new Date(); // Calcular la hora actual una sola vez
        
        // Usar constantes definidas centralmente
        var TEN_MINUTES = 600; // 10 minutos en segundos
        var FIFTEEN_MINUTES = 900; // 15 minutos en segundos
        
        if (Avika.utils && Avika.utils.TIME_CONSTANTS) {
            TEN_MINUTES = Avika.utils.TIME_CONSTANTS.TEN_MINUTES_IN_SECONDS;
            FIFTEEN_MINUTES = Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS;
        }
        
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
            var orderId = timerCell.getAttribute('data-id');
            if (!orderId) continue;
            
            // Buscar la orden usando el mapa (mucho más eficiente)
            var order = orderMap[orderId];
            if (!order) continue;
            
            // Validar que startTime sea una fecha válida
            var startTime;
            try {
                // Asegurar que startTime sea un objeto Date válido
                if (order.startTime instanceof Date) {
                    startTime = order.startTime;
                } else if (typeof order.startTime === 'string') {
                    // Compatibilidad con Android 10: parsear la fecha correctamente
                    startTime = new Date(order.startTime);
                    // Si la fecha es inválida, intentar reparar el formato
                    if (isNaN(startTime.getTime())) {
                        console.warn("Reparando formato de fecha para la orden:", orderId);
                        // Intentar diferentes formatos de fecha
                        if (order.startTime.indexOf('T') > -1) {
                            // Formato ISO
                            var parts = order.startTime.split('T');
                            var dateParts = parts[0].split('-');
                            var timeParts = parts[1].split(':');
                            startTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], 
                                              timeParts[0], timeParts[1], timeParts[2].split('.')[0]);
                        } else {
                            // Crear una nueva fecha
                            startTime = new Date();
                            // Actualizar la orden para evitar problemas futuros
                            order.startTime = startTime;
                            // Guardar cambios si es posible
                            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                Avika.storage.guardarDatosLocales();
                            }
                        }
                    }
                } else {
                    // Si no es ni Date ni string, crear una nueva fecha
                    console.warn("Tipo de fecha inválido para la orden:", orderId, typeof order.startTime);
                    startTime = new Date();
                    // Actualizar la orden para evitar problemas futuros
                    order.startTime = startTime;
                }
                
                // Verificación final
                if (isNaN(startTime.getTime())) throw new Error("Fecha inválida después de reparación");
                
            } catch (e) {
                console.warn("Error al procesar fecha para la orden:", orderId, e);
                timerCell.textContent = "--:--:--";
                continue;
            }
            
            // Cálculo seguro del tiempo transcurrido
            var elapsedMillis;
            try {
                elapsedMillis = now.getTime() - startTime.getTime();
            } catch (e) {
                console.error("Error al calcular diferencia de tiempo:", e);
                elapsedMillis = 0;
            }
            
            // Asegurar que el valor sea positivo
            if (elapsedMillis < 0) {
                console.warn("Tiempo negativo detectado, corrigiendo para orden:", orderId);
                elapsedMillis = 0;
            }
            
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = this.formatElapsedTime(elapsedSeconds);
            
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
    
    // Actualizar temporizadores de platillos en reparto
    updateDeliveryTimers: function() {
        var deliveryBody = document.getElementById('delivery-body');
        if (!deliveryBody) return;
        
        var timerCells = deliveryBody.querySelectorAll('.timer-cell');
        if (timerCells.length === 0) return;
        
        var now = new Date(); // Calcular la hora actual una sola vez
        
        // Crear un mapa de órdenes para búsqueda más eficiente
        var orderMap = {};
        if (Array.isArray(Avika.data.deliveryOrders)) {
            Avika.data.deliveryOrders.forEach(function(order) {
                if (order && order.id) {
                    orderMap[order.id] = order;
                }
            });
        }
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            var orderId = timerCell.getAttribute('data-id');
            if (!orderId) continue;
            
            // Buscar la orden usando el mapa
            var order = orderMap[orderId];
            if (!order) continue;
            
            // Validar que deliveryDepartureTime sea una fecha válida
            var departureTime;
            try {
                // Asegurar que departureTime sea un objeto Date válido
                if (order.deliveryDepartureTime instanceof Date) {
                    departureTime = order.deliveryDepartureTime;
                } else if (typeof order.deliveryDepartureTime === 'string') {
                    // Compatibilidad con Android 10: parsear la fecha correctamente
                    departureTime = new Date(order.deliveryDepartureTime);
                    // Si la fecha es inválida, intentar reparar el formato
                    if (isNaN(departureTime.getTime())) {
                        console.warn("Reparando formato de fecha para la orden en reparto:", orderId);
                        // Intentar diferentes formatos de fecha
                        if (order.deliveryDepartureTime.indexOf('T') > -1) {
                            // Formato ISO
                            var parts = order.deliveryDepartureTime.split('T');
                            var dateParts = parts[0].split('-');
                            var timeParts = parts[1].split(':');
                            departureTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], 
                                              timeParts[0], timeParts[1], timeParts[2].split('.')[0]);
                        } else {
                            // Crear una nueva fecha
                            departureTime = new Date();
                            // Actualizar la orden para evitar problemas futuros
                            order.deliveryDepartureTime = departureTime;
                            // Guardar cambios si es posible
                            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                Avika.storage.guardarDatosLocales();
                            }
                        }
                    }
                } else {
                    // Si no es ni Date ni string, crear una nueva fecha
                    console.warn("Tipo de fecha inválido para la orden en reparto:", orderId, typeof order.deliveryDepartureTime);
                    departureTime = new Date();
                    // Actualizar la orden para evitar problemas futuros
                    order.deliveryDepartureTime = departureTime;
                }
                
                // Verificación final
                if (isNaN(departureTime.getTime())) throw new Error("Fecha inválida después de reparación");
                
            } catch (e) {
                console.warn("Error al procesar fecha para la orden en reparto:", orderId, e);
                timerCell.textContent = "--:--:--";
                continue;
            }
            
            // Cálculo seguro del tiempo transcurrido
            var elapsedMillis;
            try {
                elapsedMillis = now.getTime() - departureTime.getTime();
            } catch (e) {
                console.error("Error al calcular diferencia de tiempo en reparto:", e);
                elapsedMillis = 0;
            }
            
            // Asegurar que el valor sea positivo
            if (elapsedMillis < 0) {
                console.warn("Tiempo negativo detectado, corrigiendo para orden en reparto:", orderId);
                elapsedMillis = 0;
            }
            
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = this.formatElapsedTime(elapsedSeconds);
            
            // Añadir clases de advertencia según el tiempo transcurrido
            timerCell.classList.remove('warning', 'alert');
            
            // Más de 30 minutos: advertencia
            if (elapsedSeconds >= 1800) { // 30 minutos
                timerCell.classList.add('warning');
            }
            
            // Más de 45 minutos: alerta
            if (elapsedSeconds >= 2700) { // 45 minutos
                timerCell.classList.add('alert');
            }
        }
    }
};
