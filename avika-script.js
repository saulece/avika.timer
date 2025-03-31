// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

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
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatosLocales();
    
    // Configurar temporizadores para platillos pendientes
    actualizarTemporizadores();
    
    // Configurar eventos para botones de categoría
    document.getElementById('btn-frio').addEventListener('click', function() {
        selectCategory('frio', 'Platillos Fríos');
    });
    
    document.getElementById('btn-entrada-fria').addEventListener('click', function() {
        selectCategory('entrada-fria', 'Entradas Frías');
    });
    
    document.getElementById('btn-caliente').addEventListener('click', function() {
        selectCategory('caliente', 'Platillos Calientes');
    });
    
    document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
        selectCategory('entrada-caliente', 'Entradas Calientes');
    });
    
    document.getElementById('btn-combos').addEventListener('click', function() {
        selectCategory('combos', 'Combos');
    });
    
    // Botones de navegación
    document.getElementById('btn-back-to-categories').addEventListener('click', backToCategories);
    document.getElementById('btn-back-to-dishes').addEventListener('click', backToDishes);
    
    // Botones de personalización de servicio
    document.getElementById('btn-comedor').addEventListener('click', function() {
        selectService('comedor', this);
    });
    
    document.getElementById('btn-domicilio').addEventListener('click', function() {
        selectService('domicilio', this);
    });
    
    document.getElementById('btn-para-llevar').addEventListener('click', function() {
        selectService('para-llevar', this);
    });
    
    // Botones de cantidad
    document.getElementById('btn-decrease').addEventListener('click', decreaseQuantity);
    document.getElementById('btn-increase').addEventListener('click', increaseQuantity);
    
    // Botones de acción
    document.getElementById('btn-cancel').addEventListener('click', cancelPreparation);
    document.getElementById('btn-start').addEventListener('click', startPreparation);
    
    // Botón de exportar
    document.getElementById('btn-export').addEventListener('click', exportData);
    
    // Filtros de historial
    document.getElementById('btn-show-all-history').addEventListener('click', function() {
        toggleHistoryFilter(this, true);
    });
    
    document.getElementById('btn-show-recent').addEventListener('click', function() {
        toggleHistoryFilter(this, false);
    });
    
    // Inicializar tablas
    updatePendingTable();
    updateCompletedTable();
});

// Función para seleccionar categoría
function selectCategory(category, title) {
    currentCategory = category;
    document.getElementById('selected-category-title').textContent = title;
    
    // Ocultar sección de categorías y mostrar sección de platillos
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
    
    // Llenar el contenedor de platillos
    const dishesContainer = document.getElementById('dishes-container');
    dishesContainer.innerHTML = '';
    
    if (dishes[category]) {
        dishes[category].forEach(function(dish) {
            const btn = document.createElement('button');
            btn.textContent = dish;
            btn.className = 'dish-btn';
            
            // Marcar combos como especiales
            if (category === 'combos') {
                btn.classList.add('special-combo');
                isSpecialCombo = true;
            } else {
                isSpecialCombo = false;
            }
            
            btn.addEventListener('click', function() {
                selectDish(dish);
            });
            
            dishesContainer.appendChild(btn);
        });
    }
}

// Función para seleccionar platillo
function selectDish(dish) {
    currentDish = dish;
    currentCustomizations = [];
    
    document.getElementById('selected-dish-title').textContent = dish;
    
    // Ocultar sección de platillos y mostrar sección de preparación
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'block';
    
    // Llenar opciones de personalización
    const customizationContainer = document.getElementById('personalization-options');
    customizationContainer.innerHTML = '';
    
    for (let id in customizationOptions) {
        const btn = document.createElement('button');
        btn.textContent = customizationOptions[id];
        btn.className = 'option-btn';
        btn.dataset.id = id;
        
        btn.addEventListener('click', function() {
            toggleCustomization(this);
        });
        
        customizationContainer.appendChild(btn);
    }
}

// Función para seleccionar servicio
function selectService(service, button) {
    currentService = service;
    
    // Actualizar el estilo de los botones
    const serviceBtns = document.querySelectorAll('.option-btns .option-btn');
    serviceBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    button.classList.add('selected');
}

// Función para alternar personalización
function toggleCustomization(button) {
    const customizationId = button.dataset.id;
    
    if (button.classList.contains('selected')) {
        // Remover de la lista
        button.classList.remove('selected');
        const index = currentCustomizations.indexOf(customizationId);
        if (index !== -1) {
            currentCustomizations.splice(index, 1);
        }
    } else {
        // Agregar a la lista
        button.classList.add('selected');
        currentCustomizations.push(customizationId);
    }
}

// Función para disminuir cantidad
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantity-display').textContent = currentQuantity;
    }
}

// Función para aumentar cantidad
function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantity-display').textContent = currentQuantity;
}

// Función para cancelar preparación y volver a categorías
function cancelPreparation() {
    resetPreparationForm();
    backToCategories();
}

// Función para volver a categorías
function backToCategories() {
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('categories-section').style.display = 'block';
}

// Función para volver a platillos
function backToDishes() {
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
}

// Función para resetear el formulario de preparación
function resetPreparationForm() {
    currentDish = '';
    currentCustomizations = [];
    currentService = 'comedor';
    currentQuantity = 1;
    
    document.getElementById('quantity-display').textContent = '1';
    document.getElementById('notes-input').value = '';
    
    // Resetear botones de personalización
    const customizationBtns = document.querySelectorAll('#personalization-options .option-btn');
    customizationBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    // Resetear botones de servicio
    const serviceBtns = document.querySelectorAll('.option-btns .option-btn');
    serviceBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    document.getElementById('btn-comedor').classList.add('selected');
}

// Función para iniciar preparación
function startPreparation() {
    // Validar que haya un platillo seleccionado
    if (!currentDish) {
        showNotification('Por favor selecciona un platillo');
        return;
    }
    
    // Crear objeto de orden
    const order = {
        id: Date.now().toString(),
        dish: currentDish,
        category: currentCategory,
        customizations: currentCustomizations.slice(),
        service: currentService,
        quantity: currentQuantity,
        notes: document.getElementById('notes-input').value,
        startTime: new Date(),
        startTimeFormatted: formatTime(new Date()),
        isCombo: isSpecialCombo,
        hotKitchenDone: false,
        coldKitchenDone: false
    };
    
    // Agregar a la lista de pendientes
    pendingOrders.push(order);
    
    // Actualizar tabla y guardar datos
    updatePendingTable();
    guardarDatosLocales();
    
    // Mostrar notificación
    showNotification('Preparación iniciada: ' + order.dish);
    
    // Reiniciar formulario y volver a categorías
    resetPreparationForm();
    backToCategories();
}

