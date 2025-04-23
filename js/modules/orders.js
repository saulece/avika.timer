// orders.js - Implementación de funciones para manejo de órdenes
window.Avika = window.Avika || {};

// Función de respaldo para formatear tiempo transcurrido
function formatElapsedTimeFallback(seconds) {
    if (!seconds && seconds !== 0) return '--:--:--';
    
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    
    // Función auxiliar para agregar ceros
    function padZero(num) {
        return (num < 10 ? '0' : '') + num;
    }
    
    return padZero(hours) + ':' + padZero(minutes) + ':' + padZero(secs);
}

// Función centralizada para formatear tiempo transcurrido
// Esta función intenta usar las implementaciones disponibles en orden de preferencia
function getFormatElapsedTimeFunction() {
    if (Avika.utils && typeof Avika.utils.formatElapsedTime === 'function') {
        return function(seconds) {
            return Avika.utils.formatElapsedTime.call(Avika.utils, seconds);
        };
    } else if (Avika.ui && typeof Avika.ui.formatElapsedTime === 'function') {
        return function(seconds) {
            return Avika.ui.formatElapsedTime.call(Avika.ui, seconds);
        };
    } else if (Avika.orderService && typeof Avika.orderService.formatElapsedTime === 'function') {
        return function(seconds) {
            return Avika.orderService.formatElapsedTime.call(Avika.orderService, seconds);
        };
    } else {
        return formatElapsedTimeFallback;
    }
}

