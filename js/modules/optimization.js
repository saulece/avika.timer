// optimization.js - Funciones para optimizar el rendimiento de la aplicación
window.Avika = window.Avika || {};

Avika.optimization = {
    // Caché de elementos DOM
    _domCache: {},
    
    // Caché de cálculos y resultados frecuentes
    _computeCache: {},
    
    // Contador de actualizaciones para optimización adaptativa
    _updateCounter: 0,
    
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
    
    // Función para retrasar la ejecución hasta que no haya más llamadas (debouncing)
    debounce: function(func, wait) {
        var timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    // Limitar actualizaciones de temporizadores
    throttledUpdateTimers: null, // Se inicializará más abajo
    
    // Detectar si un elemento está visible en la ventana (optimizado)
    isElementInViewport: function(el) {
        if (!el) return false;
        
        // Usar ID como clave de caché si está disponible
        const cacheKey = el.id || el.dataset?.uniqueId;
        
        // Si tenemos una clave de caché válida y hay un resultado reciente en caché
        if (cacheKey && this._computeCache[`viewport_${cacheKey}`]) {
            const cachedResult = this._computeCache[`viewport_${cacheKey}`];
            // Solo usar el resultado en caché si es reciente (menos de 500ms)
            if (Date.now() - cachedResult.timestamp < 500) {
                return cachedResult.value;
            }
        }
        
        try {
            var rect = el.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Añadir un buffer para pre-cargar elementos cercanos al viewport
            var buffer = 200; // píxeles de margen para pre-carga
            
            const result = (
                (rect.top >= -buffer && rect.top <= windowHeight + buffer) ||
                (rect.bottom >= -buffer && rect.bottom <= windowHeight + buffer)
            ) && (
                rect.left >= 0 &&
                rect.right <= windowWidth
            );
            
            // Guardar resultado en caché si tenemos una clave válida
            if (cacheKey) {
                this._computeCache[`viewport_${cacheKey}`] = {
                    value: result,
                    timestamp: Date.now()
                };
            }
            
            return result;
        } catch (e) {
            console.warn("Error al verificar visibilidad del elemento:", e);
            return false;
        }
    },
    
    // Función para crear/actualizar una fila de tabla eficientemente con DOM virtual
    updateTableRow: function(table, rowData, rowId) {
        // Buscar fila existente por ID
        var existingRow = document.getElementById(rowId);
        
        if (existingRow) {
            // Actualizar fila existente
            let hasChanges = false;
            
            for (var cellKey in rowData) {
                var cell = existingRow.querySelector('[data-cell="' + cellKey + '"]');
                if (cell) {
                    // Solo actualizar si el contenido cambió
                    if (cell.innerHTML !== rowData[cellKey]) {
                        cell.innerHTML = rowData[cellKey];
                        hasChanges = true;
                    }
                }
            }
            
            // Si hubo cambios, aplicar una clase para animación sutil
            if (hasChanges) {
                existingRow.classList.add('row-updated');
                setTimeout(() => {
                    existingRow.classList.remove('row-updated');
                }, 500);
            }
            
            return existingRow;
        } else {
            // Crear nueva fila usando DocumentFragment para mejor rendimiento
            const fragment = document.createDocumentFragment();
            var newRow = document.createElement('tr');
            newRow.id = rowId;
            newRow.classList.add('row-new');
            
            for (var cellKey in rowData) {
                var cell = document.createElement('td');
                cell.setAttribute('data-cell', cellKey);
                cell.innerHTML = rowData[cellKey];
                newRow.appendChild(cell);
            }
            
            fragment.appendChild(newRow);
            table.appendChild(fragment);
            
            // Eliminar clase de animación después de un momento
            setTimeout(() => {
                newRow.classList.remove('row-new');
            }, 500);
            
            return newRow;
        }
    },
    
    // Optimización para operaciones en lotes
    batchUpdate: function(elements, updateFn) {
        // Usar requestAnimationFrame para sincronizar con el refresco de pantalla
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();
            const parent = elements[0]?.parentNode;
            
            // Procesar elementos en lotes para evitar bloquear el hilo principal
            const batchSize = 20;
            const processBatch = (startIdx) => {
                const endIdx = Math.min(startIdx + batchSize, elements.length);
                
                for (let i = startIdx; i < endIdx; i++) {
                    updateFn(elements[i], fragment);
                }
                
                if (endIdx < elements.length) {
                    // Procesar el siguiente lote en el próximo frame
                    setTimeout(() => {
                        processBatch(endIdx);
                    }, 0);
                } else if (parent && fragment.childNodes.length > 0) {
                    // Aplicar todos los cambios de una vez
                    parent.appendChild(fragment);
                }
            };
            
            processBatch(0);
        });
    },
    
    // Optimización adaptativa basada en rendimiento
    adaptiveThrottle: function(func, minDelay, maxDelay) {
        let delay = minDelay;
        let lastPerformance = performance.now();
        let lastCall = 0;
        
        return function(...args) {
            const now = Date.now();
            
            // Si no ha pasado suficiente tiempo desde la última llamada, no ejecutar
            if (now - lastCall < delay) {
                return;
            }
            
            lastCall = now;
            const startTime = performance.now();
            
            // Ejecutar la función
            const result = func.apply(this, args);
            
            // Medir el tiempo de ejecución
            const executionTime = performance.now() - startTime;
            
            // Ajustar el retraso basado en el rendimiento
            if (executionTime > 16) { // Más de 16ms (menos de 60fps)
                delay = Math.min(delay * 1.2, maxDelay); // Aumentar retraso
            } else if (executionTime < 8 && delay > minDelay) { // Buen rendimiento
                delay = Math.max(delay * 0.8, minDelay); // Reducir retraso
            }
            
            return result;
        };
    },
    
    // Inicializar optimizaciones
    init: function() {
        // Crear versión limitada de la actualización de temporizadores
        this.throttledUpdateTimers = this.adaptiveThrottle(
            function() {
                // Verificar si hay órdenes que actualizar antes de llamar a las funciones
                const hasPendingOrders = Avika.data && Avika.data.pendingOrders && 
                                        Avika.data.pendingOrders.length > 0;
                                        
                const hasDeliveryOrders = Avika.data && Avika.data.deliveryOrders && 
                                         Avika.data.deliveryOrders.length > 0;
                
                // Solo actualizar si hay órdenes pendientes
                if (hasPendingOrders && typeof Avika.ui?.updatePendingTimers === 'function') {
                    Avika.ui.updatePendingTimers();
                }
                
                // Solo actualizar si hay órdenes en reparto
                if (hasDeliveryOrders && typeof Avika.ui?.updateDeliveryTimers === 'function') {
                    Avika.ui.updateDeliveryTimers();
                }
            }, 
            500,   // Mínimo retraso: 500ms (2 actualizaciones por segundo)
            2000   // Máximo retraso: 2000ms (0.5 actualizaciones por segundo)
        );
        
        // Limpiar caché periódicamente para evitar fugas de memoria
        setInterval(() => {
            // Limpiar entradas antiguas de la caché de cálculos
            const now = Date.now();
            for (const key in this._computeCache) {
                if (now - this._computeCache[key].timestamp > 5000) {
                    delete this._computeCache[key];
                }
            }
        }, 30000); // Cada 30 segundos
        
        // Optimizar eventos de scroll para mejorar rendimiento
        const optimizedScrollHandler = this.throttle(() => {
            // Notificar a los componentes que pueden necesitar actualizarse en scroll
            if (typeof Avika.ui?.onScroll === 'function') {
                Avika.ui.onScroll();
            }
        }, 100);
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
        
        console.log("Módulo de optimización mejorado inicializado");
    }
};

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    Avika.optimization.init();
});