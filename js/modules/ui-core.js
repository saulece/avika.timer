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

// Función para mostrar notificaciones - Usando implementación centralizada en ui-notifications.js
// La implementación completa se encuentra en ui-notifications.js

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

// Función para activar/desactivar modo ultra-compacto - Usando implementación centralizada en ui-modals.js
// Esta función es un wrapper para mantener compatibilidad con el código existente
Avika.ui.toggleCompactMode = function() {
    var compactModeEnabled = document.body.classList.contains('compact-mode');
    // Llamar a la implementación centralizada con el parámetro adecuado
    if (typeof Avika.ui.setCompactMode === 'function') {
        Avika.ui.setCompactMode(!compactModeEnabled);
    }
};

// Verificar si un elemento está visible en el viewport - Usando implementación centralizada
Avika.ui.isElementInViewport = function(el) {
    // Usar la implementación optimizada de Avika.optimization
    return Avika.optimization.isElementInViewport(el);
};

// Búsqueda optimizada de órdenes - Usando implementación centralizada en Avika.utils.findOrderById
// La implementación se ha movido a Avika.utils para centralización
