// ====== PROBLEMA 1: CORREGIR EL INIT.JS ======
// Reemplaza completamente el archivo avika-init.js con este código

// avika-init.js - Script de inicialización para la aplicación Avika
// Este script debe cargarse después de todos los demás scripts de Avika

// Esperamos a que el DOM esté completamente cargado
window.Avika = window.Avika || {};

// Inicializar el objeto data si no existe
if (!Avika.data) {
    Avika.data = {
        currentCategory: '',
        currentDish: '',
        currentCustomizations: [],
        currentService: 'comedor',
        currentQuantity: 1,
        isSpecialCombo: false,
        pendingOrders: [],
        completedOrders: [],
        timerInterval: null
    };
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando Avika...");
    
    // Verificamos si estamos en un dispositivo móvil y activamos la depuración si es necesario
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log("Dispositivo móvil detectado");
        
        // Intentar activar consola de depuración para móviles
        if (window.Avika && window.Avika.ui && typeof window.Avika.ui.enableMobileDebugging === 'function') {
            window.Avika.ui.enableMobileDebugging();
        } else {
            // Si no existe la función, la implementamos directamente aquí
            try {
                console.log("Activando consola de depuración básica...");
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/eruda';
                script.onload = function() {
                    if (typeof eruda !== 'undefined') {
                        eruda.init();
                        console.log("Consola de depuración móvil activada");
                    }
                };
                document.head.appendChild(script);
            } catch (e) {
                console.error("No se pudo activar la consola de depuración:", e);
            }
        }
    }
    
    // Verifica que los objetos Avika existen
    if (!window.Avika) {
        console.error("Error crítico: Objeto Avika no encontrado");
        if (typeof showErrorMessage === 'function') {
            showErrorMessage("Error crítico: No se pudo inicializar la aplicación correctamente.");
        } else {
            alert("Error crítico: No se pudo inicializar la aplicación correctamente.");
        }
        return;
    }
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders
    });
    
    // Verificar que las funciones de formato estén disponibles y sean válidas
    if (Avika.ui) {
        // Asegurar que formatTime está correctamente definida
        if (typeof Avika.ui.formatTime !== 'function') {
            console.error("Función formatTime no encontrada, implementando versión básica");
            Avika.ui.formatTime = function(date) {
                if (!date) return '--:--:--';
                try {
                    var d = new Date(date);
                    var hours = d.getHours().toString().padStart(2, '0');
                    var minutes = d.getMinutes().toString().padStart(2, '0');
                    var seconds = d.getSeconds().toString().padStart(2, '0');
                    return hours + ':' + minutes + ':' + seconds;
                } catch (e) {
                    console.error("Error al formatear hora:", e);
                    return '--:--:--';
                }
            };
        }
        
        // Asegurar que padZero está disponible
        if (typeof Avika.ui.padZero !== 'function') {
            console.error("Función padZero no encontrada, implementando versión básica");
            Avika.ui.padZero = function(num) {
                return (num < 10 ? '0' : '') + num;
            };
        }
        
        // Asegurar que calculateElapsedTime está disponible
        if (typeof Avika.ui.calculateElapsedTime !== 'function') {
            console.error("Función calculateElapsedTime no encontrada, implementando versión básica");
            Avika.ui.calculateElapsedTime = function(startTimeStr) {
                try {
                    var startTime = new Date(startTimeStr);
                    var now = new Date();
                    var elapsed = Math.floor((now - startTime) / 1000); // en segundos
                    
                    var hours = Math.floor(elapsed / 3600);
                    var minutes = Math.floor((elapsed % 3600) / 60);
                    var seconds = elapsed % 60;
                    
                    var timeStr = '';
                    
                    if (hours > 0) {
                        timeStr += hours + 'h ';
                    }
                    
                    timeStr += minutes.toString().padStart(2, '0') + ':' + 
                               seconds.toString().padStart(2, '0');
                    
                    return timeStr;
                } catch (e) {
                    console.error("Error al calcular tiempo transcurrido:", e);
                    return "--:--";
                }
            };
        }
        
        // Crear alias globales para facilitar acceso
        window.formatTime = Avika.ui.formatTime;
        window.padZero = Avika.ui.padZero;
        window.calculateElapsedTime = Avika.ui.calculateElapsedTime;
        
        // También en el objeto Avika
        Avika.formatTime = Avika.ui.formatTime;
        Avika.padZero = Avika.ui.padZero;
        Avika.calculateElapsedTime = Avika.ui.calculateElapsedTime;
    }
    
    // Mostrar mensaje de error si no hay UI
    if (!Avika.ui) {
        console.error("Error crítico: Módulo UI no encontrado");
        alert("Error crítico: La interfaz de usuario no se ha cargado correctamente.");
        return;
    }
    
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
        
        // Detectar tipo de dispositivo
        if (Avika.ui && typeof Avika.ui.detectDevice === 'function') {
            try {
                var isMobile = Avika.ui.detectDevice();
                console.log("¿Dispositivo móvil?: " + isMobile);
            } catch (e) {
                console.error("Error al detectar dispositivo:", e);
            }
        }
        
        // Inicializar botones de categoría si existe la función
        if (Avika.ui && typeof Avika.ui.initCategoryButtons === 'function') {
            try {
                var categoryButtonsInitialized = Avika.ui.initCategoryButtons();
                console.log("Botones de categoría inicializados: " + categoryButtonsInitialized);
            } catch (e) {
                console.error("Error al inicializar botones de categoría:", e);
            }
        } else {
            console.warn("Función initCategoryButtons no encontrada");
        }
        
        // Inicializar eventos UI si existe la función
        if (Avika.ui && typeof Avika.ui.initEvents === 'function') {
            try {
                var eventsInitialized = Avika.ui.initEvents();
                if (eventsInitialized === false) {
                    console.error("La inicialización de eventos falló. Revise los errores anteriores.");
                    return false;
                }
                console.log("Eventos UI inicializados con éxito");
            } catch (e) {
                console.error("Error al inicializar eventos UI:", e);
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage("Error al inicializar los eventos: " + e.message);
                } else {
                    alert("Error al inicializar los eventos: " + e.message);
                }
                return false;
            }
        } else {
            console.error("Función initEvents no encontrada en Avika.ui");
            alert("No se encontró la función para inicializar eventos. La aplicación no puede continuar.");
            return false;
        }
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas para temporizadores
        if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
            setInterval(function() {
                try {
                    Avika.ui.updateAllTimers();
                } catch (e) {
                    console.error("Error al actualizar temporizadores:", e);
                }
            }, 1000);
            console.log("Temporizadores inicializados");
        } else {
            console.warn("Función updateAllTimers no encontrada. Los temporizadores no funcionarán.");
        }
        
        // Configurar autoguardado si está disponible
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            setInterval(function() {
                try {
                    Avika.storage.guardarDatosLocales();
                } catch (e) {
                    console.error("Error al guardar datos locales:", e);
                }
            }, Avika.config && Avika.config.autoSaveInterval ? Avika.config.autoSaveInterval : 30000);
            console.log("Autoguardado configurado");
        } else {
            console.warn("Autoguardado no disponible. Los datos no se guardarán automáticamente.");
        }
        
        // Actualizar tablas inicialmente
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                try {
                    Avika.ui.updatePendingTable();
                } catch (e) {
                    console.error("Error al actualizar tabla de pendientes:", e);
                }
            } else {
                console.warn("Función updatePendingTable no encontrada.");
            }
            
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                try {
                    Avika.ui.updateCompletedTable(false);
                } catch (e) {
                    console.error("Error al actualizar tabla de completados:", e);
                }
            } else {
                console.warn("Función updateCompletedTable no encontrada.");
            }
        }
        
        console.log("Inicialización completa");
        return true;
    }
    
    // Iniciar la aplicación
    try {
        var initialized = initApp();
        if (initialized === false) {
            console.error("La aplicación no se pudo inicializar completamente");
        }
    } catch (e) {
        console.error("Error fatal durante la inicialización:", e);
        console.error("Stack:", e.stack);
        alert("Error al inicializar la aplicación: " + e.message + ". Consulta la consola para más detalles.");
    }
});