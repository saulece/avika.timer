// Solución para el error de updatePendingTable
(function() {
    // Esperar a que el DOM esté cargado
    document.addEventListener('DOMContentLoaded', function() {
        // Asegurarnos que el objeto Avika.ui existe
        if (!window.Avika) window.Avika = {};
        if (!Avika.ui) Avika.ui = {};
        
        // Implementar la función updatePendingTable en Avika.ui
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
                
                // Configurar actualización de temporizadores si no existe ya
                if (!Avika.data.timerInterval) {
                    Avika.data.timerInterval = setInterval(function() {
                        Avika.ui.updateAllTimers();
                    }, 1000);
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
        
        // Asegurarse de que updateAllTimers existe también
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
        
        console.log("Corrección updatePendingTable aplicada correctamente");
    });
})();
