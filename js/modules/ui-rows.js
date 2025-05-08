// ui-rows.js - Funciones para crear filas en las tablas de órdenes
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Crear fila para una orden en reparto
Avika.ui.createDeliveryRow = function(order) {
    // Crear fila
    var row = document.createElement('tr');
    row.className = 'delivery-order-row';
    row.setAttribute('data-order-id', order.id);
    
    // Columna de platillo
    var dishCell = document.createElement('td');
    dishCell.className = 'dish-cell';
    
    // Nombre del platillo con cantidad
    var dishName = document.createElement('div');
    dishName.className = 'dish-name';
    dishName.textContent = (order.quantity > 1 ? order.quantity + 'x ' : '') + order.dish;
    dishCell.appendChild(dishName);
    
    // Información adicional
    var dishInfo = document.createElement('div');
    dishInfo.className = 'dish-info';
    
    // Mostrar ticket ID si existe
    if (order.ticketId) {
        var ticketSpan = document.createElement('span');
        ticketSpan.className = 'ticket-id';
        ticketSpan.textContent = 'Ticket: ' + order.ticketId.substring(order.ticketId.length - 5);
        dishInfo.appendChild(ticketSpan);
    }
    
    // Mostrar tipo de servicio
    var serviceSpan = document.createElement('span');
    serviceSpan.className = 'service-type ' + order.serviceType;
    serviceSpan.textContent = order.serviceType === 'comedor' ? 'Comedor' : 
                             (order.serviceType === 'domicilio' ? 'Domicilio' : 'Para llevar');
    dishInfo.appendChild(serviceSpan);
    
    // Mostrar personalizaciones si existen
    if (order.customizations && order.customizations.length > 0) {
        var customSpan = document.createElement('span');
        customSpan.className = 'customizations';
        customSpan.textContent = order.customizations.join(', ');
        dishInfo.appendChild(customSpan);
    }
    
    dishCell.appendChild(dishInfo);
    row.appendChild(dishCell);
    
    // Columna de tiempos
    var timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    
    // Crear contenedor para los tiempos
    var timeContainer = document.createElement('div');
    timeContainer.className = 'time-container';
    
    // Tiempo de preparación
    var prepTimeDiv = document.createElement('div');
    prepTimeDiv.className = 'time-item';
    prepTimeDiv.innerHTML = '<span class="time-label">Preparación:</span> ' + 
                           '<span class="time-value">' + (order.preparationTimeFormatted || '--:--:--') + '</span>';
    timeContainer.appendChild(prepTimeDiv);
    
    // Tiempo de salida (si existe)
    if (order.deliveryDepartureTime) {
        var departureTimeDiv = document.createElement('div');
        departureTimeDiv.className = 'time-item';
        departureTimeDiv.innerHTML = '<span class="time-label">Salida:</span> ' + 
                                   '<span class="time-value">' + (order.deliveryDepartureTimeFormatted || '--:--:--') + '</span>';
        timeContainer.appendChild(departureTimeDiv);
        
        // Tiempo transcurrido desde la salida
        var elapsedDiv = document.createElement('div');
        elapsedDiv.className = 'time-item delivery-elapsed';
        elapsedDiv.setAttribute('data-departure-time', order.deliveryDepartureTime);
        elapsedDiv.innerHTML = '<span class="time-label">Tiempo:</span> ' + 
                             '<span class="time-value delivery-timer">Calculando...</span>';
        timeContainer.appendChild(elapsedDiv);
    } else {
        // Si no hay tiempo de salida, mostrar mensaje
        var noTimeDiv = document.createElement('div');
        noTimeDiv.className = 'time-item';
        noTimeDiv.innerHTML = '<span class="time-label">Estado:</span> ' + 
                            '<span class="time-value">Listo para salir</span>';
        timeContainer.appendChild(noTimeDiv);
    }
    
    timeCell.appendChild(timeContainer);
    row.appendChild(timeCell);
    
    // Columna de acciones
    var actionCell = document.createElement('td');
    actionCell.className = 'action-cell';
    
    // Botones de acción
    var actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    
    // Botón de salida (solo si no tiene tiempo de salida)
    if (!order.deliveryDepartureTime) {
        var departureButton = document.createElement('button');
        departureButton.className = 'action-btn departure-btn';
        departureButton.textContent = 'Registrar Salida';
        departureButton.setAttribute('data-order-id', order.id);
        departureButton.onclick = function() {
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.markDeliveryDeparture === 'function') {
                Avika.orders.markDeliveryDeparture(orderId);
            }
        };
        actionContainer.appendChild(departureButton);
    }
    
    // Botón de llegada (solo si tiene tiempo de salida)
    if (order.deliveryDepartureTime) {
        var arrivalButton = document.createElement('button');
        arrivalButton.className = 'action-btn arrival-btn';
        arrivalButton.textContent = 'Registrar Entrega';
        arrivalButton.setAttribute('data-order-id', order.id);
        arrivalButton.onclick = function() {
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.markDeliveryArrival === 'function') {
                Avika.orders.markDeliveryArrival(orderId);
            }
        };
        actionContainer.appendChild(arrivalButton);
    }
    
    actionCell.appendChild(actionContainer);
    row.appendChild(actionCell);
    
    return row;
};

