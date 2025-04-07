// orders.js - Implementación de funciones para manejo de órdenes
window.Avika = window.Avika || {};

Avika.orders = {
    // Función para iniciar la preparación de un platillo
    startPreparation: function() {
        console.log("Iniciando preparación de platillo");
        
        try {
            // Obtener datos del formulario
            var selectedDish = document.getElementById('selected-dish').textContent;
            var quantity = parseInt(document.getElementById('quantity-value').textContent, 10);
            var serviceType = document.querySelector('.service-button.selected').getAttribute('data-service');
            
            // Validar datos
            if (!selectedDish || selectedDish === '') {
                Avika.ui.showNotification('Error: No se ha seleccionado un platillo', 'error');
                return;
            }
            
            if (isNaN(quantity) || quantity <= 0) {
                Avika.ui.showNotification('Error: La cantidad debe ser mayor a 0', 'error');
                return;
            }
            
            if (!serviceType) {
                Avika.ui.showNotification('Error: No se ha seleccionado un tipo de servicio', 'error');
                return;
            }
            
            // Usar el orderService para crear la orden
            if (Avika.orderService && typeof Avika.orderService.createOrder === 'function') {
                var order = Avika.orderService.createOrder(selectedDish, quantity, serviceType);
                
                // Actualizar la interfaz
                Avika.ui.updatePendingTable();
                
                // Guardar cambios
                Avika.storage.guardarDatosLocales();
                
                // Mostrar notificación
                Avika.ui.showNotification('¡' + selectedDish + ' en preparación!');
                
                // Volver a la sección de categorías
                Avika.ui.showSection('categories-section');
            } else {
                console.error("Error: orderService no está disponible o no tiene la función createOrder");
                Avika.ui.showNotification('Error al crear la orden. Consulta la consola para más detalles.', 'error');
            }
        } catch (e) {
            console.error("Error al iniciar preparación:", e);
            Avika.ui.showNotification('Error al crear la orden: ' + e.message, 'error');
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
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.ui.formatElapsedTime(order.preparationTime);
        
        // Si todos los platillos del ticket están terminados, actualizar ticket
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
            
            if (allTicketItemsFinished) {
                // Todos los platillos del ticket están terminados
                console.log("Todos los platillos del ticket", order.ticketId, "están terminados");
                
                // Si es a domicilio, mostrar botón de "Registrar Salida"
                if (order.serviceType === 'domicilio') {
                    console.log("Ticket a domicilio listo para salida");
                }
            }
        }
        
        // Actualizar la interfaz
        Avika.ui.updatePendingTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡' + order.dish + ' marcado como listo!');
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
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Calcular tiempo de preparación
        var endTime = new Date();
        order.endTime = endTime;
        order.preparationTime = Math.floor((endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.ui.formatElapsedTime(order.preparationTime);
        
        // Mover a completadas
        Avika.data.completedOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        // Actualizar las tablas
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡' + order.dish + ' terminado! Tiempo: ' + 
                              order.preparationTimeFormatted);
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
            return;
        }
        
        // Marcar cocina caliente como terminada
        order.hotKitchenFinished = true;
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            this.checkComboCompletion(order);
        }
        
        // Actualizar interfaz
        Avika.ui.updatePendingTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡Cocina Caliente de ' + order.dish + ' terminada!');
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
            return;
        }
        
        // Marcar cocina fría como terminada
        order.coldKitchenFinished = true;
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            this.checkComboCompletion(order);
        }
        
        // Actualizar interfaz
        Avika.ui.updatePendingTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡Cocina Fría de ' + order.dish + ' terminada!');
    },
    
    // Verificar si un combo está completo y todos los items del ticket están listos
    checkComboCompletion: function(order) {
        if (!order.ticketId) {
            // Si no es parte de un ticket, marcarlo como listo
            order.finished = true;
            order.endTime = new Date();
            order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
            order.preparationTimeFormatted = Avika.ui.formatElapsedTime(order.preparationTime);
            return;
        }
        
        // Marcar el combo como terminado
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.ui.formatElapsedTime(order.preparationTime);
        
        // Verificar si todos los items del ticket están terminados
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
            // Todos los platillos del ticket están terminados
            console.log("Todos los platillos del ticket", order.ticketId, "están terminados");
        }
    },
    
    // Función para finalizar la preparación para entrega a domicilio (no ticket)
    finishKitchenForDelivery: function(orderId) {
        console.log("Finalizando preparación para domicilio:", orderId);
        
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
            return;
        }
        
        // Marcar como terminado en cocina
        order.kitchenFinished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.ui.formatElapsedTime(order.preparationTime);
        
        // Actualizar interfaz
        Avika.ui.updatePendingTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡' + order.dish + ' listo para entregar! Preparación: ' + 
                              order.preparationTimeFormatted);
    },
    
    // Función para registrar la salida de una entrega a domicilio
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);
        
        // Buscar la orden en pendientes
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
            return;
        }
        
        // Registrar fecha y hora de salida
        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime;
        order.deliveryDepartureTimeFormatted = Avika.ui.formatTime(departureTime);
        
        // Mover a órdenes en reparto
        Avika.data.deliveryOrders.unshift(order);
        
        // Si es parte de un ticket, mover todos los platillos del ticket
        if (order.ticketId) {
            // Recopilar índices a eliminar (en orden descendente para no afectar índices anteriores)
            var indicesToRemove = [];
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId && item.id !== orderId) {
                    // Registrar salida para este platillo también
                    item.deliveryDepartureTime = departureTime;
                    item.deliveryDepartureTimeFormatted = Avika.ui.formatTime(departureTime);
                    
                    // Agregar a reparto
                    Avika.data.deliveryOrders.unshift(item);
                    
                    // Marcar para eliminar
                    indicesToRemove.push(i);
                }
            }
            
            // Eliminar de pendientes en orden descendente
            for (var i = indicesToRemove.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(indicesToRemove[i], 1);
            }
        }
        
        // Eliminar la orden original de pendientes
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        // Actualizar tablas
        Avika.ui.updatePendingTable();
        Avika.ui.updateDeliveryTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡Salida registrada para ' + order.dish + '!');
    },
    
    // Función para registrar la entrega a domicilio
    markDeliveryArrival: function(orderId) {
        console.log("Registrando entrega de domicilio:", orderId);
        
        // Buscar la orden en reparto
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
            return;
        }
        
        // Registrar fecha y hora de entrega
        var arrivalTime = new Date();
        order.deliveryArrivalTime = arrivalTime;
        order.deliveryArrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
        
        // Calcular tiempo de entrega
        var deliveryTimeInSeconds = Math.floor((arrivalTime - new Date(order.deliveryDepartureTime)) / 1000);
        order.deliveryTime = deliveryTimeInSeconds;
        order.deliveryTimeFormatted = Avika.ui.formatElapsedTime(deliveryTimeInSeconds);
        
        // Mover a órdenes completadas
        Avika.data.completedOrders.unshift(order);
        
        // Si es parte de un ticket, mover todos los platillos del ticket
        if (order.ticketId) {
            // Recopilar índices a eliminar (en orden descendente)
            var indicesToRemove = [];
            
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === order.ticketId && item.id !== orderId) {
                    // Registrar entrega para este platillo también
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
                    
                    // Calcular tiempo de entrega
                    var itemDeliveryTime = Math.floor((arrivalTime - new Date(item.deliveryDepartureTime)) / 1000);
                    item.deliveryTime = itemDeliveryTime;
                    item.deliveryTimeFormatted = Avika.ui.formatElapsedTime(itemDeliveryTime);
                    
                    // Agregar a completadas
                    Avika.data.completedOrders.unshift(item);
                    
                    // Marcar para eliminar
                    indicesToRemove.push(i);
                }
            }
            
            // Eliminar de reparto en orden descendente
            for (var i = indicesToRemove.length - 1; i >= 0; i--) {
                Avika.data.deliveryOrders.splice(indicesToRemove[i], 1);
            }
        }
        
        // Eliminar la orden original de reparto
        Avika.data.deliveryOrders.splice(orderIndex, 1);
        
        // Actualizar tablas
        Avika.ui.updateDeliveryTable();
        Avika.ui.updateCompletedTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('¡Entrega completada para ' + order.dish + '! Tiempo de entrega: ' + 
                              order.deliveryTimeFormatted);
    },
    
    // Función para limpiar órdenes completadas
    clearCompletedOrders: function() {
        console.log("Limpiando historial de órdenes completadas");
        
        // Vaciar array de completadas
        Avika.data.completedOrders = [];
        
        // Actualizar tabla
        Avika.ui.updateCompletedTable();
        
        // Guardar cambios
        Avika.storage.guardarDatosLocales();
        
        // Mostrar notificación
        Avika.ui.showNotification('Historial de órdenes limpiado');
    }
};
