// optimization.js - Funciones para optimizar el rendimiento de la aplicación
window.Avika = window.Avika || {};

Avika.optimization = {
    // Caché de elementos DOM
    _domCache: {},
    
    // Función optimizada para obtener elementos DOM (con caché)
    getElement: function(id) {
        if (!this._domCache[id]) {
            this._domCache[id] = document.getElementById(id);
        }
        return this._domCache[id];
    },
    
    // Función para limpiar la caché de DOM (usar cuando cambie la página)
    clearDomCache: function() {
        this._domCache = {};
    },
    
    // Función para limitar la frecuencia de ejecución de funciones (throttling)
    throttle: function(func, delay) {
        var lastCall = 0;
        return function(...args) {
            var now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },
    
    // Limitar actualizaciones de temporizadores
    throttledUpdateTimers: null, // Se inicializará más abajo
    
    // Detectar si un elemento está visible en la ventana
    isElementInViewport: function(el) {
        if (!el) return false;
        
        try {
            var rect = el.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Añadir un buffer para pre-cargar elementos cercanos al viewport
            var buffer = 200; // píxeles de margen para pre-carga
            
            return (
                (rect.top >= -buffer && rect.top <= windowHeight + buffer) ||
                (rect.bottom >= -buffer && rect.bottom <= windowHeight + buffer)
            ) && (
                rect.left >= 0 &&
                rect.right <= windowWidth
            );
        } catch (e) {
            console.warn("Error al verificar visibilidad del elemento:", e);
            return false;
        }
    },
    
    // Función para crear/actualizar una fila de tabla eficientemente
    updateTableRow: function(table, rowData, rowId) {
        // Buscar fila existente por ID
        var existingRow = document.getElementById(rowId);
        
        if (existingRow) {
            // Actualizar fila existente
            for (var cellKey in rowData) {
                var cell = existingRow.querySelector('[data-cell="' + cellKey + '"]');
                if (cell) {
                    // Solo actualizar si el contenido cambió
                    if (cell.innerHTML !== rowData[cellKey]) {
                        cell.innerHTML = rowData[cellKey];
                    }
                }
            }
            return existingRow;
        } else {
            // Crear nueva fila
            var newRow = document.createElement('tr');
            newRow.id = rowId;
            
            for (var cellKey in rowData) {
                var cell = document.createElement('td');
                cell.setAttribute('data-cell', cellKey);
                cell.innerHTML = rowData[cellKey];
                newRow.appendChild(cell);
            }
            
            table.appendChild(newRow);
            return newRow;
        }
    },
    
    // Inicializar optimizaciones
    init: function() {
        // Crear versión limitada de la actualización de temporizadores
        this.throttledUpdateTimers = this.throttle(function() {
            if (Avika.orderService && typeof Avika.orderService.updateAllTimers === 'function') {
                Avika.orderService.updateAllTimers();
            } else if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
                Avika.ui.updateAllTimers();
            }
        }, 1000); // Limitar a 1 actualización por segundo
        
        console.log("Módulo de optimización inicializado");
    }
};

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    Avika.optimization.init();
});