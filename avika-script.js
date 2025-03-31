// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

// Arrays para almacenar pedidos
var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Opciones de personalización predeterminadas
var customizationOptions = {
    'sin-alga': 'Sin Alga',
    'extra-picante': 'Extra Picante',
    'cambio-proteina': 'Cambiar Proteína'
};

// Datos de platillos
var dishes = {
    'frio': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
        'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón',
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
        'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 
        'Furai Roll', 'Coco Roll', 'Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll',
        'TNT Roll', 'Ika Ebi Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll',
        'Rib Eye Roll', 'Avika Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill',
        'Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine',
        'Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
        'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai',
        'Tacos Nikkei', 'Tacos de Costra de Queso', 'Brocheta Yakitori', 'Ika Ebi Togarashi'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};

// Lista de platillos especiales
var specialDishes = [
    'Baby Squid', 'Tiradito de Camarón', 'Maguro Peruano', 'Tostadita Crunchy',
    'Spicy Roll', 'Red Fire Roll', 'Ebi Crunch Roll', 'TNT Roll', 'Rib Eye Roll',
    'Avika Roll', 'Toritos Tempura', 'Taquitos Crujientes', 'Ika Ebi Togarashi',
    'Ebi Chips', 'Pulpo Marine', 'Filete Zakana Thai', 'Salmón Kion',
    'Combo Tokio', 'Combo Osaka', 'Combo Bagua'
];

// Mostrar sección de categorías al inicio
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatosLocales();
    
    // Actualizar tablas
    updatePendingTable();
    updateCompletedTable();
    
    // Iniciar timer para actualizar tiempos
    iniciarTimer();
    
    // Inicializar eventos
    setupEventListeners();
    
    // Aplicar tema guardado
    if (localStorage.getItem('avika_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('toggle-theme').textContent = '☀️';
    }
    
    // Mostrar guía de instalación si es necesario
    if (localStorage.getItem('avika_hideGuide') !== 'true') {
        document.getElementById('install-guide').style.display = 'block';
    }
});

// Configurar todos los eventos de la aplicación
function setupEventListeners() {
    // Botones de categoría
    document.getElementById('btn-frio').addEventListener('click', function() {
        currentCategory = 'frio';
        mostrarPlatillos('frio', 'Platillos Fríos');
    });
    
    document.getElementById('btn-entrada-fria').addEventListener('click', function() {
        currentCategory = 'entrada-fria';
        mostrarPlatillos('entrada-fria', 'Entradas Frías');
    });
    
    document.getElementById('btn-caliente').addEventListener('click', function() {
        currentCategory = 'caliente';
        mostrarPlatillos('caliente', 'Platillos Calientes');
    });
    
    document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
        currentCategory = 'entrada-caliente';
        mostrarPlatillos('entrada-caliente', 'Entradas Calientes');
    });
    
    document.getElementById('btn-combos').addEventListener('click', function() {
        currentCategory = 'combos';
        mostrarPlatillos('combos', 'Combos');
    });
    
    // Botón para volver a categorías
    document.getElementById('btn-back-to-categories').addEventListener('click', function() {
        document.getElementById('dishes-section').style.display = 'none';
        document.getElementById('categories-section').style.display = 'block';
    });
    
    // Botón para volver a platillos
    document.getElementById('btn-back-to-dishes').addEventListener('click', function() {
        document.getElementById('preparation-section').style.display = 'none';
        document.getElementById('dishes-section').style.display = 'block';
    });
    
    // Botones de servicio
    document.getElementById('btn-comedor').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'comedor';
    });
    
    document.getElementById('btn-domicilio').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'domicilio';
    });
    
    document.getElementById('btn-para-llevar').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'para-llevar';
    });
    
    // Botones de cantidad
    document.getElementById('btn-decrease').addEventListener('click', function() {
        if (currentQuantity > 1) {
            currentQuantity--;
            document.getElementById('quantity-display').textContent = currentQuantity;
        }
    });
    
    document.getElementById('btn-increase').addEventListener('click', function() {
        currentQuantity++;
        document.getElementById('quantity-display').textContent = currentQuantity;
    });
    
    // Botones de acción
    document.getElementById('btn-start').addEventListener('click', startPreparation);
    document.getElementById('btn-cancel').addEventListener('click', resetApp);
    
    // Botones de filtro
    document.getElementById('btn-show-all-history').addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        updateCompletedTable();
    });
    
    document.getElementById('btn-show-recent').addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        updateCompletedTable();
    });
    
    // Botón de tema
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
    
    // Botón de guía de instalación
    document.getElementById('hide-guide').addEventListener('click', function() {
        document.getElementById('install-guide').style.display = 'none';
        localStorage.setItem('avika_hideGuide', 'true');
    });
    
    // Botón de promedios
    document.getElementById('btn-promedios').addEventListener('click', showPromedios);
    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('promedios-modal').classList.remove('active');
    });
    
    // Botón de exportar
    document.getElementById('btn-export').addEventListener('click', exportToCSV);
    
    // Botón de limpiar
    document.getElementById('btn-clear').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
            pendingOrders = [];
            completedOrders = [];
            updatePendingTable();
            updateCompletedTable();
            guardarDatosLocales();
            showNotification('Todos los datos han sido eliminados', 'warning');
        }
    });
}

