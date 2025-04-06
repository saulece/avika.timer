// js/modules/date-utils.js - Utilidades centralizadas para manejo de fechas y tiempos
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    
    // Crear el módulo de utilidades de fecha
    Avika.dateUtils = {
        // Método para formatear números con ceros
        padZero: function(num) {
            if (typeof num !== 'number') {
                console.warn("padZero recibió un valor no numérico:", num);
                num = parseInt(num) || 0;
            }
            return (num < 10 ? '0' : '') + num;
        },
        
        // Método para formatear tiempo (HH:MM:SS)
        formatTime: function(date) {
            if (!date) return '--:--:--';
            
            try {
                // Convertir a objeto Date si es string
                var d = date instanceof Date ? date : new Date(date);
                
                // Verificar que la fecha sea válida
                if (isNaN(d.getTime())) {
                    console.warn("Fecha inválida en formatTime:", date);
                    return '--:--:--';
                }
                
                return this.padZero(d.getHours()) + ':' + 
                       this.padZero(d.getMinutes()) + ':' + 
                       this.padZero(d.getSeconds());
            } catch (e) {
                console.error("Error en formatTime:", e);
                return '--:--:--';
            }
        },
        
        // Método para calcular tiempo transcurrido
        calculateElapsedTime: function(startTimeStr) {
            try {
                var startTime = startTimeStr instanceof Date ? startTimeStr : new Date(startTimeStr);
                
                // Verificar fecha válida
                if (isNaN(startTime.getTime())) {
                    console.warn("Fecha de inicio inválida en calculateElapsedTime:", startTimeStr);
                    return '--:--';
                }
                
                var now = new Date();
                var elapsed = Math.floor((now - startTime) / 1000); // en segundos
                
                var hours = Math.floor(elapsed / 3600);
                var minutes = Math.floor((elapsed % 3600) / 60);
                var seconds = elapsed % 60;
                
                var timeStr = '';
                
                if (hours > 0) {
                    timeStr += hours + 'h ';
                }
                
                timeStr += this.padZero(minutes) + ':' + this.padZero(seconds);
                
                return timeStr;
            } catch (e) {
                console.error("Error al calcular tiempo transcurrido:", e);
                return "--:--";
            }
        },
        
        // Método para serializar fechas de forma segura
        serializeDate: function(date) {
            if (!date) return null;
            
            try {
                var d = date instanceof Date ? date : new Date(date);
                
                if (isNaN(d.getTime())) {
                    console.warn("Fecha inválida en serializeDate:", date);
                    return null;
                }
                
                return d.toISOString();
            } catch (e) {
                console.error("Error al serializar fecha:", e);
                return null;
            }
        },
        
        // Método para deserializar fechas de forma segura
        deserializeDate: function(dateString) {
            if (!dateString) return null;
            
            try {
                var d = new Date(dateString);
                
                if (isNaN(d.getTime())) {
                    console.warn("String de fecha inválida en deserializeDate:", dateString);
                    return null;
                }
                
                return d;
            } catch (e) {
                console.error("Error al deserializar fecha:", e);
                return null;
            }
        }
    };
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('dateUtils');
    }
    
    // Crear alias globales para compatibilidad con código existente
    window.formatTime = Avika.dateUtils.formatTime.bind(Avika.dateUtils);
    window.padZero = Avika.dateUtils.padZero.bind(Avika.dateUtils);
    window.calculateElapsedTime = Avika.dateUtils.calculateElapsedTime.bind(Avika.dateUtils);
    
    console.log("Módulo de utilidades de fecha inicializado");
})();