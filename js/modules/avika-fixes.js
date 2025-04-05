// avika-fixes.js - Corrige errores de inicialización
(function() {
    console.log("Aplicando correcciones para Avika...");
    
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        // Corregir error de formatTime
        if (Avika && Avika.ui) {
            // Verificar si las tablas están utilizando 'self' en lugar de 'this'
            var originalUpdatePendingTable = Avika.ui.updatePendingTable;
            Avika.ui.updatePendingTable = function() {
                try {
                    console.log("Ejecutando updatePendingTable corregido");
                    var self = this; // Asegurar que 'self' refiere a 'this'
                    
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
                    
                    // El resto de la función se ejecutará sólo si hay errores
                    originalUpdatePendingTable.call(this);
                } catch (e) {
                    console.error("Error en updatePendingTable:", e);
                    this.showNotification("Error al actualizar tabla: " + e.message);
                    
                    // Mostrar un mensaje de error en la tabla
                    var pendingBody = document.getElementById('pending-body');
                    if (pendingBody) {
                        var row = pendingBody.insertRow();
                        var cell = row.insertCell(0);
                        cell.colSpan = 5;
                        cell.innerHTML = "Error al actualizar tabla.<br>Consulta la consola para más detalles.";
                        cell.style.textAlign = "center";
                        cell.style.padding = "20px";
                        cell.style.color = "red";
                    }
                }
            };
            
            // Corregir la función formatTime que está causando el error
            console.log("Verificando función formatTime");
            if (!Avika.ui.formatTime) {
                Avika.ui.formatTime = function(date) {
                    if (!date) return '--:--:--';
                    
                    var hours = this.padZero(date.getHours());
                    var minutes = this.padZero(date.getMinutes());
                    var seconds = this.padZero(date.getSeconds());
                    return hours + ':' + minutes + ':' + seconds;
                };
            }
            
            // Corregir la función addOrderRow
            Avika.ui.addOrderRow = function(tbody, order, index) {
                var row = tbody.insertRow();
                
                // Platillo
                var dishCell = row.insertCell(0);
                dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
                
                // Hora de inicio
                var startCell = row.insertCell(1);
                startCell.textContent = Avika.ui.formatTime(new Date(order.startTime));
                
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
                    case 'para-llevar': serviceText = 'Ordena y espera'; break;
                    default: serviceText = order.service;
                }
                
                // Personalización
                var customText = '';
                if (order.customizations && order.customizations.length > 0) {
                    order.customizations.forEach(function(code) {
                        if (Avika.config.customizationOptions[code]) {
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
                
                var self = Avika.ui; // Usar directamente Avika.ui en lugar de 'this'
                completeBtn.onclick = function() {
                    self.completeOrder(index);
                };
                
                actionsCell.appendChild(completeBtn);
            };
            
            // Iniciar de nuevo sin depender de self
            console.log("Iniciando Avika con correcciones...");
            // Volver a asignar eventos a los botones de categoría
            var categoryButtons = document.querySelectorAll('.category-btn[data-category]');
            categoryButtons.forEach(function(btn) {
                var category = btn.getAttribute('data-category');
                btn.addEventListener('click', function() {
                    console.log("Clic en categoría:", category);
                    Avika.ui.selectCategory(category);
                });
            });
            
            // Botón de nuevo ticket
            var newTicketBtn = document.getElementById('btn-new-ticket');
            if (newTicketBtn) {
                newTicketBtn.addEventListener('click', function() {
                    console.log("Clic en botón Nuevo Ticket");
                    Avika.ui.enableTicketMode();
                });
            }
        }
        
        console.log("Correcciones aplicadas correctamente");
    });
})();