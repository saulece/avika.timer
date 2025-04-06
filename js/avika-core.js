// js/avika-core.js - Archivo de definición del objeto principal Avika
// Este archivo debe cargarse antes que cualquier otro módulo

// Definir el objeto global Avika si no existe
window.Avika = window.Avika || {};

// Información de versión y metadatos básicos
Avika.VERSION = '1.0.0';
Avika.APP_NAME = 'Avika - Temporizador de Sushi';

// Función auxiliar para verificar si un objeto/módulo existe
Avika.moduleExists = function(modulePath) {
    try {
        var parts = modulePath.split('.');
        var obj = window;
        
        for (var i = 0; i < parts.length; i++) {
            if (!obj[parts[i]]) {
                return false;
            }
            obj = obj[parts[i]];
        }
        
        return true;
    } catch (e) {
        console.error("Error al verificar módulo:", e);
        return false;
    }
};

// Función para crear namespace de forma segura
Avika.createNamespace = function(namespace) {
    try {
        var parts = namespace.split('.');
        var parent = window;
        
        for (var i = 0; i < parts.length; i++) {
            if (typeof parent[parts[i]] === 'undefined') {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        
        return parent;
    } catch (e) {
        console.error("Error al crear namespace:", e);
        return null;
    }
};

// Función para registrar módulos cargados
Avika.modules = {};
Avika.registerModule = function(moduleName) {
    console.log("Módulo registrado:", moduleName);
    Avika.modules[moduleName] = true;
};

// Verificar que el objeto está definido correctamente
console.log("Avika Core v" + Avika.VERSION + " inicializado");
