// ui-core.js - Funciones básicas de la interfaz de usuario
window.Avika = window.Avika || {};

// Asegurarse de que Avika.utils esté disponible
if (!Avika.utils) {
    console.warn('Avika.utils no está disponible, se creará una implementación básica');
    Avika.utils = {
        // Constantes de tiempo para toda la aplicación
        TIME_CONSTANTS: {
            TEN_MINUTES_IN_SECONDS: 600,      // 10 minutos
            FIFTEEN_MINUTES_IN_SECONDS: 900,  // 15 minutos
            THIRTY_MINUTES_IN_SECONDS: 1800,  // 30 minutos
            NOTIFICATION_TIMEOUT_MS: 3000,    // 3 segundos
            AUTO_SAVE_INTERVAL_MS: 30000,     // 30 segundos
            TIMER_UPDATE_INTERVAL_MS: 2000    // 2 segundos
        },
        
        // Funciones básicas que serán reemplazadas por las de avika-core.js
        isValidDate: function(date) {
            return date instanceof Date && !isNaN(date.getTime());
        },
        
        getElement: function(id) {
            return document.getElementById(id);
        },
        
        log: {
            level: 'info',
            debug: function(msg) { console.debug(msg); },
            info: function(msg) { console.info(msg); },
            warn: function(msg) { console.warn(msg); },
            error: function(msg) { console.error(msg); }
        }
    };
}

// Inicializar el objeto UI si no existe
Avika.ui = Avika.ui || {};

// Estado central de la UI
Avika.ui.state = {
    lastSavedState: '',
    currentSubCategory: null, // Seguimiento de subcategorías
    ticketMode: false, // Modo ticket
    ticketItems: [], // Elementos del ticket
    ticketService: 'comedor', // Servicio predeterminado para el ticket
    selectedTicketItem: {}, // Item seleccionado actualmente
    expandedTickets: {},
    _timerUpdateRequested: false // Para evitar múltiples actualizaciones de temporizadores
};

// Funciones básicas de UI
Avika.ui.showSection = function(sectionId) {
    console.log("Mostrando sección:", sectionId);
    
    // Ocultar todas las secciones
    var sections = document.querySelectorAll('.container > div[id$="-section"]');
    for (var i = 0; i < sections.length; i++) {
        sections[i].style.display = 'none';
    }
    
    // Mostrar la sección solicitada
    var section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    } else {
        console.error("Sección no encontrada:", sectionId);
    }
    
    // Actualizar tablas si es necesario
    if (sectionId === 'categories-section') {
        if (typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        if (typeof Avika.ui.updateDeliveryTable === 'function') {
            Avika.ui.updateDeliveryTable();
        }
        if (typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable();
        }
    }
};

// Función mejorada para mostrar notificaciones con tipos
Avika.ui.showNotification = function(message, type) {
    type = type || 'info'; // Valores posibles: info, success, warning, error
    
    var notificationElement = document.getElementById('notification');
    if (!notificationElement) {
        console.error("Elemento de notificación no encontrado");
        return;
    }
    
    // Limpiar clases anteriores
    notificationElement.className = '';
    
    // Añadir clase según el tipo
    notificationElement.classList.add('notification', 'notification-' + type);
    
    // Establecer mensaje
    notificationElement.textContent = message;
    
    // Mostrar notificación
    notificationElement.style.display = 'block';
    
    // Aplicar animación de entrada
    notificationElement.classList.add('notification-show');
    
    // Configurar temporizador para ocultar
    if (Avika.ui._notificationTimeout) {
        clearTimeout(Avika.ui._notificationTimeout);
    }
    
    var timeoutDuration = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
                         Avika.utils.TIME_CONSTANTS.NOTIFICATION_TIMEOUT_MS : 3000;
    
    Avika.ui._notificationTimeout = setTimeout(function() {
        // Aplicar animación de salida
        notificationElement.classList.remove('notification-show');
        notificationElement.classList.add('notification-hide');
        
        // Ocultar después de la animación
        setTimeout(function() {
            notificationElement.style.display = 'none';
            notificationElement.classList.remove('notification-hide');
        }, 300); // Duración de la animación
    }, timeoutDuration);
};

// Funciones de utilidad para la UI
Avika.ui.showLoading = function() {
    document.querySelector('.loading-indicator').style.display = 'block';
};

Avika.ui.hideLoading = function() {
    document.querySelector('.loading-indicator').style.display = 'none';
};

// Función para formatear tiempo transcurrido en formato HH:MM:SS - Usando la implementación centralizada
Avika.ui.formatElapsedTime = function(seconds) {
    return Avika.utils.formatElapsedTime(seconds);
};

// Función para añadir ceros a la izquierda - Usando la implementación centralizada
Avika.ui.padZero = function(num) {
    return Avika.utils.padZero(num);
};

// Función para activar/desactivar modo ultra-compacto
Avika.ui.toggleCompactMode = function() {
    var body = document.body;
    var compactModeEnabled = body.classList.contains('compact-mode');
    
    if (compactModeEnabled) {
        // Desactivar modo compacto
        body.classList.remove('compact-mode');
        localStorage.setItem('avika_compact_mode', 'false');
        if (document.getElementById('btn-compact-mode')) {
            document.getElementById('btn-compact-mode').textContent = 'Activar modo ultra-compacto';
        }
    } else {
        // Activar modo compacto
        body.classList.add('compact-mode');
        localStorage.setItem('avika_compact_mode', 'true');
        if (document.getElementById('btn-compact-mode')) {
            document.getElementById('btn-compact-mode').textContent = 'Desactivar modo ultra-compacto';
        }
    }
    
    // Actualizar tablas para reflejar el nuevo modo
    if (typeof Avika.ui.updatePendingTable === 'function') {
        Avika.ui.updatePendingTable();
    }
    if (typeof Avika.ui.updateDeliveryTable === 'function') {
        Avika.ui.updateDeliveryTable();
    }
};

// Verificar si un elemento está visible en el viewport
Avika.ui.isElementInViewport = function(el) {
    if (!el) return false;
    
    var rect = el.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Búsqueda optimizada de órdenes
Avika.ui.findOrderById = function(id) {
    // Buscar en órdenes pendientes
    if (Avika.data && Avika.data.pendingOrders) {
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === id) {
                return { order: Avika.data.pendingOrders[i], type: 'pending', index: i };
            }
        }
    }
    
    // Buscar en órdenes en reparto
    if (Avika.data && Avika.data.deliveryOrders) {
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            if (Avika.data.deliveryOrders[i].id === id) {
                return { order: Avika.data.deliveryOrders[i], type: 'delivery', index: i };
            }
        }
    }
    
    return null;
};