// Función para marcar cocina caliente como terminada (para combos)
function markHotKitchenDone(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    order.hotKitchenDone = true;
    order.hotKitchenTime = new Date();
    order.hotKitchenTimeFormatted = formatTime(order.hotKitchenTime);
    
    // Calcular tiempo desde inicio hasta finalización de cocina caliente
    var timeMillis = order.hotKitchenTime - new Date(order.startTime);
    var timeSecs = Math.floor(timeMillis / 1000);
    var mins = Math.floor(timeSecs / 60);
    var secs = timeSecs % 60;
    
    order.hotKitchenPrepTime = padZero(mins) + ':' + padZero(secs) + ' minutos';
    
    showNotification('Cocina caliente completada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Función para marcar cocina fría como terminada (para combos)
function markColdKitchenDone(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    order.coldKitchenDone = true;
    order.coldKitchenTime = new Date();
    order.coldKitchenTimeFormatted = formatTime(order.coldKitchenTime);
    
    // Calcular tiempo desde inicio hasta finalización de cocina fría
    var timeMillis = order.coldKitchenTime - new Date(order.startTime);
    var timeSecs = Math.floor(timeMillis / 1000);
    var mins = Math.floor(timeSecs / 60);
    var secs = timeSecs % 60;
    
    order.coldKitchenPrepTime = padZero(mins) + ':' + padZero(secs) + ' minutos';
    
    // Si el servicio no es a domicilio, finalizar el pedido
    if (order.service !== 'domicilio') {
        finishPreparation(id);
    } else {
        showNotification('Cocina fría completada para ' + order.dish);
        updatePendingTable();
        guardarDatosLocales();
    }
}

// Función para registrar la salida del repartidor
function markDeliveryDeparture(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Función para registrar la entrega al cliente
function markDeliveryArrival(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega y completa el pedido
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcular tiempo total desde inicio hasta entrega
    var endTime = order.deliveryArrivalTime;
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // También calcular el tiempo específico de entrega (desde salida hasta llegada)
    var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    var deliveryMins = Math.floor(deliveryTimeSecs / 60);
    var deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    // Mover a completados
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                    prepTimeFormatted + ', Tiempo de entrega: ' + order.deliveryTime);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para finalizar la preparación
function finishPreparation(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    var endTime = new Date();
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' finalizado en ' + prepTimeFormatted + '!');
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para ayudar a encontrar el índice de una orden por ID
function findOrderIndex(id) {
    for (let i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            return i;
        }
    }
    return -1;
}

// Función para actualizar la tabla de pendientes
function updatePendingTable() {
    const tbody = document.getElementById('pending-body');
    tbody.innerHTML = '';
    
    pendingOrders.forEach(function(order) {
        const tr = document.createElement('tr');
        
        // Columna de platillo
        const tdDish = document.createElement('td');
        tdDish.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        tr.appendChild(tdDish);
        
        // Columna de inicio
        const tdStart = document.createElement('td');
        tdStart.textContent = order.startTimeFormatted;
        tr.appendChild(tdStart);
        
        // Columna de tiempo transcurrido
        const tdElapsed = document.createElement('td');
        tdElapsed.className = 'timer-cell';
        tdElapsed.dataset.startTime = order.startTime;
        tdElapsed.textContent = '00:00';
        tr.appendChild(tdElapsed);
        
        // Columna de detalles
        const tdDetails = document.createElement('td');
        
        // Agregar servicio
        let serviceText = '';
        if (order.service === 'comedor') {
            serviceText = '🍽️ Comedor';
        } else if (order.service === 'domicilio') {
            serviceText = '🛵 Domicilio';
        } else if (order.service === 'para-llevar') {
            serviceText = '📦 Para llevar';
        }
        
        let customizationsText = '';
        if (order.customizations.length > 0) {
            const customizationsList = order.customizations.map(id => customizationOptions[id]).join(', ');
            customizationsText = '<br>✨ ' + customizationsList;
        }
        
        let notesText = '';
        if (order.notes) {
            notesText = '<br>📝 ' + order.notes;
        }
        
        let kitchenStatus = '';
        if (order.isCombo) {
            kitchenStatus = '<br>🔥 Cocina caliente: ' + (order.hotKitchenDone ? '✅ Listo (' + order.hotKitchenPrepTime + ')' : '⏳ En proceso');
            kitchenStatus += '<br>❄️ Cocina fría: ' + (order.coldKitchenDone ? '✅ Listo (' + order.coldKitchenPrepTime + ')' : '⏳ En proceso');
        }
        
        let deliveryStatus = '';
        if (order.service === 'domicilio') {
            if (order.deliveryDepartureTime) {
                deliveryStatus = '<br>🛵 Salida: ' + order.deliveryDepartureTimeFormatted;
            }
        }
        
        tdDetails.innerHTML = serviceText + customizationsText + notesText + kitchenStatus + deliveryStatus;
        tr.appendChild(tdDetails);
        
        // Columna de acción
        const tdAction = document.createElement('td');
        
        // Para combos, mostrar botones específicos de cocinas
        if (order.isCombo) {
            if (!order.hotKitchenDone) {
                const btnHotKitchen = document.createElement('button');
                btnHotKitchen.className = 'finish-btn hot-kitchen';
                btnHotKitchen.textContent = 'Finalizar Cocina Caliente';
                btnHotKitchen.addEventListener('click', function() {
                    markHotKitchenDone(order.id);
                });
                tdAction.appendChild(btnHotKitchen);
            }
            
            if (order.hotKitchenDone && !order.coldKitchenDone) {
                const btnColdKitchen = document.createElement('button');
                btnColdKitchen.className = 'finish-btn cold-kitchen';
                btnColdKitchen.textContent = 'Finalizar Cocina Fría';
                btnColdKitchen.addEventListener('click', function() {
                    markColdKitchenDone(order.id);
                });
                tdAction.appendChild(btnColdKitchen);
            }
        } else {
            // Para platillos normales, botón de finalizar
            const btnFinish = document.createElement('button');
            btnFinish.className = 'finish-btn';
            
            // Clase específica según categoría
            if (order.category === 'caliente' || order.category === 'entrada-caliente') {
                btnFinish.classList.add('hot-kitchen');
            } else if (order.category === 'frio' || order.category === 'entrada-fria') {
                btnFinish.classList.add('cold-kitchen');
            }
            
            btnFinish.textContent = 'Finalizar';
            btnFinish.addEventListener('click', function() {
                finishPreparation(order.id);
            });
            tdAction.appendChild(btnFinish);
        }
        
        // Para pedidos a domicilio, agregar botones adicionales
        if (order.service === 'domicilio') {
            // Si es combo, verificar que ambas cocinas estén terminadas
            if ((order.isCombo && order.coldKitchenDone) || !order.isCombo) {
                if (!order.deliveryDepartureTime) {
                    const btnDepart = document.createElement('button');
                    btnDepart.className = 'finish-btn';
                    btnDepart.textContent = 'Registrar salida';
                    btnDepart.addEventListener('click', function() {
                        markDeliveryDeparture(order.id);
                    });
                    tdAction.appendChild(btnDepart);
                } else if (!order.deliveryArrivalTime) {
                    const btnArrival = document.createElement('button');
                    btnArrival.className = 'finish-btn';
                    btnArrival.textContent = 'Registrar entrega';
                    btnArrival.addEventListener('click', function() {
                        markDeliveryArrival(order.id);
                    });
                    tdAction.appendChild(btnArrival);
                }
            }
        }
        
        tr.appendChild(tdAction);
        
        tbody.appendChild(tr);
    });
    
    // Actualizar contador de pendientes
    document.getElementById('pending-count').textContent = '(' + pendingOrders.length + ')';
}

// Función para actualizar la tabla de completados
function updateCompletedTable(showAllHistory = false) {
    const tbody = document.getElementById('completed-body');
    tbody.innerHTML = '';
    
    // Filtrar según necesidad
    let ordersToShow = completedOrders;
    if (!showAllHistory) {
        // Mostrar solo las últimas 10
        ordersToShow = completedOrders.slice(0, 10);
    }
    
    ordersToShow.forEach(function(order) {
        const tr = document.createElement('tr');
        
        // Columna de platillo
        const tdDish = document.createElement('td');
        tdDish.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        tr.appendChild(tdDish);
        
        // Columna de inicio
        const tdStart = document.createElement('td');
        tdStart.textContent = order.startTimeFormatted;
        tr.appendChild(tdStart);
        
        // Columna de fin
        const tdEnd = document.createElement('td');
        tdEnd.textContent = order.endTimeFormatted;
        tr.appendChild(tdEnd);
        
        // Columna de tiempo total
        const tdTime = document.createElement('td');
        
        // Aplicar clase según tiempo
        const prepTimeMinutes = getMinutesFromTimeString(order.prepTime);
        if (prepTimeMinutes < 5) {
            tdTime.className = 'time-excellent';
        } else if (prepTimeMinutes < 10) {
            tdTime.className = 'time-good';
        } else if (prepTimeMinutes < 15) {
            tdTime.className = 'time-warning';
        } else {
            tdTime.className = 'time-bad';
        }
        
        tdTime.textContent = order.prepTime;
        tr.appendChild(tdTime);
        
        // Columna de detalles
        const tdDetails = document.createElement('td');
        
        let serviceText = '';
        if (order.service === 'comedor') {
            serviceText = '🍽️ Comedor';
        } else if (order.service === 'domicilio') {
            serviceText = '🛵 Domicilio';
        } else if (order.service === 'para-llevar') {
            serviceText = '📦 Para llevar';
        }
        
        let customizationsText = '';
        if (order.customizations.length > 0) {
            const customizationsList = order.customizations.map(id => customizationOptions[id]).join(', ');
            customizationsText = '<br>✨ ' + customizationsList;
        }
        
        let deliveryTimeText = '';
        if (order.service === 'domicilio' && order.deliveryTime) {
            deliveryTimeText = '<br>🛵 Tiempo de entrega: ' + order.deliveryTime;
        }
        
        let comboStatusText = '';
        if (order.isCombo) {
            comboStatusText = '<br>🔥 Cocina caliente: ' + order.hotKitchenPrepTime;
            comboStatusText += '<br>❄️ Cocina fría: ' + order.coldKitchenPrepTime;
        }
        
        tdDetails.innerHTML = serviceText + customizationsText + deliveryTimeText + comboStatusText;
        tr.appendChild(tdDetails);
        
        tbody.appendChild(tr);
    });
}

// Función para alternar el filtro de historial
function toggleHistoryFilter(button, showAll) {
    // Actualizar estado de botones
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Actualizar tabla
    updateCompletedTable(showAll);
}

// Función para obtener minutos de una cadena de tiempo (formato "MM:SS minutos")
function getMinutesFromTimeString(timeString) {
    const match = timeString.match(/(\d+):(\d+)/);
    if (match) {
        return parseInt(match[1]) + parseInt(match[2]) / 60;
    }
    return 0;
}

// Función para formatear el tiempo
function formatTime(date) {
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    return hours + ':' + minutes + ':' + seconds;
}

// Función para agregar ceros iniciales
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Función para mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(function() {
        notification.
        // Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

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
        'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll'
    ],
    'entrada-fria': [
        'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
        'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
        'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
    ],
    'caliente': [
        'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
        'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
    ],
    'entrada-caliente': [
        'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
        'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
    ],
    'combos': [
        'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
    ]
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatosLocales();
    
    // Configurar temporizadores para platillos pendientes
    actualizarTemporizadores();
    
    // Configurar eventos para botones de categoría
    document.getElementById('btn-frio').addEventListener('click', function() {
        selectCategory('frio', 'Platillos Fríos');
    });
    
    document.getElementById('btn-entrada-fria').addEventListener('click', function() {
        selectCategory('entrada-fria', 'Entradas Frías');
    });
    
    document.getElementById('btn-caliente').addEventListener('click', function() {
        selectCategory('caliente', 'Platillos Calientes');
    });
    
    document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
        selectCategory('entrada-caliente', 'Entradas Calientes');
    });
    
    document.getElementById('btn-combos').addEventListener('click', function() {
        selectCategory('combos', 'Combos');
    });
    
    // Botones de navegación
    document.getElementById('btn-back-to-categories').addEventListener('click', backToCategories);
    document.getElementById('btn-back-to-dishes').addEventListener('click', backToDishes);
    
    // Botones de personalización de servicio
    document.getElementById('btn-comedor').addEventListener('click', function() {
        selectService('comedor', this);
    });
    
    document.getElementById('btn-domicilio').addEventListener('click', function() {
        selectService('domicilio', this);
    });
    
    document.getElementById('btn-para-llevar').addEventListener('click', function() {
        selectService('para-llevar', this);
    });
    
    // Botones de cantidad
    document.getElementById('btn-decrease').addEventListener('click', decreaseQuantity);
    document.getElementById('btn-increase').addEventListener('click', increaseQuantity);
    
    // Botones de acción
    document.getElementById('btn-cancel').addEventListener('click', cancelPreparation);
    document.getElementById('btn-start').addEventListener('click', startPreparation);
    
    // Botón de exportar
    document.getElementById('btn-export').addEventListener('click', exportData);
    
    // Filtros de historial
    document.getElementById('btn-show-all-history').addEventListener('click', function() {
        toggleHistoryFilter(this, true);
    });
    
    document.getElementById('btn-show-recent').addEventListener('click', function() {
        toggleHistoryFilter(this, false);
    });
    
    // Inicializar tablas
    updatePendingTable();
    updateCompletedTable();
});

