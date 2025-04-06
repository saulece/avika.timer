// Corrección para los problemas de visualización en la tabla de platillos completados
(function() {
    console.log("Aplicando correcciones para la tabla de platillos completados...");
    
    // Reemplazar la función updateCompletedTable para mejorar la visualización
    Avika.ui.updateCompletedTable = function(showAll) {
        try {
            console.log("Actualizando tabla de completados (versión mejorada)");
            var completedBody = document.getElementById('completed-body');
            if (!completedBody) return;
            
            completedBody.innerHTML = '';
            
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
                
                // Platillo
                var dishCell = row.insertCell(0);
                dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                
                // Hora de inicio
                var startCell = row.insertCell(1);
                startCell.textContent = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' ? 
                                      Avika.dateUtils.formatTime(order.startTime) : 
                                      (typeof formatTime === 'function' ? formatTime(order.startTime) : '--:--:--');
                
                // Hora de fin
                var endCell = row.insertCell(2);
                endCell.textContent = Avika.dateUtils && typeof Avika.dateUtils.formatTime === 'function' ? 
                                    Avika.dateUtils.formatTime(order.finishTime) : 
                                    (typeof formatTime === 'function' ? formatTime(order.finishTime) : '--:--:--');
                
                // Tiempo total
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
                
                // Detalles
                var detailsCell = row.insertCell(4);
                
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
                    order.customizations.forEach(function(code) {
                        if (Avika.config && Avika.config.customizationOptions && Avika.config.customizationOptions[code]) {
                            customText += Avika.config.customizationOptions[code] + ', ';
                        } else {
                            customText += code + ', ';
                        }
                    });
                    customText = customText.slice(0, -2); // Eliminar última coma y espacio
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
            
            // En caso de error, mostrar mensaje
            if (completedBody) {
                completedBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Error al cargar datos completados</td></tr>';
            }
        }
    };
    
    // Eliminar cualquier modal residual al cargar la página
    function removeResidualModals() {
        // Buscar elementos con position:fixed que podrían ser modales residuales
        var fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        
        fixedElements.forEach(function(element) {
            // Verificar si es un modal o notificación no deseada
            if (!element.id || 
                (element.id !== 'ticket-modal' && 
                 element.id !== 'force-complete-modal' && 
                 element.id !== 'help-modal' && 
                 element.id !== 'notification' && 
                 element.id !== 'error-message')) {
                
                console.log("Modal o elemento residual encontrado:", element);
                
                // Verificar si está en la parte inferior
                var rect = element.getBoundingClientRect();
                var windowHeight = window.innerHeight;
                
                if (rect.bottom > windowHeight * 0.7) {
                    console.log("Eliminando modal residual en la parte inferior");
                    
                    // Ocultar primero
                    element.style.display = 'none';
                    
                    // Intentar eliminar
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        });
    }
    
    // Ejecutar al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        // Eliminar modales residuales
        removeResidualModals();
        
        // Configurar comprobación periódica para eliminar modales residuales
        setInterval(removeResidualModals, 5000);
        
        // Actualizar la tabla de completados para aplicar los cambios
        if (typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable(false);
        }
    });
    
    console.log("Correcciones para la tabla de completados aplicadas");
})();