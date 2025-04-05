// avika-init.js - Script de inicialización simplificado
window.Avika = window.Avika || {};

// Asegurar que tenemos los objetos básicos
if (!Avika.ui) Avika.ui = {};
if (!Avika.data) {
    Avika.data = {
        currentCategory: '',
        currentDish: '',
        currentCustomizations: [],
        currentService: 'comedor',
        currentQuantity: 1,
        pendingOrders: [],
        completedOrders: []
    };
}

// Funciones básicas que necesitamos
Avika.ui.padZero = function(num) {
    return (num < 10 ? '0' : '') + num;
};

Avika.ui.formatTime = function(date) {
    if (!date) return '--:--:--';
    try {
        var d = new Date(date);
        return Avika.ui.padZero(d.getHours()) + ':' + 
               Avika.ui.padZero(d.getMinutes()) + ':' + 
               Avika.ui.padZero(d.getSeconds());
    } catch (e) {
        return '--:--:--';
    }
};

Avika.ui.calculateElapsedTime = function(startTime) {
    try {
        var start = new Date(startTime);
        var now = new Date();
        var elapsed = Math.floor((now - start) / 1000);
        
        var minutes = Math.floor(elapsed / 60);
        var seconds = elapsed % 60;
        
        return Avika.ui.padZero(minutes) + ':' + Avika.ui.padZero(seconds);
    } catch (e) {
        return '--:--';
    }
};

