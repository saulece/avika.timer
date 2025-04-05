// fix-combo-delivery.js - Fix for combo dishes in delivery tickets
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Applying dedicated fix for combo dishes in delivery tickets...");
        
        // Replace the functions completely rather than just adding at the end
        Avika.orders.finishHotKitchen = function(id) {
            console.log("Finishing hot kitchen for order ID:", id);
            
            // Find the order by ID
            var order = null;
            var orderIndex = -1;
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                // Use == instead of === for more flexible comparison
                if (Avika.data.pendingOrders[i].id == id) {
                    order = Avika.data.pendingOrders[i];
                    orderIndex = i;
                    break;
                }
            }
            
            if (!order) {
                console.error("Order not found with ID:", id);
                Avika.ui.showNotification("Error: Orden no encontrada");
                return;
            }
            
            var now = new Date();
            
            // Mark hot kitchen as finished
            order.hotKitchenFinished = true;
            order.hotKitchenTime = now;
            order.hotKitchenTimeFormatted = Avika.ui.formatTime(now);
            
            // Check if both kitchens are now finished
            if (order.hotKitchenFinished && order.coldKitchenFinished) {
                // Mark the order as fully finished
                order.finished = true;
                order.finishTime = now;
                order.finishTimeFormatted = Avika.ui.formatTime(now);
                
                // For ticket orders, check if all items in the ticket are finished
                if (order.ticketId) {
                    var allTicketItemsFinished = true;
                    
                    // Check all items in the same ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            if (item.isSpecialCombo) {
                                // For special combos, both kitchens must be finished
                                if (!item.hotKitchenFinished || !item.coldKitchenFinished) {
                                    allTicketItemsFinished = false;
                                    break;
                                }
                            } else if (!item.finished) {
                                // For regular items, check if they're finished
                                allTicketItemsFinished = false;
                                break;
                            }
                        }
                    }
                    
                    // Update ticket status if all items are finished
                    if (allTicketItemsFinished) {
                        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                            var item = Avika.data.pendingOrders[i];
                            if (item.ticketId === order.ticketId) {
                                item.allTicketItemsFinished = true;
                                item.allItemsFinished = true;
                                if (item.service === 'domicilio' || item.serviceType === 'domicilio') {
                                    item.readyForDelivery = true;
                                }
                            }
                        }
                        
                        // Show notification for completed ticket
                        if (order.service === 'domicilio' || order.serviceType === 'domicilio') {
                            Avika.ui.showNotification("Ticket completo listo. Pendiente salida del repartidor.");
                        } else {
                            Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                        }
                    } else {
                        Avika.ui.showNotification("Cocina caliente completada para " + order.dish + ". Aún faltan más platillos en el ticket.");
                    }
                } else {
                    // Individual combo (not in a ticket)
                    Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                    
                    // If not in delivery mode, automatically complete the order
                    if (order.service !== 'domicilio' && order.serviceType !== 'domicilio') {
                        Avika.orders.finishPreparation(id);
                    }
                }
            } else {
                Avika.ui.showNotification("Cocina caliente completada para " + order.dish + ". Falta completar cocina fría.");
            }
            
            // Update UI and save data
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        };
        
        Avika.orders.finishColdKitchen = function(id) {
            console.log("Finishing cold kitchen for order ID:", id);
            
            // Find the order by ID
            var order = null;
            var orderIndex = -1;
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                // Use == instead of === for more flexible comparison
                if (Avika.data.pendingOrders[i].id == id) {
                    order = Avika.data.pendingOrders[i];
                    orderIndex = i;
                    break;
                }
            }
            
            if (!order) {
                console.error("Order not found with ID:", id);
                Avika.ui.showNotification("Error: Orden no encontrada");
                return;
            }
            
            var now = new Date();
            
            // Mark cold kitchen as finished
            order.coldKitchenFinished = true;
            order.coldKitchenTime = now;
            order.coldKitchenTimeFormatted = Avika.ui.formatTime(now);
            
            // Check if both kitchens are now finished
            if (order.hotKitchenFinished && order.coldKitchenFinished) {
                // Mark the order as fully finished
                order.finished = true;
                order.finishTime = now;
                order.finishTimeFormatted = Avika.ui.formatTime(now);
                
                // For ticket orders, check if all items in the ticket are finished
                if (order.ticketId) {
                    var allTicketItemsFinished = true;
                    
                    // Check all items in the same ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            if (item.isSpecialCombo) {
                                // For special combos, both kitchens must be finished
                                if (!item.hotKitchenFinished || !item.coldKitchenFinished) {
                                    allTicketItemsFinished = false;
                                    break;
                                }
                            } else if (!item.finished) {
                                // For regular items, check if they're finished
                                allTicketItemsFinished = false;
                                break;
                            }
                        }
                    }
                    
                    // Update ticket status if all items are finished
                    if (allTicketItemsFinished) {
                        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                            var item = Avika.data.pendingOrders[i];
                            if (item.ticketId === order.ticketId) {
                                item.allTicketItemsFinished = true;
                                item.allItemsFinished = true;
                                if (item.service === 'domicilio' || item.serviceType === 'domicilio') {
                                    item.readyForDelivery = true;
                                }
                            }
                        }
                        
                        // Show notification for completed ticket
                        if (order.service === 'domicilio' || order.serviceType === 'domicilio') {
                            Avika.ui.showNotification("Ticket completo listo. Pendiente salida del repartidor.");
                        } else {
                            Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                        }
                    } else {
                        Avika.ui.showNotification("Cocina fría completada para " + order.dish + ". Aún faltan más platillos en el ticket.");
                    }
                } else {
                    // Individual combo (not in a ticket)
                    Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                    
                    // If not in delivery mode, automatically complete the order
                    if (order.service !== 'domicilio' && order.serviceType !== 'domicilio') {
                        Avika.orders.finishPreparation(id);
                    }
                }
            } else {
                Avika.ui.showNotification("Cocina fría completada para " + order.dish + ". Falta completar cocina caliente.");
            }
            
            // Update UI and save data
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        };
        
        console.log("Dedicated fix for combo dishes in delivery tickets applied");
    });
})();
