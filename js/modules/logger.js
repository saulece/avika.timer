// js/modules/logger.js - Sistema central de logging
(function() {
    window.Avika = window.Avika || {};
    
    // Niveles de log
    var LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };
    
    // Nivel actual (configurable)
    var currentLevel = LOG_LEVELS.INFO;
    
    // Historial de logs para depuración
    var logHistory = [];
    var maxHistorySize = 1000;
    
    // Sistema de logging
    Avika.logger = {
        // Métodos principales
        error: function(message, data) {
            this.log(LOG_LEVELS.ERROR, message, data);
        },
        
        warn: function(message, data) {
            this.log(LOG_LEVELS.WARN, message, data);
        },
        
        info: function(message, data) {
            this.log(LOG_LEVELS.INFO, message, data);
        },
        
        debug: function(message, data) {
            this.log(LOG_LEVELS.DEBUG, message, data);
        },
        
        // Método principal para logging
        log: function(level, message, data) {
            if (level > currentLevel) return;
            
            var timestamp = new Date().toISOString();
            var levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';
            
            // Formatear mensaje de log
            var logMsg = '[' + timestamp + '][' + levelName + '] ' + message;
            
            // Registrar en consola
            switch (level) {
                case LOG_LEVELS.ERROR:
                    console.error(logMsg, data || '');
                    break;
                case LOG_LEVELS.WARN:
                    console.warn(logMsg, data || '');
                    break;
                case LOG_LEVELS.INFO:
                    console.info(logMsg, data || '');
                    break;
                case LOG_LEVELS.DEBUG:
                    console.debug(logMsg, data || '');
                    break;
                default:
                    console.log(logMsg, data || '');
            }
            
            // Guardar en historial
            logHistory.push({
                timestamp: timestamp,
                level: levelName,
                message: message,
                data: data
            });
            
            // Limitar tamaño del historial
            if (logHistory.length > maxHistorySize) {
                logHistory.shift();
            }
        },
        
        // Establecer nivel de log
        setLevel: function(level) {
            if (typeof level === 'string') {
                level = level.toUpperCase();
                if (LOG_LEVELS[level] !== undefined) {
                    currentLevel = LOG_LEVELS[level];
                } else {
                    console.warn('Nivel de log inválido:', level);
                }
            } else if (typeof level === 'number') {
                if (level >= 0 && level <= 3) {
                    currentLevel = level;
                } else {
                    console.warn('Nivel de log inválido:', level);
                }
            }
        },
        
        // Obtener historial de logs
        getHistory: function() {
            return logHistory.slice();
        },
        
        // Exportar logs
        exportLogs: function() {
            var logsText = logHistory.map(function(entry) {
                return '[' + entry.timestamp + '][' + entry.level + '] ' + entry.message + 
                       (entry.data ? ' ' + JSON.stringify(entry.data) : '');
            }).join('\n');
            
            var blob = new Blob([logsText], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            
            var downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'avika_logs_' + new Date().toISOString().slice(0, 10) + '.txt';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('logger');
    }
    
    console.log("Módulo de logging inicializado");
})();