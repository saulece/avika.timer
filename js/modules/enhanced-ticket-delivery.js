// enhanced-ticket-delivery.js - Implementación mejorada para tickets y entrega
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Aplicando mejoras para tickets y seguimiento de entrega...");
        
        // Asegurar que los objetos existan
        if (!window.Avika) window.Avika = {};
        if (!Avika.ui) Avika.ui = {};
        if (!Avika.data) Avika.data = {};
        if (!Avika.orders) Avika.orders = {};
        
        // Lista de combos especiales (que requieren ambas cocinas)
        const SPECIAL_COMBOS = ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'];
        
        // 1. IMPLEMENTACIÓN PARA VISUALIZACIÓN DE COMPLETADOS
        
        // Función para actualizar tabla de platillos completados
        Avika.ui.updateCompletedTable = function(showAll) {
            try {
                console.log("Actualizando tabla de platillos completados");
                
                var completedBody = document.getElementById('completed-body');
                if (!completedBody) {
                    console.error("Elemento completed-body no encontrado");
                    return;
                }
                
                // Limpiar tabla
                completedBody.innerHTML = '';
                
                // Verificar si hay órdenes completadas
                if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                    var row = document.createElement('tr');
                    var cell = document.createElement('td');
                    cell.colSpan = 5;
                    cell.textContent = "No hay platillos completados";
                    cell.style.textAlign = "center";
                    cell.style.padding = "20px";
                    row.appendChild(cell);
                    completedBody.appendChild(row);
                    return;
                }
                
                // Determinar cuántas órdenes mostrar
                var ordersToShow = Avika.data.completedOrders;
                if (!showAll && ordersToShow.length > 10) {
                    ordersToShow = ordersToShow.slice(0, 10);  // Mostrar solo las 10 más recientes
                }
                
                // Mostrar cada orden completada
                ordersToShow.forEach(function(order) {
                    var row = document.createElement('tr');
                    
                    // Platillo
                    var dishCell = document.createElement('td');
                    dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                    row.appendChild(dishCell);
                    
                    // Hora de inicio
                    var startCell = document.createElement('td');
                    startCell.textContent = Avika.ui.formatTime(order.startTime);
                    row.appendChild(startCell);
                    
                    // Hora de fin
                    var endCell = document.createElement('td');
                    if (order.deliveryTime) {
                        endCell.textContent = Avika.ui.formatTime(order.deliveryTime);
                    } else if (order.finishTime) {
                        endCell.textContent = Avika.ui.formatTime(order.finishTime);
                    } else {
                        endCell.textContent = "--:--:--";
                    }
                    row.appendChild(endCell);
                    
                    // Tiempo total
                    var timeCell = document.createElement('td');
                    timeCell.textContent = order.prepTime || "--:--";
                    row.appendChild(timeCell);
                    
                    // Detalles
                    var detailsCell = document.createElement('td');
                    
                    // Servicio
                    var serviceText = '';
                    switch (order.serviceType || order.service) {
                        case 'comedor': serviceText = 'Comedor'; break;
                        case 'domicilio': serviceText = 'Domicilio'; break;
                        case 'para-llevar': serviceText = 'Ordena y Espera'; break;
                        default: serviceText = order.serviceType || order.service || '';
                    }
                    
                    // Personalización
                    var customText = '';
                    if (order.customizations && order.customizations.length > 0) {
                        customText = order.customizations.map(function(code) {
                            return Avika.config && Avika.config.customizationOptions ? 
                                  (Avika.config.customizationOptions[code] || code) : code;
                        }).join(', ');
                    }
                    
                    // Tiempos intermedios para domicilio
                    var deliveryInfo = '';
                    if (order.serviceType === 'domicilio' || order.service === 'domicilio') {
                        if (order.kitchenFinishedTime) {
                            deliveryInfo += '<br>Cocina: ' + Avika.ui.formatTime(order.kitchenFinishedTime);
                        }
                        if (order.deliveryDepartureTime) {
                            deliveryInfo += '<br>Salida: ' + Avika.ui.formatTime(order.deliveryDepartureTime);
                        }
                        if (order.deliveryTime) {
                            deliveryInfo += '<br>Entrega: ' + Avika.ui.formatTime(order.deliveryTime);
                        }
                    }
                    
                    // Notas
                    var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
                    
                    // Ticket ID
                    var ticketText = order.ticketId ? '<br>Ticket: ' + order.ticketId.replace('ticket-', '#') : '';
                    
                    // Combinar toda la información
                    detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                           (ticketText || '') +
                                           (customText ? '<br>' + customText : '') + 
                                           deliveryInfo +
                                           notesText;
                    row.appendChild(detailsCell);
                    
                    completedBody.appendChild(row);
                });
            } catch (e) {
                console.error("Error al actualizar tabla de completados:", e);
                if (typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al actualizar tabla de completados: " + e.message);
                }
            }
        };
        
        // 2. IMPLEMENTACIÓN PARA COCINAS FRÍAS Y CALIENTES
        
        // Actualizar la función updatePendingTable para mostrar botones de cocina
        const originalUpdatePendingTable = Avika.ui.updatePendingTable;
        
        Avika.ui.updatePendingTable = function() {
            try {
                if (typeof originalUpdatePendingTable === 'function') {
                    // Primero llamar a la implementación original
                    originalUpdatePendingTable.apply(this, arguments);
                }
                
                // Obtener el cuerpo de la tabla
                var pendingBody = document.getElementById('pending-body');
                if (!pendingBody || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                    return;
                }
                
                // Recorrer todas las filas y modificar según se necesite
                var rows = pendingBody.querySelectorAll('tr');
                
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var order = Avika.data.pendingOrders[i];
                    
                    if (!order) continue;
                    
                    // Obtener la celda de acciones
                    var actionsCell = row.querySelector('td:last-child');
                    if (!actionsCell) continue;
                    
                    // Limpiar la celda
                    actionsCell.innerHTML = '';
                    
                    // Combo especial que requiere ambas cocinas
                    if (order.isSpecialCombo || (Avika.config && Avika.config.specialCombos && 
                        Avika.config.specialCombos.indexOf(order.dish) !== -1)) {
                        
                        // Botón para marcar cocina fría como completada
                        var coldBtn = document.createElement('button');
                        coldBtn.textContent = order.coldKitchenFinished ? '✓ Cocina Fría' : 'Cocina Fría';
                        coldBtn.className = 'action-btn';
                        coldBtn.style.backgroundColor = order.coldKitchenFinished ? '#7f8c8d' : '#3498db';
                        coldBtn.style.color = 'white';
                        coldBtn.style.border = 'none';
                        coldBtn.style.padding = '8px 10px';
                        coldBtn.style.margin = '2px';
                        coldBtn.style.borderRadius = '4px';
                        coldBtn.style.cursor = order.coldKitchenFinished ? 'default' : 'pointer';
                        coldBtn.disabled = order.coldKitchenFinished;
                        
                        // Evento para cocina fría
                        (function(id) {
                            coldBtn.onclick = function() {
                                if (typeof Avika.orders.finishColdKitchen === 'function') {
                                    Avika.orders.finishColdKitchen(id);
                                } else {
                                    Avika.ui.showNotification("Función para completar cocina fría no disponible");
                                }
                            };
                        })(order.id);
                        
                        // Botón para marcar cocina caliente como completada
                        var hotBtn = document.createElement('button');
                        hotBtn.textContent = order.hotKitchenFinished ? '✓ Cocina Caliente' : 'Cocina Caliente';
                        hotBtn.className = 'action-btn';
                        hotBtn.style.backgroundColor = order.hotKitchenFinished ? '#7f8c8d' : '#e74c3c';
                        hotBtn.style.color = 'white';
                        hotBtn.style.border = 'none';
                        hotBtn.style.padding = '8px 10px';
                        hotBtn.style.margin = '2px';
                        hotBtn.style.borderRadius = '4px';
                        hotBtn.style.cursor = order.hotKitchenFinished ? 'default' : 'pointer';
                        hotBtn.disabled = order.hotKitchenFinished;
                        
                        // Evento para cocina caliente
                        (function(id) {
                            hotBtn.onclick = function() {
                                if (typeof Avika.orders.finishHotKitchen === 'function') {
                                    Avika.orders.finishHotKitchen(id);
                                } else {
                                    Avika.ui.showNotification("Función para completar cocina caliente no disponible");
                                }
                            };
                        })(order.id);
                        
                        actionsCell.appendChild(coldBtn);
                        actionsCell.appendChild(document.createElement('br'));
                        actionsCell.appendChild(hotBtn);
                        
                        // Si es parte de un ticket y todos los platillos del ticket están listos
                        if (order.ticketId && order.allTicketItemsFinished && order.service === 'domicilio') {
                            
                            // Botón para salida del repartidor
                            var deliveryBtn = document.createElement('button');
                            deliveryBtn.textContent = 'Salida Repartidor';
                            deliveryBtn.className = 'action-btn';
                            deliveryBtn.style.backgroundColor = '#f39c12';
                            deliveryBtn.style.color = 'white';
                            deliveryBtn.style.border = 'none';
                            deliveryBtn.style.padding = '8px 10px';
                            deliveryBtn.style.margin = '2px';
                            deliveryBtn.style.borderRadius = '4px';
                            deliveryBtn.style.cursor = 'pointer';
                            
                            // Evento para salida repartidor
                            (function(id, ticketId) {
                                deliveryBtn.onclick = function() {
                                    if (typeof Avika.orders.registerDeliveryDeparture === 'function') {
                                        Avika.orders.registerDeliveryDeparture(id, ticketId);
                                    } else {
                                        Avika.ui.showNotification("Función para registrar salida no disponible");
                                    }
                                };
                            })(order.id, order.ticketId);
                            
                            actionsCell.appendChild(document.createElement('br'));
                            actionsCell.appendChild(deliveryBtn);
                        }
                        
                        // Si el repartidor ya salió, mostrar botón para marcar entrega
                        if (order.ticketId && order.deliveryDepartureTime && !order.deliveryTime) {
                            
                            // Botón para marcar entrega
                            var completeBtn = document.createElement('button');
                            completeBtn.textContent = 'Entrega Completada';
                            completeBtn.className = 'action-btn';
                            completeBtn.style.backgroundColor = '#2ecc71';
                            completeBtn.style.color = 'white';
                            completeBtn.style.border = 'none';
                            completeBtn.style.padding = '8px 10px';
                            completeBtn.style.margin = '2px';
                            completeBtn.style.borderRadius = '4px';
                            completeBtn.style.cursor = 'pointer';
                            
                            // Evento para marcar entrega
                            (function(id, ticketId) {
                                completeBtn.onclick = function() {
                                    if (typeof Avika.orders.completeDelivery === 'function') {
                                        Avika.orders.completeDelivery(id, ticketId);
                                    } else {
                                        Avika.ui.showNotification("Función para completar entrega no disponible");
                                    }
                                };
                            })(order.id, order.ticketId);
                            
                            actionsCell.appendChild(document.createElement('br'));
                            actionsCell.appendChild(completeBtn);
                        }
                    } 
                    // Platillo individual o platillo normal dentro de un ticket
                    else {
                        // Botón para marcar como completado
                        var completeBtn = document.createElement('button');
                        completeBtn.textContent = order.finished ? '✓ Completado' : 'Listo';
                        completeBtn.className = 'action-btn';
                        completeBtn.style.backgroundColor = order.finished ? '#7f8c8d' : '#2ecc71';
                        completeBtn.style.color = 'white';
                        completeBtn.style.border = 'none';
                        completeBtn.style.padding = '8px 12px';
                        completeBtn.style.borderRadius = '4px';
                        completeBtn.style.cursor = order.finished ? 'default' : 'pointer';
                        completeBtn.disabled = order.finished;
                        
                        // Evento para completar platillo normal
                        (function(index) {
                            completeBtn.onclick = function() {
                                if (typeof Avika.ui.completeOrder === 'function') {
                                    Avika.ui.completeOrder(index);
                                } else if (typeof Avika.orders.finishPreparation === 'function') {
                                    var orderId = Avika.data.pendingOrders[index].id;
                                    Avika.orders.finishPreparation(orderId);
                                }
                            };
                        })(i);
                        
                        actionsCell.appendChild(completeBtn);
                        
                        // Si es parte de un ticket y todos los platillos del ticket están listos
                        if (order.ticketId && order.allTicketItemsFinished && order.service === 'domicilio') {
                            
                            // Botón para salida del repartidor
                            var deliveryBtn = document.createElement('button');
                            deliveryBtn.textContent = 'Salida Repartidor';
                            deliveryBtn.className = 'action-btn';
                            deliveryBtn.style.backgroundColor = '#f39c12';
                            deliveryBtn.style.color = 'white';
                            deliveryBtn.style.border = 'none';
                            deliveryBtn.style.padding = '8px 10px';
                            deliveryBtn.style.margin = '2px';
                            deliveryBtn.style.borderRadius = '4px';
                            deliveryBtn.style.cursor = 'pointer';
                            
                            // Evento para salida repartidor
                            (function(id, ticketId) {
                                deliveryBtn.onclick = function() {
                                    if (typeof Avika.orders.registerDeliveryDeparture === 'function') {
                                        Avika.orders.registerDeliveryDeparture(id, ticketId);
                                    } else {
                                        Avika.ui.showNotification("Función para registrar salida no disponible");
                                    }
                                };
                            })(order.id, order.ticketId);
                            
                            actionsCell.appendChild(document.createElement('br'));
                            actionsCell.appendChild(deliveryBtn);
                        }
                        
                        // Si el repartidor ya salió, mostrar botón para marcar entrega
                        if (order.ticketId && order.deliveryDepartureTime && !order.deliveryTime) {
                            
                            // Botón para marcar entrega
                            var completeDeliveryBtn = document.createElement('button');
                            completeDeliveryBtn.textContent = 'Entrega Completada';
                            completeDeliveryBtn.className = 'action-btn';
                            completeDeliveryBtn.style.backgroundColor = '#2ecc71';
                            completeDeliveryBtn.style.color = 'white';
                            completeDeliveryBtn.style.border = 'none';
                            completeDeliveryBtn.style.padding = '8px 10px';
                            completeDeliveryBtn.style.margin = '2px';
                            completeDeliveryBtn.style.borderRadius = '4px';
                            completeDeliveryBtn.style.cursor = 'pointer';
                            
                            // Evento para marcar entrega
                            (function(id, ticketId) {
                                completeDeliveryBtn.onclick = function() {
                                    if (typeof Avika.orders.completeDelivery === 'function') {
                                        Avika.orders.completeDelivery(id, ticketId);
                                    } else {
                                        Avika.ui.showNotification("Función para completar entrega no disponible");
                                    }
                                };
                            })(order.id, order.ticketId);
                            
                            actionsCell.appendChild(document.createElement('br'));
                            actionsCell.appendChild(completeDeliveryBtn);
                        }
                    }
                }
            } catch (e) {
                console.error("Error al actualizar tabla de pendientes mejorada:", e);
                if (typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error: " + e.message);
                }
            }
        };

        // 3. IMPLEMENTACIÓN DE FUNCIONES PARA MANEJO DE ENTREGA
        
        // Función para registrar la salida del repartidor
        Avika.orders.registerDeliveryDeparture = function(id, ticketId) {
            try {
                console.log("Registrando salida del repartidor para ticket:", ticketId);
                
                // Validar ticket
                if (!ticketId) {
                    Avika.ui.showNotification("Error: No se proporcionó ID de ticket");
                    return;
                }
                
                // Buscar la orden específica
                var order = null;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    if (Avika.data.pendingOrders[i].id === id) {
                        order = Avika.data.pendingOrders[i];
                        break;
                    }
                }
                
                if (!order) {
                    Avika.ui.showNotification("Error: No se encontró la orden");
                    return;
                }
                
                // Registrar tiempo de salida
                var departureTime = new Date();
                var departureTimeFormatted = Avika.ui.formatTime(departureTime);
                
                if (ticketId) {
                    var ticketDishCount = 0;
                    
                    // Actualizar todos los platillos del mismo ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === ticketId) {
                            // Registra el tiempo de salida para cada platillo del ticket
                            item.deliveryDepartureTime = departureTime;
                            item.deliveryDepartureTimeFormatted = departureTimeFormatted;
                            
                            // Verificar si todos los platillos están realmente terminados
                            if (!item.finished) {
                                if (item.isSpecialCombo) {
                                    item.hotKitchenFinished = true;
                                    item.coldKitchenFinished = true;
                                }
                                item.finished = true;
                                item.finishTime = departureTime;
                                item.finishTimeFormatted = departureTimeFormatted;
                            }
                            
                            // Marcar definitivamente como listo para entrega
                            item.allTicketItemsFinished = true;
                            item.allItemsFinished = true;
                            item.readyForDelivery = true;
                            
                            ticketDishCount++;
                        }
                    }
                    
                    Avika.ui.showNotification('Salida del repartidor registrada para ticket completo (' + ticketDishCount + ' platillos)');
                } else {
                    // Registra el tiempo de salida (modo individual, sin ticket)
                    order.deliveryDepartureTime = departureTime;
                    order.deliveryDepartureTimeFormatted = departureTimeFormatted;
                    Avika.ui.showNotification('Salida del repartidor registrada para ' + order.dish);
                }
                
                // Actualizar tablas y guardar
                Avika.ui.updatePendingTable();
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            } catch (e) {
                console.error("Error al registrar salida del repartidor:", e);
                Avika.ui.showErrorMessage("Error: " + e.message);
            }
        };
        
        // Función para completar la entrega
        Avika.orders.completeDelivery = function(id, ticketId) {
            try {
                console.log("Completando entrega para ticket:", ticketId);
                
                if (!ticketId) {
                    Avika.ui.showNotification("Error: No se proporcionó ID de ticket");
                    return;
                }
                
                // Encontrar orden específica
                var order = null;
                var orderIndex = -1;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    if (Avika.data.pendingOrders[i].id === id) {
                        order = Avika.data.pendingOrders[i];
                        orderIndex = i;
                        break;
                    }
                }
                
                if (!order) {
                    Avika.ui.showNotification("Error: No se encontró la orden");
                    return;
                }
                
                // Registrar tiempo de entrega
                var deliveryTime = new Date();
                var deliveryTimeFormatted = Avika.ui.formatTime(deliveryTime);
                
                // Recopilar todos los platillos del mismo ticket
                var ticketItems = [];
                var itemsToRemove = [];
                
                // Primero obtener todos los platillos del ticket y marcarlos como entregados
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        // Registrar tiempo de entrega
                        item.deliveryTime = deliveryTime;
                        item.deliveryTimeFormatted = deliveryTimeFormatted;
                        
                        // Calcular tiempo total desde inicio hasta entrega
                        var totalTimeMillis = deliveryTime - new Date(item.startTime);
                        var totalTimeSecs = Math.floor(totalTimeMillis / 1000);
                        var totalMins = Math.floor(totalTimeSecs / 60);
                        var totalSecs = totalTimeSecs % 60;
                        
                        var totalTimeFormatted = Avika.ui.padZero(totalMins) + ':' + Avika.ui.padZero(totalSecs) + ' minutos';
                        item.totalTime = totalTimeFormatted;
                        
                        // Calcular tiempo de repartidor (desde salida hasta entrega)
                        if (item.deliveryDepartureTime) {
                            var deliveryTimeMillis = deliveryTime - new Date(item.deliveryDepartureTime);
                            var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
                            var deliveryMins = Math.floor(deliveryTimeSecs / 60);
                            var deliverySecs = deliveryTimeSecs % 60;
                            
                            var deliveryTimeOnly = Avika.ui.padZero(deliveryMins) + ':' + Avika.ui.padZero(deliverySecs) + ' minutos';
                            item.deliveryOnlyTime = deliveryTimeOnly;
                        }
                        
                        // Agregar copia a completados
                        var itemCopy = JSON.parse(JSON.stringify(item));
                        
                        // Guardar formato ISO para las fechas (para restaurarlas después)
                        if (item.startTime) {
                            itemCopy.startTimeISO = new Date(item.startTime).toISOString();
                        }
                        if (item.finishTime) {
                            itemCopy.finishTimeISO = new Date(item.finishTime).toISOString();
                        }
                        if (item.deliveryDepartureTime) {
                            itemCopy.deliveryDepartureTimeISO = new Date(item.deliveryDepartureTime).toISOString();
                        }
                        if (item.deliveryTime) {
                            itemCopy.deliveryTimeISO = deliveryTime.toISOString();
                        }
                        
                        Avika.data.completedOrders.unshift(itemCopy);
                        
                        // Agregar índice para eliminar después
                        itemsToRemove.push(i);
                        ticketItems.push(item);
                    }
                }
                
                // Eliminar platillos completados (de atrás hacia adelante para no afectar índices)
                for (var i = itemsToRemove.length - 1; i >= 0; i--) {
                    Avika.data.pendingOrders.splice(itemsToRemove[i], 1);
                }
                
                // Mostrar notificación
                Avika.ui.showNotification('¡Entrega completada para ticket #' + ticketId.replace('ticket-', '') + 
                                         '! (' + ticketItems.length + ' platillos)');
                
                // Actualizar tablas y guardar
                Avika.ui.updatePendingTable();
                Avika.ui.updateCompletedTable(false);
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            } catch (e) {
                console.error("Error al completar entrega:", e);
                Avika.ui.showErrorMessage("Error: " + e.message);
            }
        };
        
        // 4. MODIFICACIÓN DE completeOrder PARA MANEJAR TICKETS CORRECTAMENTE
        
        // Guardar referencia a la implementación original
        const originalCompleteOrder = Avika.ui.completeOrder;
        
        // Reemplazar con nuestra implementación mejorada
        Avika.ui.completeOrder = function(index) {
            try {
                console.log("Completando orden mejorada en índice:", index);
                
                if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                    console.error("Índice inválido o no hay órdenes pendientes");
                    return;
                }
                
                var order = Avika.data.pendingOrders[index];
                var endTime = new Date();
                
                // Marcar este platillo como terminado
                order.finished = true;
                order.finishTime = endTime;
                order.finishTimeFormatted = Avika.ui.formatTime(endTime);
                
                // Calcular tiempo de preparación individual
                var prepTimeMillis = endTime - new Date(order.startTime);
                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                var prepMins = Math.floor(prepTimeSecs / 60);
                var prepSecs = prepTimeSecs % 60;
                
                var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
                order.prepTime = prepTimeFormatted;
                
                // Si tiene ticket, verificar si es el último platillo
                if (order.ticketId) {
                    var ticketId = order.ticketId;
                    var allTicketItemsFinished = true;
                    var ticketItems = [];
                    
                    // Recopilar todos los platillos del mismo ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === ticketId) {
                            ticketItems.push(item);
                            
                            // Verificar si este platillo está terminado
                            if (item.isSpecialCombo) {
                                if (!item.hotKitchenFinished || !item.coldKitchenFinished) {
                                    allTicketItemsFinished = false;
                                }
                            } else if (item.id !== order.id && !item.finished) { // Excluir el platillo actual
                                allTicketItemsFinished = false;
                            }
                        }
                    }
                    
                    // Si todos los platillos del ticket están terminados
                    if (allTicketItemsFinished) {
                        console.log("Todos los platillos del ticket están terminados");
                        
                        // Actualizar todos los platillos del ticket para indicar que todo el ticket está listo
                        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                            var item = Avika.data.pendingOrders[i];
                            if (item.ticketId === ticketId) {
                                item.allTicketItemsFinished = true;
                                item.allItemsFinished = true;
                                
                                // Si es domicilio, marcar como listo para salida
                                if (item.service === 'domicilio' || item.serviceType === 'domicilio') {
                                    item.readyForDelivery = true;
                                }
                                
                                // De otra manera, si no es domicilio y todo está terminado, moverlo a completados
                                else if (item.service !== 'domicilio' && item.serviceType !== 'domicilio') {
                                    // Este platillo se moverá a completados
                                    var itemCopy = JSON.parse(JSON.stringify(item));
                                    
                                    // Guardar fechas en formato ISO
                                    if (item.startTime) {
                                        itemCopy.startTimeISO = new Date(item.startTime).toISOString();
                                    }
                                    if (item.finishTime) {
                                        itemCopy.finishTimeISO = new Date(item.finishTime).toISOString();
                                    } else {
                                        item.finishTime = endTime;
                                        item.finishTimeFormatted = Avika.ui.formatTime(endTime);
                                        itemCopy.finishTime = endTime;
                                        itemCopy.finishTimeFormatted = Avika.ui.formatTime(endTime);
                                        itemCopy.finishTimeISO = endTime.toISOString();
                                    }
                                    
                                    // Agregar a completados
                                    if (!Avika.data.completedOrders) {
                                        Avika.data.completedOrders = [];
                                    }
                                    Avika.data.completedOrders.unshift(itemCopy);
                                }
                            }
                        }
                        
                        // Si NO es domicilio, eliminar todos los platillos del ticket de pendientes
                        if (order.service !== 'domicilio' && order.serviceType !== 'domicilio') {
                            var indices = [];
                            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                                if (Avika.data.pendingOrders[i].ticketId === ticketId) {
                                    indices.push(i);
                                }
                            }
                            
                            // Eliminar de atrás hacia adelante para no afectar índices
                            for (var i = indices.length - 1; i >= 0; i--) {
                                Avika.data.pendingOrders.splice(indices[i], 1);
                            }
                            
                            Avika.ui.showNotification('¡Ticket completo terminado! (' + ticketItems.length + ' platillos)');
                        } else {
                            Avika.ui.showNotification('Todos los platillos del ticket están listos. Pendiente salida del repartidor.');
                        }
                    } else {
                        // No todos los platillos están terminados, mantener este en la lista
                        Avika.ui.showNotification('Platillo ' + order.dish + ' terminado. Faltan más platillos para completar el ticket.');
                    }
                } 
                // No es parte de un ticket, manejo normal
                else {
                    // Crear copia para órdenes completadas
                    var completedOrder = JSON.parse(JSON.stringify(order));
                    
                    // Guardar fechas en formato ISO
                    if (completedOrder.startTime) {
                        completedOrder.startTimeISO = new Date(order.startTime).toISOString();
                    }
                    if (completedOrder.finishTime) {
                        completedOrder.finishTimeISO = endTime.toISOString();
                    }
                    
                    // Mover a órdenes completadas
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    
                    Avika.data.completedOrders.unshift(completedOrder);
                    
                    // Eliminar de órdenes pendientes
                    Avika.data.pendingOrders.splice(index, 1);
                    
                    // Notificar
                    Avika.ui.showNotification("Platillo '" + order.dish + "' marcado como completado");
                }
                
                // Actualizar tablas y guardar
                Avika.ui.updatePendingTable();
                Avika.ui.updateCompletedTable(false);
                
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            } catch (e) {
                console.error("Error al completar orden:", e);
                if (typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al completar orden: " + e.message);
                }
            }
        };
        
        // 5. INICIALIZAR EVENTOS PARA BOTONES DE ESTADÍSTICAS/COMPLETADOS
        
        // Inicialización de botones para ver completados
        function initCompletedTableButtons() {
            try {
                console.log("Inicializando botones de tabla de completados...");
                
                // Botón para ver historial completo
                var btnShowAll = document.getElementById('btn-show-all-history');
                if (btnShowAll) {
                    btnShowAll.addEventListener('click', function() {
                        Avika.ui.updateCompletedTable(true);
                        
                        // Actualizar clases de botones
                        document.querySelectorAll('.filter-btn').forEach(function(btn) {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                    });
                }
                
                // Botón ver recientes
                var btnShowRecent = document.getElementById('btn-show-recent');
                if (btnShowRecent) {
                    btnShowRecent.addEventListener('click', function() {
                        Avika.ui.updateCompletedTable(false);
                        
                        // Actualizar clases de botones
                        document.querySelectorAll('.filter-btn').forEach(function(btn) {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                    });
                }
                
                // Botón limpiar historial
                var btnClearHistory = document.getElementById('btn-clear-history');
                if (btnClearHistory) {
                    btnClearHistory.addEventListener('click', function() {
                        if (confirm('¿Estás seguro de que deseas eliminar todo el historial de platillos completados?')) {
                            Avika.data.completedOrders = [];
                            Avika.ui.updateCompletedTable(false);
                            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                Avika.storage.guardarDatosLocales();
                            }
                            Avika.ui.showNotification('Historial limpiado correctamente');
                        }
                    });
                }
                
                console.log("Botones de tabla de completados inicializados");
                return true;
            } catch (e) {
                console.error("Error al inicializar botones de tabla de completados:", e);
                return false;
            }
        }
        
        // 6. INICIALIZAR TODO
        
        // Inicializar componentes
        function init() {
            try {
                console.log("Inicializando módulo de tickets y entrega...");
                
                // Verificar botón para nuevo ticket
                var btnNewTicket = document.getElementById('btn-new-ticket');
                if (btnNewTicket) {
                    btnNewTicket.addEventListener('click', function() {
                        if (typeof Avika.ui.enableTicketMode === 'function') {
                            Avika.ui.enableTicketMode();
                        } else {
                            Avika.ui.showNotification("Función de tickets no disponible");
                        }
                    });
                }
                
                // Inicializar botones de tabla completados
                initCompletedTableButtons();
                
                // Mostrar tabla de completados inicial
                if (typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable(false);
                }
                
                console.log("Módulo de tickets y entrega inicializado correctamente");
                return true;
            } catch (e) {
                console.error("Error al inicializar módulo de tickets y entrega:", e);
                return false;
            }
        }
        
        // Iniciar cuando el DOM esté listo
        init();
    });
})();
