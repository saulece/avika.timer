// order-service.js - Lógica de pedidos y temporizadores

// Estado de la aplicación
Avika.data = {
    currentCategory: '',
    currentDish: '',
    currentCustomizations: [],
    currentService: 'comedor',
    currentQuantity: 1,
    isSpecialCombo: false,
    
    pendingOrders: [],
    completedOrders: [],
    timerInterval: null
};

Avika.orders = {
    // Funciones para iniciar y finalizar preparaciones
    startPreparation: function() {
        var preparation = {
            id: Date.now().toString(),
            dish: Avika.data.currentDish,
            category: Avika.data.currentCategory,
            categoryDisplay: Avika.config.categoryNames[Avika.data.currentCategory],
            quantity: Avika.data.currentQuantity,
            customizations: Avika.data.currentCustomizations.slice(),
            serviceType: Avika.data.currentService,
            notes: document.getElementById('notes-input').value.trim(),
            startTime: new Date(),
            startTimeFormatted: Avika.ui.formatTime(new Date()),
            isSpecialCombo: Avika.data.isSpecialCombo
        };
        
        if (Avika.data.isSpecialCombo) {
            preparation.hotKitchenFinished = false;
            preparation.coldKitchenFinished = false;
        }
        
        Avika.data.pendingOrders.push(preparation);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        
        Avika.ui.showNotification(preparation.dish + ' agregado a preparación');
        
        Avika.ui.showSection('categories-section');
    },

    finishHotKitchen: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.hotKitchenFinished = true;
        order.hotKitchenTime = now;
        order.hotKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina caliente terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
        if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
            this.finishPreparation(id);
        }
        // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
        else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
            order.kitchenFinished = true;
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        }
    },
    finishColdKitchen: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        var now = new Date();
        
        order.coldKitchenFinished = true;
        order.coldKitchenTime = now;
        order.coldKitchenTimeFormatted = Avika.ui.formatTime(now);
        
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
        Avika.ui.showNotification('Cocina fría terminada para ' + order.dish);
        
        // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
        if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
            this.finishPreparation(id);
        }
        // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
        else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
            order.kitchenFinished = true;
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
        }
    },

    // Esta función se llama cuando termina la preparación en cocina para un pedido a domicilio
    finishKitchenForDelivery: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Marca la orden como terminada en cocina pero pendiente de entrega
        order.kitchenFinished = true;
        order.kitchenFinishedTime = new Date();
        order.kitchenFinishedTimeFormatted = Avika.ui.formatTime(order.kitchenFinishedTime);
        
        Avika.ui.showNotification(order.dish + ' terminado en cocina, pendiente entrega');
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },

    // Esta función registra la salida del repartidor
    markDeliveryDeparture: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Registra el tiempo de salida
        order.deliveryDepartureTime = new Date();
        order.deliveryDepartureTimeFormatted = Avika.ui.formatTime(order.deliveryDepartureTime);
        
        Avika.ui.showNotification('Salida del repartidor registrada para ' + order.dish);
        Avika.ui.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },
    // Esta función registra la entrega al cliente
    markDeliveryArrival: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        // Registra el tiempo de entrega y completa el pedido
        order.deliveryArrivalTime = new Date();
        order.deliveryArrivalTimeFormatted = Avika.ui.formatTime(order.deliveryArrivalTime);
        
        // Calcular tiempo total desde inicio hasta entrega
        var endTime = order.deliveryArrivalTime;
        var prepTimeMillis = endTime - new Date(order.startTime);
        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
        var prepMins = Math.floor(prepTimeSecs / 60);
        var prepSecs = prepTimeSecs % 60;
        
        var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
        
        order.endTime = endTime;
        order.endTimeFormatted = Avika.ui.formatTime(endTime);
        order.prepTime = prepTimeFormatted;
        
        // También calcular el tiempo específico de entrega (desde salida hasta llegada)
        var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
        var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
        var deliveryMins = Math.floor(deliveryTimeSecs / 60);
        var deliverySecs = deliveryTimeSecs % 60;
        
        order.deliveryTime = Avika.ui.padZero(deliveryMins) + ':' + Avika.ui.padZero(deliverySecs) + ' minutos';
        
        // Mover a completados
        Avika.data.completedOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        Avika.ui.showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                        prepTimeFormatted + ', Tiempo de entrega: ' + order.deliveryTime);
        
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    },

    finishPreparation: function(id) {
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                orderIndex = i;
                break;
            }
        }
        
        if (orderIndex === -1) return;
        
        var order = Avika.data.pendingOrders[orderIndex];
        
        var endTime = new Date();
        var prepTimeMillis = endTime - new Date(order.startTime);
        var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
        var prepMins = Math.floor(prepTimeSecs / 60);
        var prepSecs = prepTimeSecs % 60;
        
        var prepTimeFormatted = Avika.ui.padZero(prepMins) + ':' + Avika.ui.padZero(prepSecs) + ' minutos';
        
        order.endTime = endTime;
        order.endTimeFormatted = Avika.ui.formatTime(endTime);
        order.prepTime = prepTimeFormatted;
        
        Avika.data.completedOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);
        
        Avika.ui.showNotification('¡' + order.dish + ' finalizado en ' + prepTimeFormatted + '!');
        
        Avika.ui.updatePendingTable();
        Avika.ui.updateCompletedTable();
        Avika.storage.guardarDatosLocales();
    }
};