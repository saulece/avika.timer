// avika-init.js - Script de inicialización para la aplicación Avika

// Aseguramos que el objeto global Avika exista
if (!window.Avika) { window.Avika = {}; }

document.addEventListener('DOMContentLoaded', () => {
    const restaurantSwitch = document.getElementById('restaurant-switch');
    const mainHeaderTitle = document.getElementById('main-header-title');
    const mainContainer = document.querySelector('.container');

    // --- Lógica de Carga y Arranque ---

    function loadRestaurant(restaurantId) {
        if (!window.AppMenus || !window.AppMenus[restaurantId]) {
            console.error(`Configuración no encontrada para: ${restaurantId}`);
            return;
        }

        console.log(`Cargando configuración para: ${restaurantId}`);
        
        // 1. Guardar la selección actual
        localStorage.setItem('selectedRestaurant', restaurantId);
        
        // 2. Aplicar la configuración del restaurante
        Avika.config = window.AppMenus[restaurantId];

        // 3. Cargar datos guardados DESPUÉS de que la config esté lista (CORRECCIÓN CLAVE)
        if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
            Avika.storage.cargarDatosGuardados();
        }

        // 4. Inicializar/Actualizar la aplicación completa
        initializeAppUI();
        
        // 5. Mostrar el contenedor principal
        if (mainContainer) {
            mainContainer.style.display = 'block';
        }
    }

    function initializeAppUI() {
        console.log("Inicializando UI y componentes de Avika...");

        // Limpiar intervalos antiguos para evitar duplicados al cambiar de restaurante
        if (window.avikaTimerInterval) clearInterval(window.avikaTimerInterval);
        if (window.avikaAutoSaveInterval) clearInterval(window.avikaAutoSaveInterval);

        // Actualizar elementos de la UI con la nueva config
        const restaurantName = Avika.config.restaurantName || 'Temporizador';
        document.title = `${restaurantName} Timer`;
        if (mainHeaderTitle) {
            mainHeaderTitle.textContent = `${restaurantName} - Temporizador de Platillos`;
        }

        // (Re)Inicializar todos los botones y componentes de la UI
        initActionButtons();
        initServiceButtons();
        initQuantityButtons();
        
        if (Avika.ui && typeof Avika.ui.initTicketColorFix === 'function') {
            Avika.ui.initTicketColorFix();
        }
        
        // Actualizar todas las tablas con los datos cargados
        if (Avika.ui && typeof Avika.ui.updateAllTables === 'function') {
            Avika.ui.updateAllTables();
        } else {
            console.warn('Función Avika.ui.updateAllTables no encontrada. Las tablas pueden no estar actualizadas.');
        }

        // Configurar actualizaciones periódicas
        window.avikaTimerInterval = setInterval(() => {
            if (Avika.optimization && Avika.optimization.throttledUpdateTimers) {
                Avika.optimization.throttledUpdateTimers();
            } else if (Avika.orderService && typeof Avika.orderService.updateAllTimers === 'function') {
                Avika.orderService.updateAllTimers();
            }
        }, (Avika.config && Avika.config.timerInterval) || 1000);

        // Configurar autoguardado
        window.avikaAutoSaveInterval = setInterval(() => {
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
        }, (Avika.config && Avika.config.autoSaveInterval) || 30000);

        // Llamar a las optimizaciones móviles
        if (window.Avika && Avika.mobile && Avika.mobile.initializeMobileOptimizations) {
            Avika.mobile.initializeMobileOptimizations();
        }
        
        // Restaurar preferencias de modo compacto si existe
        if (localStorage.getItem('avika_compact_mode') === 'true') {
            document.body.classList.add('ultra-compact-mode');
            const compactIcon = document.getElementById('compact-icon');
            if(compactIcon) compactIcon.textContent = '📱';
        }

        console.log("Inicialización de UI completa.");
    }

    // --- Funciones de inicialización de botones (separadas para mayor claridad) ---
    function initServiceButtons() {
        document.getElementById('btn-comedor').addEventListener('click', function() { Avika.ui.selectService(this, 'comedor'); });
        document.getElementById('btn-domicilio').addEventListener('click', function() { Avika.ui.selectService(this, 'domicilio'); });
        document.getElementById('btn-para-llevar').addEventListener('click', function() { Avika.ui.selectService(this, 'para-llevar'); });
    }

    function initQuantityButtons() {
        document.getElementById('btn-decrease').addEventListener('click', () => Avika.ui.changeQuantity(-1));
        document.getElementById('btn-increase').addEventListener('click', () => Avika.ui.changeQuantity(1));
    }

    function initActionButtons() {
        document.getElementById('btn-back-to-categories').addEventListener('click', () => Avika.ui.showSection('categories-section'));
        document.getElementById('btn-back-to-dishes').addEventListener('click', () => Avika.ui.showSection('dishes-section'));
        document.getElementById('btn-start').addEventListener('click', () => Avika.orders.startPreparation());
        document.getElementById('btn-cancel').addEventListener('click', () => Avika.ui.showSection('dishes-section'));
        document.getElementById('btn-new-ticket').addEventListener('click', () => Avika.ui.enableTicketMode());
        document.getElementById('btn-apply-filter').addEventListener('click', () => Avika.ui.aplicarFiltros());
        document.getElementById('btn-clear-filter').addEventListener('click', () => Avika.ui.limpiarFiltros());
        document.getElementById('btn-show-all-history').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('btn-show-recent').classList.remove('active');
            Avika.ui.updateCompletedTable(true);
        });
        document.getElementById('btn-show-recent').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('btn-show-all-history').classList.remove('active');
            Avika.ui.updateCompletedTable(false);
        });
        document.getElementById('btn-export').addEventListener('click', () => Avika.stats.exportarDatos());
        document.getElementById('btn-force-complete').onclick = () => Avika.ui.showForceCompleteModal();
        document.getElementById('btn-show-stats').addEventListener('click', () => Avika.stats.calcularPromedios());
        document.getElementById('btn-apply-delivery-filter').addEventListener('click', () => {
            const tiempoSeleccionado = document.getElementById('filter-delivery-time').value;
            Avika.ui.filtrarReparto(tiempoSeleccionado);
        });
        document.getElementById('btn-clear-delivery-filter').addEventListener('click', () => {
            document.getElementById('filter-delivery-time').value = 'todos';
            Avika.ui.limpiarFiltrosReparto();
        });
        document.getElementById('btn-clear-history').addEventListener('click', () => Avika.storage.limpiarHistorial());
        document.getElementById('btn-compact-mode').addEventListener('click', () => Avika.ui.toggleCompactMode());
    }

    // --- Lógica de Arranque Principal ---
    
    // 1. Añadir listener al switch para cambiar de restaurante
    restaurantSwitch.addEventListener('change', () => {
        const newRestaurantId = restaurantSwitch.checked ? 'ishinoka' : 'avika';
        // Al cambiar, se borran los datos actuales para cargar los del otro restaurante
        Avika.data = { pendingOrders: [], deliveryOrders: [], completedOrders: [] };
        loadRestaurant(newRestaurantId);
    });

    // 2. Determinar el restaurante inicial al cargar la página
    const savedRestaurant = localStorage.getItem('selectedRestaurant') || 'avika';

    // Asegurar que Avika.data exista antes de cargar, para evitar errores si no hay datos guardados
    if (!window.Avika.data) {
        window.Avika.data = { pendingOrders: [], deliveryOrders: [], completedOrders: [] };
    }
    
    // 3. Ajustar el estado visual del switch
    restaurantSwitch.checked = savedRestaurant === 'ishinoka';
    
    // 4. Cargar la aplicación con el restaurante correcto
    loadRestaurant(savedRestaurant);
});