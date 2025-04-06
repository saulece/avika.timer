// Corrección para el problema de Modo Ticket
(function() {
    console.log("Aplicando correcciones para el modo ticket...");
    
    // Reemplazar la función saveTicket para asegurar que funcione correctamente
    Avika.ui.saveTicket = function() {
        try {
            console.log("Guardando ticket con items del ticket actual");
            
            if (this.state.ticketItems.length === 0) {
                this.showNotification("Error: No hay platillos en el ticket", 3000);
                return false;
            }
            
            // Obtener notas generales
            var ticketNotes = document.getElementById('ticket-notes');
            var generalNotes = ticketNotes ? ticketNotes.value : '';
            
            // Crear nuevo ticket
            var ticketId = 'ticket-' + Date.now();
            
            // Crear órdenes individuales para cada item
            var orders = [];
            for (var i = 0; i < this.state.ticketItems.length; i++) {
                var item = this.state.ticketItems[i];
                
                // Crear nueva orden
                var order = {
                    dish: item.dish,
                    quantity: item.quantity,
                    customizations: item.customizations || [],
                    notes: item.notes || (generalNotes ? generalNotes : ''),
                    service: this.state.ticketService,
                    startTime: item.startTime || new Date(),
                    ticketId: ticketId, // Referencia al ticket
                    status: 'pending'
                };
                
                // Añadir orden
                orders.push(order);
            }
            
            // Agregar órdenes a la lista de pendientes
            if (!Avika.data.pendingOrders) {
                Avika.data.pendingOrders = [];
            }
            
            // Añadir todas las órdenes
            Array.prototype.push.apply(Avika.data.pendingOrders, orders);
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar tabla de órdenes pendientes
            this.updatePendingTable();
            
            // Cerrar modal
            var ticketModal = document.getElementById('ticket-modal');
            if (ticketModal) {
                ticketModal.style.display = 'none';
            }
            
            // Restaurar botón de ticket a su estado original
            var newTicketBtn = document.getElementById('btn-new-ticket');
            if (newTicketBtn) {
                newTicketBtn.textContent = 'Nuevo Ticket/Comanda';
                newTicketBtn.style.backgroundColor = '';
                
                // Clonar el botón para quitar eventos anteriores
                var newBtn = newTicketBtn.cloneNode(true);
                if (newTicketBtn.parentNode) {
                    newTicketBtn.parentNode.replaceChild(newBtn, newTicketBtn);
                }
                
                // Asignar nuevo evento correcto
                newBtn.addEventListener('click', function() {
                    Avika.ui.enableTicketMode();
                });
            }
            
            // Resetear estado
            this.state.ticketMode = false;
            this.state.ticketItems = [];
            
            // Mostrar notificación
            this.showNotification("Ticket guardado con " + orders.length + " platillos");
            
            return true;
        } catch (e) {
            console.error("Error al guardar ticket:", e);
            this.showErrorMessage("Error al guardar ticket: " + e.message);
            return false;
        }
    };
    
    // También reemplazar la función original saveCurrentTicket
    if (Avika.orders) {
        Avika.orders.saveCurrentTicket = function() {
            try {
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
                
                // Restaurar botón
                var ticketBtn = document.getElementById('btn-new-ticket');
                if (ticketBtn) {
                    ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                    ticketBtn.style.backgroundColor = '';
                    
                    // Clonar el botón para quitar eventos anteriores
                    var newBtn = ticketBtn.cloneNode(true);
                    if (ticketBtn.parentNode) {
                        ticketBtn.parentNode.replaceChild(newBtn, ticketBtn);
                    }
                    
                    // Asignar nuevo evento correcto
                    newBtn.addEventListener('click', function() {
                        if (typeof Avika.ui.enableTicketMode === 'function') {
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
                
                // Asegurar que el botón se restaure incluso en caso de error
                var ticketBtn = document.getElementById('btn-new-ticket');
                if (ticketBtn) {
                    ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                    ticketBtn.style.backgroundColor = '';
                    
                    // Restaurar función original del botón
                    ticketBtn.onclick = function() {
                        if (typeof Avika.ui.enableTicketMode === 'function') {
                            Avika.ui.enableTicketMode();
                        }
                    };
                }
                
                return false;
            }
        };
    }
    
    // Corregir el botón de nuevo ticket
    document.addEventListener('DOMContentLoaded', function() {
        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
            // Clonar el botón para quitar eventos anteriores
            var newBtn = btnNewTicket.cloneNode(true);
            if (btnNewTicket.parentNode) {
                btnNewTicket.parentNode.replaceChild(newBtn, btnNewTicket);
            }
            
            // Asignar nuevo evento
            newBtn.addEventListener('click', function() {
                if (this.textContent.includes('Guardar')) {
                    // Si el botón dice "Guardar Ticket", llamar a la función correcta
                    if (Avika.orders && typeof Avika.orders.saveCurrentTicket === 'function') {
                        Avika.orders.saveCurrentTicket();
                    } else if (Avika.ui && typeof Avika.ui.saveTicket === 'function') {
                        Avika.ui.saveTicket();
                    }
                } else {
                    // Si no, activar modo ticket
                    if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                        Avika.ui.enableTicketMode();
                    }
                }
            });
        }
    });
    
    console.log("Correcciones para el modo ticket aplicadas");
})();