// fix.js - Correcciones para problemas específicos de la aplicación

// Asegurar que tenemos el objeto global Avika
if (!window.Avika) window.Avika = {};
if (!Avika.ui) Avika.ui = {};
if (!Avika.dateUtils) Avika.dateUtils = {};

// Corregir error de "Cannot read properties of undefined (reading 'bind')"
// Este error ocurre cuando se intenta hacer bind a una función que no existe

// 1. Asegurar que las funciones básicas existen en Avika.ui
Avika.ui.formatTime = Avika.ui.formatTime || function(date) {
    if (!date) return '--:--:--';
    
    try {
        // Asegurarnos de que date sea un objeto Date
        var d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            return '--:--:--';
        }
        
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();
        
        function pad(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    } catch (e) {
        return '--:--:--';
    }
};

// 2. Agregar calculateElapsedTime si falta en Avika.ui
Avika.ui.calculateElapsedTime = Avika.ui.calculateElapsedTime || function(startTimeStr) {
    try {
        var startTime = startTimeStr instanceof Date ? startTimeStr : new Date(startTimeStr);
        
        // Verificar fecha válida
        if (isNaN(startTime.getTime())) {
            return '--:--';
        }
        
        var now = new Date();
        var elapsed = Math.floor((now - startTime) / 1000); // en segundos
        
        var hours = Math.floor(elapsed / 3600);
        var minutes = Math.floor((elapsed % 3600) / 60);
        var seconds = elapsed % 60;
        
        function pad(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        var timeStr = '';
        if (hours > 0) {
            timeStr += hours + 'h ';
        }
        
        timeStr += pad(minutes) + ':' + pad(seconds);
        return timeStr;
    } catch (e) {
        return "--:--";
    }
};

// 3. Asegurar que padZero existe
Avika.ui.padZero = Avika.ui.padZero || function(num) {
    return (num < 10 ? '0' : '') + num;
};

// 4. Establecer métodos globales
window.formatTime = window.formatTime || Avika.ui.formatTime;
window.calculateElapsedTime = window.calculateElapsedTime || Avika.ui.calculateElapsedTime;
window.padZero = window.padZero || Avika.ui.padZero;

// 5. Corregir el método ensureFormatFunctions para evitar errores
var originalEnsureFormatFunctions = Avika.ui.ensureFormatFunctions;
Avika.ui.ensureFormatFunctions = function() {
    try {
        if (typeof window.formatTime !== 'function') {
            window.formatTime = Avika.ui.formatTime;
        }
        
        if (typeof window.calculateElapsedTime !== 'function') {
            window.calculateElapsedTime = Avika.ui.calculateElapsedTime;
        }
        
        if (typeof window.padZero !== 'function') {
            window.padZero = Avika.ui.padZero;
        }
        
        // También crear alias para acceder desde cualquier contexto
        Avika.formatTime = Avika.ui.formatTime;
        Avika.calculateElapsedTime = Avika.ui.calculateElapsedTime;
        Avika.padZero = Avika.ui.padZero;
        
        console.log("Funciones de formato corregidas");
        return true;
    } catch (e) {
        console.error("Error al asegurar funciones de formato:", e);
        return false;
    }
};

// Registrar fix como cargado correctamente
console.log("Fix.js cargado - Correcciones aplicadas");
