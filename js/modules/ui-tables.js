// ui-tables.js - Funciones para el manejo de tablas de órdenes
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Actualizar tabla de órdenes completadas
Avika.ui.updateCompletedTable = function(showAll) {
    // Registrar inicio para optimización
    var startTime = performance.now();
    var completedTable = document.getElementById('completed-orders-table');
    var completedBody = document.getElementById('completed-orders-body');
    var completedCount = document.getElementById('completed-count');
    
    if (!completedTable || !completedBody || !completedCount) {
        console.error("Elementos de la tabla de completados no encontrados");
        return;
    }
    
    // Verificar si hay órdenes completadas
    if (!Avika.data || !Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
        completedBody.innerHTML = '<tr id="empty-completed-row"><td colspan="5" class="empty-table">No hay órdenes completadas</td></tr>';
        completedCount.textContent = '0';
        return;
    }
    
    // Eliminar fila vacía si existe
    var emptyRow = document.getElementById('empty-completed-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Actualizar contador
    completedCount.textContent = Avika.data.completedOrders.length;
    
    // Determinar cuántas órdenes mostrar
    var ordersToShow = showAll ? Avika.data.completedOrders : Avika.data.completedOrders.slice(0, 20);
    
    // Mantener un registro de las filas actualizadas para eliminar las obsoletas después
    var updatedRowIds = [];
    
    // Actualizar o crear filas para cada orden
    for (var i = 0; i < ordersToShow.length; i++) {
        var order = ordersToShow[i];
        var rowId = 'completed-order-' + order.id;
        updatedRowIds.push(rowId);
        
        // Preparar los datos de la celda
        var rowData = {};
        
        // Columna de platillo
        var dishContent = '<div class="dish-name">' + (order.quantity > 1 ? order.quantity + 'x ' : '') + order.dish + '</div>';
        dishContent += '<div class="dish-info">';
        
        // Mostrar ticket ID si existe
        if (order.ticketId) {
            dishContent += '<span class="ticket-id">Ticket: ' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
        }
        
        // Mostrar tipo de servicio
        var serviceText = order.serviceType === 'comedor' ? 'Comedor' : 
                         (order.serviceType === 'domicilio' ? 'Domicilio' : 'Para llevar');
        dishContent += '<span class="service-type ' + order.serviceType + '">' + serviceText + '</span>';
        
        // Mostrar personalizaciones si existen
        if (order.customizations && order.customizations.length > 0) {
            dishContent += '<span class="customizations">' + order.customizations.join(', ') + '</span>';
        }
        
        dishContent += '</div>';
        rowData['dish'] = dishContent;
        
        // Columna de tiempos
        var timeContent = '<div class="time-container">';
        
        // Tiempo de inicio
        timeContent += '<div class="time-item"><span class="time-label">Inicio:</span> ' + 
                      '<span class="time-value">' + (order.startTimeFormatted || '--:--:--') + '</span></div>';
        
        // Tiempo de preparación
        timeContent += '<div class="time-item"><span class="time-label">Preparación:</span> ' + 
                      '<span class="time-value">' + (order.preparationTimeFormatted || '--:--:--') + '</span></div>';
        
        // Tiempo de entrega (solo para domicilio)
        if (order.serviceType === 'domicilio' && order.deliveryTimeFormatted) {
            timeContent += '<div class="time-item"><span class="time-label">Entrega:</span> ' + 
                          '<span class="time-value">' + order.deliveryTimeFormatted + '</span></div>';
        }
        
        timeContent += '</div>';
        rowData['time'] = timeContent;
        
        // Actualizar o crear la fila usando la función optimizada
        if (Avika.optimization && typeof Avika.optimization.updateTableRow === 'function') {
            var row = Avika.optimization.updateTableRow(completedBody, rowData, rowId);
            row.className = 'completed-order-row';
            row.setAttribute('data-order-id', order.id);
        }
    }
    
    // Eliminar filas obsoletas
    var allRows = completedBody.querySelectorAll('tr');
    for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        if (row.id && row.id !== 'empty-completed-row' && updatedRowIds.indexOf(row.id) === -1) {
            row.remove();
        }
    }
    
    // Actualizar temporizadores
    this.updateTimers();
    
    // Mostrar botón "Ver más" si hay más órdenes
    var showMoreContainer = document.getElementById('show-more-completed-container');
    if (showMoreContainer) {
        if (!showAll && Avika.data.completedOrders.length > 20) {
            showMoreContainer.style.display = 'block';
            var showMoreButton = document.getElementById('show-more-completed');
            if (showMoreButton) {
                showMoreButton.textContent = 'Ver todas (' + Avika.data.completedOrders.length + ')';
            }
        } else {
            showMoreContainer.style.display = 'none';
        }
    }
};

