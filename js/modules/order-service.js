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

    formatTime: function(date) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
            return Avika.utils.formatTime(date);
        }
        
        // Implementación de respaldo en caso de que Avika.utils no esté disponible
        if (!date) return '--:--:--';
        
        var hours = this.padZero(date.getHours());
        var minutes = this.padZero(date.getMinutes());
        var seconds = this.padZero(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },

    // Función para formatear tiempo transcurrido en segundos a formato HH:MM:SS
    formatElapsedTime: function(seconds) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.formatElapsedTime === 'function') {
            return Avika.utils.formatElapsedTime(seconds);
        }
        
        // Validar entrada
        if (seconds === undefined || seconds === null || isNaN(seconds)) {
            return '--:--:--';
        }
        
        // Implementación unificada para mayor rendimiento
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = Math.floor(seconds % 60);
        
        return this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(secs);
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
    }
};
