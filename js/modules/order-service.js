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
    deliveryOrders: [], // Nueva array para órdenes en reparto
    completedOrders: [],
    timerInterval: null,
    
    // Añadir una función de utilidad para encontrar órdenes por ID
    findOrderIndexById: function(id, orderArray) {
        orderArray = orderArray || this.pendingOrders;
        for (var i = 0; i < orderArray.length; i++) {
            if (orderArray[i].id === id) {
                return i;
            }
        }
        return -1;
    },
    
    // Función para calcular tiempos formateados
    calculateTimeFormatted: function(endTime, startTime) {
        var timeMillis = endTime - new Date(startTime);
        var timeSecs = Math.floor(timeMillis / 1000);
        var mins = Math.floor(timeSecs / 60);
        var secs = timeSecs % 60;
        
        return Avika.ui.padZero(mins) + ':' + Avika.ui.padZero(secs) + ' minutos';
    }
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
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.hotKitchenFinished = true;
        order.hotKitchenTime = now;
        order.hotKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina caliente terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            // Si es domicilio, mover a la sección de reparto
            if (order.serviceType === 'domicilio') {
                this.moveToDelivery(id);
            } 
            // Si no es domicilio, finalizar normalmente
            else {
                this.finishPreparation(id);
            }
        }
    },

    finishColdKitchen: function(id) {
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.coldKitchenFinished = true;
        order.coldKitchenTime = now;
        order.coldKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina fría terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            // Si es domicilio, mover a la sección de reparto
            if (order.serviceType === 'domicilio') {
                this.moveToDelivery(id);
            } 
            // Si no es domicilio, finalizar normalmente
            else {
                this.finishPreparation(id);
            }
        }
    },

    // NUEVO: Función para mover un pedido a la sección de reparto
    moveToDelivery: function(id) {
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Marcar como terminado en cocina
        order.kitchenFinished = true;
        order.finished = true;
        order.finishTime = new Date();
        order.finishTimeFormatted = Avika.ui.formatTime(order.finishTime);
        
        // Si es parte de un ticket, verificar si todos los platillos están listos
        if (order.ticketId) {
            var allTicketItemsFinished = true;
            var ticketItems = [];
            
            // Encontrar todos los platillos del mismo ticket
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var item = Avika.data.pendingOrders[i];
                if (item.ticketId === order.ticketId) {
                    ticketItems.push(item);
                    
                    // Verificar si este platillo está terminado
                    if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                        allTicketItemsFinished = false;
                    } else if (!item.isSpecialCombo && !item.finished && item.id !== id) {
                        allTicketItemsFinished = false;
                    }
                }
            }
            
            // Si todos los platillos del ticket están listos, mover todo el ticket a reparto
            if (allTicketItemsFinished) {
                var itemsToMove = [];
                var itemsToRemove = [];
                
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        // Actualizar estado
                        item.kitchenFinished = true;
                        item.finished = true;
                        item.allTicketItemsFinished = true;
                        item.readyForDelivery = true;
                        
                        // Si no tiene ya tiempo de finalización, establecerlo
                        if (!item.finishTime) {
                            item.finishTime = new Date();
                            item.finishTimeFormatted = Avika.ui.formatTime(item.finishTime);
                        }
                        
                        // Añadir a la lista de movimiento
                        itemsToMove.push(JSON.parse(JSON.stringify(item)));
                        itemsToRemove.push(i);
                    }
                }
                
                // Mover todos los platillos a reparto (desde el último índice para no afectar los índices)
                for (var i = itemsToRemove.length - 1; i >= 0; i--) {
                    Avika.data.pendingOrders.splice(itemsToRemove[i], 1);
                }
                
                // Añadir todos los platillos a reparto
                for (var i = 0; i < itemsToMove.length; i++) {
                    Avika.data.deliveryOrders.push(itemsToMove[i]);
                }
                
                Avika.ui.showNotification('Ticket completo (' + itemsToMove.length + ' platillos) listo para reparto');
            } else {
                // Si no todos los platillos están listos, sólo mover este platillo
                Avika.data.deliveryOrders.push(JSON.parse(JSON.stringify(order)));
                Avika.data.pendingOrders.splice(orderIndex, 1);
                
                Avika.ui.showNotification(order.dish + ' listo para reparto. Aún hay platillos pendientes en este ticket.');
            }
        } else {
            // Si no es un ticket, mover directamente
            Avika.data.deliveryOrders.push(JSON.parse(JSON.stringify(order)));
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            Avika.ui.showNotification(order.dish + ' listo para reparto');
        }
        
        // Actualizar interfaces
        Avika.ui.updatePendingTable();
        Avika.ui.updateDeliveryTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función se llama cuando termina la preparación en cocina para un pedido a domicilio
    finishKitchenForDelivery: function(id) {
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        // Mover directamente a la sección de reparto
        this.moveToDelivery(id);
    },

    // Esta función registra la salida del repartidor (para todos los platillos del mismo ticket)
    markDeliveryDeparture: function(id) {
        // Primero buscar en órdenes en reparto
        var orderIndex = Avika.data.findOrderIndexById(id, Avika.data.deliveryOrders);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.deliveryOrders[orderIndex];
        var departureTime = new Date();
        var departureTimeFormatted = Avika.ui.formatTime(departureTime);
        
        // Si es parte de un ticket, marcar todos los platillos del mismo ticket
        if (order.ticketId) {
            var ticketDishCount = 0;
            
            // Actualizar todos los platillos del mismo ticket
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Registra el tiempo de salida para cada platillo del ticket
                    item.deliveryDepartureTime = departureTime;
                    item.deliveryDepartureTimeFormatted = departureTimeFormatted;
                    
                    // Marcar definitivamente como listo para entrega
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
        
        // Actualizar tabla de reparto
        Avika.ui.updateDeliveryTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función registra la entrega al cliente
    markDeliveryArrival: function(id) {
        // Buscar en órdenes en reparto
        var orderIndex = Avika.data.findOrderIndexById(id, Avika.data.deliveryOrders);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.deliveryOrders[orderIndex];
        var arrivalTime = new Date();
        var arrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
        
        // Si es parte de un ticket, procesar todo el ticket
        if (order.ticketId) {
            var ticketDishCount = 0;
            var itemsToRemove = [];
            
            // Primera pasada: recopilar índices y procesar cada platillo
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === order.ticketId) {
                    // Registra el tiempo de entrega para cada platillo
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = arrivalTimeFormatted;
                    
                    // Calcular tiempo total desde inicio hasta entrega
                    var endTime = arrivalTime;
                    item.prepTime = Avika.data.calculateTimeFormatted(endTime, item.startTime);
                    
                    item.endTime = endTime;
                    item.endTimeFormatted = arrivalTimeFormatted;
                    
                    // También calcular el tiempo específico de entrega
                    if (item.deliveryDepartureTime) {
                        item.deliveryTime = Avika.data.calculateTimeFormatted(endTime, item.deliveryDepartureTime);
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
                Avika.data.deliveryOrders.splice(itemsToRemove[i], 1);
            }
            
            Avika.ui.showNotification('¡Ticket completo entregado al cliente! (' + ticketDishCount + ' platillos)');
        } else {
            // Modo individual (sin ticket)
            // Registra el tiempo de entrega y completa el pedido
            order.deliveryArrivalTime = arrivalTime;
            order.deliveryArrivalTimeFormatted = arrivalTimeFormatted;
            
            // Calcular tiempo total desde inicio hasta entrega
            var endTime = arrivalTime;
            order.prepTime = Avika.data.calculateTimeFormatted(endTime, order.startTime);
            
            order.endTime = endTime;
            order.endTimeFormatted = arrivalTimeFormatted;
            
            // También calcular el tiempo específico de entrega
            if (order.deliveryDepartureTime) {
                order.deliveryTime = Avika.data.calculateTimeFormatted(endTime, order.deliveryDepartureTime);
            }
            
            // Crear una copia profunda del objeto para evitar problemas de referencia
            var orderCopy = JSON.parse(JSON.stringify(order));
            
            // Mover a completados (usando la copia)
            Avika.data.completedOrders.unshift(orderCopy);
            
            // Eliminar de reparto
            Avika.data.deliveryOrders.splice(orderIndex, 1);
            
            Avika.ui.showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                          order.prepTime + (order.deliveryTime ? ', Tiempo de entrega: ' + order.deliveryTime : ''));
        }
        
        // Actualizar todas las tablas
        Avika.ui.updateDeliveryTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    },

    finishPreparation: function(id) {
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var endTime = new Date();
        
        // Si es domicilio, moverlo a la sección de reparto
        if (order.serviceType === 'domicilio') {
            this.moveToDelivery(id);
            return;
        }
        
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
            order.individualPrepTime = Avika.data.calculateTimeFormatted(endTime, order.startTime);
            
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
                    item.prepTime = Avika.data.calculateTimeFormatted(endTime, item.startTime);
                    
                    // Completar platillo
                    item.endTime = endTime;
                    item.endTimeFormatted = Avika.ui.formatTime(endTime);
                    
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
            // Calcular tiempo de preparación
            order.prepTime = Avika.data.calculateTimeFormatted(endTime, order.startTime);
            
            order.endTime = endTime;
            order.endTimeFormatted = Avika.ui.formatTime(endTime);
            
            // Crear una copia profunda del objeto para evitar problemas de referencia
            var orderCopy = JSON.parse(JSON.stringify(order));
            
            // Mover a completados (usando la copia)
            Avika.data.completedOrders.unshift(orderCopy);
            
            // Eliminar de pendientes
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            Avika.ui.showNotification('¡' + order.dish + ' terminado! Tiempo total: ' + order.prepTime);
        }
        
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función marca como terminado un platillo individual dentro de un ticket
    finishIndividualItem: function(id) {
        var orderIndex = Avika.data.findOrderIndexById(id);
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Si es domicilio, moverlo a la sección de reparto
        if (order.serviceType === 'domicilio') {
            this.moveToDelivery(id);
            return;
        }
        
        // Marcar el platillo como terminado
        order.finished = true;
        order.finishTime = new Date();
        order.finishTimeFormatted = Avika.ui.formatTime(order.finishTime);
        
        // Calcular el tiempo de preparación individual
        order.individualPrepTime = Avika.data.calculateTimeFormatted(order.finishTime, order.startTime);
        
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
                        
                        // Si es para llevar, marcar como listo para salida
                        if (item.serviceType === 'para-llevar') {
                            item.readyForDelivery = true;
                        }
                    }
                }
                
                // Si todos los platillos del ticket están listos y es servicio de comedor o para llevar,
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
    },

    // Funciones de utilidad para manejo de tiempo
    generateMinuteOptions: function() {
        var options = '';
        for (var i = 0; i < 60; i += 1) {
            options += `<option value="${i}">${Avika.ui.padZero(i)}</option>`;
        }
        return options;
    },

    getMinutes: function(totalSeconds) {
        return Math.floor(totalSeconds / 60);
    },
    
    getSeconds: function(totalSeconds) {
        return totalSeconds % 60;
    }
};