// ====== PROBLEMA 1: CORREGIR EL INIT.JS ======
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
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders,
        orderService: !!Avika.orderService,
        storage: !!Avika.storage
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
        
        document.getElementById('btn-comedor').addEventListener('click', function() {
            Avika.ui.selectService(this, 'comedor');
        });
        
        document.getElementById('btn-domicilio').addEventListener('click', function() {
            Avika.ui.selectService(this, 'domicilio');
        });
        
        document.getElementById('btn-para-llevar').addEventListener('click', function() {
            Avika.ui.selectService(this, 'para-llevar');
        });
        
        console.log("Botones de servicio inicializados correctamente");
    }
    
    // Inicializar botones de cantidad
    function initQuantityButtons() {
        console.log("Inicializando botones de cantidad...");
        
        document.getElementById('btn-decrease').addEventListener('click', function() {
            Avika.ui.changeQuantity(-1);
        });
        
        document.getElementById('btn-increase').addEventListener('click', function() {
            Avika.ui.changeQuantity(1);
        });
        
        console.log("Botones de cantidad inicializados correctamente");
    }
    
    // Inicializar botones de acción
    function initActionButtons() {
        console.log("Inicializando botones de acción...");
        
        document.getElementById('btn-back-to-categories').addEventListener('click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        document.getElementById('btn-back-to-dishes').addEventListener('click', function() {
            Avika.ui.showSection('dishes-section');
        });
        
        document.getElementById('btn-start').addEventListener('click', function() {
            Avika.orders.startPreparation();
        });
        
        document.getElementById('btn-cancel').addEventListener('click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        // Botón para nuevo ticket
        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
            btnNewTicket.addEventListener('click', function() {
                Avika.ui.enableTicketMode();
            });
            // Botones de filtrado
document.getElementById('btn-apply-filter').addEventListener('click', function() {
    Avika.ui.aplicarFiltros();
});

document.getElementById('btn-clear-filter').addEventListener('click', function() {
    Avika.ui.limpiarFiltros();
});
        }
        
        // Botones de filtrado para historial
        var btnShowAllHistory = document.getElementById('btn-show-all-history');
        var btnShowRecent = document.getElementById('btn-show-recent');
        
        if (btnShowAllHistory) {
            btnShowAllHistory.addEventListener('click', function() {
                btnShowAllHistory.classList.add('active');
                btnShowRecent.classList.remove('active');
                Avika.ui.updateCompletedTable(true);
            });
        }
        
        if (btnShowRecent) {
            btnShowRecent.addEventListener('click', function() {
                btnShowRecent.classList.add('active');
                btnShowAllHistory.classList.remove('active');
                Avika.ui.updateCompletedTable(false);
            });
        }
        
        // Botón de exportar
        var btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', function() {
                Avika.stats.exportarDatos();
            });
        }
        
        // Botón para desbloquear tickets atorados
        document.getElementById('btn-force-complete').onclick = function() {
            Avika.ui.showForceCompleteModal();
        };
        
        // Botón para ver estadísticas y promedios
        var btnShowStats = document.getElementById('btn-show-stats');
        if (btnShowStats) {
            btnShowStats.addEventListener('click', function() {
                Avika.stats.calcularPromedios();
            });
        }
        // Botones de filtrado para reparto
document.getElementById('btn-apply-delivery-filter').addEventListener('click', function() {
    var tiempoSeleccionado = document.getElementById('filter-delivery-time').value;
    Avika.ui.filtrarReparto(tiempoSeleccionado);
});

document.getElementById('btn-clear-delivery-filter').addEventListener('click', function() {
    document.getElementById('filter-delivery-time').value = 'todos';
    Avika.ui.limpiarFiltrosReparto();
});

        // Botón para limpiar historial
        var btnClearHistory = document.getElementById('btn-clear-history');
        if (btnClearHistory) {
            btnClearHistory.addEventListener('click', function() {
                Avika.storage.limpiarHistorial();
            });
        }
        
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
        
        // Inicializar la corrección de colores de tickets
        if (Avika.ui && typeof Avika.ui.initTicketColorFix === 'function') {
            console.log("Inicializando corrección de colores de tickets...");
            Avika.ui.initTicketColorFix();
        }
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas (optimizadas)
setInterval(function() {
    // Usar la función throttled para mejor rendimiento
    if (Avika.optimization && Avika.optimization.throttledUpdateTimers) {
        Avika.optimization.throttledUpdateTimers();
    } else if (Avika.orderService && typeof Avika.orderService.updateAllTimers === 'function') {
        // Fallback a la función normal si no está disponible la optimizada
        Avika.orderService.updateAllTimers();
    } else if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
        // Fallback a la función anterior si existe
        Avika.ui.updateAllTimers();
    }
}, Avika.utils && Avika.utils.TIME_CONSTANTS ? 
   Avika.utils.TIME_CONSTANTS.TIMER_UPDATE_INTERVAL_MS : 2000);

// Configurar autoguardado
setInterval(function() {
    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
        Avika.storage.guardarDatosLocales();
    }
}, Avika.utils && Avika.utils.TIME_CONSTANTS ? 
   Avika.utils.TIME_CONSTANTS.AUTO_SAVE_INTERVAL_MS : 
   (Avika.config && Avika.config.autoSaveInterval || 30000));
        
        console.log("Inicialización completa");
    }
    
    // Iniciar la aplicación
    try {
        initApp();
        // Ya no activamos automáticamente el modo de tickets al iniciar la aplicación
        // El usuario debe hacer clic en el botón 'Nuevo Ticket/Comanda' manualmente
    } catch (e) {
        console.error("Error fatal durante la inicialización:", e);
        alert("Error al inicializar la aplicación. Consulta la consola para más detalles.");
    }
    
    // Botón para modo compacto
    document.getElementById('btn-compact-mode').addEventListener('click', function() {
        Avika.ui.toggleCompactMode();
    });

    // Restaurar preferencias de modo compacto si existe
    if (localStorage.getItem('avika_compact_mode') === 'true') {
        document.body.classList.add('ultra-compact-mode');
        document.getElementById('compact-icon').textContent = '📱';
    }
});