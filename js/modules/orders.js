// orders.js - Implementación de funciones para manejo de órdenes
window.Avika = window.Avika || {};


Avika.orders = {
    // Estado interno para tracking de tickets
    _ticketStatus: {},

    // Función para iniciar la preparación de un platillo
    startPreparation: function() {
        console.log("Iniciando preparación de platillo");
        
        try {
            // Obtener datos del formulario
            var selectedDish = document.getElementById('selected-dish-title').textContent;
            var quantity = parseInt(document.getElementById('quantity-display').textContent, 10);
            var serviceType = document.querySelector('.option-btn.selected').getAttribute('id').replace('btn-', '');
            var notes = document.getElementById('notes-input').value;
            var isSpecialCombo = Avika.data.isSpecialCombo;
            var category = Avika.data.currentCategory;
            var customizations = Avika.data.currentCustomizations || [];
            
            // Validar datos
            if (!selectedDish || selectedDish === '') {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un platillo', 'error');
                } else {
                    console.error('Error: No se ha seleccionado un platillo');
                }
                return;
            }
            
            if (isNaN(quantity) || quantity <= 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: La cantidad debe ser mayor a 0', 'error');
                } else {
                    console.error('Error: La cantidad debe ser mayor a 0');
                }
                return;
            }
            
            if (!serviceType) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un tipo de servicio', 'error');
                } else {
                    console.error('Error: No se ha seleccionado un tipo de servicio');
                }
                return;
            }
            
            // Usar el orderService para crear la orden
            if (Avika.orderService && typeof Avika.orderService.createOrder === 'function') {
                var order = Avika.orderService.createOrder(
                    selectedDish,
                    category,
                    serviceType,
                    notes,
                    quantity,
                    isSpecialCombo
                );
                
                // Si es un combo especial, inicializar estados de cocinas
                if (isSpecialCombo) {
                    order.hotKitchenFinished = false;
                    order.coldKitchenFinished = false;
                }
                
                // Agregar personalizaciones
                order.customizations = customizations;
                
                // Actualizar la interfaz
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Guardar cambios
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Mostrar notificación
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + selectedDish + ' en preparación!', 'success');
                } else {
                    console.log('¡' + selectedDish + ' en preparación!');
                }
                
                // Volver a la sección de categorías
                if (Avika.ui && typeof Avika.ui.showSection === 'function') {
                    Avika.ui.showSection('categories-section');
                }
            } else {
                console.error("Error: orderService no está disponible o no tiene la función createOrder");
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error al crear la orden. Consulta la consola para más detalles.', 'error');
                }
            }
        } catch (e) {
            console.error("Error al iniciar preparación:", e);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al crear la orden: ' + e.message, 'error');
            }
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
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden solicitada", 'error');
            }
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        
        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);
        
        // Manejar el platillo según su tipo de servicio
        // Los tickets de ordena y espera (para-llevar) ahora se comportan como comedor
        // TODOS los tickets de ordena y espera pasan directamente a platillos completados
        if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
            // Verificar si este platillo es parte de un ticket
            if (order.ticketId) {
                // Verificar el estado completo del ticket
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                
                // Si todos los platillos están terminados, mover todos juntos a completados
                if (ticketStatus.isComplete) {
                    console.log("Todos los platillos del ticket", order.ticketId, "están terminados");
                    
                    // Marcar todas las órdenes con el estado completado
                    var itemsToMove = [];
                    
                    // Recopilar todos los items del ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                            itemsToMove.push(i);
                        }
                    }
                    
                    console.log("Ticket de comedor listo, moviendo todos los platillos a completados");
                    
                    // Mover todos los items a la sección de completados
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    
                    // Procesar los items en orden inverso para evitar problemas con los índices
                    for (var i = itemsToMove.length - 1; i >= 0; i--) {
                        var itemIndex = itemsToMove[i];
                        var item = Avika.data.pendingOrders[itemIndex];
                        
                        // Mover a completados
                        Avika.data.completedOrders.unshift(item);
                        Avika.data.pendingOrders.splice(itemIndex, 1);
                    }
                    
                    // Actualizar la tabla de completados
                    if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable();
                    }
                }
            } else {
                // Si no es parte de un ticket, mover el platillo inmediatamente a completados
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                // Mover a completados
                Avika.data.completedOrders.unshift(order);
                Avika.data.pendingOrders.splice(orderIndex, 1);
                
                // Actualizar la tabla de completados
                if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable();
                }
            }
        } else if (order.serviceType === 'domicilio') {
            // Si todos los platillos del ticket están terminados, actualizar estado del ticket
            if (order.ticketId) {
                // Verificar el estado completo del ticket
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                
                // Si todos los platillos están terminados, actualizar el estado
                if (ticketStatus.isComplete) {
                    console.log("Todos los platillos del ticket", order.ticketId, "están terminados");
                    
                    // Marcar todas las órdenes con el estado completado
                    var itemsToMove = [];
                    
                    // Recopilar todos los items del ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                            itemsToMove.push(i);
                        }
                    }
                    
                    console.log("Ticket a domicilio listo para reparto");
                    
                    // Mover todos los items a la sección de reparto
                    if (!Avika.data.deliveryOrders) {
                        Avika.data.deliveryOrders = [];
                    }
                    
                    // Procesar los items en orden inverso para evitar problemas con los índices
                    for (var i = itemsToMove.length - 1; i >= 0; i--) {
                        var itemIndex = itemsToMove[i];
                        var item = Avika.data.pendingOrders[itemIndex];
                        
                        // Marcar como listo para reparto
                        item.readyForDelivery = true;
                        item.kitchenFinished = true;
                        item.finishTime = new Date();
                        item.finishTimeFormatted = this.formatTime(item.finishTime);

                        // Registrar el momento en que el ticket está listo para el contador de espera
                        item.readyTimestamp = new Date().toISOString();
                        
                        // Mover a reparto
                        Avika.data.deliveryOrders.unshift(item);
                        Avika.data.pendingOrders.splice(itemIndex, 1);
                    }
                    
                    // Actualizar la tabla de reparto
                    if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                        Avika.ui.updateDeliveryTable();
                    }
                }
            } else {
                // Platillo individual de domicilio
                // Marcar como listo para reparto
                order.readyForDelivery = true;
                order.kitchenFinished = true;
                order.finishTime = new Date();
                order.finishTimeFormatted = this.formatTime(order.finishTime);

                // Registrar el momento en que el platillo está listo para el contador de espera
                order.readyTimestamp = new Date().toISOString();
                
                // Mover a reparto
                if (!Avika.data.deliveryOrders) {
                    Avika.data.deliveryOrders = [];
                }
                Avika.data.deliveryOrders.unshift(order);
                Avika.data.pendingOrders.splice(orderIndex, 1);
                
                // Actualizar la tabla de reparto
                if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                    Avika.ui.updateDeliveryTable();
                }
            }
        }
        
        // Actualizar la interfaz
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification("Platillo marcado como listo", 'success');
        }
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
        
        // También verificar en reparto
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            var item = Avika.data.deliveryOrders[i];
            if (item.ticketId === ticketId) {
                allItems.push(item);
                finishedItems++;  // Los que están en reparto ya están terminados
            }
        }
        
        // Devolver estado del ticket
        return {
            ticketId: ticketId,
            totalItems: allItems.length,
            finishedItems: finishedItems,
            isComplete: allItems.length > 0 && finishedItems >= allItems.length,
            itemsList: allItems
        };
    },
    
    // Función para finalizar una orden normal (no parte de un ticket)
    finishPreparation: function(orderId) {
        console.log("Finalizando preparación:", orderId);
        
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
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Calcular tiempo de preparación
        var endTime = new Date();
        order.endTime = endTime;
        order.preparationTime = Math.floor((endTime - new Date(order.startTime)) / 1000);
        
        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);
        
        // Verificar si es un pedido a domicilio o para llevar
        if (order.serviceType === 'domicilio' || order.serviceType === 'para-llevar') {
            // Marcar como listo para reparto
            order.finishTime = endTime;
            order.finishTimeFormatted = this.formatTime(endTime);
            order.kitchenFinished = true;
            
            // Asegurarse de que el array de órdenes en reparto existe
            if (!Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders = [];
            }
            
            // Mover a reparto en lugar de a completadas
            Avika.data.deliveryOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            // Actualizar las tablas
            if (Avika.ui) {
                if (typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                if (typeof Avika.ui.updateDeliveryTable === 'function') {
                    Avika.ui.updateDeliveryTable();
                }
                
                // Mostrar notificación
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + order.dish + ' listo para reparto! Tiempo de preparación: ' + 
                                        order.preparationTimeFormatted, 'success');
                }
            } else {
                console.log('¡' + order.dish + ' listo para reparto! Tiempo de preparación: ' + 
                        order.preparationTimeFormatted);
            }
        } else {
            // Para pedidos en comedor, mover directamente a completadas
            Avika.data.completedOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            // Actualizar las tablas
            if (Avika.ui) {
                if (typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                if (typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable();
                }
                
                // Mostrar notificación
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + order.dish + ' terminado! Tiempo: ' + 
                                        order.preparationTimeFormatted, 'success');
                }
            } else {
                console.log('¡' + order.dish + ' terminado! Tiempo: ' + 
                        order.preparationTimeFormatted);
            }
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    },
    
    // Función para finalizar una cocina caliente (para combos especiales)
    finishHotKitchen: function(orderId) {
        console.log("Finalizando cocina caliente para:", orderId);
        
        // Buscar la orden
        var order = null;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                break;
            }
        }
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        // Marcar cocina caliente como terminada
        order.hotKitchenFinished = true;
        // Registrar la hora de finalizaciu00f3n de la cocina caliente
        order.hotKitchenEndTime = new Date();
        order.hotKitchenEndTimeFormatted = this.formatTime(order.hotKitchenEndTime);
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            this.checkComboCompletion(order);
        }
        
        // Actualizar interfaz
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Cocina Caliente de ' + order.dish + ' terminada!', 'success');
        } else {
            console.log('¡Cocina Caliente de ' + order.dish + ' terminada!');
        }
    },
    
    // Función para finalizar una cocina fría (para combos especiales)
    finishColdKitchen: function(orderId) {
        console.log("Finalizando cocina fría para:", orderId);
        
        // Buscar la orden
        var order = null;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                break;
            }
        }
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        // Marcar cocina fría como terminada
        order.coldKitchenFinished = true;
        // Registrar la hora de finalización de la cocina fría
        order.coldKitchenEndTime = new Date();
        order.coldKitchenEndTimeFormatted = this.formatTime(order.coldKitchenEndTime);
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            this.checkComboCompletion(order);
        }
        
        // Actualizar interfaz
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Cocina Fría de ' + order.dish + ' terminada!', 'success');
        } else {
            console.log('¡Cocina Fría de ' + order.dish + ' terminada!');
        }
    },
    
    // Verificar si un combo está completo y todos los items del ticket están listos
    checkComboCompletion: function(order) {
        if (!order.ticketId) {
            // Si no es parte de un ticket, marcarlo como listo
            order.finished = true;
            order.endTime = new Date();
            order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
            
            // Usar la función centralizada para formatear tiempo transcurrido
            var formatElapsedTime = getFormatElapsedTimeFunction();
            order.preparationTimeFormatted = formatElapsedTime(order.preparationTime);
            
            // Mover el platillo a la sección correspondiente según su tipo de servicio
            var orderIndex = -1;
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].id === order.id) {
                    orderIndex = i;
                    break;
                }
            }
            
            if (orderIndex !== -1) {
                if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
                    // Para comedor y ordena y espera, mover a completados
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    Avika.data.completedOrders.unshift(order);
                    Avika.data.pendingOrders.splice(orderIndex, 1);
                    
                    // Actualizar la tabla de completados
                    if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable();
                    }
                } else if (order.serviceType === 'domicilio') {
                    // Para domicilio, mover a reparto
                    order.readyForDelivery = true;
                    order.kitchenFinished = true;
                    order.finishTime = new Date();
                    order.finishTimeFormatted = this.formatTime(order.finishTime);
                    
                    if (!Avika.data.deliveryOrders) {
                        Avika.data.deliveryOrders = [];
                    }
                    Avika.data.deliveryOrders.unshift(order);
                    Avika.data.pendingOrders.splice(orderIndex, 1);
                    
                    // Actualizar la tabla de reparto
                    if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                        Avika.ui.updateDeliveryTable();
                    }
                }
            }
            
            return;
        }
        
        // Marcar el combo como terminado
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        
        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);
        
        // Verificar el estado completo del ticket
        var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
        
        if (ticketStatus.isComplete) {
            // Todos los platillos del ticket están terminados
            console.log("Todos los platillos del ticket", order.ticketId, "están terminados");
            
            // Recopilar todos los items del ticket
            var itemsToMove = [];
            var serviceType = null;
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    item.allTicketItemsFinished = true;
                    itemsToMove.push(i);
                    if (!serviceType) serviceType = item.serviceType;
                }
            }
            
            // Procesar los items según el tipo de servicio
            if (serviceType === 'comedor' || serviceType === 'para-llevar') {
                console.log("Ticket de comedor u ordena y espera listo, moviendo a completados");
                
                // Mover todos los items a la sección de completados
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                // Procesar los items en orden inverso para evitar problemas con los índices
                for (var i = itemsToMove.length - 1; i >= 0; i--) {
                    var itemIndex = itemsToMove[i];
                    var item = Avika.data.pendingOrders[itemIndex];
                    
                    // Mover a completados
                    Avika.data.completedOrders.unshift(item);
                    Avika.data.pendingOrders.splice(itemIndex, 1);
                }
                
                // Actualizar la tabla de completados
                if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable();
                }
            } else if (serviceType === 'domicilio') {
                console.log("Ticket a domicilio listo para reparto");
                
                // Mover todos los items a la sección de reparto
                if (!Avika.data.deliveryOrders) {
                    Avika.data.deliveryOrders = [];
                }
                
                // Procesar los items en orden inverso para evitar problemas con los índices
                for (var i = itemsToMove.length - 1; i >= 0; i--) {
                    var itemIndex = itemsToMove[i];
                    var item = Avika.data.pendingOrders[itemIndex];
                    
                    // Marcar como listo para reparto
                    item.readyForDelivery = true;
                    item.kitchenFinished = true;
                    item.finishTime = new Date();
                    item.finishTimeFormatted = this.formatTime(item.finishTime);
                    
                    // Mover a reparto
                    Avika.data.deliveryOrders.unshift(item);
                    Avika.data.pendingOrders.splice(itemIndex, 1);
                }
                
                // Actualizar la tabla de reparto
                if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                    Avika.ui.updateDeliveryTable();
                }
            }
        } else {
            // Este combo está terminado pero otros platillos del ticket aún no
            // NO mover el combo hasta que todos los platillos del ticket estén listos
            console.log("Combo especial terminado, pero esperando a que todos los platillos del ticket estén listos");
            
            // Actualizar el estado del combo en la lista de pendientes
            var orderIndex = -1;
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].id === order.id) {
                    // Solo actualizamos el estado, pero no lo movemos todavía
                    Avika.data.pendingOrders[i].finished = true;
                    Avika.data.pendingOrders[i].endTime = order.endTime;
                    Avika.data.pendingOrders[i].preparationTime = order.preparationTime;
                    Avika.data.pendingOrders[i].preparationTimeFormatted = order.preparationTimeFormatted;
                    break;
                }
            }
        }
        
        // Actualizar la interfaz
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
    },
    
    // Función para finalizar la preparación para entrega a domicilio (no ticket)
    finishKitchenForDelivery: function(orderId) {
        console.log("Finalizando preparación para domicilio:", orderId);
        
        // Buscar la orden
        var orderIndex = -1;
        var order = null;
        
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        // Marcar como terminado en cocina
        order.kitchenFinished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        
        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);
        
        // Asegurarse de que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders) {
            Avika.data.deliveryOrders = [];
        }
        
        // Mover a reparto
        Avika.data.deliveryOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        // Actualizar interfaz
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡' + order.dish + ' listo para entregar! Preparación: ' + 
                                  order.preparationTimeFormatted, 'success');
        } else {
            console.log('¡' + order.dish + ' listo para entregar! Preparación: ' + 
                      order.preparationTimeFormatted);
        }
    },
    
        // Función auxiliar para calcular el tiempo de espera en mostrador
    _calculateAndWaitTime: function(order, departureTime) {
        if (order.readyTimestamp) {
            const readyTime = new Date(order.readyTimestamp).getTime();
            const departureMs = departureTime.getTime();
            order.deliveryWaitTime = Math.floor((departureMs - readyTime) / 1000); // en segundos
            console.log(`Tiempo de espera para ${order.id}: ${order.deliveryWaitTime}s`);
        }
    },

    // Función para registrar la salida de una entrega a domicilio
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);
        
        // Buscar la orden en pendientes o en reparto
        var orderIndex = -1;
        var order = null;
        var inPending = true;
        
        // Primero buscar en pendientes
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }
        
        // Si no está en pendientes, buscar en reparto
        if (!order) {
            inPending = false;
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                if (Avika.data.deliveryOrders[i].id === orderId) {
                    order = Avika.data.deliveryOrders[i];
                    orderIndex = i;
                    break;
                }
            }
        }
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        // Registrar fecha y hora de salida
        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime.toISOString();
    this._calculateAndWaitTime(order, departureTime);
        
        // Formatear hora con manejo de errores
        try {
            if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                order.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);
            } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                order.deliveryDepartureTimeFormatted = Avika.ui.formatTime(departureTime);
            } else {
                // Implementación de respaldo
                var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
                var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
                var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
                order.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
            }
        } catch (e) {
            console.warn("Error al formatear hora de salida:", e);
            var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
            var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
            var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
            order.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
        }
        
        // Si es parte de un ticket, actualizar todos los platillos del ticket
        if (order.ticketId) {
            // Actualizar platillos en pendientes
            var pendingIndicesToRemove = [];
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Registrar salida para este platillo
                    item.deliveryDepartureTime = departureTime.toISOString();
                this._calculateAndWaitTime(item, departureTime);
                    
                    // Formatear hora
                    try {
                        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                            item.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);
                        } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                            item.deliveryDepartureTimeFormatted = Avika.ui.formatTime(departureTime);
                        } else {
                            // Implementación de respaldo
                            var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
                            var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
                            var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
                            item.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
                        }
                    } catch (e) {
                        console.warn("Error al formatear hora de salida para item:", e);
                        var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
                        var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
                        var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
                        item.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
                    }
                    
                    // Mover a reparto
                    if (!Avika.data.deliveryOrders) {
                        Avika.data.deliveryOrders = [];
                    }
                    Avika.data.deliveryOrders.unshift(item);
                    
                    // Marcar para eliminar de pendientes
                    pendingIndicesToRemove.push(i);
                }
            }
            
            // Eliminar de pendientes en orden descendente
            for (var i = pendingIndicesToRemove.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(pendingIndicesToRemove[i], 1);
            }
            
            // Actualizar platillos que ya están en reparto
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === order.ticketId && item.id !== orderId) {
                    // Registrar salida para este platillo
                    item.deliveryDepartureTime = departureTime.toISOString();
                this._calculateAndWaitTime(item, departureTime);
                    
                    // Formatear hora
                    try {
                        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                            item.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);
                        } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                            item.deliveryDepartureTimeFormatted = Avika.ui.formatTime(departureTime);
                        } else {
                            // Implementación de respaldo
                            var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
                            var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
                            var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
                            item.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
                        }
                    } catch (e) {
                        console.warn("Error al formatear hora de salida para item:", e);
                        var hours = (departureTime.getHours() < 10 ? '0' : '') + departureTime.getHours();
                        var minutes = (departureTime.getMinutes() < 10 ? '0' : '') + departureTime.getMinutes();
                        var seconds = (departureTime.getSeconds() < 10 ? '0' : '') + departureTime.getSeconds();
                        item.deliveryDepartureTimeFormatted = hours + ':' + minutes + ':' + seconds;
                    }
                }
            }
        } else {
            // Si no es parte de un ticket y está en pendientes, mover a reparto
            if (inPending) {
                // Mover a órdenes en reparto
                if (!Avika.data.deliveryOrders) {
                    Avika.data.deliveryOrders = [];
                }
                Avika.data.deliveryOrders.unshift(order);
                Avika.data.pendingOrders.splice(orderIndex, 1);
            }
        }
        
        // Actualizar tablas
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Salida registrada para ' + order.dish + '!', 'success');
        } else {
            console.log('¡Salida registrada para ' + order.dish + '!');
        }
    },
    
    // Función para registrar la entrega a domicilio
    markDeliveryArrival: function(orderId) {
        console.log("Registrando entrega de domicilio:", orderId);

        var orderIndex = -1;
        var order = null;
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            if (Avika.data.deliveryOrders[i].id === orderId) {
                order = Avika.data.deliveryOrders[i];
                orderIndex = i;
                break;
            }
        }

        if (!order) {
            console.error("No se encontró la orden en reparto con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error: No se pudo encontrar la orden en reparto', 'error');
            }
            if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            return;
        }

        var arrivalTime = new Date();

        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }

        if (order.ticketId) {
            console.log("Procesando ticket completo para la entrega:", order.ticketId);
            
            var itemsToProcess = Avika.data.deliveryOrders.filter(item => item.ticketId === order.ticketId);

            for (var i = 0; i < itemsToProcess.length; i++) {
                var item = itemsToProcess[i];

                item.deliveryArrivalTime = arrivalTime;
                item.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);
                
                if (!item.deliveryDepartureTime) {
                    console.warn("Item del ticket no tiene tiempo de salida, usando el de la orden principal:", item.id);
                    item.deliveryDepartureTime = order.deliveryDepartureTime;
                    item.deliveryDepartureTimeFormatted = order.deliveryDepartureTimeFormatted;
                }

                var itemDeliveryTimeInSeconds = Math.floor((arrivalTime - new Date(item.deliveryDepartureTime)) / 1000);
                item.deliveryTime = itemDeliveryTimeInSeconds;
                item.deliveryTimeFormatted = Avika.utils.formatElapsedTime(itemDeliveryTimeInSeconds);
                item.finished = true;

                Avika.data.completedOrders.unshift(item);
            }

            Avika.data.deliveryOrders = Avika.data.deliveryOrders.filter(item => item.ticketId !== order.ticketId);

        } else {
            order.deliveryArrivalTime = arrivalTime;
            order.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);

            if (!order.deliveryDepartureTime) {
                console.warn("La orden no tiene tiempo de salida registrado, usando tiempo de inicio de cocina");
                order.deliveryDepartureTime = new Date(order.endTime || order.startTime);
                order.deliveryDepartureTimeFormatted = Avika.utils.formatTime(order.deliveryDepartureTime);
            }

            var deliveryTimeInSeconds = Math.floor((arrivalTime - new Date(order.deliveryDepartureTime)) / 1000);
            order.deliveryTime = deliveryTimeInSeconds;
            order.deliveryTimeFormatted = Avika.utils.formatElapsedTime(deliveryTimeInSeconds);
            order.finished = true;

            Avika.data.completedOrders.unshift(order);
            Avika.data.deliveryOrders.splice(orderIndex, 1);
        }

        if (Avika.ui) {
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable();
            }
        }

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Entrega completada para ' + order.dish + '!', 'success');
        } else {
            console.log('¡Entrega completada para ' + order.dish + '!');
        }
    },

    // Función para limpiar órdenes completadas
    clearCompletedOrders: function() {
        console.log("Limpiando historial de órdenes completadas");
        
        // Solicitar confirmación
        if (!confirm('¿Estás seguro de que deseas eliminar todo el historial de órdenes completadas? Esta acción no se puede deshacer.')) {
            return false;
        }
        
        // Verificar si existe el array
        if (!Avika.data) {
            Avika.data = {};
        }
        
        // Realizar copia de seguridad en localStorage
        try {
            var backup = JSON.stringify(Avika.data.completedOrders || []);
            localStorage.setItem('avika_completedOrders_backup', backup);
            localStorage.setItem('avika_backup_timestamp', new Date().toString());
        } catch (e) {
            console.warn("No se pudo crear copia de seguridad del historial:", e);
        }
        
        // Vaciar array de completadas
        Avika.data.completedOrders = [];
        
        // Actualizar tabla
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable();
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('Historial de órdenes limpiado. Se ha creado una copia de seguridad.', 'info');
        } else {
            console.log('Historial de órdenes limpiado');
        }
                
        return true;
    },
    
    // Función auxiliar para formatear tiempo (utiliza directamente la implementación centralizada)
    formatTime: function(date) {
        try {
            // Utilizar directamente la implementación centralizada
            return Avika.utils.formatTime(date);
        } catch (e) {
            console.warn("Error al formatear tiempo:", e);
            return '--:--:--';
        }
    },

    // Recuperar órdenes completadas desde la copia de seguridad
    restoreCompletedOrdersBackup: function() {
        var backup = localStorage.getItem('avika_completedOrders_backup');
        var timestamp = localStorage.getItem('avika_backup_timestamp');
        
        if (!backup) {
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('No hay copia de seguridad disponible', 'warning');
            } else {
                console.warn('No hay copia de seguridad disponible');
            }
            return false;
        }
        
        try {
            var orders = JSON.parse(backup);
            
            if (!Array.isArray(orders) || orders.length === 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('La copia de seguridad está vacía o dañada', 'warning');
                } else {
                    console.warn('La copia de seguridad está vacía o dañada');
                }
                return false;
            }
            
            // Solicitar confirmación mostrando información sobre la copia
            var confirmMsg = '¿Desea restaurar ' + orders.length + ' órdenes completadas';
            
            if (timestamp) {
                confirmMsg += ' desde la copia de seguridad creada el ' + new Date(timestamp).toLocaleString();
            }
            
            confirmMsg += '?';
            
            if (!confirm(confirmMsg)) {
                return false;
            }
            
            // Restaurar órdenes
            Avika.data.completedOrders = orders;
            
            // Actualizar tabla
            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable();
            }
            
            // Guardar cambios
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Se han restaurado ' + orders.length + ' órdenes completadas', 'success');
            } else {
                console.log('Se han restaurado ' + orders.length + ' órdenes completadas');
            }
            
            return true;
        } catch (e) {
            console.error("Error al restaurar copia de seguridad:", e);
            
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al restaurar copia de seguridad: ' + e.message, 'error');
            }
            
            return false;
        }
    }
};