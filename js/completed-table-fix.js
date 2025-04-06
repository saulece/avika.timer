// Corrección para los problemas de visualización en la tabla de platillos completados
(function() {
    console.log("Aplicando correcciones mejoradas para la tabla de platillos completados...");
    
    // Reemplazar la función updateCompletedTable para mejorar la visualización
    Avika.ui.updateCompletedTable = function(showAll) {
        try {
            console.log("Actualizando tabla de completados (versión mejorada)");
            var completedBody = document.getElementById('completed-body');
            if (!completedBody) return;
            
            // Limpiar la tabla
            completedBody.innerHTML = '';
            
            // Verificar si hay órdenes completadas
            if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                var emptyRow = completedBody.insertRow();
                var emptyCell = emptyRow.insertCell(0);
                emptyCell.colSpan = 5;
                emptyCell.textContent = "No hay platillos completados";
                emptyCell.style.textAlign = "center";
                return;
            }
            
            // Determinar cuántos mostrar
            var ordersToShow = showAll ? 
                Avika.data.completedOrders : 
                Avika.data.completedOrders.slice(0, 20);
            
            // Recorrer órdenes y crear filas
            ordersToShow.forEach(function(order) {
                var row = completedBody.insertRow();
                row.className = 'completed-row';
                
                // Platillo - Columna 1
                var dishCell = row.insertCell(0);
                dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                dishCell.style.maxWidth = '30%';
                dishCell.style.overflow = 'hidden';
                dishCell.style.textOverflow = 'ellipsis';
                
                // Hora de inicio - Columna 2
                var startCell = row.insertCell(1);
                if (order.startTime) {
                    var formatter = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' 
                        ? Avika.dateUtils.formatTime 
                        : (typeof formatTime === 'function' ? formatTime : null);
                    
                    startCell.textContent = formatter 
                        ? formatter(order.startTime) 
                        : new Date(order.startTime).toLocaleTimeString();
                } else {
                    startCell.textContent = '--:--:--';
                }
                
                // Hora de fin - Columna 3
                var endCell = row.insertCell(2);
                if (order.finishTime) {
                    var formatter = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' 
                        ? Avika.dateUtils.formatTime 
                        : (typeof formatTime === 'function' ? formatTime : null);
                    
                    endCell.textContent = formatter 
                        ? formatter(order.finishTime) 
                        : new Date(order.finishTime).toLocaleTimeString();
                } else {
                    endCell.textContent = '--:--:--';
                }
                
                // Tiempo total - Columna 4
                var timeCell = row.insertCell(3);
                timeCell.textContent = order.prepTime || '--:--';
                
                // Colorear según tiempo
                if (order.prepTime) {
                    var parts = order.prepTime.split(':');
                    if (parts.length === 2) {
                        var minutes = parseInt(parts[0]);
                        
                        if (minutes < 5) {
                            timeCell.className = 'time-excellent';
                        } else if (minutes < 10) {
                            timeCell.className = 'time-good';
                        } else if (minutes < 15) {
                            timeCell.className = 'time-warning';
                        } else {
                            timeCell.className = 'time-bad';
                        }
                    }
                }
                
                // Detalles - Columna 5
                var detailsCell = row.insertCell(4);
                detailsCell.style.maxWidth = '30%';
                detailsCell.style.overflow = 'hidden';
                
                // Servicio
                var serviceText = '';
                if (order.service) {
                    switch (order.service) {
                        case 'comedor': serviceText = 'Comedor'; break;
                        case 'domicilio': serviceText = 'Domicilio'; break;
                        case 'para-llevar': serviceText = 'Ordena y Espera'; break;
                        default: serviceText = order.service;
                    }
                }
                
                // Personalización
                var customText = '';
                if (order.customizations && order.customizations.length > 0) {
                    var customizations = [];
                    order.customizations.forEach(function(code) {
                        if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                            customizations.push(Avika.config.customizationOptions[code]);
                        } else {
                            customizations.push(code);
                        }
                    });
                    customText = customizations.join(', ');
                }
                
                // Notas
                var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
                
                // Ticket ID
                var ticketText = order.ticketId ? '<br><small>Ticket: ' + order.ticketId.split('-')[1] + '</small>' : '';
                
                // Combinar toda la información
                detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                      (customText ? '<br>' + customText : '') + 
                                      notesText + 
                                      ticketText;
            });
            
            console.log("Tabla de completados actualizada correctamente");
        } catch (e) {
            console.error("Error al actualizar tabla de completados:", e);
            
            // En caso de error, mostrar mensaje de error en la tabla
            if (completedBody) {
                completedBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Error al cargar datos completados</td></tr>';
            }
        }
    };
    
    // Ejecutar al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        // Actualizar la tabla de completados para aplicar los cambios
        setTimeout(function() {
            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable(false);
            }
        }, 500);
    });
    
    console.log("Correcciones para la tabla de completados aplicadas");
})();