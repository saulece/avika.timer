// ui-controller.js - Orquestador principal de la interfaz de usuario
// Este archivo actúa como punto central de coordinación entre los diferentes módulos UI
window.Avika = window.Avika || {};

// Asegurarse de que Avika.utils esté disponible
if (!Avika.utils) {
    console.warn('Avika.utils no está disponible, se creará una implementación básica');
    Avika.utils = {
        // Constantes de tiempo para toda la aplicación
        TIME_CONSTANTS: {
            TEN_MINUTES_IN_SECONDS: 600,      // 10 minutos
            FIFTEEN_MINUTES_IN_SECONDS: 900,  // 15 minutos
            THIRTY_MINUTES_IN_SECONDS: 1800,  // 30 minutos
            NOTIFICATION_TIMEOUT_MS: 3000,    // 3 segundos
            AUTO_SAVE_INTERVAL_MS: 30000,     // 30 segundos
            TIMER_UPDATE_INTERVAL_MS: 2000    // 2 segundos
        },
        
        // Funciones básicas que serán reemplazadas por las de avika-core.js
        isValidDate: function(date) {
            return date instanceof Date && !isNaN(date.getTime());
        },
        
        getElement: function(id) {
            return document.getElementById(id);
        },
        
        log: {
            level: 'info',
            debug: function(msg) { console.debug(msg); },
            info: function(msg) { console.info(msg); },
            warn: function(msg) { console.warn(msg); },
            error: function(msg) { console.error(msg); }
        }
    };
}

// Asegurarse de que Avika.ui esté inicializado
Avika.ui = Avika.ui || {};

// Inicializar el estado de la UI si no existe
Avika.ui.state = Avika.ui.state || {
    lastSavedState: '',
    currentSubCategory: null,
    ticketMode: false,
    ticketItems: [],
    ticketService: 'comedor',
    selectedTicketItem: {},
    expandedTickets: {},
    _timerUpdateRequested: false
};

// Orquestador principal de la UI
// Este módulo coordina las interacciones entre los diferentes módulos UI

// Inicializar la aplicación
Avika.ui.init = function() {
    console.log('Inicializando Avika UI Controller...');
    
    // Configurar manejadores de eventos
    this.setupEventHandlers();
    
    // Inicializar temporizadores
    this.initTimers();
    
    // Cargar datos iniciales
    this.loadInitialData();
    
    console.log('Avika UI Controller inicializado correctamente');
};

