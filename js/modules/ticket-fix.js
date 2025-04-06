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
            console.log("Activando modo ticket (versión mejorada)");
            
            // First, remove any existing ticket modals to prevent duplicates
            var existingModal = document.getElementById('ticket-modal');
            if (existingModal) {
                // Instead of removing, just hide it and we'll show it again
                existingModal.style.display = 'none';
            }
            
            // Call the original function
            if (typeof originalEnableTicketMode === 'function') {
                originalEnableTicketMode.call(this);
            } else {
                console.warn("Función original enableTicketMode no encontrada");
                
                // Basic implementation if original is not available
                Avika.orders.currentTicket = {
                    id: 'ticket-' + Date.now(),
                    items: [],
                    service: 'comedor',
                    creationTime: new Date(),
                    active: true
                };
            }
            
            // Make sure the modal is displayed and doesn't disappear
            var ticketModal = document.getElementById('ticket-modal');
            if (!ticketModal) {
                // Create a basic modal if it doesn't exist
                createBasicTicketModal();
                ticketModal = document.getElementById('ticket-modal');
            }
            
            if (ticketModal) {
                // Make sure it's visible
                ticketModal.style.display = 'block';
                
                // Keep it visible with a periodic check
                startModalVisibilityCheck();
            }
            
            return true;
        } catch (e) {
            console.error("Error al activar modo ticket:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al activar modo ticket: " + e.message);
            }
            return false;
        }
    };
    
    // Function to create a basic ticket modal if the original one is missing
    function createBasicTicketModal() {
        console.log("Creando modal de ticket básico...");
        
        var modalHtml = `
            <div id="ticket-modal" style="display:block; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.7); z-index:9999;">
                <div style="background-color:white; width:90%; max-width:800px; margin:30px auto; padding:20px; border-radius:5px; max-height:90%; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h2 style="margin:0;">Crear Nuevo Ticket/Comanda</h2>
                        <span id="close-ticket-modal" style="font-size:24px; cursor:pointer;">&times;</span>
                    </div>
                    
                    <div style="display:flex; gap:20px; margin-bottom:20px;">
                        <div style="flex:1;">
                            <h3>Categorías</h3>
                            <div id="ticket-categories" style="display:flex; flex-wrap:wrap; gap:10px;">
                                <button class="category-btn" data-category="frio" style="padding:8px 12px; background:#3498db; color:white; border:none; border-radius:4px; cursor:pointer;">Platillos Fríos</button>
                                <button class="category-btn" data-category="caliente" style="padding:8px 12px; background:#3498db; color:white; border:none; border-radius:4px; cursor:pointer;">Platillos Calientes</button>
                                <button class="category-btn" data-category="combos" style="padding:8px 12px; background:#3498db; color:white; border:none; border-radius:4px; cursor:pointer;">Combos</button>
                            </div>
                            
                            <h3>Platillos</h3>
                            <div id="ticket-dishes" style="max-height:300px; overflow-y:auto; border:1px solid #ddd; padding:10px;">
                                <p>Selecciona una categoría para ver los platillos</p>
                            </div>
                        </div>
                        
                        <div style="flex:1;">
                            <h3>Platillos Seleccionados</h3>
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Platillo</th>
                                        <th style="text-align:center; padding:8px; border-bottom:1px solid #ddd;">Cantidad</th>
                                        <th style="text-align:center; padding:8px; border-bottom:1px solid #ddd;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="ticket-items-body">
                                    <tr>
                                        <td colspan="3" style="text-align:center; padding:10px;">No hay platillos seleccionados</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div style="margin-top:20px;">
                                <h3>Tipo de Servicio</h3>
                                <div style="display:flex; gap:10px; margin-bottom:15px;">
                                    <button id="ticket-btn-comedor" style="flex:1; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">Comedor</button>
                                    <button id="ticket-btn-domicilio" style="flex:1; padding:8px; background:#ddd; color:black; border:none; border-radius:4px; cursor:pointer;">Domicilio</button>
                                    <button id="ticket-btn-para-llevar" style="flex:1; padding:8px; background:#ddd; color:black; border:none; border-radius:4px; cursor:pointer;">Ordena y Espera</button>
                                </div>
                                
                                <h3>Hora de Ingreso</h3>
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                                    <input id="ticket-hour-input" type="number" min="0" max="23" style="width:60px; padding:8px; text-align:center;" value="${new Date().getHours()}">
                                    <span style="font-size:20px; font-weight:bold;">:</span>
                                    <input id="ticket-minute-input" type="number" min="0" max="59" style="width:60px; padding:8px; text-align:center;" value="${new Date().getMinutes()}">
                                </div>
                            </div>
                            
                            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                                <button id="ticket-cancel-btn" style="padding:10px 20px; background:#e74c3c; color:white; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
                                <button id="ticket-save-btn" style="padding:10px 20px; background:#2ecc71; color:white; border:none; border-radius:4px; cursor:pointer;">Guardar Ticket</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Set up event handlers
        document.getElementById('close-ticket-modal').addEventListener('click', function() {
            var modal = document.getElementById('ticket-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Reset ticket state
            if (Avika.orders && Avika.orders.currentTicket) {
                Avika.orders.currentTicket.active = false;
            }
            
            // Reset button
            var ticketBtn = document.getElementById('btn-new-ticket');
            if (ticketBtn) {
                ticketBtn.textContent = 'Nuevo Ticket/Comanda';
                ticketBtn.style.backgroundColor = '';
                
                // Restore original function
                ticketBtn.onclick = function() {
                    Avika.ui.enableTicketMode();
                };
            }
        });
        
        // Set up service type buttons
        document.getElementById('ticket-btn-comedor').addEventListener('click', function() {
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            document.getElementById('ticket-btn-domicilio').style.background = '#ddd';
            document.getElementById('ticket-btn-domicilio').style.color = 'black';
            document.getElementById('ticket-btn-para-llevar').style.background = '#ddd';
            document.getElementById('ticket-btn-para-llevar').style.color = 'black';
            
            if (Avika.orders && Avika.orders.currentTicket) {
                Avika.orders.currentTicket.service = 'comedor';
            }
        });
        
        document.getElementById('ticket-btn-domicilio').addEventListener('click', function() {
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            document.getElementById('ticket-btn-comedor').style.background = '#ddd';
            document.getElementById('ticket-btn-comedor').style.color = 'black';
            document.getElementById('ticket-btn-para-llevar').style.background = '#ddd';
            document.getElementById('ticket-btn-para-llevar').style.color = 'black';
            
            if (Avika.orders && Avika.orders.currentTicket) {
                Avika.orders.currentTicket.service = 'domicilio';
            }
        });
        
        document.getElementById('ticket-btn-para-llevar').addEventListener('click', function() {
            this.style.background = '#4CAF50';
            this.style.color = 'white';
            document.getElementById('ticket-btn-comedor').style.background = '#ddd';
            document.getElementById('ticket-btn-comedor').style.color = 'black';
            document.getElementById('ticket-btn-domicilio').style.background = '#ddd';
            document.getElementById('ticket-btn-domicilio').style.color = 'black';
            
            if (Avika.orders && Avika.orders.currentTicket) {
                Avika.orders.currentTicket.service = 'para-llevar';
            }
        });
        
        // Set up ticket save button
        document.getElementById('ticket-save-btn').addEventListener('click', function() {
            if (Avika.orders && typeof Avika.orders.saveCurrentTicket === 'function') {
                Avika.orders.saveCurrentTicket();
            } else {
                console.error("La función saveCurrentTicket no está disponible");
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("No se pudo guardar el ticket: función no disponible");
                }
            }
        });
        
        // Set up ticket cancel button
        document.getElementById('ticket-cancel-btn').addEventListener('click', function() {
            document.getElementById('close-ticket-modal').click();
        });
    }
    
    // Variables for modal visibility check
    var modalCheckInterval = null;
    var modalCheckCount = 0;
    var MAX_MODAL_CHECKS = 20; // 10 seconds (20 * 500ms)
    
    // Function to start checking modal visibility
    function startModalVisibilityCheck() {
        // Clear any existing interval
        if (modalCheckInterval) {
            clearInterval(modalCheckInterval);
        }
        
        // Reset check count
        modalCheckCount = 0;
        
        // Start new interval
        modalCheckInterval = setInterval(function() {
            var ticketModal = document.getElementById('ticket-modal');
            
            // If modal exists but is hidden, show it
            if (ticketModal && ticketModal.style.display !== 'block' && Avika.orders && Avika.orders.currentTicket && Avika.orders.currentTicket.active) {
                console.log("Restaurando visibilidad del modal de ticket");
                ticketModal.style.display = 'block';
            }
            
            // If we've reached max checks, stop checking
            if (++modalCheckCount >= MAX_MODAL_CHECKS) {
                clearInterval(modalCheckInterval);
                modalCheckInterval = null;
            }
        }, 500); // Check every 500ms
    }
    
    // Function to remove residual modals
    function removeResidualModals() {
        // Find elements with fixed positioning that could be residual modals
        var fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        
        fixedElements.forEach(function(element) {
            // Check if it's an unwanted modal - skip essential elements
            if (!element.id || 
                (element.id !== 'ticket-modal' && 
                 element.id !== 'ticket-config-modal' &&
                 element.id !== 'force-complete-modal' && 
                 element.id !== 'help-modal' && 
                 element.id !== 'notification' && 
                 element.id !== 'error-message')) {
                
                console.log("Modal o elemento residual encontrado:", element);
                
                // Verify if it's in the bottom part of the screen
                var rect = element.getBoundingClientRect();
                var windowHeight = window.innerHeight;
                
                if (rect.bottom > windowHeight * 0.7) {
                    console.log("Eliminando modal residual en la parte inferior");
                    
                    // Hide first
                    element.style.display = 'none';
                    
                    // Try to remove
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        });
    }
    
    // Execute when page loads
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Inicializando correcciones para modales de tickets...");
        
        // Remove any residual modals
        removeResidualModals();
        
        // Setup periodic check for residual modals
        setInterval(removeResidualModals, 3000);
        
        // Fix New Ticket button click behavior
        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
            console.log("Configurando botón de nuevo ticket...");
            
            // Clone to remove any existing listeners
            var newBtn = btnNewTicket.cloneNode(true);
            btnNewTicket.parentNode.replaceChild(newBtn, btnNewTicket);
            
            // Add improved click handler
            newBtn.addEventListener('click', function() {
                console.log("Botón de nuevo ticket clickeado");
                if (Avika.ui && typeof Avika.ui.enableTicketMode === 'function') {
                    Avika.ui.enableTicketMode();
                } else {
                    console.error("Función enableTicketMode no disponible");
                }
            });
        }
    });
    
    console.log("Correcciones para el modal de tickets aplicadas correctamente");
})();