// order-service.js - Lógica de pedidos y temporizadores
window.Avika = window.Avika || {};
Avika.data = {
    currentCategory: '',
    currentDish: '',
    currentCustomizations: [],
    currentService: 'comedor',
    currentQuantity: 1,
    isSpecialCombo: false,
    
    pendingOrders: [],
    completedOrders: [],
    timerInterval: null
};

Avika.orders = {
    // Funciones para iniciar y finalizar preparaciones
    startPreparation: function() {
        var preparation = {
            id: Date.now().toString(),
            dish: Avika.data.currentDish,
            category: Avika.data.currentCategory,
            categoryDisplay: Avika.config.categoryNames[Avika.data.currentCategory],
            quantity: Avika.data.currentQuantity,
            customizations: Avika.data.currentCustomizations.slice(),
            serviceType: Avika.data.currentService,
            notes: document.getElementById('notes-input').value.trim(),
            startTime: new Date(),
            startTimeFormatted: Avika.ui.formatTime(new Date()),
            isSpecialCombo: Avika.data.isSpecialCombo
        };
        
        if (Avika.data.isSpecialCombo) {
            preparation.hotKitchenFinished = false;
            preparation.coldKitchenFinished = false;
        }
        
        // Crear una copia para evitar referencias directas
        Avika.data.pendingOrders.push(JSON.parse(JSON.stringify(preparation)));
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        
        Avika.ui.showNotification(preparation.dish + ' agregado a preparación');
        
        Avika.ui.showSection('categories-section');
    },

    finishHotKitchen: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.hotKitchenFinished = true;
        order.hotKitchenTime = now;
        order.hotKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina caliente terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
        if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
            this.finishPreparation(id);
        }
        // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
        else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
            order.kitchenFinished = true;
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        }
    },

    finishColdKitchen: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.coldKitchenFinished = true;
        order.coldKitchenTime = now;
        order.coldKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina fría terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
        if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
            this.finishPreparation(id);
        }
        // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
        else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
            order.kitchenFinished = true;
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        }
    },

    // Esta función se llama cuando termina la preparación en cocina para un pedido a domicilio
    finishKitchenForDelivery: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Marca la orden como terminada en cocina pero pendiente de entrega
        order.kitchenFinished = true;
        order.kitchenFinishedTime = new Date();
        order.kitchenFinishedTimeFormatted = Avika.ui.formatTime(order.kitchenFinishedTime);
        
        // Si es parte de un ticket, verificar si todos los platillos están listos
        if (order.ticketId) {
            var allTicketItemsFinished = true;
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Para platillos normales
                    if (!item.isSpecialCombo && !item.kitchenFinished) {
                        allTicketItemsFinished = false;
                        break;
                    }
                    // Para combos especiales
                    else if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                        allTicketItemsFinished = false;
                        break;
                    }
                }
            }
            
            // Si todos los platillos del ticket están listos, mostrar notificación
            if (allTicketItemsFinished) {
                Avika.ui.showNotification('Ticket completo listo en cocina');
            }
        } else {
            Avika.ui.showNotification(order.dish + ' terminado en cocina, pendiente entrega');
        }
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función registra la salida del repartidor (para todos los platillos del mismo ticket)
    markDeliveryDeparture: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var departureTime = new Date();
        var departureTimeFormatted = Avika.ui.formatTime(departureTime);
        
        // Si es parte de un ticket, marcar todos los platillos del mismo ticket
        if (order.ticketId) {
            var ticketDishCount = 0;
            
            // Actualizar todos los platillos del mismo ticket
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Registra el tiempo de salida para cada platillo del ticket
                    item.deliveryDepartureTime = departureTime;
                    item.deliveryDepartureTimeFormatted = departureTimeFormatted;
                    
                    // Marcar como listo para entrega, estas propiedades son usadas por la UI
                    // para determinar si mostrar el botón de salida
                    item.readyForDelivery = true;
                    item.allItemsFinished = true;
                    item.allItemsReady = true;
                    
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
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función registra la entrega al cliente (para todos los platillos del mismo ticket)
    markDeliveryArrival: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var arrivalTime = new Date();
        var arrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
        
        // Si es parte de un ticket, procesar todo el ticket
        if (order.ticketId) {
            var ticketDishCount = 0;
            var itemsToRemove = [];
            
            // Primera pasada: recopilar índices y contar platillos
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Registra el tiempo de entrega para cada platillo
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = arrivalTimeFormatted;
                    
                    // Calcular tiempo total desde inicio hasta entrega
                    var endTime = arrivalTime;
                    var prepTimeMillis = endTime - new Date(item.startTime);
                    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                    var prepMins = Math.floor(prepTimeSecs / 60);
                    var prepSecs = prepTimeSecs % 60;
                    
                    var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
                    
                    item.endTime = endTime;
                    item.endTimeFormatted = arrivalTimeFormatted;
                    item.prepTime = prepTimeFormatted;
                    
                    // También calcular el tiempo específico de entrega
                    if (item.deliveryDepartureTime) {
                        var deliveryTimeMillis = endTime - new Date(item.deliveryDepartureTime);
                        var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
                        var deliveryMins = Math.floor(deliveryTimeSecs / 60);
                        var deliverySecs = deliveryTimeSecs % 60;
                        
                        item.deliveryTime = Avika.ui.padZero(deliveryMins) + ':' + Avika.ui.padZero(deliverySecs) + ' minutos';
                    }
                    
                    // Agregar a completados
                    Avika.data.completedOrders.unshift(JSON.parse(JSON.stringify(item)));
                    
                    // Marcar para eliminar
                    itemsToRemove.push(i);
                    ticketDishCount++;
                }
            }
            
            // Segunda pasada: eliminar los ítems (de atrás hacia adelante para no afectar índices)
            for (var i = itemsToRemove.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(itemsToRemove[i], 1);
            }
            
            Avika.ui.showNotification('¡Ticket completo entregado al cliente! (' + ticketDishCount + ' platillos)');
        } else {
            // Modo individual (sin ticket)
            // Registra el tiempo de entrega y completa el pedido
            order.deliveryArrivalTime = arrivalTime;
            order.deliveryArrivalTimeFormatted = arrivalTimeFormatted;
            
            // Calcular tiempo total desde inicio hasta entrega
            var endTime = arrivalTime;
            var prepTimeMillis = endTime - new Date(order.startTime);
            var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
            var prepMins = Math.floor(prepTimeSecs / 60);
            var prepSecs = prepTimeSecs % 60;
            
            var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
            
            order.endTime = endTime;
            order.endTimeFormatted = arrivalTimeFormatted;
            order.prepTime = prepTimeFormatted;
            
            // También calcular el tiempo específico de entrega
            if (order.deliveryDepartureTime) {
                var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
                var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
                var deliveryMins = Math.floor(deliveryTimeSecs / 60);
                var deliverySecs = deliveryTimeSecs % 60;
                
                order.deliveryTime = Avika.ui.padZero(deliveryMins) + ':' + Avika.ui.padZero(deliverySecs) + ' minutos';
            }
            
            // Crear una copia profunda del objeto para evitar problemas de referencia
            var orderCopy = JSON.parse(JSON.stringify(order));
            
            // Mover a completados (usando la copia)
            Avika.data.completedOrders.unshift(orderCopy);
            
            // Eliminar de pendientes
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            Avika.ui.showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                          prepTimeFormatted + (order.deliveryTime ? ', Tiempo de entrega: ' + order.deliveryTime : ''));
        }
        
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    },

    // Verifica que este código esté presente en order-service.js en la función finishPreparation
    finishPreparation: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var endTime = new Date();
        
        // Si es parte de un ticket de comedor o para llevar, completar todos los platillos
        if (order.ticketId && (order.serviceType === 'comedor' || order.serviceType === 'para-llevar')) {
            var ticketItems = Avika.data.pendingOrders.filter(function(item) {
                return item.ticketId === order.ticketId;
            });
            
            var itemsToRemove = [];
            
            // Procesar todos los platillos del ticket
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Calcular tiempo de preparación
                    var prepTimeMillis = endTime - new Date(item.startTime);
                    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                    var prepMins = Math.floor(prepTimeSecs / 60);
                    var prepSecs = prepTimeSecs % 60;
                    
                    var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
                    
                    // Completar platillo
                    item.endTime = endTime;
                    item.endTimeFormatted = Avika.ui.formatTime(endTime);
                    item.prepTime = prepTimeFormatted;
                    
                    // Agregar a completados
                    Avika.data.completedOrders.unshift(JSON.parse(JSON.stringify(item)));
                    
                    // Marcar para eliminar
                    itemsToRemove.push(i);
                }
            }
            
            // Eliminar platillos completados (de atrás hacia adelante)
            for (var i = itemsToRemove.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(itemsToRemove[i], 1);
            }
            
            Avika.ui.showNotification('¡Ticket completo terminado! (' + ticketItems.length + ' platillos)');
        }
        // Caso normal: platillo individual
        else {
            var prepTimeMillis = endTime - new Date(order.startTime);
            var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
            var prepMins = Math.floor(prepTimeSecs / 60);
            var prepSecs = prepTimeSecs % 60;
            
            var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
            
            order.endTime = endTime;
            order.endTimeFormatted = Avika.ui.formatTime(endTime);
            order.prepTime = prepTimeFormatted;
            
            // Crear una copia profunda del objeto para evitar problemas de referencia
            var orderCopy = JSON.parse(JSON.stringify(order));
            
            // Mover a completados (usando la copia)
            Avika.data.completedOrders.unshift(orderCopy);
            
            // Eliminar de pendientes
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            Avika.ui.showNotification('¡' + order.dish + ' terminado! Tiempo total: ' + prepTimeFormatted);
        }
        
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función marca como terminado un platillo individual dentro de un ticket
    finishIndividualItem: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Marcar el platillo como terminado
        order.finished = true;
        order.finishTime = new Date();
        order.finishTimeFormatted = Avika.ui.formatTime(order.finishTime);
        
        // Calcular el tiempo de preparación individual
        var prepTimeMillis = order.finishTime - new Date(order.startTime);
        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
        var prepMins = Math.floor(prepTimeSecs / 60);
        var prepSecs = prepTimeSecs % 60;
        
        order.individualPrepTime = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
        
        Avika.ui.showNotification(order.dish + ' terminado individualmente en ' + order.individualPrepTime);
        
        // Si es parte de un ticket, verificar si todos los platillos están terminados
        if (order.ticketId) {
            var allTicketItemsFinished = true;
            var ticketItems = [];
            
            // Recopilar todos los platillos del mismo ticket
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    ticketItems.push(item);
                    
                    // Verificar si este platillo está terminado
                    if (item.isSpecialCombo) {
                        if (!item.hotKitchenFinished || !item.coldKitchenFinished) {
                            allTicketItemsFinished = false;
                        }
                    } else if (!item.finished) {
                        allTicketItemsFinished = false;
                    }
                }
            }
            
            // Si todos los platillos están listos, actualizar el estado del ticket entero
            if (allTicketItemsFinished) {
                Avika.ui.showNotification('Todos los platillos del ticket están listos para entrega');
                
                // Actualizar el estado de todos los platillos del ticket para indicar que están listos
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        // Marcar todos los platillos como listos para la entrega
                        item.allItemsFinished = true;
                        
                        // Si es domicilio o para llevar, marcar como listo para salida
                        if (item.serviceType === 'domicilio' || item.serviceType === 'para-llevar') {
                            item.readyForDelivery = true;
                            // Esto fuerza a que se muestre el botón de salida del repartidor
                            item.allItemsReady = true;
                        }
                    }
                }
            }
        }
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    }
};