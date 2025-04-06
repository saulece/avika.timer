// Corrección para el problema de Modo Ticket
(function() {
    console.log("Aplicando correcciones mejoradas para el modo ticket...");
    
    // Variable para almacenar configuración del ticket
    var ticketConfig = {
        service: 'comedor',
        startTime: null,
        configured: false
    };
    
    // Función para configurar el ticket al iniciarlo
    Avika.ui.configureTicket = function() {
        // Mostrar un modal para la configuración del ticket completo
        var modalHTML = `
            <div id="ticket-config-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;justify-content:center;align-items:center;">
                <div style="background:white;padding:20px;border-radius:8px;width:90%;max-width:500px;">
                    <h3 style="margin-top:0;">Configuración del Ticket</h3>
                    <p>Configura los datos para todos los platillos de este ticket:</p>
                    
                    <div style="margin:15px 0;">
                        <h4 style="margin:5px 0;">Tipo de servicio:</h4>
                        <div style="display:flex;gap:10px;">
                            <button id="config-btn-comedor" class="option-btn selected" style="flex:1;padding:8px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Comedor</button>
                            <button id="config-btn-domicilio" class="option-btn" style="flex:1;padding:8px;background:#ddd;color:black;border:none;border-radius:4px;cursor:pointer;">Domicilio</button>
                            <button id="config-btn-para-llevar" class="option-btn" style="flex:1;padding:8px;background:#ddd;color:black;border:none;border-radius:4px;cursor:pointer;">Ordena y Espera</button>
                        </div>
                    </div>
                    
                    <div style="margin:15px 0;">
                        <h4 style="margin:5px 0;">Hora de ingreso:</h4>
                        <div style="display:flex;gap:10px;">
                            <input type="number" id="config-hour" min="0" max="23" value="${new Date().getHours()}" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;"> :
                            <input type="number" id="config-minute" min="0" max="59" value="${new Date().getMinutes()}" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;">
                        </div>
                    </div>
                    
                    <div style="display:flex;justify-content:flex-end;margin-top:20px;">
                        <button id="config-btn-save" style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Guardar y Continuar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        var modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstChild);
        
        // Configurar eventos de los botones de servicio
        document.getElementById('config-btn-comedor').addEventListener('click', function() {
            document.querySelectorAll('#ticket-config-modal .option-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.style.background = '#ddd';
                btn.style.color = 'black';
            });
            this.classList.add('selected');
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            ticketConfig.service = 'comedor';
        });
        
        document.getElementById('config-btn-domicilio').addEventListener('click', function() {
            document.querySelectorAll('#ticket-config-modal .option-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.style.background = '#ddd';
                btn.style.color = 'black';
            });
            this.classList.add('selected');
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            ticketConfig.service = 'domicilio';
        });
        
        document.getElementById('config-btn-para-llevar').addEventListener('click', function() {
            document.querySelectorAll('#ticket-config-modal .option-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.style.background = '#ddd';
                btn.style.color = 'black';
            });
            this.classList.add('selected');
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            ticketConfig.service = 'para-llevar';
        });
        
        // Configurar evento del botón guardar
        document.getElementById('config-btn-save').addEventListener('click', function() {
            var hour = parseInt(document.getElementById('config-hour').value);
            var minute = parseInt(document.getElementById('config-minute').value);
            
            if (isNaN(hour) || hour < 0 || hour > 23) {
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Hora inválida. Debe estar entre 0 y 23.");
                }
                return;
            }
            
            if (isNaN(minute) || minute < 0 || minute > 59) {
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Minutos inválidos. Deben estar entre 0 y 59.");
                }
                return;
            }
            
            // Establecer hora
            var selectedTime = new Date();
            selectedTime.setHours(hour, minute, 0);
            ticketConfig.startTime = selectedTime;
            
            // Marcar como configurado
            ticketConfig.configured = true;
            
            // Aplicar configuración al ticket actual
            Avika.orders.currentTicket.service = ticketConfig.service;
            Avika.orders.currentTicket.startTime = ticketConfig.startTime;
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Ticket configurado correctamente");
            }
            
            // Cerrar modal
            var modal = document.getElementById('ticket-config-modal');
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            
            // Activar modo ticket normal
            if (Avika.ui && typeof Avika.ui.enableTicketModeWithConfig === 'function') {
                Avika.ui.enableTicketModeWithConfig();
            }
        });
    };
    
    // Versión modificada de enableTicketMode
    var originalEnableTicketMode = Avika.ui.enableTicketMode;
    
    Avika.ui.enableTicketMode = function() {
        // Reiniciar configuración
        ticketConfig = {
            service: 'comedor',
            startTime: null,
            configured: false
        };
        
        // Mostrar configuración del ticket primero
        Avika.ui.configureTicket();
    };
    
    // Nueva función para activar el modo ticket después de la configuración
    Avika.ui.enableTicketModeWithConfig = function() {
        if (typeof originalEnableTicketMode === 'function') {
            originalEnableTicketMode();
        } else {
            console.log("Implementando función base para activar ticket");
            // Generar ID único para el ticket
            Avika.orders.currentTicket.id = 'ticket-' + Date.now();
            Avika.orders.currentTicket.items = [];
            Avika.orders.currentTicket.service = ticketConfig.service;
            Avika.orders.currentTicket.startTime = ticketConfig.startTime;
            Avika.orders.currentTicket.creationTime = new Date();
            Avika.orders.currentTicket.active = true;
            
            // Cambiar apariencia del botón
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Guardar Ticket';
                ticketBtn.style.backgroundColor = '#e74c3c';
                
                // Cambiar función del botón para guardar ticket
                var newBtn = ticketBtn.cloneNode(true);
                ticketBtn.parentNode.replaceChild(newBtn, ticketBtn);
                
                newBtn.addEventListener('click', function() {
                    Avika.orders.saveCurrentTicket();
                });
            }
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Modo ticket activado - Agrega platillos");
            }
        }
    };
    
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
            
            // Usar la hora configurada al crear el ticket
            var startTime = ticketConfig.startTime || new Date();
            
            // Crear órdenes para cada ítem del ticket
            Avika.orders.currentTicket.items.forEach(function(item) {
                var newOrder = {
                    id: 'order-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    dish: item.dish,
                    quantity: item.quantity,
                    customizations: item.customizations,
                    service: Avika.orders.currentTicket.service, // Usar el servicio del ticket
                    notes: item.notes,
                    startTime: startTime, // Usar la misma hora para todos
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
            
            // Reiniciar configuración del ticket
            ticketConfig = {
                service: 'comedor',
                startTime: null,
                configured: false
            };
            
            return true;
        } catch (e) {
            console.error("Error al guardar ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al guardar ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Modificar la función addToCurrentTicket para que use la configuración global
    var originalAddToCurrentTicket = Avika.orders.addToCurrentTicket;
    
    Avika.orders.addToCurrentTicket = function(dish) {
        try {
            if (!Avika.orders.currentTicket.active) {
                console.warn("Intentando agregar a un ticket no activo");
                return false;
            }
            
            // Crear objeto de ítem (sin service ni startTime, usará los del ticket)
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
    
    // Modificar startPreparation para verificar si estamos en modo ticket
    var originalStartPreparation = Avika.orders.startPreparation;
    
    Avika.orders.startPreparation = function() {
        // Si estamos en modo ticket, no debemos pedir la hora individualmente
        if (Avika.orders.currentTicket && Avika.orders.currentTicket.active && ticketConfig.configured) {
            try {
                if (!Avika.data.currentDish) {
                    console.error("Error: No hay platillo seleccionado");
                    if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Error: No hay platillo seleccionado", 3000);
                    }
                    return false;
                }
                
                // Crear ítem para el ticket (sin pedir hora ni servicio)
                var ticketItem = {
                    dish: Avika.data.currentDish,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations,
                    notes: document.getElementById('notes-input') ? document.getElementById('notes-input').value.trim() : '',
                    isSpecialCombo: Avika.data.isSpecialCombo,
                    kitchenType: Avika.data.currentKitchenType
                };
                
                // Agregar al ticket
                return Avika.orders.addToCurrentTicket(ticketItem);
            } catch (e) {
                console.error("Error al iniciar preparación en modo ticket:", e);
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error: " + e.message);
                }
                return false;
            }
        } else if (typeof originalStartPreparation === 'function') {
            // Si no estamos en modo ticket, usar la función original
            return originalStartPreparation();
        }
    };
    
    // Función backup global
    window.guardarTicketActual = function() {
        if (Avika.orders && typeof Avika.orders.saveCurrentTicket === 'function') {
            return Avika.orders.saveCurrentTicket();
        }
        return false;
    };
    
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
    
    console.log("Correcciones mejoradas para el modo ticket aplicadas");
})();