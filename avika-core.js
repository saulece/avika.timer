// avika-core.js - Archivo de definición del objeto principal Avika
// Este archivo debe cargarse antes que cualquier otro módulo

// Definir el objeto global Avika de manera más robusta
window.Avika = Object.assign({
    // Información de versión y metadatos básicos
    VERSION: '1.0.0',
    APP_NAME: 'Avika - Temporizador de Sushi',
    
    // Inicialización de estructuras de datos principales
    data: {
        pendingOrders: [],
        deliveryOrders: [],
        completedOrders: []
    },
    
    // Objeto para utilidades compartidas
    utils: {
        // Constantes de tiempo para toda la aplicación
        TIME_CONSTANTS: {
            TEN_MINUTES_IN_SECONDS: 600,      // 10 minutos
            FIFTEEN_MINUTES_IN_SECONDS: 900,  // 15 minutos
            THIRTY_MINUTES_IN_SECONDS: 1800,  // 30 minutos
            NOTIFICATION_TIMEOUT_MS: 3000,    // 3 segundos
            AUTO_SAVE_INTERVAL_MS: 30000,     // 30 segundos
            TIMER_UPDATE_INTERVAL_MS: 2000    // 2 segundos
        },
        
        // Función para validar fechas - Implementación centralizada
        isValidDate: function(date) {
            return date instanceof Date && !isNaN(date.getTime());
        },
        
        // Función para añadir ceros a números - Implementación centralizada
        padZero: function(num) {
            return (num < 10 ? '0' : '') + num;
        },
        
        // Función para formatear tiempo - Implementación centralizada
        formatTime: function(date) {
            if (!date) return '--:--:--';
            
            var hours = this.padZero(date.getHours());
            var minutes = this.padZero(date.getMinutes());
            var seconds = this.padZero(date.getSeconds());
            return hours + ':' + minutes + ':' + seconds;
        },
        
        // Función para formatear tiempo transcurrido - Implementación centralizada
        formatElapsedTime: function(seconds) {
            if (seconds === undefined || seconds === null || isNaN(seconds)) {
                return '--:--:--';
            }
            
            var hours = Math.floor(seconds / 3600);
            var minutes = Math.floor((seconds % 3600) / 60);
            var secs = Math.floor(seconds % 60);
            
            return this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(secs);
        },
        
        // Sistema de logging centralizado
        log: {
            level: 'info', // 'debug', 'info', 'warn', 'error', 'none'
            
            debug: function(msg, ...args) {
                if (['debug'].includes(this.level)) console.debug(msg, ...args);
            },
            
            info: function(msg, ...args) {
                if (['debug', 'info'].includes(this.level)) console.info(msg, ...args);
            },
            
            warn: function(msg, ...args) {
                if (['debug', 'info', 'warn'].includes(this.level)) console.warn(msg, ...args);
            },
            
            error: function(msg, ...args) {
                if (['debug', 'info', 'warn', 'error'].includes(this.level)) console.error(msg, ...args);
            }
        },
        
        // Función segura para obtener elementos DOM - Implementación centralizada
        getElement: function(id) {
            var el = document.getElementById(id);
            if (!el && this.log) this.log.warn('Elemento no encontrado:', id);
            return el;
        },
        
        // Función eficiente para encontrar una orden por su ID - Implementación centralizada
        findOrderById: function(orderId) {
            if (!orderId) return null;
            
            // Crear un mapa de órdenes si no existe para mejorar el rendimiento
            if (!this._orderCache) {
                this._orderCache = {
                    timestamp: Date.now(),
                    pendingMap: {},
                    deliveryMap: {},
                    completedMap: {}
                };
                
                // Llenar el mapa con las órdenes pendientes
                if (Avika.data && Avika.data.pendingOrders) {
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var order = Avika.data.pendingOrders[i];
                        if (order && order.id) {
                            this._orderCache.pendingMap[order.id] = {
                                order: order,
                                type: 'pending',
                                index: i
                            };
                        }
                    }
                }
                
                // Llenar el mapa con las órdenes en reparto
                if (Avika.data && Avika.data.deliveryOrders) {
                    for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                        var order = Avika.data.deliveryOrders[i];
                        if (order && order.id) {
                            this._orderCache.deliveryMap[order.id] = {
                                order: order,
                                type: 'delivery',
                                index: i
                            };
                        }
                    }
                }
                
                // Llenar el mapa con las órdenes completadas (limitado a las más recientes para eficiencia)
                if (Avika.data && Avika.data.completedOrders) {
                    var maxCompletedToCache = 100; // Limitar a las 100 órdenes más recientes
                    var completedToCache = Avika.data.completedOrders.slice(0, maxCompletedToCache);
                    for (var i = 0; i < completedToCache.length; i++) {
                        var order = completedToCache[i];
                        if (order && order.id) {
                            this._orderCache.completedMap[order.id] = {
                                order: order,
                                type: 'completed',
                                index: i
                            };
                        }
                    }
                }
            } else {
                // Verificar si el caché es demasiado antiguo (más de 5 segundos) y regenerarlo si es necesario
                if (Date.now() - this._orderCache.timestamp > 5000) {
                    // Limpiar el caché para forzar su regeneración en la próxima llamada
                    this._orderCache = null;
                    return this.findOrderById(orderId); // Llamada recursiva para regenerar el caché
                }
            }
            
            // Buscar en los mapas de órdenes
            if (this._orderCache.pendingMap[orderId]) {
                return this._orderCache.pendingMap[orderId];
            }
            
            if (this._orderCache.deliveryMap[orderId]) {
                return this._orderCache.deliveryMap[orderId];
            }
            
            if (this._orderCache.completedMap[orderId]) {
                return this._orderCache.completedMap[orderId];
            }
            
            // Si no se encuentra en el caché, buscar directamente en los arrays (menos eficiente)
            if (Avika.data) {
                // Buscar en órdenes pendientes
                if (Avika.data.pendingOrders) {
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        if (Avika.data.pendingOrders[i].id === orderId) {
                            return {
                                order: Avika.data.pendingOrders[i],
                                type: 'pending',
                                index: i
                            };
                        }
                    }
                }
                
                // Buscar en órdenes en reparto
                if (Avika.data.deliveryOrders) {
                    for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                        if (Avika.data.deliveryOrders[i].id === orderId) {
                            return {
                                order: Avika.data.deliveryOrders[i],
                                type: 'delivery',
                                index: i
                            };
                        }
                    }
                }
                
                // Buscar en órdenes completadas (limitado para eficiencia)
                if (Avika.data.completedOrders) {
                    var maxToSearch = Math.min(Avika.data.completedOrders.length, 100);
                    for (var i = 0; i < maxToSearch; i++) {
                        if (Avika.data.completedOrders[i].id === orderId) {
                            return {
                                order: Avika.data.completedOrders[i],
                                type: 'completed',
                                index: i
                            };
                        }
                    }
                }
            }
            
            return null;
        }
    }
}, window.Avika || {});

// Log de inicialización
console.log('Avika Core inicializado - Versión:', Avika.VERSION);