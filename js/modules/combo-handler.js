// js/modules/notification.js - Gestión centralizada de notificaciones
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    
    // Función unificada de notificación
    Avika.ui.showNotification = function(message, duration) {
        try {
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
        } catch (e) {
            console.error("Error al mostrar notificación:", e);
        }
    };
    
    // Función unificada de error
    Avika.ui.showErrorMessage = function(message) {
        try {
            console.error("Error:", message);
            
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
            
            errorContainer.innerHTML = '<span id="close-error" style="position:absolute;right:10px;top:10px;cursor:pointer;font-weight:bold;">&times;</span>' +
                                   '<p style="margin:0;">' + message + '</p>';
            
            errorContainer.style.display = 'block';
            
            var closeBtn = document.getElementById('close-error');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    errorContainer.style.display = 'none';
                };
            }
            
            setTimeout(function() {
                if (errorContainer.style.display !== 'none') {
                    errorContainer.style.display = 'none';
                }
            }, 10000);
        } catch (e) {
            console.error("Error al mostrar mensaje de error:", e);
            alert("Error: " + message);
        }
    };
    
    console.log("Módulo de notificaciones inicializado");
})();

// js/modules/combo-handler.js - Gestión centralizada de combos especiales
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    if (!Avika.orders) Avika.orders = {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('comboHandler');
    }
    
    // Lista de combos especiales que requieren ambas cocinas
    const SPECIAL_COMBOS = ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima', 'Combo Thai'];
    
    // Función para verificar si es un combo especial
    Avika.orders.isSpecialCombo = function(dishName) {
        return SPECIAL_COMBOS.includes(dishName);
    };
    
    // Override para la función de actualización de tabla pendientes
    // Guardar referencia a la función original si existe
    var originalUpdatePendingTable = null;
    if (typeof Avika.ui.updatePendingTable === 'function') {
        originalUpdatePendingTable = Avika.ui.updatePendingTable;
    }
    
    // Reemplazar con versión mejorada que maneja combos especiales
    Avika.ui.updatePendingTable = function() {
        try {
            // Si no hay función original, usar implementación básica
            if (typeof originalUpdatePendingTable !== 'function') {
                console.warn("No se encontró la función original updatePendingTable");
                
                // Implementación básica
                var pendingBody = document.getElementById('pending-body');
                if (!pendingBody) return;
                
                pendingBody.innerHTML = '';
                
                // Actualizar contador
                var pendingCount = document.getElementById('pending-count');
                if (pendingCount) {
                    pendingCount.textContent = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
                }
                
                if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                    var emptyRow = pendingBody.insertRow();
                    var emptyCell = emptyRow.insertCell(0);
                    emptyCell.colSpan = 5;
                    emptyCell.textContent = "No hay platillos en preparación";
                    emptyCell.style.textAlign = "center";
                    return;
                }
                
                // Renderizar órdenes con manejo especial para combos
                Avika.data.pendingOrders.forEach(function(order, index) {
                    var row = pendingBody.insertRow();
                    
                    // Platillo
                    var dishCell = row.insertCell(0);
                    dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                    
                    // Marcar combos especiales
                    if (SPECIAL_COMBOS.includes(order.dish)) {
                        dishCell.innerHTML += '<br><span style="color:#e74c3c;font-size:0.8em;">Combo Especial</span>';
                    }
                    
                    // Resto de celdas (hora inicio, temporizador, detalles, acciones)
                    // ... (implementación básica)
                });
                
                return;
            }
            
            // Llamar a la función original primero
            originalUpdatePendingTable.call(this);
            
            // Mejoras post-actualización para combos especiales
            var rows = document.querySelectorAll('#pending-body tr');
            rows.forEach(function(row) {
                var dishCell = row.cells[0];
                var dishText = dishCell.textContent;
                
                // Extraer el nombre del platillo (sin la cantidad)
                var dishName = dishText.split(' (')[0];
                
                // Si es un combo especial, añadir indicador visual
                if (SPECIAL_COMBOS.includes(dishName)) {
                    // Evitar duplicar el marcador
                    if (!dishCell.innerHTML.includes('Combo Especial')) {
                        dishCell.innerHTML = dishText + '<br><span style="color:#e74c3c;font-size:0.8em;">Combo Especial</span>';
                    }
                    
                    // Modificar botones de acción para combos especiales
                    var actionCell = row.cells[4];
                    if (actionCell) {
                        // Limpiar contenido actual
                        var originalContent = actionCell.innerHTML;
                        
                        // Solo modificar si no tiene los botones especiales ya
                        if (!originalContent.includes('Frío Listo') && !originalContent.includes('Caliente Listo')) {
                            // Obtener el índice del pedido
                            var orderIndex = Array.from(rows).indexOf(row);
                            
                            // Crear nuevos botones específicos para cocina fría y caliente
                            actionCell.innerHTML = '';
                            
                            // Botón para cocina fría
                            var coldBtn = document.createElement('button');
                            coldBtn.textContent = 'Frío Listo';
                            coldBtn.className = 'action-btn';
                            coldBtn.style.backgroundColor = '#3498db';
                            coldBtn.style.color = 'white';
                            coldBtn.style.margin = '2px';
                            coldBtn.style.padding = '8px 10px';
                            coldBtn.style.fontSize = '0.9em';
                            
                            // Botón para cocina caliente
                            var hotBtn = document.createElement('button');
                            hotBtn.textContent = 'Caliente Listo';
                            hotBtn.className = 'action-btn';
                            hotBtn.style.backgroundColor = '#e74c3c';
                            hotBtn.style.color = 'white';
                            hotBtn.style.margin = '2px';
                            hotBtn.style.padding = '8px 10px';
                            hotBtn.style.fontSize = '0.9em';
                            
                            // Eventos para los botones
                            coldBtn.onclick = function() {
                                Avika.orders.markComboPartComplete(orderIndex, 'frio');
                            };
                            
                            hotBtn.onclick = function() {
                                Avika.orders.markComboPartComplete(orderIndex, 'caliente');
                            };
                            
                            // Añadir botones
                            actionCell.appendChild(coldBtn);
                            actionCell.appendChild(hotBtn);
                            
                            // Si el combo ya tiene alguna parte completada, actualizar botón
                            if (Avika.data.pendingOrders[orderIndex]) {
                                var order = Avika.data.pendingOrders[orderIndex];
                                
                                if (order.coldComplete) {
                                    coldBtn.disabled = true;
                                    coldBtn.style.backgroundColor = '#bdc3c7';
                                    coldBtn.style.cursor = 'default';
                                }
                                
                                if (order.hotComplete) {
                                    hotBtn.disabled = true;
                                    hotBtn.style.backgroundColor = '#bdc3c7';
                                    hotBtn.style.cursor = 'default';
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Error al actualizar tabla de pedidos pendientes:", e);
            
            // En caso de error, intentar usar la función original
            if (typeof originalUpdatePendingTable === 'function') {
                originalUpdatePendingTable.call(this);
            }
        }
    };
    
    // Función para marcar una parte del combo como completada
    Avika.orders.markComboPartComplete = function(orderIndex, part) {
        try {
            if (!Avika.data.pendingOrders || !Avika.data.pendingOrders[orderIndex]) {
                console.error("No se encontró el pedido en el índice:", orderIndex);
                return;
            }
            
            var order = Avika.data.pendingOrders[orderIndex];
            
            // Marcar la parte como completada
            if (part === 'frio') {
                order.coldComplete = true;
            } else if (part === 'caliente') {
                order.hotComplete = true;
            }
            
            // Actualizar la tabla para reflejar los cambios
            Avika.ui.updatePendingTable();
            
            // Guardar el estado actual
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Mostrar notificación
            var partName = part === 'frio' ? 'fría' : 'caliente';
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Cocina " + partName + " completada para " + order.dish);
            }
            
            // Si ambas partes están completas, completar el pedido
            if (order.coldComplete && order.hotComplete) {
                // Usar la función existente para completar pedidos si está disponible
                if (Avika.orders && typeof Avika.orders.completeOrder === 'function') {
                    Avika.orders.completeOrder(orderIndex);
                } else {
                    // Implementación básica de completar pedido
                    order.finishTime = new Date();
                    
                    // Calcular tiempo de preparación
                    var startTime = new Date(order.startTime);
                    var endTime = order.finishTime;
                    var prepTimeMillis = endTime - startTime;
                    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                    
                    // Formato del tiempo de preparación
                    if (Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function') {
                        var tempDate = new Date(prepTimeSecs * 1000 - (new Date().getTimezoneOffset() * 60000));
                        order.prepTime = Avika.dateUtils.formatTime(tempDate);
                    } else {
                        var prepMins = Math.floor(prepTimeSecs / 60);
                        var prepSecs = prepTimeSecs % 60;
                        order.prepTime = (prepMins < 10 ? '0' : '') + prepMins + ':' + (prepSecs < 10 ? '0' : '') + prepSecs;
                    }
                    
                    // Mover a completados
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    Avika.data.completedOrders.unshift(order);
                    
                    // Eliminar de pendientes
                    Avika.data.pendingOrders.splice(orderIndex, 1);
                    
                    // Actualizar interfaz
                    Avika.ui.updatePendingTable();
                    if (typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable(false);
                    }
                    
                    // Guardar datos
                    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                        Avika.storage.guardarDatosLocales();
                    }
                    
                    // Notificar
                    if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Combo " + order.dish + " completado!");
                    }
                }
            }
        } catch (e) {
            console.error("Error al marcar parte del combo como completada:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al procesar el combo: " + e.message);
            }
        }
    };
    
    console.log("Módulo de gestión de combos inicializado");
})();
