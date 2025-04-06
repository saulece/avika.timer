// js/modules/avika-fixes.js - Consolidación de correcciones y mejoras
(function() {
    console.log("Aplicando correcciones consolidadas para Avika...");
    
    // Asegurar que tenemos los objetos básicos
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    if (!Avika.orders) Avika.orders = {};
    if (!Avika.fixes) Avika.fixes = {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('fixes');
    }
    
    // ====================================================================
    // PARTE 1: CORRECCIONES PARA TEMPORIZADORES Y TABLAS
    // ====================================================================
    
    // Fix para actualizar todos los temporizadores de manera eficiente
    A// Fix para actualizar todos los temporizadores de manera eficiente
Avika.ui.updateAllTimers = function() {
    try {
        // Actualizar todos los temporizadores
        document.querySelectorAll('.timer-cell[data-start-time]').forEach(function(cell) {
            var startTime = cell.getAttribute('data-start-time');
            if (startTime) {
                cell.textContent = Avika.dateUtils.calculateElapsedTime(startTime);
            }
        });
        
        // Actualizar colores de temporizadores
        if (Avika.ui && typeof Avika.ui.updateTimerColors === 'function') {
            Avika.ui.updateTimerColors();
        }
    } catch (e) {
        console.error("Error al actualizar temporizadores:", e);
    }
};
    
    // Fix para las tablas de órdenes - asegura que los datos se muestran correctamente
    const originalUpdatePendingTable = Avika.ui.updatePendingTable;
    
    // Solo reemplazar si no ha sido reemplazado por el módulo de combos
    if (originalUpdatePendingTable && !Avika.fixes.pendingTableFixed) {
        Avika.ui.updatePendingTable = function() {
            try {
                // Si existe la función original, usarla primero
                if (typeof originalUpdatePendingTable === 'function') {
                    originalUpdatePendingTable.call(this);
                } else {
                    // Implementación básica si no existe la original
                    var pendingBody = document.getElementById('pending-body');
                    if (!pendingBody) return;
                    
                    pendingBody.innerHTML = '';
                    
                    // Actualizar contador
                    var pendingCount = document.getElementById('pending-count');
                    if (pendingCount) {
                        pendingCount.textContent = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
                    }
                    
                    if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                        var emptyRow = pendingBody.insertRow();
                        var emptyCell = emptyRow.insertCell(0);
                        emptyCell.colSpan = 5;
                        emptyCell.textContent = "No hay platillos en preparación";
                        emptyCell.style.textAlign = "center";
                        return;
                    }
                    
                    // Implementación base para mostrar órdenes pendientes
                    Avika.data.pendingOrders.forEach(function(order, index) {
                        var row = pendingBody.insertRow();
                        
                        // Platillo
                        var dishCell = row.insertCell(0);
                        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                        
                        // Hora de inicio
                        var startCell = row.insertCell(1);
                        if (Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function') {
                            startCell.textContent = Avika.dateUtils.formatTime(order.startTime);
                        } else if (typeof formatTime === 'function') {
                            startCell.textContent = formatTime(order.startTime);
                        } else {
                            // Formato básico
                            var d = new Date(order.startTime);
                            startCell.textContent = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                        }
                        
                        // Temporizador
                        var timerCell = row.insertCell(2);
                        timerCell.className = 'timer-cell';
                        timerCell.setAttribute('data-start-time', order.startTime);
                        if (Avika.dateUtils && typeof Avika.dateUtils.calculateElapsedTime === 'function') {
                            timerCell.textContent = Avika.dateUtils.calculateElapsedTime(order.startTime);
                        } else if (typeof calculateElapsedTime === 'function') {
                            timerCell.textContent = calculateElapsedTime(order.startTime);
                        } else {
                            // Formato básico
                            var now = new Date();
                            var start = new Date(order.startTime);
                            var elapsed = Math.floor((now - start) / 1000);
                            var mins = Math.floor(elapsed / 60);
                            var secs = elapsed % 60;
                            timerCell.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                        }
                        
                        // Detalles
                        var detailsCell = row.insertCell(3);
                        
                        // Servicio
                        var serviceText = '';
                        if (Avika.config && Avika.config.serviceNames && Avika.config.serviceNames[order.service]) {
                            serviceText = Avika.config.serviceNames[order.service];
                        } else {
                            switch (order.service) {
                                case 'comedor': serviceText = 'Comedor'; break;
                                case 'domicilio': serviceText = 'Domicilio'; break;
                                case 'para-llevar': serviceText = 'Ordena y Espera'; break;
                                default: serviceText = order.service;
                            }
                        }
                        
                        // Personalización
                        var customText = '';
                        if (order.customizations && order.customizations.length > 0) {
                            order.customizations.forEach(function(code) {
                                if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                                    customText += Avika.config.customizationOptions[code] + ', ';
                                } else {
                                    customText += code + ', ';
                                }
                            });
                            customText = customText.slice(0, -2); // Eliminar última coma y espacio
                        }
                        
                        // Notas
                        var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
                        
                        // Ticket ID si es parte de un ticket
                        var ticketText = order.ticketId ? '<br><small>Ticket: ' + order.ticketId.split('-')[1] + '</small>' : '';
                        
                        // Combinar toda la información
                        detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                              (customText ? '<br>' + customText : '') + 
                                              notesText + 
                                              ticketText;
                        
                        // Estado para tickets
                        if (order.completed) {
                            detailsCell.innerHTML += '<br><span style="color:#2ecc71;"><i>Listo - Esperando otros platillos</i></span>';
                        }
                        
                        // Acciones
                        var actionsCell = row.insertCell(4);
                        
                        // Botón para marcar como completado
                        var completeBtn = document.createElement('button');
                        completeBtn.textContent = 'Listo';
                        completeBtn.className = 'action-btn';
                        completeBtn.style.backgroundColor = '#2ecc71';
                        completeBtn.style.color = 'white';
                        completeBtn.style.border = 'none';
                        completeBtn.style.padding = '10px 15px';
                        completeBtn.style.borderRadius = '4px';
                        completeBtn.style.cursor = 'pointer';
                        
                        // Deshabilitar si ya está completado (esperando otros platillos)
                        if (order.completed) {
                            completeBtn.disabled = true;
                            completeBtn.style.backgroundColor = '#bdc3c7';
                            completeBtn.style.cursor = 'default';
                        }
                        
                        completeBtn.onclick = function() {
                            if (Avika.orders && typeof Avika.orders.completeOrder === 'function') {
                                Avika.orders.completeOrder(index);
                            } else {
                                // Implementación básica si no existe la función
                                order.finishTime = new Date();
                                
                                // Calcular tiempo de preparación
                                var startTime = new Date(order.startTime);
                                var endTime = order.finishTime;
                                var prepTimeMillis = endTime - startTime;
                                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                                
                                // Formato del tiempo de preparación
                                var prepMins = Math.floor(prepTimeSecs / 60);
                                var prepSecs = prepTimeSecs % 60;
                                
                                order.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
                                
                                // Mover a órdenes completadas
                                if (!Avika.data.completedOrders) {
                                    Avika.data.completedOrders = [];
                                }
                                
                                Avika.data.completedOrders.unshift(order);
                                
                                // Eliminar de órdenes pendientes
                                Avika.data.pendingOrders.splice(index, 1);
                                
                                // Actualizar tabla
                                Avika.ui.updatePendingTable();
                                
                                // Guardar datos
                                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                    Avika.storage.guardarDatosLocales();
                                }
                                
                                // Mostrar notificación
                                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                    Avika.ui.showNotification("Platillo '" + order.dish + "' marcado como completado", 3000);
                                }
                            }
                        };
                        
                        actionsCell.appendChild(completeBtn);
                    });
                }
                
                // Mejoras adicionales para todas las filas
                var rows = document.querySelectorAll('#pending-body tr');
                rows.forEach(function(row) {
                    // Destacar tiempos prolongados
                    var timerCell = row.querySelector('.timer-cell');
                    if (timerCell) {
                        var timeText = timerCell.textContent;
                        if (timeText.includes('h') || timeText.match(/^(\d+):/) && parseInt(timeText.match(/^(\d+):/)[1]) >= 10) {
                            timerCell.style.color = '#e74c3c';
                            timerCell.style.fontWeight = 'bold';
                        }
                    }
                });
                
            } catch (e) {
                console.error("Error al actualizar tabla de pedidos pendientes:", e);
                
                // En caso de error, intentar usar la función original
                if (typeof originalUpdatePendingTable === 'function') {
                    originalUpdatePendingTable.call(this);
                }
            }
        };
        
        // Marcar como corregido para evitar duplicar arreglos
        Avika.fixes.pendingTableFixed = true;
    }
    
    // ====================================================================
    // PARTE 2: CORRECCIONES PARA SELECCIÓN DE HORA
    // ====================================================================
    
    // Fix para selección de hora personalizada
    Avika.ui.showTimeSelectModal = function(callback, title) {
        try {
            title = title || 'Seleccionar hora';
            
            // Crear modal
            var modalContainer = document.createElement('div');
            modalContainer.style.position = 'fixed';
            modalContainer.style.top = '0';
            modalContainer.style.left = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modalContainer.style.display = 'flex';
            modalContainer.style.justifyContent = 'center';
            modalContainer.style.alignItems = 'center';
            modalContainer.style.zIndex = '9999';
            
            // Contenido del modal
            var modalContent = document.createElement('div');
            modalContent.style.backgroundColor = 'white';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '5px';
            modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            modalContent.style.maxWidth = '90%';
            modalContent.style.width = '400px';
            modalContent.style.textAlign = 'center';
            
            // Título
            var titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.marginTop = '0';
            titleElement.style.marginBottom = '20px';
            
            // Contenedor de inputs
            var timeContainer = document.createElement('div');
            timeContainer.style.display = 'flex';
            timeContainer.style.justifyContent = 'center';
            timeContainer.style.marginBottom = '20px';
            
            // Input de hora
            var hourInput = document.createElement('input');
            hourInput.type = 'number';
            hourInput.min = '0';
            hourInput.max = '23';
            hourInput.value = new Date().getHours();
            hourInput.style.width = '60px';
            hourInput.style.fontSize = '18px';
            hourInput.style.padding = '8px';
            hourInput.style.textAlign = 'center';
            hourInput.style.marginRight = '5px';
            
            // Input de minutos
            var minuteInput = document.createElement('input');
            minuteInput.type = 'number';
            minuteInput.min = '0';
            minuteInput.max = '59';
            minuteInput.value = new Date().getMinutes();
            minuteInput.style.width = '60px';
            minuteInput.style.fontSize = '18px';
            minuteInput.style.padding = '8px';
            minuteInput.style.textAlign = 'center';
            minuteInput.style.margin = '0 5px';
            
            // Input de segundos
            var secondInput = document.createElement('input');
            secondInput.type = 'number';
            secondInput.min = '0';
            secondInput.max = '59';
            secondInput.value = new Date().getSeconds();
            secondInput.style.width = '60px';
            secondInput.style.fontSize = '18px';
            secondInput.style.padding = '8px';
            secondInput.style.textAlign = 'center';
            secondInput.style.marginLeft = '5px';
            
            // Separadores
            var separator1 = document.createElement('span');
            separator1.textContent = ':';
            separator1.style.fontSize = '24px';
            separator1.style.margin = '0 5px';
            
            var separator2 = document.createElement('span');
            separator2.textContent = ':';
            separator2.style.fontSize = '24px';
            separator2.style.margin = '0 5px';
            
            // Añadir elementos al contenedor de tiempo
            timeContainer.appendChild(hourInput);
            timeContainer.appendChild(separator1);
            timeContainer.appendChild(minuteInput);
            timeContainer.appendChild(separator2);
            timeContainer.appendChild(secondInput);
            
            // Contenedor de botones
            var buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'center';
            buttonsContainer.style.gap = '10px';
            
            // Botón para usar hora actual
            var nowButton = document.createElement('button');
            nowButton.textContent = 'Usar hora actual';
            nowButton.style.padding = '8px 15px';
            nowButton.style.backgroundColor = '#3498db';
            nowButton.style.color = 'white';
            nowButton.style.border = 'none';
            nowButton.style.borderRadius = '4px';
            nowButton.style.cursor = 'pointer';
            
            // Botón para usar hora personalizada
            var customButton = document.createElement('button');
            customButton.textContent = 'Usar hora personalizada';
            customButton.style.padding = '8px 15px';
            customButton.style.backgroundColor = '#2196F3';
            customButton.style.color = 'white';
            customButton.style.border = 'none';
            customButton.style.borderRadius = '4px';
            customButton.style.cursor = 'pointer';
            
            // Añadir botones al contenedor
            buttonsContainer.appendChild(nowButton);
            buttonsContainer.appendChild(customButton);
            
            // Añadir elementos al modal
            modalContent.appendChild(titleElement);
            modalContent.appendChild(timeContainer);
            modalContent.appendChild(buttonsContainer);
            modalContainer.appendChild(modalContent);
            
            // Añadir modal al documento
            document.body.appendChild(modalContainer);
            
            // Enfocar el input de hora
            setTimeout(function() {
                hourInput.focus();
            }, 100);
            
            // Evento para botón de hora actual
            nowButton.addEventListener('click', function() {
                document.body.removeChild(modalContainer);
                if (typeof callback === 'function') {
                    callback(new Date());
                }
            });
            
            // Evento para botón de hora personalizada
            customButton.addEventListener('click', function() {
                try {
                    var hours = parseInt(hourInput.value) || 0;
                    var minutes = parseInt(minuteInput.value) || 0;
                    var seconds = parseInt(secondInput.value) || 0;
                    
                    // Validar valores
                    hours = Math.min(Math.max(hours, 0), 23);
                    minutes = Math.min(Math.max(minutes, 0), 59);
                    seconds = Math.min(Math.max(seconds, 0), 59);
                    
                    // Crear fecha con la hora seleccionada
                    var selectedDate = new Date();
                    selectedDate.setHours(hours, minutes, seconds);
                    
                    document.body.removeChild(modalContainer);
                    if (typeof callback === 'function') {
                        callback(selectedDate);
                    }
                } catch (e) {
                    console.error("Error al procesar hora personalizada:", e);
                    if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error al procesar la hora: " + e.message);
                    }
                }
            });
            
            // Evento para cerrar con ESC
            function handleKeyDown(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(modalContainer);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            }
            
            document.addEventListener('keydown', handleKeyDown);
            
            return true;
        } catch (e) {
            console.error("Error al mostrar modal de selección de hora:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al mostrar selector de hora: " + e.message);
            }
            return false;
        }
    };
    
    // ====================================================================
    // PARTE 3: CORRECCIONES PARA DESBLOQUEO DE EMERGENCIA
    // ====================================================================
    
    // Fix para desbloquear tickets o pedidos atorados
    Avika.ui.showForceCompleteModal = function() {
        console.log("Mostrando modal para forzar completado");
        
        try {
            if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("No hay platillos pendientes para desbloquear", 3000);
                }
                return;
            }
            
            // Agrupar por tickets
            var tickets = {};
            var singleOrders = [];
            
            Avika.data.pendingOrders.forEach(function(order, index) {
                if (order.ticketId) {
                    if (!tickets[order.ticketId]) {
                        tickets[order.ticketId] = [];
                    }
                    tickets[order.ticketId].push({order: order, index: index});
                } else {
                    singleOrders.push({order: order, index: index});
                }
            });
            
            // Crear modal
            var modalContainer = document.createElement('div');
            modalContainer.style.position = 'fixed';
            modalContainer.style.top = '0';
            modalContainer.style.left = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
            modalContainer.style.zIndex = '9999';
            modalContainer.style.display = 'flex';
            modalContainer.style.justifyContent = 'center';
            modalContainer.style.alignItems = 'center';
            
            // Contenido del modal
            var modalContent = document.createElement('div');
            modalContent.style.backgroundColor = 'white';
            modalContent.style.borderRadius = '5px';
            modalContent.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            modalContent.style.width = '80%';
            modalContent.style.maxWidth = '600px';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.padding = '20px';
            
            // Título
            var title = document.createElement('h2');
            title.textContent = 'Desbloquear Platillos o Tickets';
            title.style.color = '#e74c3c';
            title.style.borderBottom = '1px solid #eee';
            title.style.paddingBottom = '10px';
            title.style.marginTop = '0';
            
            // Advertencia
            var warning = document.createElement('p');
            warning.innerHTML = '<strong>¡ADVERTENCIA!</strong> Esta función es solo para emergencias cuando un platillo o ticket no se puede completar normalmente.';
            warning.style.backgroundColor = '#fff3cd';
            warning.style.color = '#856404';
            warning.style.padding = '10px';
            warning.style.borderRadius = '4px';
            warning.style.marginBottom = '20px';
            
            // Contenedor de listas
            var listsContainer = document.createElement('div');
            listsContainer.style.display = 'flex';
            listsContainer.style.flexDirection = 'column';
            listsContainer.style.gap = '20px';
            
            // Si hay tickets, mostrarlos primero
            if (Object.keys(tickets).length > 0) {
                var ticketsSection = document.createElement('div');
                ticketsSection.style.marginBottom = '20px';
                
                var ticketsTitle = document.createElement('h3');
                ticketsTitle.textContent = 'Tickets completos:';
                ticketsTitle.style.marginTop = '0';
                ticketsTitle.style.marginBottom = '10px';
                
                var ticketsList = document.createElement('div');
                ticketsList.style.display = 'flex';
                ticketsList.style.flexDirection = 'column';
                ticketsList.style.gap = '10px';
                
                Object.keys(tickets).forEach(function(ticketId) {
                    var ticketOrders = tickets[ticketId];
                    
                    var ticketItem = document.createElement('div');
                    ticketItem.style.backgroundColor = '#f8f9fa';
                    ticketItem.style.border = '1px solid #dee2e6';
                    ticketItem.style.borderRadius = '4px';
                    ticketItem.style.padding = '10px 15px';
                    
                    // Título del ticket
                    var ticketHeader = document.createElement('div');
                    ticketHeader.style.display = 'flex';
                    ticketHeader.style.justifyContent = 'space-between';
                    ticketHeader.style.alignItems = 'center';
                    ticketHeader.style.marginBottom = '10px';
                    
                    var ticketLabel = document.createElement('span');
                    ticketLabel.textContent = 'Ticket #' + ticketId.split('-')[1] + ' (' + ticketOrders.length + ' platillos)';
                    ticketLabel.style.fontWeight = 'bold';
                    
                    var unlockTicketBtn = document.createElement('button');
                    unlockTicketBtn.textContent = 'Desbloquear ticket';
                    unlockTicketBtn.style.backgroundColor = '#e74c3c';
                    unlockTicketBtn.style.color = 'white';
                    unlockTicketBtn.style.border = 'none';
                    unlockTicketBtn.style.padding = '6px 12px';
                    unlockTicketBtn.style.borderRadius = '4px';
                    unlockTicketBtn.style.cursor = 'pointer';
                    
                    unlockTicketBtn.onclick = function() {
                        // Ordenar índices de mayor a menor para evitar problemas al eliminar
                        var orderIndices = ticketOrders.map(function(item) {
                            return item.index;
                        }).sort(function(a, b) {
                            return b - a; // orden descendente
                        });
                        
                        // Completar todas las órdenes del ticket
                        var now = new Date();
                        
                        orderIndices.forEach(function(index) {
                            if (index < Avika.data.pendingOrders.length) {
                                var order = Avika.data.pendingOrders[index];
                                
                                // Marcar como completado
                                order.finishTime = now;
                                
                                // Calcular tiempo
                                var startTime = new Date(order.startTime);
                                var prepTimeMillis = now - startTime;
                                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                                var prepMins = Math.floor(prepTimeSecs / 60);
                                var prepSecs = prepTimeSecs % 60;
                                
                                order.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
                                
                                // Añadir a completados
                                if (!Avika.data.completedOrders) {
                                    Avika.data.completedOrders = [];
                                }
                                
                                Avika.data.completedOrders.unshift(order);
                                
                                // Eliminar de pendientes
                                Avika.data.pendingOrders.splice(index, 1);
                            }
                        });
                        
                        // Guardar y actualizar
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                        
                        // Cerrar modal
                        document.body.removeChild(modalContainer);
                        
                        // Actualizar tablas
                        Avika.ui.updatePendingTable();
                        if (typeof Avika.ui.updateCompletedTable === 'function') {
                            Avika.ui.updateCompletedTable(false);
                        }
                        
                        // Notificar
                        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                            Avika.ui.showNotification("Ticket #" + ticketId.split('-')[1] + " completado manualmente", 3000);
                        }
                    };
                    
                    ticketHeader.appendChild(ticketLabel);
                    ticketHeader.appendChild(unlockTicketBtn);
                    
                    // Listado de platillos
                    var platillosList = document.createElement('ul');
                    platillosList.style.listStyleType = 'none';
                    platillosList.style.padding = '0';
                    platillosList.style.margin = '0';
                    
                    ticketOrders.forEach(function(item) {
                        var platilloItem = document.createElement('li');
                        platilloItem.textContent = item.order.dish + (item.order.quantity > 1 ? ' (' + item.order.quantity + ')' : '');
                        platilloItem.style.padding = '3px 0';
                        platillosList.appendChild(platilloItem);
                    });
                    
                    ticketItem.appendChild(ticketHeader);
                    ticketItem.appendChild(platillosList);
                    ticketsList.appendChild(ticketItem);
                });
                
                ticketsSection.appendChild(ticketsTitle);
                ticketsSection.appendChild(ticketsList);
                listsContainer.appendChild(ticketsSection);
            }
            
            // Mostrar órdenes individuales
            if (singleOrders.length > 0) {
                var ordersSection = document.createElement('div');
                
                var ordersTitle = document.createElement('h3');
                ordersTitle.textContent = 'Platillos individuales:';
                ordersTitle.style.marginTop = '0';
                ordersTitle.style.marginBottom = '10px';
                
                var ordersList = document.createElement('div');
                ordersList.style.display = 'flex';
                ordersList.style.flexDirection = 'column';
                ordersList.style.gap = '10px';
                
                singleOrders.forEach(function(item) {
                    var orderItem = document.createElement('div');
                    orderItem.style.backgroundColor = '#f8f9fa';
                    orderItem.style.border = '1px solid #dee2e6';
                    orderItem.style.borderRadius = '4px';
                    orderItem.style.padding = '10px 15px';
                    orderItem.style.display = 'flex';
                    orderItem.style.justifyContent = 'space-between';
                    orderItem.style.alignItems = 'center';
                    
                    var orderInfo = document.createElement('div');
                    
                    // Mostrar el nombre del platillo
                    var orderName = document.createElement('div');
                    orderName.textContent = item.order.dish + (item.order.quantity > 1 ? ' (' + item.order.quantity + ')' : '');
                    orderName.style.fontWeight = 'bold';
                    
                    // Mostrar el tiempo transcurrido
                    var orderTime = document.createElement('div');
                    orderTime.textContent = 'Tiempo: ' + (Avika.dateUtils && typeof Avika.dateUtils.calculateElapsedTime === 'function' ? 
                                               Avika.dateUtils.calculateElapsedTime(item.order.startTime) : 
                                               'desconocido');
                    orderTime.style.color = '#666';
                    orderTime.style.fontSize = '0.9em';
                    
                    orderInfo.appendChild(orderName);
                    orderInfo.appendChild(orderTime);
                    
                    // Botón para desbloquear
                    var unlockBtn = document.createElement('button');
                    unlockBtn.textContent = 'Desbloquear';
                    unlockBtn.style.backgroundColor = '#e74c3c';
                    unlockBtn.style.color = 'white';
                    unlockBtn.style.border = 'none';
                    unlockBtn.style.padding = '6px 12px';
                    unlockBtn.style.borderRadius = '4px';
                    unlockBtn.style.cursor = 'pointer';
                    
                    unlockBtn.onclick = function() {
                        var index = item.index;
                        
                        if (index < Avika.data.pendingOrders.length) {
                            var order = Avika.data.pendingOrders[index];
                            
                            // Marcar como completado
                            order.finishTime = new Date();
                            
                            // Calcular tiempo
                            var startTime = new Date(order.startTime);
                            var endTime = order.finishTime;
                            var prepTimeMillis = endTime - startTime;
                            var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                            var prepMins = Math.floor(prepTimeSecs / 60);
                            var prepSecs = prepTimeSecs % 60;
                            
                            order.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
                            
                            // Añadir a completados
                            if (!Avika.data.completedOrders) {
                                Avika.data.completedOrders = [];
                            }
                            
                            Avika.data.completedOrders.unshift(order);
                            
                            // Eliminar de pendientes
                            Avika.data.pendingOrders.splice(index, 1);
                            
                            // Guardar datos
                            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                Avika.storage.guardarDatosLocales();
                            }
                            
                            // Cerrar modal
                            document.body.removeChild(modalContainer);
                            
                            // Actualizar tablas
                            Avika.ui.updatePendingTable();
                            if (typeof Avika.ui.updateCompletedTable === 'function') {
                                Avika.ui.updateCompletedTable(false);
                            }
                            
                            // Notificar
                            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                Avika.ui.showNotification("Platillo '" + order.dish + "' completado manualmente", 3000);
                            }
                        }
                    };
                    
                    orderItem.appendChild(orderInfo);
                    orderItem.appendChild(unlockBtn);
                    
                    ordersList.appendChild(orderItem);
                });
                
                ordersSection.appendChild(ordersTitle);
                ordersSection.appendChild(ordersList);
                listsContainer.appendChild(ordersSection);
            }
            
            // Botón para cerrar
            var closeBtn = document.createElement('button');
            closeBtn.textContent = 'Cancelar';
            closeBtn.style.display = 'block';
            closeBtn.style.margin = '20px auto 0';
            closeBtn.style.padding = '8px 20px';
            closeBtn.style.backgroundColor = '#6c757d';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '4px';
            closeBtn.style.cursor = 'pointer';
            
            closeBtn.onclick = function() {
                document.body.removeChild(modalContainer);
            };
            
            // Ensamblar modal
            modalContent.appendChild(title);
            modalContent.appendChild(warning);
            modalContent.appendChild(listsContainer);
            modalContent.appendChild(closeBtn);
            modalContainer.appendChild(modalContent);
            
            // Añadir al documento
            document.body.appendChild(modalContainer);
            
            // Manejar cierre con ESC
            function handleEscapeKey(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(modalContainer);
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            }
            
            document.addEventListener('keydown', handleEscapeKey);
            
        } catch (e) {
            console.error("Error al mostrar modal de desbloqueo:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al mostrar modal de desbloqueo: " + e.message);
            }
        }
    };
    
    // ====================================================================
    // PARTE 4: INICIALIZACIÓN DE EVENTOS REPARADOS
    // ====================================================================
    
    // Inicializar botón de desbloqueo
    document.addEventListener('DOMContentLoaded', function() {
        try {
            var forceCompleteBtn = document.getElementById('btn-force-complete');
            if (forceCompleteBtn) {
                // Eliminar eventos previos
                var newBtn = forceCompleteBtn.cloneNode(true);
                forceCompleteBtn.parentNode.replaceChild(newBtn, forceCompleteBtn);
                
                // Añadir nuevo evento
                newBtn.addEventListener('click', function() {
                    if (typeof Avika.ui.showForceCompleteModal === 'function') {
                        Avika.ui.showForceCompleteModal();
                    } else {
                        console.error("Función showForceCompleteModal no encontrada");
                        if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                            Avika.ui.showErrorMessage("Función de desbloqueo no disponible");
                        }
                    }
                });
            }
            
            // Implementar función para actualizar tabla completados si no existe
            if (!Avika.ui.updateCompletedTable) {
                Avika.ui.updateCompletedTable = function(showAll) {
                    console.log("Actualizando tabla de completados, mostrar todos:", showAll);
                    
                    var completedBody = document.getElementById('completed-body');
                    if (!completedBody) return;
                    
                    completedBody.innerHTML = '';
                    
                    if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                        var emptyRow = completedBody.insertRow();
                        var emptyCell = emptyRow.insertCell(0);
                        emptyCell.colSpan = 5;
                        emptyCell.textContent = "No hay platillos completados";
                        emptyCell.style.textAlign = "center";
                        return;
                    }
                    
                    // Filtrar para mostrar solo recientes si es necesario
                    var ordersToShow = showAll ? 
                        Avika.data.completedOrders : 
                        Avika.data.completedOrders.slice(0, 10);
                    
                    ordersToShow.forEach(function(order) {
                        var row = completedBody.insertRow();
                        
                        // Platillo
                        var dishCell = row.insertCell(0);
                        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                        
                        // Hora de inicio
                        var startCell = row.insertCell(1);
                        startCell.textContent = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' ? 
                                              Avika.dateUtils.formatTime(order.startTime) : 
                                              (typeof formatTime === 'function' ? formatTime(order.startTime) : '--:--:--');
                        
                        // Hora de fin
                        var endCell = row.insertCell(2);
                        endCell.textContent = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' ? 
                                            Avika.dateUtils.formatTime(order.finishTime) : 
                                            (typeof formatTime === 'function' ? formatTime(order.finishTime) : '--:--:--');
                        
                        // Tiempo total
                        var timeCell = row.insertCell(3);
                        timeCell.textContent = order.prepTime || '--:--';
                        
                        // Detalles
                        var detailsCell = row.insertCell(4);
                        
                        // Servicio
                        var serviceText = '';
                        if (Avika.config && Avika.config.serviceNames && Avika.config.serviceNames[order.service]) {
                            serviceText = Avika.config.serviceNames[order.service];
                        } else {
                            switch (order.service) {
                                case 'comedor': serviceText = 'Comedor'; break;
                                case 'domicilio': serviceText = 'Domicilio'; break;
                                case 'para-llevar': serviceText = 'Ordena y Espera'; break;
                                default: serviceText = order.service;
                            }
                        }
                        
                        // Customización
                        var customText = '';
                        if (order.customizations && order.customizations.length > 0) {
                            order.customizations.forEach(function(code) {
                                if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                                    customText += Avika.config.customizationOptions[code] + ', ';
                                } else {
                                    customText += code + ', ';
                                }
                            });
                            customText = customText.slice(0, -2); // Eliminar última coma y espacio
                        }
                        
                        // Notas
                        var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
                        
                        // Ticket ID
                        var ticketText = order.ticketId ? '<br><small>Ticket: ' + order.ticketId.split('-')[1] + '</small>' : '';
                        
                        // Combinar todo
                        detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                              (customText ? '<br>' + customText : '') + 
                                              notesText + 
                                              ticketText;
                    });
                };
            }
            
            // Inicializar botones para tabla de completados
