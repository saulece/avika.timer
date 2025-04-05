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
    
    // Inicializar manualmente botones de categoría
    function initCategoryButtons() {
        console.log("Inicializando botones de categoría...");
        
        // Conectar los botones de categoría con sus funciones
        document.getElementById('btn-frio').addEventListener('click', function() {
            Avika.ui.selectCategory('frio');
        });
        
        document.getElementById('btn-entrada-fria').addEventListener('click', function() {
            Avika.ui.selectCategory('entrada-fria');
        });
        
        document.getElementById('btn-caliente').addEventListener('click', function() {
            Avika.ui.selectCategory('caliente');
        });
        
        document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
            Avika.ui.selectCategory('entrada-caliente');
        });
        
        document.getElementById('btn-combos').addEventListener('click', function() {
            Avika.ui.selectCategory('combos');
        });
        
        console.log("Botones de categoría inicializados correctamente");
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
            Avika.storage.cargarDatosGuardados();
            console.log("Datos cargados correctamente");
        } catch (e) {
            console.error("Error al cargar datos:", e);
        }
    }
    
    // Inicialización de la aplicación
    function initApp() {
        console.log("Inicializando aplicación...");
        
        // Inicializar componentes de UI
        initCategoryButtons();
        initServiceButtons();
        initQuantityButtons();
        initActionButtons();
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas
        setInterval(function() {
            Avika.ui.updateAllTimers();
        }, 1000);
        
        // Configurar autoguardado
        setInterval(function() {
            Avika.storage.guardarDatosLocales();
        }, Avika.config.autoSaveInterval || 30000);
        
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