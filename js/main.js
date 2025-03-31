// main.js - Punto de entrada y vinculación de módulos

// Inicialización
Avika.init = function() {
    // Agregar estilos para botones de entrega
    Avika.ui.addDeliveryStyles();
    
    // Botones de categoría
    document.getElementById('btn-frio').onclick = function() {
        Avika.ui.selectCategory('frio');
    };
    
    document.getElementById('btn-entrada-fria').onclick = function() {
        Avika.ui.selectCategory('entrada-fria');
    };
    
    document.getElementById('btn-caliente').onclick = function() {
        Avika.ui.selectCategory('caliente');
    };
    
    document.getElementById('btn-entrada-caliente').onclick = function() {
        Avika.ui.selectCategory('entrada-caliente');
    };
    
    document.getElementById('btn-combos').onclick = function() {
        Avika.ui.selectCategory('combos');
    };
    
    // Botones de navegación
    document.getElementById('btn-back-to-categories').onclick = function() {
        Avika.ui.showSection('categories-section');
    };
    
    // Botones de servicio
    document.getElementById('btn-comedor').onclick = function() {
        Avika.ui.selectService(this, 'comedor');
    };
    
    document.getElementById('btn-domicilio').onclick = function() {
        Avika.ui.selectService(this, 'domicilio');
    };
    
    document.getElementById('btn-para-llevar').onclick = function() {
        Avika.ui.selectService(this, 'para-llevar');
    };
    
    // Botones de cantidad
    document.getElementById('btn-decrease').onclick = function() {
        Avika.ui.changeQuantity(-1);
    };
    
    document.getElementById('btn-increase').onclick = function() {
        Avika.ui.changeQuantity(1);
    };
    
    // Botones de acción
    document.getElementById('btn-cancel').onclick = function() {
        Avika.ui.showSection('dishes-section');
    };
    
    document.getElementById('btn-back-to-dishes').onclick = function() {
        Avika.ui.showSection('dishes-section');
    };
    
    document.getElementById('btn-start').onclick = function() {
        Avika.orders.startPreparation();
    };
    
    // Botones de historial
    document.getElementById('btn-show-all-history').onclick = function() {
        this.classList.add('active');
        document.getElementById('btn-show-recent').classList.remove('active');
        Avika.ui.updateCompletedTable(true);
    };
    
    document.getElementById('btn-show-recent').onclick = function() {
        this.classList.add('active');
        document.getElementById('btn-show-all-history').classList.remove('active');
        Avika.ui.updateCompletedTable(false);
    };
    
    // Inicializar botones adicionales
    Avika.ui.initExtraButtons();
    
    // Cargar datos guardados
    Avika.storage.cargarDatosGuardados();
    
    // Inicializar temporizador
    Avika.data.timerInterval = setInterval(function() {
        Avika.ui.updateAllTimers();
    }, Avika.config.timerInterval);
    
    // Iniciar el guardado automático
    setInterval(function() {
        Avika.storage.guardarDatosLocales();
    }, Avika.config.autoSaveInterval);
    
    Avika.ui.showSection('categories-section');
    Avika.ui.showNotification('Temporizador de Sushi iniciado');
};

// Iniciar al cargar el documento
document.addEventListener('DOMContentLoaded', Avika.init);