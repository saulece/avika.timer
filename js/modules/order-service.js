// js/modules/order-service.js - Servicio centralizado para gestión de órdenes
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    Avika.orders = Avika.orders || {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('orders');
    }
    
    // Propiedades privadas
    var nextOrderId = 1;
    
    // Función para generar ID único para una orden
    function generateOrderId() {
        return 'order-' + Date.now() + '-' + (nextOrderId++);
    }
    
    // Crear nueva orden
    Avika.orders.createOrder = function(dishData) {
        try {
            if (!dishData || !dishData.dish) {
                console.error("Error: Se requiere información del platillo para crear una orden");
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("No se puede crear la orden: falta información del platillo");
                }
                return null;
            }
            
            // Crear objeto de orden
            var newOrder = {
                id: generateOrderId(),
                dish: dishData.dish,
                quantity: dishData.quantity || 1,
                customizations: dishData.customizations || [],
                service: dishData.service || 'comedor',
                notes: dishData.notes || '',
                startTime: dishData.startTime || new Date(),
                ticketId: dishData.ticketId || null
            };
            
            // Verificar si es un combo especial
            if (Avika.orders.isSpecialCombo && typeof Avika.orders.isSpecialCombo === 'function') {
                newOrder.isSpecialCombo = Avika.orders.isSpecialCombo(newOrder.dish);
            } else if (Avika.config && Avika.config.specialCombos) {
                newOrder.isSpecialCombo = Avika.config.specialCombos.includes(newOrder.dish);
            }
            
            // Agregar a la lista de órdenes pendientes
            if (!Avika.data.pendingOrders) {
                Avika.data.pendingOrders = [];
            }
            
            Avika.data.pendingOrders.push(newOrder);
            
            // Guardar datos y actualizar UI
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            // Notificar
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification(
                    "Platillo '" + newOrder.dish + "'" + 
                    (newOrder.quantity > 1 ? ' (' + newOrder.quantity + ')' : '') + 
                    " añadido a la preparación"
                );
            }
            
            return newOrder;
        } catch (e) {
            console.error("Error al crear orden:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al crear orden: " + e.message);
            }
            return null;
        }
    };
    
    // Completar una orden
    Avika.orders.completeOrder = function(index) {
        try {
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Índice de orden inválido:", index);
                return false;
            }
            
            var order = Avika.data.pendingOrders[index];
            order.finishTime = new Date();
            
            // Calcular tiempo de preparación
            var startTime = new Date(order.startTime);
            var endTime = order.finishTime;
            var prepTimeMillis = endTime - startTime;
            var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
            
            // Formatear tiempo de preparación
            var prepMins = Math.floor(prepTimeSecs / 60);
            var prepSecs = prepTimeSecs % 60;
            
            if (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function') {
                order.prepTime = Avika.dateUtils.padZero(prepMins) + ':' + Avika.dateUtils.padZero(prepSecs);
            } else {
                order.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
            }
            
            // Verificar si es parte de un ticket
            var ticketId = order.ticketId;
            
            // Si no es parte de un ticket, procesarlo individualmente
            if (!ticketId) {
                // Mover a completados
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                Avika.data.completedOrders.unshift(order);
                
                // Eliminar de pendientes
                Avika.data.pendingOrders.splice(index, 1);
                
                // Actualizar UI
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable(false);
                }
                
                // Guardar datos
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Notificar
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Platillo '" + order.dish + "' completado");
                }
                
                return true;
            }
            
            // Manejo especial para órdenes en tickets
            return Avika.orders.handleTicketItemCompletion(index, order, ticketId);
        } catch (e) {
            console.error("Error al completar orden:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al completar orden: " + e.message);
            }
            return false;
        }
    };
    
    // Manejar completado de elementos en ticket
    Avika.orders.handleTicketItemCompletion = function(index, order, ticketId) {
        try {
            // Verificar si todos los elementos del ticket ya están completados
            var allCompleted = true;
            var ticketItems = [];
            
            // Marcar este ítem como completado
            Avika.data.pendingOrders[index].completed = true;
            
            // Revisar otros ítems del mismo ticket
            Avika.data.pendingOrders.forEach(function(o) {
                if (o.ticketId === ticketId) {
                    ticketItems.push(o);
                    if (!o.completed && o.id !== order.id) {
                        allCompleted = false;
                    }
                }
            });
            
            // Si todos están completados, mover todo el ticket a completados
            if (allCompleted) {
                // Mover todos los elementos a completados
                ticketItems.forEach(function(o) {
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    
                    // Si el elemento no tiene finishTime (puede ocurrir en casos extremos), asignarle uno
                    if (!o.finishTime) {
                        o.finishTime = new Date();
                        
                        // Calcular tiempo de preparación
                        var startTime = new Date(o.startTime);
                        var prepTimeMillis = o.finishTime - startTime;
                        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                        var prepMins = Math.floor(prepTimeSecs / 60);
                        var prepSecs = prepTimeSecs % 60;
                        
                        if (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function') {
                            o.prepTime = Avika.dateUtils.padZero(prepMins) + ':' + Avika.dateUtils.padZero(prepSecs);
                        } else {
                            o.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
                        }
                    }
                    
                    Avika.data.completedOrders.unshift(o);
                });
                
                // Eliminar todos los elementos del ticket de pendientes
                for (var i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                    if (Avika.data.pendingOrders[i].ticketId === ticketId) {
                        Avika.data.pendingOrders.splice(i, 1);
                    }
                }
                
                // Notificar
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Ticket #" + ticketId.split('-')[1] + " completado");
                }
            } else {
                // Notificar que el ítem está listo pero el ticket aún no
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Platillo '" + order.dish + "' listo - Esperando otros platillos del ticket");
                }
            }
            
            // Actualizar tablas
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable(false);
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            return true;
        } catch (e) {
            console.error("Error al manejar completado de elemento en ticket:", e);
            return false;
        }
    };
    
    // Función para seleccionar un platillo
    Avika.orders.selectDish = function(dish) {
        try {
            // Guardar selección actual
            Avika.data.currentDish = dish;
            
            // Mostrar sección de preparación si está disponible
            var preparationSection = document.getElementById('preparation-section');
            var dishesSection = document.getElementById('dishes-section');
            
            if (preparationSection && dishesSection) {
                dishesSection.style.display = 'none';
                preparationSection.style.display = 'block';
            }
            
            // Actualizar título
            var dishTitle = document.getElementById('selected-dish-title');
            if (dishTitle) {
                dishTitle.textContent = dish;
            }
            
            // Reiniciar personalizaciones
            Avika.data.currentCustomizations = [];
            
            // Actualizar opciones de personalización
            Avika.orders.updateCustomizationOptions();
            
            // Reiniciar cantidad
            Avika.data.currentQuantity = 1;
            var quantityDisplay = document.getElementById('quantity-display');
            if (quantityDisplay) {
                quantityDisplay.textContent = '1';
            }
            
            // Reiniciar notas
            var notesInput = document.getElementById('notes-input');
            if (notesInput) {
                notesInput.value = '';
            }
            
            // Detectar si es un combo especial
            var isSpecial = false;
            
            if (Avika.orders.isSpecialCombo && typeof Avika.orders.isSpecialCombo === 'function') {
                isSpecial = Avika.orders.isSpecialCombo(dish);
            } else if (Avika.config && Avika.config.specialCombos) {
                isSpecial = Avika.config.specialCombos.includes(dish);
            }
            
            Avika.data.isSpecialCombo = isSpecial;
            
            // Detectar tipo de cocina
            var kitchenType = 'unknown';
            
            // Buscar la categoría del platillo
            for (var category in Avika.config.dishes) {
                if (Avika.config.dishes[category].includes(dish)) {
                    if (Avika.config.kitchenTypes && Avika.config.kitchenTypes[category]) {
                        kitchenType = Avika.config.kitchenTypes[category];
                    }
                    break;
                }
            }
            
            Avika.data.currentKitchenType = kitchenType;
            
            // Si es un combo especial o tiene tipo de cocina, mostrar indicador visual
            if (dishTitle) {
                if (isSpecial) {
                    dishTitle.innerHTML = dish + ' <span style="color:#e74c3c;font-size:0.8em;">(Combo Especial)</span>';
                } else if (kitchenType === 'cold') {
                    dishTitle.innerHTML = dish + ' <span style="color:#3498db;font-size:0.8em;">(Cocina Fría)</span>';
                } else if (kitchenType === 'hot') {
                    dishTitle.innerHTML = dish + ' <span style="color:#e67e22;font-size:0.8em;">(Cocina Caliente)</span>';
                }
            }
            
            return true;
        } catch (e) {
            console.error("Error al seleccionar platillo:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al seleccionar platillo: " + e.message);
            }
            return false;
        }
    };
    
    // Actualizar opciones de personalización disponibles
    Avika.orders.updateCustomizationOptions = function() {
        var container = document.getElementById('customization-container');
        if (!container) return;
        
        // Limpiar opciones anteriores
        container.innerHTML = '';
        
        // Verificar que tengamos configuración de personalizaciones
        if (!Avika.config || !Avika.config.customizationOptions) return;
        
        // Crear botones para cada opción de personalización
        Object.keys(Avika.config.customizationOptions).forEach(function(code) {
            var btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.setAttribute('data-code', code);
            btn.textContent = Avika.config.customizationOptions[code];
            
            // Agregar evento de clic
            btn.addEventListener('click', function() {
                // Toggle seleccionado/no seleccionado
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    
                    // Eliminar de la lista de personalizaciones
                    var index = Avika.data.currentCustomizations.indexOf(code);
                    if (index !== -1) {
                        Avika.data.currentCustomizations.splice(index, 1);
                    }
                } else {
                    this.classList.add('selected');
                    
                    // Agregar a la lista de personalizaciones
                    if (!Avika.data.currentCustomizations.includes(code)) {
                        Avika.data.currentCustomizations.push(code);
                    }
                }
            });
            
            container.appendChild(btn);
        });
    };
    
    // Función para iniciar la preparación del platillo seleccionado
    Avika.orders.startPreparation = function() {
        try {
            if (!Avika.data.currentDish) {
                console.error("Error: No hay platillo seleccionado");
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Error: No hay platillo seleccionado", 3000);
                }
                return false;
            }
            
            // Verificar si estamos en modo ticket
            if (Avika.orders.currentTicket && Avika.orders.currentTicket.active) {
                // Crear ítem para el ticket
                var ticketItem = {
                    dish: Avika.data.currentDish,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations,
                    service: Avika.data.currentService,
                    notes: document.getElementById('notes-input') ? document.getElementById('notes-input').value.trim() : '',
                    isSpecialCombo: Avika.data.isSpecialCombo,
                    kitchenType: Avika.data.currentKitchenType
                };
                
                // Agregar al ticket actual
                if (Avika.orders.addToCurrentTicket) {
                    return Avika.orders.addToCurrentTicket(ticketItem);
                }
            }
            
            // Modo normal (sin ticket) - Crear orden directamente
            var newOrder = {
                dish: Avika.data.currentDish,
                quantity: Avika.data.currentQuantity,
                customizations: Avika.data.currentCustomizations,
                service: Avika.data.currentService,
                notes: document.getElementById('notes-input') ? document.getElementById('notes-input').value.trim() : '',
                startTime: new Date(),
                isSpecialCombo: Avika.data.isSpecialCombo,
                kitchenType: Avika.data.currentKitchenType
            };
            
            // Inicializar flags para cocinas especiales
            if (newOrder.isSpecialCombo) {
                newOrder.coldComplete = false;
                newOrder.hotComplete = false;
            }
            
            // Agregar orden
            return Avika.orders.createOrder(newOrder);
        } catch (e) {
            console.error("Error al iniciar preparación:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al iniciar preparación: " + e.message);
            }
            return false;
        }
    };
    
    // Función para eliminar una orden pendiente
    Avika.orders.removeOrder = function(index) {
        try {
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Índice de orden inválido:", index);
                return false;
            }
            
            // Obtener información de la orden
            var order = Avika.data.pendingOrders[index];
            
            // Eliminar de la lista
            Avika.data.pendingOrders.splice(index, 1);
            
            // Actualizar UI
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Notificar
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Platillo '" + order.dish + "' eliminado");
            }
            
            return true;
        } catch (e) {
            console.error("Error al eliminar orden:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al eliminar orden: " + e.message);
            }
            return false;
        }
    };
    
    // Inicializar eventos al cargar
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Inicializar botón de iniciar preparación
            var startBtn = document.getElementById('btn-start');
            if (startBtn) {
                startBtn.addEventListener('click', function() {
                    // Crear la orden
                    var result = Avika.orders.startPreparation();
                    
                    if (result) {
                        // Volver a categorías si no estamos en modo ticket
                        if (!(Avika.orders.currentTicket && Avika.orders.currentTicket.active)) {
                            var categoriesSection = document.getElementById('categories-section');
                            var preparationSection = document.getElementById('preparation-section');
                            
                            if (categoriesSection && preparationSection) {
                                categoriesSection.style.display = 'block';
                                preparationSection.style.display = 'none';
                            }
                        }
                    }
                });
            }
            
            // Inicializar botón de cancelar
            var cancelBtn = document.getElementById('btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    // Volver a categorías
                    var categoriesSection = document.getElementById('categories-section');
                    var preparationSection = document.getElementById('preparation-section');
                    
                    if (categoriesSection && preparationSection) {
                        categoriesSection.style.display = 'block';
                        preparationSection.style.display = 'none';
                    }
                });
            }
            
            // Inicializar botones de servicio
            document.querySelectorAll('#service-options .option-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    // Quitar selección de todos
                    document.querySelectorAll('#service-options .option-btn').forEach(function(b) {
                        b.classList.remove('selected');
                    });
                    
                    // Añadir selección a este
                    this.classList.add('selected');
                    
                    // Guardar servicio seleccionado
                    var service = '';
                    if (this.id === 'btn-comedor') service = 'comedor';
                    else if (this.id === 'btn-domicilio') service = 'domicilio';
                    else if (this.id === 'btn-para-llevar') service = 'para-llevar';
                    
                    Avika.data.currentService = service;
                });
            });
            
            // Inicializar botones de cantidad
            var qtyBtns = document.querySelectorAll('.qty-btn');
            if (qtyBtns.length === 2) {
                // Botón menos (-)
                qtyBtns[0].addEventListener('click', function() {
                    var quantityDisplay = document.getElementById('quantity-display');
                    if (quantityDisplay) {
                        var current = parseInt(quantityDisplay.textContent) || 1;
                        if (current > 1) {
                            quantityDisplay.textContent = current - 1;
                            Avika.data.currentQuantity = current - 1;
                        }
                    }
                });
                
                // Botón más (+)
                qtyBtns[1].addEventListener('click', function() {
                    var quantityDisplay = document.getElementById('quantity-display');
                    if (quantityDisplay) {
                        var current = parseInt(quantityDisplay.textContent) || 1;
                        if (current < 10) {
                            quantityDisplay.textContent = current + 1;
                            Avika.data.currentQuantity = current + 1;
                        }
                    }
                });
            }
            
            console.log("Eventos del servicio de órdenes inicializados");
            
            // Add a function to create delivery action buttons for each order
            var originalUpdatePendingTable = Avika.ui.updatePendingTable;
            
            if (originalUpdatePendingTable) {
                Avika.ui.updatePendingTable = function() {
                    // Call the original function first
                    originalUpdatePendingTable.call(this);
                    
                    // Now enhance the table for delivery orders
                    var rows = document.querySelectorAll('#pending-body tr');
                    rows.forEach(function(row, index) {
                        // Get order information
                        var order = Avika.data.pendingOrders[index];
                        if (!order) return;
                        
                        // Only modify delivery orders
                        if (order.service === 'domicilio') {
                            var actionCell = row.cells[4]; // Action column
                            
                            // If the order is marked as completed but waiting for delivery
                            if (order.finishTime && !order.deliveryDepartureTime) {
                                // Add departure button if not already present
                                if (!actionCell.innerHTML.includes('Salida Repartidor')) {
                                    var departureBtn = document.createElement('button');
                                    departureBtn.textContent = 'Salida Repartidor';
                                    departureBtn.className = 'action-btn';
                                    departureBtn.style.backgroundColor = '#ff9800';
                                    departureBtn.style.margin = '2px';
                                    
                                    departureBtn.onclick = function() {
                                        Avika.orders.registerDeliveryDeparture(order.id);
                                    };
                                    
                                    actionCell.appendChild(departureBtn);
                                }
                            }
                            
                            // If the order has departure time but not arrival time
                            if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                                // Add arrival button if not already present
                                if (!actionCell.innerHTML.includes('Llegada')) {
                                    var arrivalBtn = document.createElement('button');
                                    arrivalBtn.textContent = 'Llegada';
                                    arrivalBtn.className = 'action-btn';
                                    arrivalBtn.style.backgroundColor = '#4CAF50';
                                    arrivalBtn.style.margin = '2px';
                                    
                                    arrivalBtn.onclick = function() {
                                        Avika.orders.registerDeliveryArrival(order.id);
                                    };
                                    
                                    actionCell.appendChild(arrivalBtn);
                                }
                            }
                        }
                    });
                };
            }
        } catch (e) {
            console.error("Error al inicializar eventos del servicio de órdenes:", e);
        }
    });
    // Registrar llegada de repartidor
