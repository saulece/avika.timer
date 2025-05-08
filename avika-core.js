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
        }
    }
}, window.Avika || {});

// Log de inicialización
console.log('Avika Core inicializado - Versión:', Avika.VERSION);