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
    
    // Make sure delivery tracking is completed properly
    if (!Avika.orders.registerDeliveryCompletion) {
        Avika.orders.registerDeliveryCompletion = function(orderId) {
            try {
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
                    console.error("Orden no encontrada para completar entrega:", orderId);
                    return false;
                }
                
                var order = Avika.data.pendingOrders[orderIndex];
                
                // Move the order to completed orders
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
                console.error("Error al completar entrega:", e);
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al completar entrega: " + e.message);
                }
                return false;
            }
        };
    }
    
    // Modify the registerDeliveryArrival function to call registerDeliveryCompletion
    var originalRegisterDeliveryArrival = Avika.orders.registerDeliveryArrival;
    if (originalRegisterDeliveryArrival) {
        Avika.orders.registerDeliveryArrival = function(orderId) {
            // Call the original function
            var result = originalRegisterDeliveryArrival.call(this, orderId);
            
            // If successful, complete the delivery process
            if (result) {
                // Find the order in pending orders
                var orderIndex = -1;
                if (Avika.data.pendingOrders) {
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        if (Avika.data.pendingOrders[i].id === orderId) {
                            // The order is still in pending orders, complete the delivery
                            setTimeout(function() {
                                Avika.orders.registerDeliveryCompletion(orderId);
                            }, 1000);
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
    }
    
    // Enhance the updatePendingTable function to make sure delivery tracking buttons are always shown
    var originalUpdatePendingTable = Avika.ui.updatePendingTable;
    
    if (originalUpdatePendingTable) {
        Avika.ui.updatePendingTable = function() {
            // Call the original function first
            originalUpdatePendingTable.call(this);
            
            // Now enhance the table for delivery orders
            var rows = document.querySelectorAll('#pending-body tr');
            rows.forEach(function(row, index) {
                // Get order information
                var order = Avika.data.pendingOrders[index];
                if (!order) return;
                
                // Only modify delivery orders
                if (order.service === 'domicilio') {
                    var actionCell = row.cells[4]; // Action column
                    
                    // If the order is ready for delivery (completed or finishTime is set)
                    if ((order.completed || order.finishTime) && !order.deliveryDepartureTime) {
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
                                Avika.orders.registerDeliveryDeparture(order.id);
                            };
                            
                            actionCell.appendChild(departureBtn);
                        }
                    }
                    
                    // If the order has departure time but not arrival time
                    if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
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
                                Avika.orders.registerDeliveryArrival(order.id);
                            };
                            
                            actionCell.appendChild(arrivalBtn);
                        }
                    }
                }
            });
        };
    }
    
    console.log("Correcciones para seguimiento de entregas aplicadas correctamente");
})();
