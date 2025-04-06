// fix-combo-complete.js - Fix completo para botones de cocina fría/caliente en combos
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Aplicando fix completo para botones de combos...");
        
        // Asegurarse que tenemos los objetos necesarios
        if (!window.Avika) window.Avika = {};
        if (!Avika.orders) Avika.orders = {};
        if (!Avika.ui) Avika.ui = {};
        
        // Lista de combos especiales que requieren ambas cocinas
        const SPECIAL_COMBOS = ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima', 'Combo Thai'];
        
        // Sobrescribir completamente el método de actualización de tabla
        const originalUpdatePendingTable = Avika.ui.updatePendingTable;
        
        Avika.ui.updatePendingTable = function() {
            // Primero llamar al método original si existe
            if (typeof originalUpdatePendingTable === 'function') {
                originalUpdatePendingTable.call(this);
            }
            
            var pendingBody = document.getElementById('pending-body');
            if (!pendingBody || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
                return;
            }
            
            // Volver a crear los botones para combos especiales
            var rows = pendingBody.getElementsByTagName('tr');
            
            for (var i = 0; i < rows.length; i++) {
                if (i >= Avika.data.pendingOrders.length) continue;
                
                var order = Avika.data.pendingOrders[i];
                var row = rows[i];
                
                // Verificar si es un combo especial
                var isSpecial = SPECIAL_COMBOS.includes(order.dish) || order.isSpecialCombo;
                
                if (isSpecial) {
                    // Obtener la celda de acciones
                    var cells = row.getElementsByTagName('td');
                    if (cells.length < 5) continue;
                    
                    var actionsCell = cells[4];
                    
                    // Limpiar la celda
                    actionsCell.innerHTML = '';
                    
                    // Botón para marcar cocina fría como completada
                    var coldBtn = document.createElement('button');
                    coldBtn.textContent = order.coldKitchenFinished ? '✓ Cocina Fría' : 'Cocina Fría';
                    coldBtn.className = 'action-btn';
                    coldBtn.style.backgroundColor = order.coldKitchenFinished ? '#7f8c8d' : '#3498db';
                    coldBtn.style.color = 'white';
                    coldBtn.style.border = 'none';
                    coldBtn.style.padding = '8px 10px';
                    coldBtn.style.margin = '2px';
                    coldBtn.style.borderRadius = '4px';
                    coldBtn.style.cursor = order.coldKitchenFinished ? 'default' : 'pointer';
                    coldBtn.disabled = order.coldKitchenFinished;
                    
                    // Evento para cocina fría
                    (function(orderObj) {
                        coldBtn.onclick = function() {
                            completeColdKitchen(orderObj);
                        };
                    })(order);
                    
                    // Botón para marcar cocina caliente como completada
                    var hotBtn = document.createElement('button');
                    hotBtn.textContent = order.hotKitchenFinished ? '✓ Cocina Caliente' : 'Cocina Caliente';
                    hotBtn.className = 'action-btn';
                    hotBtn.style.backgroundColor = order.hotKitchenFinished ? '#7f8c8d' : '#e74c3c';
                    hotBtn.style.color = 'white';
                    hotBtn.style.border = 'none';
                    hotBtn.style.padding = '8px 10px';
                    hotBtn.style.margin = '2px';
                    hotBtn.style.borderRadius = '4px';
                    hotBtn.style.cursor = order.hotKitchenFinished ? 'default' : 'pointer';
                    hotBtn.disabled = order.hotKitchenFinished;
                    
                    // Evento para cocina caliente
                    (function(orderObj) {
                        hotBtn.onclick = function() {
                            completeHotKitchen(orderObj);
                        };
                    })(order);
                    
                    actionsCell.appendChild(coldBtn);
                    actionsCell.appendChild(document.createElement('br'));
                    actionsCell.appendChild(hotBtn);
                    
                    // Si ambas cocinas están terminadas, agregar botón para completar
                    if (order.hotKitchenFinished && order.coldKitchenFinished) {
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
                        
                        // Evento para completar
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
        };
        
        // Función para marcar cocina fría como completada
        function completeColdKitchen(order) {
            console.log("Completando cocina fría para:", order.dish);
            
            // Marcar cocina fría como terminada
            order.coldKitchenFinished = true;
            order.coldKitchenTime = new Date();
            order.coldKitchenTimeFormatted = Avika.ui.formatTime(order.coldKitchenTime);
            
            // Mostrar notificación
            Avika.ui.showNotification("Cocina fría completada para " + order.dish);
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar UI
            Avika.ui.updatePendingTable();
            
            // Verificar si ambas cocinas están terminadas
            checkBothKitchens(order);
        }
        
        // Función para marcar cocina caliente como completada
        function completeHotKitchen(order) {
            console.log("Completando cocina caliente para:", order.dish);
            
            // Marcar cocina caliente como terminada
            order.hotKitchenFinished = true;
            order.hotKitchenTime = new Date();
            order.hotKitchenTimeFormatted = Avika.ui.formatTime(order.hotKitchenTime);
            
            // Mostrar notificación
            Avika.ui.showNotification("Cocina caliente completada para " + order.dish);
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar UI
            Avika.ui.updatePendingTable();
            
            // Verificar si ambas cocinas están terminadas
            checkBothKitchens(order);
        }
        
        // Verificar si ambas cocinas están completas
        function checkBothKitchens(order) {
            if (order.hotKitchenFinished && order.coldKitchenFinished) {
                Avika.ui.showNotification("Combo " + order.dish + " listo en ambas cocinas. Ahora puede marcarse como completado.");
            }
        }
        
        // Completar combo cuando ambas cocinas están terminadas
        function completeCombo(index) {
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Índice inválido para completar combo");
                return;
            }
            
            var order = Avika.data.pendingOrders[index];
            var now = new Date();
            
            // Si no está terminado en ambas cocinas, mostrar error
            if (!order.hotKitchenFinished || !order.coldKitchenFinished) {
                Avika.ui.showNotification("Error: Debe completar ambas cocinas primero");
                return;
            }
            
            // Marcar como completado
            order.finished = true;
            order.finishTime = now;
            order.finishTimeFormatted = Avika.ui.formatTime(now);
            
            // Calcular tiempo total
            var startTime = new Date(order.startTime);
            var totalMs = now - startTime;
            var totalSecs = Math.floor(totalMs / 1000);
            var mins = Math.floor(totalSecs / 60);
            var secs = totalSecs % 60;
            
            order.prepTime = Avika.ui.padZero(mins) + ':' + Avika.ui.padZero(secs);
            
            // Crear copia para órdenes completadas
            var completedOrder = JSON.parse(JSON.stringify(order));
            
            // Guardar tiempo en ISO para restaurar correctamente
            if (completedOrder.startTime) {
                completedOrder.startTimeISO = new Date(order.startTime).toISOString();
            }
            if (completedOrder.finishTime) {
                completedOrder.finishTimeISO = now.toISOString();
            }
            if (completedOrder.hotKitchenTime) {
                completedOrder.hotKitchenTimeISO = new Date(order.hotKitchenTime).toISOString();
            }
            if (completedOrder.coldKitchenTime) {
                completedOrder.coldKitchenTimeISO = new Date(order.coldKitchenTime).toISOString();
            }
            
            // Agregar a completados
            if (!Avika.data.completedOrders) {
                Avika.data.completedOrders = [];
            }
            Avika.data.completedOrders.unshift(completedOrder);
            
            // Eliminar de pendientes
            Avika.data.pendingOrders.splice(index, 1);
            
            // Mostrar notificación
            Avika.ui.showNotification("¡Combo " + order.dish + " completado con éxito!");
            
            // Actualizar UI y guardar
            Avika.ui.updatePendingTable();
            Avika.ui.updateCompletedTable(false);
            
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
        }
        
        console.log("Fix para botones de cocina aplicado correctamente");
    });
})();
