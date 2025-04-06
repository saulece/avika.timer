// js/avika-init.js - Script de inicialización simplificado y unificado
(function() {
    console.log("Avika Timer - Inicialización");
    
    document.addEventListener('DOMContentLoaded', function() {
        // Asegurar que tenemos el objeto global Avika
        if (!window.Avika) window.Avika = {};
        
        // Asegurar que tenemos los objetos básicos
        if (!Avika.ui) Avika.ui = {};
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
        
        // Verificar si los módulos necesarios están cargados
        function checkModulesLoaded() {
            var requiredModules = [
                { name: 'config', path: 'Avika.config' },
                { name: 'UI Controller', path: 'Avika.ui' },
                { name: 'Order Service', path: 'Avika.orders' },
                { name: 'Storage', path: 'Avika.storage' },
                { name: 'Statistics', path: 'Avika.stats' },
                { name: 'Date Utils', path: 'Avika.dateUtils' }
            ];
            
            var missingModules = [];
            
            requiredModules.forEach(function(module) {
                if (!Avika.moduleExists(module.path)) {
                    missingModules.push(module.name);
                    console.error("Módulo requerido no encontrado:", module.name);
                }
            });
            
            if (missingModules.length > 0) {
                console.error("Faltan módulos requeridos:", missingModules.join(', '));
                return false;
            }
            
            return true;
        }
        
        // Iniciar una sola vez
        if (!window.avikaInitialized) {
            console.log("Verificando módulos necesarios...");
            
            if (checkModulesLoaded()) {
                console.log("Todos los módulos cargados, iniciando aplicación...");
                
                try {
                    // Inicializar UI si existe la función
                    if (Avika.ui && typeof Avika.ui.initEvents === 'function') {
                        console.log("Inicializando eventos de UI...");
                        Avika.ui.initEvents();
                    } else {
                        console.warn("Usando inicialización de respaldo para UI");
                        // Inicialización básica de botones de categoría
                        document.querySelectorAll('.category-btn').forEach(function(btn) {
                            btn.addEventListener('click', function() {
                                var category = this.getAttribute('data-category');
                                if (Avika.ui && typeof Avika.ui.selectCategory === 'function') {
                                    Avika.ui.selectCategory(category);
                                } else {
                                    console.error("Función selectCategory no encontrada");
                                }
                            });
                        });
                    }
                    
                    // Inicializar temporizadores
                    if (Avika.data.timerInterval) {
                        clearInterval(Avika.data.timerInterval);
                    }
                    
                    console.log("Configurando temporizador de actualización...");
                    Avika.data.timerInterval = setInterval(function() {
                        if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
                            Avika.ui.updateAllTimers();
                        } else if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                            // Fallback si no existe updateAllTimers
                            Avika.ui.updatePendingTable();
                        }
                    }, Avika.config && Avika.config.timerInterval ? Avika.config.timerInterval : 1000);
                    
                    // Cargar datos guardados
                    console.log("Cargando datos guardados...");
                    if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
                        Avika.storage.cargarDatosGuardados();
                    } else {
                        console.warn("Función de carga de datos no disponible");
                    }
                    
                    // Configurar guardado automático
                    var autoSaveInterval = Avika.config && Avika.config.autoSaveInterval ? 
                                           Avika.config.autoSaveInterval : 30000;
                    
                    if (window.autoSaveTimer) {
                        clearInterval(window.autoSaveTimer);
                    }
                    
                    window.autoSaveTimer = setInterval(function() {
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                    }, autoSaveInterval);
                    
                    // Actualizar tablas
                    console.log("Actualizando tablas...");
                    if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                        Avika.ui.updatePendingTable();
                    } else {
                        console.warn("Función updatePendingTable no disponible");
                    }
                    
                    if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable(false);
                    } else {
                        console.warn("Función updateCompletedTable no disponible");
                    }
                    
                    // Marcar como inicializada
                    window.avikaInitialized = true;
                    console.log("Avika inicializado correctamente");
                    
                    // Mostrar notificación de inicialización
                    if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification("Aplicación cargada correctamente", 2000);
                    }
                    
                    // Registrar evento para cerrar/recargar página
                    window.addEventListener('beforeunload', function(e) {
                        // Guardar datos antes de cerrar
                        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                            Avika.storage.guardarDatosLocales();
                        }
                        
                        // Si hay órdenes pendientes, mostrar confirmación
                        if (Avika.data.pendingOrders && Avika.data.pendingOrders.length > 0) {
                            var message = "Hay " + Avika.data.pendingOrders.length + 
                                      " platillos en preparación. ¿Estás seguro de salir?";
                            e.returnValue = message;
                            return message;
                        }
                    });
                    
                } catch (e) {
                    console.error("Error durante la inicialización:", e);
                    
                    var errorMsg = "Error durante la inicialización: " + e.message;
                    if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                        Avika.ui.showErrorMessage(errorMsg);
                    } else {
                        alert(errorMsg);
                    }
                }
            } else {
                console.error("No se puede inicializar Avika: faltan módulos");
                var errorMsg = "Error: No se pueden cargar todos los módulos necesarios. Intenta recargar la página.";
                if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                    Avika.ui.showErrorMessage(errorMsg);
                } else {
                    alert(errorMsg);
                }
            }
        } else {
            console.log("Avika ya fue inicializado previamente");
        }
    });
})();
