// fix-timeselect.js - Corrección para el selector de hora y startPreparation
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Aplicando corrección para selector de hora...");
        
        if (!window.Avika) window.Avika = {};
        if (!Avika.ui) Avika.ui = {};
        
        // 1. Corregir la función updatePendingTable si todavía no existe
        if (typeof Avika.ui.updatePendingTable !== 'function') {
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
                                if (typeof Avika.ui.completeOrder === 'function') {
                                    Avika.ui.completeOrder(index);
                                }
                            };
                        })(i);
                        
                        actionsCell.appendChild(completeBtn);
                    }
                } catch (e) {
                    console.error("Error al actualizar tabla de pendientes:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error al actualizar tabla: " + e.message);
                    } else {
                        alert("Error al actualizar tabla: " + e.message);
                    }
                }
            };
        }
        
        // 2. Asegurar que updateAllTimers existe
        if (typeof Avika.ui.updateAllTimers !== 'function') {
            Avika.ui.updateAllTimers = function() {
                try {
                    var timerCells = document.querySelectorAll('.timer-cell[data-start-time]');
                    
                    timerCells.forEach(function(cell) {
                        var startTimeStr = cell.getAttribute('data-start-time');
                        if (startTimeStr) {
                            cell.textContent = Avika.ui.calculateElapsedTime(startTimeStr);
                        }
                    });
                } catch (e) {
                    console.error("Error al actualizar temporizadores:", e);
                }
            };
        }
        
        // 3. Implementar una versión simplificada de startPreparation
        if (typeof Avika.ui.startPreparation === 'function') {
            // Hacer backup de la función original
            Avika.ui._originalStartPreparation = Avika.ui.startPreparation;
        }
        
        // Reemplazar con versión simplificada sin selector de hora
        Avika.ui.startPreparation = function() {
            try {
                console.log("Iniciando preparación para platillo:", Avika.data.currentDish);
                
                if (!Avika.data.currentDish) {
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error: No se ha seleccionado un platillo.");
                    }
                    return;
                }
                
                // Obtener notas
                var notes = '';
                var notesInput = document.getElementById('notes-input');
                if (notesInput) {
                    notes = notesInput.value.trim();
                }
                
                // Crear nuevo pedido con la hora actual
                var newOrder = {
                    id: Date.now().toString(),
                    dish: Avika.data.currentDish,
                    category: Avika.data.currentCategory,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations ? Avika.data.currentCustomizations.slice() : [],
                    service: Avika.data.currentService,
                    notes: notes,
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
                if (typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Mostrar notificación
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Platillo agregado a preparación: " + newOrder.dish);
                }
                
                // Volver a categorías
                document.getElementById('categories-section').style.display = 'block';
                document.getElementById('dishes-section').style.display = 'none';
                document.getElementById('preparation-section').style.display = 'none';
            } catch (e) {
                console.error("Error al iniciar preparación:", e);
                if (typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al iniciar preparación: " + e.message);
                } else {
                    alert("Error al iniciar preparación: " + e.message);
                }
            }
        };
        
        // 4. Implementar completeOrder si no existe
        if (typeof Avika.ui.completeOrder !== 'function') {
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
                    if (typeof Avika.ui.updatePendingTable === 'function') {
                        Avika.ui.updatePendingTable();
                    }
                    
                    if (typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable(false);
                    }
                    
                    // Notificar
                    if (typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Platillo '" + order.dish + "' marcado como completado");
                    }
                } catch (e) {
                    console.error("Error al completar orden:", e);
                    if (typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage("Error al completar orden: " + e.message);
                    }
                }
            };
        }
        
        // 5. Reinicializar el botón de inicio
        setTimeout(function() {
            var startBtn = document.getElementById('btn-start');
            if (startBtn) {
                // Eliminar todos los event listeners anteriores
                var newStartBtn = startBtn.cloneNode(true);
                if (startBtn.parentNode) {
                    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
                }
                
                // Agregar nuevo event listener
                newStartBtn.addEventListener('click', function() {
                    console.log("Botón iniciar preparación clicked");
                    Avika.ui.startPreparation();
                });
                
                console.log("Botón de inicio reinicializado");
            }
        }, 500);
        
        console.log("Corrección para selector de hora aplicada");
    });
})();
