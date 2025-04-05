// fix-ticket.js - Corrección para la funcionalidad de tickets
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Aplicando corrección para funcionalidad de tickets...");
        
        // Asegurar que los objetos existan
        if (!window.Avika) window.Avika = {};
        if (!Avika.ui) Avika.ui = {};
        
        // Implementar la función enableTicketMode
        Avika.ui.enableTicketMode = function() {
            try {
                console.log("Habilitando modo ticket");
                
                // Verificar si el estado está disponible
                if (!Avika.ui.state) {
                    Avika.ui.state = {
                        ticketMode: false,
                        ticketItems: [],
                        ticketService: 'comedor'
                    };
                }
                
                // Activar modo ticket
                Avika.ui.state.ticketMode = true;
                Avika.ui.state.ticketItems = [];
                
                // Mostrar interfaz de selección de categoría/platillo
                var categoriesSection = document.getElementById('categories-section');
                var dishesSection = document.getElementById('dishes-section');
                
                if (categoriesSection) {
                    categoriesSection.style.display = 'block';
                }
                
                if (dishesSection) {
                    dishesSection.style.display = 'none';
                }
                
                // Verificar si existe el modal de tickets
                var ticketModal = document.getElementById('ticket-modal');
                if (!ticketModal) {
                    // Si no existe, crearlo
                    ticketModal = document.createElement('div');
                    ticketModal.id = 'ticket-modal';
                    ticketModal.className = 'modal';
                    ticketModal.innerHTML = `
                        <div class="modal-content ticket-modal-content">
                            <span class="close-modal">&times;</span>
                            <h2>Nuevo Ticket / Comanda</h2>
                            
                            <div class="option-group">
                                <div class="option-title">Tipo de servicio para todo el ticket:</div>
                                <div class="option-btns">
                                    <button id="ticket-btn-comedor" class="option-btn selected">Comedor</button>
                                    <button id="ticket-btn-domicilio" class="option-btn">Domicilio</button>
                                    <button id="ticket-btn-para-llevar" class="option-btn">Ordena y Espera</button>
                                </div>
                            </div>
                            
                            <div class="ticket-items">
                                <h3>Platillos en este ticket:</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Platillo</th>
                                            <th>Cantidad</th>
                                            <th>Personalización</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="ticket-items-body">
                                        <!-- Se llenará con JavaScript -->
                                        <tr>
                                            <td colspan="4" style="text-align:center;padding:15px;">
                                                Aún no hay platillos en este ticket
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="option-group">
                                <div class="option-title">Notas para todo el ticket:</div>
                                <textarea id="ticket-notes" class="notes-input" placeholder="Instrucciones o notas generales para todo el ticket..."></textarea>
                            </div>
                            
                            <div class="action-btns">
                                <button id="btn-cancel-ticket" class="action-btn cancel-btn">Cancelar ticket</button>
                                <button id="btn-add-to-ticket" class="action-btn">Agregar platillo</button>
                                <button id="btn-save-ticket" class="action-btn start-btn">Guardar ticket</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(ticketModal);
                    
                    // Inicializar eventos del modal
                    var closeBtn = ticketModal.querySelector('.close-modal');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', function() {
                            ticketModal.style.display = 'none';
                        });
                    }
                    
                    // Botón para cancelar ticket
                    var cancelBtn = document.getElementById('btn-cancel-ticket');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', function() {
                            Avika.ui.state.ticketMode = false;
                            Avika.ui.state.ticketItems = [];
                            ticketModal.style.display = 'none';
                        });
                    }
                    
                    // Botón para agregar platillo
                    var addBtn = document.getElementById('btn-add-to-ticket');
                    if (addBtn) {
                        addBtn.addEventListener('click', function() {
                            ticketModal.style.display = 'none';
                        });
                    }
                    
                    // Botón para guardar ticket
                    var saveBtn = document.getElementById('btn-save-ticket');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', function() {
                            if (typeof Avika.ui.saveTicket === 'function') {
                                Avika.ui.saveTicket();
                            } else {
                                Avika.ui.showNotification("Error: Función para guardar ticket no implementada");
                            }
                        });
                    }
                    
                    // Inicializar botones de servicio de ticket
                    var btnComedorTicket = document.getElementById('ticket-btn-comedor');
                    var btnDomicilioTicket = document.getElementById('ticket-btn-domicilio');
                    var btnParaLlevarTicket = document.getElementById('ticket-btn-para-llevar');
                    
                    if (btnComedorTicket) {
                        btnComedorTicket.addEventListener('click', function() {
                            if (typeof Avika.ui.selectTicketService === 'function') {
                                Avika.ui.selectTicketService(this, 'comedor');
                            }
                        });
                    }
                    
                    if (btnDomicilioTicket) {
                        btnDomicilioTicket.addEventListener('click', function() {
                            if (typeof Avika.ui.selectTicketService === 'function') {
                                Avika.ui.selectTicketService(this, 'domicilio');
                            }
                        });
                    }
                    
                    if (btnParaLlevarTicket) {
                        btnParaLlevarTicket.addEventListener('click', function() {
                            if (typeof Avika.ui.selectTicketService === 'function') {
                                Avika.ui.selectTicketService(this, 'para-llevar');
                            }
                        });
                    }
                }
                
                // Actualizar interfaz de ticket
                if (typeof Avika.ui.updateTicketItems === 'function') {
                    Avika.ui.updateTicketItems();
                }
                
                // Mostrar modal de tickets
                ticketModal.style.display = 'block';
                
                // Mostrar notificación
                Avika.ui.showNotification("Modo ticket activado. Selecciona platillos para agregar.");
                
            } catch (e) {
                console.error("Error al habilitar modo ticket:", e);
                Avika.ui.showErrorMessage("Error al habilitar modo ticket: " + e.message);
            }
        };
        
        // Implementar la función updateTicketItems si no existe
        if (typeof Avika.ui.updateTicketItems !== 'function') {
            Avika.ui.updateTicketItems = function() {
                try {
                    var ticketItemsBody = document.getElementById('ticket-items-body');
                    if (!ticketItemsBody) {
                        console.error("Elemento ticket-items-body no encontrado");
                        return;
                    }
                    
                    // Limpiar tabla
                    ticketItemsBody.innerHTML = '';
                    
                    // Verificar si hay items
                    if (!Avika.ui.state.ticketItems || Avika.ui.state.ticketItems.length === 0) {
                        var row = document.createElement('tr');
                        var cell = document.createElement('td');
                        cell.setAttribute('colspan', '4');
                        cell.style.textAlign = 'center';
                        cell.style.padding = '15px';
                        cell.textContent = 'Aún no hay platillos en este ticket';
                        row.appendChild(cell);
                        ticketItemsBody.appendChild(row);
                        return;
                    }
                    
                    // Mostrar cada item
                    for (var i = 0; i < Avika.ui.state.ticketItems.length; i++) {
                        var item = Avika.ui.state.ticketItems[i];
                        
                        var row = document.createElement('tr');
                        
                        // Platillo
                        var dishCell = document.createElement('td');
                        dishCell.textContent = item.dish;
                        row.appendChild(dishCell);
                        
                        // Cantidad
                        var qtyCell = document.createElement('td');
                        qtyCell.textContent = item.quantity;
                        row.appendChild(qtyCell);
                        
                        // Personalización
                        var customCell = document.createElement('td');
                        customCell.textContent = item.customizationText || '';
                        if (item.notes) {
                            if (customCell.textContent) {
                                customCell.textContent += ', ';
                            }
                            customCell.textContent += 'Nota: ' + item.notes;
                        }
                        row.appendChild(customCell);
                        
                        // Acciones
                        var actionCell = document.createElement('td');
                        var removeBtn = document.createElement('button');
                        removeBtn.className = 'action-btn';
                        removeBtn.style.backgroundColor = '#e74c3c';
                        removeBtn.textContent = 'Eliminar';
                        
                        // Usar IIFE para mantener el índice correcto
                        (function(index) {
                            removeBtn.addEventListener('click', function() {
                                if (typeof Avika.ui.removeTicketItem === 'function') {
                                    Avika.ui.removeTicketItem(index);
                                }
                            });
                        })(i);
                        
                        actionCell.appendChild(removeBtn);
                        row.appendChild(actionCell);
                        
                        ticketItemsBody.appendChild(row);
                    }
                } catch (e) {
                    console.error("Error al actualizar items del ticket:", e);
                }
            };
        }
        
        // Implementar la función selectTicketService si no existe
        if (typeof Avika.ui.selectTicketService !== 'function') {
            Avika.ui.selectTicketService = function(button, service) {
                try {
                    // Desmarcar todos los botones de servicio
                    var serviceButtons = document.querySelectorAll('#ticket-modal .option-btn');
                    for (var i = 0; i < serviceButtons.length; i++) {
                        serviceButtons[i].classList.remove('selected');
                    }
                    
                    // Marcar el botón seleccionado
                    if (button) {
                        button.classList.add('selected');
                    }
                    
                    // Guardar servicio seleccionado
                    if (!Avika.ui.state) {
                        Avika.ui.state = {};
                    }
                    
                    Avika.ui.state.ticketService = service;
                    
                    console.log("Servicio de ticket seleccionado:", service);
                } catch (e) {
                    console.error("Error al seleccionar servicio de ticket:", e);
                }
            };
        }
        
        // Implementar la función removeTicketItem si no existe
        if (typeof Avika.ui.removeTicketItem !== 'function') {
            Avika.ui.removeTicketItem = function(index) {
                try {
                    console.log("Eliminando item del ticket en índice:", index);
                    
                    if (!Avika.ui.state || !Avika.ui.state.ticketItems) {
                        return;
                    }
                    
                    if (index < 0 || index >= Avika.ui.state.ticketItems.length) {
                        console.error("Índice de item inválido:", index);
                        return;
                    }
                    
                    // Eliminar elemento
                    Avika.ui.state.ticketItems.splice(index, 1);
                    
                    // Actualizar UI
                    Avika.ui.updateTicketItems();
                    
                    // Mostrar notificación
                    Avika.ui.showNotification("Platillo eliminado del ticket");
                } catch (e) {
                    console.error("Error al eliminar item del ticket:", e);
                }
            };
        }
        
        // Implementar la función saveTicket si no existe
        if (typeof Avika.ui.saveTicket !== 'function') {
            Avika.ui.saveTicket = function() {
                try {
                    console.log("Guardando ticket");
                    
                    if (!Avika.ui.state || !Avika.ui.state.ticketItems) {
                        Avika.ui.showErrorMessage("Error: Estado de ticket no disponible");
                        return;
                    }
                    
                    if (Avika.ui.state.ticketItems.length === 0) {
                        Avika.ui.showErrorMessage("Error: No hay platillos en el ticket");
                        return;
                    }
                    
                    // Obtener notas generales
                    var ticketNotes = document.getElementById('ticket-notes');
                    var generalNotes = ticketNotes ? ticketNotes.value.trim() : '';
                    
                    // Crear un ID para el ticket
                    var ticketId = 'ticket-' + Date.now();
                    
                    // Agregar cada item a las órdenes pendientes
                    if (!Avika.data) Avika.data = {};
                    if (!Avika.data.pendingOrders) Avika.data.pendingOrders = [];
                    
                    for (var i = 0; i < Avika.ui.state.ticketItems.length; i++) {
                        var item = Avika.ui.state.ticketItems[i];
                        
                        // Crear orden para este platillo
                        var newOrder = {
                            dish: item.dish,
                            quantity: item.quantity || 1,
                            customizations: item.customizations || [],
                            notes: item.notes || '',
                            service: Avika.ui.state.ticketService || 'comedor',
                            startTime: item.startTime || new Date(),
                            ticketId: ticketId,
                            generalNotes: generalNotes
                        };
                        
                        Avika.data.pendingOrders.push(newOrder);
                    }
                    
                    // Guardar datos si existe la función
                    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                        Avika.storage.guardarDatosLocales();
                    }
                    
                    // Actualizar tablas
                    if (typeof Avika.ui.updatePendingTable === 'function') {
                        Avika.ui.updatePendingTable();
                    }
                    
                    // Cerrar modal
                    var ticketModal = document.getElementById('ticket-modal');
                    if (ticketModal) {
                        ticketModal.style.display = 'none';
                    }
                    
                    // Restablecer estado
                    Avika.ui.state.ticketMode = false;
                    Avika.ui.state.ticketItems = [];
                    
                    // Mostrar notificación
                    Avika.ui.showNotification("Ticket creado con " + i + " platillos");
                } catch (e) {
                    console.error("Error al guardar ticket:", e);
                    Avika.ui.showErrorMessage("Error al guardar ticket: " + e.message);
                }
            };
        }
        
        console.log("Corrección de funcionalidad de tickets aplicada correctamente");
    });
})();
