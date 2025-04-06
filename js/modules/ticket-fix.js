// Corrección para el problema de Modo Ticket - Versión mejorada
(function() {
    console.log("Aplicando nueva corrección para el modo ticket...");
    
    // Exponer la configuración del ticket globalmente para evitar problemas de scope
    window.ticketConfig = {
        service: 'comedor',
        startTime: null,
        configured: false
    };
    
    // Función totalmente rediseñada para configurar el ticket
    Avika.ui.configureTicket = function() {
        try {
            console.log("Configurando ticket (versión corregida)...");
            
            // Primero eliminar cualquier modal residual para evitar duplicados
            var oldModal = document.getElementById('ticket-config-modal');
            if (oldModal) {
                document.body.removeChild(oldModal);
            }
            
            // Crear un contenedor para el modal
            var modalContainer = document.createElement('div');
            modalContainer.id = 'ticket-config-modal';
            modalContainer.style.position = 'fixed';
            modalContainer.style.top = '0';
            modalContainer.style.left = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
            modalContainer.style.zIndex = '9999';
            modalContainer.style.display = 'flex';
            modalContainer.style.justifyContent = 'center';
            modalContainer.style.alignItems = 'center';
            
            // Crear el contenido del modal
            var modalContent = document.createElement('div');
            modalContent.style.background = 'white';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.width = '90%';
            modalContent.style.maxWidth = '500px';
            
            // Título
            var title = document.createElement('h3');
            title.style.marginTop = '0';
            title.textContent = 'Configuración del Ticket';
            modalContent.appendChild(title);
            
            // Descripción
            var description = document.createElement('p');
            description.textContent = 'Configura los datos para todos los platillos de este ticket:';
            modalContent.appendChild(description);
            
            // Opciones de servicio
            var serviceGroup = document.createElement('div');
            serviceGroup.style.margin = '15px 0';
            
            var serviceTitle = document.createElement('h4');
            serviceTitle.style.margin = '5px 0';
            serviceTitle.textContent = 'Tipo de servicio:';
            serviceGroup.appendChild(serviceTitle);
            
            var btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            
            // Botón Comedor
            var btnComedor = document.createElement('button');
            btnComedor.textContent = 'Comedor';
            btnComedor.className = 'option-btn selected';
            btnComedor.style.flex = '1';
            btnComedor.style.padding = '8px';
            btnComedor.style.background = '#4CAF50';
            btnComedor.style.color = 'white';
            btnComedor.style.border = 'none';
            btnComedor.style.borderRadius = '4px';
            btnComedor.style.cursor = 'pointer';
            btnComedor.id = 'config-btn-comedor-new';
            
            // Botón Domicilio
            var btnDomicilio = document.createElement('button');
            btnDomicilio.textContent = 'Domicilio';
            btnDomicilio.className = 'option-btn';
            btnDomicilio.style.flex = '1';
            btnDomicilio.style.padding = '8px';
            btnDomicilio.style.background = '#ddd';
            btnDomicilio.style.color = 'black';
            btnDomicilio.style.border = 'none';
            btnDomicilio.style.borderRadius = '4px';
            btnDomicilio.style.cursor = 'pointer';
            btnDomicilio.id = 'config-btn-domicilio-new';
            
            // Botón Para Llevar
            var btnParaLlevar = document.createElement('button');
            btnParaLlevar.textContent = 'Ordena y Espera';
            btnParaLlevar.className = 'option-btn';
            btnParaLlevar.style.flex = '1';
            btnParaLlevar.style.padding = '8px';
            btnParaLlevar.style.background = '#ddd';
            btnParaLlevar.style.color = 'black';
            btnParaLlevar.style.border = 'none';
            btnParaLlevar.style.borderRadius = '4px';
            btnParaLlevar.style.cursor = 'pointer';
            btnParaLlevar.id = 'config-btn-para-llevar-new';
            
            btnContainer.appendChild(btnComedor);
            btnContainer.appendChild(btnDomicilio);
            btnContainer.appendChild(btnParaLlevar);
            serviceGroup.appendChild(btnContainer);
            
            modalContent.appendChild(serviceGroup);
            
            // Selector de hora
            var timeGroup = document.createElement('div');
            timeGroup.style.margin = '15px 0';
            
            var timeTitle = document.createElement('h4');
            timeTitle.style.margin = '5px 0';
            timeTitle.textContent = 'Hora de ingreso:';
            timeGroup.appendChild(timeTitle);
            
            var timeContainer = document.createElement('div');
            timeContainer.style.display = 'flex';
            timeContainer.style.gap = '10px';
            
            var hourInput = document.createElement('input');
            hourInput.type = 'number';
            hourInput.id = 'config-hour-new';
            hourInput.min = '0';
            hourInput.max = '23';
            hourInput.value = new Date().getHours();
            hourInput.style.flex = '1';
            hourInput.style.padding = '8px';
            hourInput.style.border = '1px solid #ddd';
            hourInput.style.borderRadius = '4px';
            
            var separator = document.createTextNode(' : ');
            
            var minuteInput = document.createElement('input');
            minuteInput.type = 'number';
            minuteInput.id = 'config-minute-new';
            minuteInput.min = '0';
            minuteInput.max = '59';
            minuteInput.value = new Date().getMinutes();
            minuteInput.style.flex = '1';
            minuteInput.style.padding = '8px';
            minuteInput.style.border = '1px solid #ddd';
            minuteInput.style.borderRadius = '4px';
            
            timeContainer.appendChild(hourInput);
            timeContainer.appendChild(separator);
            timeContainer.appendChild(minuteInput);
            timeGroup.appendChild(timeContainer);
            
            modalContent.appendChild(timeGroup);
            
            // Botón de guardar
            var actionContainer = document.createElement('div');
            actionContainer.style.display = 'flex';
            actionContainer.style.justifyContent = 'flex-end';
            actionContainer.style.marginTop = '20px';
            
            var saveBtn = document.createElement('button');
            saveBtn.textContent = 'Guardar y Continuar';
            saveBtn.id = 'config-btn-save-new';
            saveBtn.style.padding = '10px 20px';
            saveBtn.style.background = '#4CAF50';
            saveBtn.style.color = 'white';
            saveBtn.style.border = 'none';
            saveBtn.style.borderRadius = '4px';
            saveBtn.style.cursor = 'pointer';
            
            actionContainer.appendChild(saveBtn);
            modalContent.appendChild(actionContainer);
            
            // Juntar todo
            modalContainer.appendChild(modalContent);
            document.body.appendChild(modalContainer);
            
            // Establecer eventos
            btnComedor.addEventListener('click', function() {
                btnComedor.style.background = '#4CAF50';
                btnComedor.style.color = 'white';
                btnDomicilio.style.background = '#ddd';
                btnDomicilio.style.color = 'black';
                btnParaLlevar.style.background = '#ddd';
                btnParaLlevar.style.color = 'black';
                window.ticketConfig.service = 'comedor';
            });
            
            btnDomicilio.addEventListener('click', function() {
                btnComedor.style.background = '#ddd';
                btnComedor.style.color = 'black';
                btnDomicilio.style.background = '#4CAF50';
                btnDomicilio.style.color = 'white';
                btnParaLlevar.style.background = '#ddd';
                btnParaLlevar.style.color = 'black';
                window.ticketConfig.service = 'domicilio';
            });
            
            btnParaLlevar.addEventListener('click', function() {
                btnComedor.style.background = '#ddd';
                btnComedor.style.color = 'black';
                btnDomicilio.style.background = '#ddd';
                btnDomicilio.style.color = 'black';
                btnParaLlevar.style.background = '#4CAF50';
                btnParaLlevar.style.color = 'white';
                window.ticketConfig.service = 'para-llevar';
            });
            
            saveBtn.addEventListener('click', function() {
                var hour = parseInt(hourInput.value);
                var minute = parseInt(minuteInput.value);
            
            if (isNaN(hour) || hour < 0 || hour > 23) {
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Hora inválida. Debe estar entre 0 y 23.");
                    } else {
                        alert("Hora inválida. Debe estar entre 0 y 23.");
                }
                return;
            }
            
            if (isNaN(minute) || minute < 0 || minute > 59) {
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Minutos inválidos. Deben estar entre 0 y 59.");
                    } else {
                        alert("Minutos inválidos. Deben estar entre 0 y 59.");
                }
                return;
            }
            
            // Establecer hora
            var selectedTime = new Date();
            selectedTime.setHours(hour, minute, 0);
                window.ticketConfig.startTime = selectedTime;
            
            // Marcar como configurado
                window.ticketConfig.configured = true;
            
            // Aplicar configuración al ticket actual
                Avika.orders.currentTicket.service = window.ticketConfig.service;
                Avika.orders.currentTicket.startTime = window.ticketConfig.startTime;
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Ticket configurado correctamente");
            }
            
            // Cerrar modal
                if (modalContainer && modalContainer.parentNode) {
                    modalContainer.parentNode.removeChild(modalContainer);
                }
                
                // Activar modo ticket
                activateTicketAfterConfig();
            });
            
            return true;
        } catch (e) {
            console.error("Error al configurar ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al configurar ticket: " + e.message);
            } else {
                alert("Error al configurar ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Reemplazar la función enableTicketMode
    var originalEnableTicketMode = Avika.ui.enableTicketMode;
    
    Avika.ui.enableTicketMode = function() {
        try {
            console.log("Iniciando configuración de ticket...");
            
        // Reiniciar configuración
            window.ticketConfig = {
            service: 'comedor',
            startTime: null,
            configured: false
        };
        
            // Configurar ticket
            return Avika.ui.configureTicket();
        } catch (e) {
            console.error("Error al iniciar modo ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al iniciar modo ticket: " + e.message);
            } else {
                alert("Error al iniciar modo ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Función para activar el ticket después de la configuración
    function activateTicketAfterConfig() {
        try {
            console.log("Activando ticket después de configuración");
            
            // Generar ID único para el ticket
            Avika.orders.currentTicket.id = 'ticket-' + Date.now();
            Avika.orders.currentTicket.items = [];
            Avika.orders.currentTicket.service = window.ticketConfig.service;
            Avika.orders.currentTicket.startTime = window.ticketConfig.startTime;
            Avika.orders.currentTicket.creationTime = new Date();
            Avika.orders.currentTicket.active = true;
            
            // Cambiar apariencia del botón
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Guardar Ticket';
                ticketBtn.style.backgroundColor = '#e74c3c';
                
                // Remover cualquier evento previo y asignar uno nuevo
                var newBtn = ticketBtn.cloneNode(true);
                if (ticketBtn.parentNode) {
                ticketBtn.parentNode.replaceChild(newBtn, ticketBtn);
                }
                
                // Asignar el evento de guardar ticket
                newBtn.addEventListener('click', function() {
                    Avika.orders.saveCurrentTicket();
                });
            }
            
            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Modo ticket activado - Agrega platillos");
            }
            
            return true;
        } catch (e) {
            console.error("Error al activar ticket después de configuración:", e);
            return false;
        }
    }
    
    // Hacer accesible la función para otros módulos
    Avika.ui.enableTicketModeWithConfig = activateTicketAfterConfig;
    
    // Reescribir completamente saveCurrentTicket para mayor robustez
    Avika.orders.saveCurrentTicket = function() {
        try {
            console.log("Guardando ticket (versión robusta)");
            
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
            var startTime = window.ticketConfig.startTime || new Date();
            
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
            
            // Restaurar botón
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                ticketBtn.style.backgroundColor = '';
                
                // Remover cualquier evento previo y asignar uno nuevo
                var newBtn = ticketBtn.cloneNode(true);
                if (ticketBtn.parentNode) {
                ticketBtn.parentNode.replaceChild(newBtn, ticketBtn);
                }
                
                // Asignar el evento de nuevo ticket
                newBtn.addEventListener('click', function() {
                    if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                        Avika.ui.enableTicketMode();
                    }
                });
            }
            
            // Reiniciar configuración
            window.ticketConfig = {
                service: 'comedor',
                startTime: null,
                configured: false
            };
            
            return true;
        } catch (e) {
            console.error("Error al guardar ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al guardar ticket: " + e.message);
            } else {
                alert("Error al guardar ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Asegurar que el botón de Nuevo Ticket tiene el handler correcto
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Eliminar modales residuales que pudieran quedar
            var oldModals = document.querySelectorAll('#ticket-config-modal');
            oldModals.forEach(function(modal) {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
            
            var btnNewTicket = document.getElementById('btn-new-ticket');
            if (btnNewTicket) {
                console.log("Configurando botón Nuevo Ticket/Comanda");
                
                // Remover cualquier event listener previo
                var newBtn = btnNewTicket.cloneNode(true);
                if (btnNewTicket.parentNode) {
                    btnNewTicket.parentNode.replaceChild(newBtn, btnNewTicket);
                }
                
                // Asignar el nuevo handler
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log("Nuevo Ticket/Comanda button clicked");
                    
                    if (this.textContent.includes('Guardar')) {
                        console.log("Guardando ticket");
        if (Avika.orders && typeof Avika.orders.saveCurrentTicket === 'function') {
                            Avika.orders.saveCurrentTicket();
                        }
                } else {
                        console.log("Iniciando nuevo ticket");
                    if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                        Avika.ui.enableTicketMode();
                    }
                }
                    
                    return false;
            });
            }
        } catch (e) {
            console.error("Error al configurar botón de nuevo ticket:", e);
        }
    });
    
    console.log("Nueva corrección para el modo ticket aplicada");
})();