// fix-combo-buttons.js - Fix for combo buttons not working correctly
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Applying fix for combo buttons not working...");
        
        // Fix for finishHotKitchen function
        Avika.orders.finishHotKitchen = function(id) {
            console.log("Finishing hot kitchen for order ID:", id);
            
            // Find the order by ID - first convert to string if needed
            id = id.toString();
            var order = null;
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].id.toString() === id) {
                    order = Avika.data.pendingOrders[i];
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
            
            // Save data and update UI
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
            Avika.ui.showNotification('Cocina caliente terminada para ' + order.dish);
            
            // If both kitchens are finished, update order status
            if (order.hotKitchenFinished && order.coldKitchenFinished) {
                // Mark the order as fully finished
                order.finished = true;
                order.finishTime = now;
                order.finishTimeFormatted = Avika.ui.formatTime(now);
                
                Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                
                // If not in delivery mode, automatically complete the order
                if (order.service !== 'domicilio' && order.serviceType !== 'domicilio') {
                    if (typeof Avika.orders.finishPreparation === 'function') {
                        Avika.orders.finishPreparation(id);
                    }
                } else {
                    // For delivery orders, just mark kitchen as finished
                    order.kitchenFinished = true;
                    order.finished = true;
                    Avika.ui.updatePendingTable();
                    Avika.storage.guardarDatosLocales();
                }
            }
        };
        
        // Fix for finishColdKitchen function
        Avika.orders.finishColdKitchen = function(id) {
            console.log("Finishing cold kitchen for order ID:", id);
            
            // Find the order by ID - first convert to string if needed
            id = id.toString();
            var order = null;
            
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].id.toString() === id) {
                    order = Avika.data.pendingOrders[i];
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
            
            // Save data and update UI
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
            Avika.ui.showNotification('Cocina fría terminada para ' + order.dish);
            
            // If both kitchens are finished, update order status
            if (order.hotKitchenFinished && order.coldKitchenFinished) {
                // Mark the order as fully finished
                order.finished = true;
                order.finishTime = now;
                order.finishTimeFormatted = Avika.ui.formatTime(now);
                
                Avika.ui.showNotification("Combo " + order.dish + " completado en ambas cocinas.");
                
                // If not in delivery mode, automatically complete the order
                if (order.service !== 'domicilio' && order.serviceType !== 'domicilio') {
                    if (typeof Avika.orders.finishPreparation === 'function') {
                        Avika.orders.finishPreparation(id);
                    }
                } else {
                    // For delivery orders, just mark kitchen as finished
                    order.kitchenFinished = true;
                    order.finished = true;
                    Avika.ui.updatePendingTable();
                    Avika.storage.guardarDatosLocales();
                }
            }
        };
        
        // Add the script to index.html if it doesn't exist
        var scriptPresent = false;
        var scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf('fix-combo-buttons.js') > -1) {
                scriptPresent = true;
                break;
            }
        }
        
        if (!scriptPresent) {
            var script = document.createElement('script');
            script.src = 'js/modules/fix-combo-buttons.js';
            document.body.appendChild(script);
        }
        
        console.log("Fix for combo buttons applied");
    });
})();