// Crear fila para una orden pendiente
Avika.ui.createOrderRow = function(order) {
    // Crear fila
    var row = document.createElement('tr');
    row.className = 'pending-order-row';
    row.setAttribute('data-order-id', order.id);
    
    // Determinar si es un combo especial
    var isSpecialCombo = order.isSpecialCombo;
    
    // Columna de platillo
    var dishCell = document.createElement('td');
    dishCell.className = 'dish-cell';
    
    // Nombre del platillo con cantidad
    var dishName = document.createElement('div');
    dishName.className = 'dish-name';
    dishName.textContent = (order.quantity > 1 ? order.quantity + 'x ' : '') + order.dish;
    
    // Añadir etiqueta de combo si es necesario
    if (isSpecialCombo) {
        var comboLabel = document.createElement('span');
        comboLabel.className = 'combo-label';
        comboLabel.textContent = 'COMBO';
        dishName.appendChild(comboLabel);
    }
    
    dishCell.appendChild(dishName);
    
    // Información adicional
    var dishInfo = document.createElement('div');
    dishInfo.className = 'dish-info';
    
    // Mostrar ticket ID si existe
    if (order.ticketId) {
        var ticketSpan = document.createElement('span');
        ticketSpan.className = 'ticket-id';
        ticketSpan.textContent = 'Ticket: ' + order.ticketId.substring(order.ticketId.length - 5);
        dishInfo.appendChild(ticketSpan);
    }
    
    // Mostrar tipo de servicio
    var serviceSpan = document.createElement('span');
    serviceSpan.className = 'service-type ' + order.serviceType;
    serviceSpan.textContent = order.serviceType === 'comedor' ? 'Comedor' : 
                             (order.serviceType === 'domicilio' ? 'Domicilio' : 'Para llevar');
    dishInfo.appendChild(serviceSpan);
    
    // Mostrar categoría
    var categorySpan = document.createElement('span');
    categorySpan.className = 'category-type';
    categorySpan.textContent = order.category || 'Sin categoría';
    dishInfo.appendChild(categorySpan);
    
    // Mostrar personalizaciones si existen
    if (order.customizations && order.customizations.length > 0) {
        var customSpan = document.createElement('span');
        customSpan.className = 'customizations';
        customSpan.textContent = order.customizations.join(', ');
        dishInfo.appendChild(customSpan);
    }
    
    dishCell.appendChild(dishInfo);
    row.appendChild(dishCell);
    
    // Columna de tiempo
    var timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    
    // Crear contenedor para los tiempos
    var timeContainer = document.createElement('div');
    timeContainer.className = 'time-container';
    
    // Tiempo de inicio
    var startTimeDiv = document.createElement('div');
    startTimeDiv.className = 'time-item';
    startTimeDiv.innerHTML = '<span class="time-label">Inicio:</span> ' + 
                            '<span class="time-value">' + (order.startTimeFormatted || '--:--:--') + '</span>';
    timeContainer.appendChild(startTimeDiv);
    
    // Tiempo transcurrido
    var elapsedDiv = document.createElement('div');
    elapsedDiv.className = 'time-item elapsed';
    elapsedDiv.setAttribute('data-start-time', order.startTime);
    elapsedDiv.innerHTML = '<span class="time-label">Tiempo:</span> ' + 
                         '<span class="time-value timer">Calculando...</span>';
    timeContainer.appendChild(elapsedDiv);
    
    timeCell.appendChild(timeContainer);
    row.appendChild(timeCell);
    
    // Columna de acciones
    var actionCell = document.createElement('td');
    actionCell.className = 'action-cell';
    
    // Contenedor para botones
    var actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    
    // Botones según el tipo de orden
    if (isSpecialCombo) {
        // Para combos especiales, mostrar botones de cocina caliente y fría
        
        // Botón de cocina caliente
        var hotKitchenButton = document.createElement('button');
        hotKitchenButton.className = 'action-btn hot-kitchen-btn' + 
                                   (order.hotKitchenFinished ? ' finished' : '');
        hotKitchenButton.textContent = order.hotKitchenFinished ? 'Cocina Caliente ✓' : 'Cocina Caliente';
        hotKitchenButton.setAttribute('data-order-id', order.id);
        hotKitchenButton.onclick = function() {
            if (this.classList.contains('finished')) return;
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.finishHotKitchen === 'function') {
                Avika.orders.finishHotKitchen(orderId);
            }
        };
        actionContainer.appendChild(hotKitchenButton);
        
        // Botón de cocina fría
        var coldKitchenButton = document.createElement('button');
        coldKitchenButton.className = 'action-btn cold-kitchen-btn' + 
                                    (order.coldKitchenFinished ? ' finished' : '');
        coldKitchenButton.textContent = order.coldKitchenFinished ? 'Cocina Fría ✓' : 'Cocina Fría';
        coldKitchenButton.setAttribute('data-order-id', order.id);
        coldKitchenButton.onclick = function() {
            if (this.classList.contains('finished')) return;
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.finishColdKitchen === 'function') {
                Avika.orders.finishColdKitchen(orderId);
            }
        };
        actionContainer.appendChild(coldKitchenButton);
        
    } else if (order.ticketId) {
        // Para platillos de un ticket, mostrar botón de finalizar individual
        var finishButton = document.createElement('button');
        finishButton.className = 'action-btn finish-btn' + (order.finished ? ' finished' : '');
        finishButton.textContent = order.finished ? 'Terminado ✓' : 'Terminar';
        finishButton.setAttribute('data-order-id', order.id);
        finishButton.onclick = function() {
            if (this.classList.contains('finished')) return;
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.finishIndividualItem === 'function') {
                var result = Avika.orders.finishIndividualItem(orderId);
                
                // Manejar el resultado
                if (result && result.success) {
                    // Actualizar tablas según sea necesario
                    if (result.updatedTables && Array.isArray(result.updatedTables)) {
                        result.updatedTables.forEach(function(tableType) {
                            if (tableType === 'pendingTable' && Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                                Avika.ui.updatePendingTable();
                            } else if (tableType === 'completedTable' && Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                                Avika.ui.updateCompletedTable();
                            } else if (tableType === 'deliveryTable' && Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                                Avika.ui.updateDeliveryTable();
                            }
                        });
                    }
                    
                    // Mostrar notificación
                    if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification(result.message, result.messageType || 'success');
                    }
                } else if (result && !result.success) {
                    // Mostrar error
                    if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification(result.message, result.messageType || 'error');
                    }
                }
            }
        };
        actionContainer.appendChild(finishButton);
        
    } else if (order.serviceType === 'domicilio') {
        // Para órdenes a domicilio individuales, mostrar botón de finalizar cocina
        var finishKitchenButton = document.createElement('button');
        finishKitchenButton.className = 'action-btn finish-kitchen-btn';
        finishKitchenButton.textContent = 'Listo para Reparto';
        finishKitchenButton.setAttribute('data-order-id', order.id);
        finishKitchenButton.onclick = function() {
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.finishKitchenForDelivery === 'function') {
                Avika.orders.finishKitchenForDelivery(orderId);
            }
        };
        actionContainer.appendChild(finishKitchenButton);
        
    } else {
        // Para órdenes normales, mostrar botón de finalizar
        var finishButton = document.createElement('button');
        finishButton.className = 'action-btn finish-btn';
        finishButton.textContent = 'Terminar';
        finishButton.setAttribute('data-order-id', order.id);
        finishButton.onclick = function() {
            var orderId = this.getAttribute('data-order-id');
            if (Avika.orders && typeof Avika.orders.finishPreparation === 'function') {
                var result = Avika.orders.finishPreparation(orderId);
                
                // Manejar el resultado
                if (result && result.success) {
                    // Actualizar tablas según sea necesario
                    if (result.updatedTables && Array.isArray(result.updatedTables)) {
                        result.updatedTables.forEach(function(tableType) {
                            if (tableType === 'pendingTable' && Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                                Avika.ui.updatePendingTable();
                            } else if (tableType === 'completedTable' && Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                                Avika.ui.updateCompletedTable();
                            } else if (tableType === 'deliveryTable' && Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                                Avika.ui.updateDeliveryTable();
                            }
                        });
                    }
                    
                    // Mostrar notificación
                    if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification(result.message, result.messageType || 'success');
                    }
                } else if (result && !result.success) {
                    // Mostrar error
                    if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification(result.message, result.messageType || 'error');
                    }
                }
            }
        };
        actionContainer.appendChild(finishButton);
    }
    
    actionCell.appendChild(actionContainer);
    row.appendChild(actionCell);
    
    // Aplicar clases adicionales según el estado
    if (order.finished) {
        row.classList.add('finished');
    }
    
    if (order.allTicketItemsFinished) {
        row.classList.add('all-ticket-items-finished');
    }
    
    return row;
};
