// Solución para corregir problemas de eventos táctiles en iOS
// Añade esto al principio de tu archivo avika-script.js

// Mejora de soporte táctil 
(function() {
    // Previene el comportamiento de zoom en doble toque
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Previene el retraso táctil en iOS
    function touchHandler(event) {
        var touches = event.changedTouches,
            first = touches[0],
            type = "";
        
        switch(event.type) {
            case "touchstart": type = "mousedown"; break;
            case "touchmove": type = "mousemove"; break;
            case "touchend": type = "mouseup"; break;
            default: return;
        }
        
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
                              first.screenX, first.screenY,
                              first.clientX, first.clientY, false,
                              false, false, false, 0, null);
        
        first.target.dispatchEvent(simulatedEvent);
        if (event.type === "touchstart" || event.type === "touchend") {
            event.preventDefault();
        }
    }
    
    // Aplicar a todos los elementos que necesitan ser táctiles
    function addTouchListeners() {
        var elements = document.querySelectorAll('button, .category-btn, .dish-btn, .option-btn, .finish-btn, .action-btn, .back-btn');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('touchstart', touchHandler, true);
            elements[i].addEventListener('touchmove', touchHandler, true);
            elements[i].addEventListener('touchend', touchHandler, true);
            elements[i].addEventListener('touchcancel', touchHandler, true);
        }
    }
    
    // Ejecutar cuando el DOM esté cargado
    document.addEventListener('DOMContentLoaded', function() {
        addTouchListeners();
        
        // Observador para detectar nuevos elementos y añadirles los listeners
        var observer = new MutationObserver(function(mutations) {
            addTouchListeners();
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    });
})();
// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Opciones de personalización predeterminadas
var customizationOptions = {
    'sin-alga': 'Sin Alga',
    'extra-picante': 'Extra Picante',
    'cambio-proteina': 'Cambiar Proteína'
};

// Datos de platillos
var dishes = {
    'frio': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'T
        // Esta función registra la salida del repartidor
function markDeliveryDeparture(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Esta función registra la entrega al cliente
function markDeliveryArrival(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega y completa el pedido
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcular tiempo total desde inicio hasta entrega
    var endTime = order.deliveryArrivalTime;
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // También calcular el tiempo específico de entrega (desde salida hasta llegada)
    var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    var deliveryMins = Math.floor(deliveryTimeSecs / 60);
    var deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    // Mover a completados
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                    prepTimeFormatted + ', Tiempo de entrega: ' + order.deliveryTime);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

function finishPreparation(id) {
    var orderIndex = -1;
    for (var i = 0; i < pen// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Opciones de personalización predeterminadas
var customizationOptions = {
    'sin-alga': 'Sin Alga',
    'extra-picante': 'Extra Picante',
    'cambio-proteina': 'Cambiar Proteína'
};

// Datos de platillos
var dishes = {
    'frio': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
        'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón',
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};
// Esta función registra la salida del repartidor
function markDeliveryDeparture(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Esta función registra la entrega al cliente
function markDeliveryArrival(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega y completa el pedido
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcular tiempo total desde inicio hasta entrega
    var endTime = order.deliveryArrivalTime;
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // También calcular el tiempo específico de entrega (desde salida hasta llegada)
    var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    var deliveryMins = Math.floor(deliveryTimeSecs / 60);
    var deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    // Mover a completados
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                    prepTimeFormatted + ', Tiempo de entrega: ' + order.deliveryTime);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

function finishPreparation(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    var endTime = new Date();
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' finalizado en ' + prepTimeFormatted + '!');
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Opciones de personalización predeterminadas
var customizationOptions = {
    'sin-alga': 'Sin Alga',
    'extra-picante': 'Extra Picante',
    'cambio-proteina': 'Cambiar Proteína'
};

// Datos de platillos
var dishes = {
    'frio': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
        'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón',
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};