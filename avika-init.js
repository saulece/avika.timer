// ====== PROBLEMA 1: CORREGIR EL INIT.JS ======
// Reemplaza completamente el archivo avika-init.js con este código

// avika-init.js - Script de inicialización para la aplicación Avika
// Este script debe cargarse después de todos los demás scripts de Avika

// Esperamos a que el DOM esté completamente cargado
window.Avika = window.Avika || {};
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando Avika...");
    
    // Verifica que los objetos Avika existen
    if (!window.Avika) {
        console.error("Error crítico: Objeto Avika no encontrado");
        return;
    }
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders
    });
    
    // Cargar datos guardados
    function loadSavedData() {
        console.log("Cargando datos guardados...");
        try {
            // Verificar si existe el módulo de almacenamiento
            if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
                Avika.storage.cargarDatosGuardados();
                console.log("Datos cargados correctamente");
            } else if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                // Intentar cargar datos desde localStorage manualmente
                try {
                    var pendingOrders = localStorage.getItem('avika_pendingOrders');
                    var completedOrders = localStorage.getItem('avika_completedOrders');
                    
                    if (pendingOrders) {
                        Avika.data.pendingOrders = JSON.parse(pendingOrders);
                    }
                    
                    if (completedOrders) {
                        Avika.data.completedOrders = JSON.parse(completedOrders);
                    }
                    
                    console.log("Datos cargados manualmente");
                } catch (e) {
                    console.error("Error al cargar datos manualmente:", e);
                }
            } else {
                console.warn("Módulo de almacenamiento no disponible");
            }
        } catch (e) {
            console.error("Error al cargar datos:", e);
        }
    }
    
    // Inicialización de la aplicación
    function initApp() {
        console.log("Inicializando aplicación...");
        
        // Inicializar eventos UI si existe la función
        if (Avika.ui && typeof Avika.ui.initEvents === 'function') {
            try {
                Avika.ui.initEvents();
                console.log("Eventos UI inicializados con éxito");
            } catch (e) {
                console.error("Error al inicializar eventos UI:", e);
            }
        } else {
            console.error("Función initEvents no encontrada en Avika.ui");
        }
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas para temporizadores
        if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
            setInterval(function() {
                Avika.ui.updateAllTimers();
            }, 1000);
            console.log("Temporizadores inicializados");
        }
        
        // Configurar autoguardado si está disponible
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            setInterval(function() {
                Avika.storage.guardarDatosLocales();
            }, Avika.config.autoSaveInterval || 30000);
            console.log("Autoguardado configurado");
        }
        
        // Actualizar tablas inicialmente
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable(false);
            }
        }
        
        console.log("Inicialización completa");
    }
    
    // Iniciar la aplicación
    try {
        initApp();
    } catch (e) {
        console.error("Error fatal durante la inicialización:", e);
        alert("Error al inicializar la aplicación. Consulta la consola para más detalles.");
    }
});