Avika.orders = {
    // Estado interno para tracking de tickets
    _ticketStatus: {},
    // MODIFICADO: Evitar duplicados de tickets de domicilio en registro y exportación
    _completedTickets: new Set(),

    // Función para reiniciar el registro de tickets completados
    resetCompletedTickets: function() {
        this._completedTickets = new Set();
        console.log("Registro de tickets completados reiniciado");
    },
    
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
        var formatElapsedTime = getFormatElapsedTimeFunction();
        order.preparationTimeFormatted = formatElapsedTime(order.preparationTime);
        
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
        
        // Buscar la orden
        var orderIndex = -1;
        var order = null;
        
        for (var i = 0; i < Avika.data.orders.length; i++) {
            if (Avika.data.orders[i].id === orderId) {
                order = Avika.data.orders[i];
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
        
        // AÑADIDO: Verificar si es un ticket de domicilio y ya fue completado
        if (order.serviceType === 'domicilio' && order.ticketId && this._completedTickets.has(order.ticketId)) {
            console.log("Ticket de domicilio ya completado, evitando duplicado:", order.ticketId);
            // Solo eliminar de órdenes pendientes sin duplicar en completados
            Avika.data.orders.splice(orderIndex, 1);
            
            // Actualizar interfaz
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            return;
        }
        
        // AÑADIDO: Si es un ticket de domicilio, marcarlo como completado
        if (order.serviceType === 'domicilio' && order.ticketId) {
            this._completedTickets.add(order.ticketId);
        }
        
        // Marcar como completado
        order.status = 'completed';
        order.completionTime = new Date().toLocaleTimeString();
        
        // Mover a completados
        Avika.data.completedOrders.push(order);
        Avika.data.orders.splice(orderIndex, 1);
        
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
            Avika.ui.showNotification('¡' + order.dish + ' listo!', 'success');
        } else {
            console.log('¡' + order.dish + ' listo!');
        }
    },
    
    // Función para finalizar la preparación para entrega a domicilio (no ticket)
    finishKitchenForDelivery: function(orderId) {
        var order = Avika.data.orders.find(function(o) { return o.id === orderId; });
        if (!order || order.status === 'completed') return;
        // Evitar duplicados
        if (this._completedTickets.has(order.ticketId)) return;
        this._completedTickets.add(order.ticketId);
        order.status = 'completed';
        order.completionTime = new Date().toLocaleTimeString();
        Avika.data.completedOrders.push(order);
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable();
        }
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    },
    
    // Función para registrar la salida de una entrega a domicilio
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);
        
        // Buscar la orden
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
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }
        
        // AÑADIDO: Verificar si es un ticket de domicilio y ya fue completado
        if (order.serviceType === 'domicilio' && order.ticketId && this._completedTickets.has(order.ticketId)) {
            console.log("Ticket de domicilio ya completado, evitando duplicado:", order.ticketId);
            // Solo eliminar de órdenes en reparto sin duplicar en completados
            Avika.data.deliveryOrders.splice(orderIndex, 1);
            
            // Actualizar interfaz
            if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            
            return;
        }
        
        // Registrar fecha y hora de salida
        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime;
        
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
                    item.deliveryDepartureTime = departureTime;
                    
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
                    item.deliveryDepartureTime = departureTime;
                    
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
            if (orderIndex !== -1) {
                // Mover a órdenes en reparto
                if (!Avika.data.deliveryOrders) {
                    Avika.data.deliveryOrders = [];
                }
                Avika.data.deliveryOrders.unshift(order);
                Avika.data.orders.splice(orderIndex, 1);
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
        console.log("Registrando entrega a domicilio:", orderId);
        
        // Verificar que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders) {
            console.error("El array de órdenes en reparto no existe");
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error: No hay órdenes en reparto', 'error');
            }
            return;
        }
        
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
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error: No se pudo encontrar la orden en reparto', 'error');
            }
            
            // Actualizar la tabla de reparto para reflejar el estado actual
            if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            return;
        }
        
        // AÑADIDO: Verificar si es un ticket de domicilio y ya fue completado
        if (order.serviceType === 'domicilio' && order.ticketId && this._completedTickets.has(order.ticketId)) {
            console.log("Ticket de domicilio ya completado, evitando duplicado:", order.ticketId);
            // Solo eliminar de órdenes en reparto sin duplicar en completados
            Avika.data.deliveryOrders.splice(orderIndex, 1);
            
            // Actualizar interfaz
            if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            
            return;
        }
        
        // AÑADIDO: Si es un ticket de domicilio, marcarlo como completado
        if (order.serviceType === 'domicilio' && order.ticketId) {
            this._completedTickets.add(order.ticketId);
        }
        
        // Registrar fecha y hora de entrega
        var arrivalTime = new Date();
        order.deliveryArrivalTime = arrivalTime;
        
        // Formatear hora con manejo de errores
        try {
            if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                order.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);
            } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                order.deliveryArrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
            } else {
                // Implementación de respaldo
                var hours = (arrivalTime.getHours() < 10 ? '0' : '') + arrivalTime.getHours();
                var minutes = (arrivalTime.getMinutes() < 10 ? '0' : '') + arrivalTime.getMinutes();
                var seconds = (arrivalTime.getSeconds() < 10 ? '0' : '') + arrivalTime.getSeconds();
                order.deliveryArrivalTimeFormatted = hours + ':' + minutes + ':' + seconds;
            }
        } catch (e) {
            console.warn("Error al formatear hora de llegada:", e);
            var hours = (arrivalTime.getHours() < 10 ? '0' : '') + arrivalTime.getHours();
            var minutes = (arrivalTime.getMinutes() < 10 ? '0' : '') + arrivalTime.getMinutes();
            var seconds = (arrivalTime.getSeconds() < 10 ? '0' : '') + arrivalTime.getSeconds();
            order.deliveryArrivalTimeFormatted = hours + ':' + minutes + ':' + seconds;
        }
        
        // Calcular tiempo de entrega
        if (!order.deliveryDepartureTime) {
            console.warn("La orden no tiene tiempo de salida registrado, usando tiempo actual");
            order.deliveryDepartureTime = new Date(order.endTime || order.startTime);
            
            // Formatear hora de salida si no existe
            try {
                if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                    order.deliveryDepartureTimeFormatted = Avika.utils.formatTime(order.deliveryDepartureTime);
                } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                    order.deliveryDepartureTimeFormatted = Avika.ui.formatTime(order.deliveryDepartureTime);
                }
            } catch (e) {
                console.warn("Error al formatear hora de salida faltante:", e);
            }
        }
        
        var deliveryTimeInSeconds = Math.floor((arrivalTime - new Date(order.deliveryDepartureTime)) / 1000);
        order.deliveryTime = deliveryTimeInSeconds;
        
        // Usar la función centralizada para formatear tiempo transcurrido
        var formatElapsedTime = getFormatElapsedTimeFunction();
        order.deliveryTimeFormatted = formatElapsedTime(deliveryTimeInSeconds);
        
        // Asegurarse de que el array de órdenes completadas existe
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }
        
        // Mover a órdenes completadas
        Avika.data.completedOrders.unshift(order);
        
        // Si es parte de un ticket, actualizar y mover todos los platillos del ticket
        if (order.ticketId) {
            console.log("Procesando ticket completo:", order.ticketId);
            
            // Crear una copia del array de órdenes en reparto para evitar problemas al modificarlo
            var deliveryOrdersCopy = Avika.data.deliveryOrders.slice();
            var itemsToRemove = [];
            
            // Primero, identificar todos los platillos del mismo ticket
            for (var i = 0; i < deliveryOrdersCopy.length; i++) {
                var item = deliveryOrdersCopy[i];
                
                // Verificar si el item pertenece al mismo ticket
                if (item.ticketId === order.ticketId) {
                    console.log("Encontrado platillo del mismo ticket en reparto:", item.id, item.dish);
                    
                    // Registrar entrega para este platillo
                    item.deliveryArrivalTime = arrivalTime;
                    
                    // Formatear hora de llegada
                    try {
                        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
                            item.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);
                        } else if (Avika.ui && typeof Avika.ui.formatTime === 'function') {
                            item.deliveryArrivalTimeFormatted = Avika.ui.formatTime(arrivalTime);
                        } else {
                            // Implementación de respaldo
                            var hours = (arrivalTime.getHours() < 10 ? '0' : '') + arrivalTime.getHours();
                            var minutes = (arrivalTime.getMinutes() < 10 ? '0' : '') + arrivalTime.getMinutes();
                            var seconds = (arrivalTime.getSeconds() < 10 ? '0' : '') + arrivalTime.getSeconds();
                            item.deliveryArrivalTimeFormatted = hours + ':' + minutes + ':' + seconds;
                        }
                    } catch (e) {
                        console.warn("Error al formatear hora de llegada para item:", e);
                        var hours = (arrivalTime.getHours() < 10 ? '0' : '') + arrivalTime.getHours();
                        var minutes = (arrivalTime.getMinutes() < 10 ? '0' : '') + arrivalTime.getMinutes();
                        var seconds = (arrivalTime.getSeconds() < 10 ? '0' : '') + arrivalTime.getSeconds();
                        item.deliveryArrivalTimeFormatted = hours + ':' + minutes + ':' + seconds;
                    }
                    
                    // Asegurarse de que tiene tiempo de salida
                    if (!item.deliveryDepartureTime) {
                        console.warn("Un item del ticket no tiene tiempo de salida registrado, usando el mismo que el platillo principal");
                        item.deliveryDepartureTime = order.deliveryDepartureTime;
                        item.deliveryDepartureTimeFormatted = order.deliveryDepartureTimeFormatted;
                    }
                    
                    // Calcular tiempo de entrega
                    var itemDeliveryTime = Math.floor((arrivalTime - new Date(item.deliveryDepartureTime)) / 1000);
                    item.deliveryTime = itemDeliveryTime;
                    
                    // Usar la función centralizada para formatear tiempo transcurrido
                    var formatElapsedTime = getFormatElapsedTimeFunction();
                    item.deliveryTimeFormatted = formatElapsedTime(itemDeliveryTime);
                    
                    // Agregar a completadas
                    Avika.data.completedOrders.unshift(item);
                    
                    // Marcar para eliminar
                    itemsToRemove.push(item.id);
                }
            }
            
            // Eliminar todos los platillos del mismo ticket de la sección de reparto
            Avika.data.deliveryOrders = Avika.data.deliveryOrders.filter(function(item) {
                return !itemsToRemove.includes(item.id);
            });
            
            // Buscar si hay algún platillo del mismo ticket en pendientes (caso raro pero posible)
            var pendingOrdersCopy = Avika.data.pendingOrders ? Avika.data.pendingOrders.slice() : [];
            var pendingItemsToRemove = [];
            
            for (var i = 0; i < pendingOrdersCopy.length; i++) {
                var item = pendingOrdersCopy[i];
                if (item.ticketId === order.ticketId) {
                    console.warn("Se encontró un platillo del ticket en pendientes, moviendo directamente a completados");
                    
                    // Registrar salida y entrega para este platillo
                    item.deliveryDepartureTime = order.deliveryDepartureTime;
                    item.deliveryDepartureTimeFormatted = order.deliveryDepartureTimeFormatted;
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = order.deliveryArrivalTimeFormatted;
                    item.deliveryTime = order.deliveryTime;
                    item.deliveryTimeFormatted = order.deliveryTimeFormatted;
                    
                    // Marcar como terminado
                    item.finished = true;
                    item.kitchenFinished = true;
                    
                    // Agregar a completadas
                    Avika.data.completedOrders.unshift(item);
                    
                    // Marcar para eliminar de pendientes
                    pendingItemsToRemove.push(item.id);
                }
            }
            
            // Eliminar los platillos del mismo ticket de pendientes
            if (Avika.data.pendingOrders && pendingItemsToRemove.length > 0) {
                Avika.data.pendingOrders = Avika.data.pendingOrders.filter(function(item) {
                    return !pendingItemsToRemove.includes(item.id);
                });
            }
        } else {
            // Si no es parte de un ticket, simplemente eliminar la orden original de reparto
            Avika.data.deliveryOrders.splice(orderIndex, 1);
        }
        
        // Actualizar tablas
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable();
            }
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Entrega completada para ' + order.dish + '! Tiempo de entrega: ' + 
                                  order.deliveryTimeFormatted, 'success');
        } else {
            console.log('¡Entrega completada para ' + order.dish + '! Tiempo de entrega: ' + 
                      order.deliveryTimeFormatted);
        }
    },

    // Función para limpiar el registro de tickets completados (útil al iniciar la app)
    resetCompletedTickets: function() {
        this._completedTickets.clear();
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

    // Función auxiliar para formatear tiempo (respaldo)
    formatTime: function(date) {
        if (!date) return '--:--:--';
        
        try {
            var hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
            var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            var seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
            return hours + ':' + minutes + ':' + seconds;
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
    },
    
    // Función para finalizar cocina caliente (para combos especiales)
    finishHotKitchen: function(orderId) {
        if (Avika.orderService && typeof Avika.orderService.finishHotKitchen === 'function') {
            return Avika.orderService.finishHotKitchen(orderId);
        } else {
            console.error("Error: La función finishHotKitchen no está disponible en orderService");
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al procesar cocina caliente. Consulta la consola para más detalles.', 'error');
            }
        }
    },
    
    // Función para finalizar cocina fría (para combos especiales)
    finishColdKitchen: function(orderId) {
        if (Avika.orderService && typeof Avika.orderService.finishColdKitchen === 'function') {
            return Avika.orderService.finishColdKitchen(orderId);
        } else {
            console.error("Error: La función finishColdKitchen no está disponible en orderService");
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al procesar cocina fría. Consulta la consola para más detalles.', 'error');
            }
        }
    },
};