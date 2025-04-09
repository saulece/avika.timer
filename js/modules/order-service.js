// order-service.js - Funciones para el manejo de órdenes y tickets
window.Avika = window.Avika || {};

Avika.orderService = {
    // Caché para búsquedas optimizadas
    _orderCache: {},
    
    // Estado de tickets para seguimiento mejorado
    _ticketStatus: {},
    
    // Temporizador para notificaciones
    _notificationTimer: null,
    
    // Función para crear una nueva orden
    createOrder: function(dish, category, serviceType, notes, quantity, isSpecialCombo) {
        console.log("Creando nueva orden:", dish);
        
        // Verificar que Avika.data existe y está inicializado
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existe, inicializando objeto vacío');
        }
        
        // Verificar que pendingOrders existe
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        
        var now = new Date();
        var order = {
            id: now.getTime().toString() + Math.floor(Math.random() * 1000),
            dish: dish,
            category: category,
            categoryDisplay: Avika.config.categoryNames[category],
            quantity: quantity || 1,
            customizations: [],
            serviceType: serviceType || 'comedor',
            notes: notes || '',
            startTime: now,
            startTimeFormatted: this.formatTime(now),
            isSpecialCombo: isSpecialCombo || false,
            finished: false
        };
        
        // Si es un combo especial, inicializar estados de cocinas
        if (isSpecialCombo) {
            order.hotKitchenFinished = false;
            order.coldKitchenFinished = false;
        }
        
        // Agregar a órdenes pendientes
        Avika.data.pendingOrders.push(order);
        
        // Limpiar caché de búsqueda
        this._orderCache = {};
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        return order;
    },
    
    // Usar las funciones de formateo de tiempo del módulo utils con implementaciones de respaldo
    padZero: function(num) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.padZero === 'function') {
            return Avika.utils.padZero(num);
        }
        
        // Implementación de respaldo en caso de que Avika.utils no esté disponible
        return (num < 10 ? '0' : '') + num;
    },

    formatTime: function(date) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
            return Avika.utils.formatTime(date);
        }
        
        // Implementación de respaldo en caso de que Avika.utils no esté disponible
        if (!date) return '--:--:--';
        
        var hours = this.padZero(date.getHours());
        var minutes = this.padZero(date.getMinutes());
        var seconds = this.padZero(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },

    // Función para formatear tiempo transcurrido en segundos a formato HH:MM:SS
    formatElapsedTime: function(seconds) {
        // Reutilizar la función de Avika.utils para mantener consistencia
        if (Avika.utils && typeof Avika.utils.formatElapsedTime === 'function') {
            return Avika.utils.formatElapsedTime(seconds);
        }
        
        // Validar entrada
        if (seconds === undefined || seconds === null || isNaN(seconds)) {
            return '--:--:--';
        }
        
        // Implementación unificada para mayor rendimiento
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = Math.floor(seconds % 60);
        
        return this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(secs);
    },
    
    // Función para manejar subcategorías - Usar la versión de ui-controller.js
    selectCategory: function(category) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.selectCategory === 'function') {
            return Avika.ui.selectCategory(category);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Seleccionando categoría (respaldo):", category);
        
        Avika.data.currentCategory = category;
        document.getElementById('selected-category-title').textContent = Avika.config.categoryNames[category];
        
        var dishesContainer = document.getElementById('dishes-container');
        // Limpiar el contenedor completamente
        dishesContainer.innerHTML = '';
        
        // Verificar si hay datos de platillos
        if (!Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
            dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
            this.showSection('dishes-section');
            return;
        }
        
        // Mostrar platillos directamente en modo básico de respaldo
        Avika.config.dishes[category].forEach(function(dish) {
            var button = document.createElement('button');
            button.className = 'dish-btn';
            button.textContent = dish;
            button.onclick = function() {
                Avika.orderService.selectDish(dish);
            };
            dishesContainer.appendChild(button);
        });
        
        // Mostrar la sección de platillos
        this.showSection('dishes-section');
    },
    
    // Función auxiliar para crear botones de platillos más compactos - Usar la versión de ui-controller.js
    createCompactDishButton: function(dish, category) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.createCompactDishButton === 'function') {
            return Avika.ui.createCompactDishButton(dish, category);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var button = document.createElement('button');
        button.className = 'dish-btn compact';
        button.setAttribute('data-dish', dish);
        button.setAttribute('data-category', category);
        button.textContent = dish;
        
        // Evento de clic
        button.onclick = function() {
            Avika.orderService.selectDish(dish);
        };
        
        return button;
    },
    
    // Función para seleccionar una subcategoría - Usar la versión de ui-controller.js
    selectSubCategory: function(category, subcategory, container) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.selectSubCategory === 'function') {
            return Avika.ui.selectSubCategory(category, subcategory, container);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Seleccionando subcategoría (respaldo):", subcategory, "para categoría:", category);
        
        // Limpiar el contenedor
        container.innerHTML = '';
        
        // Filtrar platillos según la subcategoría
        var platillosFiltrados = [];
        var self = this;
        
        if (subcategory === 'all') {
            // Mostrar todos los platillos de la categoría
            platillosFiltrados = Avika.config.dishes[category];
        } else {
            // Filtrar platillos que pertenecen a esta subcategoría
            Avika.config.dishes[category].forEach(function(dish) {
                if (Avika.config.dishSubcategories && 
                    Avika.config.dishSubcategories[dish] === subcategory) {
                    platillosFiltrados.push(dish);
                }
            });
        }
        
        // Crear botones para los platillos filtrados
        if (platillosFiltrados.length === 0) {
            var mensaje = document.createElement('p');
            mensaje.textContent = 'No hay platillos en esta subcategoría';
            container.appendChild(mensaje);
        } else {
            platillosFiltrados.forEach(function(dish) {
                var button = self.createCompactDishButton(dish, category);
                container.appendChild(button);
            });
        }
    },
    
    // Función para filtrar platillos por búsqueda - Usar la versión de ui-controller.js
    filterDishes: function(searchText) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.filterDishes === 'function') {
            return Avika.ui.filterDishes(searchText);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        console.log("Filtrando platillos con texto (respaldo):", searchText);
        
        var dishButtons = document.querySelectorAll('.dish-btn');
        var totalButtons = dishButtons.length;
        var visibleButtons = 0;
        
        dishButtons.forEach(function(button) {
            var dishName = button.getAttribute('data-dish') || button.textContent;
            
            if (dishName.toLowerCase().includes(searchText)) {
                button.style.display = 'flex';
                visibleButtons++;
            } else {
                button.style.display = 'none';
            }
        });
        
        console.log("Resultados de búsqueda:", visibleButtons, "de", totalButtons);
    },

    selectDish: function(dish) {
        Avika.data.currentDish = dish;
        document.getElementById('selected-dish-title').textContent = dish;
        
        Avika.data.isSpecialCombo = (Avika.config.specialCombos.indexOf(dish) !== -1);
        
        this.resetOptions();
        this.updatePersonalizationOptions();
        
        this.showSection('preparation-section');
    },

    resetOptions: function() {
        // Limpiar personalización
        Avika.data.currentCustomizations = [];
        
        // Resetear servicio
        document.getElementById('btn-comedor').classList.add('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        Avika.data.currentService = 'comedor';
        
        // Resetear cantidad
        Avika.data.currentQuantity = 1;
        document.getElementById('quantity-display').textContent = '1';
        
        // Limpiar notas
        document.getElementById('notes-input').value = '';
    },
    
    updatePersonalizationOptions: function() {
        var container = document.getElementById('personalization-options');
        container.innerHTML = '';
        
        if (Avika.data.currentCategory === 'combos') {
            document.getElementById('personalization-section').style.display = 'none';
            return;
        }
        
        document.getElementById('personalization-section').style.display = 'block';
        
        for (var code in Avika.config.customizationOptions) {
            if (!Avika.config.customizationOptions.hasOwnProperty(code)) continue;
            
            var button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = Avika.config.customizationOptions[code];
            button.setAttribute('data-option', code);
            button.onclick = function() {
                Avika.orderService.toggleOption(this, this.getAttribute('data-option'));
            };
            container.appendChild(button);
        }
    },

    toggleOption: function(button, option) {
        button.classList.toggle('selected');
        
        if (button.classList.contains('selected')) {
            if (Avika.data.currentCustomizations.indexOf(option) === -1) {
                Avika.data.currentCustomizations.push(option);
            }
        } else {
            Avika.data.currentCustomizations = Avika.data.currentCustomizations.filter(function(item) {
                return item !== option;
            });
        }
    },

    selectService: function(button, service) {
        document.getElementById('btn-comedor').classList.remove('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        Avika.data.currentService = service;
    },

    changeQuantity: function(change) {
        Avika.data.currentQuantity = Math.max(1, Avika.data.currentQuantity + change);
        document.getElementById('quantity-display').textContent = Avika.data.currentQuantity;
    },
    
    decrementQuantity: function() {
        if (Avika.data.currentQuantity > 1) {
            Avika.data.currentQuantity--;
        }
        document.getElementById('quantity-display').textContent = Avika.data.currentQuantity;
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
            this.showNotification("Error: No se encontró la orden solicitada", "error");
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        
        // Usar formatElapsedTime desde utils para consistencia
        try {
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        } catch (e) {
            console.warn("Error al formatear tiempo:", e);
            // Formateo de respaldo
            var mins = Math.floor(order.preparationTime / 60);
            var secs = order.preparationTime % 60;
            order.preparationTimeFormatted = this.padZero(mins) + ':' + this.padZero(secs);
        }
        
        // Si todos los platillos del ticket están terminados, actualizar estado del ticket
        if (order.ticketId) {
            var ticketId = order.ticketId;
            // Verificar si hay un registro de estado del ticket
            if (!this._ticketStatus) this._ticketStatus = {};
            
            if (!this._ticketStatus[ticketId]) {
                // Inicializar seguimiento de estado para este ticket
                this._ticketStatus[ticketId] = {
                    totalItems: 0,
                    finishedItems: 0,
                    serviceType: order.serviceType
                };
                
                // Contar todos los items de este ticket
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        this._ticketStatus[ticketId].totalItems++;
                        // Contar si ya está terminado
                        if (item.finished || 
                            (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
                            this._ticketStatus[ticketId].finishedItems++;
                        }
                    }
                }
            } else {
                // Incrementar contador de items terminados
                this._ticketStatus[ticketId].finishedItems++;
            }
            
            console.log("Estado del ticket:", ticketId, this._ticketStatus[ticketId]);
            
            // Verificar si todos los items están completos
            var ticketStatus = this._ticketStatus[ticketId];
            var allTicketItemsFinished = ticketStatus.finishedItems >= ticketStatus.totalItems;
            
            // Marcar todas las órdenes de este ticket como completadas
            if (allTicketItemsFinished) {
                console.log("Todos los platillos del ticket", ticketId, "están terminados");
                
                // Marcar todas las órdenes con el estado completado
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        item.allTicketItemsFinished = true;
                    }
                }
                
                // Si es a domicilio o para llevar, gestionar transición
                if (ticketStatus.serviceType === 'domicilio' || ticketStatus.serviceType === 'para-llevar') {
                    console.log("Ticket a domicilio o para llevar listo para reparto");
                    
                    // Forzar actualización de la tabla para mostrar botones de entrega
                    this.updatePendingTable();
                }
            }
        }
        
        // Actualizar la interfaz
        this.updatePendingTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡' + order.dish + ' marcado como listo!', 'success');
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
        if (Avika.data.deliveryOrders) {
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === ticketId) {
                    allItems.push(item);
                    finishedItems++;  // Los que están en reparto ya están terminados
                }
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
            this.showNotification("Error: No se encontró la orden solicitada", "error");
            return;
        }
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Calcular tiempo de preparación
        var endTime = new Date();
        order.endTime = endTime;
        order.preparationTime = Math.floor((endTime - new Date(order.startTime)) / 1000);
        
        // Usar la función formatElapsedTime para mantener consistencia
        try {
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        } catch (e) {
            console.warn("Error al formatear tiempo:", e);
            // Formateo de respaldo
            var mins = Math.floor(order.preparationTime / 60);
            var secs = order.preparationTime % 60;
            order.preparationTimeFormatted = this.padZero(mins) + ':' + this.padZero(secs);
        }
        
        // Verificar si es un pedido a domicilio o para llevar
        if (order.serviceType === 'domicilio' || order.serviceType === 'para-llevar') {
            // Marcar como listo para reparto
            order.finishTime = endTime;
            order.finishTimeFormatted = this.formatTime(endTime);
            
            // Asegurarse de que el array de órdenes en reparto existe
            if (!Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders = [];
            }
            
            // Mover a reparto en lugar de a completadas
            Avika.data.deliveryOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            // Actualizar las tablas
            this.updatePendingTable();
            this.updateDeliveryTable();
            
            // Limpiar caché de búsqueda
            this._orderCache = {};
            
            // Mostrar notificación
            this.showNotification('¡' + order.dish + ' listo para reparto! Tiempo de preparación: ' + 
                                  order.preparationTimeFormatted, 'success');
        } else {
            // Para pedidos en comedor, mover directamente a completadas
            if (!Avika.data.completedOrders) {
                Avika.data.completedOrders = [];
            }
            
            Avika.data.completedOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            // Actualizar las tablas
            this.updatePendingTable();
            this.updateCompletedTable();
            
            // Limpiar caché de búsqueda
            this._orderCache = {};
            
            // Mostrar notificación
            this.showNotification('¡' + order.dish + ' terminado! Tiempo: ' + 
                                  order.preparationTimeFormatted, 'success');
        }
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    },
    
    // Función para finalizar una cocina caliente (para combos especiales)
    finishHotKitchen: function(orderId) {
        console.log("Finalizando cocina caliente para:", orderId);
        
        // Buscar la orden
        var order = this.findOrderById(orderId);
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden", "error");
            return;
        }
        
        // Marcar cocina caliente como terminada
        order.hotKitchenFinished = true;
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            // Verificar estado del ticket
            if (order.ticketId) {
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                
                if (ticketStatus.isComplete) {
                    // Marcar todas las órdenes con el estado completado
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                        }
                    }
                }
            }
            
            // Marcar el combo como terminado
            order.finished = true;
            order.endTime = new Date();
            order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        }
        
        // Actualizar interfaz
        this.updatePendingTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡Cocina Caliente de ' + order.dish + ' terminada!', 'success');
    },
    
    // Función para finalizar una cocina fría (para combos especiales)
    finishColdKitchen: function(orderId) {
        console.log("Finalizando cocina fría para:", orderId);
        
        // Buscar la orden
        var order = this.findOrderById(orderId);
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden", "error");
            return;
        }
        
        // Marcar cocina fría como terminada
        order.coldKitchenFinished = true;
        
        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            // Verificar estado del ticket
            if (order.ticketId) {
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                
                if (ticketStatus.isComplete) {
                    // Marcar todas las órdenes con el estado completado
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                        }
                    }
                }
            }
            
            // Marcar el combo como terminado
            order.finished = true;
            order.endTime = new Date();
            order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
            order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        }
        
        // Actualizar interfaz
        this.updatePendingTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡Cocina Fría de ' + order.dish + ' terminada!', 'success');
    },
    
    // Función para finalizar la preparación para entrega a domicilio (no ticket)
    finishKitchenForDelivery: function(orderId) {
        console.log("Finalizando preparación para domicilio:", orderId);
        
        // Buscar la orden
        var orderIndex = -1;
        var order = null;
        
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1 || !order) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden", "error");
            return;
        }
        
        // Marcar como terminado en cocina
        order.kitchenFinished = true;
        order.finishTime = new Date();
        order.preparationTime = Math.floor((order.finishTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = this.formatElapsedTime(order.preparationTime);
        
        // Asegurarse de que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders) {
            Avika.data.deliveryOrders = [];
        }
        
        // Mover a reparto
        Avika.data.deliveryOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        // Limpiar caché de búsqueda
        this._orderCache = {};
        
        // Actualizar interfaz
        this.updatePendingTable();
        this.updateDeliveryTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡' + order.dish + ' listo para entregar! Preparación: ' + 
                          order.preparationTimeFormatted, 'success');
    },
    
    // Función para registrar la salida de una entrega a domicilio
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);
        
        // Buscar la orden en pendientes o en reparto
        var orderIndex = -1;
        var order = null;
        var inPending = true;
        
        // Primero buscar en pendientes
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }
        
        // Si no está en pendientes, buscar en reparto
        if (!order) {
            inPending = false;
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                if (Avika.data.deliveryOrders[i].id === orderId) {
                    order = Avika.data.deliveryOrders[i];
                    orderIndex = i;
                    break;
                }
            }
        }
        
        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden", "error");
            return;
        }
        
        // Registrar fecha y hora de salida
        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime;
        order.deliveryDepartureTimeFormatted = this.formatTime(departureTime);
        
        // Si está en pendientes, mover a reparto
        if (inPending) {
            // Asegurarse de que el array de órdenes en reparto existe
            if (!Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders = [];
            }
            
            // Mover a órdenes en reparto
            Avika.data.deliveryOrders.unshift(order);
            
            // Si es parte de un ticket, mover todos los platillos del ticket
            if (order.ticketId) {
                // Recopilar índices a eliminar (en orden descendente para no afectar índices anteriores)
                var indicesToRemove = [];
                
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId && item.id !== orderId) {
                        // Registrar salida para este platillo también
                        item.deliveryDepartureTime = departureTime;
                        item.deliveryDepartureTimeFormatted = this.formatTime(departureTime);
                        
                        // Agregar a reparto
                        Avika.data.deliveryOrders.unshift(item);
                        
                        // Marcar para eliminar
                        indicesToRemove.push(i);
                    }
                }
                
                // Eliminar de pendientes en orden descendente
                for (var i = indicesToRemove.length - 1; i >= 0; i--) {
                    Avika.data.pendingOrders.splice(indicesToRemove[i], 1);
                }
            }
            
            // Eliminar la orden original de pendientes
            Avika.data.pendingOrders.splice(orderIndex, 1);
            
            // Limpiar caché de búsqueda
            this._orderCache = {};
        }
        
        // Actualizar tablas
        this.updatePendingTable();
        this.updateDeliveryTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡Salida registrada para ' + order.dish + '!', 'success');
    },
    
    // Esta función registra la entrega al cliente
    markDeliveryArrival: function(orderId) {
        console.log("Registrando entrega de domicilio:", orderId);
        
        // Verificar que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders) {
            console.error("El array de órdenes en reparto no existe");
            this.showNotification('Error: No hay órdenes en reparto', 'error');
            return;
        }
        
        // Buscar la orden en reparto
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            if (Avika.data.deliveryOrders[i].id === orderId) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            this.showNotification("Error: No se encontró la orden en reparto", "error");
            return;
        }
        
        var order = Avika.data.deliveryOrders[orderIndex];
        
        // Registrar tiempo de entrega y completa el pedido
        var arrivalTime = new Date();
        order.deliveryArrivalTime = arrivalTime;
        order.deliveryArrivalTimeFormatted = this.formatTime(arrivalTime);
        
        // Calcular tiempo total desde inicio hasta entrega
        var endTime = arrivalTime;
        var prepTimeMillis = endTime - new Date(order.startTime);
        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
        
        order.endTime = endTime;
        order.endTimeFormatted = this.formatTime(endTime);
        order.prepTime = this.formatElapsedTime(prepTimeSecs);
        
        // También calcular el tiempo específico de entrega (desde salida hasta llegada)
        if (order.deliveryDepartureTime) {
            var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
            var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
            order.deliveryTime = this.formatElapsedTime(deliveryTimeSecs);
        } else {
            console.warn("La orden no tiene registrada la hora de salida para reparto");
            order.deliveryTime = "N/A";
        }
        
        // Asegurar que existe el array de completados
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }
        
        // Mover a completados
        Avika.data.completedOrders.unshift(order);
        
        // Si es parte de un ticket, mover todos los platillos del ticket a completados
        if (order.ticketId) {
            var ticketId = order.ticketId;
            var indicesToRemove = [];
            
            // Buscar todos los platillos del mismo ticket
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var item = Avika.data.deliveryOrders[i];
                if (item.ticketId === ticketId && item.id !== orderId) {
                    // Registrar entrega para este platillo también
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = this.formatTime(arrivalTime);
                    
                    // Calcular tiempo total 
                    item.endTime = endTime;
                    item.endTimeFormatted = this.formatTime(endTime);
                    
                    var itemPrepTimeMillis = endTime - new Date(item.startTime);
                    var itemPrepTimeSecs = Math.floor(itemPrepTimeMillis / 1000);
                    item.prepTime = this.formatElapsedTime(itemPrepTimeSecs);
                    
                    // Calcular tiempo de entrega
                    if (item.deliveryDepartureTime) {
                        var itemDeliveryTimeMillis = endTime - new Date(item.deliveryDepartureTime);
                        var itemDeliveryTimeSecs = Math.floor(itemDeliveryTimeMillis / 1000);
                        item.deliveryTime = this.formatElapsedTime(itemDeliveryTimeSecs);
                    } else {
                        item.deliveryTime = "N/A";
                    }
                    
                    // Mover a completados
                    Avika.data.completedOrders.unshift(item);
                    
                    // Marcar para eliminar de reparto
                    indicesToRemove.push(i);
                }
            }
            
            // Eliminar platillos del ticket de reparto (en orden inverso para no afectar índices)
            for (var i = indicesToRemove.length - 1; i >= 0; i--) {
                Avika.data.deliveryOrders.splice(indicesToRemove[i], 1);
            }
        }
        
        // Eliminar la orden original de reparto
        Avika.data.deliveryOrders.splice(orderIndex, 1);
        
        // Limpiar caché de búsqueda
        this._orderCache = {};
        
        // Actualizar tablas
        this.updateDeliveryTable();
        this.updateCompletedTable();
        
        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Mostrar notificación
        this.showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                            order.prepTime + ', Tiempo de entrega: ' + order.deliveryTime, 'success');
    },

    // MODIFICADO: Actualizar tabla de órdenes completadas para mostrar detalles correctamente
    updateCompletedTable: function(showAll) {
        var completedBody = document.getElementById('completed-body');
        if (!completedBody) {
            console.warn("Elemento 'completed-body' no encontrado");
            return;
        }
        
        completedBody.innerHTML = '';
        
        // Verificar que el array de órdenes completadas existe
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }
        
        var displayOrders = showAll ? Avika.data.completedOrders : Avika.data.completedOrders.slice(0, 5);
        
        for (var i = 0; i < displayOrders.length; i++) {
            var order = displayOrders[i];
            var row = document.createElement('tr');
            
            // Celda del platillo
            var dishCell = document.createElement('td');
            dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
            row.appendChild(dishCell);
            
            // Celda de fin
            var endCell = document.createElement('td');
            endCell.textContent = order.endTimeFormatted || order.finishTimeFormatted || '--:--:--';
            row.appendChild(endCell);
            
            // Celda de detalles (CORREGIDA)
            var detailsCell = document.createElement('td');
            var details = '';
            
            // Construir los detalles correctamente
            if (order.serviceType) {
                details += Avika.config.serviceNames[order.serviceType] || order.serviceType;
            }
            
            if (order.category) {
                details += ', ' + (Avika.config.categoryNames[order.category] || order.category);
            }
            
            if (order.isSpecialCombo) {
                details += ' (Combo Especial)';
            }
            
            if (order.customizations && order.customizations.length > 0) {
                details += ', ' + order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
                }).join(', ');
            }
            
            if (order.notes) {
                details += ' - ' + order.notes;
            }
            
            if (order.prepTime) {
                details += ' | Tiempo total: ' + order.prepTime;
            }
            
            if (order.deliveryDepartureTimeFormatted) {
                details += ' | Salida: ' + order.deliveryDepartureTimeFormatted;
            }
            
            if (order.deliveryArrivalTimeFormatted) {
                details += ' | Entrega: ' + order.deliveryArrivalTimeFormatted;
                
                if (order.deliveryTime) {
                    details += ' | Tiempo de entrega: ' + order.deliveryTime;
                }
            }
            
            detailsCell.textContent = details;
            row.appendChild(detailsCell);
            
            completedBody.appendChild(row);
        }
        
        // Añadir botón para limpiar historial si hay pedidos completados
        if (Avika.data.completedOrders.length > 0) {
            var clearHistoryContainer = document.getElementById('clear-history-container');
            if (!clearHistoryContainer) {
                clearHistoryContainer = document.createElement('div');
                clearHistoryContainer.id = 'clear-history-container';
                clearHistoryContainer.style.textAlign = 'center';
                clearHistoryContainer.style.margin = '10px 0';
                
                var completedTable = document.querySelector('.pending-orders-section table');
                if (completedTable) {
                    completedTable.parentNode.insertBefore(clearHistoryContainer, completedTable.nextSibling);
                }
            }
            
            clearHistoryContainer.innerHTML = '';
            var clearBtn = document.createElement('button');
            clearBtn.className = 'action-btn cancel-btn';
            clearBtn.textContent = 'Limpiar Historial';
            clearBtn.onclick = function() {
                if (confirm('¿Está seguro que desea borrar todo el historial de platillos terminados?')) {
                    Avika.orders.clearCompletedOrders();
                    
                    // Ocultar el botón después de limpiar
                    document.getElementById('clear-history-container').style.display = 'none';
                }
            };
            
            clearHistoryContainer.appendChild(clearBtn);
        }
    },
    
    // Actualizar tabla de órdenes pendientes
    updatePendingTable: function() {
        // Actualizar contador primero
        var pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
        }
        
        var pendingBody = document.getElementById('pending-body');
        if (!pendingBody) {
            console.warn("Elemento 'pending-body' no encontrado");
            return;
        }
        
        // Si no hay órdenes pendientes, limpiamos la tabla
        if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            pendingBody.innerHTML = '';
            return;
        }
        
        // Reconstruir la tabla completamente para evitar problemas
        pendingBody.innerHTML = '';
        
        // Agregar todas las órdenes pendientes desde cero
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            // Crear una nueva fila para cada orden
            var newRow = this.createOrderRow(order);
            pendingBody.appendChild(newRow);
        }
    },

    // Actualizar tabla de órdenes en reparto
    updateDeliveryTable: function() {
        // Actualizar contador primero
        var deliveryCount = document.getElementById('delivery-count');
        if (deliveryCount) {
            deliveryCount.textContent = Avika.data.deliveryOrders ? Avika.data.deliveryOrders.length : 0;
        }
        
        var deliveryBody = document.getElementById('delivery-body');
        if (!deliveryBody) {
            console.warn("Elemento 'delivery-body' no encontrado");
            return;
        }
        
        // Si no hay órdenes en reparto, limpiamos la tabla
        if (!Avika.data.deliveryOrders || Avika.data.deliveryOrders.length === 0) {
            deliveryBody.innerHTML = '';
            return;
        }
        
        // Reconstruir la tabla completamente
        deliveryBody.innerHTML = '';
        
        // Agregar todas las órdenes en reparto desde cero
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            var order = Avika.data.deliveryOrders[i];
            var row = this.createDeliveryRow(order);
            deliveryBody.appendChild(row);
        }
    },
    
    // Crear fila para una orden en reparto
    createDeliveryRow: function(order) {
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de hora de salida (o estado "Listo para salida")
        var departureCell = document.createElement('td');
        if (order.deliveryDepartureTime) {
            departureCell.textContent = order.deliveryDepartureTimeFormatted || '--:--:--';
        } else {
            departureCell.innerHTML = '<span style="color: #f39c12;">Listo para salida</span>';
        }
        row.appendChild(departureCell);
        
        // Celda de tiempo en reparto o tiempo desde que está listo
        var timerCell = document.createElement('td');
        timerCell.className = 'delivery-timer';
        timerCell.setAttribute('data-id', order.id);
        
        if (order.deliveryDepartureTime) {
            // Si ya salió para entrega, usar el tiempo de salida como base
            timerCell.setAttribute('data-departure-time', order.deliveryDepartureTime);
        } else if (order.finishTime) {
            // Si está listo pero aún no ha salido, usar el tiempo de finalización como base
            timerCell.className = 'ready-timer';
            timerCell.setAttribute('data-ready-time', order.finishTime);
        } else {
            // Caso de respaldo (no debería ocurrir): usar el tiempo de inicio
            timerCell.className = 'ready-timer';
            timerCell.setAttribute('data-ready-time', order.startTime);
        }
        
        timerCell.textContent = '00:00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        var detailsText = '';

        // Añadir información de categoría
        if (order.category) {
            detailsText += Avika.config.categoryNames[order.category] || order.category;
        }

        // Añadir personalizaciones si existen
        if (order.customizations && order.customizations.length) {
            detailsText += ', ' + order.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
        }

        // Añadir notas si existen
        if (order.notes) {
            detailsText += '<br><span class="notes">' + order.notes + '</span>';
        }

        // Añadir información del ticket
        if (order.ticketId) {
            detailsText += '<br><span class="ticket-info">Ticket #' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
        }

        detailsCell.innerHTML = detailsText;
        row.appendChild(detailsCell);

        // Celda de acción
        var actionCell = document.createElement('td');

        // Determinar qué botón mostrar según el estado
        if (!order.deliveryDepartureTime) {
            // Si aún no se ha registrado la salida, mostrar botón "Registrar Salida"
            var departureBtn = document.createElement('button');
            departureBtn.className = 'action-btn departure-btn';
            departureBtn.textContent = 'Registrar Salida';
            departureBtn.onclick = (function(id) {
                return function() {
                    Avika.orderService.markDeliveryDeparture(id);
                };
            })(order.id);
            actionCell.appendChild(departureBtn);
        } else {
            // Si ya se registró la salida, mostrar botón "Registrar Entrega"
            var arrivalBtn = document.createElement('button');
            arrivalBtn.className = 'action-btn arrival-btn';
            arrivalBtn.textContent = 'Registrar Entrega';
            arrivalBtn.onclick = (function(id) {
                return function() {
                    Avika.orderService.markDeliveryArrival(id);
                };
            })(order.id);
            actionCell.appendChild(arrivalBtn);
        }

        row.appendChild(actionCell);
        return row;
    },
    
    createOrderRow: function(order) {
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.textContent = order.startTimeFormatted || this.formatTime(new Date(order.startTime));
        row.appendChild(startCell);
        
        // Celda de temporizador
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        timerCell.setAttribute('data-id', order.id);
        timerCell.textContent = '00:00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        
        var detailsText = '';
        
        // Añadir información de servicio
        detailsText += Avika.config.serviceNames[order.serviceType] || order.serviceType;
        
        // Añadir personalizaciones si existen
        if (order.customizations && order.customizations.length) {
            detailsText += ', ' + order.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
        }
        
        // Añadir notas si existen
        if (order.notes) {
            detailsText += '<br><span class="notes">' + order.notes + '</span>';
        }
        
        // Añadir información del ticket
        if (order.ticketId) {
            detailsText += '<br><span class="ticket-info">Ticket #' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
        }
        
        detailsCell.innerHTML = detailsText;
        row.appendChild(detailsCell);
        
        // Celda de acciones
        var actionsCell = document.createElement('td');
        
        // Si es un combo especial, mostrar botones para cada cocina
        if (order.isSpecialCombo) {
            // Crear un contenedor para los botones de cocina
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            var hotKitchenBtn = document.createElement('button');
            hotKitchenBtn.className = 'action-btn kitchen-btn' + (order.hotKitchenFinished ? ' disabled' : '');
            hotKitchenBtn.textContent = order.hotKitchenFinished ? 'Cocina Cal. ✓' : 'Cocina Cal.';
            hotKitchenBtn.disabled = order.hotKitchenFinished;
            hotKitchenBtn.style.backgroundColor = '#ff5252'; // Color rojo para cocina caliente
            hotKitchenBtn.onclick = (function(id) {
                return function() {
                    Avika.orderService.finishHotKitchen(id);
                };
            })(order.id);
            buttonGroup.appendChild(hotKitchenBtn);
            
            var coldKitchenBtn = document.createElement('button');
            coldKitchenBtn.className = 'action-btn kitchen-btn' + (order.coldKitchenFinished ? ' disabled' : '');
            coldKitchenBtn.textContent = order.coldKitchenFinished ? 'Cocina Fría ✓' : 'Cocina Fría';
            coldKitchenBtn.disabled = order.coldKitchenFinished;
            coldKitchenBtn.style.backgroundColor = '#4caf50'; // Color verde para cocina fría
            coldKitchenBtn.onclick = (function(id) {
                return function() {
                    Avika.orderService.finishColdKitchen(id);
                };
            })(order.id);
            buttonGroup.appendChild(coldKitchenBtn);
            
            actionsCell.appendChild(buttonGroup);
            
            // Si ambas cocinas están listas y es a domicilio, verificar si todos los platillos del ticket están terminados
            if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
                // Verificar si el combo es parte de un ticket
                if (order.ticketId) {
                    // Verificar si todos los platillos del ticket están terminados
                    var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                    
                    // Solo mostrar botón de salida si todos los platillos están terminados
                    if (ticketStatus.isComplete && !order.deliveryDepartureTime) {
                        var departureBtn = document.createElement('button');
                        departureBtn.className = 'action-btn departure-btn';
                        departureBtn.textContent = 'Registrar Salida';
                        departureBtn.onclick = (function(id) {
                            return function() {
                                Avika.orderService.markDeliveryDeparture(id);
                            };
                        })(order.id);
                        actionsCell.appendChild(departureBtn);
                    }
                } else if (!order.kitchenFinished) {
                    // Si no es parte de un ticket, mostrar botón de salida directamente
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.markDeliveryDeparture(id);
                        };
                    })(order.id);
                    actionsCell.appendChild(departureBtn);
                }
            }
        } 
        // Si es a domicilio, mostrar botón de "Listo" y luego "Registrar Salida"
        else if (order.serviceType === 'domicilio') {
            // Si es parte de un ticket
            if (order.ticketId) {
                // Verificar si todos los platillos del ticket están terminados
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                
                // Si este platillo no está terminado, mostrar botón "Listo"
                if (!order.finished) {
                    var doneBtn = document.createElement('button');
                    doneBtn.className = 'action-btn';
                    doneBtn.textContent = 'Listo';
                    doneBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.finishIndividualItem(id);
                        };
                    })(order.id);
                    actionsCell.appendChild(doneBtn);
                }
                // Si todos los platillos del ticket están terminados, mostrar "Registrar Salida"
                else if (ticketStatus.isComplete && !order.deliveryDepartureTime) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.markDeliveryDeparture(id);
                        };
                    })(order.id);
                    actionsCell.appendChild(departureBtn);
                }
                // Platillo terminado pero esperando que otros platillos del ticket estén listos
                else if (order.finished && !ticketStatus.isComplete) {
                    var statusText = document.createElement('span');
                    statusText.className = 'status-text';
                    statusText.textContent = 'Esperando otros platillos';
                    actionsCell.appendChild(statusText);
                }
            }
            // Platillo individual (sin ticket)
            else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                
                // Mostrar el botón adecuado según el estado
                if (!order.kitchenFinished) {
                    doneBtn.textContent = 'Listo';
                    doneBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.finishKitchenForDelivery(id);
                        };
                    })(order.id);
                    actionsCell.appendChild(doneBtn);
                }
            }
        }
        // Para platillos normales no a domicilio, mostrar botón de listo
        else {
            // Si es parte de un ticket y ya está terminado, mostrar "Esperando otros platillos"
            if (order.ticketId && order.finished) {
                var statusText = document.createElement('span');
                statusText.className = 'status-text';
                statusText.textContent = 'Esperando otros platillos';
                actionsCell.appendChild(statusText);
            } else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                doneBtn.textContent = 'Listo';
                
                // Si es parte de un ticket, usar finishIndividualItem en lugar de finishPreparation
                if (order.ticketId) {
                    doneBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.finishIndividualItem(id);
                        };
                    })(order.id);
                } else {
                    doneBtn.onclick = (function(id) {
                        return function() {
                            Avika.orderService.finishPreparation(id);
                        };
                    })(order.id);
                }
                
                actionsCell.appendChild(doneBtn);
            }
        }
        
        row.appendChild(actionsCell);
        
        return row;
    },
    
    // Actualizar temporizadores de platillos en preparación
    updatePendingTimers: function() {
        var self = this; // Guardar referencia a this para evitar problemas de contexto
        var pendingBody = document.getElementById('pending-body');
        
        if (!pendingBody) return;
        
        var timerCells = pendingBody.querySelectorAll('.timer-cell');
        if (timerCells.length === 0) return;
        
        var now = new Date(); // Calcular la hora actual una sola vez
        var visibleTimers = 0;
        var MAX_INVISIBLE_TIMERS = 10; // Límite de temporizadores invisibles a actualizar
        
        // Usar constantes definidas centralmente si están disponibles
        var TEN_MINUTES = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
                          Avika.utils.TIME_CONSTANTS.TEN_MINUTES_IN_SECONDS : 600;
        var FIFTEEN_MINUTES = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
                             Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS : 900;
        
        // Crear un mapa de órdenes para búsqueda más eficiente
        var orderMap = {};
        if (Array.isArray(Avika.data.pendingOrders)) {
            Avika.data.pendingOrders.forEach(function(order) {
                if (order && order.id) {
                    orderMap[order.id] = order;
                }
            });
        }
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            
            // Solo actualizar temporizadores visibles (mejora de rendimiento)
            var isVisible = self.isElementInViewport(timerCell);
            if (!isVisible && visibleTimers > MAX_INVISIBLE_TIMERS) continue;
            
            var orderId = timerCell.getAttribute('data-id');
            if (!orderId) continue;
            
            // Buscar la orden usando el mapa (mucho más eficiente)
            var order = orderMap[orderId] || self.findOrderById(orderId);
            if (!order) continue;
            
            visibleTimers++;
            
            // Validar que startTime sea una fecha válida
            var startTime;
            try {
                startTime = new Date(order.startTime);
                if (isNaN(startTime.getTime())) throw new Error("Fecha inválida");
            } catch (e) {
                console.warn("Formato de fecha inválido para la orden:", orderId);
                timerCell.textContent = "--:--:--";
                continue;
            }
            
            var elapsedMillis = now - startTime;
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = self.formatElapsedTime(elapsedSeconds);
            
            // Añadir clases de advertencia según el tiempo transcurrido
            timerCell.classList.remove('warning', 'alert');
            
            // Más de 10 minutos: advertencia
            if (elapsedSeconds >= TEN_MINUTES) {
                timerCell.classList.add('warning');
            }
            
            // Más de 15 minutos: alerta
            if (elapsedSeconds >= FIFTEEN_MINUTES) {
                timerCell.classList.add('alert');
            }
        }
    },
    
    // Actualizar temporizadores de reparto
    updateDeliveryTimers: function() {
        var self = this; // Guardar referencia a this para evitar problemas de contexto
        var deliveryBody = document.getElementById('delivery-body');
        if (!deliveryBody) return;
        
        var timerCells = deliveryBody.querySelectorAll('.delivery-timer, .ready-timer');
        if (timerCells.length === 0) return;
        
        var now = new Date(); // Calcular la hora actual una sola vez
        var visibleTimers = 0;
        var MAX_INVISIBLE_TIMERS = 10; // Límite de temporizadores invisibles a actualizar
        
        // Usar constantes definidas centralmente si están disponibles
        var THIRTY_MINUTES = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
                            Avika.utils.TIME_CONSTANTS.THIRTY_MINUTES_IN_SECONDS : 1800;
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            
            // Solo actualizar temporizadores visibles (mejora de rendimiento)
            var isVisible = self.isElementInViewport(timerCell);
            if (!isVisible && visibleTimers > MAX_INVISIBLE_TIMERS) continue;
            
            visibleTimers++;
            
            // Verificar el tipo de timer (delivery o ready)
            var isDeliveryTimer = timerCell.classList.contains('delivery-timer');
            var baseTimeStr = isDeliveryTimer ? 
                              timerCell.getAttribute('data-departure-time') : 
                              timerCell.getAttribute('data-ready-time');
            
            if (!baseTimeStr) continue;
            
            // Validar que la fecha sea válida
            var baseTime;
            try {
                baseTime = new Date(baseTimeStr);
                if (isNaN(baseTime.getTime())) throw new Error("Fecha inválida");
            } catch (e) {
                console.warn("Formato de fecha inválido:", baseTimeStr);
                timerCell.textContent = "--:--:--";
                continue;
            }
            
            var elapsedMillis = now - baseTime;
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            // Usar la función formatElapsedTime para mantener consistencia
            timerCell.textContent = self.formatElapsedTime(elapsedSeconds);
            
            // Añadir clase de advertencia para tiempos largos
            timerCell.classList.remove('warning');
            if (elapsedSeconds >= THIRTY_MINUTES) {
                timerCell.classList.add('warning');
            }
        }
    },
    
    // Verificar si un elemento está visible en el viewport
    isElementInViewport: function(el) {
        // Validar que el elemento exista
        if (!el) return false;
        
        try {
            var rect = el.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Optimización: considerar elemento visible si al menos una parte está en el viewport
            // o está justo por encima/debajo del viewport visible (pre-carga)
            var buffer = 200; // píxeles de margen para pre-carga
            
            return (
                (rect.top >= -buffer && rect.top <= windowHeight + buffer) ||
                (rect.bottom >= -buffer && rect.bottom <= windowHeight + buffer)
            ) && (
                rect.left >= 0 &&
                rect.right <= windowWidth
            );
        } catch (e) {
            console.warn("Error al verificar visibilidad del elemento:", e);
            return false;
        }
    },
    
    // Actualizar todos los temporizadores - Versión optimizada
    updateAllTimers: function() {
        try {
            var startTime = performance.now();
            
            // Verificar que Avika.data existe
            if (!Avika.data) {
                console.warn('Avika.data no está definido, no se pueden actualizar temporizadores');
                return;
            }
            
            // Actualizar temporizadores de platillos en preparación
            if (Array.isArray(Avika.data.pendingOrders) && Avika.data.pendingOrders.length > 0) {
                this.updatePendingTimers();
            }
            
            // Actualizar temporizadores de platillos en reparto
            if (Array.isArray(Avika.data.deliveryOrders) && Avika.data.deliveryOrders.length > 0) {
                this.updateDeliveryTimers();
            }
            
            // Medir y registrar el tiempo de ejecución para optimizaciones futuras
            var endTime = performance.now();
            var executionTime = endTime - startTime;
            
            // Solo registrar si toma más de 50ms (potencial problema de rendimiento)
            if (executionTime > 50) {
                console.debug('Actualización de temporizadores completó en ' + executionTime.toFixed(2) + 'ms');
            }
        } catch (error) {
            // Capturar cualquier error inesperado para evitar que la aplicación falle
            console.error('Error al actualizar temporizadores:', error);
        }
    },

    // Búsqueda optimizada de órdenes
    findOrderById: function(id) {
        if (!id || !Avika.data || !Array.isArray(Avika.data.pendingOrders)) {
            return null;
        }
        
        // Primero intentar búsqueda directa si existe un mapa de órdenes
        if (this._orderCache && this._orderCache[id]) {
            return this._orderCache[id];
        }
        
        // Búsqueda tradicional si no hay caché
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order && order.id === id) {
                // Actualizar caché para futuras búsquedas
                if (!this._orderCache) this._orderCache = {};
                this._orderCache[id] = order;
                return order;
            }
        }
        return null;
    },
    
    // Funciones para el manejo de tickets o comandas
    enableTicketMode: function() {
        if (!Avika.ui || !Avika.ui.state) {
            this.state = this.state || {};
            this.state.ticketMode = true;
            this.state.ticketItems = [];
            this.state.ticketService = 'comedor';
        } else {
            Avika.ui.state.ticketMode = true;
            Avika.ui.state.ticketItems = [];
            Avika.ui.state.ticketService = 'comedor';
        }
        
        // Mostrar modal para ingresar tickets
        this.showTicketModal();
    },
    
    showTicketModal: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('ticket-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ticket-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Ingreso de Ticket/Comanda</h2>
                    
                    <div class="ticket-input-group">
                        <label for="ticket-time">Hora de entrada:</label>
                        <div class="simple-time-picker">
                            <select id="ticket-hour" class="time-select">
                                ${this.generateHourOptions()}
                            </select>
                            <span>:</span>
                            <select id="ticket-minute" class="time-select">
                                ${this.generateMinuteOptions()}
                            </select>
                            <span class="time-select-label">hrs</span>
                        </div>
                    </div>
                    
                    <div class="ticket-items-container">
                        <h3>Platillos en este ticket: <span id="ticket-count">0</span></h3>
                        <div id="ticket-items-list" class="ticket-items-list"></div>
                    </div>
                    <div class="ticket-service-selection">
                        <p>Tipo de servicio para todo el ticket:</p>
                        <div class="option-btns">
                            <button class="option-btn selected" id="ticket-btn-comedor">Comedor</button>
                            <button class="option-btn" id="ticket-btn-domicilio">Domicilio</button>
                            <button class="option-btn" id="ticket-btn-para-llevar">Ordena y Espera</button>
                        </div>
                    </div>
                    
                    <div class="ticket-notes">
                        <label for="ticket-notes-input">Notas para todo el ticket:</label>
                        <textarea id="ticket-notes-input" placeholder="Notas adicionales para todo el ticket"></textarea>
                    </div>
                    
                    <div class="ticket-buttons">
                        <button id="btn-add-ticket-item" class="action-btn">Agregar platillo</button>
                        <div class="modal-action-btns">
                            <button id="btn-cancel-ticket" class="action-btn cancel-btn">Cancelar</button>
                            <button id="btn-save-ticket" class="action-btn start-btn" disabled>Guardar ticket</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                Avika.orderService.cancelTicket();
            };
            
            // Evento para agregar platillo
            document.getElementById('btn-add-ticket-item').onclick = function() {
                Avika.orderService.showTicketItemSelection();
            };
            
            // Evento para guardar ticket
            document.getElementById('btn-save-ticket').onclick = function() {
                // Prevenir múltiples clics
                this.disabled = true;
                // Usar timeout para asegurar que el botón se actualiza visualmente antes de continuar
                setTimeout(function() {
                    Avika.orderService.saveTicket();
                }, 50);
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-ticket').onclick = function() {
                Avika.orderService.cancelTicket();
            };
            
            // Eventos de selección de servicio
            document.getElementById('ticket-btn-comedor').onclick = function() {
                Avika.orderService.selectTicketService(this, 'comedor');
            };
            
            document.getElementById('ticket-btn-domicilio').onclick = function() {
                Avika.orderService.selectTicketService(this, 'domicilio');
            };
            
            document.getElementById('ticket-btn-para-llevar').onclick = function() {
                Avika.orderService.selectTicketService(this, 'para-llevar');
            };
        }
        
        // Inicializar hora actual
        var now = new Date();
        document.getElementById('ticket-hour').value = now.getHours();
        document.getElementById('ticket-minute').value = this.getMinutes(now.getMinutes());
        
        // Resetear lista de items
        if (!Avika.ui || !Avika.ui.state) {
            this.state = this.state || {};
            this.state.ticketItems = [];
        } else {
            Avika.ui.state.ticketItems = [];
        }
        
        document.getElementById('ticket-items-list').innerHTML = '';
        document.getElementById('ticket-count').textContent = '0';
        document.getElementById('btn-save-ticket').disabled = true;
        document.getElementById('ticket-notes-input').value = '';
        
        // Seleccionar servicio predeterminado (comedor)
        document.getElementById('ticket-btn-comedor').classList.add('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        
        if (!Avika.ui || !Avika.ui.state) {
            this.state.ticketService = 'comedor';
        } else {
            Avika.ui.state.ticketService = 'comedor';
        }
        
        // Mostrar modal
        modal.style.display = 'block';
    },
    
    // Funciones de utilidad para el selector de hora
    generateHourOptions: function() {
        var options = '';
        for (var i = 0; i < 24; i++) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    generateMinuteOptions: function() {
        var options = '';
        for (var i = 0; i < 60; i += 1) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    getMinutes: function(num) {
        return num % 60;
    },
    
    selectTicketService: function(button, service) {
        document.getElementById('ticket-btn-comedor').classList.remove('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        
        if (!Avika.ui || !Avika.ui.state) {
            this.state = this.state || {};
            this.state.ticketService = service;
        } else {
            Avika.ui.state.ticketService = service;
        }
    },
    
    // MODIFICADO: Método para mostrar el modal de selección de platillos con búsqueda global
    showTicketItemSelection: function() {
        // Crear modal de selección de platillo
        var modal = document.getElementById('item-selection-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-selection-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Seleccionar platillo</h2>
                    
                    <!-- NUEVA SECCIÓN: Barra de búsqueda global -->
                    <div class="search-container" style="margin-bottom: 15px;">
                        <input type="text" id="global-dish-search" class="search-input" placeholder="Buscar platillo en todas las categorías...">
                    </div>
                    
                    <div class="mobile-friendly-select">
                        <!-- Sección de resultados de búsqueda global (inicialmente oculta) -->
                        <div class="selection-step" id="search-results-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-categories">« Volver a categorías</button>
                                <h3>Resultados de búsqueda</h3>
                            </div>
                            <div id="search-results-container" class="dishes-container"></div>
                        </div>
                    
                        <div class="selection-step" id="category-selection-step">
                            <h3>Categoría:</h3>
                            <div class="category-container">
                                <button class="category-btn" data-category="frio">Platillos Fríos</button>
                                <button class="category-btn" data-category="entrada-fria">Entradas Frías</button>
                                <button class="category-btn" data-category="caliente">Platillos Calientes</button>
                                <button class="category-btn" data-category="entrada-caliente">Entradas Calientes</button>
                                <button class="category-btn" data-category="combos">Combos</button>
                            </div>
                        </div>
                        
                        <div class="selection-step" id="dish-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-category">« Atrás</button>
                                <h3>Platillo: <span id="selected-category-name"></span></h3>
                            </div>
                            
                            <!-- Búsqueda específica de categoría -->
                            <div class="search-container" style="margin-bottom: 15px;">
                                <input type="text" id="ticket-dish-search" class="search-input" placeholder="Buscar en esta categoría...">
                            </div>
                            
                            <div id="dishes-selection-container" class="dishes-container"></div>
                        </div>
                        
                        <div class="selection-step" id="quantity-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-dish">« Atrás</button>
                                <h3>Platillo: <span id="selected-dish-name"></span></h3>
                            </div>
                            <div class="item-quantity">
                                <h3>Cantidad:</h3>
                                <div class="qty-control">
                                    <button class="qty-btn" id="item-btn-decrease">-</button>
                                    <span class="qty-display" id="item-quantity-display">1</span>
                                    <button class="qty-btn" id="item-btn-increase">+</button>
                                </div>
                            </div>
                            <div class="item-notes">
                                <h3>Notas para este platillo:</h3>
                                <textarea id="item-notes-input" placeholder="Notas específicas para este platillo"></textarea>
                            </div>
                            
                            <div class="item-buttons">
                                <div class="modal-action-btns">
                                    <button id="btn-cancel-item" class="action-btn cancel-btn">Cancelar</button>
                                    <button id="btn-add-to-ticket" class="action-btn start-btn">Agregar al ticket</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
            
            // NUEVO: Evento para la búsqueda global
            document.getElementById('global-dish-search').addEventListener('input', function() {
                Avika.orderService.performGlobalDishSearch(this.value);
            });
            
            // Evento para barra de búsqueda específica de categoría
            document.getElementById('ticket-dish-search').addEventListener('input', function() {
                Avika.orderService.filterTicketDishes(this.value.toLowerCase());
            });
            
            // Eventos para categorías
            var categoryBtns = modal.querySelectorAll('.category-btn');
            categoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    var category = this.getAttribute('data-category');
                    Avika.orderService.selectTicketCategory(category);
                    
                    // Mostrar paso de selección de platillos
                    document.getElementById('category-selection-step').style.display = 'none';
                    document.getElementById('dish-selection-step').style.display = 'block';
                    document.getElementById('search-results-step').style.display = 'none';
                };
            });
            
            // Botón para volver a categorías desde resultados de búsqueda
            var backToCategoryBtns = modal.querySelectorAll('.back-to-categories');
            backToCategoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    document.getElementById('search-results-step').style.display = 'none';
                    document.getElementById('category-selection-step').style.display = 'block';
                    document.getElementById('global-dish-search').value = '';
                };
            });
            
            // Botón para volver a categorías
            modal.querySelector('.back-to-category').onclick = function() {
                document.getElementById('category-selection-step').style.display = 'block';
                document.getElementById('dish-selection-step').style.display = 'none';
                document.getElementById('search-results-step').style.display = 'none';
            };
            
            // Botón para volver a platillos
            modal.querySelector('.back-to-dish').onclick = function() {
                document.getElementById('dish-selection-step').style.display = 'block';
                document.getElementById('quantity-selection-step').style.display = 'none';
            };
            
            // Eventos de cantidad
            document.getElementById('item-btn-decrease').onclick = function() {
                Avika.orderService.changeTicketItemQuantity(-1);
            };
            
            document.getElementById('item-btn-increase').onclick = function() {
                Avika.orderService.changeTicketItemQuantity(1);
            };
            
            // Evento para agregar al ticket
            document.getElementById('btn-add-to-ticket').onclick = function() {
                Avika.orderService.addItemToTicket();
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-item').onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Inicializar estado para el item seleccionado
        if (!Avika.ui || !Avika.ui.state) {
            this.state = this.state || {};
            this.state.selectedTicketItem = {
                category: '',
                dish: '',
                quantity: 1,
                notes: ''
            };
        } else {
            Avika.ui.state.selectedTicketItem = {
                category: '',
                dish: '',
                quantity: 1,
                notes: ''
            };
        }
        
        // Limpiar campos de búsqueda
        if (document.getElementById('global-dish-search')) {
            document.getElementById('global-dish-search').value = '';
        }
        
        if (document.getElementById('ticket-dish-search')) {
            document.getElementById('ticket-dish-search').value = '';
        }
        
        // Mostrar la vista de categorías por defecto
        document.getElementById('category-selection-step').style.display = 'block';
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'none';
        
        if (document.getElementById('search-results-step')) {
            document.getElementById('search-results-step').style.display = 'none';
        }
        
        // Resetear otros contenidos
        document.getElementById('item-quantity-display').textContent = '1';
        document.getElementById('item-notes-input').value = '';
        document.getElementById('selected-category-name').textContent = '';
        document.getElementById('selected-dish-name').textContent = '';
        document.getElementById('dishes-selection-container').innerHTML = '';
        
        if (document.getElementById('search-results-container')) {
            document.getElementById('search-results-container').innerHTML = '';
        }
        
        modal.style.display = 'block';
    },
    
    // Implementación mejorada de función para mostrar notificaciones
    showNotification: function(message, type) {
        // Primero intentar usar la función de Avika.ui
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            return Avika.ui.showNotification(message, type);
        }
        
        // Implementación propia si no está disponible en Avika.ui
        var notification = document.getElementById('notification');
        if (!notification) {
            console.warn('Elemento de notificación no encontrado');
            console.log(type + ': ' + message);
            return;
        }
        
        // Eliminar clases anteriores
        notification.className = '';
        notification.classList.add('notification');
        
        // Añadir clase según el tipo
        type = type || 'info'; // Tipos: 'info', 'success', 'warning', 'error'
        notification.classList.add('notification-' + type);
        
        // Establecer el mensaje
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Limpiar cualquier temporizador existente para evitar solapamientos
        if (this._notificationTimer) {
            clearTimeout(this._notificationTimer);
        }
        
        // Usar constante definida centralmente o valor por defecto
        var timeout = (Avika.utils && Avika.utils.TIME_CONSTANTS) ? 
                       Avika.utils.TIME_CONSTANTS.NOTIFICATION_TIMEOUT_MS : 3000;
        
        // Guardar referencia al temporizador
        this._notificationTimer = setTimeout(function() {
            notification.style.display = 'none';
        }, timeout);
    },
    
    // Función para guardar un ticket completo
    saveTicket: function() {
        // Obtener los datos del ticket
        var ticketItems = Avika.ui && Avika.ui.state ? 
                          Avika.ui.state.ticketItems : 
                          (this.state ? this.state.ticketItems : []);
        
        var ticketService = Avika.ui && Avika.ui.state ? 
                            Avika.ui.state.ticketService : 
                            (this.state ? this.state.ticketService : 'comedor');
        
        var ticketNotes = document.getElementById('ticket-notes-input').value;
        
        // Obtener hora seleccionada
        var hour = parseInt(document.getElementById('ticket-hour').value, 10);
        var minute = parseInt(document.getElementById('ticket-minute').value, 10);
        
        // Validar hora
        if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
            this.showNotification('Por favor ingrese una hora válida', 'error');
            return;
        }
        
        // Crear fecha con la hora seleccionada
        var ticketTime = new Date();
        ticketTime.setHours(hour, minute, 0, 0);
        
        // Validar que haya platillos en el ticket
        if (!ticketItems || ticketItems.length === 0) {
            this.showNotification('El ticket debe contener al menos un platillo', 'error');
            // Re-habilitar el botón si hay error
            var saveButton = document.getElementById('btn-save-ticket');
            if (saveButton) saveButton.disabled = false;
            return;
        }
        
        console.log("Guardando ticket con", ticketItems.length, "items");
        
        // Verificar que Avika.data existe y está inicializado
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existe, inicializando objeto vacío');
        }
        
        // Verificar que pendingOrders existe
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        
        // Generar un ID de ticket único para agrupar los platillos
        var ticketId = 'ticket-' + Date.now();
        
        try {
            // Procesar cada item del ticket
            ticketItems.forEach(function(item) {
                var preparation = {
                    id: Date.now().toString() + Math.floor(Math.random() * 1000),
                    ticketId: ticketId, // Añadir ID del ticket para agrupar
                    dish: item.dish,
                    category: item.category,
                    categoryDisplay: Avika.config.categoryNames[item.category],
                    quantity: item.quantity,
                    customizations: [],
                    serviceType: ticketService || 'comedor',
                    notes: item.notes + (ticketNotes ? ' | ' + ticketNotes : ''),
                    startTime: ticketTime,
                    startTimeFormatted: this.formatTime(ticketTime),
                    isSpecialCombo: item.isSpecialCombo,
                    isFromTicket: true,
                    finished: false, // Asegurarnos que comienza como no terminado
                    allTicketItemsFinished: false // Inicializar como no terminado
                };
                
                // Si es un combo especial, inicializar estados de cocinas
                if (item.isSpecialCombo) {
                    preparation.hotKitchenFinished = false;
                    preparation.coldKitchenFinished = false;
                }
                
                // Agregar a órdenes pendientes
                Avika.data.pendingOrders.push(JSON.parse(JSON.stringify(preparation)));
            }, this);
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Limpiar caché de búsqueda
            this._orderCache = {};
            
            // Actualizar la tabla de órdenes pendientes
            this.updatePendingTable();
            
            // Cerrar modal
            document.getElementById('ticket-modal').style.display = 'none';
            
            // Mostrar notificación
            this.showNotification('Ticket guardado con ' + ticketItems.length + ' platillos', 'success');
            
            // Limpiar estado
            if (Avika.ui && Avika.ui.state) {
                Avika.ui.state.ticketMode = false;
                Avika.ui.state.ticketItems = [];
            } else if (this.state) {
                this.state.ticketMode = false;
                this.state.ticketItems = [];
            }
            
            return true;
        } catch (error) {
            console.error('Error al guardar ticket:', error);
            this.showNotification('Error al guardar ticket: ' + error.message, 'error');
            
            // Re-habilitar el botón si hay error
            var saveButton = document.getElementById('btn-save-ticket');
            if (saveButton) saveButton.disabled = false;
            
            return false;
        }
    },
    
    cancelTicket: function() {
        // Cerrar el modal
        var modal = document.getElementById('ticket-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Limpiar estado
        if (Avika.ui && Avika.ui.state) {
            Avika.ui.state.ticketMode = false;
            Avika.ui.state.ticketItems = [];
        } else if (this.state) {
            this.state.ticketMode = false;
            this.state.ticketItems = [];
        }
    },
    
    // NUEVA FUNCIÓN: Implementación de búsqueda global para selección de platillos
    performGlobalDishSearch: function(searchText) {
        if (!searchText || searchText.length < 2) {
            // Si la búsqueda está vacía o es muy corta, volver al selector de categorías
            document.getElementById('search-results-step').style.display = 'none';
            document.getElementById('category-selection-step').style.display = 'block';
            return;
        }
        
        searchText = searchText.toLowerCase();
        var resultsContainer = document.getElementById('search-results-container');
        resultsContainer.innerHTML = '';
        
        var foundItems = 0;
        
        // Buscar en todas las categorías
        for (var categoryKey in Avika.config.dishes) {
            var dishes = Avika.config.dishes[categoryKey];
            
            dishes.forEach(function(dish) {
                if (dish.toLowerCase().includes(searchText)) {
                    // Crear botón para el platillo encontrado
                    var button = document.createElement('button');
                    button.className = 'dish-btn';
                    
                    if (categoryKey === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                        button.className += ' special-combo';
                    }
                    
                    button.textContent = dish;
                    // Añadir la categoría como información adicional
                    var categoryInfo = document.createElement('small');
                    categoryInfo.style.display = 'block';
                    categoryInfo.style.fontSize = '0.8em';
                    categoryInfo.textContent = Avika.config.categoryNames[categoryKey];
                    button.appendChild(categoryInfo);
                    
                    // Crear closure para preservar valores
                    button.onclick = (function(selectedDish, selectedCategory) {
                        return function() {
                            // Almacenar la categoría y platillo seleccionados
                            if (Avika.ui && Avika.ui.state) {
                                Avika.ui.state.selectedTicketItem.category = selectedCategory;
                                Avika.ui.state.selectedTicketItem.dish = selectedDish;
                                Avika.ui.state.selectedTicketItem.quantity = 1;
                            } else {
                                Avika.orderService.state = Avika.orderService.state || {};
                                Avika.orderService.state.selectedTicketItem = Avika.orderService.state.selectedTicketItem || {};
                                Avika.orderService.state.selectedTicketItem.category = selectedCategory;
                                Avika.orderService.state.selectedTicketItem.dish = selectedDish;
                                Avika.orderService.state.selectedTicketItem.quantity = 1;
                            }
                            
                            // Mostrar la información seleccionada
                            document.getElementById('selected-dish-name').textContent = selectedDish;
                            
                            // Ir directamente al paso de cantidad
                            document.getElementById('search-results-step').style.display = 'none';
                            document.getElementById('dish-selection-step').style.display = 'none';
                            document.getElementById('quantity-selection-step').style.display = 'block';
                        };
                    })(dish, categoryKey);
                    
                    resultsContainer.appendChild(button);
                    foundItems++;
                }
            });
        }
        
        // Mostrar mensaje si no hay resultados
        if (foundItems === 0) {
            var noResults = document.createElement('p');
            noResults.textContent = 'No se encontraron platillos que coincidan con "' + searchText + '"';
            noResults.style.textAlign = 'center';
            noResults.style.padding = '20px';
            noResults.style.color = '#888';
            resultsContainer.appendChild(noResults);
        }
        
        // Mostrar sección de resultados y ocultar el resto
        document.getElementById('search-results-step').style.display = 'block';
        document.getElementById('category-selection-step').style.display = 'none';
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'none';
    },

    // Función para filtrar platillos en el modal de tickets
    filterTicketDishes: function(searchText) {
        var buttons = document.querySelectorAll('#dishes-selection-container .dish-btn');
        var found = false;
        
        buttons.forEach(function(button) {
            var dishName = button.textContent.toLowerCase();
            if (dishName.includes(searchText)) {
                button.style.display = '';
                found = true;
            } else {
                button.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no se encuentran platillos
        var noResultsMsg = document.getElementById('ticket-no-results-message');
        if (!found) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.id = 'ticket-no-results-message';
                noResultsMsg.textContent = 'No se encontraron platillos que coincidan con la búsqueda.';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.style.color = '#888';
                
                var container = document.getElementById('dishes-selection-container');
                if (container) {
                    container.parentNode.insertBefore(noResultsMsg, container.nextSibling);
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },

    selectTicketCategory: function(category) {
        // Guardar la categoría seleccionada
        if (Avika.ui && Avika.ui.state) {
            Avika.ui.state.selectedTicketItem = Avika.ui.state.selectedTicketItem || {};
            Avika.ui.state.selectedTicketItem.category = category;
        } else {
            this.state = this.state || {};
            this.state.selectedTicketItem = this.state.selectedTicketItem || {};
            this.state.selectedTicketItem.category = category;
        }
        
        // Mostrar el nombre de la categoría
        var categoryNameEl = document.getElementById('selected-category-name');
        if (categoryNameEl) {
            categoryNameEl.textContent = Avika.config.categoryNames[category] || category;
        }
        
        // Llenar el contenedor de platillos
        var container = document.getElementById('dishes-selection-container');
        if (!container) {
            console.warn("Contenedor de platillos no encontrado");
            return;
        }
        
        container.innerHTML = '';
        
        // Mostrar platillos de la categoría
        if (Avika.config.dishes[category]) {
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = document.createElement('button');
                button.className = 'dish-btn';
                button.setAttribute('data-dish', dish.toLowerCase()); // Añadir para búsqueda
                
                if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                    button.className += ' special-combo';
                }
                
                button.textContent = dish;
                
                // Usar closure para capturar el valor actual
                button.onclick = (function(selectedDish) {
                    return function() {
                        Avika.orderService.selectTicketDish(selectedDish);
                    };
                })(dish);
                
                container.appendChild(button);
            }
        }
    },
    
    selectTicketDish: function(dish) {
        // Guardar el platillo seleccionado
        if (Avika.ui && Avika.ui.state) {
            Avika.ui.state.selectedTicketItem = Avika.ui.state.selectedTicketItem || {};
            Avika.ui.state.selectedTicketItem.dish = dish;
            Avika.ui.state.selectedTicketItem.quantity = 1;
        } else {
            this.state = this.state || {};
            this.state.selectedTicketItem = this.state.selectedTicketItem || {};
            this.state.selectedTicketItem.dish = dish;
            this.state.selectedTicketItem.quantity = 1;
        }
        
        // Mostrar el nombre del platillo seleccionado
        var dishNameEl = document.getElementById('selected-dish-name');
        if (dishNameEl) {
            dishNameEl.textContent = dish;
        }
        
        // Ir al paso de cantidad
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'block';
    },
    
    changeTicketItemQuantity: function(change) {
        var quantityDisplay = document.getElementById('item-quantity-display');
        if (!quantityDisplay) return;
        
        var currentQty = parseInt(quantityDisplay.textContent);
        var newQty = Math.max(1, currentQty + change);
        
        quantityDisplay.textContent = newQty;
        
        // Actualizar la cantidad en el estado
        if (Avika.ui && Avika.ui.state && Avika.ui.state.selectedTicketItem) {
            Avika.ui.state.selectedTicketItem.quantity = newQty;
        } else if (this.state && this.state.selectedTicketItem) {
            this.state.selectedTicketItem.quantity = newQty;
        }
    },
    
    addItemToTicket: function() {
        var notes = document.getElementById('item-notes-input').value;
        var selectedTicketItem;
        
        // Obtener el item seleccionado desde el estado correspondiente
        if (Avika.ui && Avika.ui.state && Avika.ui.state.selectedTicketItem) {
            selectedTicketItem = Avika.ui.state.selectedTicketItem;
            selectedTicketItem.notes = notes;
        } else if (this.state && this.state.selectedTicketItem) {
            selectedTicketItem = this.state.selectedTicketItem;
            selectedTicketItem.notes = notes;
        } else {
            console.warn("No se encontró el ítem seleccionado");
            return;
        }
        
        // Verificar si el platillo es un combo especial
        var isSpecialCombo = (selectedTicketItem.category === 'combos' && 
                             Avika.config.specialCombos.indexOf(selectedTicketItem.dish) !== -1);
        
        // Agregar al ticket actual
        var ticketItem = {
            category: selectedTicketItem.category,
            dish: selectedTicketItem.dish,
            quantity: selectedTicketItem.quantity,
            notes: selectedTicketItem.notes,
            isSpecialCombo: isSpecialCombo
        };
        
        // Agregar al array de items del ticket
        if (Avika.ui && Avika.ui.state) {
            if (!Array.isArray(Avika.ui.state.ticketItems)) {
                Avika.ui.state.ticketItems = [];
            }
            Avika.ui.state.ticketItems.push(ticketItem);
        } else {
            this.state = this.state || {};
            if (!Array.isArray(this.state.ticketItems)) {
                this.state.ticketItems = [];
            }
            this.state.ticketItems.push(ticketItem);
        }
        
        // Actualizar lista de items
        this.updateTicketItemsList();
        
        // Cerrar modal de selección
        var modal = document.getElementById('item-selection-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Habilitar botón de guardar si hay items
        var saveButton = document.getElementById('btn-save-ticket');
        if (saveButton) {
            saveButton.disabled = false;
        }
    },
    
    updateTicketItemsList: function() {
        var ticketItems;
        
        // Obtener los items del ticket desde el estado correspondiente
        if (Avika.ui && Avika.ui.state && Array.isArray(Avika.ui.state.ticketItems)) {
            ticketItems = Avika.ui.state.ticketItems;
        } else if (this.state && Array.isArray(this.state.ticketItems)) {
            ticketItems = this.state.ticketItems;
        } else {
            console.warn("No se encontraron items del ticket");
            return;
        }
        
        var container = document.getElementById('ticket-items-list');
        if (!container) {
            console.warn("Contenedor de items del ticket no encontrado");
            return;
        }
        
        container.innerHTML = '';
        
        ticketItems.forEach(function(item, index) {
            var itemElement = document.createElement('div');
            itemElement.className = 'ticket-item';
            itemElement.innerHTML = `
                <div class="ticket-item-info">
                    <span class="ticket-item-name">${item.dish} ${item.quantity > 1 ? '(' + item.quantity + ')' : ''}</span>
                    <span class="ticket-item-category">${Avika.config.categoryNames[item.category]}</span>
                    ${item.notes ? '<span class="ticket-item-notes">Notas: ' + item.notes + '</span>' : ''}
                </div>
                <button class="ticket-item-remove" data-index="${index}">×</button>
            `;
            container.appendChild(itemElement);
        });
        
        // Actualizar contador
        var countEl = document.getElementById('ticket-count');
        if (countEl) {
            countEl.textContent = ticketItems.length;
        }
        
        // Agregar eventos para remover items
        var removeBtns = container.querySelectorAll('.ticket-item-remove');
        removeBtns.forEach(function(btn) {
            btn.onclick = function() {
                var index = parseInt(this.getAttribute('data-index'));
                Avika.orderService.removeTicketItem(index);
            };
        });
    },
    
    removeTicketItem: function(index) {
        // Eliminar el item del array correspondiente
        if (Avika.ui && Avika.ui.state && Array.isArray(Avika.ui.state.ticketItems)) {
            Avika.ui.state.ticketItems.splice(index, 1);
        } else if (this.state && Array.isArray(this.state.ticketItems)) {
            this.state.ticketItems.splice(index, 1);
        } else {
            console.warn("No se encontraron items del ticket para eliminar");
            return;
        }
        
        // Actualizar la vista
        this.updateTicketItemsList();
        
        // Deshabilitar botón de guardar si no hay items
        var ticketItems = (Avika.ui && Avika.ui.state) ? 
                          Avika.ui.state.ticketItems : 
                          (this.state ? this.state.ticketItems : []);
        
        var saveButton = document.getElementById('btn-save-ticket');
        if (saveButton) {
            saveButton.disabled = (ticketItems.length === 0);
        }
    },
    
    // Función para aplicar filtros a la tabla de órdenes pendientes
    aplicarFiltros: function() {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.aplicarFiltros === 'function') {
            return Avika.ui.aplicarFiltros();
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var filtroCategoria = document.getElementById('filter-category').value;
        var filtroServicio = document.getElementById('filter-service').value;
        var filtroTiempo = parseInt(document.getElementById('filter-time').value);
        
        var filas = document.querySelectorAll('#pending-body tr');
        var totalFiltrado = 0;
        var totalFilas = filas.length;
        
        filas.forEach(function(fila) {
            // Obtener datos de la fila para filtrar
            var datosOrden = this.obtenerDatosOrdenDeFila(fila);
            var mostrar = true;
            
            // Filtrar por categoría
            if (filtroCategoria !== 'todos' && datosOrden.categoria !== filtroCategoria) {
                mostrar = false;
            }
            
            // Filtrar por servicio
            if (filtroServicio !== 'todos' && datosOrden.servicio !== filtroServicio) {
                mostrar = false;
            }
            
            // Filtrar por tiempo transcurrido
            if (!isNaN(filtroTiempo) && filtroTiempo > 0) {
                var tiempoTranscurrido = this.calcularTiempoTranscurrido(datosOrden.inicio);
                if (tiempoTranscurrido < filtroTiempo * 60) { // Convertir minutos a segundos
                    mostrar = false;
                }
            }
            
            // Aplicar visibilidad
            if (mostrar) {
                fila.classList.remove('row-filtered');
                totalFiltrado++;
            } else {
                fila.classList.add('row-filtered');
            }
        }.bind(this));
        
        // Mostrar resumen de filtrado
        this.showNotification('Mostrando ' + totalFiltrado + ' de ' + totalFilas + ' platillos', 'info');
    },

    // Función para obtener datos de una orden a partir de una fila
    obtenerDatosOrdenDeFila: function(fila) {
        var id = fila.querySelector('.timer-cell')?.getAttribute('data-id');
        var orden = null;
        
        // Buscar la orden por ID
        if (id) {
            orden = this.findOrderById(id);
        }
        
        if (orden) {
            return {
                id: orden.id,
                platillo: orden.dish,
                categoria: orden.category,
                servicio: orden.serviceType,
                inicio: orden.startTime
            };
        }
        
        // Si no encontramos la orden, extraer datos directamente de la fila
        return {
            platillo: fila.cells[0]?.textContent || '',
            inicio: fila.cells[1]?.textContent || '',
            servicio: this.extraerServicioDeFila(fila),
            categoria: 'unknown'
        };
    },
    
    // Extraer servicio del texto en la celda de detalles
    extraerServicioDeFila: function(fila) {
        var detalles = fila.cells[3]?.textContent || '';
        if (detalles.includes('Comedor')) return 'comedor';
        if (detalles.includes('Domicilio')) return 'domicilio';
        if (detalles.includes('Ordena y')) return 'para-llevar';
        return 'unknown';
    },

    // Calcular tiempo transcurrido en segundos - Usar la versión de ui-controller.js
    calcularTiempoTranscurrido: function(inicioStr) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.calcularTiempoTranscurrido === 'function') {
            return Avika.ui.calcularTiempoTranscurrido(inicioStr);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var inicio;
        
        if (typeof inicioStr === 'string' && inicioStr.includes(':')) {
            // Si es un string de hora (HH:MM:SS)
            var partes = inicioStr.split(':');
            if (partes.length === 3) {
                var ahora = new Date();
                inicio = new Date();
                inicio.setHours(parseInt(partes[0]), parseInt(partes[1]), parseInt(partes[2]));
                
                // Si la hora de inicio es mayor que la actual, asumimos que es de ayer
                if (inicio > ahora) {
                    inicio.setDate(inicio.getDate() - 1);
                }
            } else {
                return 0;
            }
        } else if (inicioStr instanceof Date || (typeof inicioStr === 'string' && !isNaN(new Date(inicioStr).getTime()))) {
            // Si es un objeto Date o un string de fecha válido
            inicio = new Date(inicioStr);
        } else {
            return 0;
        }
        
        return Math.floor((new Date() - inicio) / 1000);
    },

    // Función para limpiar filtros
    limpiarFiltros: function() {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.limpiarFiltros === 'function') {
            return Avika.ui.limpiarFiltros();
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        document.getElementById('filter-category').value = 'todos';
        document.getElementById('filter-service').value = 'todos';
        document.getElementById('filter-time').value = 'todos';
        
        // Mostrar todas las filas
        var filas = document.querySelectorAll('#pending-body tr');
        filas.forEach(function(fila) {
            fila.classList.remove('row-filtered');
        });
        
        this.showNotification('Filtros eliminados', 'info');
    },

    // Función para aplicar filtros a la tabla de reparto
    filtrarReparto: function(tiempoMinutos) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.filtrarReparto === 'function') {
            return Avika.ui.filtrarReparto(tiempoMinutos);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        if (tiempoMinutos === 'todos') {
            this.limpiarFiltrosReparto();
            return;
        }
        
        var filas = document.querySelectorAll('#delivery-body tr');
        var totalFiltrado = 0;
        var totalFilas = filas.length;
        var tiempoLimite = parseInt(tiempoMinutos) * 60; // Convertir a segundos
        
        filas.forEach(function(fila) {
            var timerCell = fila.querySelector('.delivery-timer, .ready-timer');
            if (!timerCell) return;
            
            var tiempoTexto = timerCell.textContent;
            var partes = tiempoTexto.split(':');
            var tiempoTotal = parseInt(partes[0]) * 3600 + parseInt(partes[1]) * 60 + parseInt(partes[2]);
            
            if (tiempoTotal >= tiempoLimite) {
                fila.classList.remove('row-filtered');
                totalFiltrado++;
            } else {
                fila.classList.add('row-filtered');
            }
        });
        
        this.showNotification('Mostrando ' + totalFiltrado + ' de ' + totalFilas + ' repartos', 'info');
    },
    
    // Función para limpiar filtros de reparto
    limpiarFiltrosReparto: function() {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.limpiarFiltrosReparto === 'function') {
            return Avika.ui.limpiarFiltrosReparto();
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var filas = document.querySelectorAll('#delivery-body tr');
        filas.forEach(function(fila) {
            fila.classList.remove('row-filtered');
        });
        
        this.showNotification('Filtros de reparto eliminados', 'info');
    },

    // Mostrar indicador de carga
    showLoading: function() {
        document.body.classList.add('loading-active');
    },

    // Ocultar indicador de carga
    hideLoading: function() {
        document.body.classList.remove('loading-active');
    },

    // Función para activar/desactivar modo ultra-compacto
    toggleCompactMode: function() {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.toggleCompactMode === 'function') {
            return Avika.ui.toggleCompactMode();
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var body = document.body;
        
        // Verificar si ya está en modo compacto
        var isCompactMode = body.classList.contains('ultra-compact-mode');
        
        if (isCompactMode) {
            // Desactivar modo compacto
            body.classList.remove('ultra-compact-mode');
            document.getElementById('compact-icon').textContent = '🔍';
            localStorage.setItem('avika_compact_mode', 'false');
            this.showNotification('Modo normal activado', 'info');
        } else {
            // Activar modo compacto
            body.classList.add('ultra-compact-mode');
            document.getElementById('compact-icon').textContent = '📱';
            localStorage.setItem('avika_compact_mode', 'true');
            this.showNotification('Modo ultra-compacto activado', 'info');
        }
    },
    
    // Función para mostrar secciones
    showSection: function(sectionId) {
        // Reutilizar la función de Avika.ui para mantener consistencia
        if (Avika.ui && typeof Avika.ui.showSection === 'function') {
            return Avika.ui.showSection(sectionId);
        }
        
        // Implementación de respaldo en caso de que Avika.ui no esté disponible
        var sections = ['categories-section', 'dishes-section', 'preparation-section'];
        
        // Ocultar todas las secciones
        sections.forEach(function(id) {
            var section = document.getElementById(id);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Mostrar la sección requerida
        var targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            console.warn('Sección no encontrada:', sectionId);
        }
    }
};