// avika-details.js - Mejoras para mostrar detalles de platillos y comandas con letra más pequeña

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando mejoras de visualización de detalles...");
    
    // Sobrescribir la función createOrderRow para mostrar detalles con letra más pequeña
    if (Avika && Avika.ui) {
        // Guardar la función original
        var originalCreateOrderRow = Avika.ui.createOrderRow;
        
        // Sobrescribir con nuestra versión mejorada
        Avika.ui.createOrderRow = function(order) {
            var row = document.createElement('tr');
            
            // Celda del platillo
            var dishCell = document.createElement('td');
            dishCell.className = 'dish-cell';
            
            // Crear contenedor para el nombre del platillo
            var dishNameContainer = document.createElement('div');
            dishNameContainer.className = 'dish-name';
            dishNameContainer.innerHTML = (order.quantity > 1 ? '<span class="dish-quantity">' + order.quantity + 'x</span> ' : '') + order.dish;
            dishCell.appendChild(dishNameContainer);
            
            // Añadir categoría como detalle con letra más pequeña
            if (order.categoryDisplay) {
                var categoryDetail = document.createElement('span');
                categoryDetail.className = 'dish-category';
                categoryDetail.textContent = order.categoryDisplay;
                dishCell.appendChild(categoryDetail);
            }
            
            row.appendChild(dishCell);
            
            // Celda de inicio
            var startCell = document.createElement('td');
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
            
            // Crear contenedor principal para los detalles
            var serviceInfo = document.createElement('div');
            serviceInfo.className = 'service-type';
            
            // Añadir información de servicio
            var serviceName = Avika.config.serviceNames[order.serviceType] || order.serviceType;
            serviceInfo.textContent = serviceName;
            
            // Añadir información del ticket junto al servicio
            if (order.ticketId) {
                var ticketInfo = document.createElement('span');
                ticketInfo.className = 'ticket-id';
                ticketInfo.textContent = 'Ticket #' + order.ticketId.substring(order.ticketId.length - 5);
                serviceInfo.appendChild(ticketInfo);
            }
            
            detailsCell.appendChild(serviceInfo);
            
            // Añadir personalizaciones si existen
            if (order.customizations && order.customizations.length) {
                var customizationsInfo = document.createElement('span');
                customizationsInfo.className = 'dish-customization';
                customizationsInfo.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                detailsCell.appendChild(customizationsInfo);
            }
            
            // Añadir notas si existen
            if (order.notes) {
                var notesInfo = document.createElement('span');
                notesInfo.className = 'order-notes';
                notesInfo.textContent = order.notes;
                detailsCell.appendChild(notesInfo);
            }
            
            row.appendChild(detailsCell);
            
            // Celda de acciones - Usar la lógica original para esta parte
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
                
                // Lógica para domicilio y tickets
                if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
                    if (order.ticketId) {
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
                        
                        if (allTicketItemsFinished && !order.deliveryDepartureTime) {
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
            } else {
                // Para órdenes normales (no combos)
                if (order.serviceType === 'domicilio' && order.finished && !order.deliveryDepartureTime) {
                    // Si es a domicilio y está terminado pero no ha salido
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
                        
                        if (allTicketItemsFinished) {
                            var departureBtn = document.createElement('button');
                            departureBtn.className = 'action-btn departure-btn';
                            departureBtn.textContent = 'Registrar Salida';
                            departureBtn.onclick = function() {
                                Avika.orders.markDeliveryDeparture(order.id);
                            };
                            actionsCell.appendChild(departureBtn);
                        }
                    } else {
                        // Si no es parte de un ticket, simplemente mostrar el botón
                        var departureBtn = document.createElement('button');
                        departureBtn.className = 'action-btn departure-btn';
                        departureBtn.textContent = 'Registrar Salida';
                        departureBtn.onclick = function() {
                            Avika.orders.markDeliveryDeparture(order.id);
                        };
                        actionsCell.appendChild(departureBtn);
                    }
                } else if (!order.finished) {
                    // Si no está terminado, mostrar botón de finalizar
                    var finishBtn = document.createElement('button');
                    finishBtn.className = 'finish-btn';
                    finishBtn.textContent = 'Finalizar';
                    finishBtn.setAttribute('data-id', order.id);
                    finishBtn.onclick = function() {
                        var orderId = this.getAttribute('data-id');
                        if (order.ticketId) {
                            Avika.orders.finishIndividualItem(orderId);
                        } else {
                            Avika.orders.finishPreparation(orderId);
                        }
                    };
                    actionsCell.appendChild(finishBtn);
                    
                    // Si es a domicilio, también permitir marcar como listo para entrega
                    if (order.serviceType === 'domicilio') {
                        var deliveryBtn = document.createElement('button');
                        deliveryBtn.className = 'action-btn delivery-btn';
                        deliveryBtn.textContent = 'Listo para Entrega';
                        deliveryBtn.onclick = function() {
                            Avika.orders.finishKitchenForDelivery(order.id);
                        };
                        actionsCell.appendChild(deliveryBtn);
                    }
                }
            }
            
            row.appendChild(actionsCell);
            
            return row;
        };
        
        // Sobrescribir la función createDeliveryRow para mostrar detalles con letra más pequeña
        var originalCreateDeliveryRow = Avika.ui.createDeliveryRow;
        
        Avika.ui.createDeliveryRow = function(order) {
            var row = document.createElement('tr');
            
            // Celda del platillo
            var dishCell = document.createElement('td');
            dishCell.className = 'dish-cell';
            
            // Crear contenedor para el nombre del platillo
            var dishNameContainer = document.createElement('div');
            dishNameContainer.className = 'dish-name';
            dishNameContainer.innerHTML = (order.quantity > 1 ? '<span class="dish-quantity">' + order.quantity + 'x</span> ' : '') + order.dish;
            dishCell.appendChild(dishNameContainer);
            
            // Añadir categoría como detalle con letra más pequeña
            if (order.categoryDisplay) {
                var categoryDetail = document.createElement('span');
                categoryDetail.className = 'dish-category';
                categoryDetail.textContent = order.categoryDisplay;
                dishCell.appendChild(categoryDetail);
            }
            
            row.appendChild(dishCell);
            
            // Celda de salida
            var departureCell = document.createElement('td');
            departureCell.textContent = order.deliveryDepartureTimeFormatted || '--:--:--';
            row.appendChild(departureCell);
            
            // Celda de temporizador
            var timerCell = document.createElement('td');
            timerCell.className = 'timer-cell delivery-timer';
            timerCell.setAttribute('data-id', order.id);
            timerCell.textContent = '00:00:00';
            row.appendChild(timerCell);
            
            // Celda de detalles
            var detailsCell = document.createElement('td');
            detailsCell.className = 'details-container';
            
            // Añadir información de servicio
            var serviceInfo = document.createElement('div');
            serviceInfo.className = 'service-type';
            serviceInfo.textContent = 'Domicilio';
            
            // Añadir información del ticket junto al servicio
            if (order.ticketId) {
                var ticketInfo = document.createElement('span');
                ticketInfo.className = 'ticket-id';
                ticketInfo.textContent = 'Ticket #' + order.ticketId.substring(order.ticketId.length - 5);
                serviceInfo.appendChild(ticketInfo);
            }
            
            detailsCell.appendChild(serviceInfo);
            
            // Añadir personalizaciones si existen
            if (order.customizations && order.customizations.length) {
                var customizationsInfo = document.createElement('span');
                customizationsInfo.className = 'dish-customization';
                customizationsInfo.textContent = order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
                detailsCell.appendChild(customizationsInfo);
            }
            
            // Añadir notas si existen
            if (order.notes) {
                var notesInfo = document.createElement('span');
                notesInfo.className = 'order-notes';
                notesInfo.textContent = order.notes;
                detailsCell.appendChild(notesInfo);
            }
            
            row.appendChild(detailsCell);
            
            // Celda de acciones
            var actionsCell = document.createElement('td');
            
            var arrivalBtn = document.createElement('button');
            arrivalBtn.className = 'action-btn arrival-btn';
            arrivalBtn.textContent = 'Registrar Entrega';
            arrivalBtn.onclick = function() {
                Avika.orders.markDeliveryArrival(order.id);
            };
            actionsCell.appendChild(arrivalBtn);
            
            row.appendChild(actionsCell);
            
            return row;
        };
        
        // Sobrescribir la función para crear filas en la tabla de completados
        if (Avika.ui.updateCompletedTable && Avika.ui.updateCompletedTable.createCompletedRow) {
            var originalCreateCompletedRow = Avika.ui.updateCompletedTable.createCompletedRow;
            
            Avika.ui.updateCompletedTable.createCompletedRow = function(order) {
                var row = document.createElement('tr');
                
                // Celda del platillo
                var dishCell = document.createElement('td');
                dishCell.className = 'dish-cell';
                
                // Crear contenedor para el nombre del platillo
                var dishNameContainer = document.createElement('div');
                dishNameContainer.className = 'dish-name';
                dishNameContainer.innerHTML = (order.quantity > 1 ? '<span class="dish-quantity">' + order.quantity + 'x</span> ' : '') + order.dish;
                dishCell.appendChild(dishNameContainer);
                
                // Añadir categoría como detalle con letra más pequeña
                if (order.categoryDisplay) {
                    var categoryDetail = document.createElement('span');
                    categoryDetail.className = 'dish-category';
                    categoryDetail.textContent = order.categoryDisplay;
                    dishCell.appendChild(categoryDetail);
                }
                
                row.appendChild(dishCell);
                
                // Celda de inicio
                var startCell = document.createElement('td');
                startCell.textContent = order.startTimeFormatted || '--:--:--';
                row.appendChild(startCell);
                
                // Celda de fin
                var endCell = document.createElement('td');
                endCell.textContent = order.endTimeFormatted || '--:--:--';
                row.appendChild(endCell);
                
                // Celda de tiempo de preparación
                var prepTimeCell = document.createElement('td');
                prepTimeCell.textContent = order.prepTime || '--:--';
                
                // Añadir clase según el tiempo de preparación
                if (order.prepTime) {
                    var timeParts = order.prepTime.split(':');
                    if (timeParts.length >= 2) {
                        var minutes = parseInt(timeParts[0], 10);
                        
                        if (minutes < 5) {
                            prepTimeCell.className = 'time-excellent';
                        } else if (minutes < 8) {
                            prepTimeCell.className = 'time-good';
                        } else if (minutes < 12) {
                            prepTimeCell.className = 'time-warning';
                        } else {
                            prepTimeCell.className = 'time-bad';
                        }
                    }
                }
                
                row.appendChild(prepTimeCell);
                
                // Celda de detalles
                var detailsCell = document.createElement('td');
                detailsCell.className = 'details-container';
                
                // Añadir información de servicio
                var serviceInfo = document.createElement('div');
                serviceInfo.className = 'service-type';
                serviceInfo.textContent = Avika.config.serviceNames[order.serviceType] || order.serviceType;
                
                // Añadir información del ticket junto al servicio
                if (order.ticketId) {
                    var ticketInfo = document.createElement('span');
                    ticketInfo.className = 'ticket-id';
                    ticketInfo.textContent = 'Ticket #' + order.ticketId.substring(order.ticketId.length - 5);
                    serviceInfo.appendChild(ticketInfo);
                }
                
                detailsCell.appendChild(serviceInfo);
                
                // Añadir personalizaciones si existen
                if (order.customizations && order.customizations.length) {
                    var customizationsInfo = document.createElement('span');
                    customizationsInfo.className = 'dish-customization';
                    customizationsInfo.textContent = order.customizations.map(function(code) {
                        return Avika.config.customizationOptions[code] || code;
                    }).join(', ');
                    detailsCell.appendChild(customizationsInfo);
                }
                
                // Añadir notas si existen
                if (order.notes) {
                    var notesInfo = document.createElement('span');
                    notesInfo.className = 'order-notes';
                    notesInfo.textContent = order.notes;
                    detailsCell.appendChild(notesInfo);
                }
                
                // Añadir tiempo de entrega si existe (para domicilio)
                if (order.deliveryTime) {
                    var deliveryInfo = document.createElement('span');
                    deliveryInfo.className = 'dish-details';
                    deliveryInfo.textContent = 'Tiempo de entrega: ' + order.deliveryTime;
                    detailsCell.appendChild(deliveryInfo);
                }
                
                row.appendChild(detailsCell);
                
                return row;
            };
        }
        
        console.log("Funciones de visualización de detalles sobrescritas correctamente");
    } else {
        console.error("No se pudo encontrar el objeto Avika.ui para sobrescribir las funciones");
    }
});
