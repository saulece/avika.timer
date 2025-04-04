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
        order.finished = true; // Marcar como terminado
        order.kitchenFinishedTime = new Date();
        order.kitchenFinishedTimeFormatted = Avika.ui.formatTime(order.kitchenFinishedTime);
        
        // Si no tiene tiempo de finalización, establecerlo ahora
        if (!order.finishTime) {
            order.finishTime = new Date();
            order.finishTimeFormatted = Avika.ui.formatTime(order.finishTime);
        }
        
        // Si es parte de un ticket, verificar si todos los platillos están listos
        if (order.ticketId) {
            var allTicketItemsFinished = true;
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Para platillos normales
                    if (!item.isSpecialCombo && !item.finished) {
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
            
            // Si todos los platillos del ticket están listos, actualizar el estado del ticket completo
            if (allTicketItemsFinished) {
                Avika.ui.showNotification('Ticket completo listo en cocina. Listo para salida del repartidor.');
                
                // Actualizar todos los platillos del ticket para indicar que todo el ticket está listo
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        item.allTicketItemsFinished = true;
                        item.allItemsFinished = true;
                        item.finished = true;
                        item.kitchenFinished = true;
                        
                        // Si es domicilio o para llevar, marcar como listo para salida
                        if (item.serviceType === 'domicilio' || item.serviceType === 'para-llevar') {
                            item.readyForDelivery = true;
                        }
                    }
                }
            } else {
                // Si no todos los platillos están listos, asegurarnos de mantener el estado correcto
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        item.allTicketItemsFinished = false;
                        item.allItemsFinished = false;
                        item.readyForDelivery = false;
                    }
                }
                Avika.ui.showNotification(order.dish + ' terminado en cocina, pero aún faltan más platillos del ticket.');
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
        
        // Si es parte de un ticket de comedor o para llevar, verificar si todos los platillos están listos
        if (order.ticketId && (order.serviceType === 'comedor' || order.serviceType === 'para-llevar')) {
            // Verificar si todos los platillos del ticket están terminados
            var ticketItems = Avika.data.pendingOrders.filter(function(item) {
                return item.ticketId === order.ticketId;
            });
            
            // Verificar si todos los platillos están terminados
            var allTicketItemsFinished = true;
            for (var i = 0; i < ticketItems.length; i++) {
                var item = ticketItems[i];
                if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                    allTicketItemsFinished = false;
                    break;
                } else if (!item.isSpecialCombo && !item.finished && item.id !== id) {
                    // Para platillos normales, verificar si están terminados, pero excluir el platillo actual
                    // ya que la propiedad 'finished' podría no estar actualizada aún
                    allTicketItemsFinished = false;
                    break;
                }
            }
            
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
            order.individualPrepTime = prepTimeFormatted;
            
            // Si todavía faltan platillos por terminar, actualizar la UI y salir
            if (!allTicketItemsFinished) {
                // Verificar si este evento completa todos los platillos
                var completesTicket = true;
                for (var i = 0; i < ticketItems.length; i++) {
                    var item = ticketItems[i];
                    if (item.id !== id) { // Excluir el platillo actual que ya sabemos está terminado
                        if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                            completesTicket = false;
                            break;
                        } else if (!item.isSpecialCombo && !item.finished) {
                            completesTicket = false;
                            break;
                        }
                    }
                }
                
                if (!completesTicket) {
                    Avika.ui.showNotification(order.dish + ' terminado. Faltan más platillos para completar el ticket.');
                    Avika.ui.updatePendingTable();
                    Avika.storage.guardarDatosLocales();
                    return;
                }
            }
            
            // Si todos los platillos están terminados o este platillo completa el ticket, mover todo a completados
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
                    if (item.ticketId === ticketId) {
                        // Marcar todos los platillos como listos para la entrega
                        item.allTicketItemsFinished = true;
                        item.allItemsFinished = true;
                        item.finished = true;
                        item.kitchenFinished = true;
                        
                        // Si es domicilio o para llevar, marcar como listo para salida
                        if (item.serviceType === 'domicilio' || item.serviceType === 'para-llevar') {
                            item.readyForDelivery = true;
                        }
                    }
                }
                
                // Si todos los platillos del ticket están listos y es servicio de comedor,
                // automáticamente completar el ticket (mover a completados)
                if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
                    // Usamos el ID de cualquier platillo del ticket para llamar a finishPreparation
                    // que se encargará de mover todos los platillos del ticket a completados
                    this.finishPreparation(order.id);
                    return; // Salimos temprano porque finishPreparation ya actualizará la UI
                }
            } else {
                // Si no todos los platillos están listos, asegurarnos que NO se active el botón de salida
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        item.allTicketItemsFinished = false;
                        item.allItemsFinished = false;
                        item.readyForDelivery = false;
                    }
                }
            }
        }
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },

    // Función para limpiar el historial de pedidos completados
    clearCompletedOrders: function() {
        Avika.data.completedOrders = [];
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Historial de platillos terminados limpiado correctamente');
    }
};