// Inicializar eventos básicos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado - Iniciando Avika...");
    
    // Inicializar botones de categorías
    document.querySelectorAll('.category-btn').forEach(function(btn) {
        btn.onclick = function() {
            var category = this.getAttribute('data-category');
            console.log("Categoría seleccionada:", category);
            
            // Mostrar sección de platillos
            document.getElementById('categories-section').style.display = 'none';
            document.getElementById('dishes-section').style.display = 'block';
            
            // Actualizar título
            var categoryTitle = document.getElementById('selected-category-title');
            if (categoryTitle && Avika.config && Avika.config.categoryNames) {
                categoryTitle.textContent = Avika.config.categoryNames[category] || category;
            }
            
            // Mostrar platillos de esta categoría
            if (Avika.config && Avika.config.dishes && Avika.config.dishes[category]) {
                var dishesContainer = document.getElementById('dishes-container');
                if (dishesContainer) {
                    dishesContainer.innerHTML = '';
                    
                    Avika.config.dishes[category].forEach(function(dish) {
                        var btn = document.createElement('button');
                        btn.className = 'dish-btn';
                        btn.textContent = dish;
                        
                        btn.onclick = function() {
                            console.log("Platillo seleccionado:", dish);
                            
                            // Guardar platillo seleccionado
                            Avika.data.currentDish = dish;
                            
                            // Mostrar sección de preparación
                            document.getElementById('dishes-section').style.display = 'none';
                            document.getElementById('preparation-section').style.display = 'block';
                            
                            // Actualizar título
                            var dishTitle = document.getElementById('selected-dish-title');
                            if (dishTitle) {
                                dishTitle.textContent = dish;
                            }
                        };
                        
                        dishesContainer.appendChild(btn);
                    });
                }
            }
        };
    });
    
    // Inicializar botón de volver a categorías
    var backBtn = document.getElementById('btn-back-to-categories');
    if (backBtn) {
        backBtn.onclick = function() {
            document.getElementById('categories-section').style.display = 'block';
            document.getElementById('dishes-section').style.display = 'none';
        };
    }
    
    // Inicializar botón de cancelar
    var cancelBtn = document.getElementById('btn-cancel');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            document.getElementById('categories-section').style.display = 'block';
            document.getElementById('preparation-section').style.display = 'none';
        };
    }
    
    // Inicializar botones de servicio
    document.querySelectorAll('#service-options .option-btn').forEach(function(btn) {
        btn.onclick = function() {
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
            console.log("Servicio seleccionado:", service);
        };
    });
    
    // Inicializar botones de cantidad
    var qtyBtns = document.querySelectorAll('.qty-btn');
    qtyBtns.forEach(function(btn, index) {
        btn.onclick = function() {
            var quantityDisplay = document.getElementById('quantity-display');
            var current = parseInt(quantityDisplay.textContent) || 1;
            
            if (index === 0) {
                // Botón -
                if (current > 1) {
                    quantityDisplay.textContent = current - 1;
                    Avika.data.currentQuantity = current - 1;
                }
            } else {
                // Botón +
                if (current < 10) {
                    quantityDisplay.textContent = current + 1;
                    Avika.data.currentQuantity = current + 1;
                }
            }
        };
    });
    
    // Inicializar botón de iniciar preparación
    var startBtn = document.getElementById('btn-start');
    if (startBtn) {
        startBtn.onclick = function() {
            // Crear nuevo pedido
            var newOrder = {
                id: Date.now().toString(),
                dish: Avika.data.currentDish,
                quantity: Avika.data.currentQuantity,
                customizations: Avika.data.currentCustomizations || [],
                service: Avika.data.currentService,
                notes: document.getElementById('notes-input') ? document.getElementById('notes-input').value.trim() : '',
                startTime: new Date()
            };
            
            // Agregar a la lista de pedidos pendientes
            if (!Avika.data.pendingOrders) {
                Avika.data.pendingOrders = [];
            }
            
            Avika.data.pendingOrders.push(newOrder);
            console.log("Pedido añadido:", newOrder);
            
            // Actualizar tabla
            updatePendingTable();
            
            // Guardar datos si está disponible
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Volver a categorías
            document.getElementById('categories-section').style.display = 'block';
            document.getElementById('preparation-section').style.display = 'none';
            
            // Mostrar notificación
            showNotification("Platillo agregado a la lista de preparación");
        };
    }
    
    // Función para actualizar tabla de pendientes
    function updatePendingTable() {
        var pendingBody = document.getElementById('pending-body');
        if (!pendingBody) return;
        
        // Limpiar tabla
        pendingBody.innerHTML = '';
        
        // Actualizar contador
        var pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
        }
        
        // Verificar si hay órdenes pendientes
        if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            var row = pendingBody.insertRow();
            var cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = "No hay platillos en preparación";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            return;
        }
        
        // Mostrar cada orden
        Avika.data.pendingOrders.forEach(function(order, index) {
            var row = pendingBody.insertRow();
            
            // Platillo
            var dishCell = row.insertCell(0);
            dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
            
            // Hora de inicio
            var startCell = row.insertCell(1);
            startCell.textContent = Avika.ui.formatTime(order.startTime);
            
            // Temporizador
            var timerCell = row.insertCell(2);
            timerCell.className = 'timer-cell';
            timerCell.setAttribute('data-start-time', order.startTime);
            timerCell.textContent = Avika.ui.calculateElapsedTime(order.startTime);
            
            // Detalles
            var detailsCell = row.insertCell(3);
            
            // Servicio
            var serviceText = '';
            switch (order.service) {
                case 'comedor': serviceText = 'Comedor'; break;
                case 'domicilio': serviceText = 'Domicilio'; break;
                case 'para-llevar': serviceText = 'Ordena y Espera'; break;
                default: serviceText = order.service;
            }
            
            // Personalización
            var customText = '';
            if (order.customizations && order.customizations.length > 0) {
                order.customizations.forEach(function(code) {
                    if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                        customText += Avika.config.customizationOptions[code] + ', ';
                    }
                });
                customText = customText.slice(0, -2); // Eliminar última coma y espacio
            }
            
            // Notas
            var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
            
            // Combinar toda la información
            detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                   (customText ? '<br>' + customText : '') + 
                                   notesText;
            
            // Acciones
            var actionsCell = row.insertCell(4);
            
            // Botón para marcar como completado
            var completeBtn = document.createElement('button');
            completeBtn.textContent = 'Listo';
            completeBtn.className = 'action-btn';
            completeBtn.style.backgroundColor = '#2ecc71';
            completeBtn.style.color = 'white';
            completeBtn.style.border = 'none';
            completeBtn.style.padding = '10px 15px';
            completeBtn.style.borderRadius = '4px';
            completeBtn.style.cursor = 'pointer';
            
            completeBtn.onclick = function() {
                completeOrder(index);
            };
            
            actionsCell.appendChild(completeBtn);
        });
        
        // Configurar intervalo para actualizar temporizadores
        if (window.timerInterval) {
            clearInterval(window.timerInterval);
        }
        
        window.timerInterval = setInterval(function() {
            updateTimers();
        }, 1000);
    }
    
    // Función para actualizar temporizadores
    function updateTimers() {
        document.querySelectorAll('.timer-cell[data-start-time]').forEach(function(cell) {
            var startTime = cell.getAttribute('data-start-time');
            if (startTime) {
                cell.textContent = Avika.ui.calculateElapsedTime(startTime);
            }
        });
    }
    
    // Función para completar orden
    function completeOrder(index) {
        if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
            return;
        }
        
        var order = Avika.data.pendingOrders[index];
        var endTime = new Date();
        
        // Calcular tiempo de preparación
        var startTime = new Date(order.startTime);
        var prepTimeMillis = endTime - startTime;
        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
        var prepMins = Math.floor(prepTimeSecs / 60);
        var prepSecs = prepTimeSecs % 60;
        
        var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs);
        
        // Completar orden
        order.finishTime = endTime;
        order.prepTime = prepTimeFormatted;
        
        // Mover a órdenes completadas
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }
        
        Avika.data.completedOrders.unshift(order);
        
        // Eliminar de órdenes pendientes
        Avika.data.pendingOrders.splice(index, 1);
        
        // Actualizar tablas
        updatePendingTable();
        
        // Guardar datos si está disponible
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Notificar
        showNotification("Platillo '" + order.dish + "' marcado como completado");
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, duration) {
        var notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#2ecc71';
            notification.style.color = 'white';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notification.style.zIndex = '9999';
            notification.style.display = 'none';
            notification.style.transition = 'opacity 0.3s';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '1';
        
        // Ocultar después de un tiempo
        if (window.notificationTimeout) {
            clearTimeout(window.notificationTimeout);
        }
        
        window.notificationTimeout = setTimeout(function() {
            notification.style.opacity = '0';
            setTimeout(function() {
                notification.style.display = 'none';
            }, 300);
        }, duration || 3000);
    }
    
    // Actualizar tabla de pendientes al cargar
    updatePendingTable();
    
    // Cargar datos guardados si es posible
    if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
        Avika.storage.cargarDatosGuardados();
        updatePendingTable();
    }
    
    console.log("Avika inicializado correctamente");
});

// Proporcionar alias globales para funciones de tiempo
window.padZero = Avika.ui.padZero;
window.formatTime = Avika.ui.formatTime;
window.calculateElapsedTime = Avika.ui.calculateElapsedTime;