// Actualizar tabla de órdenes pendientes
Avika.ui.updatePendingTable = function() {
    var pendingTable = document.getElementById('pending-orders-table');
    var pendingBody = document.getElementById('pending-orders-body');
    var pendingCount = document.getElementById('pending-count');
    
    if (!pendingTable || !pendingBody || !pendingCount) {
        console.error("Elementos de la tabla de pendientes no encontrados");
        return;
    }
    
    // Verificar si hay órdenes pendientes
    if (!Avika.data || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
        pendingBody.innerHTML = '<tr id="empty-pending-row"><td colspan="5" class="empty-table">No hay órdenes pendientes</td></tr>';
        pendingCount.textContent = '0';
        return;
    }
    
    // Eliminar fila vacía si existe
    var emptyRow = document.getElementById('empty-pending-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Actualizar contador
    pendingCount.textContent = Avika.data.pendingOrders.length;
    
    // Mantener un registro de las filas actualizadas para eliminar las obsoletas después
    var updatedRowIds = [];
    
    // Actualizar o crear filas para cada orden
    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
        var order = Avika.data.pendingOrders[i];
        var rowId = 'pending-order-' + order.id;
        updatedRowIds.push(rowId);
        
        // Preparar los datos de la celda
        var rowData = this.generatePendingRowData(order);
        
        // Actualizar o crear la fila usando la función optimizada
        if (Avika.optimization && typeof Avika.optimization.updateTableRow === 'function') {
            var row = Avika.optimization.updateTableRow(pendingBody, rowData, rowId);
            row.className = 'pending-order-row';
            row.setAttribute('data-order-id', order.id);
            
            // Aplicar clases adicionales según el estado
            if (order.finished) {
                row.classList.add('finished');
            }
            
            if (order.allTicketItemsFinished) {
                row.classList.add('all-ticket-items-finished');
            }
        }
    }
    
    // Eliminar filas obsoletas
    var allRows = pendingBody.querySelectorAll('tr');
    for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        if (row.id && row.id !== 'empty-pending-row' && updatedRowIds.indexOf(row.id) === -1) {
            row.remove();
        }
    }
    
    // Actualizar temporizadores
    this.updateTimers();
};

// Actualizar temporizadores de todas las tablas
Avika.ui.updateTimers = function() {
    // Usar la función existente de ui-timers.js si está disponible
    if (typeof this.updateAllTimers === 'function') {
        this.updateAllTimers();
    }
};