var btnShowAllHistory = document.getElementById('btn-show-all-history');
var btnShowRecent = document.getElementById('btn-show-recent');
var btnShowStats = document.getElementById('btn-show-stats');
var btnClearHistory = document.getElementById('btn-clear-history');
var btnShowDetailedStats = document.getElementById('btn-show-detailed-stats');
if (btnShowDetailedStats) {
    btnShowDetailedStats.addEventListener('click', function() {
        if (Avika.statsEnhanced && typeof Avika.statsEnhanced.showDetailedStats === 'function') {
            Avika.statsEnhanced.showDetailedStats();
        } else {
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Función de estadísticas detalladas no disponible");
            }
        }
        
        // Actualizar clases de botones
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        this.classList.add('active');
    });
}          
            if (btnShowAllHistory) {
                btnShowAllHistory.addEventListener('click', function() {
                    if (typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable(true);
                    }
                    
                    // Actualizar clases de botones
                    document.querySelectorAll('.filter-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                });
            }
            
            if (btnShowRecent) {
                btnShowRecent.addEventListener('click', function() {
                    if (typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable(false);
                    }
                    
                    // Actualizar clases de botones
                    document.querySelectorAll('.filter-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                });
            }
            
            if (btnShowStats) {
                btnShowStats.addEventListener('click', function() {
                    if (Avika.stats && typeof Avika.stats.calcularPromedios === 'function') {
                        Avika.stats.calcularPromedios();
                    } else {
                        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                            Avika.ui.showNotification("Función de estadísticas no disponible");
                        }
                    }
                    
                    // Actualizar clases de botones
                    document.querySelectorAll('.filter-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                });
            }
            
            if (btnClearHistory) {
                btnClearHistory.addEventListener('click', function() {
                    if (confirm("¿Estás seguro de que deseas eliminar todo el historial de platillos completados?")) {
                        Avika.data.completedOrders = [];
                        
                        if (typeof Avika.ui.updateCompletedTable === 'function') {
                            Avika.ui.updateCompletedTable(false);
                        }
                        
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                        
                        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                            Avika.ui.showNotification("Historial eliminado", 3000);
                        }
                    }
                });
            }
            
            console.log("Eventos de correcciones inicializados");
        } catch (e) {
            console.error("Error al inicializar eventos de correcciones:", e);
        }
    });
    // Inicializar botón de exportación mejorada
document.addEventListener('DOMContentLoaded', function() {
    var btnExportEnhanced = document.getElementById('btn-export-enhanced');
    // Inicializar botón de exportación Excel
var btnExportExcel = document.getElementById('btn-export-excel');
if (btnExportExcel) {
    btnExportExcel.addEventListener('click', function() {
        if (Avika.statsEnhanced && typeof Avika.statsEnhanced.exportToExcel === 'function') {
            Avika.statsEnhanced.exportToExcel();
        } else {
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Función de exportación Excel no disponible");
            }
        }
    });
}
    if (btnExportEnhanced) {
        btnExportEnhanced.addEventListener('click', function() {
            if (Avika.statsEnhanced && typeof Avika.statsEnhanced.exportToCSV === 'function') {
                Avika.statsEnhanced.exportToCSV();
            } else {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Función de exportación mejorada no disponible");
                }
            }
        });
    }
});
// Inicializar botón de tablero
document.addEventListener('DOMContentLoaded', function() {
    var dashboardBtn = document.getElementById('btn-dashboard');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            if (Avika.dashboard) {
                if (Avika.dashboard.isActive) {
                    Avika.dashboard.stop();
                } else {
                    Avika.dashboard.start();
                }
            } else {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Función de tablero no disponible");
                }
            }
        });
    }
});
    console.log("Módulo de correcciones cargado correctamente");
})();