// Mostrar los platillos de una categoría
function mostrarPlatillos(categoria, titulo) {
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
    document.getElementById('selected-category-title').textContent = titulo;
    
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    dishes[categoria].forEach(dish => {
        const btn = document.createElement('button');
        btn.className = 'dish-btn';
        btn.textContent = dish;
        
        // Si es un platillo especial, aplicar clase especial
        if (specialDishes.includes(dish)) {
            btn.className += ' special-combo';
            
            // Si es un combo, marcar como especial
            if (categoria === 'combos') {
                isSpecialCombo = true;
            }
        }
        
        btn.addEventListener('click', function() {
            seleccionarPlatillo(dish);
        });
        
        container.appendChild(btn);
    });
}

// Seleccionar un platillo y mostrar opciones de personalización
function seleccionarPlatillo(platillo) {
    currentDish = platillo;
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'block';
    document.getElementById('selected-dish-title').textContent = platillo;
    
    // Cargar opciones de personalización
    const optionsContainer = document.getElementById('personalization-options');
    optionsContainer.innerHTML = '';
    
    for (const id in customizationOptions) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = customizationOptions[id];
        btn.setAttribute('data-option', id);
        
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateCustomizations();
        });
        
        optionsContainer.appendChild(btn);
    }
}

// Actualizar lista de personalizaciones seleccionadas
function updateCustomizations() {
    currentCustomizations = [];
    
    document.querySelectorAll('.option-btn.selected').forEach(el => {
        if (el.hasAttribute('data-option')) {
            currentCustomizations.push(customizationOptions[el.getAttribute('data-option')]);
        }
    });
}

// Iniciar preparación de un platillo
function startPreparation() {
    // Crear el pedido
    const order = {
        id: generateId(),
        dish: currentDish,
        category: currentCategory,
        customizations: currentCustomizations,
        service: currentService,
        quantity: currentQuantity,
        notes: document.getElementById('notes-input').value,
        startTime: new Date(),
        startTimeFormatted: formatTime(new Date())
    };
    
    // Agregar a pendientes
    pendingOrders.push(order);
    
    // Actualizar tabla y mostrar notificación
    updatePendingTable();
    showNotification(`Nuevo pedido: ${order.dish} × ${order.quantity}`);
    
    // Regresar a la vista principal
    resetApp();
    guardarDatosLocales();
}