// Función para seleccionar categoría
function selectCategory(category, title) {
    currentCategory = category;
    document.getElementById('selected-category-title').textContent = title;
    
    // Ocultar sección de categorías y mostrar sección de platillos
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
    
    // Llenar el contenedor de platillos
    const dishesContainer = document.getElementById('dishes-container');
    dishesContainer.innerHTML = '';
    
    if (dishes[category]) {
        dishes[category].forEach(function(dish) {
            const btn = document.createElement('button');
            btn.textContent = dish;
            btn.className = 'dish-btn';
            
            // Marcar combos como especiales
            if (category === 'combos') {
                btn.classList.add('special-combo');
                isSpecialCombo = true;
            } else {
                isSpecialCombo = false;
            }
            
            btn.addEventListener('click', function() {
                selectDish(dish);
            });
            
            dishesContainer.appendChild(btn);
        });
    }
}

// Función para seleccionar platillo
function selectDish(dish) {
    currentDish = dish;
    currentCustomizations = [];
    
    document.getElementById('selected-dish-title').textContent = dish;
    
    // Ocultar sección de platillos y mostrar sección de preparación
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'block';
    
    // Llenar opciones de personalización
    const customizationContainer = document.getElementById('personalization-options');
    customizationContainer.innerHTML = '';
    
    for (let id in customizationOptions) {
        const btn = document.createElement('button');
        btn.textContent = customizationOptions[id];
        btn.className = 'option-btn';
        btn.dataset.id = id;
        
        btn.addEventListener('click', function() {
            toggleCustomization(this);
        });
        
        customizationContainer.appendChild(btn);
    }
}