Avika.orders.registerDeliveryArrival = function(orderId) {
    try {
        if (!orderId) {
            console.error("Error: Se requiere ID de orden para registrar llegada");
            return false;
        }
        
        // Buscar la orden en completadas (normalmente ya estará completada)
        var orderIndex = -1;
        if (Avika.data.completedOrders) {
            for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                if (Avika.data.completedOrders[i].id === orderId) {
                    orderIndex = i;
                    break;
                }
            }
        }
        
        if (orderIndex === -1) {
            // Si no está en completadas, buscar en pendientes
            if (Avika.data.pendingOrders) {
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    if (Avika.data.pendingOrders[i].id === orderId) {
                        orderIndex = i;
                        
                        // Registrar llegada
                        Avika.data.pendingOrders[i].deliveryArrivalTime = new Date();
                        
                        // Calcular tiempo de entrega
                        if (Avika.data.pendingOrders[i].deliveryDepartureTime) {
                            var departureTime = new Date(Avika.data.pendingOrders[i].deliveryDepartureTime);
                            var arrivalTime = Avika.data.pendingOrders[i].deliveryArrivalTime;
                            
                            var timeDiff = Math.floor((arrivalTime - departureTime) / 1000);
                            var mins = Math.floor(timeDiff / 60);
                            var secs = timeDiff % 60;
                            
                            Avika.data.pendingOrders[i].deliveryTime = Avika.dateUtils.padZero(mins) + ':' + Avika.dateUtils.padZero(secs);
                        }
                        
                        // Guardar datos
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                        
                        // Actualizar UI
                        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                            Avika.ui.updatePendingTable();
                        }
                        
                        Avika.ui.showNotification("Llegada de repartidor registrada correctamente");
                        return true;
                    }
                }
            }
            
            console.error("Orden no encontrada:", orderId);
            return false;
        }
        
        // Registrar llegada en orden completada
        Avika.data.completedOrders[orderIndex].deliveryArrivalTime = new Date();
        
        // Calcular tiempo de entrega
        if (Avika.data.completedOrders[orderIndex].deliveryDepartureTime) {
            var departureTime = new Date(Avika.data.completedOrders[orderIndex].deliveryDepartureTime);
            var arrivalTime = Avika.data.completedOrders[orderIndex].deliveryArrivalTime;
            
            var timeDiff = Math.floor((arrivalTime - departureTime) / 1000);
            var mins = Math.floor(timeDiff / 60);
            var secs = timeDiff % 60;
            
            Avika.data.completedOrders[orderIndex].deliveryTime = Avika.dateUtils.padZero(mins) + ':' + Avika.dateUtils.padZero(secs);
        }
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Actualizar UI
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable(false);
        }
        
        Avika.ui.showNotification("Llegada de repartidor registrada correctamente");
        return true;
    } catch (e) {
        console.error("Error al registrar llegada de repartidor:", e);
        if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
            Avika.ui.showErrorMessage("Error al registrar llegada: " + e.message);
        }
        return false;
    }
};

