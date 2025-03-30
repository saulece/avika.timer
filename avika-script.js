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
// Añade este código al principio de tu archivo avika-script.js

// Crear un elemento para mostrar errores en la pantalla
var errorDisplay = document.createElement('div');
errorDisplay.style.position = 'fixed';
errorDisplay.style.bottom = '0';
errorDisplay.style.left = '0';
errorDisplay.style.right = '0';
errorDisplay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
errorDisplay.style.color = 'white';
errorDisplay.style.padding = '10px';
errorDisplay.style.fontFamily = 'monospace';
errorDisplay.style.fontSize = '12px';
errorDisplay.style.maxHeight = '30%';
errorDisplay.style.overflow = 'auto';
errorDisplay.style.zIndex = '9999';
errorDisplay.style.display = 'none';

// Función para registrar errores
function logError(message) {
    errorDisplay.style.display = 'block';
    var errorMsg = document.createElement('div');
    errorMsg.textContent = new Date().toISOString() + ': ' + message;
    errorDisplay.appendChild(errorMsg);
    
    // Limitar a 10 mensajes
    if (errorDisplay.children.length > 10) {
        errorDisplay.removeChild(errorDisplay.children[0]);
    }
}

// Capturar errores globales
window.onerror = function(message, source, lineno, colno, error) {
    logError('ERROR: ' + message + ' at line ' + lineno);
    return false;
};

// Agregar el display de errores al documento cuando esté listo
document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(errorDisplay);
    
    // Agregar botón para limpiar errores
    var clearButton = document.createElement('button');
    clearButton.textContent = 'Limpiar';
    clearButton.style.backgroundColor = 'white';
    clearButton.style.color = 'black';
    clearButton.style.border = 'none';
    clearButton.style.padding = '5px 10px';
    clearButton.style.margin = '5px';
    clearButton.style.borderRadius = '3px';
    clearButton.onclick = function() {
        errorDisplay.innerHTML = '';
        errorDisplay.style.display = 'none';
    };
    errorDisplay.appendChild(clearButton);
    
    // Verificar si los botones están siendo registrados correctamente
    try {
        var buttons = document.querySelectorAll('button, .category-btn, .dish-btn, .option-btn');
        logError('Botones encontrados: ' + buttons.length);
        
        // Verificar el primer botón como ejemplo
        if (buttons.length > 0) {
            var firstButton = buttons[0];
            logError('Primer botón: ' + firstButton.textContent + ' | ID: ' + firstButton.id);
        }
    } catch(e) {
        logError('Error al verificar botones: ' + e.message);
    }
});

// Agregar logging para eventos táctiles
document.addEventListener('touchstart', function(e) {
    logError('Touchstart en ' + e.target.tagName + (e.target.className ? ' class=' + e.target.className : ''));
}, {passive: true});
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