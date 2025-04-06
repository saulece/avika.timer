/**
 * Controlador de la interfaz de usuario para Avika - Temporizador de Sushi
 */
const UIController = {
    // Referencias a elementos DOM
    elements: {
        categoriesSection: document.getElementById('categories-section'),
        dishesSection: document.getElementById('dishes-section'),
        preparationSection: document.getElementById('preparation-section'),
        pendingBody: document.getElementById('pending-body'),
        completedBody: document.getElementById('completed-body'),
        pendingCount: document.getElementById('pending-count'),
        dishesContainer: document.getElementById('dishes-container'),
        selectedCategoryTitle: document.getElementById('selected-category-title'),
        selectedDishTitle: document.getElementById('selected-dish-title'),
        quantityDisplay: document.getElementById('quantity-display'),
        notesInput: document.getElementById('notes-input'),
        customizationContainer: document.getElementById('customization-container')
    },
    
    // Estado actual
    state: {
        selectedCategory: null,
        selectedDish: null,
        serviceType: 'comedor',
        quantity: 1,
        selectedCustomizations: [],
        ticketMode: false,
        currentTicket: null
    },
    
    /**
     * Inicializa la interfaz de usuario
     */
    init: function() {
        this.bindEvents();
        this.hideAllSections();
        this.elements.categoriesSection.style.display = 'block';
        this.renderPendingOrders();
        this.renderCompletedOrders();
    },
    
    /**
     * Oculta todas las secciones principales
     */
    hideAllSections: function() {
        this.elements.categoriesSection.style.display = 'none';
        this.elements.dishesSection.style.display = 'none';
        this.elements.preparationSection.style.display = 'none';
    },
    
    /**
     * Vincula eventos a elementos de la UI
     */
    bindEvents: function() {
        // Botones de categoría
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.selectCategory(category);
            });
        });
        
        // Botón de volver a categorías
        document.getElementById('btn-back-to-categories').addEventListener('click', () => {
            this.showCategoriesSection();
        });
        
        // Botones de cantidad
        const qtyBtns = document.querySelectorAll('.qty-btn');
        qtyBtns[0].addEventListener('click', () => this.decreaseQuantity());
        qtyBtns[1].addEventListener('click', () => this.increaseQuantity());
        
        // Botones de servicio
        document.getElementById('btn-comedor').addEventListener('click', () => this.selectServiceType('comedor'));
        document.getElementById('btn-domicilio').addEventListener('click', () => this.selectServiceType('domicilio'));
        document.getElementById('btn-para-llevar').addEventListener('click', () => this.selectServiceType('para-llevar'));
        
        // Botones de acción en preparación
        document.getElementById('btn-cancel').addEventListener('click', () => this.cancelPreparation());
        document.getElementById('btn-start').addEventListener('click', () => this.startPreparation());
        
        // Botones de filtro para historia
        document.getElementById('btn-show-all-history').addEventListener('click', () => this.showAllHistory());
        document.getElementById('btn-show-recent').addEventListener('click', () => this.showRecentHistory());
        document.getElementById('btn-show-stats').addEventListener('click', () => this.showStats());
        document.getElementById('btn-show-detailed-stats').addEventListener('click', () => this.showDetailedStats());
        document.getElementById('btn-clear-history').addEventListener('click', () => this.clearHistory());
        
        // Botones de exportación
        document.getElementById('btn-export').addEventListener('click', () => this.exportData());
        document.getElementById('btn-export-enhanced').addEventListener('click', () => this.exportEnhancedData());
        document.getElementById('btn-export-excel').addEventListener('click', () => this.exportExcel());
        
        // Botón de nuevo ticket
        document.getElementById('btn-new-ticket').addEventListener('click', () => this.createNewTicket());
        
        // Botón de forzar completado (emergencia)
        document.getElementById('btn-force-complete').addEventListener('click', () => this.forceComplete());
    },
    
    /**
     * Selecciona una categoría y muestra sus platillos
     * @param {string} category - Categoría seleccionada
     */
    selectCategory: function(category) {
        this.state.selectedCategory = category;
        this.elements.selectedCategoryTitle.textContent = AVIKA_CONFIG.categories[category];
        this.renderDishes(category);
        this.hideAllSections();
        this.elements.dishesSection.style.display = 'block';
    },
    
    /**
     * Renderiza los platillos de una categoría
     * @param {string} category - Categoría de platillos a mostrar
     */
    renderDishes: function(category) {
        const dishes = AVIKA_CONFIG.dishes[category];
        const container = this.elements.dishesContainer;
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Crear botones para cada platillo
        dishes.forEach(dish => {
            const btn = document.createElement('button');
            btn.className = 'dish-btn';
            btn.textContent = dish;
            
            // Si es un combo especial, agregar clase
            if (AVIKA_CONFIG.specialCombos.includes(dish)) {
                btn.classList.add('special-combo');
            }
            
            btn.addEventListener('click', () => this.selectDish(dish));
            container.appendChild(btn);
        });
    },
    
    /**
     * Selecciona un platillo para preparación
     * @param {string} dish - Platillo seleccionado
     */
    selectDish: function(dish) {
        this.state.selectedDish = dish;
        this.state.quantity = 1;
        this.state.selectedCustomizations = [];
        this.elements.selectedDishTitle.textContent = dish;
        this.elements.quantityDisplay.textContent = '1';
        this.elements.notesInput.value = '';
        
        // Resetear botones de servicio
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('btn-comedor').classList.add('selected');
        this.state.serviceType = 'comedor';
        
        // Generar opciones de personalización
        this.renderCustomizationOptions();
        
        // Mostrar sección de preparación
        this.hideAllSections();
        this.elements.preparationSection.style.display = 'block';
    },
    
    /**
     * Renderiza opciones de personalización para el platillo actual
     */
    renderCustomizationOptions: function() {
        const container = this.elements.customizationContainer;
        container.innerHTML = '';
        
        AVIKA_CONFIG.customizations.forEach(customization => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = customization.name;
            btn.setAttribute('data-customization', customization.id);
            
            btn.addEventListener('click', (e) => {
                const customId = e.target.getAttribute('data-customization');
                this.toggleCustomization(customId, e.target);
            });
            
            container.appendChild(btn);
        });
    },
    
    /**
     * Activa/desactiva una personalización
     * @param {string} customizationId - ID de la personalización
     * @param {HTMLElement} button - Botón que se pulsó
     */
    toggleCustomization: function(customizationId, button) {
        const index = this.state.selectedCustomizations.indexOf(customizationId);
        
        if (index === -1) {
            // Añadir personalización
            this.state.selectedCustomizations.push(customizationId);
            button.classList.add('selected');
        } else {
            // Quitar personalización
            this.state.selectedCustomizations.splice(index, 1);
            button.classList.remove('selected');
        }
    },
    
    /**
     * Selecciona el tipo de servicio
     * @param {string} serviceType - Tipo de servicio
     */
    selectServiceType: function(serviceType) {
        this.state.serviceType = serviceType;
        
        // Actualizar UI
        document.querySelectorAll('#service-options .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('btn-' + serviceType).classList.add('selected');
    },
    
    /**
     * Aumenta la cantidad del platillo
     */
    increaseQuantity: function() {
        this.state.quantity++;
        this.elements.quantityDisplay.textContent = this.state.quantity;
    },
    
    /**
     * Disminuye la cantidad del platillo
     */
    decreaseQuantity: function() {
        if (this.state.quantity > 1) {
            this.state.quantity--;
            this.elements.quantityDisplay.textContent = this.state.quantity;
        }
    },
    
    /**
     * Cancela la preparación actual y vuelve a la sección de categorías
     */
    cancelPreparation: function() {
        this.showCategoriesSection();
    },
    
    /**
     * Muestra la sección de categorías
     */
    showCategoriesSection: function() {
        this.hideAllSections();
        this.elements.categoriesSection.style.display = 'block';
    },
    
    /**
     * Inicia la preparación del platillo actual
     */
    startPreparation: function() {
        // Si estamos en modo ticket, añadimos a la cola del ticket
        if (this.state.ticketMode && this.state.currentTicket) {
            this.addToTicket();
            return;
        }
        
        // Crear objeto de orden
        const order = {
            id: Date.now().toString(),
            dish: this.state.selectedDish,
            category: this.state.selectedCategory,
            quantity: this.state.quantity,
            serviceType: this.state.serviceType,
            customizations: this.state.selectedCustomizations,
            notes: this.elements.notesInput.value.trim(),
            startTime: new Date().toISOString(),
            finishTime: null,
            isSpecialCombo: AVIKA_CONFIG.specialCombos.includes(this.state.selectedDish),
            coldKitchenFinishTime: null,
            hotKitchenFinishTime: null,
            deliveryTimeOut: null,
            deliveryTimeArrived: null
        };
        
        // Almacenar en lista de pendientes
        const pendingOrders = StorageService.getPendingOrders();
        pendingOrders.push(order);
        StorageService.savePendingOrders(pendingOrders);
        
        // Actualizar UI
        this.renderPendingOrders();
        this.showNotification('Platillo añadido a la preparación');
        
        // Volver a la sección de categorías
        this.showCategoriesSection();
    },
    
    /**
     * Añade el platillo actual al ticket en creación
     */
    addToTicket: function() {
        // Implementar funcionalidad de tickets
        console.log("Añadiendo al ticket:", this.state.selectedDish);
        
        // Crear objeto de platillo para el ticket
        const orderItem = {
            id: Date.now().toString(),
            dish: this.state.selectedDish,
            category: this.state.selectedCategory,
            quantity: this.state.quantity,
            customizations: this.state.selectedCustomizations,
            notes: this.elements.notesInput.value.trim(),
            isSpecialCombo: AVIKA_CONFIG.specialCombos.includes(this.state.selectedDish)
        };
        
        // Añadir al ticket actual
        this.state.currentTicket.items.push(orderItem);
        
        // Mostrar notificación
        this.showNotification(`${orderItem.dish} añadido al ticket`);
        
        // Volver a la sección de categorías para seguir añadiendo
        this.showCategoriesSection();
    },
    
    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {number} duration - Duración en ms (por defecto 3000)
     */
    showNotification: function(message, duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    },
    
    /**
     * Renderiza las órdenes pendientes en la tabla
     */
    renderPendingOrders: function() {
        const pendingOrders = StorageService.getPendingOrders();
        const tbody = this.elements.pendingBody;
        
        // Actualizar contador
        this.elements.pendingCount.textContent = `(${pendingOrders.length})`;
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Agregar cada orden
        pendingOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Calcular tiempo transcurrido
            const elapsedTime = this.calculateElapsedTime(order.startTime);
            
            // Determinar clase de tiempo
            const timeClass = this.getTimeClass(elapsedTime, order.category);
            
            // Nombre del platillo y cantidad
            let dishCell = document.createElement('td');
            dishCell.innerHTML = `${order.dish} <strong>(x${order.quantity})</strong>`;
            
            // Hora de inicio
            let startCell = document.createElement('td');
            startCell.textContent = new Date(order.startTime).toLocaleTimeString();
            
            // Tiempo transcurrido
            let timeCell = document.createElement('td');
            timeCell.className = `timer-cell ${timeClass}`;
            timeCell.textContent = elapsedTime;
            timeCell.setAttribute('data-order-id', order.id);
            
            // Detalles
            let detailsCell = document.createElement('td');
            
            // Mostrar tipo de servicio
            const serviceName = AVIKA_CONFIG.serviceTypes.find(s => s.id === order.serviceType)?.name || order.serviceType;
            detailsCell.innerHTML = `<strong>${serviceName}</strong>`;
            
            // Mostrar personalizaciones
            if (order.customizations && order.customizations.length > 0) {
                const customNames = order.customizations.map(customId => {
                    const custom = AVIKA_CONFIG.customizations.find(c => c.id === customId);
                    return custom ? custom.name : customId;
                }).join(', ');
                
                detailsCell.innerHTML += `<br><span class="customizations">${customNames}</span>`;
            }
            
            // Mostrar notas
            if (order.notes) {
                detailsCell.innerHTML += `<br><span class="notes">${order.notes}</span>`;
            }
            
            // Acción
            let actionCell = document.createElement('td');
            
            // Para combos especiales, mostrar dos botones
            if (order.isSpecialCombo) {
                // Verificar si alguna cocina ya ha finalizado
                const coldFinished = order.coldKitchenFinishTime !== null;
                const hotFinished = order.hotKitchenFinishTime !== null;
                
                // Botón para cocina fría
                if (!coldFinished) {
                    const coldBtn = document.createElement('button');
                    coldBtn.className = 'finish-btn cold-kitchen';
                    coldBtn.textContent = 'Cocina Fría Lista';
                    coldBtn.addEventListener('click', () => this.finishColdKitchen(order.id));
                    actionCell.appendChild(coldBtn);
                }
                
                // Botón para cocina caliente
                if (!hotFinished) {
                    const hotBtn = document.createElement('button');
                    hotBtn.className = 'finish-btn hot-kitchen';
                    hotBtn.textContent = 'Cocina Caliente Lista';
                    hotBtn.addEventListener('click', () => this.finishHotKitchen(order.id));
                    actionCell.appendChild(hotBtn);
                }
                
                // Si ambas cocinas han terminado, mostrar botón de finalizar
                if (coldFinished && hotFinished) {
                    const finishBtn = document.createElement('button');
                    finishBtn.className = 'finish-btn';
                    finishBtn.textContent = 'Finalizar Platillo';
                    finishBtn.addEventListener('click', () => this.finishOrder(order.id));
                    actionCell.appendChild(finishBtn);
                }
            } else {
                // Para platillos normales, un solo botón de finalizar
                const btn = document.createElement('button');
                btn.className = 'finish-btn';
                
                // Determinar texto según categoría
                if (order.category === 'frio' || order.category === 'entrada-fria') {
                    btn.classList.add('cold-kitchen');
                    btn.textContent = 'Cocina Fría Lista';
                } else {
                    btn.classList.add('hot-kitchen');
                    btn.textContent = 'Cocina Caliente Lista';
                }
                
                btn.addEventListener('click', () => this.finishOrder(order.id));
                actionCell.appendChild(btn);
            }
            
            // Para domicilios, agregar botones adicionales
            if (order.serviceType === 'domicilio') {
                // Si ya está finalizado en cocina pero no ha salido para entrega
                if (order.finishTime && !order.deliveryTimeOut) {
                    const deliveryBtn = document.createElement('button');
                    deliveryBtn.className = 'finish-btn delivery';
                    deliveryBtn.textContent = 'Salió para entrega';
                    deliveryBtn.addEventListener('click', () => this.markDeliveryOut(order.id));
                    actionCell.appendChild(deliveryBtn);
                }
                
                // Si ya salió pero no ha llegado
                if (order.deliveryTimeOut && !order.deliveryTimeArrived) {
                    const arrivedBtn = document.createElement('button');
                    arrivedBtn.className = 'finish-btn delivery-arrived';
                    arrivedBtn.textContent = 'Entregado al cliente';
                    arrivedBtn.addEventListener('click', () => this.markDeliveryArrived(order.id));
                    actionCell.appendChild(arrivedBtn);
                }
            }
            
            // Añadir celdas a la fila
            row.appendChild(dishCell);
            row.appendChild(startCell);
            row.appendChild(timeCell);
            row.appendChild(detailsCell);
            row.appendChild(actionCell);
            
            // Añadir fila a la tabla
            tbody.appendChild(row);
        });
        
        // Si no hay órdenes pendientes, mostrar mensaje
        if (pendingOrders.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5;
            emptyCell.textContent = 'No hay órdenes pendientes';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        }
    },
    
    /**
     * Actualiza los temporizadores de las órdenes pendientes
     */
    updateTimers: function() {
        const pendingOrders = StorageService.getPendingOrders();
        
        pendingOrders.forEach(order => {
            const timerCell = document.querySelector(`.timer-cell[data-order-id="${order.id}"]`);
            
            if (timerCell) {
                const elapsedTime = this.calculateElapsedTime(order.startTime);
                const timeClass = this.getTimeClass(elapsedTime, order.category);
                
                timerCell.textContent = elapsedTime;
                timerCell.className = `timer-cell ${timeClass}`;
            }
        });
    },
    
    /**
     * Calcula el tiempo transcurrido desde una fecha ISO
     * @param {string} startTimeISO - Tiempo de inicio en formato ISO
     * @returns {string} Tiempo transcurrido en formato mm:ss
     */
    calculateElapsedTime: function(startTimeISO) {
        const startTime = new Date(startTimeISO);
        const now = new Date();
        const diffMs = now - startTime;
        const diffSec = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffSec / 60);
        const seconds = diffSec % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Determina la clase CSS para el tiempo según los umbrales
     * @param {string} timeString - Tiempo en formato mm:ss
     * @param {string} category - Categoría del platillo
     * @returns {string} Clase CSS para el tiempo
     */
    getTimeClass: function(timeString, category) {
        const [minutesStr, secondsStr] = timeString.split(':');
        const totalSeconds = parseInt(minutesStr) * 60 + parseInt(secondsStr);
        
        // Obtener tiempo objetivo para la categoría (en minutos, convertir a segundos)
        let targetSeconds = (AVIKA_CONFIG.targetTimes[category] || 10) * 60;
        
        // Calcular porcentaje del tiempo objetivo
        const percentage = (totalSeconds / targetSeconds) * 100;
        
        // Asignar clase según umbrales
        if (percentage < AVIKA_CONFIG.timeThresholds.excellent) {
            return 'time-excellent';
        } else if (percentage < AVIKA_CONFIG.timeThresholds.good) {
            return 'time-good';
        } else if (percentage < AVIKA_CONFIG.timeThresholds.warning) {
            return 'time-warning';
        } else {
            return 'time-bad alert';
        }
    },
    
    /**
     * Finaliza una orden por completo
     * @param {string} orderId - ID de la orden a finalizar
     */
    finishOrder: function(orderId) {
        const pendingOrders = StorageService.getPendingOrders();
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            
            // Establecer tiempo de finalización
            order.finishTime = new Date().toISOString();
            
            // Para platillos normales (no combos especiales), actualizar el tiempo de cocina correspondiente
            if (!order.isSpecialCombo) {
                if (order.category === 'frio' || order.category === 'entrada-fria') {
                    order.coldKitchenFinishTime = order.finishTime;
                } else {
                    order.hotKitchenFinishTime = order.finishTime;
                }
            }
            
            // Si es domicilio, mantenerlo en pendientes hasta que se complete la entrega
            if (order.serviceType === 'domicilio' && !order.deliveryTimeArrived) {
                // Actualizar en la lista de pendientes
                pendingOrders[orderIndex] = order;
                StorageService.savePendingOrders(pendingOrders);
                
                // Actualizar UI
                this.renderPendingOrders();
                this.showNotification('Platillo completado, pendiente de entrega');
                return;
            }
            
            // Eliminar de pendientes
            pendingOrders.splice(orderIndex, 1);
            StorageService.savePendingOrders(pendingOrders);
            
            // Agregar a completados
            StorageService.addCompletedOrder(order);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.renderCompletedOrders();
            this.showNotification('Platillo completado exitosamente');
        }
    },
    
    /**
     * Finaliza la parte de cocina fría para un combo especial
     * @param {string} orderId - ID de la orden
     */
    finishColdKitchen: function(orderId) {
        const pendingOrders = StorageService.getPendingOrders();
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            
            // Establecer tiempo de finalización para cocina fría
            order.coldKitchenFinishTime = new Date().toISOString();
            
            // Actualizar en la lista de pendientes
            pendingOrders[orderIndex] = order;
            StorageService.savePendingOrders(pendingOrders);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.showNotification('Cocina fría completada para este platillo');
            
            // Si ambas cocinas han terminado, finalizar automáticamente
            if (order.coldKitchenFinishTime && order.hotKitchenFinishTime) {
                this.finishOrder(orderId);
            }
        }
    },
    
    /**
     * Finaliza la parte de cocina caliente para un combo especial
     * @param {string} orderId - ID de la orden
     */
    finishHotKitchen: function(orderId) {
        const pendingOrders = StorageService.getPendingOrders();
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            
            // Establecer tiempo de finalización para cocina caliente
            order.hotKitchenFinishTime = new Date().toISOString();
            
            // Actualizar en la lista de pendientes
            pendingOrders[orderIndex] = order;
            StorageService.savePendingOrders(pendingOrders);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.showNotification('Cocina caliente completada para este platillo');
            
            // Si ambas cocinas han terminado, finalizar automáticamente
            if (order.coldKitchenFinishTime && order.hotKitchenFinishTime) {
                this.finishOrder(orderId);
            }
        }
    },
    
    /**
     * Marca un pedido a domicilio como salido para entrega
     * @param {string} orderId - ID de la orden
     */
    markDeliveryOut: function(orderId) {
        const pendingOrders = StorageService.getPendingOrders();
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            
            // Establecer tiempo de salida para entrega
            order.deliveryTimeOut = new Date().toISOString();
            
            // Actualizar en la lista de pendientes
            pendingOrders[orderIndex] = order;
            StorageService.savePendingOrders(pendingOrders);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.showNotification('Pedido salió para entrega');
        }
    },
    
    /**
     * Marca un pedido a domicilio como entregado al cliente
     * @param {string} orderId - ID de la orden
     */
    markDeliveryArrived: function(orderId) {
        const pendingOrders = StorageService.getPendingOrders();
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            const order = pendingOrders[orderIndex];
            
            // Establecer tiempo de llegada
            order.deliveryTimeArrived = new Date().toISOString();
            
            // Eliminar de pendientes
            pendingOrders.splice(orderIndex, 1);
            StorageService.savePendingOrders(pendingOrders);
            
            // Agregar a completados
            StorageService.addCompletedOrder(order);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.renderCompletedOrders();
            this.showNotification('Pedido entregado al cliente');
        }
    },
    
    /**
     * Renderiza las órdenes completadas en la tabla
     * @param {boolean} showAll - Si es true, muestra todas las órdenes. Si es false, solo las recientes.
     */
    renderCompletedOrders: function(showAll = false) {
        let completedOrders = StorageService.getCompletedOrders();
        const tbody = this.elements.completedBody;
        
        // Si no es "mostrar todo", limitar a las más recientes
        if (!showAll) {
            completedOrders = completedOrders.slice(0, AVIKA_CONFIG.maxRecentItems);
        }
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Agregar cada orden completada
        completedOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Nombre del platillo y cantidad
            let dishCell = document.createElement('td');
            dishCell.innerHTML = `${order.dish} <strong>(x${order.quantity})</strong>`;
            
            // Hora de inicio
            let startCell = document.createElement('td');
            startCell.textContent = new Date(order.startTime).toLocaleTimeString();
            
            // Hora de finalización
            let endCell = document.createElement('td');
            endCell.textContent = new Date(order.finishTime).toLocaleTimeString();
            
            // Tiempo total
            let timeCell = document.createElement('td');
            const totalTime = this.calculateTotalTime(order.startTime, order.finishTime);
            const timeClass = this.getTimeClassForCompletedOrder(order);
            timeCell.innerHTML = `<span class="${timeClass}">${totalTime}</span>`;
            
            // Para domicilios, agregar tiempo de entrega
            if (order.serviceType === 'domicilio' && order.deliveryTimeOut && order.deliveryTimeArrived) {
                const deliveryTime = this.calculateTotalTime(order.deliveryTimeOut, order.deliveryTimeArrived);
                timeCell.innerHTML += `<br><small>Entrega: ${deliveryTime}</small>`;
            }
            
            // Detalles
            let detailsCell = document.createElement('td');
            
            // Mostrar tipo de servicio
            const serviceName = AVIKA_CONFIG.serviceTypes.find(s => s.id === order.serviceType)?.name || order.serviceType;
            detailsCell.innerHTML = `<strong>${serviceName}</strong>`;
            
            // Mostrar personalizaciones
            if (order.customizations && order.customizations.length > 0) {
                const customNames = order.customizations.map(customId => {
                    const custom = AVIKA_CONFIG.customizations.find(c => c.id === customId);
                    return custom ? custom.name : customId;
                }).join(', ');
                
                detailsCell.innerHTML += `<br><span class="customizations">${customNames}</span>`;
            }
            
            // Mostrar notas
            if (order.notes) {
                detailsCell.innerHTML += `<br><span class="notes">${order.notes}</span>`;
            }
            
            // Añadir celdas a la fila
            row.appendChild(dishCell);
            row.appendChild(startCell);
            row.appendChild(endCell);
            row.appendChild(timeCell);
            row.appendChild(detailsCell);
            
            // Añadir fila a la tabla
            tbody.appendChild(row);
        });
        
        // Si no hay órdenes completadas, mostrar mensaje
        if (completedOrders.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5;
            emptyCell.textContent = 'No hay órdenes completadas';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        }
    },
    
    /**
     * Calcula el tiempo total entre dos marcas de tiempo
     * @param {string} startTimeISO - Tiempo de inicio en formato ISO
     * @param {string} endTimeISO - Tiempo de fin en formato ISO
     * @returns {string} Tiempo total en formato mm:ss
     */
    calculateTotalTime: function(startTimeISO, endTimeISO) {
        const startTime = new Date(startTimeISO);
        const endTime = new Date(endTimeISO);
        const diffMs = endTime - startTime;
        const diffSec = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffSec / 60);
        const seconds = diffSec % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Determina la clase CSS para una orden completada
     * @param {Object} order - Orden completada
     * @returns {string} Clase CSS para el tiempo
     */
    getTimeClassForCompletedOrder: function(order) {
        // Si no tiene tiempo de finalización, no podemos calcular
        if (!order.finishTime) return '';
        
        const startTime = new Date(order.startTime);
        const endTime = new Date(order.finishTime);
        const diffSec = Math.floor((endTime - startTime) / 1000);
        
        // Obtener tiempo objetivo para la categoría (en minutos, convertir a segundos)
        let targetSeconds = (AVIKA_CONFIG.targetTimes[order.category] || 10) * 60;
        
        // Calcular porcentaje del tiempo objetivo
        const percentage = (diffSec / targetSeconds) * 100;
        
        // Asignar clase según umbrales
        if (percentage < AVIKA_CONFIG.timeThresholds.excellent) {
            return 'time-excellent';
        } else if (percentage < AVIKA_CONFIG.timeThresholds.good) {
            return 'time-good';
        } else if (percentage < AVIKA_CONFIG.timeThresholds.warning) {
            return 'time-warning';
        } else {
            return 'time-bad';
        }
    },
    
    /**
     * Muestra todas las órdenes en el historial
     */
    showAllHistory: function() {
        // Actualizar clases de los botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn-show-all-history').classList.add('active');
        
        // Renderizar todas las órdenes
        this.renderCompletedOrders(true);
    },
    
    /**
     * Muestra solo las órdenes recientes en el historial
     */
    showRecentHistory: function() {
        // Actualizar clases de los botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn-show-recent').classList.add('active');
        
        // Renderizar órdenes recientes
        this.renderCompletedOrders(false);
    },
    
    /**
     * Muestra estadísticas generales
     */
    showStats: function() {
        // Actualizar clases de los botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn-show-stats').classList.add('active');
        
        // Obtener órdenes completadas
        const completedOrders = StorageService.getCompletedOrders();
        
        // Si no hay órdenes, mostrar mensaje
        if (completedOrders.length === 0) {
            this.elements.completedBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay datos para mostrar estadísticas</td></tr>';
            return;
        }
        
        // Calcular estadísticas por categoría
        const statsByCategory = {};
        
        // Inicializar estadísticas para cada categoría
        Object.keys(AVIKA_CONFIG.categories).forEach(category => {
            statsByCategory[category] = {
                count: 0,
                totalTime: 0,
                averageTime: 0
            };
        });
        
        // Acumular tiempos por categoría
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const category = order.category;
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const diffSec = Math.floor((endTime - startTime) / 1000);
                
                if (statsByCategory[category]) {
                    statsByCategory[category].count++;
                    statsByCategory[category].totalTime += diffSec;
                }
            }
        });
        
        // Calcular promedios
        Object.keys(statsByCategory).forEach(category => {
            if (statsByCategory[category].count > 0) {
                statsByCategory[category].averageTime = Math.floor(statsByCategory[category].totalTime / statsByCategory[category].count);
            }
        });
        
        // Mostrar estadísticas en la tabla
        const tbody = this.elements.completedBody;
        tbody.innerHTML = '';
        
        // Fila de encabezado para las estadísticas
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#f8f9fa';
        
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.style.textAlign = 'center';
        headerCell.style.fontWeight = 'bold';
        headerCell.textContent = 'Estadísticas de tiempos de preparación';
        
        headerRow.appendChild(headerCell);
        tbody.appendChild(headerRow);
        
        // Agregar estadísticas por categoría
        Object.keys(AVIKA_CONFIG.categories).forEach(category => {
            const stats = statsByCategory[category];
            
            if (stats.count > 0) {
                const row = document.createElement('tr');
                
                // Categoría
                const categoryCell = document.createElement('td');
                categoryCell.textContent = AVIKA_CONFIG.categories[category];
                categoryCell.style.fontWeight = 'bold';
                
                // Cantidad
                const countCell = document.createElement('td');
                countCell.textContent = `${stats.count} platillos`;
                
                // Tiempo promedio
                const averageCell = document.createElement('td');
                const minutes = Math.floor(stats.averageTime / 60);
                const seconds = stats.averageTime % 60;
                const avgTimeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Determinar clase de tiempo
                const targetSeconds = (AVIKA_CONFIG.targetTimes[category] || 10) * 60;
                const percentage = (stats.averageTime / targetSeconds) * 100;
                let timeClass = '';
                
                if (percentage < AVIKA_CONFIG.timeThresholds.excellent) {
                    timeClass = 'time-excellent';
                } else if (percentage < AVIKA_CONFIG.timeThresholds.good) {
                    timeClass = 'time-good';
                } else if (percentage < AVIKA_CONFIG.timeThresholds.warning) {
                    timeClass = 'time-warning';
                } else {
                    timeClass = 'time-bad';
                }
                
                averageCell.innerHTML = `<span class="${timeClass}">${avgTimeStr}</span>`;
                
                // Tiempo objetivo
                const targetCell = document.createElement('td');
                const targetMinutes = AVIKA_CONFIG.targetTimes[category];
                targetCell.textContent = `${targetMinutes}:00 (objetivo)`;
                
                // Diferencia
                const diffCell = document.createElement('td');
                const diffPercentage = Math.round(percentage);
                let diffText = '';
                
                if (diffPercentage <= 100) {
                    diffText = `<span class="time-excellent">${diffPercentage}% del objetivo</span>`;
                } else {
                    diffText = `<span class="time-bad">${diffPercentage}% del objetivo</span>`;
                }
                
                diffCell.innerHTML = diffText;
                
                // Añadir celdas a la fila
                row.appendChild(categoryCell);
                row.appendChild(countCell);
                row.appendChild(averageCell);
                row.appendChild(targetCell);
                row.appendChild(diffCell);
                
                // Añadir fila a la tabla
                tbody.appendChild(row);
            }
        });
        
        // Estadísticas por tipo de servicio
        const statsByService = {};
        
        // Inicializar estadísticas para cada tipo de servicio
        AVIKA_CONFIG.serviceTypes.forEach(service => {
            statsByService[service.id] = {
                count: 0,
                totalTime: 0,
                averageTime: 0
            };
        });
        
        // Acumular tiempos por tipo de servicio
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const serviceType = order.serviceType;
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const diffSec = Math.floor((endTime - startTime) / 1000);
                
                if (statsByService[serviceType]) {
                    statsByService[serviceType].count++;
                    statsByService[serviceType].totalTime += diffSec;
                }
            }
        });
        
        // Calcular promedios
        Object.keys(statsByService).forEach(service => {
            if (statsByService[service].count > 0) {
                statsByService[service].averageTime = Math.floor(statsByService[service].totalTime / statsByService[service].count);
            }
        });
        
        // Agregar separador
        const separatorRow = document.createElement('tr');
        separatorRow.style.backgroundColor = '#f8f9fa';
        
        const separatorCell = document.createElement('td');
        separatorCell.colSpan = 5;
        separatorCell.style.textAlign = 'center';
        separatorCell.style.fontWeight = 'bold';
        separatorCell.textContent = 'Estadísticas por tipo de servicio';
        
        separatorRow.appendChild(separatorCell);
        tbody.appendChild(separatorRow);
        
        // Agregar estadísticas por tipo de servicio
        AVIKA_CONFIG.serviceTypes.forEach(service => {
            const stats = statsByService[service.id];
            
            if (stats.count > 0) {
                const row = document.createElement('tr');
                
                // Tipo de servicio
                const serviceCell = document.createElement('td');
                serviceCell.textContent = service.name;
                serviceCell.style.fontWeight = 'bold';
                
                // Cantidad
                const countCell = document.createElement('td');
                countCell.textContent = `${stats.count} platillos`;
                
                // Tiempo promedio
                const averageCell = document.createElement('td');
                const minutes = Math.floor(stats.averageTime / 60);
                const seconds = stats.averageTime % 60;
                averageCell.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Columnas vacías
                const emptyCell1 = document.createElement('td');
                const emptyCell2 = document.createElement('td');
                
                // Añadir celdas a la fila
                row.appendChild(serviceCell);
                row.appendChild(countCell);
                row.appendChild(averageCell);
                row.appendChild(emptyCell1);
                row.appendChild(emptyCell2);
                
                // Añadir fila a la tabla
                tbody.appendChild(row);
            }
        });
        
        // Para domicilios, agregar estadísticas de tiempo de entrega
        const deliveryOrders = completedOrders.filter(order => 
            order.serviceType === 'domicilio' && 
            order.deliveryTimeOut && 
            order.deliveryTimeArrived
        );
        
        if (deliveryOrders.length > 0) {
            let totalDeliveryTime = 0;
            
            deliveryOrders.forEach(order => {
                const outTime = new Date(order.deliveryTimeOut);
                const arriveTime = new Date(order.deliveryTimeArrived);
                totalDeliveryTime += Math.floor((arriveTime - outTime) / 1000);
            });
            
            const avgDeliveryTime = Math.floor(totalDeliveryTime / deliveryOrders.length);
            const deliveryMinutes = Math.floor(avgDeliveryTime / 60);
            const deliverySeconds = avgDeliveryTime % 60;
            
            const deliveryRow = document.createElement('tr');
            
            // Tipo de servicio
            const deliveryCell = document.createElement('td');
            deliveryCell.textContent = 'Tiempo de entrega a domicilio';
            deliveryCell.style.fontWeight = 'bold';
            
            // Cantidad
            const deliveryCountCell = document.createElement('td');
            deliveryCountCell.textContent = `${deliveryOrders.length} entregas`;
            
            // Tiempo promedio
            const deliveryAvgCell = document.createElement('td');
            deliveryAvgCell.textContent = `${deliveryMinutes.toString().padStart(2, '0')}:${deliverySeconds.toString().padStart(2, '0')}`;
            
            // Columnas vacías
            const emptyCell1 = document.createElement('td');
            const emptyCell2 = document.createElement('td');
            
            // Añadir celdas a la fila
            deliveryRow.appendChild(deliveryCell);
            deliveryRow.appendChild(deliveryCountCell);
            deliveryRow.appendChild(deliveryAvgCell);
            deliveryRow.appendChild(emptyCell1);
            deliveryRow.appendChild(emptyCell2);
            
            // Añadir fila a la tabla
            tbody.appendChild(deliveryRow);
        }
    },
    
    /**
     * Limpia el historial de órdenes completadas
     */
    clearHistory: function() {
        if (confirm('¿Estás seguro de que deseas eliminar todo el historial de órdenes completadas? Esta acción no se puede deshacer.')) {
            StorageService.clearCompletedOrders();
            this.renderCompletedOrders();
            this.showNotification('Historial limpiado exitosamente');
        }
    },
    
    /**
     * Exporta los datos a un archivo CSV básico
     */
    exportData: function() {
        const completedOrders = StorageService.getCompletedOrders();
        
        if (completedOrders.length === 0) {
            this.showNotification('No hay datos para exportar', 3000);
            return;
        }
        
        // Crear encabezados CSV
        let csv = 'Platillo,Categoría,Cantidad,Tipo de Servicio,Inicio,Fin,Tiempo Total (segundos),Notas\n';
        
        // Agregar cada orden
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const totalSeconds = Math.floor((endTime - startTime) / 1000);
                
                // Formatear notas para CSV (quitar comas)
                const notes = order.notes ? `"${order.notes.replace(/"/g, '""')}"` : '';
                
                // Agregar línea
                csv += `"${order.dish}",`;
                csv += `${order.category},`;
                csv += `${order.quantity},`;
                csv += `${order.serviceType},`;
                csv += `"${startTime.toLocaleString()}",`;
                csv += `"${endTime.toLocaleString()}",`;
                csv += `${totalSeconds},`;
                csv += `${notes}\n`;
            }
        });
        
        // Descargar CSV
        this.downloadFile(csv, 'avika_datos.csv', 'text/csv');
    },
    
    /**
     * Exporta los datos a un archivo CSV con formato mejorado
     */
    exportEnhancedData: function() {
        const completedOrders = StorageService.getCompletedOrders();
        
        if (completedOrders.length === 0) {
            this.showNotification('No hay datos para exportar', 3000);
            return;
        }
        
        // Crear encabezados CSV con más detalle
        let csv = 'Platillo,Categoría,Tipo,Cantidad,Servicio,Inicio,Fin,';
        csv += 'Tiempo Total (seg),Tiempo Total (mm:ss),';
        csv += 'Cocina Fría Fin,Cocina Caliente Fin,';
        csv += 'Repartidor Salida,Entrega al Cliente,Tiempo Traslado (seg),';
        csv += 'Objetivo (seg),% del Objetivo,Personalizaciones,Notas\n';
        
        // Obtener fecha actual para nombre del archivo
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // formato YYYY-MM-DD
        
        // Agregar cada orden con más detalle
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const totalSeconds = Math.floor((endTime - startTime) / 1000);
                
                // Calcular tiempo en formato mm:ss
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Determinar tipo de platillo
                let dishType = '';
                if (order.category === 'frio') dishType = 'Platillo Frío';
                else if (order.category === 'entrada-fria') dishType = 'Entrada Fría';
                else if (order.category === 'caliente') dishType = 'Platillo Caliente';
                else if (order.category === 'entrada-caliente') dishType = 'Entrada Caliente';
                else if (order.category === 'combos') dishType = 'Combo';
                
                // Formato servicio
                let serviceFormat = '';
                if (order.serviceType === 'comedor') serviceFormat = 'Comedor';
                else if (order.serviceType === 'domicilio') serviceFormat = 'Domicilio';
                else if (order.serviceType === 'para-llevar') serviceFormat = 'Ordena y Espera';
                else serviceFormat = order.serviceType;
                
                // Tiempo objetivo
                const targetMinutes = AVIKA_CONFIG.targetTimes[order.category] || 10;
                const targetSeconds = targetMinutes * 60;
                
                // Porcentaje del objetivo
                const percentage = Math.round((totalSeconds / targetSeconds) * 100);
                
                // Tiempos de cocina fría/caliente
                const coldKitchenTime = order.coldKitchenFinishTime ? new Date(order.coldKitchenFinishTime).toLocaleString() : '';
                const hotKitchenTime = order.hotKitchenFinishTime ? new Date(order.hotKitchenFinishTime).toLocaleString() : '';
                
                // Tiempos de domicilio
                const deliveryOutTime = order.deliveryTimeOut ? new Date(order.deliveryTimeOut).toLocaleString() : '';
                const deliveryArriveTime = order.deliveryTimeArrived ? new Date(order.deliveryTimeArrived).toLocaleString() : '';
                
                // Tiempo de traslado
                let deliveryTimeSeconds = '';
                if (order.deliveryTimeOut && order.deliveryTimeArrived) {
                    const outTime = new Date(order.deliveryTimeOut);
                    const arriveTime = new Date(order.deliveryTimeArrived);
                    deliveryTimeSeconds = Math.floor((arriveTime - outTime) / 1000);
                }
                
                // Formatear personalizaciones
                const customizations = order.customizations && order.customizations.length > 0 
                    ? order.customizations.map(customId => {
                        const custom = AVIKA_CONFIG.customizations.find(c => c.id === customId);
                        return custom ? custom.name : customId;
                    }).join(', ')
                    : '';
                
                // Formatear notas para CSV (quitar comas)
                const notes = order.notes ? `"${order.notes.replace(/"/g, '""')}"` : '';
                
                // Agregar línea
                csv += `"${order.dish}",`;
                csv += `${order.category},`;
                csv += `${dishType},`;
                csv += `${order.quantity},`;
                csv += `${serviceFormat},`;
                csv += `"${startTime.toLocaleString()}",`;
                csv += `"${endTime.toLocaleString()}",`;
                csv += `${totalSeconds},`;
                csv += `"${timeStr}",`;
                csv += `"${coldKitchenTime}",`;
                csv += `"${hotKitchenTime}",`;
                csv += `"${deliveryOutTime}",`;
                csv += `"${deliveryArriveTime}",`;
                csv += `${deliveryTimeSeconds},`;
                csv += `${targetSeconds},`;
                csv += `${percentage},`;
                csv += `"${customizations}",`;
                csv += `${notes}\n`;
            }
        });
        
        // Descargar CSV
        this.downloadFile(csv, `avika_datos_detallados_${dateStr}.csv`, 'text/csv');
    },
    
    /**
     * Exporta los datos a un archivo Excel
     */
    exportExcel: function() {
        const completedOrders = StorageService.getCompletedOrders();
        
        if (completedOrders.length === 0) {
            this.showNotification('No hay datos para exportar', 3000);
            return;
        }
        
        // Crear un libro y una hoja de trabajo
        const wb = XLSX.utils.book_new();
        
        // Preparar datos para Excel
        const data = [];
        
        // Encabezados
        data.push([
            'Platillo', 'Categoría', 'Tipo', 'Cantidad', 'Servicio',
            'Inicio', 'Fin', 'Tiempo Total (seg)', 'Tiempo Total (mm:ss)',
            'Cocina Fría Fin', 'Cocina Caliente Fin',
            'Repartidor Salida', 'Entrega al Cliente', 'Tiempo Traslado (seg)',
            'Objetivo (seg)', '% del Objetivo', 'Personalizaciones', 'Notas'
        ]);
        
        // Agregar cada orden con más detalle
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const totalSeconds = Math.floor((endTime - startTime) / 1000);
                
                // Calcular tiempo en formato mm:ss
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Determinar tipo de platillo
                let dishType = '';
                if (order.category === 'frio') dishType = 'Platillo Frío';
                else if (order.category === 'entrada-fria') dishType = 'Entrada Fría';
                else if (order.category === 'caliente') dishType = 'Platillo Caliente';
                else if (order.category === 'entrada-caliente') dishType = 'Entrada Caliente';
                else if (order.category === 'combos') dishType = 'Combo';
                
                // Formato servicio
                let serviceFormat = '';
                if (order.serviceType === 'comedor') serviceFormat = 'Comedor';
                else if (order.serviceType === 'domicilio') serviceFormat = 'Domicilio';
                else if (order.serviceType === 'para-llevar') serviceFormat = 'Ordena y Espera';
                else serviceFormat = order.serviceType;
                
                // Tiempo objetivo
                const targetMinutes = AVIKA_CONFIG.targetTimes[order.category] || 10;
                const targetSeconds = targetMinutes * 60;
                
                // Porcentaje del objetivo
                const percentage = Math.round((totalSeconds / targetSeconds) * 100);
                
                // Tiempos de cocina fría/caliente
                const coldKitchenTime = order.coldKitchenFinishTime ? new Date(order.coldKitchenFinishTime).toLocaleString() : '';
                const hotKitchenTime = order.hotKitchenFinishTime ? new Date(order.hotKitchenFinishTime).toLocaleString() : '';
                
                // Tiempos de domicilio
                const deliveryOutTime = order.deliveryTimeOut ? new Date(order.deliveryTimeOut).toLocaleString() : '';
                const deliveryArriveTime = order.deliveryTimeArrived ? new Date(order.deliveryTimeArrived).toLocaleString() : '';
                
                // Tiempo de traslado
                let deliveryTimeSeconds = '';
                if (order.deliveryTimeOut && order.deliveryTimeArrived) {
                    const outTime = new Date(order.deliveryTimeOut);
                    const arriveTime = new Date(order.deliveryTimeArrived);
                    deliveryTimeSeconds = Math.floor((arriveTime - outTime) / 1000);
                }
                
                // Formatear personalizaciones
                const customizations = order.customizations && order.customizations.length > 0 
                    ? order.customizations.map(customId => {
                        const custom = AVIKA_CONFIG.customizations.find(c => c.id === customId);
                        return custom ? custom.name : customId;
                    }).join(', ')
                    : '';
                
                // Agregar línea de datos
                data.push([
                    order.dish,
                    order.category,
                    dishType,
                    order.quantity,
                    serviceFormat,
                    startTime.toLocaleString(),
                    endTime.toLocaleString(),
                    totalSeconds,
                    timeStr,
                    coldKitchenTime,
                    hotKitchenTime,
                    deliveryOutTime,
                    deliveryArriveTime,
                    deliveryTimeSeconds,
                    targetSeconds,
                    percentage,
                    customizations,
                    order.notes || ''
                ]);
            }
        });
        
        // Crear hoja de datos
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Obtener fecha actual para nombre del archivo
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // formato YYYY-MM-DD
        
        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Datos Avika");
        
        // Generar archivo y descargar
        XLSX.writeFile(wb, `avika_excel_${dateStr}.xlsx`);
        
        this.showNotification('Datos exportados a Excel exitosamente');
    },
    
    /**
     * Descarga un archivo
     * @param {string} content - Contenido del archivo
     * @param {string} fileName - Nombre del archivo
     * @param {string} contentType - Tipo de contenido
     */
    downloadFile: function(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    
    /**
     * Crea un nuevo ticket/comanda
     */
    createNewTicket: function() {
        // Crear objeto de ticket
        this.state.currentTicket = {
            id: Date.now().toString(),
            items: [],
            serviceType: 'comedor',
            createdAt: new Date().toISOString()
        };
        
        // Activar modo ticket
        this.state.ticketMode = true;
        
        // Redirigir a selección de categoría
        this.showCategoriesSection();
        
        // Mostrar notificación
        this.showNotification('Nuevo ticket creado. Añade platillos.');
        
        // Implementar más adelante la lógica para completar el ticket
        // TODO: Abrir modal de ticket, guardar ticket, etc.
    },
    
    /**
     * Desbloquea órdenes atascadas (emergencia)
     */
    forceComplete: function() {
        if (confirm('¿Estás seguro de que deseas desbloquear todas las órdenes pendientes? Esto marcará como completadas todas las órdenes sin terminar.')) {
            const pendingOrders = StorageService.getPendingOrders();
            
            if (pendingOrders.length === 0) {
                this.showNotification('No hay órdenes pendientes para desbloquear');
                return;
            }
            
            // Marcar todas como completadas
            pendingOrders.forEach(order => {
                if (!order.finishTime) {
                    order.finishTime = new Date().toISOString();
                }
                if (order.isSpecialCombo) {
                    if (!order.coldKitchenFinishTime) {
                        order.coldKitchenFinishTime = order.finishTime;
                    }
                    if (!order.hotKitchenFinishTime) {
                        order.hotKitchenFinishTime = order.finishTime;
                    }
                }
                if (order.serviceType === 'domicilio') {
                    if (!order.deliveryTimeOut) {
                        order.deliveryTimeOut = order.finishTime;
                    }
                    if (!order.deliveryTimeArrived) {
                        order.deliveryTimeArrived = order.finishTime;
                    }
                }
                
                // Agregar a completados
                StorageService.addCompletedOrder(order);
            });
            
            // Limpiar pendientes
            StorageService.savePendingOrders([]);
            
            // Actualizar UI
            this.renderPendingOrders();
            this.renderCompletedOrders();
            
            this.showNotification('Todas las órdenes han sido desbloqueadas y completadas');
        }
    },
    
    /**
     * Muestra estadísticas detalladas por tipo de cocina, platillo, etc.
     */
    showDetailedStats: function() {
        // Actualizar clases de los botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn-show-detailed-stats').classList.add('active');
        
        // Obtener órdenes completadas
        const completedOrders = StorageService.getCompletedOrders();
        
        // Si no hay órdenes, mostrar mensaje
        if (completedOrders.length === 0) {
            this.elements.completedBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay datos para mostrar estadísticas</td></tr>';
            return;
        }
        
        // Estadísticas por platillo
        const statsByDish = {};
        
        // Acumular tiempos por platillo
        completedOrders.forEach(order => {
            if (order.finishTime) {
                const dish = order.dish;
                const startTime = new Date(order.startTime);
                const endTime = new Date(order.finishTime);
                const diffSec = Math.floor((endTime - startTime) / 1000);
                
                if (!statsByDish[dish]) {
                    statsByDish[dish] = {
                        count: 0,
                        totalTime: 0,
                        averageTime: 0,
                        category: order.category
                    };
                }
                
                statsByDish[dish].count++;
                statsByDish[dish].totalTime += diffSec;
            }
        });
        
        // Calcular promedios
        Object.keys(statsByDish).forEach(dish => {
            if (statsByDish[dish].count > 0) {
                statsByDish[dish].averageTime = Math.floor(statsByDish[dish].totalTime / statsByDish[dish].count);
            }
        });
        
        // Mostrar estadísticas en la tabla
        const tbody = this.elements.completedBody;
        tbody.innerHTML = '';
        
        // Fila de encabezado para las estadísticas
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#f8f9fa';
        
        const headerCell = document.createElement('td');
        headerCell.colSpan = 5;
        headerCell.style.textAlign = 'center';
        headerCell.style.fontWeight = 'bold';
        headerCell.textContent = 'Estadísticas detalladas por platillo';
        
        headerRow.appendChild(headerCell);
        tbody.appendChild(headerRow);
        
        // Ordenar platillos por categoría y nombre
        const sortedDishes = Object.keys(statsByDish).sort((a, b) => {
            const catA = statsByDish[a].category;
            const catB = statsByDish[b].category;
            
            if (catA !== catB) {
                return catA.localeCompare(catB);
            }
            
            return a.localeCompare(b);
        });
        
        // Agregar estadísticas por platillo
        let currentCategory = '';
        
        sortedDishes.forEach(dish => {
            const stats = statsByDish[dish];
            
            // Si cambiamos de categoría, agregar encabezado
            if (stats.category !== currentCategory) {
                currentCategory = stats.category;
                
                const categoryRow = document.createElement('tr');
                categoryRow.style.backgroundColor = '#e9ecef';
                
                const categoryCell = document.createElement('td');
                categoryCell.colSpan = 5;
                categoryCell.style.textAlign = 'left';
                categoryCell.style.fontWeight = 'bold';
                categoryCell.textContent = AVIKA_CONFIG.categories[currentCategory];
                
                categoryRow.appendChild(categoryCell);
                tbody.appendChild(categoryRow);
            }
            
            const row = document.createElement('tr');
            
            // Platillo
            const dishCell = document.createElement('td');
            dishCell.textContent = dish;
            
            // Cantidad
            const countCell = document.createElement('td');
            countCell.textContent = `${stats.count} unidades`;
            
            // Tiempo promedio
            const averageCell = document.createElement('td');
            const minutes = Math.floor(stats.averageTime / 60);
            const seconds = stats.averageTime % 60;
            const avgTimeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Determinar clase de tiempo
            const targetSeconds = (AVIKA_CONFIG.targetTimes[stats.category] || 10) * 60;
            const percentage = (stats.averageTime / targetSeconds) * 100;
            let timeClass = '';
            
            if (percentage < AVIKA_CONFIG.timeThresholds.excellent) {
                timeClass = 'time-excellent';
            } else if (percentage < AVIKA_CONFIG.timeThresholds.good) {
                timeClass = 'time-good';
            } else if (percentage < AVIKA_CONFIG.timeThresholds.warning) {
                timeClass = 'time-warning';
            } else {
                timeClass = 'time-bad';
            }
            
            averageCell.innerHTML = `<span class="${timeClass}">${avgTimeStr}</span>`;
            
            // Tiempo objetivo
            const targetCell = document.createElement('td');
            const targetMinutes = AVIKA_CONFIG.targetTimes[stats.category];
            targetCell.textContent = `${targetMinutes}:00 (objetivo)`;
            
            // Diferencia
            const diffCell = document.createElement('td');
            const diffPercentage = Math.round(percentage);
            let diffText = '';
            
            if (diffPercentage <= 100) {
                diffText = `<span class="time-excellent">${diffPercentage}% del objetivo</span>`;
            } else {
                diffText = `<span class="time-bad">${diffPercentage}% del objetivo</span>`;
            }
            
            diffCell.innerHTML = diffText;
            
            // Añadir celdas a la fila
            row.appendChild(dishCell);
            row.appendChild(countCell);
            row.appendChild(averageCell);
            row.appendChild(targetCell);
            row.appendChild(diffCell);
            
            // Añadir fila a la tabla
            tbody.appendChild(row);
        });
    }
}