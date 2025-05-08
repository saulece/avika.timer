// avika-init.js - Script de inicialización para la aplicación Avika
// Este script debe cargarse después de todos los demás scripts de Avika

// Aseguramos que el objeto global Avika exista
if (!window.Avika) {
    window.Avika = {};
    console.warn('window.Avika no existía, inicializando objeto global');
}

// Inicialización de estructuras de datos principales
if (!Avika.data) {
    Avika.data = {};
    console.warn('Avika.data no existía, inicializando objeto de datos');
}

// Asegurar que todos los arrays existan
Avika.data.pendingOrders = Avika.data.pendingOrders || [];
Avika.data.deliveryOrders = Avika.data.deliveryOrders || [];
Avika.data.completedOrders = Avika.data.completedOrders || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando Avika...");
    
    // Verifica que los objetos Avika existen
    if (!window.Avika) {
        console.error("Error crítico: Objeto Avika no encontrado");
        return;
    }
    
    // Verificar que Avika.utils existe
    if (!Avika.utils) {
        console.error("Error crítico: Avika.utils no encontrado");
        return;
    }
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders,
        orderService: !!Avika.orderService,
        storage: !!Avika.storage,
        utils: !!Avika.utils,
        optimization: !!Avika.optimization
    });
    
    // Comprobar inicialización de datos
    if (Avika.data) {
        console.log("Estructuras de datos inicializadas correctamente:", {
            pendingOrders: Array.isArray(Avika.data.pendingOrders),
            deliveryOrders: Array.isArray(Avika.data.deliveryOrders),
            completedOrders: Array.isArray(Avika.data.completedOrders)
        });
    }
    
    // Inicializar manualmente botones de categoría
    function initCategoryButtons() {
        console.log("Inicializando botones de categoría...");
        
        // Esta función ahora es un stub ya que los botones de categoría fueron eliminados
        // Mantenemos la función para compatibilidad con el resto del código
        console.log("Los botones de categoría ya no existen, saltando inicialización");
    }
    
    // Inicializar botones de servicio
    function initServiceButtons() {
        console.log("Inicializando botones de servicio...");
        
        // Función auxiliar para agregar event listeners de forma segura
        function addSafeEventListener(id, event, callback) {
            var element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, callback);
                return true;
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
                return false;
            }
        }
        
        addSafeEventListener('btn-comedor', 'click', function() {
            Avika.ui.selectService(this, 'comedor');
        });
        
        addSafeEventListener('btn-domicilio', 'click', function() {
            Avika.ui.selectService(this, 'domicilio');
        });
        
        addSafeEventListener('btn-para-llevar', 'click', function() {
            Avika.ui.selectService(this, 'para-llevar');
        });
        
        console.log("Botones de servicio inicializados correctamente");
    }
    
    // Inicializar botones de cantidad
    function initQuantityButtons() {
        console.log("Inicializando botones de cantidad...");
        
        // Función auxiliar para agregar event listeners de forma segura
        function addSafeEventListener(id, event, callback) {
            var element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, callback);
                return true;
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
                return false;
            }
        }
        
        addSafeEventListener('btn-decrease', 'click', function() {
            Avika.ui.changeQuantity(-1);
        });
        
        addSafeEventListener('btn-increase', 'click', function() {
            Avika.ui.changeQuantity(1);
        });
        
        console.log("Botones de cantidad inicializados correctamente");
    }
    
    // Inicializar botones de acción
    function initActionButtons() {
        console.log("Inicializando botones de acción...");
        
        // Función auxiliar para agregar event listeners de forma segura
        function addSafeEventListener(id, event, callback) {
            var element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, callback);
                return true;
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
                return false;
            }
        }
        
        // Botones de navegación
        addSafeEventListener('btn-back-to-categories', 'click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        addSafeEventListener('btn-back-to-dishes', 'click', function() {
            Avika.ui.showSection('dishes-section');
        });
        
        addSafeEventListener('btn-start', 'click', function() {
            Avika.orders.startPreparation();
        });
        
        addSafeEventListener('btn-cancel', 'click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        // Botón para nuevo ticket
        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
            btnNewTicket.addEventListener('click', function() {
                Avika.ui.enableTicketMode();
            });
        } else {
            console.warn("Elemento 'btn-new-ticket' no encontrado");
        }
        
        // Botones de filtrado
        addSafeEventListener('btn-apply-filter', 'click', function() {
            Avika.ui.aplicarFiltros();
        });
        
        addSafeEventListener('btn-clear-filter', 'click', function() {
            Avika.ui.limpiarFiltros();
        });
        
        // Botones de filtrado para historial
        var btnShowAllHistory = document.getElementById('btn-show-all-history');
        var btnShowRecent = document.getElementById('btn-show-recent');
        
        if (btnShowAllHistory && btnShowRecent) {
            btnShowAllHistory.addEventListener('click', function() {
                btnShowAllHistory.classList.add('active');
                btnShowRecent.classList.remove('active');
                Avika.ui.updateCompletedTable(true);
            });
            
            btnShowRecent.addEventListener('click', function() {
                btnShowRecent.classList.add('active');
                btnShowAllHistory.classList.remove('active');
                Avika.ui.updateCompletedTable(false);
            });
        } else {
            console.warn("Elementos de filtrado de historial no encontrados");
        }
        
        // Botón de exportar
        addSafeEventListener('btn-export', 'click', function() {
            Avika.stats.exportarDatos();
        });
        
        // Botón para desbloquear tickets atorados
        addSafeEventListener('btn-force-complete', 'click', function() {
            Avika.ui.showForceCompleteModal();
        });
        
        // Botón para ver estadísticas y promedios
        addSafeEventListener('btn-show-stats', 'click', function() {
            Avika.stats.calcularPromedios();
        });
        
        // Botones de filtrado para reparto
        addSafeEventListener('btn-apply-delivery-filter', 'click', function() {
            var filterElement = document.getElementById('filter-delivery-time');
            if (filterElement) {
                var tiempoSeleccionado = filterElement.value;
                Avika.ui.filtrarReparto(tiempoSeleccionado);
            }
        });
        
        addSafeEventListener('btn-clear-delivery-filter', 'click', function() {
            var filterElement = document.getElementById('filter-delivery-time');
            if (filterElement) {
                filterElement.value = 'todos';
                Avika.ui.limpiarFiltrosReparto();
            }
        });

        // Botón para limpiar historial
        addSafeEventListener('btn-clear-history', 'click', function() {
            Avika.storage.limpiarHistorial();
        });
        
        console.log("Botones de acción inicializados correctamente");
    }
    
    // Cargar datos guardados
    function loadSavedData() {
        console.log("Cargando datos guardados...");
        try {
            // Verificar que Avika y Avika.data existen
            if (!window.Avika) {
                window.Avika = {};
                console.warn('window.Avika no existía durante loadSavedData, inicializando objeto global');
            }
            
            if (!Avika.data) {
                Avika.data = {};
                console.warn('Avika.data no existía durante loadSavedData, inicializando objeto de datos');
        }
        
            // Verificar que los arrays existen
            if (!Array.isArray(Avika.data.pendingOrders)) {
                Avika.data.pendingOrders = [];
                console.warn('Avika.data.pendingOrders no era un array, inicializando');
            }
            
            if (!Array.isArray(Avika.data.deliveryOrders)) {
                Avika.data.deliveryOrders = [];
                console.warn('Avika.data.deliveryOrders no era un array, inicializando');
            }
            
            if (!Array.isArray(Avika.data.completedOrders)) {
                Avika.data.completedOrders = [];
                console.warn('Avika.data.completedOrders no era un array, inicializando');
            }
            
            // Verificar que el módulo de almacenamiento esté disponible
            if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
                Avika.storage.cargarDatosGuardados();
                console.log("Datos cargados correctamente");
            } else {
                console.warn("Módulo de almacenamiento no disponible, no se pudieron cargar datos");
            }
        } catch (e) {
            console.error("Error al cargar datos:", e);
            // Asegurar que los arrays existen en caso de error
            if (!Avika.data) Avika.data = {};
            if (!Array.isArray(Avika.data.pendingOrders)) Avika.data.pendingOrders = [];
            if (!Array.isArray(Avika.data.deliveryOrders)) Avika.data.deliveryOrders = [];
            if (!Array.isArray(Avika.data.completedOrders)) Avika.data.completedOrders = [];
        }
    }
    
    // Inicialización de la aplicación
    function initApp() {
        console.log("Inicializando aplicación...");
        
        // Asegurar que las estructuras de datos están inicializadas
        if (!window.Avika) {
            window.Avika = {};
            console.warn('window.Avika no existía durante initApp, inicializando objeto global');
        }
        
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existía durante initApp, inicializando objeto de datos');
        }
        
        // Verificar y crear arrays si no existen
        if (!Array.isArray(Avika.data.pendingOrders)) {
            console.warn('Avika.data.pendingOrders no era un array, inicializando');
            Avika.data.pendingOrders = [];
        }
        
        if (!Array.isArray(Avika.data.deliveryOrders)) {
            console.warn('Avika.data.deliveryOrders no era un array, inicializando');
            Avika.data.deliveryOrders = [];
        }
        
        if (!Array.isArray(Avika.data.completedOrders)) {
            console.warn('Avika.data.completedOrders no era un array, inicializando');
            Avika.data.completedOrders = [];
        }
        
        // Inicializar componentes de UI
        initCategoryButtons(); // Ahora es seguro llamarlo porque maneja el caso de botones faltantes
        initServiceButtons();
        initQuantityButtons();
        initActionButtons();
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas (optimizadas)
        // Iniciar la primera actualización de temporizadores
        const timerUpdateInterval = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
            Avika.utils.TIME_CONSTANTS.TIMER_UPDATE_INTERVAL_MS : 2000;
            
        if (Avika.optimization && Avika.optimization.throttledUpdateTimers) {
            // Usar la función optimizada con throttle adaptativo
            Avika.optimization.throttledUpdateTimers();
            console.log("Utilizando actualización de temporizadores optimizada adaptativa");
        } else if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
            // Iniciar el ciclo de actualización autogestionado en UI
            Avika.ui.updateAllTimers();
            console.log("Utilizando actualización de temporizadores estándar");
        } else {
            // Fallback a un intervalo simple si no hay mejores opciones
            console.warn("Usando método de actualización de temporizadores de respaldo");
            setInterval(function() {
                // NOTA: Ya no usamos Avika.orderService.updateAllTimers porque ha sido centralizado en Avika.ui
                if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
                    Avika.ui.updateAllTimers();
                }
            }, timerUpdateInterval);
        }

        // Configurar autoguardado con optimización
        const autoSaveInterval = Avika.utils && Avika.utils.TIME_CONSTANTS ? 
            Avika.utils.TIME_CONSTANTS.AUTO_SAVE_INTERVAL_MS : 
            (Avika.config && Avika.config.autoSaveInterval || 30000);
            
        // Usar debounce para el autoguardado si está disponible
        if (Avika.optimization && typeof Avika.optimization.debounce === 'function') {
            const debouncedSave = Avika.optimization.debounce(function() {
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    console.log("Guardando datos (debounced)...");
                    Avika.storage.guardarDatosLocales();
                }
            }, 1000); // 1 segundo de debounce
            
            // Configurar intervalo de guardado
            setInterval(debouncedSave, autoSaveInterval);
            
            // También guardar al salir de la página
            window.addEventListener('beforeunload', function() {
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            });
        } else {
            // Método tradicional si no está disponible debounce
            setInterval(function() {
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            }, autoSaveInterval);
        }
        
        console.log("Inicialización completa");
    }
    
    // Iniciar la aplicación
    initApp();
    
    // Botón para modo compacto
    var btnCompactMode = document.getElementById('btn-compact-mode');
    if (btnCompactMode) {
        btnCompactMode.addEventListener('click', function() {
            Avika.ui.toggleCompactMode();
        });
    } else {
        console.warn("Elemento 'btn-compact-mode' no encontrado");
    }

    // Restaurar preferencias de modo compacto si existe
    if (localStorage.getItem('avika_compact_mode') === 'true') {
        document.body.classList.add('ultra-compact-mode');
        document.getElementById('compact-icon').textContent = '📱';
    }
});