// combo-fix-final.js - Solución completa para los problemas con combos en tickets
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Aplicando solución DEFINITIVA para combos...");
        
        // 1. Asegurar que tenemos los objetos necesarios
        if (!window.Avika) window.Avika = {};
        if (!Avika.orders) Avika.orders = {};
        if (!Avika.ui) Avika.ui = {};
        if (!Avika.data) Avika.data = {};
        
        // 2. Deshabilitar las versiones existentes para evitar conflictos
        if (Avika.orders._originalFinishHotKitchen) {
            console.log("Restableciendo versiones originales...");
        } else {
            // Guardar las originales por si queremos volver a ellas
            Avika.orders._originalFinishHotKitchen = Avika.orders.finishHotKitchen;
            Avika.orders._originalFinishColdKitchen = Avika.orders.finishColdKitchen;
        }
        
        // 3. Implementar nuevas versiones de forma independiente
        
        // Función para marcar cocina caliente como completada
        Avika.orders.finishHotKitchen = function(id) {
            try {
                console.log("VERSIÓN FINAL: Finalizando cocina caliente para ID:", id);
                
                // Asegurar que id es string
                id = id ? id.toString() : "";
                
                // Buscar la orden directamente por el ID
                var order = null;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var pendingId = Avika.data.pendingOrders[i].id ? Avika.data.pendingOrders[i].id.toString() : "";
                    if (pendingId === id) {
                        order = Avika.data.pendingOrders[i];
                        break;
                    }
                }
                
                if (!order) {
                    console.error("No se encontró la orden con ID:", id);
                    Avika.ui.showNotification("Error: No se encontró la orden");
                    return;
                }
                
                // Marcar cocina caliente como completada
                var now = new Date();
                order.hotKitchenFinished = true;
                order.hotKitchenTime = now;
                order.hotKitchenTimeFormatted = Avika.ui.formatTime(now);
                
                // Notificar al usuario
                Avika.ui.showNotification("Cocina caliente completada para " + order.dish);
                
                // Guardar y actualizar la interfaz ANTES de verificar ambas cocinas
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Verificar si ambas cocinas están completadas
                if (order.hotKitchenFinished && order.coldKitchenFinished) {
                    console.log("Ambas cocinas completadas para:", order.dish);
                    
                    // Marcar como completado
                    order.finished = true;
                    order.finishTime = now;
                    order.finishTimeFormatted = Avika.ui.formatTime(now);
                    
                    Avika.ui.showNotification("¡" + order.dish + " completado en ambas cocinas!");
                    
                    // Guardar y actualizar la interfaz nuevamente
                    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                        Avika.storage.guardarDatosLocales();
                    }
                    
                    if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                        Avika.ui.updatePendingTable();
                    }
                }
            } catch (e) {
                console.error("Error al finalizar cocina caliente:", e);
                Avika.ui.showNotification("Error al procesar la cocina caliente: " + e.message);
            }
        };
        
        // Función para marcar cocina fría como completada
        Avika.orders.finishColdKitchen = function(id) {
            try {
                console.log("VERSIÓN FINAL: Finalizando cocina fría para ID:", id);
                
                // Asegurar que id es string
                id = id ? id.toString() : "";
                
                // Buscar la orden directamente por el ID
                var order = null;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var pendingId = Avika.data.pendingOrders[i].id ? Avika.data.pendingOrders[i].id.toString() : "";
                    if (pendingId === id) {
                        order = Avika.data.pendingOrders[i];
                        break;
                    }
                }
                
                if (!order) {
                    console.error("No se encontró la orden con ID:", id);
                    Avika.ui.showNotification("Error: No se encontró la orden");
                    return;
                }
                
                // Marcar cocina fría como completada
                var now = new Date();
                order.coldKitchenFinished = true;
                order.coldKitchenTime = now;
                order.coldKitchenTimeFormatted = Avika.ui.formatTime(now);
                
                // Notificar al usuario
                Avika.ui.showNotification("Cocina fría completada para " + order.dish);
                
                // Guardar y actualizar la interfaz ANTES de verificar ambas cocinas
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Verificar si ambas cocinas están completadas
                if (order.hotKitchenFinished && order.coldKitchenFinished) {
                    console.log("Ambas cocinas completadas para:", order.dish);
                    
                    // Marcar como completado
                    order.finished = true;
                    order.finishTime = now;
                    order.finishTimeFormatted = Avika.ui.formatTime(now);
                    
                    Avika.ui.showNotification("¡" + order.dish + " completado en ambas cocinas!");
                    
                    // Guardar y actualizar la interfaz nuevamente
                    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                        Avika.storage.guardarDatosLocales();
                    }
                    
                    if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                        Avika.ui.updatePendingTable();
                    }
                }
            } catch (e) {
                console.error("Error al finalizar cocina fría:", e);
                Avika.ui.showNotification("Error al procesar la cocina fría: " + e.message);
            }
        };
        
        // 4. Modificar updatePendingTable para mostrar el botón Completar cuando ambas cocinas estén listas
        const originalUpdatePendingTable = Avika.ui.updatePendingTable;
        
        Avika.ui.updatePendingTable = function() {
            // Llamar a la implementación original primero
            if (typeof originalUpdatePendingTable === 'function') {
                originalUpdatePendingTable.call(this);
            }
            
            try {
                var pendingBody = document.getElementById('pending-body');
                if (!pendingBody || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                    return;
                }
                
                // Procesar cada fila
                var rows = pendingBody.querySelectorAll('tr');
                
                for (var i = 0; i < rows.length; i++) {
                    if (i >= Avika.data.pendingOrders.length) continue;
                    
                    var order = Avika.data.pendingOrders[i];
                    var row = rows[i];
                    
                    // Verificar si es un combo que requiere ambas cocinas Y ambas están terminadas
                    if (order.isSpecialCombo && order.hotKitchenFinished && order.coldKitchenFinished) {
                        // Encontrar la celda de acciones
                        var cells = row.querySelectorAll('td');
                        if (cells.length < 5) continue;
                        
                        var actionsCell = cells[4];
                        
                        // Verificar si ya tiene un botón de completar
                        var hasCompleteButton = false;
                        var buttons = actionsCell.querySelectorAll('button');
                        for (var j = 0; j < buttons.length; j++) {
                            if (buttons[j].textContent === 'Completar') {
                                hasCompleteButton = true;
                                break;
                            }
                        }
                        
                        // Si no tiene botón de completar, agregar uno
                        if (!hasCompleteButton) {
                            var completeBtn = document.createElement('button');
                            completeBtn.textContent = 'Completar';
                            completeBtn.className = 'action-btn';
                            completeBtn.style.backgroundColor = '#2ecc71';
                            completeBtn.style.color = 'white';
                            completeBtn.style.border = 'none';
                            completeBtn.style.padding = '8px 12px';
                            completeBtn.style.margin = '4px 2px';
                            completeBtn.style.borderRadius = '4px';
                            completeBtn.style.cursor = 'pointer';
                            
                            // Usar IIFE para mantener el índice correcto
                            (function(index) {
                                completeBtn.onclick = function() {
                                    completeCombo(index);
                                };
                            })(i);
                            
                            actionsCell.appendChild(document.createElement('br'));
                            actionsCell.appendChild(completeBtn);
                        }
                    }
                }
            } catch (e) {
                console.error("Error al actualizar tabla de pendientes:", e);
            }
        };
        
        // 5. Implementar la función para completar el combo
        function completeCombo(index) {
            try {
                console.log("Completando combo en índice:", index);
                
                if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                    console.error("Índice inválido para completar combo");
                    return;
                }
                
                var order = Avika.data.pendingOrders[index];
                
                // Verificar que ambas cocinas estén terminadas
                if (!order.hotKitchenFinished || !order.coldKitchenFinished) {
                    Avika.ui.showNotification("Error: Ambas cocinas deben estar completadas primero");
                    return;
                }
                
                var now = new Date();
                
                // Calcular tiempo total
                var startTime = new Date(order.startTime);
                var totalMs = now - startTime;
                var totalSecs = Math.floor(totalMs / 1000);
                var mins = Math.floor(totalSecs / 60);
                var secs = totalSecs % 60;
                
                var prepTimeFormatted = Avika.ui.padZero(mins) + ':' + Avika.ui.padZero(secs);
                
                // Completar los datos de la orden
                order.finished = true;
                order.finishTime = now;
                order.finishTimeFormatted = Avika.ui.formatTime(now);
                order.prepTime = prepTimeFormatted;
                
                // Crear copia para órdenes completadas
                var completedOrder = JSON.parse(JSON.stringify(order));
                
                // Guardar fechas en formato ISO
                completedOrder.startTimeISO = new Date(order.startTime).toISOString();
                completedOrder.finishTimeISO = now.toISOString();
                if (order.hotKitchenTime) completedOrder.hotKitchenTimeISO = new Date(order.hotKitchenTime).toISOString();
                if (order.coldKitchenTime) completedOrder.coldKitchenTimeISO = new Date(order.coldKitchenTime).toISOString();
                
                // Agregar a completados
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                Avika.data.completedOrders.unshift(completedOrder);
                
                // Eliminar de pendientes
                Avika.data.pendingOrders.splice(index, 1);
                
                // Notificar
                Avika.ui.showNotification("Combo " + order.dish + " completado exitosamente");
                
                // Actualizar tablas
                Avika.ui.updatePendingTable();
                if (typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable(false);
                }
                
                // Guardar datos
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            } catch (e) {
                console.error("Error al completar combo:", e);
                Avika.ui.showNotification("Error al completar combo: " + e.message);
            }
        }
        
        // 6. Verificar orden de carga y agregar diagnóstico
        var scripts = document.querySelectorAll('script');
        var loadedScripts = [];
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src) {
                var parts = src.split('/');
                var filename = parts[parts.length - 1];
                loadedScripts.push(filename);
            }
        }
        
        console.log("Scripts cargados en orden:", loadedScripts.join(', '));
        console.log("Solución DEFINITIVA para combos aplicada correctamente.");
    });
})();
