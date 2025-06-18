// avika-init.js - Script de inicialización para la aplicación Avika

// Aseguramos que el objeto global Avika y sus datos existan
if (!window.Avika) { window.Avika = {}; }
if (!Avika.data) { Avika.data = {}; }
Avika.data.pendingOrders = Avika.data.pendingOrders || [];
Avika.data.deliveryOrders = Avika.data.deliveryOrders || [];
Avika.data.completedOrders = Avika.data.completedOrders || [];

document.addEventListener('DOMContentLoaded', () => {
    const restaurantSelector = document.getElementById('restaurant-selector-overlay');

    // --- Lógica del Selector de Restaurante ---
    const mainContainer = document.querySelector('.container');

    // Mostrar siempre el selector de restaurante al cargar la página
    if (restaurantSelector) {
        restaurantSelector.style.display = 'flex';
    }
    if (mainContainer) {
        mainContainer.style.display = 'none';
    }

    // --- Función Principal de Inicialización de la Aplicación ---
    function initializeApp() {
        console.log("Inicializando Avika...");

        // Actualizar el título de la página y el encabezado con el nombre del restaurante
        const restaurantName = Avika.config.restaurantName || 'Temporizador';
        document.title = `${restaurantName} Timer`;
        const headerTitle = document.querySelector('header h1');
        if (headerTitle) {
            headerTitle.textContent = `${restaurantName} - Temporizador de Platillos`;
        }

        // Función de inicialización interna (el initApp original)
        function initApp() {
            console.log("Inicializando componentes de la aplicación...");

            initServiceButtons();
            initQuantityButtons();
            initActionButtons();

            if (Avika.ui && typeof Avika.ui.initTicketColorFix === 'function') {
                Avika.ui.initTicketColorFix();
            }
            
            loadSavedData();

            // Configurar actualizaciones periódicas
            setInterval(() => {
                if (Avika.optimization && Avika.optimization.throttledUpdateTimers) {
                    Avika.optimization.throttledUpdateTimers();
                } else if (Avika.orderService && typeof Avika.orderService.updateAllTimers === 'function') {
                    Avika.orderService.updateAllTimers();
                }
            }, (Avika.config && Avika.config.timerInterval) || 1000);

            // Configurar autoguardado
            setInterval(() => {
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
            }, (Avika.config && Avika.config.autoSaveInterval) || 30000);

            console.log("Inicialización completa.");
        }

        // --- Funciones de inicialización de botones y datos ---
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
            document.getElementById('btn-cancel').addEventListener('click', () => Avika.ui.showSection('categories-section'));
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

        function loadSavedData() {
            if (Avika.storage && typeof Avika.storage.cargarDatosGuardados === 'function') {
                Avika.storage.cargarDatosGuardados();
            }
        }

        // --- Ejecutar la inicialización ---
        try {
            initApp();
        } catch (e) {
            console.error("Error fatal durante la inicialización:", e);
            alert("Error al inicializar la aplicación. Consulta la consola para más detalles.");
        }
        
        // Restaurar preferencias de modo compacto si existe
        if (localStorage.getItem('avika_compact_mode') === 'true') {
            document.body.classList.add('ultra-compact-mode');
            document.getElementById('compact-icon').textContent = '📱';
        }
    }

    // --- Lógica de Carga de Restaurante ---
    function loadRestaurant(restaurantId) {
        if (window.AppMenus && window.AppMenus[restaurantId]) {
            console.log(`Cargando configuración para: ${restaurantId}`);
            localStorage.setItem('selectedRestaurant', restaurantId);
            Avika.config = window.AppMenus[restaurantId];

            if (restaurantSelector) restaurantSelector.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'block';

                        initializeApp();

            // Llamar a las optimizaciones móviles después de que la app principal esté lista
            if (window.Avika && Avika.mobile && Avika.mobile.initializeMobileOptimizations) {
                Avika.mobile.initializeMobileOptimizations();
            }
            return true;
        }
        return false; // No se pudo cargar
    }



    // Añadir listeners a los botones del selector
    document.querySelectorAll('.restaurant-btn').forEach(button => {
        button.addEventListener('click', () => {
            const restaurantId = button.dataset.restaurant;
            loadRestaurant(restaurantId);
        });
    });
});