// Generar datos de fila para órdenes pendientes
Avika.ui.generatePendingRowData = function(order) {
    var rowData = {};
    var isSpecialCombo = order.isSpecialCombo;
    
    // Columna de platillo
    var dishContent = '<div class="dish-name">';
    dishContent += (order.quantity > 1 ? order.quantity + 'x ' : '') + order.dish;
    
    // Añadir etiqueta de combo si es necesario
    if (isSpecialCombo) {
        dishContent += '<span class="combo-label">COMBO</span>';
    }
    
    dishContent += '</div>';
    dishContent += '<div class="dish-info">';
    
    // Mostrar ticket ID si existe
    if (order.ticketId) {
        dishContent += '<span class="ticket-id">Ticket: ' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
    }
    
    // Mostrar tipo de servicio
    var serviceText = order.serviceType === 'comedor' ? 'Comedor' : 
                     (order.serviceType === 'domicilio' ? 'Domicilio' : 'Para llevar');
    dishContent += '<span class="service-type ' + order.serviceType + '">' + serviceText + '</span>';
    
    // Mostrar categoría
    dishContent += '<span class="category-type">' + (order.category || 'Sin categoría') + '</span>';
    
    // Mostrar personalizaciones si existen
    if (order.customizations && order.customizations.length > 0) {
        dishContent += '<span class="customizations">' + order.customizations.join(', ') + '</span>';
    }
    
    dishContent += '</div>';
    rowData['dish'] = dishContent;
    
    // Columna de tiempo
    var timeContent = '<div class="time-container">';
    
    // Tiempo de inicio
    timeContent += '<div class="time-item"><span class="time-label">Inicio:</span> ' + 
                  '<span class="time-value">' + (order.startTimeFormatted || '--:--:--') + '</span></div>';
    
    // Tiempo transcurrido
    timeContent += '<div class="time-item elapsed" data-start-time="' + order.startTime + '">' + 
                  '<span class="time-label">Tiempo:</span> ' + 
                  '<span class="time-value timer">Calculando...</span></div>';
    
    timeContent += '</div>';
    rowData['time'] = timeContent;
    
    // Columna de acciones
    var actionContent = '<div class="action-container">';
    
    // Botones según el tipo de orden
    if (isSpecialCombo) {
        // Para combos especiales, mostrar botones de cocina caliente y fría
        var hotKitchenClass = order.hotKitchenFinished ? ' finished' : '';
        var hotKitchenText = order.hotKitchenFinished ? 'Cocina Caliente ✓' : 'Cocina Caliente';
        
        actionContent += '<button class="action-btn hot-kitchen-btn' + hotKitchenClass + '" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.finishHotKitchen(\'' + order.id + '\')">' + 
                        hotKitchenText + '</button>';
        
        var coldKitchenClass = order.coldKitchenFinished ? ' finished' : '';
        var coldKitchenText = order.coldKitchenFinished ? 'Cocina Fría ✓' : 'Cocina Fría';
        
        actionContent += '<button class="action-btn cold-kitchen-btn' + coldKitchenClass + '" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.finishColdKitchen(\'' + order.id + '\')">' + 
                        coldKitchenText + '</button>';
        
    } else if (order.ticketId) {
        // Para platillos de un ticket, mostrar botón de finalizar individual
        var finishClass = order.finished ? ' finished' : '';
        var finishText = order.finished ? 'Terminado ✓' : 'Terminar';
        
        actionContent += '<button class="action-btn finish-btn' + finishClass + '" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.finishIndividualItem(\'' + order.id + '\')">' + 
                        finishText + '</button>';
        
    } else if (order.serviceType === 'domicilio') {
        // Para órdenes a domicilio individuales, mostrar botón de finalizar cocina
        actionContent += '<button class="action-btn finish-kitchen-btn" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.finishKitchenForDelivery(\'' + order.id + '\')">' + 
                        'Listo para Reparto</button>';
        
    } else {
        // Para órdenes normales, mostrar botón de finalizar
        actionContent += '<button class="action-btn finish-btn" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.finishPreparation(\'' + order.id + '\')">' + 
                        'Terminar</button>';
    }
    
    actionContent += '</div>';
    rowData['action'] = actionContent;
    
    return rowData;
};

// Actualizar tabla de órdenes en reparto
Avika.ui.updateDeliveryTable = function() {
    var deliveryTable = document.getElementById('delivery-orders-table');
    var deliveryBody = document.getElementById('delivery-orders-body');
    var deliveryCount = document.getElementById('delivery-count');
    
    if (!deliveryTable || !deliveryBody || !deliveryCount) {
        console.error("Elementos de la tabla de reparto no encontrados");
        return;
    }
    
    // Verificar si hay órdenes en reparto
    if (!Avika.data || !Avika.data.deliveryOrders || Avika.data.deliveryOrders.length === 0) {
        deliveryBody.innerHTML = '<tr id="empty-delivery-row"><td colspan="5" class="empty-table">No hay órdenes en reparto</td></tr>';
        deliveryCount.textContent = '0';
        return;
    }
    
    // Eliminar fila vacía si existe
    var emptyRow = document.getElementById('empty-delivery-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Actualizar contador
    deliveryCount.textContent = Avika.data.deliveryOrders.length;
    
    // Mantener un registro de las filas actualizadas para eliminar las obsoletas después
    var updatedRowIds = [];
    
    // Actualizar o crear filas para cada orden
    for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
        var order = Avika.data.deliveryOrders[i];
        var rowId = 'delivery-order-' + order.id;
        updatedRowIds.push(rowId);
        
        // Preparar los datos de la celda
        var rowData = this.generateDeliveryRowData(order);
        
        // Actualizar o crear la fila usando la función optimizada
        if (Avika.optimization && typeof Avika.optimization.updateTableRow === 'function') {
            var row = Avika.optimization.updateTableRow(deliveryBody, rowData, rowId);
            row.className = 'delivery-order-row';
            row.setAttribute('data-order-id', order.id);
        }
    }
    
    // Eliminar filas obsoletas
    var allRows = deliveryBody.querySelectorAll('tr');
    for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        if (row.id && row.id !== 'empty-delivery-row' && updatedRowIds.indexOf(row.id) === -1) {
            row.remove();
        }
    }
    
    // Actualizar temporizadores
    this.updateTimers();
};