// Función para seleccionar servicio
function selectService(service, button) {
    currentService = service;
    
    // Actualizar el estilo de los botones
    const serviceBtns = document.querySelectorAll('.option-btns .option-btn');
    serviceBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    button.classList.add('selected');
}

// Función para alternar personalización
function toggleCustomization(button) {
    const customizationId = button.dataset.id;
    
    if (button.classList.contains('selected')) {
        // Remover de la lista
        button.classList.remove('selected');
        const index = currentCustomizations.indexOf(customizationId);
        if (index !== -1) {
            currentCustomizations.splice(index, 1);
        }
    } else {
        // Agregar a la lista
        button.classList.add('selected');
        currentCustomizations.push(customizationId);
    }
}

// Función para disminuir cantidad
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantity-display').textContent = currentQuantity;
    }
}

// Función para aumentar cantidad
function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantity-display').textContent = currentQuantity;
}

// Función para cancelar preparación y volver a categorías
function cancelPreparation() {
    resetPreparationForm();
    backToCategories();
}

// Función para volver a categorías
function backToCategories() {
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('categories-section').style.display = 'block';
}

// Función para volver a platillos
function backToDishes() {
    document.getElementById('preparation-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
}

// Función para resetear el formulario de preparación
function resetPreparationForm() {
    currentDish = '';
    currentCustomizations = [];
    currentService = 'comedor';
    currentQuantity = 1;
    
    document.getElementById('quantity-display').textContent = '1';
    document.getElementById('notes-input').value = '';
    
    // Resetear botones de personalización
    const customizationBtns = document.querySelectorAll('#personalization-options .option-btn');
    customizationBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    // Resetear botones de servicio
    const serviceBtns = document.querySelectorAll('.option-btns .option-btn');
    serviceBtns.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    document.getElementById('btn-comedor').classList.add('selected');
}

// Función para iniciar preparación
function startPreparation() {
    // Validar que haya un platillo seleccionado
    if (!currentDish) {
        showNotification('Por favor selecciona un platillo');
        return;
    }
    
    // Crear objeto de orden
    const order = {
        id: Date.now().toString(),
        dish: currentDish,
        category: currentCategory,
        customizations: currentCustomizations.slice(),
        service: currentService,
        quantity: currentQuantity,
        notes: document.getElementById('notes-input').value,
        startTime: new Date(),
        startTimeFormatted: formatTime(new Date()),
        isCombo: isSpecialCombo,
        hotKitchenDone: false,
        coldKitchenDone: false
    };
    
    // Agregar a la lista de pendientes
    pendingOrders.push(order);
    
    // Actualizar tabla y guardar datos
    updatePendingTable();
    guardarDatosLocales();
    
    // Mostrar notificación
    showNotification('Preparación iniciada: ' + order.dish);
    
    // Reiniciar formulario y volver a categorías
    resetPreparationForm();
    backToCategories();
}

// Función para marcar cocina caliente como terminada (para combos)
function markHotKitchenDone(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    order.hotKitchenDone = true;
    order.hotKitchenTime = new Date();
    order.hotKitchenTimeFormatted = formatTime(order.hotKitchenTime);
    
    // Calcular tiempo desde inicio hasta finalización de cocina caliente
    var timeMillis = order.hotKitchenTime - new Date(order.startTime);
    var timeSecs = Math.floor(timeMillis / 1000);
    var mins = Math.floor(timeSecs / 60);
    var secs = timeSecs % 60;
    
    order.hotKitchenPrepTime = padZero(mins) + ':' + padZero(secs) + ' minutos';
    
    showNotification('Cocina caliente completada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Función para marcar cocina fría como terminada (para combos)
function markColdKitchenDone(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    order.coldKitchenDone = true;
    order.coldKitchenTime = new Date();
    order.coldKitchenTimeFormatted = formatTime(order.coldKitchenTime);
    
    // Calcular tiempo desde inicio hasta finalización de cocina fría
    var timeMillis = order.coldKitchenTime - new Date(order.startTime);
    var timeSecs = Math.floor(timeMillis / 1000);
    var mins = Math.floor(timeSecs / 60);
    var secs = timeSecs % 60;
    
    order.coldKitchenPrepTime = padZero(mins) + ':' + padZero(secs) + ' minutos';
    
    // Si el servicio no es a domicilio, finalizar el pedido
    if (order.service !== 'domicilio') {
        finishPreparation(id);
    } else {
        showNotification('Cocina fría completada para ' + order.dish);
        updatePendingTable();
        guardarDatosLocales();
    }
}

// Función para registrar la salida del repartidor
function markDeliveryDeparture(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Función para registrar la entrega al cliente
function markDeliveryArrival(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega y completa el pedido
    order.deliveryArrivalTime = new Date();
    order.deliveryArrivalTimeFormatted = formatTime(order.deliveryArrivalTime);
    
    // Calcular tiempo total desde inicio hasta entrega
    var endTime = order.deliveryArrivalTime;
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    // También calcular el tiempo específico de entrega (desde salida hasta llegada)
    var deliveryTimeMillis = endTime - new Date(order.deliveryDepartureTime);
    var deliveryTimeSecs = Math.floor(deliveryTimeMillis / 1000);
    var deliveryMins = Math.floor(deliveryTimeSecs / 60);
    var deliverySecs = deliveryTimeSecs % 60;
    
    order.deliveryTime = padZero(deliveryMins) + ':' + padZero(deliverySecs) + ' minutos';
    
    // Mover a completados
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' entregado al cliente! Tiempo total: ' + 
                    prepTimeFormatted + ', Tiempo de entrega: ' + order.deliveryTime);
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para finalizar la preparación
function finishPreparation(id) {
    const orderIndex = findOrderIndex(id);
    if (orderIndex === -1) return;
    
    const order = pendingOrders[orderIndex];
    
    var endTime = new Date();
    var prepTimeMillis = endTime - new Date(order.startTime);
    var prepTimeSecs = Math.floor(prepTimeMillis / 1000);
    var prepMins = Math.floor(prepTimeSecs / 60);
    var prepSecs = prepTimeSecs % 60;
    
    var prepTimeFormatted = padZero(prepMins) + ':' + padZero(prepSecs) + ' minutos';
    
    order.endTime = endTime;
    order.endTimeFormatted = formatTime(endTime);
    order.prepTime = prepTimeFormatted;
    
    completedOrders.unshift(order);
    pendingOrders.splice(orderIndex, 1);
    
    showNotification('¡' + order.dish + ' finalizado en ' + prepTimeFormatted + '!');
    
    updatePendingTable();
    updateCompletedTable();
    guardarDatosLocales();
}

// Función para ayudar a encontrar el índice de una orden por ID
function findOrderIndex(id) {
    for (let i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            return i;
        }
    }
    return -1;
}

// Función para actualizar la tabla de pendientes
function updatePendingTable() {
    const tbody = document.getElementById('pending-body');
    tbody.innerHTML = '';
    
    pendingOrders.forEach(function(order) {
        const tr = document.createElement('tr');
        
        // Columna de platillo
        const tdDish = document.createElement('td');
        tdDish.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        tr.appendChild(tdDish);
        
        // Columna de inicio
        const tdStart = document.createElement('td');
        tdStart.textContent = order.startTimeFormatted;
        tr.appendChild(tdStart);
        
        // Columna de tiempo transcurrido
        const tdElapsed = document.createElement('td');
        tdElapsed.className = 'timer-cell';
        tdElapsed.dataset.startTime = order.startTime;
        tdElapsed.textContent = '00:00';
        tr.appendChild(tdElapsed);
        
        // Columna de detalles
        const tdDetails = document.createElement('td');
        
        // Agregar servicio
        let serviceText = '';
        if (order.service === 'comedor') {
            serviceText = '🍽️ Comedor';
        } else if (order.service === 'domicilio') {
            serviceText = '🛵 Domicilio';
        } else if (order.service === 'para-llevar') {
            serviceText = '📦 Para llevar';
        }
        
        let customizationsText = '';
        if (order.customizations.length > 0) {
            const customizationsList = order.customizations.map(id => customizationOptions[id]).join(', ');
            customizationsText = '<br>✨ ' + customizationsList;
        }
        
        let notesText = '';
        if (order.notes) {
            notesText = '<br>📝 ' + order.notes;
        }
        
        let kitchenStatus = '';
        if (order.isCombo) {
            kitchenStatus = '<br>🔥 Cocina caliente: ' + (order.hotKitchenDone ? '✅ Listo (' + order.hotKitchenPrepTime + ')' : '⏳ En proceso');
            kitchenStatus += '<br>❄️ Cocina fría: ' + (order.coldKitchenDone ? '✅ Listo (' + order.coldKitchenPrepTime + ')' : '⏳ En proceso');
        }
        
        let deliveryStatus = '';
        if (order.service === 'domicilio') {
            if (order.deliveryDepartureTime) {
                deliveryStatus = '<br>🛵 Salida: ' + order.deliveryDepartureTimeFormatted;
            }
        }
        
        tdDetails.innerHTML = serviceText + customizationsText + notesText + kitchenStatus + deliveryStatus;
        tr.appendChild(tdDetails);
        
        // Columna de acción
        const tdAction = document.createElement('td');
        
        // Para combos, mostrar botones específicos de cocinas
        if (order.isCombo) {
            if (!order.hotKitchenDone) {
                const btnHotKitchen = document.createElement('button');
                btnHotKitchen.className = 'finish-btn hot-kitchen';
                btnHotKitchen.textContent = 'Finalizar Cocina Caliente';
                btnHotKitchen.addEventListener('click', function() {
                    markHotKitchenDone(order.id);
                });
                tdAction.appendChild(btnHotKitchen);
            }
            
            if (order.hotKitchenDone && !order.coldKitchenDone) {
                const btnColdKitchen = document.createElement('button');
                btnColdKitchen.className = 'finish-btn cold-kitchen';
                btnColdKitchen.textContent = 'Finalizar Cocina Fría';
                btnColdKitchen.addEventListener('click', function() {
                    markColdKitchenDone(order.id);
                });
                tdAction.appendChild(btnColdKitchen);
            }
        } else {
            // Para platillos normales, botón de finalizar
            const btnFinish = document.createElement('button');
            btnFinish.className = 'finish-btn';
            
            // Clase específica según categoría
            if (order.category === 'caliente' || order.category === 'entrada-caliente') {
                btnFinish.classList.add('hot-kitchen');
            } else if (order.category === 'frio' || order.category === 'entrada-fria') {
                btnFinish.classList.add('cold-kitchen');
            }
            
            btnFinish.textContent = 'Finalizar';
            btnFinish.addEventListener('click', function() {
                finishPreparation(order.id);
            });
            tdAction.appendChild(btnFinish);
        }
        
        // Para pedidos a domicilio, agregar botones adicionales
        if (order.service === 'domicilio') {
            // Si es combo, verificar que ambas cocinas estén terminadas
            if ((order.isCombo && order.coldKitchenDone) || !order.isCombo) {
                if (!order.deliveryDepartureTime) {
                    const btnDepart = document.createElement('button');
                    btnDepart.className = 'finish-btn';
                    btnDepart.textContent = 'Registrar salida';
                    btnDepart.addEventListener('click', function() {
                        markDeliveryDeparture(order.id);
                    });
                    tdAction.appendChild(btnDepart);
                } else if (!order.deliveryArrivalTime) {
                    const btnArrival = document.createElement('button');
                    btnArrival.className = 'finish-btn';
                    btnArrival.textContent = 'Registrar entrega';
                    btnArrival.addEventListener('click', function() {
                        markDeliveryArrival(order.id);
                    });
                    tdAction.appendChild(btnArrival);
                }
            }
        }
        
        tr.appendChild(tdAction);
        
        tbody.appendChild(tr);
    });
    
    // Actualizar contador de pendientes
    document.getElementById('pending-count').textContent = '(' + pendingOrders.length + ')';
}

// Función para actualizar la tabla de completados
function updateCompletedTable(showAllHistory = false) {
    const tbody = document.getElementById('completed-body');
    tbody.innerHTML = '';
    
    // Filtrar según necesidad
    let ordersToShow = completedOrders;
    if (!showAllHistory) {
        // Mostrar solo las últimas 10
        ordersToShow = completedOrders.slice(0, 10);
    }
    
    ordersToShow.forEach(function(order) {
        const tr = document.createElement('tr');
        
        // Columna de platillo
        const tdDish = document.createElement('td');
        tdDish.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        tr.appendChild(tdDish);
        
        // Columna de inicio
        const tdStart = document.createElement('td');
        tdStart.textContent = order.startTimeFormatted;
        tr.appendChild(tdStart);
        
        // Columna de fin
        const tdEnd = document.createElement('td');
        tdEnd.textContent = order.endTimeFormatted;
        tr.appendChild(tdEnd);
        
        // Columna de tiempo total
        const tdTime = document.createElement('td');
        
        // Aplicar clase según tiempo
        const prepTimeMinutes = getMinutesFromTimeString(order.prepTime);
        if (prepTimeMinutes < 5) {
            tdTime.className = 'time-excellent';
        } else if (prepTimeMinutes < 10) {
            tdTime.className = 'time-good';
        } else if (prepTimeMinutes < 15) {
            tdTime.className = 'time-warning';
        } else {
            tdTime.className = 'time-bad';
        }
        
        tdTime.textContent = order.prepTime;
        tr.appendChild(tdTime);
        
        // Columna de detalles
        const tdDetails = document.createElement('td');
        
        let serviceText = '';
        if (order.service === 'comedor') {
            serviceText = '🍽️ Comedor';
        } else if (order.service === 'domicilio') {
            serviceText = '🛵 Domicilio';
        } else if (order.service === 'para-llevar') {
            serviceText = '📦 Para llevar';
        }
        
        let customizationsText = '';
        if (order.customizations.length > 0) {
            const customizationsList = order.customizations.map(id => customizationOptions[id]).join(', ');
            customizationsText = '<br>✨ ' + customizationsList;
        }
        
        let deliveryTimeText = '';
        if (order.service === 'domicilio' && order.deliveryTime) {
            deliveryTimeText = '<br>🛵 Tiempo de entrega: ' + order.deliveryTime;
        }
        
        let comboStatusText = '';
        if (order.isCombo) {
            comboStatusText = '<br>🔥 Cocina caliente: ' + order.hotKitchenPrepTime;
            comboStatusText += '<br>❄️ Cocina fría: ' + order.coldKitchenPrepTime;
        }
        
        tdDetails.innerHTML = serviceText + customizationsText + deliveryTimeText + comboStatusText;
        tr.appendChild(tdDetails);
        
        tbody.appendChild(tr);
    });
}

// Función para alternar el filtro de historial
function toggleHistoryFilter(button, showAll) {
    // Actualizar estado de botones
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Actualizar tabla
    updateCompletedTable(showAll);
}

// Función para obtener minutos de una cadena de tiempo (formato "MM:SS minutos")
function getMinutesFromTimeString(timeString) {
    const match = timeString.match(/(\d+):(\d+)/);
    if (match) {
        return parseInt(match[1]) + parseInt(match[2]) / 60;
    }
    return 0;
}

// Función para formatear el tiempo
function formatTime(date) {
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    return hours + ':' + minutes + ':' + seconds;
}

// Función para agregar ceros iniciales
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Función para mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(function() {
        notification.style.display = 'none';
    }, 3000);
}

// Función para actualizar los temporizadores
function actualizarTemporizadores() {
    // Limpiar intervalo existente si hay uno
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Crear nuevo intervalo
    timerInterval = setInterval(function() {
        // Actualizar temporizadores de platillos pendientes
        const timerCells = document.querySelectorAll('.timer-cell[data-start-time]');
        
        timerCells.forEach(function(cell) {
            const startTime = new Date(cell.dataset.startTime);
            const now = new Date();
            const elapsedMillis = now - startTime;
            const elapsedSecs = Math.floor(elapsedMillis / 1000);
            const mins = Math.floor(elapsedSecs / 60);
            const secs = elapsedSecs % 60;
            
            cell.textContent = padZero(mins) + ':' + padZero(secs);
            
            // Cambiar color según tiempo transcurrido
            if (mins >= 15) {
                cell.className = 'timer-cell alert';
            } else if (mins >= 10) {
                cell.className = 'timer-cell warning';
            } else {
                cell.className = 'timer-cell';
            }
        });
    }, 1000);
}

// Guardar datos en el almacenamiento local
function guardarDatosLocales() {
    try {
        // Convertir la fecha a string para evitar problemas con JSON
        const pendingStringified = JSON.stringify(pendingOrders);
        const completedStringified = JSON.stringify(completedOrders);
        
        localStorage.setItem('avika_pendingOrders', pendingStringified);
        localStorage.setItem('avika_completedOrders', completedStringified);
        localStorage.setItem('avika_lastSaved', new Date().toISOString());
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showNotification('Error al guardar datos. Espacio insuficiente o acceso restringido.');
    }
}

// Cargar datos del almacenamiento local
function cargarDatosLocales() {
    try {
        const pendingData = localStorage.getItem('avika_pendingOrders');
        const completedData = localStorage.getItem('avika_completedOrders');
        
        if (pendingData) {
            pendingOrders = JSON.parse(pendingData);
        }
        
        if (completedData) {
            completedOrders = JSON.parse(completedData);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showNotification('Error al cargar datos guardados.');
    }
}

// Función para exportar datos
function exportData() {
    // Calcular promedios y estadísticas
    const stats = calculateStats();
    
    // Crear documento HTML para imprimir/guardar
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Avika - Reporte de Tiempos</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
            }
            h1, h2 {
                color: #3498db;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .stats-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-box {
                flex: 1;
                min-width: 200px;
                border: 1px solid #ddd;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #3498db;
            }
            .highlight {
                color: #e74c3c;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 0.8em;
                color: #777;
            }
            @media print {
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <h1>Avika - Reporte de Tiempos</h1>
        <p>Generado el: ${new Date().toLocaleString()}</p>
        
        <div class="stats-container">
            <div class="stat-box">
                <div class="stat-title">Cocina Fría</div>
                <p>Tiempo promedio: <strong>${stats.frio.promedio}</strong></p>
                <p>Platillo más rápido: ${stats.frio.masRapido.dish} (${stats.frio.masRapido.tiempo})</p>
                <p>Platillo más lento: ${stats.frio.masLento.dish} (${stats.frio.masLento.tiempo})</p>
                <p>Total platillos: ${stats.frio.total}</p>
            </div>
            
            <div class="stat-box">
                <div class="stat-title">Entradas Frías</div>
                <p>Tiempo promedio: <strong>${stats.entradaFria.promedio}</strong></p>
                <p>Platillo más rápido: ${stats.entradaFria.masRapido.dish} (${stats.entradaFria.masRapido.tiempo})</p>
                <p>Platillo más lento: ${stats.entradaFria.masLento.dish} (${stats.entradaFria.masLento.tiempo})</p>
                <p>Total platillos: ${stats.entradaFria.total}</p>
            </div>
            
            <div class="stat-box">
                <div class="stat-title">Cocina Caliente</div>
                <p>Tiempo promedio: <strong>${stats.caliente.promedio}</strong></p>
                <p>Platillo más rápido: ${stats.caliente.masRapido.dish} (${stats.caliente.masRapido.tiempo})</p>
                <p>Platillo más lento: ${stats.caliente.masLento.dish} (${stats.caliente.masLento.tiempo})</p>
                <p>Total platillos: ${stats.caliente.total}</p>
            </div>
            
            <div class="stat-box">
                <div class="stat-title">Entradas Calientes</div>
                <p>Tiempo promedio: <strong>${stats.entradaCaliente.promedio}</strong></p>
                <p>Platillo más rápido: ${stats.entradaCaliente.masRapido.dish} (${stats.entradaCaliente.masRapido.tiempo})</p>
                <p>Platillo más lento: ${stats.entradaCaliente.masLento.dish} (${stats.entradaCaliente.masLento.tiempo})</p>
                <p>Total platillos: ${stats.entradaCaliente.total}</p>
            </div>
        </div>
        
        <div class="stats-container">
            <div class="stat-box">
                <div class="stat-title">Combos</div>
                <p>Tiempo promedio total: <strong>${stats.combos.promedio}</strong></p>
                <p>Tiempo promedio cocina caliente: <strong>${stats.combos.promedioCaliente}</strong></p>
                <p>Tiempo promedio cocina fría: <strong>${stats.combos.promedioFria}</strong></p>
                <p>Combo más rápido: ${stats.combos.masRapido.dish} (${stats.combos.masRapido.tiempo})</p>
                <p>Combo más lento: ${stats.combos.masLento.dish} (${stats.combos.masLento.tiempo})</p>
                <p>Total combos: ${stats.combos.total}</p>
            </div>
            
            <div class="stat-box">
                <div class="stat-title">Entregas a Domicilio</div>
                <p>Tiempo promedio de entrega: <strong>${stats.domicilio.promedioEntrega}</strong></p>
                <p>Entrega más rápida: ${stats.domicilio.masRapida.dish} (${stats.domicilio.masRapida.tiempo})</p>
                <p>Entrega más lenta: ${stats.domicilio.masLenta.dish} (${stats.domicilio.masLenta.tiempo})</p>
                <p>Total entregas: ${stats.domicilio.total}</p>
            </div>
        </div>
        
        <h2>Últimos 10 Platillos Completados</h2>
        <table>
            <thead>
                <tr>
                    <th>Platillo</th>
                    <th>Categoría</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Tiempo Total</th>
                    <th>Tipo de Servicio</th>
                </tr>
            </thead>
            <tbody>
                ${generateTableRows()}
            </tbody>
        </table>
        
        <div class="footer">
            <p>Este reporte puede ser guardado como PDF imprimiendo la página.</p>
        </div>
        
        <button class="no-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
    </body>
    </html>
    `;
    
    // Función para generar filas de la tabla
    function generateTableRows() {
        let rows = '';
        const recentOrders = completedOrders.slice(0, 10);
        
        recentOrders.forEach(order => {
            let categoryText = '';
            switch(order.category) {
                case 'frio': categoryText = 'Platillo Frío'; break;
                case 'entrada-fria': categoryText = 'Entrada Fría'; break;
                case 'caliente': categoryText = 'Platillo Caliente'; break;
                case 'entrada-caliente': categoryText = 'Entrada Caliente'; break;
                case 'combos': categoryText = 'Combo'; break;
                default: categoryText = order.category;
            }
            
            let serviceText = '';
            switch(order.service) {
                case 'comedor': serviceText = 'Comedor'; break;
                case 'domicilio': serviceText = 'Domicilio'; break;
                case 'para-llevar': serviceText = 'Para llevar'; break;
                default: serviceText = order.service;
            }
            
            rows += `
            <tr>
                <td>${order.dish}</td>
                <td>${categoryText}</td>
                <td>${order.startTimeFormatted}</td>
                <td>${order.endTimeFormatted}</td>
                <td>${order.prepTime}</td>
                <td>${serviceText}</td>
            </tr>
            `;
        });
        
        return rows;
    }
    
    // Abrir en una nueva ventana para imprimir/guardar
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    reportWindow.focus();
}

// Función para calcular estadísticas
function calculateStats() {
    const stats = {
        frio: { total: 0, tiempos: [], masRapido: null, masLento: null, promedio: '00:00' },
        entradaFria: { total: 0, tiempos: [], masRapido: null, masLento: null, promedio: '00:00' },
        caliente: { total: 0, tiempos: [], masRapido: null, masLento: null, promedio: '00:00' },
        entradaCaliente: { total: 0, tiempos: [], masRapido: null, masLento: null, promedio: '00:00' },
        combos: { 
            total: 0, 
            tiempos: [], 
            tiemposCaliente: [],
            tiemposFria: [],
            masRapido: null, 
            masLento: null, 
            promedio: '00:00',
            promedioCaliente: '00:00',
            promedioFria: '00:00'
        },
        domicilio: { 
            total: 0, 
            tiemposEntrega: [], 
            masRapida: null, 
            masLenta: null, 
            promedioEntrega: '00:00'
        }
    };
    
    // Procesar órdenes completadas
    completedOrders.forEach(order => {
        const tiempoEnMinutos = getMinutesFromTimeString(order.prepTime);
        
        // Almacenar datos según categoría
        if (order.category === 'frio') {
            stats.frio.total++;
            stats.frio.tiempos.push({ tiempo: tiempoEnMinutos, dish: order.dish, tiempoString: order.prepTime });
        } 
        else if (order.category === 'entrada-fria') {
            stats.entradaFria.total++;
            stats.entradaFria.tiempos.push({ tiempo: tiempoEnMinutos, dish: order.dish, tiempoString: order.prepTime });
        }
        else if (order.category === 'caliente') {
            stats.caliente.total++;
            stats.caliente.tiempos.push({ tiempo: tiempoEnMinutos, dish: order.dish, tiempoString: order.prepTime });
        }
        else if (order.category === 'entrada-caliente') {
            stats.entradaCaliente.total++;
            stats.entradaCaliente.tiempos.push({ tiempo: tiempoEnMinutos, dish: order.dish, tiempoString: order.prepTime });
        }
        else if (order.category === 'combos') {
            stats.combos.total++;
            stats.combos.tiempos.push({ tiempo: tiempoEnMinutos, dish: order.dish, tiempoString: order.prepTime });
            
            // Si tiene tiempos de cocina caliente y fría
            if (order.hotKitchenPrepTime) {
                const tiempoCaliente = getMinutesFromTimeString(order.hotKitchenPrepTime);
                stats.combos.tiemposCaliente.push({ tiempo: tiempoCaliente, dish: order.dish, tiempoString: order.hotKitchenPrepTime });
            }
            
            if (order.coldKitchenPrepTime) {
                const tiempoFria = getMinutesFromTimeString(order.coldKitchenPrepTime);
                stats.combos.tiemposFria.push({ tiempo: tiempoFria, dish: order.dish, tiempoString: order.coldKitchenPrepTime });
            }
        }
        
        // Procesar datos de entregas a domicilio
        if (order.service === 'domicilio' && order.deliveryTime) {
            stats.domicilio.total++;
            const tiempoEntrega = getMinutesFromTimeString(order.deliveryTime);
            stats.domicilio.tiemposEntrega.push({ tiempo: tiempoEntrega, dish: order.dish, tiempoString: order.deliveryTime });
        }
    });
    
    // Calcular estadísticas para cada categoría
    calculateCategoryStats(stats.frio);
    calculateCategoryStats(stats.entradaFria);
    calculateCategoryStats(stats.caliente);
    calculateCategoryStats(stats.entradaCaliente);
    calculateCategoryStats(stats.combos);
    
    // Calcular promedios específicos para combos
    if (stats.combos.tiemposCaliente.length > 0) {
        const totalCaliente = stats.combos.tiemposCaliente.reduce((sum, item) => sum + item.tiempo, 0);
        const promedioCaliente = totalCaliente / stats.combos.tiemposCaliente.length;
        stats.combos.promedioCaliente = formatMinutesToTimeString(promedioCaliente);
    }
    
    if (stats.combos.tiemposFria.length > 0) {
        const totalFria = stats.combos.tiemposFria.reduce((sum, item) => sum + item.tiempo, 0);
        const promedioFria = totalFria / stats.combos.tiemposFria.length;
        stats.combos.promedioFria = formatMinutesToTimeString(promedioFria);
    }
    
    // Calcular estadísticas para entregas
    if (stats.domicilio.tiemposEntrega.length > 0) {
        // Encontrar entrega más rápida y más lenta
        stats.domicilio.tiemposEntrega.sort((a, b) => a.tiempo - b.tiempo);
        stats.domicilio.masRapida = {
            dish: stats.domicilio.tiemposEntrega[0].dish,
            tiempo: stats.domicilio.tiemposEntrega[0].tiempoString
        };
        
        stats.domicilio.masLenta = {
            dish: stats.domicilio.tiemposEntrega[stats.domicilio.tiemposEntrega.length - 1].dish,
            tiempo: stats.domicilio.tiemposEntrega[stats.domicilio.tiemposEntrega.length - 1].tiempoString
        };
        
        // Calcular promedio de tiempo de entrega
        const totalEntrega = stats.domicilio.tiemposEntrega.reduce((sum, item) => sum + item.tiempo, 0);
        const promedioEntrega = totalEntrega / stats.domicilio.tiemposEntrega.length;
        stats.domicilio.promedioEntrega = formatMinutesToTimeString(promedioEntrega);
    } else {
        stats.domicilio.masRapida = { dish: 'N/A', tiempo: 'N/A' };
        stats.domicilio.masLenta = { dish: 'N/A', tiempo: 'N/A' };
    }
    
    return stats;
}

// Función auxiliar para calcular estadísticas de una categoría
function calculateCategoryStats(categoryStats) {
    if (categoryStats.tiempos.length > 0) {
        // Ordenar por tiempo
        categoryStats.tiempos.sort((a, b) => a.tiempo - b.tiempo);
        
        // Obtener más rápido y más lento
        categoryStats.masRapido = {
            dish: categoryStats.tiempos[0].dish,
            tiempo: categoryStats.tiempos[0].tiempoString
        };
        
        categoryStats.masLento = {
            dish: categoryStats.tiempos[categoryStats.tiempos.length - 1].dish,
            tiempo: categoryStats.tiempos[categoryStats.tiempos.length - 1].tiempoString
        };
        
        // Calcular promedio
        const totalMinutos = categoryStats.tiempos.reduce((sum, item) => sum + item.tiempo, 0);
        const promedioMinutos = totalMinutos / categoryStats.tiempos.length;
        categoryStats.promedio = formatMinutesToTimeString(promedioMinutos);
    } else {
        categoryStats.masRapido = { dish: 'N/A', tiempo: 'N/A' };
        categoryStats.masLento = { dish: 'N/A', tiempo: 'N/A' };
    }
}

// Función para formatear minutos a string de tiempo
function formatMinutesToTimeString(minutes) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return padZero(mins) + ':' + padZero(secs) + ' minutos';
}