// avika-fixes-complete.js - Solución completa para los problemas de Avika
(function() {
    console.log("Aplicando correcciones completas para Avika...");
    
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        // PARTE 1: CORREGIR OBJETOS BÁSICOS
        
        // Asegurar que los objetos básicos existen
        if (!window.Avika) window.Avika = {};
        if (!Avika.ui) Avika.ui = {};
        if (!Avika.data) {
            Avika.data = {
                currentCategory: '',
                currentDish: '',
                currentCustomizations: [],
                currentService: 'comedor',
                currentQuantity: 1,
                isSpecialCombo: false,
                pendingOrders: [],
                completedOrders: [],
                timerInterval: null
            };
        }
        
        // PARTE 2: CORREGIR FUNCIONES DE FORMATO DE TIEMPO
        
        // Corregir la función padZero para no depender del contexto
        Avika.ui.padZero = function(num) {
            return (num < 10 ? '0' : '') + num;
        };
        
        // Función independiente para formatear tiempo
        Avika.ui.formatTime = function(date) {
            if (!date) return '--:--:--';
            
            try {
                // Asegurarnos de que date sea un objeto Date
                var d = date instanceof Date ? date : new Date(date);
                
                if (isNaN(d.getTime())) {
                    console.warn("Fecha inválida:", date);
                    return '--:--:--';
                }
                
                var hours = d.getHours();
                var minutes = d.getMinutes();
                var seconds = d.getSeconds();
                
                // Usar padZero sin depender de this
                var padZero = function(num) { return (num < 10 ? '0' : '') + num; };
                return padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);
            } catch (e) {
                console.error("Error en formatTime:", e);
                return '--:--:--';
            }
        };
        
        // Función para calcular tiempo transcurrido
        Avika.ui.calculateElapsedTime = function(startTimeStr) {
            try {
                var startTime = new Date(startTimeStr);
                var now = new Date();
                var elapsed = Math.floor((now - startTime) / 1000); // en segundos
                
                var hours = Math.floor(elapsed / 3600);
                var minutes = Math.floor((elapsed % 3600) / 60);
                var seconds = elapsed % 60;
                
                var timeStr = '';
                var padZero = function(num) { return (num < 10 ? '0' : '') + num; };
                
                if (hours > 0) {
                    timeStr += hours + 'h ';
                }
                
                timeStr += padZero(minutes) + ':' + padZero(seconds);
                
                return timeStr;
            } catch (e) {
                console.error("Error al calcular tiempo transcurrido:", e);
                return "--:--";
            }
        };
        
        // Crear alias globales para acceso fácil
        window.formatTime = Avika.ui.formatTime;
        window.padZero = Avika.ui.padZero;
        window.calculateElapsedTime = Avika.ui.calculateElapsedTime;
        
        // Alias en el objeto Avika
        Avika.formatTime = Avika.ui.formatTime;
        Avika.padZero = Avika.ui.padZero;
        Avika.calculateElapsedTime = Avika.ui.calculateElapsedTime;
        
        // PARTE 3: CORREGIR FUNCIONES DE UI
        
        // Mostrar notificación
        Avika.ui.showNotification = function(message, duration) {
            console.log("Notificación:", message);
            
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
                notification.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(notification);
            }
            
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.opacity = '1';
            
            if (Avika.ui.notificationTimeout) {
                clearTimeout(Avika.ui.notificationTimeout);
            }
            
            Avika.ui.notificationTimeout = setTimeout(function() {
                notification.style.opacity = '0';
                setTimeout(function() {
                    notification.style.display = 'none';
                }, 300);
            }, duration || 3000);
        };
        
        // Mostrar error
        Avika.ui.showErrorMessage = function(message) {
            console.error("Error:", message);
            
            // Buscar o crear un elemento para mostrar errores
            var errorContainer = document.getElementById('error-message');
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'error-message';
                errorContainer.style.position = 'fixed';
                errorContainer.style.top = '50%';
                errorContainer.style.left = '50%';
                errorContainer.style.transform = 'translate(-50%, -50%)';
                errorContainer.style.backgroundColor = '#e74c3c';
                errorContainer.style.color = 'white';
                errorContainer.style.padding = '15px 20px';
                errorContainer.style.borderRadius = '5px';
                errorContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                errorContainer.style.zIndex = '9999';
                errorContainer.style.maxWidth = '80%';
                errorContainer.style.textAlign = 'center';
                document.body.appendChild(errorContainer);
            }
            
            // Añadir mensaje y botón de cerrar
            errorContainer.innerHTML = '<span id="close-error" style="position:absolute;right:10px;top:10px;cursor:pointer;font-weight:bold;">&times;</span>' +
                                   '<p style="margin:0;">' + message + '</p>';
            
            // Mostrar el error
            errorContainer.style.display = 'block';
            
            // Añadir evento para cerrar
            var closeBtn = document.getElementById('close-error');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    errorContainer.style.display = 'none';
                };
            }
            
            // Auto-ocultar después de 10 segundos
            setTimeout(function() {
                if (errorContainer.style.display !== 'none') {
                    errorContainer.style.display = 'none';
                }
            }, 10000);
        };
        
        // PARTE 4: FUNCIONES PRINCIPALES DE UI
        
        // Seleccionar categoría
        Avika.ui.selectCategory = function(category) {
            console.log("Seleccionando categoría:", category);
            
            try {
                // Guardar categoría seleccionada
                Avika.data.currentCategory = category;
                
                // Actualizar título
                var categoryTitle = document.getElementById('selected-category-title');
                if (categoryTitle) {
                    categoryTitle.textContent = Avika.config.categoryNames[category] || category;
                }
                
                // Limpiar contenedor de platillos
                var dishesContainer = document.getElementById('dishes-container');
                if (!dishesContainer) {
                    console.error("Contenedor de platillos no encontrado");
                    return;
                }
                
                dishesContainer.innerHTML = '';
                
                // Verificar si hay platillos en esta categoría
                if (!Avika.config || !Avika.config.dishes || !Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
                    dishesContainer.innerHTML = '<p style="text-align:center;padding:20px;">No hay platillos en esta categoría</p>';
                    return;
                }
                
                // Agregar botones para cada platillo
                var self = this;
                Avika.config.dishes[category].forEach(function(dish) {
                    var button = document.createElement('button');
                    button.className = 'dish-btn';
                    button.textContent = dish;
                    
                    // Verificar si es combo especial
                    var isSpecial = Avika.config.specialCombos && 
                                  Avika.config.specialCombos.indexOf(dish) !== -1;
                    
                    if (isSpecial) {
                        button.classList.add('special-combo');
                    }
                    
                    // Asignar evento directamente para evitar problemas con this
                    button.addEventListener('click', function() {
                        Avika.ui.selectDish(dish, isSpecial);
                    });
                    
                    dishesContainer.appendChild(button);
                });
                
                // Mostrar sección de platillos
                document.getElementById('categories-section').style.display = 'block';
                document.getElementById('dishes-section').style.display = 'block';
                document.getElementById('preparation-section').style.display = 'none';
            } catch (e) {
                console.error("Error al seleccionar categoría:", e);
                this.showErrorMessage("Error al mostrar platillos: " + e.message);
            }
        };
        
        // Seleccionar platillo
        Avika.ui.selectDish = function(dish, isSpecial) {
            console.log("Seleccionando platillo:", dish, "Especial:", isSpecial);
            
            try {
                // Guardar platillo seleccionado
                Avika.data.currentDish = dish;
                Avika.data.isSpecialCombo = isSpecial || false;
                
                // Actualizar título
                var dishTitle = document.getElementById('selected-dish-title');
                if (dishTitle) {
                    dishTitle.textContent = dish;
                }
                
                // Resetear personalización
                Avika.data.currentCustomizations = [];
                var customizationContainer = document.getElementById('customization-container');
                if (customizationContainer) {
                    customizationContainer.innerHTML = '';
                    
                    // Añadir opciones de personalización
                    if (Avika.config && Avika.config.customizationOptions) {
                        for (var code in Avika.config.customizationOptions) {
                            var option = Avika.config.customizationOptions[code];
                            
                            var button = document.createElement('button');
                            button.className = 'option-btn';
                            button.textContent = option;
                            button.setAttribute('data-code', code);
                            
                            // Usar función anónima para mantener referencia a code
                            (function(currentCode) {
                                button.addEventListener('click', function() {
                                    Avika.ui.toggleCustomization(this, currentCode);
                                });
                            })(code);
                            
                            customizationContainer.appendChild(button);
                        }
                    }
                }
                
                // Resetear cantidad
                Avika.data.currentQuantity = 1;
                var quantityDisplay = document.getElementById('quantity-display');
                if (quantityDisplay) {
                    quantityDisplay.textContent = '1';
                }
                
                // Resetear servicio
                Avika.data.currentService = 'comedor';
                var serviceBtns = document.querySelectorAll('#service-options .option-btn');
                serviceBtns.forEach(function(btn) {
                    btn.classList.remove('selected');
                });
                var btnComedor = document.getElementById('btn-comedor');
                if (btnComedor) {
                    btnComedor.classList.add('selected');
                }
                
                // Limpiar notas
                var notesInput = document.getElementById('notes-input');
                if (notesInput) {
                    notesInput.value = '';
                }
                
                // Mostrar sección de preparación
                document.getElementById('categories-section').style.display = 'none';
                document.getElementById('dishes-section').style.display = 'none';
                document.getElementById('preparation-section').style.display = 'block';
            } catch (e) {
                console.error("Error al seleccionar platillo:", e);
                Avika.ui.showErrorMessage("Error al mostrar opciones de platillo: " + e.message);
            }
        };
        
        // Función para alternar personalización
        Avika.ui.toggleCustomization = function(button, code) {
            try {
                // Verificar si ya está seleccionada
                var index = Avika.data.currentCustomizations.indexOf(code);
                
                if (index === -1) {
                    // Agregar
                    Avika.data.currentCustomizations.push(code);
                    button.classList.add('selected');
                } else {
                    // Quitar
                    Avika.data.currentCustomizations.splice(index, 1);
                    button.classList.remove('selected');
                }
            } catch (e) {
                console.error("Error al toggle personalización:", e);
            }
        };
        
        // Función para cambiar cantidad
        Avika.ui.changeQuantity = function(delta) {
            try {
                var quantityDisplay = document.getElementById('quantity-display');
                if (!quantityDisplay) return;
                
                var currentQuantity = parseInt(quantityDisplay.textContent) || 1;
                var newQuantity = currentQuantity + delta;
                
                // Limitar entre 1 y 10
                newQuantity = Math.max(1, Math.min(10, newQuantity));
                
                // Actualizar display y datos
                quantityDisplay.textContent = newQuantity;
                Avika.data.currentQuantity = newQuantity;
            } catch (e) {
                console.error("Error al cambiar cantidad:", e);
            }
        };
        
        // Función para seleccionar servicio
        Avika.ui.selectService = function(button, service) {
            try {
                console.log("Seleccionando servicio:", service);
                
                // Actualizar estado
                Avika.data.currentService = service;
                
                // Actualizar clases de botones para indicar selección
                var serviceBtns = document.querySelectorAll('#service-options .option-btn');
                serviceBtns.forEach(function(btn) {
                    btn.classList.remove('selected');
                });
                
                if (button) {
                    button.classList.add('selected');
                }
            } catch (e) {
                console.error("Error al seleccionar servicio:", e);
            }
        };
        
        // Iniciar preparación
        Avika.ui.startPreparation = function() {
            try {
                console.log("Iniciando preparación para platillo:", Avika.data.currentDish);
                
                if (!Avika.data.currentDish) {
                    Avika.ui.showErrorMessage("Error: No se ha seleccionado un platillo.");
                    return;
                }
                
                // Crear nuevo pedido
                var newOrder = {
                    id: Date.now().toString(),
                    dish: Avika.data.currentDish,
                    category: Avika.data.currentCategory,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations.slice(),
                    service: Avika.data.currentService,
                    notes: document.getElementById('notes-input') ? document.getElementById('notes-input').value.trim() : '',
                    startTime: new Date(),
                    isSpecialCombo: Avika.data.isSpecialCombo
                };
                
                // Agregar a pendientes
                if (!Avika.data.pendingOrders) {
                    Avika.data.pendingOrders = [];
                }
                
                Avika.data.pendingOrders.push(newOrder);
                
                // Guardar datos
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Actualizar UI
                Avika.ui.updatePendingTable();
                
                // Mostrar notificación
                Avika.ui.showNotification("Platillo agregado a preparación: " + newOrder.dish);
                
                // Volver a categorías
                document.getElementById('categories-section').style.display = 'block';
                document.getElementById('dishes-section').style.display = 'none';
                document.getElementById('preparation-section').style.display = 'none';
            } catch (e) {
                console.error("Error al iniciar preparación:", e);
                Avika.ui.showErrorMessage("Error al iniciar preparación: " + e.message);
            }
        };
        
        // Actualizar tabla de órdenes pendientes
        Avika.ui.updatePendingTable = function() {
            try {
                console.log("Actualizando tabla de órdenes pendientes");
                
                var pendingBody = document.getElementById('pending-body');
                if (!pendingBody) {
                    console.error("Elemento pending-body no encontrado");
                    return;
                }
                
                // Limpiar tabla
                pendingBody.innerHTML = '';
                
                // Verificar si hay órdenes pendientes
                if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                    var row = pendingBody.insertRow();
                    var cell = row.insertCell(0);
                    cell.colSpan = 5;
                    cell.textContent = "No hay platillos en preparación";
                    cell.style.textAlign = "center";
                    cell.style.padding = "20px";
                    
                    // Actualizar contador
                    var pendingCount = document.getElementById('pending-count');
                    if (pendingCount) {
                        pendingCount.textContent = "0";
                    }
                    
                    return;
                }
                
                // Actualizar contador
                var pendingCount = document.getElementById('pending-count');
                if (pendingCount) {
                    pendingCount.textContent = Avika.data.pendingOrders.length;
                }
                
                // Mostrar cada orden
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var order = Avika.data.pendingOrders[i];
                    
                    var row = pendingBody.insertRow();
                    
                    // Platillo
                    var dishCell = row.insertCell(0);
                    dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                    
                    // Hora de inicio
                    var startCell = row.insertCell(1);
                    startCell.textContent = Avika.ui.formatTime(new Date(order.startTime));
                    
                    // Temporizador
                    var timerCell = row.insertCell(2);
                    timerCell.className = 'timer-cell';
                    timerCell.setAttribute('data-start-time', order.startTime instanceof Date ? 
                                          order.startTime.toISOString() : order.startTime);
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
                        for (var j = 0; j < order.customizations.length; j++) {
                            var code = order.customizations[j];
                            if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                                customText += Avika.config.customizationOptions[code] + ', ';
                            }
                        }
                        if (customText) {
                            customText = customText.slice(0, -2); // Eliminar última coma y espacio
                        }
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
                    completeBtn.style.padding = '8px 12px';
                    completeBtn.style.borderRadius = '4px';
                    completeBtn.style.cursor = 'pointer';
                    
                    // Usar IIFE para mantener el índice correcto
                    (function(index) {
                        completeBtn.onclick = function() {
                            Avika.ui.completeOrder(index);
                        };
                    })(i);
                    
                    actionsCell.appendChild(completeBtn);
                }
            } catch (e) {
                console.error("Error al actualizar tabla de pendientes:", e);
                Avika.ui.showErrorMessage("Error al actualizar tabla: " + e.message);
            }
        };
        
        // Completar orden
        Avika.ui.completeOrder = function(index) {
            try {
                console.log("Completando orden en índice:", index);
                
                if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                    console.error("Índice inválido o no hay órdenes pendientes");
                    return;
                }
                
                var order = Avika.data.pendingOrders[index];
                var endTime = new Date();
                
                // Calcular tiempo de preparación
                var startTime = order.startTime instanceof Date ? order.startTime : new Date(order.startTime);
                var prepTimeMillis = endTime - startTime;
                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                var prepMins = Math.floor(prepTimeSecs / 60);
                var prepSecs = prepTimeSecs % 60;
                
                var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs);
                
                // Completar orden
                order.finishTime = endTime;
                order.prepTime = prepTimeFormatted;
                
                // Crear copia para órdenes completadas
                var completedOrder = JSON.parse(JSON.stringify(order));
                
                // Para serializar correctamente las fechas
                if (completedOrder.startTime) {
                    completedOrder.startTimeISO = new Date(order.startTime).toISOString();
                }
                if (completedOrder.finishTime) {
                    completedOrder.finishTimeISO = endTime.toISOString();
                }
                
                // Mover a órdenes completadas
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                Avika.data.completedOrders.unshift(completedOrder);
                
                // Eliminar de órdenes pendientes
                Avika.data.pendingOrders.splice(index, 1);
                
                // Guardar datos
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Actualizar tablas
                Avika.ui.updatePendingTable();
                
                if (typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable(false);
                }
                
                // Notificar
                Avika.ui.showNotification("Platillo '" + order.dish + "' marcado como completado");
            } catch (e) {
                console.error("Error al completar orden:", e);
                Avika.ui.showErrorMessage("Error al completar orden: " + e.message);
            }
        };
        
        // Actualizar todos los temporizadores
        Avika.ui.updateAllTimers = function() {
            try {
                var timerCells = document.querySelectorAll('.timer-cell[data-start-time]');
                
                timerCells.forEach(function(cell) {
                    var startTimeStr = cell.getAttribute('data-start-time');
                    if (startTimeStr) {
                        cell.textContent = Avika.ui.calculateElapsedTime(startTimeStr);
                        
                        // Añadir clases para estilos basados en tiempo
                        var startTime = new Date(startTimeStr);
                        var now = new Date();
                        var elapsedSecs = Math.floor((now - startTime) / 1000);
                        
                        // Reiniciar clases
                        cell.classList.remove('warning', 'alert');
                        
                        // Añadir clases según tiempo transcurrido
                        if (elapsedSecs > 600) { // Más de 10 minutos
                            cell.classList.add('alert');
                        } else if (elapsedSecs > 300) { // Más de 5 minutos
                            cell.classList.add('warning');
                        }
                    }
                });
            } catch (e) {
                console.error("Error al actualizar temporizadores:", e);
            }
        };
        
        // PARTE 5: INICIALIZAR EVENTOS
        
        // Inicializar botones de categoría
        function initCategoryButtons() {
            try {
                console.log("Inicializando botones de categoría...");
                
                var categoryButtons = document.querySelectorAll('.category-btn[data-category]');
                console.log("Encontrados " + categoryButtons.length + " botones de categoría");
                
                categoryButtons.forEach(function(btn) {
                    // Clonar botón para eliminar eventos antiguos
                    var newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Obtener categoría y agregar evento
                    var category = newBtn.getAttribute('data-category');
                    newBtn.addEventListener('click', function() {
                        console.log("Clic en categoría:", category);
                        Avika.ui.selectCategory(category);
                    });
                });
                
                console.log("Botones de categoría inicializados");
                return true;
            } catch (e) {
                console.error("Error al inicializar botones de categoría:", e);
                return false;
            }
        }
        
        // Inicializar botones de servicio
        function initServiceButtons() {
            try {
                var btnComedor = document.getElementById('btn-comedor');
                var btnDomicilio = document.getElementById('btn-domicilio');
                var btnParaLlevar = document.getElementById('btn-para-llevar');
                
                if (btnComedor) {
                    btnComedor.addEventListener('click', function() {
                        Avika.ui.selectService(this, 'comedor');
                    });
                }
                
                if (btnDomicilio) {
                    btnDomicilio.addEventListener('click', function() {
                        Avika.ui.selectService(this, 'domicilio');
                    });
                }
                
                if (btnParaLlevar) {
                    btnParaLlevar.addEventListener('click', function() {
                        Avika.ui.selectService(this, 'para-llevar');
                    });
                }
                
                console.log("Botones de servicio inicializados");
                return true;
            } catch (e) {
                console.error("Error al inicializar botones de servicio:", e);
                return false;
            }
        }
        
        // Inicializar botones de cantidad
        function initQuantityButtons() {
            try {
                var quantityBtns = document.querySelectorAll('.qty-btn');
                
                quantityBtns.forEach(function(btn) {
                    // Clonar botón para eliminar eventos antiguos
                    var newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Agregar nuevo evento según el texto
                    if (newBtn.textContent === '-') {
                        newBtn.addEventListener('click', function() {
                            Avika.ui.changeQuantity(-1);
                        });
                    } else if (newBtn.textContent === '+') {
                        newBtn.addEventListener('click', function() {
                            Avika.ui.changeQuantity(1);
                        });
                    }
                });
                
                console.log("Botones de cantidad inicializados");
                return true;
            } catch (e) {
                console.error("Error al inicializar botones de cantidad:", e);
                return false;
            }
        }
        
        // Inicializar botones de acción
        function initActionButtons() {
            try {
          // Botón iniciar preparación
          var startBtn = document.getElementById('btn-start');
          if (startBtn) {
              // Clonar botón para eliminar eventos antiguos
              var newStartBtn = startBtn.cloneNode(true);
              startBtn.parentNode.replaceChild(newStartBtn, startBtn);
              
              // Agregar nuevo evento
              newStartBtn.addEventListener('click', function() {
                  console.log("Clic en botón iniciar preparación");
                  Avika.ui.startPreparation();
              });
          }
          
          // Botón cancelar
          var cancelBtn = document.getElementById('btn-cancel');
          if (cancelBtn) {
              // Clonar botón para eliminar eventos antiguos
              var newCancelBtn = cancelBtn.cloneNode(true);
              cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
              
              // Agregar nuevo evento
              newCancelBtn.addEventListener('click', function() {
                  console.log("Clic en botón cancelar");
                  document.getElementById('categories-section').style.display = 'block';
                  document.getElementById('preparation-section').style.display = 'none';
              });
          }
          
          // Botón volver a categorías
          var backBtn = document.getElementById('btn-back-to-categories');
          if (backBtn) {
              // Clonar botón para eliminar eventos antiguos
              var newBackBtn = backBtn.cloneNode(true);
              backBtn.parentNode.replaceChild(newBackBtn, backBtn);
              
              // Agregar nuevo evento
              newBackBtn.addEventListener('click', function() {
                  document.getElementById('categories-section').style.display = 'block';
                  document.getElementById('dishes-section').style.display = 'none';
              });
          }
          
          // Botón nuevo ticket
          var newTicketBtn = document.getElementById('btn-new-ticket');
          if (newTicketBtn) {
              // Clonar botón para eliminar eventos antiguos
              var newTicketBtnClone = newTicketBtn.cloneNode(true);
              newTicketBtn.parentNode.replaceChild(newTicketBtnClone, newTicketBtn);
              
              // Agregar nuevo evento
              newTicketBtnClone.addEventListener('click', function() {
                  console.log("Clic en botón Nuevo Ticket");
                  if (typeof Avika.ui.enableTicketMode === 'function') {
                      Avika.ui.enableTicketMode();
                  } else {
                      Avika.ui.showNotification("Función de ticket no implementada aún");
                  }
              });
          }
          
          // Botón desbloquear
          var forceCompleteBtn = document.getElementById('btn-force-complete');
          if (forceCompleteBtn) {
              // Clonar botón para eliminar eventos antiguos
              var newForceBtn = forceCompleteBtn.cloneNode(true);
              forceCompleteBtn.parentNode.replaceChild(newForceBtn, forceCompleteBtn);
              
              // Agregar nuevo evento
              newForceBtn.addEventListener('click', function() {
                  console.log("Clic en botón Desbloquear");
                  if (typeof Avika.ui.showForceCompleteModal === 'function') {
                      Avika.ui.showForceCompleteModal();
                  } else {
                      // Implementación básica para desbloquear
                      if (confirm("¿Estás seguro de forzar la finalización de todos los tickets pendientes?")) {
                          if (Avika.data.pendingOrders && Avika.data.pendingOrders.length > 0) {
                              var pendingCount = Avika.data.pendingOrders.length;
                              
                              // Mover todas las órdenes a completadas
                              Avika.data.pendingOrders.forEach(function(order) {
                                  order.finishTime = new Date();
                                  Avika.data.completedOrders.unshift(order);
                              });
                              
                              // Limpiar órdenes pendientes
                              Avika.data.pendingOrders = [];
                              
                              // Actualizar UI
                              Avika.ui.updatePendingTable();
                              if (typeof Avika.ui.updateCompletedTable === 'function') {
                                  Avika.ui.updateCompletedTable(false);
                              }
                              
                              // Guardar datos
                              if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                  Avika.storage.guardarDatosLocales();
                              }
                              
                              Avika.ui.showNotification(pendingCount + " platillos desbloqueados correctamente");
                          } else {
                              Avika.ui.showNotification("No hay platillos pendientes para desbloquear");
                          }
                      }
                  }
              });
          }
          
          console.log("Botones de acción inicializados");
          return true;
      } catch (e) {
          console.error("Error al inicializar botones de acción:", e);
          return false;
      }
  }
  
  // Inicializar temporizadores
  function initTimers() {
      try {
          // Configurar intervalo para actualizar temporizadores
          if (Avika.data.timerInterval) {
              clearInterval(Avika.data.timerInterval);
          }
          
          Avika.data.timerInterval = setInterval(function() {
              Avika.ui.updateAllTimers();
          }, 1000);
          
          console.log("Temporizadores inicializados");
          return true;
      } catch (e) {
          console.error("Error al inicializar temporizadores:", e);
          return false;
      }
  }
  
  // Inicializar botones para la tabla completados
  function initCompletedTableButtons() {
      try {
          // Botón ver historial completo
          var btnShowAll = document.getElementById('btn-show-all-history');
          if (btnShowAll) {
              btnShowAll.addEventListener('click', function() {
                  if (typeof Avika.ui.updateCompletedTable === 'function') {
                      Avika.ui.updateCompletedTable(true);
                  }
                  
                  // Actualizar clases de botones
                  document.querySelectorAll('.filter-btn').forEach(function(btn) {
                      btn.classList.remove('active');
                  });
                  this.classList.add('active');
              });
          }
          
          // Botón ver recientes
          var btnShowRecent = document.getElementById('btn-show-recent');
          if (btnShowRecent) {
              btnShowRecent.addEventListener('click', function() {
                  if (typeof Avika.ui.updateCompletedTable === 'function') {
                      Avika.ui.updateCompletedTable(false);
                  }
                  
                  // Actualizar clases de botones
                  document.querySelectorAll('.filter-btn').forEach(function(btn) {
                      btn.classList.remove('active');
                  });
                  this.classList.add('active');
              });
          }
          
          // Botón ver promedios
          var btnShowStats = document.getElementById('btn-show-stats');
          if (btnShowStats) {
              btnShowStats.addEventListener('click', function() {
                  if (Avika.stats && typeof Avika.stats.calcularPromedios === 'function') {
                      Avika.stats.calcularPromedios();
                  } else {
                      Avika.ui.showNotification("Función de estadísticas no disponible");
                  }
                  
                  // Actualizar clases de botones
                  document.querySelectorAll('.filter-btn').forEach(function(btn) {
                      btn.classList.remove('active');
                  });
                  this.classList.add('active');
              });
          }
          
          // Botón limpiar historial
          var btnClearHistory = document.getElementById('btn-clear-history');
          if (btnClearHistory) {
              btnClearHistory.addEventListener('click', function() {
                  if (confirm("¿Estás seguro de limpiar todo el historial de pedidos completados?")) {
                      if (Avika.orders && typeof Avika.orders.clearCompletedOrders === 'function') {
                          Avika.orders.clearCompletedOrders();
                      } else {
                          // Implementación básica
                          Avika.data.completedOrders = [];
                          if (typeof Avika.ui.updateCompletedTable === 'function') {
                              Avika.ui.updateCompletedTable(false);
                          }
                          Avika.ui.showNotification("Historial limpiado correctamente");
                      }
                  }
              });
          }
          
          // Botón exportar
          var btnExport = document.getElementById('btn-export');
          if (btnExport) {
              btnExport.addEventListener('click', function() {
                  if (Avika.stats && typeof Avika.stats.exportarDatos === 'function') {
                      Avika.stats.exportarDatos();
                  } else {
                      Avika.ui.showNotification("Función de exportación no disponible");
                  }
              });
          }
          
          console.log("Botones de tabla completados inicializados");
          return true;
      } catch (e) {
          console.error("Error al inicializar botones de tabla completados:", e);
          return false;
      }
  }
  
  // PARTE 6: INICIALIZACIÓN COMPLETA
  
  // Función para inicializar toda la aplicación
  function initializeApp() {
      try {
          console.log("Iniciando inicialización completa de la aplicación...");
          
          // Paso 1: Inicializar botones de categoría
          var categoryButtonsInit = initCategoryButtons();
          
          // Paso 2: Inicializar botones de servicio
          var serviceButtonsInit = initServiceButtons();
          
          // Paso 3: Inicializar botones de cantidad
          var quantityButtonsInit = initQuantityButtons();
          
          // Paso 4: Inicializar botones de acción
          var actionButtonsInit = initActionButtons();
          
          // Paso 5: Inicializar temporizadores
          var timersInit = initTimers();
          
          // Paso 6: Inicializar botones para tabla completados
          var completedTableButtonsInit = initCompletedTableButtons();
          
          // Paso 7: Cargar datos guardados
          if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
              Avika.storage.cargarDatosGuardados();
          }
          
          // Paso 8: Actualizar tablas
          Avika.ui.updatePendingTable();
          if (typeof Avika.ui.updateCompletedTable === 'function') {
              Avika.ui.updateCompletedTable(false);
          }
          
          // Verificar si todo se inicializó correctamente
          if (categoryButtonsInit && serviceButtonsInit && quantityButtonsInit && 
              actionButtonsInit && timersInit && completedTableButtonsInit) {
              console.log("Aplicación inicializada correctamente");
              Avika.ui.showNotification("Aplicación cargada correctamente", 2000);
              return true;
          } else {
              console.warn("Algunos componentes no se inicializaron correctamente");
              return false;
          }
      } catch (e) {
          console.error("Error en la inicialización completa de la aplicación:", e);
          Avika.ui.showErrorMessage("Hubo un problema al inicializar la aplicación: " + e.message);
          return false;
      }
  }
  
  // Iniciar la aplicación completa
  initializeApp();
});
})();