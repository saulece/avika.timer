// Corrección para el problema de Modo Ticket
(function() {
    console.log("Aplicando correcciones mejoradas para el modo ticket...");
    
    // Reemplazar la función de guardar ticket
    Avika.orders.saveCurrentTicket = function() {
        try {
            console.log("Guardando ticket (versión corregida)");
            
            // Verificar que el ticket está activo
            if (!Avika.orders.currentTicket || !Avika.orders.currentTicket.active) {
                console.warn("Intentando guardar un ticket no activo");
                return false;
            }
            
            // Si no hay items, mostrar notificación
            if (!Avika.orders.currentTicket.items || Avika.orders.currentTicket.items.length === 0) {
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
            
            // Restaurar botón de manera más robusta
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                ticketBtn.style.backgroundColor = '';
                
                // Remover todos los event listeners anteriores
                var newBtn = ticketBtn.cloneNode(true);
                ticketBtn.parentNode.replaceChild(newBtn, ticketBtn);
                
                // Asignar evento nuevo
                newBtn.addEventListener('click', function() {
                    if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                        Avika.ui.enableTicketMode();
                    }
                });
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

    // Una versión más directa de la función, para tener backup
    window.guardarTicketActual = function() {
        if (Avika.orders && typeof Avika.orders.saveCurrentTicket === 'function') {
            return Avika.orders.saveCurrentTicket();
        }
        return false;
    }
    
    // Asegurar que el botón tenga el evento correcto al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
            // Limpiar todos los eventos previos
            var newBtn = btnNewTicket.cloneNode(true);
            btnNewTicket.parentNode.replaceChild(newBtn, btnNewTicket);
            
            // Asignar el evento correcto basado en el texto del botón
            newBtn.addEventListener('click', function() {
                if (this.textContent.includes('Guardar')) {
                    // Llamar a guardarTicketActual (función global de respaldo)
                    window.guardarTicketActual();
                } else {
                    if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                        Avika.ui.enableTicketMode();
                    }
                }
            });
        }
    });
    
    console.log("Correcciones para el modo ticket aplicadas");
})();