// Registrar salida de repartidor
Avika.orders.registerDeliveryDeparture = function(orderId) {
    try {
        if (!orderId) {
            console.error("Error: Se requiere ID de orden para registrar salida");
            return false;
        }
        
        // Buscar la orden en completadas
        var orderIndex = -1;
        if (Avika.data.completedOrders) {
            for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                if (Avika.data.completedOrders[i].id === orderId) {
                    orderIndex = i;
                    break;
                }
            }
        }
        
        if (orderIndex === -1) {
            // Si no está en completadas, buscar en pendientes
            if (Avika.data.pendingOrders) {
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    if (Avika.data.pendingOrders[i].id === orderId) {
                        orderIndex = i;
                        
                        // Registrar salida
                        Avika.data.pendingOrders[i].deliveryDepartureTime = new Date();
                        
                        // Guardar datos
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                        
                        // Actualizar UI
                        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                            Avika.ui.updatePendingTable();
                        }
                        
                        Avika.ui.showNotification("Salida de repartidor registrada correctamente");
                        return true;
                    }
                }
            }
            
            console.error("Orden no encontrada:", orderId);
            return false;
        }
        
        // Registrar salida en orden completada
        Avika.data.completedOrders[orderIndex].deliveryDepartureTime = new Date();
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Actualizar UI
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable(false);
        }
        
        Avika.ui.showNotification("Salida de repartidor registrada correctamente");
        return true;
    } catch (e) {
        console.error("Error al registrar salida de repartidor:", e);
        if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
            Avika.ui.showErrorMessage("Error al registrar salida: " + e.message);
        }
        return false;
    }
};
    // Marcar que el módulo está listo
    Avika.orders.initialized = true;
    console.log("Módulo de órdenes inicializado");
})();