// Actualizar tabla de pedidos pendientes
function updatePendingTable() {
    const tableBody = document.getElementById('pending-body');
    const pendingCount = document.getElementById('pending-count');
    
    // Actualizar contador
    pendingCount.textContent = pendingOrders.length;
    
    // Limpiar tabla
    tableBody.innerHTML = '';
    
    // Si no hay pedidos
    if (pendingOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="empty-message">No hay platillos en preparación</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Agregar cada pedido a la tabla
    pendingOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Calcular tiempo transcurrido
        const now = new Date();
        const startTime = new Date(order.startTime);
        const elapsedMs = now - startTime;
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        const mins = Math.floor(elapsedSecs / 60);
        const secs = elapsedSecs % 60;
        
        // Determinar clase CSS según tiempo transcurrido
        let timerClass = '';
        if (mins >= 10) {
            timerClass = 'alert';
        } else if (mins >= 5) {
            timerClass = 'warning';
        }
        
        // Información a mostrar
        const customInfo = order.customizations.length > 0 
            ? `<strong>Personalización:</strong> ${order.customizations.join(', ')}<br>` 
            : '';
        const serviceInfo = `<strong>Servicio:</strong> ${getServiceName(order.service)}<br>`;
        const quantityInfo = order.quantity > 1 ? `<strong>Cantidad:</strong> ${order.quantity}<br>` : '';
        const notesInfo = order.notes ? `<strong>Notas:</strong> ${order.notes}` : '';
        
        row.innerHTML = `
            <td>${order.dish}</td>
            <td>${order.startTimeFormatted}</td>
            <td class="timer-cell ${timerClass}">${padZero(mins)}:${padZero(secs)}</td>
            <td class="details-cell">
                ${customInfo}
                ${serviceInfo}
                ${quantityInfo}
                ${notesInfo}
            </td>
            <td>
                ${getActionButton(order)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Obtener botón de acción según tipo de pedido
function getActionButton(order) {
    if (order.service === 'domicilio') {
        if (!order.deliveryDepartureTime) {
            return `<button class="finish-btn delivery" onclick="markDeliveryDeparture('${order.id}')">Salida</button>`;
        } else if (!order.deliveryArrivalTime) {
            return `<button class="finish-btn delivery-arrived" onclick="markDeliveryArrival('${order.id}')">Entregado</button>`;
        }
    }
    
    let btnClass = '';
    if (order.category === 'frio' || order.category === 'entrada-fria') {
        btnClass = 'cold-kitchen';
    } else {
        btnClass = 'hot-kitchen';
    }
    
    return `<button class="finish-btn ${btnClass}" onclick="finishPreparation('${order.id}')">Finalizar</button>`;
}

// Actualizar tabla de órdenes completadas
function updateCompletedTable() {
    const tableBody = document.getElementById('completed-body');
    tableBody.innerHTML = '';
    
    // Si no hay pedidos completados
    if (completedOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="empty-message">No hay platillos completados</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Determina cuántos mostrar (todos o solo recientes)
    const showAllHistory = document.getElementById('btn-show-all-history').classList.contains('active');
    const ordersToShow = showAllHistory ? completedOrders : completedOrders.slice(0, 10);
    
    // Agregar cada pedido completado a la tabla
    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        
        // Información a mostrar
        const customInfo = order.customizations.length > 0 
            ? `<strong>Personalización:</strong> ${order.customizations.join(', ')}<br>` 
            : '';
        const serviceInfo = `<strong>Servicio:</strong> ${getServiceName(order.service)}<br>`;
        const quantityInfo = order.quantity > 1 ? `<strong>Cantidad:</strong> ${order.quantity}<br>` : '';
        const notesInfo = order.notes ? `<strong>Notas:</strong> ${order.notes}` : '';
        const deliveryInfo = order.deliveryTime ? `<strong>Tiempo de entrega:</strong> ${order.deliveryTime}<br>` : '';
        
        // Determina clase CSS según tiempo total
        let timeClass = 'time-excellent';
        const prepTime = order.prepTime || '';
        if (prepTime) {
            const mins = parseInt(prepTime.split(':')[0]);
            if (mins >= 15) {
                timeClass = 'time-bad';
            } else if (mins >= 10) {
                timeClass = 'time-warning';
            } else if (mins >= 5) {
                timeClass = 'time-good';
            }
        }
        
        row.innerHTML = `
            <td>${order.dish}</td>
            <td>${order.startTimeFormatted}</td>
            <td>${order.endTimeFormatted}</td>
            <td class="${timeClass}">${order.prepTime}</td>
            <td class="details-cell">
                ${customInfo}
                ${serviceInfo}
                ${quantityInfo}
                ${deliveryInfo}
                ${notesInfo}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Finalizar preparación
function finishPreparation(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    const endTime = new Date();
    const prepTimeMillis = endTime - new Date(order.startTime);
    const prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    const prepMins = Math.floor(prepTimeSecs / 60);
    const prepSecs = prepTimeSecs % 60;
    
    const prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification(`¡${order.dish} finalizado en ${prepTimeFormatted}!`);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Registra la salida del repartidor
function markDeliveryDeparture(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Registra la entrega al cliente
function markDeliveryArrival(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcula tiempo total
    const endTime = order.deliveryArrivalTime;
    const prepTimeMillis = endTime - new Date(order.startTime);
    const prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    const prepMins = Math.floor(prepTimeSecs / 60);
    const prepSecs = prepTimeSecs % 60;
    
    const prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // Calcula tiempo específico de entrega
    const deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    const deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    const deliveryMins = Math.floor(deliveryTimeSecs / 60);
    const deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification(`¡${order.dish} entregado al cliente! Tiempo total: ${prepTimeFormatted}`);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para regresar a la pantalla principal
function resetApp() {
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('categories-section').style.display = 'block';
    
    // Reset estados
    currentCategory = '';
    currentDish = '';
    currentCustomizations = [];
    currentService = 'comedor';
    currentQuantity = 1;
    document.getElementById('quantity-display').textContent = "1";
    document.getElementById('notes-input').value = '';
    
    // Reset UI de servicio
    document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('btn-comedor').classList.add('selected');
}

// Guardar datos en localStorage
function guardarDatosLocales() {
    localStorage.setItem('avika_pendingOrders', JSON.stringify(pendingOrders));
    localStorage.setItem('avika_completedOrders', JSON.stringify(completedOrders));
}

// Cargar datos de localStorage
function cargarDatosLocales() {
    const pendingData = localStorage.getItem('avika_pendingOrders');
    const completedData = localStorage.getItem('avika_completedOrders');
    
    if (pendingData) {
        pendingOrders = JSON.parse(pendingData);
    }
    
    if (completedData) {
        completedOrders = JSON.parse(completedData);
    }
}

// Función para iniciar el timer que actualiza los tiempos de pedidos pendientes
function iniciarTimer() {
    // Limpiar intervalo existente si hay uno
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Actualizar cada segundo
    timerInterval = setInterval(() => {
        // Solo actualizar si hay pedidos pendientes
        if (pendingOrders.length > 0) {
            updatePendingTable();
        }
    }, 1000);
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Asignar clase según tipo
    notification.className = '';
    notification.classList.add('notification', `notification-${type}`);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Alternar entre tema claro y oscuro
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeButton = document.getElementById('toggle-theme');
    
    if (document.body.classList.contains('dark-mode')) {
        themeButton.textContent = '☀️';
        localStorage.setItem('avika_theme', 'dark');
    } else {
        themeButton.textContent = '🌙';
        localStorage.setItem('avika_theme', 'light');
    }
}

// Obtener nombre del servicio
function getServiceName(serviceId) {
    const services = {
        'comedor': 'Comedor',
        'domicilio': 'Domicilio',
        'para-llevar': 'Ordena y Espera'
    };
    return services[serviceId] || serviceId;
}

// Función de utilidad para generar ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para formatear hora
function formatTime(date) {
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Agregar ceros iniciales
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Mostrar modal de promedios
function showPromedios() {
    if (completedOrders.length === 0) {
        showNotification('No hay datos suficientes para calcular promedios', 'warning');
        return;
    }
    
    const container = document.getElementById('promedios-contenido');
    container.innerHTML = '<h3>Tiempo Promedio por Platillo</h3>';
    
    // Agrupar por platillo
    const platillos = {};
    completedOrders.forEach(order => {
        const platillo = order.dish;
        if (!platillos[platillo]) {
            platillos[platillo] = [];
        }
        
        // Extraer minutos del tiempo formateado
        if (order.prepTime) {
            const minutos = parseInt(order.prepTime.split(':')[0]);
            platillos[platillo].push(minutos);
        }
    });
    
    // Calcular promedios
    const promedios = [];
    for (const platillo in platillos) {
        const tiempos = platillos[platillo];
        if (tiempos.length > 0) {
            const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
            promedios.push({
                platillo: platillo,
                promedio: promedio,
                count: tiempos.length
            });
        }
    }
    
    // Ordenar por promedio
    promedios.sort((a, b) => a.promedio - b.promedio);
    
    // Crear tabla
    let html = `
        <table style="width: 100%; margin-top: 15px;">
            <thead>
                <tr>
                    <th>Platillo</th>
                    <th>Tiempo Promedio</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    promedios.forEach(item => {
        let timeClass = 'time-excellent';
        if (item.promedio >= 15) {
            timeClass = 'time-bad';
        } else if (item.promedio >= 10) {
            timeClass = 'time-warning';
        } else if (item.promedio >= 5) {
            timeClass = 'time-goo
            // Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

// Arrays para almacenar pedidos
var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Opciones de personalización predeterminadas
var customizationOptions = {
    'sin-alga': 'Sin Alga',
    'extra-picante': 'Extra Picante',
    'cambio-proteina': 'Cambiar Proteína'
};

// Datos de platillos
var dishes = {
    'frio': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
        'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón',
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
        'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 
        'Furai Roll', 'Coco Roll', 'Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll',
        'TNT Roll', 'Ika Ebi Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll',
        'Rib Eye Roll', 'Avika Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill',
        'Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine',
        'Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
        'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai',
        'Tacos Nikkei', 'Tacos de Costra de Queso', 'Brocheta Yakitori', 'Ika Ebi Togarashi'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};

// Lista de platillos especiales
var specialDishes = [
    'Baby Squid', 'Tiradito de Camarón', 'Maguro Peruano', 'Tostadita Crunchy',
    'Spicy Roll', 'Red Fire Roll', 'Ebi Crunch Roll', 'TNT Roll', 'Rib Eye Roll',
    'Avika Roll', 'Toritos Tempura', 'Taquitos Crujientes', 'Ika Ebi Togarashi',
    'Ebi Chips', 'Pulpo Marine', 'Filete Zakana Thai', 'Salmón Kion',
    'Combo Tokio', 'Combo Osaka', 'Combo Bagua'
];

// Mostrar sección de categorías al inicio
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatosLocales();
    
    // Actualizar tablas
    updatePendingTable();
    updateCompletedTable();
    
    // Iniciar timer para actualizar tiempos
    iniciarTimer();
    
    // Inicializar eventos
    setupEventListeners();
    
    // Aplicar tema guardado
    if (localStorage.getItem('avika_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('toggle-theme').textContent = '☀️';
    }
    
    // Mostrar guía de instalación si es necesario
    if (localStorage.getItem('avika_hideGuide') !== 'true') {
        document.getElementById('install-guide').style.display = 'block';
    }
});

// Configurar todos los eventos de la aplicación
function setupEventListeners() {
    // Botones de categoría
    document.getElementById('btn-frio').addEventListener('click', function() {
        currentCategory = 'frio';
        mostrarPlatillos('frio', 'Platillos Fríos');
    });
    
    document.getElementById('btn-entrada-fria').addEventListener('click', function() {
        currentCategory = 'entrada-fria';
        mostrarPlatillos('entrada-fria', 'Entradas Frías');
    });
    
    document.getElementById('btn-caliente').addEventListener('click', function() {
        currentCategory = 'caliente';
        mostrarPlatillos('caliente', 'Platillos Calientes');
    });
    
    document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
        currentCategory = 'entrada-caliente';
        mostrarPlatillos('entrada-caliente', 'Entradas Calientes');
    });
    
    document.getElementById('btn-combos').addEventListener('click', function() {
        currentCategory = 'combos';
        mostrarPlatillos('combos', 'Combos');
    });
    
    // Botón para volver a categorías
    document.getElementById('btn-back-to-categories').addEventListener('click', function() {
        document.getElementById('dishes-section').style.display = 'none';
        document.getElementById('categories-section').style.display = 'block';
    });
    
    // Botón para volver a platillos
    document.getElementById('btn-back-to-dishes').addEventListener('click', function() {
        document.getElementById('preparation-section').style.display = 'none';
        document.getElementById('dishes-section').style.display = 'block';
    });
    
    // Botones de servicio
    document.getElementById('btn-comedor').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'comedor';
    });
    
    document.getElementById('btn-domicilio').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'domicilio';
    });
    
    document.getElementById('btn-para-llevar').addEventListener('click', function() {
        document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
            el.classList.remove('selected');
        });
        this.classList.add('selected');
        currentService = 'para-llevar';
    });
    
    // Botones de cantidad
    document.getElementById('btn-decrease').addEventListener('click', function() {
        if (currentQuantity > 1) {
            currentQuantity--;
            document.getElementById('quantity-display').textContent = currentQuantity;
        }
    });
    
    document.getElementById('btn-increase').addEventListener('click', function() {
        currentQuantity++;
        document.getElementById('quantity-display').textContent = currentQuantity;
    });
    
    // Botones de acción
    document.getElementById('btn-start').addEventListener('click', startPreparation);
    document.getElementById('btn-cancel').addEventListener('click', resetApp);
    
    // Botones de filtro
    document.getElementById('btn-show-all-history').addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        updateCompletedTable();
    });
    
    document.getElementById('btn-show-recent').addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        updateCompletedTable();
    });
    
    // Botón de tema
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
    
    // Botón de guía de instalación
    document.getElementById('hide-guide').addEventListener('click', function() {
        document.getElementById('install-guide').style.display = 'none';
        localStorage.setItem('avika_hideGuide', 'true');
    });
    
    // Botón de promedios
    document.getElementById('btn-promedios').addEventListener('click', showPromedios);
    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('promedios-modal').classList.remove('active');
    });
    
    // Botón de exportar
    document.getElementById('btn-export').addEventListener('click', exportToCSV);
    
    // Botón de limpiar
    document.getElementById('btn-clear').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
            pendingOrders = [];
            completedOrders = [];
            updatePendingTable();
            updateCompletedTable();
            guardarDatosLocales();
            showNotification('Todos los datos han sido eliminados', 'warning');
        }
    });
}

// Mostrar los platillos de una categoría
function mostrarPlatillos(categoria, titulo) {
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
    document.getElementById('selected-category-title').textContent = titulo;
    
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    dishes[categoria].forEach(dish => {
        const btn = document.createElement('button');
        btn.className = 'dish-btn';
        btn.textContent = dish;
        
        // Si es un platillo especial, aplicar clase especial
        if (specialDishes.includes(dish)) {
            btn.className += ' special-combo';
            
            // Si es un combo, marcar como especial
            if (categoria === 'combos') {
                isSpecialCombo = true;
            }
        }
        
        btn.addEventListener('click', function() {
            seleccionarPlatillo(dish);
        });
        
        container.appendChild(btn);
    });
}

// Seleccionar un platillo y mostrar opciones de personalización
function seleccionarPlatillo(platillo) {
    currentDish = platillo;
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'block';
    document.getElementById('selected-dish-title').textContent = platillo;
    
    // Cargar opciones de personalización
    const optionsContainer = document.getElementById('personalization-options');
    optionsContainer.innerHTML = '';
    
    for (const id in customizationOptions) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = customizationOptions[id];
        btn.setAttribute('data-option', id);
        
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateCustomizations();
        });
        
        optionsContainer.appendChild(btn);
    }
}

// Actualizar lista de personalizaciones seleccionadas
function updateCustomizations() {
    currentCustomizations = [];
    
    document.querySelectorAll('.option-btn.selected').forEach(el => {
        if (el.hasAttribute('data-option')) {
            currentCustomizations.push(customizationOptions[el.getAttribute('data-option')]);
        }
    });
}

// Iniciar preparación de un platillo
function startPreparation() {
    // Crear el pedido
    const order = {
        id: generateId(),
        dish: currentDish,
        category: currentCategory,
        customizations: currentCustomizations,
        service: currentService,
        quantity: currentQuantity,
        notes: document.getElementById('notes-input').value,
        startTime: new Date(),
        startTimeFormatted: formatTime(new Date())
    };
    
    // Agregar a pendientes
    pendingOrders.push(order);
    
    // Actualizar tabla y mostrar notificación
    updatePendingTable();
    showNotification(`Nuevo pedido: ${order.dish} × ${order.quantity}`);
    
    // Regresar a la vista principal
    resetApp();
    guardarDatosLocales();
}

// Actualizar tabla de pedidos pendientes
function updatePendingTable() {
    const tableBody = document.getElementById('pending-body');
    const pendingCount = document.getElementById('pending-count');
    
    // Actualizar contador
    pendingCount.textContent = pendingOrders.length;
    
    // Limpiar tabla
    tableBody.innerHTML = '';
    
    // Si no hay pedidos
    if (pendingOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="empty-message">No hay platillos en preparación</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Agregar cada pedido a la tabla
    pendingOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Calcular tiempo transcurrido
        const now = new Date();
        const startTime = new Date(order.startTime);
        const elapsedMs = now - startTime;
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        const mins = Math.floor(elapsedSecs / 60);
        const secs = elapsedSecs % 60;
        
        // Determinar clase CSS según tiempo transcurrido
        let timerClass = '';
        if (mins >= 10) {
            timerClass = 'alert';
        } else if (mins >= 5) {
            timerClass = 'warning';
        }
        
        // Información a mostrar
        const customInfo = order.customizations.length > 0 
            ? `<strong>Personalización:</strong> ${order.customizations.join(', ')}<br>` 
            : '';
        const serviceInfo = `<strong>Servicio:</strong> ${getServiceName(order.service)}<br>`;
        const quantityInfo = order.quantity > 1 ? `<strong>Cantidad:</strong> ${order.quantity}<br>` : '';
        const notesInfo = order.notes ? `<strong>Notas:</strong> ${order.notes}` : '';
        
        row.innerHTML = `
            <td>${order.dish}</td>
            <td>${order.startTimeFormatted}</td>
            <td class="timer-cell ${timerClass}">${padZero(mins)}:${padZero(secs)}</td>
            <td class="details-cell">
                ${customInfo}
                ${serviceInfo}
                ${quantityInfo}
                ${notesInfo}
            </td>
            <td>
                ${getActionButton(order)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Obtener botón de acción según tipo de pedido
function getActionButton(order) {
    if (order.service === 'domicilio') {
        if (!order.deliveryDepartureTime) {
            return `<button class="finish-btn delivery" onclick="markDeliveryDeparture('${order.id}')">Salida</button>`;
        } else if (!order.deliveryArrivalTime) {
            return `<button class="finish-btn delivery-arrived" onclick="markDeliveryArrival('${order.id}')">Entregado</button>`;
        }
    }
    
    let btnClass = '';
    if (order.category === 'frio' || order.category === 'entrada-fria') {
        btnClass = 'cold-kitchen';
    } else {
        btnClass = 'hot-kitchen';
    }
    
    return `<button class="finish-btn ${btnClass}" onclick="finishPreparation('${order.id}')">Finalizar</button>`;
}

// Actualizar tabla de órdenes completadas
function updateCompletedTable() {
    const tableBody = document.getElementById('completed-body');
    tableBody.innerHTML = '';
    
    // Si no hay pedidos completados
    if (completedOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="empty-message">No hay platillos completados</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Determina cuántos mostrar (todos o solo recientes)
    const showAllHistory = document.getElementById('btn-show-all-history').classList.contains('active');
    const ordersToShow = showAllHistory ? completedOrders : completedOrders.slice(0, 10);
    
    // Agregar cada pedido completado a la tabla
    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        
        // Información a mostrar
        const customInfo = order.customizations.length > 0 
            ? `<strong>Personalización:</strong> ${order.customizations.join(', ')}<br>` 
            : '';
        const serviceInfo = `<strong>Servicio:</strong> ${getServiceName(order.service)}<br>`;
        const quantityInfo = order.quantity > 1 ? `<strong>Cantidad:</strong> ${order.quantity}<br>` : '';
        const notesInfo = order.notes ? `<strong>Notas:</strong> ${order.notes}` : '';
        const deliveryInfo = order.deliveryTime ? `<strong>Tiempo de entrega:</strong> ${order.deliveryTime}<br>` : '';
        
        // Determina clase CSS según tiempo total
        let timeClass = 'time-excellent';
        const prepTime = order.prepTime || '';
        if (prepTime) {
            const mins = parseInt(prepTime.split(':')[0]);
            if (mins >= 15) {
                timeClass = 'time-bad';
            } else if (mins >= 10) {
                timeClass = 'time-warning';
            } else if (mins >= 5) {
                timeClass = 'time-good';
            }
        }
        
        row.innerHTML = `
            <td>${order.dish}</td>
            <td>${order.startTimeFormatted}</td>
            <td>${order.endTimeFormatted}</td>
            <td class="${timeClass}">${order.prepTime}</td>
            <td class="details-cell">
                ${customInfo}
                ${serviceInfo}
                ${quantityInfo}
                ${deliveryInfo}
                ${notesInfo}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Finalizar preparación
function finishPreparation(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    const endTime = new Date();
    const prepTimeMillis = endTime - new Date(order.startTime);
    const prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    const prepMins = Math.floor(prepTimeSecs / 60);
    const prepSecs = prepTimeSecs % 60;
    
    const prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification(`¡${order.dish} finalizado en ${prepTimeFormatted}!`);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Registra la salida del repartidor
function markDeliveryDeparture(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Registra la entrega al cliente
function markDeliveryArrival(id) {
    const orderIndex = pendingOrders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcula tiempo total
    const endTime = order.deliveryArrivalTime;
    const prepTimeMillis = endTime - new Date(order.startTime);
    const prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    const prepMins = Math.floor(prepTimeSecs / 60);
    const prepSecs = prepTimeSecs % 60;
    
    const prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // Calcula tiempo específico de entrega
    const deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    const deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    const deliveryMins = Math.floor(deliveryTimeSecs / 60);
    const deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification(`¡${order.dish} entregado al cliente! Tiempo total: ${prepTimeFormatted}`);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para regresar a la pantalla principal
function resetApp() {
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('categories-section').style.display = 'block';
    
    // Reset estados
    currentCategory = '';
    currentDish = '';
    currentCustomizations = [];
    currentService = 'comedor';
    currentQuantity = 1;
    document.getElementById('quantity-display').textContent = "1";
    document.getElementById('notes-input').value = '';
    
    // Reset UI de servicio
    document.querySelectorAll('.option-btn[id^="btn-"]').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('btn-comedor').classList.add('selected');
}

// Guardar datos en localStorage
function guardarDatosLocales() {
    localStorage.setItem('avika_pendingOrders', JSON.stringify(pendingOrders));
    localStorage.setItem('avika_completedOrders', JSON.stringify(completedOrders));
}

// Cargar datos de localStorage
function cargarDatosLocales() {
    const pendingData = localStorage.getItem('avika_pendingOrders');
    const completedData = localStorage.getItem('avika_completedOrders');
    
    if (pendingData) {
        pendingOrders = JSON.parse(pendingData);
    }
    
    if (completedData) {
        completedOrders = JSON.parse(completedData);
    }
}

// Función para iniciar el timer que actualiza los tiempos de pedidos pendientes
function iniciarTimer() {
    // Limpiar intervalo existente si hay uno
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Actualizar cada segundo
    timerInterval = setInterval(() => {
        // Solo actualizar si hay pedidos pendientes
        if (pendingOrders.length > 0) {
            updatePendingTable();
        }
    }, 1000);
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Asignar clase según tipo
    notification.className = '';
    notification.classList.add('notification', `notification-${type}`);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Alternar entre tema claro y oscuro
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeButton = document.getElementById('toggle-theme');
    
    if (document.body.classList.contains('dark-mode')) {
        themeButton.textContent = '☀️';
        localStorage.setItem('avika_theme', 'dark');
    } else {
        themeButton.textContent = '🌙';
        localStorage.setItem('avika_theme', 'light');
    }
}

// Obtener nombre del servicio
function getServiceName(serviceId) {
    const services = {
        'comedor': 'Comedor',
        'domicilio': 'Domicilio',
        'para-llevar': 'Ordena y Espera'
    };
    return services[serviceId] || serviceId;
}

// Función de utilidad para generar ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para formatear hora
function formatTime(date) {
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Agregar ceros iniciales
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Mostrar modal de promedios
function showPromedios() {
    if (completedOrders.length === 0) {
        showNotification('No hay datos suficientes para calcular promedios', 'warning');
        return;
    }
    
    const container = document.getElementById('promedios-contenido');
    container.innerHTML = '<h3>Tiempo Promedio por Platillo</h3>';
    
    // Agrupar por platillo
    const platillos = {};
    completedOrders.forEach(order => {
        const platillo = order.dish;
        if (!platillos[platillo]) {
            platillos[platillo] = [];
        }
        
        // Extraer minutos del tiempo formateado
        if (order.prepTime) {
            const minutos = parseInt(order.prepTime.split(':')[0]);
            platillos[platillo].push(minutos);
        }
    });
    
    // Calcular promedios
    const promedios = [];
    for (const platillo in platillos) {
        const tiempos = platillos[platillo];
        if (tiempos.length > 0) {
            const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
            promedios.push({
                platillo: platillo,
                promedio: promedio,
                count: tiempos.length
            });
        }
    }
    
    // Ordenar por promedio
    promedios.sort((a, b) => a.promedio - b.promedio);
    
    // Crear tabla
    let html = `
        <table style="width: 100%; margin-top: 15px;">
            <thead>
                <tr>
                    <th>Platillo</th>
                    <th>Tiempo Promedio</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    promedios.forEach(item => {
        let timeClass = 'time-excellent';
        if (item.promedio >= 15) {
            timeClass = 'time-bad';
        } else if (item.promedio >= 10) {
            timeClass = 'time-warning';
        } else if (item.promedio >= 5) {
            timeClass = 'time-good';
        }
        
        html += `
            <tr>
                <td>${item.platillo}</td>
                <td class="${timeClass}">${item.promedio.toFixed(1)} min</td>
                <td>${item.count}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML += html;
    document.getElementById('promedios-modal').classList.add('active');
}

// Exportar datos a CSV
function exportToCSV() {
    if (completedOrders.length === 0) {
        showNotification('No hay datos para exportar', 'warning');
        return;
    }
    
    // Crear CSV
    let csv = 'Platillo,Inicio,Fin,Tiempo,Servicio,Personalización,Notas\n';
    
    completedOrders.forEach(order => {
        const personalizacion = order.customizations.join(' + ');
        const notas = order.notes ? order.notes.replace(/,/g, ';') : '';
        
        csv += `"${order.dish}","${order.startTimeFormatted}","${order.endTimeFormatted}","${order.prepTime}","${getServiceName(order.service)}","${personalizacion}","${notas}"\n`;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `avika_pedidos_${formatDateForFile(new Date())}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Datos exportados correctamente');
}

// Formatear fecha para nombre de archivo
function formatDateForFile(date) {
    const day = padZero(date.getDate());
    const month = padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = padZero(date.getHours());
    const mins = padZero(date.getMinutes());
    
    return `${year}${month}${day}_${hours}${mins}`;
}