// Configurar manejadores de eventos
Avika.ui.setupEventHandlers = function() {
    // Botones de categoría
    var categoryButtons = document.querySelectorAll('.category-btn');
    for (var i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', function() {
            var category = this.getAttribute('data-category');
            Avika.ui.selectCategory(category);
        });
    }
    
    // Botón de volver a categorías
    var backToCategoriesBtn = document.getElementById('btn-back-to-categories');
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', function() {
            Avika.ui.showSection('categories-section');
        });
    }
    
    // Botón de volver a platillos
    var backToDishesBtn = document.getElementById('btn-back-to-dishes');
    if (backToDishesBtn) {
        backToDishesBtn.addEventListener('click', function() {
            Avika.ui.showSection('dishes-section');
        });
    }
    
    // Botones de servicio
    var serviceButtons = document.querySelectorAll('#preparation-section .option-btn');
    for (var i = 0; i < serviceButtons.length; i++) {
        serviceButtons[i].addEventListener('click', function() {
            var service = this.id.replace('btn-', '');
            Avika.ui.selectService(this, service);
        });
    }
    
    // Botones de cantidad
    var decreaseBtn = document.getElementById('btn-decrease');
    var increaseBtn = document.getElementById('btn-increase');
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            Avika.ui.changeQuantity(-1);
        });
    }
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            Avika.ui.changeQuantity(1);
        });
    }
    
    // Botones de filtro
    var applyFilterBtn = document.getElementById('btn-apply-filter');
    var clearFilterBtn = document.getElementById('btn-clear-filter');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            Avika.ui.aplicarFiltros();
        });
    }
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            Avika.ui.limpiarFiltros();
        });
    }
    
    // Botones de filtro de reparto
    var applyDeliveryFilterBtn = document.getElementById('btn-apply-delivery-filter');
    var clearDeliveryFilterBtn = document.getElementById('btn-clear-delivery-filter');
    if (applyDeliveryFilterBtn) {
        applyDeliveryFilterBtn.addEventListener('click', function() {
            var tiempoMinutos = parseInt(document.getElementById('filter-delivery-time').value);
            Avika.ui.filtrarReparto(tiempoMinutos);
        });
    }
    if (clearDeliveryFilterBtn) {
        clearDeliveryFilterBtn.addEventListener('click', function() {
            Avika.ui.limpiarFiltrosReparto();
        });
    }
    
    // Botón de nuevo ticket
    var newTicketBtn = document.getElementById('btn-new-ticket');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', function() {
            Avika.ui.enableTicketMode();
        });
    }
    
    // Botón de desbloquear ticket
    var forceCompleteBtn = document.getElementById('btn-force-complete');
    if (forceCompleteBtn) {
        forceCompleteBtn.addEventListener('click', function() {
            Avika.ui.showForceCompleteModal();
        });
    }
    
    // Botón de modo compacto
    var compactModeBtn = document.getElementById('btn-compact-mode');
    if (compactModeBtn) {
        compactModeBtn.addEventListener('click', function() {
            Avika.ui.toggleCompactMode();
        });
    }
    
    // Botones de historial
    var showAllHistoryBtn = document.getElementById('btn-show-all-history');
    var showRecentBtn = document.getElementById('btn-show-recent');
    var showStatsBtn = document.getElementById('btn-show-stats');
    var clearHistoryBtn = document.getElementById('btn-clear-history');
    
    if (showAllHistoryBtn) {
        showAllHistoryBtn.addEventListener('click', function() {
            Avika.ui.updateCompletedTable(true);
            this.classList.add('active');
            showRecentBtn.classList.remove('active');
        });
    }
    
    if (showRecentBtn) {
        showRecentBtn.addEventListener('click', function() {
            Avika.ui.updateCompletedTable(false);
            this.classList.add('active');
            showAllHistoryBtn.classList.remove('active');
        });
    }
    
    if (showStatsBtn) {
        showStatsBtn.addEventListener('click', function() {
            Avika.ui.showStatsModal();
        });
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            Avika.ui.showConfirmationModal(
                '¿Estás seguro de que deseas limpiar el historial? Esta acción no se puede deshacer.',
                function() {
                    if (Avika.orders && typeof Avika.orders.clearCompletedOrders === 'function') {
                        var result = Avika.orders.clearCompletedOrders();
                        
                        // Manejar el resultado
                        if (result && result.success) {
                            // Actualizar tablas según sea necesario
                            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                                Avika.ui.updateCompletedTable(false);
                            }
                            
                            // Mostrar notificación
                            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                Avika.ui.showNotification('Historial limpiado con éxito', 'success');
                            }
                        } else {
                            // Si la operación fue cancelada o falló
                            console.log('Operación de limpieza cancelada o fallida');
                        }
                    } else {
                        // Implementación de respaldo si la función no está disponible
                        if (Avika.data.completedOrders) {
                            Avika.data.completedOrders = [];
                            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                                Avika.storage.guardarDatosLocales();
                            }
                            Avika.ui.updateCompletedTable(false);
                            Avika.ui.showNotification('Historial limpiado con éxito', 'success');
                        }
                    }
                }
            );
        });
    }
    
    // Botón de exportar datos
    var exportDataBtn = document.getElementById('btn-export');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            if (Avika.ui && typeof Avika.ui.exportData === 'function') {
                Avika.ui.exportData();
            }
        });
    }
    
    // Inicializar campo de búsqueda global de platillos
    var globalDishSearch = Avika.utils.getElement('global-dish-search');
    if (globalDishSearch) {
        globalDishSearch.addEventListener('input', function() {
            if (Avika.ui && typeof Avika.ui.performGlobalDishSearch === 'function') {
                Avika.ui.performGlobalDishSearch(this.value);
            }
        });
        
        // Limpiar resultados al hacer clic fuera del campo
        document.addEventListener('click', function(event) {
            if (event.target !== globalDishSearch) {
                var resultsContainer = document.getElementById('global-search-results');
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                }
            }
        });
    } else {
        console.warn('Campo de búsqueda global no encontrado. Se inicializará cuando esté disponible.');
    }
    
    // Agregar botón para restaurar historial de órdenes completadas
    var historySection = document.querySelector('.completed-orders-section');
    if (historySection) {
        var restoreHistoryBtn = document.createElement('button');
        restoreHistoryBtn.id = 'restore-history-btn';
        restoreHistoryBtn.className = 'action-btn';
        restoreHistoryBtn.textContent = 'Restaurar historial';
        restoreHistoryBtn.title = 'Restaurar historial de órdenes completadas desde la última copia de seguridad';
        
        // Insertar botón después del botón de limpiar historial
        var actionBtnsContainer = historySection.querySelector('.action-btns');
        if (actionBtnsContainer && clearHistoryBtn) {
            actionBtnsContainer.insertBefore(restoreHistoryBtn, clearHistoryBtn.nextSibling);
            
            // Agregar evento al botón
            restoreHistoryBtn.addEventListener('click', function() {
                if (Avika.orders && typeof Avika.orders.restoreCompletedOrdersBackup === 'function') {
                    var result = Avika.orders.restoreCompletedOrdersBackup();
                    
                    // Manejar el resultado
                    if (result && result.success) {
                        if (result.requiresConfirmation) {
                            // Mostrar confirmación
                            Avika.ui.showConfirmationModal(
                                result.confirmationMessage,
                                function() {
                                    // Aplicar la restauración después de la confirmación
                                    if (Avika.orders && typeof Avika.orders.applyCompletedOrdersBackup === 'function') {
                                        var applyResult = Avika.orders.applyCompletedOrdersBackup(result.backupData);
                                        
                                        // Manejar el resultado de la aplicación
                                        if (applyResult && applyResult.success) {
                                            // Actualizar tablas según sea necesario
                                            if (applyResult.updatedTables && Array.isArray(applyResult.updatedTables)) {
                                                applyResult.updatedTables.forEach(function(tableType) {
                                                    if (tableType === 'completedTable' && Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                                                        Avika.ui.updateCompletedTable();
                                                    }
                                                });
                                            }
                                            
                                            // Mostrar notificación
                                            if (applyResult.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                                Avika.ui.showNotification(applyResult.message, applyResult.messageType || 'success');
                                            }
                                        } else if (applyResult && !applyResult.success) {
                                            // Mostrar error
                                            if (applyResult.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                                Avika.ui.showNotification(applyResult.message, applyResult.messageType || 'error');
                                            }
                                        }
                                    }
                                }
                            );
                        } else {
                            // Mostrar notificación
                            if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                                Avika.ui.showNotification(result.message, result.messageType || 'success');
                            }
                        }
                    } else if (result && !result.success) {
                        // Mostrar error
                        if (result.message && Avika.ui && typeof Avika.ui.showNotification === 'function') {
                            Avika.ui.showNotification(result.message, result.messageType || 'error');
                        }
                    }
                }
            });
        }
    }
};

