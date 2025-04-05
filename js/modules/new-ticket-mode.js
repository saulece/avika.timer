// new-ticket-mode.js - Corrección para la funcionalidad de tickets
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
                
                // Verificar si existe el modal de tickets
                var ticketModal = document.getElementById('ticket-modal');
                if (!ticketModal) {
                    // Si no existe, crearlo
                    ticketModal = document.createElement('div');
                    ticketModal.id = 'ticket-modal';
                    ticketModal.className = 'modal';
                    ticketModal.style.position = 'fixed';
                    ticketModal.style.top = '0';
                    ticketModal.style.left = '0';
                    ticketModal.style.width = '100%';
                    ticketModal.style.height = '100%';
                    ticketModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    ticketModal.style.zIndex = '9999';
                    ticketModal.style.display = 'none';
                    
                    var modalContent = document.createElement('div');
                    modalContent.className = 'modal-content ticket-modal-content';
                    modalContent.style.backgroundColor = 'white';
                    modalContent.style.margin = '10% auto';
                    modalContent.style.padding = '20px';
                    modalContent.style.maxWidth = '800px';
                    modalContent.style.width = '90%';
                    modalContent.style.maxHeight = '80vh';
                    modalContent.style.overflowY = 'auto';
                    modalContent.style.borderRadius = '5px';
                    modalContent.style.position = 'relative';
                    
                    // HTML del contenido del modal
                    modalContent.innerHTML = `
                        <span class="close-modal" style="position:absolute;right:15px;top:15px;font-size:24px;cursor:pointer;">&times;</span>
                        <h2>Nuevo Ticket / Comanda</h2>
                        
                        <div class="option-group">
                            <div class="option-title">Tipo de servicio para todo el ticket:</div>
                            <div class="option-btns">
                                <button id="ticket-btn-comedor" class="option-btn selected">Comedor</button>
                                <button id="ticket-btn-domicilio" class="option-btn">Domicilio</button>
                                <button id="ticket-btn-para-llevar" class="option-btn">Ordena y Espera</button>
                            </div>
                        </div>
                        
                        <div class="ticket-categories">
                            <h3>Seleccionar platillos:</h3>
                            <div class="category-btns" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:15px;">
                                <button data-category="entrada-fria" class="category-btn" style="padding:8px;background-color:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">Entradas Frías</button>
                                <button data-category="frio" class="category-btn" style="padding:8px;background-color:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">Platillos Fríos</button>
                                <button data-category="entrada-caliente" class="category-btn" style="padding:8px;background-color:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">Entradas Calientes</button>
                                <button data-category="caliente" class="category-btn" style="padding:8px;background-color:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">Platillos Calientes</button>
                                <button data-category="combos" class="category-btn" style="padding:8px;background-color:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;">Combos</button>
                            </div>
                            <div id="ticket-dishes-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:10px;margin-bottom:20px;">
                                <!-- Se llenará dinámicamente con los platillos de la categoría seleccionada -->
                                <p style="grid-column:1/-1;text-align:center;color:#666;padding:15px;">Selecciona una categoría para ver los platillos</p>
                            </div>
                        </div>
                        
                        <div class="ticket-items">
                            <h3>Platillos en este ticket:</h3>
                            <table style="width:100%;border-collapse:collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Platillo</th>
                                        <th style="text-align:center;padding:8px;border-bottom:1px solid #ddd;">Cantidad</th>
                                        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Personalización</th>
                                        <th style="text-align:center;padding:8px;border-bottom:1px solid #ddd;">Acción</th>
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
                        
                        <div class="option-group" style="margin-top:15px;">
                            <div class="option-title">Notas para todo el ticket:</div>
                            <textarea id="ticket-notes" class="notes-input" placeholder="Instrucciones o notas generales para todo el ticket..." style="width:100%;padding:8px;min-height:80px;border:1px solid #ddd;border-radius:4px;"></textarea>
                        </div>
                        
                        <div class="action-btns" style="margin-top:15px;display:flex;justify-content:space-between;">
                            <button id="btn-cancel-ticket" class="action-btn cancel-btn" style="padding:10px 15px;background-color:#e74c3c;color:white;border:none;border-radius:4px;cursor:pointer;">Cancelar ticket</button>
                            <button id="btn-save-ticket" class="action-btn start-btn" style="padding:10px 15px;background-color:#2ecc71;color:white;border:none;border-radius:4px;cursor:pointer;">Guardar ticket</button>
                        </div>
                    `;
                    
                    ticketModal.appendChild(modalContent);
                    document.body.appendChild(ticketModal);
                    
                    // Inicializar eventos del modal
                    var closeBtn = modalContent.querySelector('.close-modal');
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
                    
                    // Inicializar botones de categoría
                    var categoryBtns = ticketModal.querySelectorAll('.category-btn');
                    if (categoryBtns) {
                        categoryBtns.forEach(function(btn) {
                            btn.addEventListener('click', function() {
                                var category = this.getAttribute('data-category');
                                if (typeof Avika.ui.showTicketDishes === 'function') {
                                    Avika.ui.showTicketDishes(category);
                                } else {
                                    // Implementación fallback
                                    var dishesGrid = document.getElementById('ticket-dishes-grid');
                                    if (dishesGrid && Avika.config && Avika.config.dishes && Avika.config.dishes[category]) {
                                        dishesGrid.innerHTML = '';
                                        
                                        Avika.config.dishes[category].forEach(function(dish) {
                                            var btn = document.createElement('button');
                                            btn.className = 'dish-btn';
                                            btn.textContent = dish;
                                            btn.setAttribute('data-dish', dish);
                                            btn.style.padding = '10px';
                                            btn.style.backgroundColor = '#f9f9f9';
                                            btn.style.border = '1px solid #ddd';
                                            btn.style.borderRadius = '4px';
                                            btn.style.cursor = 'pointer';
                                            
                                            btn.addEventListener('click', function() {
                                                var dish = this.getAttribute('data-dish');
                                                Avika.ui.addDishToTicket(dish);
                                            });
                                            
                                            dishesGrid.appendChild(btn);
                                        });
                                    }
                                }
                            });
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
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Modo ticket activado. Selecciona platillos para agregar.");
                }
                
            } catch (e) {
                console.error("Error al habilitar modo ticket:", e);
                if (typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al habilitar modo ticket: " + e.message);
                }
            }
        };
        
        // Implementar la función showTicketDishes si no existe
        if (typeof Avika.ui.showTicketDishes !== 'function') {
            Avika.ui.showTicketDishes = function(category) {
                console.log("Mostrando platillos de categoría para ticket:", category);
                
                try {
                    var dishesContainer = document.getElementById('ticket-dishes-grid');
                    if (!dishesContainer) {
                        console.error("Contenedor de platillos para ticket no encontrado");
                        return;
                    }
                    
                    // Limpiar contenedor
                    dishesContainer.innerHTML = '';
                    
                    // Marcar botón de categoría activa
                    var categoryBtns = document.querySelectorAll('#ticket-modal .category-btn');
                    categoryBtns.forEach(function(btn) {
                        var cat = btn.getAttribute('data-category');
                        btn.style.backgroundColor = cat === category ? '#2980b9' : '#3498db';
                    });
                    
                    // Verificar si hay platillos en esta categoría
                    if (!Avika.config || !Avika.config.dishes || !Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
                        dishesContainer.innerHTML = '<p style="text-align:center;padding:15px;color:#666;">No hay platillos en esta categoría</p>';
                        return;
                    }
                    
                    // Añadir botones para cada platillo
                    Avika.config.dishes[category].forEach(function(dish) {
                        var button = document.createElement('button');
                        button.className = 'dish-btn';
                        button.textContent = dish;
                        button.setAttribute('data-dish', dish);
                        button.style.padding = '10px';
                        button.style.backgroundColor = '#f9f9f9';
                        button.style.border = '1px solid #ddd';
                        button.style.borderRadius = '4px';
                        button.style.cursor = 'pointer';
                        button.style.color = '#333';
                        
                        button.addEventListener('click', function() {
                            if (typeof Avika.ui.addDishToTicket === 'function') {
                                Avika.ui.addDishToTicket(this.getAttribute('data-dish'));
                            } else {
                                console.error("Función addDishToTicket no encontrada");
                            }
                        });
                        
                        dishesContainer.appendChild(button);
                    });
                    
                } catch (e) {
                    console.error("Error al mostrar platillos para ticket:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error: " + e.message);
                    }
                }
            };
        }
        
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
                        dishCell.style.padding = '8px';
                        dishCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(dishCell);
                        
                        // Cantidad
                        var qtyCell = document.createElement('td');
                        qtyCell.textContent = item.quantity || 1;
                        qtyCell.style.textAlign = 'center';
                        qtyCell.style.padding = '8px';
                        qtyCell.style.borderBottom = '1px solid #ddd';
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
                        customCell.style.padding = '8px';
                        customCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(customCell);
                        
                        // Acciones
                        var actionCell = document.createElement('td');
                        actionCell.style.textAlign = 'center';
                        actionCell.style.padding = '8px';
                        actionCell.style.borderBottom = '1px solid #ddd';
                        
                        var removeBtn = document.createElement('button');
                        removeBtn.className = 'action-btn';
                        removeBtn.textContent = 'Eliminar';
                        removeBtn.style.backgroundColor = '#e74c3c';
                        removeBtn.style.color = 'white';
                        removeBtn.style.border = 'none';
                        removeBtn.style.padding = '5px 10px';
                        removeBtn.style.borderRadius = '3px';
                        removeBtn.style.cursor = 'pointer';
                        
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
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error: " + e.message);
                    }
                }
            };
        }
        
        // Implementar la función addDishToTicket si no existe
        if (typeof Avika.ui.addDishToTicket !== 'function') {
            Avika.ui.addDishToTicket = function(dish) {
                console.log("Añadiendo platillo al ticket:", dish);
                
                try {
                    // Validar platillo
                    if (!dish) {
                        console.error("Error: No se proporcionó un platillo para añadir");
                        return;
                    }
                    
                    // Crear fecha con la hora actual
                    var selectedTime = new Date();
                    
                    // Crear item para el ticket
                    var ticketItem = {
                        dish: dish,
                        quantity: 1,
                        customizations: [],
                        customizationText: '',
                        notes: '',
                        service: Avika.ui.state.ticketService || 'comedor',
                        startTime: selectedTime,
                        startTimeFormatted: Avika.ui.formatTime ? Avika.ui.formatTime(selectedTime) : selectedTime.toLocaleTimeString()
                    };
                    
                    // Verificar si es un combo especial
                    if (Avika.config && Avika.config.specialCombos && Avika.config.specialCombos.indexOf(dish) !== -1) {
                        ticketItem.isSpecialCombo = true;
                    }
                    
                    // Añadir al array de items
                    Avika.ui.state.ticketItems.push(ticketItem);
                    
                    // Actualizar tabla de items
                    Avika.ui.updateTicketItems();
                    
                    // Mostrar notificación
                    if (typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Platillo añadido al ticket: " + dish);
                    }
                    
                } catch (e) {
                    console.error("Error al añadir platillo al ticket:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error al añadir platillo: " + e.message);
                    }
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
                    if (typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Platillo eliminado del ticket");
                    }
                } catch (e) {
                    console.error("Error al eliminar item del ticket:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error: " + e.message);
                    }
                }
            };
        }
        
        // Implementar la función saveTicket si no existe o está dañada
        if (typeof Avika.ui.saveTicket !== 'function') {
            Avika.ui.saveTicket = function() {
                try {
                    console.log("Guardando ticket con", Avika.ui.state.ticketItems.length, "items");
                    
                    if (!Avika.ui.state.ticketItems || Avika.ui.state.ticketItems.length === 0) {
                        if (typeof Avika.ui.showErrorMessage === 'function') {
                            Avika.ui.showErrorMessage("Error: No hay platillos en el ticket.");
                        }
                        return;
                    }
                    
                    // Obtener notas generales
                    var ticketNotes = document.getElementById('ticket-notes');
                    var generalNotes = ticketNotes ? ticketNotes.value.trim() : '';
                    
                    // Crear ID único para el ticket
                    var ticketId = 'ticket-' + Date.now();
                    
                    // Crear órdenes para cada item
                    for (var i = 0; i < Avika.ui.state.ticketItems.length; i++) {
                        var item = Avika.ui.state.ticketItems[i];
                        
                        // Crear orden para este platillo
                        var newOrder = {
                            id: Date.now() + i,  // ID único para cada platillo
                            dish: item.dish,
                            quantity: item.quantity || 1,
                            customizations: item.customizations || [],
                            notes: item.notes || (generalNotes ? generalNotes : ''),
                            service: Avika.ui.state.ticketService || 'comedor',
                            serviceType: Avika.ui.state.ticketService || 'comedor', // Para compatibilidad
                            startTime: item.startTime || new Date(),
                            ticketId: ticketId,
                            isSpecialCombo: item.isSpecialCombo || false
                        };
                        
                        // Para combos especiales, agregar propiedades específicas
                        if (newOrder.isSpecialCombo) {
                            newOrder.hotKitchenFinished = false;
                            newOrder.coldKitchenFinished = false;
                        }
                        
                        // Agregar a la lista de órdenes pendientes
                        if (!Avika.data.pendingOrders) {
                            Avika.data.pendingOrders = [];
                        }
                        
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
                    if (typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Ticket creado con " + i + " platillos");
                    }
                } catch (e) {
                    console.error("Error al guardar ticket:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error al guardar ticket: " + e.message);
                    }
                }
            };
        }
        
        // Implementar selectTicketService si no existe
        if (typeof Avika.ui.selectTicketService !== 'function') {
            Avika.ui.selectTicketService = function(button, service) {
                try {
                    console.log("Seleccionando servicio para ticket:", service);
                    
                    // Guardar servicio seleccionado
                    if (!Avika.ui.state) {
                        Avika.ui.state = {};
                    }
                    
                    Avika.ui.state.ticketService = service;
                    
                    // Actualizar clases de botones para indicar selección
                    var serviceButtons = document.querySelectorAll('#ticket-modal .option-btn');
                    for (var i = 0; i < serviceButtons.length; i++) {
                        serviceButtons[i].classList.remove('selected');
                    }
                    
                    // Marcar el botón seleccionado
                    if (button) {
                        button.classList.add('selected');
                    }
                } catch (e) {
                    console.error("Error al seleccionar servicio de ticket:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error: " + e.message);
                    }
                }
            };
        }
        
        console.log("Corrección de funcionalidad de tickets aplicada correctamente");
    });
})();