// js/modules/ticket-service.js - Gestión unificada de tickets
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    if (!Avika.orders) Avika.orders = {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('ticketService');
    }
    
    // Estado del ticket actual
    Avika.orders.currentTicket = {
        id: null,
        items: [],
        service: 'comedor',
        creationTime: null,
        active: false
    };
    
    // Activar modo ticket
    Avika.ui.enableTicketMode = function() {
        try {
            console.log("Activando modo ticket");
            
            // Generar ID único para el ticket
            Avika.orders.currentTicket.id = 'ticket-' + Date.now();
            Avika.orders.currentTicket.items = [];
            Avika.orders.currentTicket.service = 'comedor';
            Avika.orders.currentTicket.creationTime = new Date();
            Avika.orders.currentTicket.active = true;
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Modo ticket activado - Agrega platillos al ticket");
            }
            
            // Cambiar apariencia del botón
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Guardar Ticket';
                ticketBtn.style.backgroundColor = '#e74c3c';
                
                // Cambiar función del botón para guardar ticket
                ticketBtn.onclick = function() {
                    Avika.orders.saveCurrentTicket();
                };
            }
            
            return true;
        } catch (e) {
            console.error("Error al activar modo ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("No se pudo activar el modo ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Agregar platillo al ticket actual
    Avika.orders.addToCurrentTicket = function(dish) {
        try {
            if (!Avika.orders.currentTicket.active) {
                console.warn("Intentando agregar a un ticket no activo");
                return false;
            }
            
            // Crear objeto de ítem
            var item = {
                id: 'item-' + Date.now(),
                dish: dish.dish || dish,
                quantity: dish.quantity || 1,
                customizations: dish.customizations || [],
                notes: dish.notes || '',
                ticketId: Avika.orders.currentTicket.id
            };
            
            // Agregar al ticket
            Avika.orders.currentTicket.items.push(item);
            
            // Mostrar notificación
            var itemText = item.dish + (item.quantity > 1 ? ' (' + item.quantity + ')' : '');
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Agregado al ticket: " + itemText);
            }
            
            return true;
        } catch (e) {
            console.error("Error al agregar platillo al ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al agregar platillo: " + e.message);
            }
            return false;
        }
    };
    
    // Guardar el ticket actual
    Avika.orders.saveCurrentTicket = function() {
        try {
            if (!Avika.orders.currentTicket.active) {
                console.warn("Intentando guardar un ticket no activo");
                return false;
            }
            
            if (Avika.orders.currentTicket.items.length === 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("No hay platillos en el ticket", 3000);
                }
                return false;
            }
            
            var startTime = new Date();
            
            // Crear órdenes para cada ítem del ticket
            Avika.orders.currentTicket.items.forEach(function(item) {
                var newOrder = {
                    id: 'order-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    dish: item.dish,
                    quantity: item.quantity,
                    customizations: item.customizations,
                    service: Avika.orders.currentTicket.service,
                    notes: item.notes,
                    startTime: startTime,
                    ticketId: Avika.orders.currentTicket.id
                };
                
                // Agregar a la lista de pedidos pendientes
                if (!Avika.data.pendingOrders) {
                    Avika.data.pendingOrders = [];
                }
                
                Avika.data.pendingOrders.push(newOrder);
            });
            
            // Actualizar tabla
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Notificar
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Ticket guardado con " + Avika.orders.currentTicket.items.length + " platillos");
            }
            
            // Restablecer el ticket
            Avika.orders.currentTicket.active = false;
            Avika.orders.currentTicket.items = [];
            
            // Restaurar botón
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                ticketBtn.style.backgroundColor = '';
                
                // Restaurar función original del botón
                ticketBtn.onclick = function() {
                    Avika.ui.enableTicketMode();
                };
            }
            
            return true;
        } catch (e) {
            console.error("Error al guardar ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al guardar ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Completar un pedido
    Avika.orders.completeOrder = function(index) {
        try {
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Índice de pedido inválido:", index);
                return false;
            }
            
            var order = Avika.data.pendingOrders[index];
            
            // Check if this is a delivery order
            if (order.service === 'domicilio') {
                // Mark it as finished but keep it in the pending orders for delivery tracking
                order.finishTime = new Date();
                order.completed = true;
                
                // Calculate preparation time
                var startTime = new Date(order.startTime);
                var endTime = order.finishTime;
                var prepTimeMillis = endTime - startTime;
                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                
                // Format preparation time
                var prepMins = Math.floor(prepTimeSecs / 60);
                var prepSecs = prepTimeSecs % 60;
                
                order.prepTime = (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                Avika.dateUtils.padZero(prepMins) : (prepMins < 10 ? '0' : '') + prepMins) + 
                               ':' + 
                               (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                Avika.dateUtils.padZero(prepSecs) : (prepSecs < 10 ? '0' : '') + prepSecs);
                
                // Update the pending table to show the delivery tracking buttons
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Save data
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Notify
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Platillo '" + order.dish + "' listo para entrega. Registre salida del repartidor.");
                }
                
                return true;
            } else {
                // For non-delivery orders, use the original function
                return originalCompleteOrder.call(this, index);
            }
        } catch (e) {
            console.error("Error al completar pedido (versión mejorada):", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al completar pedido: " + e.message);
            }
            return false;
        }
    };
    
    console.log("Módulo de gestión de tickets inicializado");
})();