// Inicializar temporizadores
Avika.ui.initTimers = function() {
    // Temporizador para actualizar los temporizadores de las órdenes
    setInterval(function() {
        Avika.ui.updateAllTimers();
    }, Avika.utils.TIME_CONSTANTS.TIMER_UPDATE_INTERVAL_MS);
    
    // Temporizador para autoguardado
    setInterval(function() {
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    }, Avika.utils.TIME_CONSTANTS.AUTO_SAVE_INTERVAL_MS);
};

// Cargar datos iniciales
Avika.ui.loadInitialData = function() {
    // Actualizar tablas
    this.updatePendingTable();
    this.updateDeliveryTable();
    this.updateCompletedTable(false);
    
    // Mostrar sección inicial
    this.showSection('categories-section');
};

// Función para mostrar/ocultar secciones
Avika.ui.showSection = function(sectionId) {
    console.log("Mostrando sección:", sectionId);
    
    // Ocultar todas las secciones primero
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    
    // Mostrar la sección solicitada
    var section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        // Forzar un reflow para asegurar que los cambios de CSS se apliquen
        void section.offsetWidth;
        
        console.log("Sección " + sectionId + " configurada como visible");
    } else {
        console.error("Sección no encontrada:", sectionId);
    }
};

// NOTA: La función forceCompleteTicket ha sido movida a orders.js
// Ahora se utiliza Avika.orders.forceCompleteTicket en su lugar

// Función para mostrar el modal de selección de ticket a desbloquear
Avika.ui.showForceCompleteModal = function() {
    // Obtener tickets únicos de órdenes pendientes
    var tickets = [];
    
    if (Avika.data.pendingOrders) {
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order.ticketId && tickets.indexOf(order.ticketId) === -1) {
                tickets.push(order.ticketId);
            }
        }
    }
    
    if (tickets.length === 0) {
        Avika.ui.showNotification('No hay tickets pendientes para desbloquear', 'info');
        return;
    }
    
    // Crear modal
    Avika.ui.showConfirmationModal(
        'Selecciona el ticket que deseas completar manualmente:<br>' +
        '<select id="ticket-selector" class="ticket-selector">' +
        tickets.map(function(ticket) {
            return '<option value="' + ticket + '">' + ticket + '</option>';
        }).join('') +
        '</select>' +
        '<p class="warning-text">¡Atención! Esta acción completará todas las órdenes del ticket seleccionado.</p>',
        function() {
            var selector = document.getElementById('ticket-selector');
            if (selector) {
                var selectedTicket = selector.value;
                // Llamar a la implementación centralizada en el módulo orders.js
                if (Avika.orders && typeof Avika.orders.forceCompleteTicket === 'function') {
                    Avika.orders.forceCompleteTicket(selectedTicket);
                } else {
                    console.error('Error: Avika.orders.forceCompleteTicket no está disponible');
                    Avika.ui.showNotification('Error al completar el ticket. Consulta la consola para más detalles.', 'error');
                }
            }
        }
    );
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que todos los módulos necesarios estén cargados
    if (Avika.ui && 
        typeof Avika.ui.showSection === 'function' && 
        typeof Avika.ui.updatePendingTable === 'function') {
        
        // Inicializar la aplicación
        Avika.ui.init();
    } else {
        console.error('No se pudieron cargar todos los módulos necesarios de Avika UI');
    }
});