// Generar datos de fila para órdenes en reparto
Avika.ui.generateDeliveryRowData = function(order) {
    var rowData = {};
    
    // Columna de platillo
    var dishContent = '<div class="dish-name">' + (order.quantity > 1 ? order.quantity + 'x ' : '') + order.dish + '</div>';
    dishContent += '<div class="dish-info">';
    
    // Mostrar ticket ID si existe
    if (order.ticketId) {
        dishContent += '<span class="ticket-id">Ticket: ' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
    }
    
    // Mostrar tipo de servicio
    var serviceText = order.serviceType === 'comedor' ? 'Comedor' : 
                     (order.serviceType === 'domicilio' ? 'Domicilio' : 'Para llevar');
    dishContent += '<span class="service-type ' + order.serviceType + '">' + serviceText + '</span>';
    
    // Mostrar personalizaciones si existen
    if (order.customizations && order.customizations.length > 0) {
        dishContent += '<span class="customizations">' + order.customizations.join(', ') + '</span>';
    }
    
    dishContent += '</div>';
    rowData['dish'] = dishContent;
    
    // Columna de tiempos
    var timeContent = '<div class="time-container">';
    
    // Tiempo de preparación
    timeContent += '<div class="time-item"><span class="time-label">Preparación:</span> ' + 
                  '<span class="time-value">' + (order.preparationTimeFormatted || '--:--:--') + '</span></div>';
    
    // Tiempo de salida (si existe)
    if (order.deliveryDepartureTime) {
        timeContent += '<div class="time-item"><span class="time-label">Salida:</span> ' + 
                      '<span class="time-value">' + (order.deliveryDepartureTimeFormatted || '--:--:--') + '</span></div>';
        
        // Tiempo transcurrido desde la salida
        timeContent += '<div class="time-item delivery-elapsed" data-departure-time="' + order.deliveryDepartureTime + '">' + 
                      '<span class="time-label">Tiempo:</span> ' + 
                      '<span class="time-value delivery-timer">Calculando...</span></div>';
    } else {
        // Si no hay tiempo de salida, mostrar mensaje
        timeContent += '<div class="time-item"><span class="time-label">Estado:</span> ' + 
                      '<span class="time-value">Listo para salir</span></div>';
    }
    
    timeContent += '</div>';
    rowData['time'] = timeContent;
    
    // Columna de acciones
    var actionContent = '<div class="action-container">';
    
    // Botón de salida (solo si no tiene tiempo de salida)
    if (!order.deliveryDepartureTime) {
        actionContent += '<button class="action-btn departure-btn" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.markDeliveryDeparture(\'' + order.id + '\')">' + 
                        'Registrar Salida</button>';
    }
    
    // Botón de llegada (solo si tiene tiempo de salida)
    if (order.deliveryDepartureTime) {
        actionContent += '<button class="action-btn arrival-btn" ' + 
                        'data-order-id="' + order.id + '" ' + 
                        'onclick="Avika.orders.markDeliveryArrival(\'' + order.id + '\')">' + 
                        'Registrar Entrega</button>';
    }
    
    actionContent += '</div>';
    rowData['action'] = actionContent;
    
    return rowData;
};
