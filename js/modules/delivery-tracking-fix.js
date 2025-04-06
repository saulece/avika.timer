// js/modules/delivery-tracking-fix.js
// Fix for delivery tracking - Ensures "Salida del repartidor" and "Entrega del pedido" buttons appear after clicking "Listo"

(function() {
    console.log("Aplicando correcciones para seguimiento de entregas a domicilio...");
    
    // Save references to original functions
    var originalCompleteOrder = Avika.orders.completeOrder;
    
    // Override the completeOrder function to handle delivery orders properly
    Avika.orders.completeOrder = function(index) {
        try {
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Índice de pedido inválido:", index);
                return false;
            }
            
            var order = Avika.data.pendingOrders[index];
            
            // Check if this is a delivery order
            if (order.service === 'domicilio') {
                // Mark it as finished but keep it in the pending orders for delivery tracking
                order.finishTime = new Date();
                order.completed = true;
                
                // Calculate preparation time
                var startTime = new Date(order.startTime);
                var endTime = order.finishTime;
                var prepTimeMillis = endTime - startTime;
                var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
                
                // Format preparation time
                var prepMins = Math.floor(prepTimeSecs / 60);
                var prepSecs = prepTimeSecs % 60;
                
                order.prepTime = (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                Avika.dateUtils.padZero(prepMins) : (prepMins < 10 ? '0' : '') + prepMins) + 
                               ':' + 
                               (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                Avika.dateUtils.padZero(prepSecs) : (prepSecs < 10 ? '0' : '') + prepSecs);
                
                // Update the pending table to show the delivery tracking buttons
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Save data
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Notify
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Platillo '" + order.dish + "' listo para entrega. Registre salida del repartidor.");
                }
                
                return true;
            } else {
                // For non-delivery orders, use the original function
                return originalCompleteOrder.call(this, index);
            }
        } catch (e) {
            console.error("Error al completar pedido (versión mejorada):", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al completar pedido: " + e.message);
            }
            return false;
        }
    };
    
    // FIX: Define registerDeliveryDeparture if not defined
    if (!Avika.orders.registerDeliveryDeparture) {
        Avika.orders.registerDeliveryDeparture = function(orderId) {
            try {
                console.log("Registrando salida de repartidor para:", orderId);
                if (!orderId) {
                    console.error("Error: Se requiere ID de orden para registrar salida");
                    return false;
                }
                
                // Find the order in pending orders
                var orderIndex = -1;
                if (Avika.data.pendingOrders) {
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        if (Avika.data.pendingOrders[i].id === orderId) {
                            orderIndex = i;
                            break;
                        }
                    }
                }
                
                if (orderIndex === -1) {
                    console.error("Orden no encontrada para registrar salida:", orderId);
                    return false;
                }
                
                // Register departure time
                Avika.data.pendingOrders[orderIndex].deliveryDepartureTime = new Date();
                
                // Save data
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Update UI
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                // Notify
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Salida de repartidor registrada correctamente");
                }
                
                return true;
            } catch (e) {
                console.error("Error al registrar salida del repartidor:", e);
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al registrar salida: " + e.message);
                }
                return false;
            }
        };
    }
    
    // FIX: Define registerDeliveryArrival if not defined
    if (!Avika.orders.registerDeliveryArrival) {
        Avika.orders.registerDeliveryArrival = function(orderId) {
            try {
                console.log("Registrando llegada de repartidor para:", orderId);
                if (!orderId) {
                    console.error("Error: Se requiere ID de orden para registrar llegada");
                    return false;
                }
                
                // Find the order in pending orders
                var orderIndex = -1;
                if (Avika.data.pendingOrders) {
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        if (Avika.data.pendingOrders[i].id === orderId) {
                            orderIndex = i;
                            break;
                        }
                    }
                }
                
                if (orderIndex === -1) {
                    console.error("Orden no encontrada para registrar llegada:", orderId);
                    return false;
                }
                
                var order = Avika.data.pendingOrders[orderIndex];
                
                // Register arrival time
                order.deliveryArrivalTime = new Date();
                
                // Calculate delivery time
                if (order.deliveryDepartureTime) {
                    var departureTime = new Date(order.deliveryDepartureTime);
                    var arrivalTime = order.deliveryArrivalTime;
                    
                    var timeDiff = Math.floor((arrivalTime - departureTime) / 1000);
                    var mins = Math.floor(timeDiff / 60);
                    var secs = timeDiff % 60;
                    
                    order.deliveryTime = (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                        Avika.dateUtils.padZero(mins) : (mins < 10 ? '0' : '') + mins) + 
                                        ':' + 
                                        (Avika.dateUtils && typeof Avika.dateUtils.padZero === 'function' ? 
                                        Avika.dateUtils.padZero(secs) : (secs < 10 ? '0' : '') + secs);
                }
                
                // Move to completed orders
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                Avika.data.completedOrders.unshift(order);
                
                // Remove from pending orders
                Avika.data.pendingOrders.splice(orderIndex, 1);
                
                // Update UI
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
                
                if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable(false);
                }
                
                // Save data
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Notify
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("Entrega completada: " + order.dish);
                }
                
                return true;
            } catch (e) {
                console.error("Error al registrar llegada de repartidor:", e);
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al registrar llegada: " + e.message);
                }
                return false;
            }
        };
    }
    
    // Enhance the updatePendingTable function to make sure delivery tracking buttons are always shown
    var originalUpdatePendingTable = Avika.ui.updatePendingTable;
    
    if (originalUpdatePendingTable) {
        Avika.ui.updatePendingTable = function() {
            try {
                // Call the original function first
                originalUpdatePendingTable.call(this);
                
                console.log("Mejorando tabla de pendientes para entregas...");
                
                // Now enhance the table for delivery orders
                var rows = document.querySelectorAll('#pending-body tr');
                rows.forEach(function(row, index) {
                    // Get order information
                    var order = Avika.data.pendingOrders[index];
                    if (!order) return;
                    
                    // Only modify delivery orders
                    if (order.service === 'domicilio') {
                        console.log("Procesando orden de domicilio:", order.id, "estado:", order.completed ? "completado" : "pendiente");
                        
                        var actionCell = row.cells[4]; // Action column
                        if (!actionCell) return;
                        
                        // If the order is ready for delivery (completed or finishTime is set)
                        if ((order.completed || order.finishTime) && !order.deliveryDepartureTime) {
                            console.log("Orden lista para salida del repartidor");
                            
                            // Replace standard action buttons with delivery buttons
                            if (!actionCell.innerHTML.includes('Salida Repartidor')) {
                                // Clear existing content
                                actionCell.innerHTML = '';
                                
                                // Add delivery departure button
                                var departureBtn = document.createElement('button');
                                departureBtn.textContent = 'Salida Repartidor';
                                departureBtn.className = 'action-btn';
                                departureBtn.style.backgroundColor = '#ff9800';
                                departureBtn.style.margin = '2px';
                                departureBtn.style.color = 'white';
                                departureBtn.style.border = 'none';
                                departureBtn.style.borderRadius = '4px';
                                departureBtn.style.padding = '8px 12px';
                                departureBtn.style.cursor = 'pointer';
                                
                                departureBtn.onclick = function() {
                                    console.log("Botón de salida repartidor clickeado para orden:", order.id);
                                    if (Avika.orders && typeof Avika.orders.registerDeliveryDeparture === 'function') {
                                        Avika.orders.registerDeliveryDeparture(order.id);
                                    } else {
                                        console.error("Función registerDeliveryDeparture no disponible");
                                    }
                                };
                                
                                actionCell.appendChild(departureBtn);
                            }
                        }
                        
                        // If the order has departure time but not arrival time
                        if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                            console.log("Orden en tránsito, pendiente de llegada");
                            
                            // Replace with arrival button
                            if (!actionCell.innerHTML.includes('Llegada')) {
                                // Clear existing content
                                actionCell.innerHTML = '';
                                
                                // Add arrival button
                                var arrivalBtn = document.createElement('button');
                                arrivalBtn.textContent = 'Llegada';
                                arrivalBtn.className = 'action-btn';
                                arrivalBtn.style.backgroundColor = '#4CAF50';
                                arrivalBtn.style.margin = '2px';
                                arrivalBtn.style.color = 'white';
                                arrivalBtn.style.border = 'none';
                                arrivalBtn.style.borderRadius = '4px';
                                arrivalBtn.style.padding = '8px 12px';
                                arrivalBtn.style.cursor = 'pointer';
                                
                                arrivalBtn.onclick = function() {
                                    console.log("Botón de llegada clickeado para orden:", order.id);
                                    if (Avika.orders && typeof Avika.orders.registerDeliveryArrival === 'function') {
                                        Avika.orders.registerDeliveryArrival(order.id);
                                    } else {
                                        console.error("Función registerDeliveryArrival no disponible");
                                    }
                                };
                                
                                actionCell.appendChild(arrivalBtn);
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Error en la mejora de la tabla de pendientes:", e);
                // Call original function as fallback
                if (typeof originalUpdatePendingTable === 'function') {
                    originalUpdatePendingTable.call(this);
                }
            }
        };
    }
    
    // Fix for removing the residual modal at the bottom
    function removeResidualModals() {
        // Find elements with fixed positioning that could be residual modals
        var fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        
        fixedElements.forEach(function(element) {
            // Check if it's an unwanted modal
            if (!element.id || 
                (element.id !== 'ticket-modal' && 
                 element.id !== 'force-complete-modal' && 
                 element.id !== 'help-modal' && 
                 element.id !== 'notification' && 
                 element.id !== 'error-message' &&
                 element.id !== 'ticket-config-modal')) {
                
                // Verify if it's in the bottom part of the screen
                var rect = element.getBoundingClientRect();
                var windowHeight = window.innerHeight;
                
                if (rect.bottom > windowHeight * 0.7) {
                    console.log("Eliminando modal residual en la parte inferior");
                    
                    // Hide first
                    element.style.display = 'none';
                    
                    // Try to remove from DOM
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        });
    }
    
    // Execute when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Remove any residual modals
        removeResidualModals();
        
        // Set up periodic check to remove residual modals
        setInterval(removeResidualModals, 3000);
    });
    
    console.log("Correcciones para seguimiento de entregas aplicadas correctamente");
})();
