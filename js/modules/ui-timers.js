// ui-timers.js - Funciones para el manejo de temporizadores
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Actualizar temporizadores de platillos en preparación
Avika.ui.updatePendingTimers = function() {
    // Obtener todos los elementos de temporizador
    var timerElements = document.querySelectorAll('.pending-order-row .timer');
    
    for (var i = 0; i < timerElements.length; i++) {
        var timerElement = timerElements[i];
        var row = timerElement.closest('.pending-order-row');
        
        if (!row) continue;
        
        var orderId = row.getAttribute('data-order-id');
        var startTimeElement = row.querySelector('.elapsed');
        
        if (!startTimeElement) continue;
        
        var startTimeStr = startTimeElement.getAttribute('data-start-time');
        
        if (!startTimeStr) continue;
        
        var startTime = new Date(startTimeStr);
        var now = new Date();
        var elapsedSeconds = Math.floor((now - startTime) / 1000);
        
        // Formatear tiempo transcurrido
        var formattedTime = Avika.utils.formatElapsedTime(elapsedSeconds);
        timerElement.textContent = formattedTime;
        
        // Aplicar clases según el tiempo transcurrido
        timerElement.classList.remove('warning', 'danger');
        
        if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.THIRTY_MINUTES_IN_SECONDS) {
            timerElement.classList.add('danger');
        } else if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS) {
            timerElement.classList.add('warning');
        }
    }
};

// Actualizar temporizadores de reparto
Avika.ui.updateDeliveryTimers = function() {
    // Obtener todos los elementos de temporizador de entrega
    var timerElements = document.querySelectorAll('.delivery-order-row .delivery-timer');
    
    for (var i = 0; i < timerElements.length; i++) {
        var timerElement = timerElements[i];
        var row = timerElement.closest('.delivery-order-row');
        
        if (!row) continue;
        
        var orderId = row.getAttribute('data-order-id');
        var departureTimeElement = row.querySelector('.delivery-elapsed');
        
        if (!departureTimeElement) continue;
        
        var departureTimeStr = departureTimeElement.getAttribute('data-departure-time');
        
        if (!departureTimeStr) continue;
        
        var departureTime = new Date(departureTimeStr);
        var now = new Date();
        var elapsedSeconds = Math.floor((now - departureTime) / 1000);
        
        // Formatear tiempo transcurrido
        var formattedTime = Avika.utils.formatElapsedTime(elapsedSeconds);
        timerElement.textContent = formattedTime;
        
        // Aplicar clases según el tiempo transcurrido
        timerElement.classList.remove('warning', 'danger');
        
        if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.THIRTY_MINUTES_IN_SECONDS) {
            timerElement.classList.add('danger');
        } else if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS) {
            timerElement.classList.add('warning');
        }
    }
};

// Actualizar todos los temporizadores - Función principal centralizada
Avika.ui.updateAllTimers = function() {
    // Evitar múltiples actualizaciones simultáneas
    if (Avika.ui.state._timerUpdateRequested) {
        return;
    }
    
    Avika.ui.state._timerUpdateRequested = true;
    
    // Usar requestAnimationFrame para optimizar rendimiento
    requestAnimationFrame(function() {
        Avika.ui.state._timerUpdateRequested = false;
        
        // Actualizar temporizadores de órdenes pendientes
        Avika.ui.updatePendingTimers();
        
        // Actualizar temporizadores de órdenes en reparto
        Avika.ui.updateDeliveryTimers();
        
        // Verificar si hay órdenes que requieren notificación
        Avika.ui.checkTimersForNotifications();
    });
};

// Verificar si hay órdenes que requieren notificación
Avika.ui.checkTimersForNotifications = function() {
    // Esta función se puede implementar para mostrar notificaciones
    // cuando los temporizadores alcanzan ciertos umbrales
    
    // Por ejemplo, notificar cuando una orden lleva más de 15 minutos en preparación
    if (!Avika.data || !Avika.data.pendingOrders) return;
    
    var now = new Date();
    
    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
        var order = Avika.data.pendingOrders[i];
        
        if (!order.startTime || order.notificationShown) continue;
        
        var startTime = new Date(order.startTime);
        var elapsedSeconds = Math.floor((now - startTime) / 1000);
        
        // Notificar cuando se alcanza el umbral de 15 minutos
        if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.FIFTEEN_MINUTES_IN_SECONDS && 
            !order.fifteenMinNotificationShown) {
            
            // Marcar como notificada
            order.fifteenMinNotificationShown = true;
            
            // Mostrar notificación
            if (typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('¡Alerta! ' + order.dish + ' lleva más de 15 minutos en preparación', 'warning');
            }
        }
        
        // Notificar cuando se alcanza el umbral de 30 minutos
        if (elapsedSeconds >= Avika.utils.TIME_CONSTANTS.THIRTY_MINUTES_IN_SECONDS && 
            !order.thirtyMinNotificationShown) {
            
            // Marcar como notificada
            order.thirtyMinNotificationShown = true;
            
            // Mostrar notificación
            if (typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('¡Urgente! ' + order.dish + ' lleva más de 30 minutos en preparación', 'error');
            }
        }
    }
};
