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

// Inicialización de la aplicación con jQuery
$(document).ready(function() {
    // Cargar datos guardados
    cargarDatosLocales();
    
    // Configurar temporizadores para platillos pendientes
    actualizarTemporizadores();
    
    // Configurar eventos para botones de categoría
    $('#btn-frio').click(function() {
        selectCategory('frio', 'Platillos Fríos');
    });
    
    $('#btn-entrada-fria').click(function() {
        selectCategory('entrada-fria', 'Entradas Frías');
    });
    
    $('#btn-caliente').click(function() {
        selectCategory('caliente', 'Platillos Calientes');
    });
    
    $('#btn-entrada-caliente').click(function() {
        selectCategory('entrada-caliente', 'Entradas Calientes');
    });
    
    $('#btn-combos').click(function() {
        selectCategory('combos', 'Combos');
    });
    
    // Botones de navegación
    $('#btn-back-to-categories').click(backToCategories);
    $('#btn-back-to-dishes').click(backToDishes);
    
    // Botones de personalización de servicio
    $('#btn-comedor').click(function() {
        selectService('comedor', this);
    });
    
    $('#btn-domicilio').click(function() {
        selectService('domicilio', this);
    });
    
    $('#btn-para-llevar').click(function() {
        selectService('para-llevar', this);
    });
    
    // Botones de cantidad con soporte para mantener presionado
    $('#btn-decrease').on('touchstart mousedown', function(e) {
        e.preventDefault();
        decreaseQuantity();
        
        const pressTimer = setInterval(function() {
            decreaseQuantity();
        }, 150);
        
        $(document).on('touchend mouseup touchcancel', function() {
            clearInterval(pressTimer);
            $(document).off('touchend mouseup touchcancel');
        });
    });
    
    $('#btn-increase').on('touchstart mousedown', function(e) {
        e.preventDefault();
        increaseQuantity();
        
        const pressTimer = setInterval(function() {
            increaseQuantity();
        }, 150);
        
        $(document).on('touchend mouseup touchcancel', function() {
            clearInterval(pressTimer);
            $(document).off('touchend mouseup touchcancel');
        });
    });
    
    // Botones de acción
    $('#btn-cancel').click(cancelPreparation);
    $('#btn-start').click(startPreparation);
    
    // Botón de exportar
    $('#btn-export').click(exportData);
    
    // Filtros de historial
    $('#btn-show-all-history').click(function() {
        toggleHistoryFilter(this, true);
    });
    
    $('#btn-show-recent').click(function() {
        toggleHistoryFilter(this, false);
    });
    
    // Inicializar tablas
    updatePendingTable();
    updateCompletedTable();
    
    // Prevenir zoom al hacer focus en inputs en iOS
    $('input, textarea').on('focus', function() {
        $(this).data('fontSize', $(this).css('font-size'));
        $(this).css('font-size', parseInt($(this).css('font-size')) + 1 + 'px');
        setTimeout(function() {
            $(this).css('font-size', $(this).data('fontSize'));
        }.bind(this), 100);
    });
    
    // Mejorar el enfoque del teclado en iOS
    $('input, textarea').on('blur', function() {
        window.scrollTo(0, 0);
    });

    // Asegurar que la app ocupe toda la pantalla en iOS cuando se agrega al homescreen
    if (window.navigator.standalone) {
        $('body').addClass('ios-standalone');
        
        // Fix para altura 100% en iOS homescreen
        const setIOSHeight = function() {
            $('.container').css('min-height', window.innerHeight + 'px');
        };
        
        setIOSHeight();
        $(window).on('resize', setIOSHeight);
    }
});

// Función para seleccionar categoría
function selectCategory(category, title) {
    currentCategory = category;
    $('#selected-category-title').text(title);
    
    // Ocultar sección de categorías y mostrar sección de platillos
    $('#categories-section').hide();
    $('#dishes-section').show();
    
    // Llenar el contenedor de platillos
    const dishesContainer = $('#dishes-container');
    dishesContainer.empty();
    
    if (dishes[category]) {
        dishes[category].forEach(function(dish) {
            const btn = $('<button>')
                .addClass('dish-btn no-select')
                .text(dish);
            
            // Marcar combos como especiales
            if (category === 'combos') {
                btn.addClass('special-combo');
                isSpecialCombo = true;
            } else {
                isSpecialCombo = false;
            }
            
            btn.on('click', function() {
                selectDish($(this).text());
            });
            
            dishesContainer.append(btn);
        });
    }
    
    // Aplicar efecto táctil a los botones recién creados
    $('.dish-btn').on('touchstart', function() {
        $(this).addClass('btn-touch-effect');
    }).on('touchend touchcancel', function() {
        $(this).removeClass('btn-touch-effect');
        $(this).addClass('touch-highlight');
        setTimeout(() => {
            $(this).removeClass('touch-highlight');
        }, 300);
    });
}

// Función para seleccionar platillo
function selectDish(dish) {
    currentDish = dish;
    currentCustomizations = [];
    
    $('#selected-dish-title').text(dish);
    
    // Ocultar sección de platillos y mostrar sección de preparación
    $('#dishes-section').hide();
    $('#preparation-section').show();
    
    // Llenar opciones de personalización
    const customizationContainer = $('#personalization-options');
    customizationContainer.empty();
    
    for (let id in customizationOptions) {
        const btn = $('<button>')
            .addClass('option-btn no-select')
            .text(customizationOptions[id])
            .data('id', id);
        
        btn.on('click', function() {
            toggleCustomization(this);
        });
        
        customizationContainer.append(btn);
    }
    
    // Aplicar feedback táctil
    $('.option-btn').on('touchstart', function() {
        $(this).addClass('btn-touch-effect');
    }).on('touchend touchcancel', function() {
        $(this).removeClass('btn-touch-effect');
        $(this).addClass('touch-highlight');
        setTimeout(() => {
            $(this).removeClass('touch-highlight');
        }, 300);
    });
}

// Función para seleccionar servicio
function selectService(service, button) {
    currentService = service;
    
    // Actualizar el estilo de los botones
    $('.option-btns .option-btn').removeClass('selected');
    $(button).addClass('selected');
}

// Función para alternar personalización
function toggleCustomization(button) {
    const customizationId = $(button).data('id');
    
    if ($(button).hasClass('selected')) {
        // Remover de la lista
        $(button).removeClass('selected');
        const index = currentCustomizations.indexOf(customizationId);
        if (index !== -1) {
            currentCustomizations.splice(index, 1);
        }
    } else {
        // Agregar a la lista
        $(button).addClass('selected');
        currentCustomizations.push(customizationId);
    }
}

// Función para disminuir cantidad
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        $('#quantity-display').text(currentQuantity);
    }
}

// Función para aumentar cantidad
function increaseQuantity() {
    currentQuantity++;
    $('#quantity-display').text(currentQuantity);
}
// Función para cancelar preparación y volver a categorías
function cancelPreparation() {
    resetPreparationForm();
    backToCategories();
}

// Función para volver a categorías
function backToCategories() {
    $('#dishes-section').hide();
    $('#preparation-section').hide();
    $('#categories-section').show();
}

// Función para volver a platillos
function backToDishes() {
    $('#preparation-section').hide();
    $('#dishes-section').show();
}

// Función para resetear el formulario de preparación
function resetPreparationForm() {
    currentDish = '';
    currentCustomizations = [];
    currentService = 'comedor';
    currentQuantity = 1;
    
    $('#quantity-display').text('1');
    $('#notes-input').val('');
    
    // Resetear botones de personalización
    $('#personalization-options .option-btn').removeClass('selected');
    
    // Resetear botones de servicio
    $('.option-btns .option-btn').removeClass('selected');
    $('#btn-comedor').addClass('selected');
}

// Función para iniciar preparación
function startPreparation() {
    // Validar que haya un platillo seleccionado
    if (!currentDish) {
        showNotification('Por favor selecciona un platillo');
        return;
    }
    
    // Agregar feedback táctil al botón
    $('#btn-start').addClass('touch-highlight');
    setTimeout(() => {
        $('#btn-start').removeClass('touch-highlight');
    }, 300);
    
    // Crear objeto de orden
    const order = {
        id: Date.now().toString(),
        dish: currentDish,
        category: currentCategory,
        customizations: currentCustomizations.slice(),
        service: currentService,
        quantity: currentQuantity,
        notes: $('#notes-input').val(),
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
    
    // Vibrar en iOS para confirmar acción
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
    
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
    
    // Vibrar para confirmar acción
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
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
        
        // Vibrar para confirmar acción
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
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
    
    // Vibrar para confirmar acción
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
    }
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
    
    // Vibración de finalización exitosa
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
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
    
    // Vibración de finalización exitosa
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
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

// Función para actualizar la tabla de pendientes usando jQuery
function updatePendingTable() {
    const tbody = $('#pending-body');
    tbody.empty();
    
    pendingOrders.forEach(function(order) {
        const tr = $('<tr>');
        tr.attr('data-id', order.id);
        
        // Columna de platillo
        const tdDish = $('<td>').text(order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : ''));
        tr.append(tdDish);
        
        // Columna de inicio
        const tdStart = $('<td>').text(order.startTimeFormatted);
        tr.append(tdStart);
        
        // Columna de tiempo transcurrido
        const tdElapsed = $('<td>')
            .addClass('timer-cell')
            .attr('data-start-time', order.startTime)
            .text('00:00');
        tr.append(tdElapsed);
        
        // Columna de detalles
        const tdDetails = $('<td>');
        
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
        
        tdDetails.html(serviceText + customizationsText + notesText + kitchenStatus + deliveryStatus);
        tr.append(tdDetails);
        
        // Columna de acción
        const tdAction = $('<td>');
        
        // Para combos, mostrar botones específicos de cocinas
        if (order.isCombo) {
            if (!order.hotKitchenDone) {
                const btnHotKitchen = $('<button>')
                    .addClass('finish-btn hot-kitchen no-select')
                    .text('Finalizar Cocina Caliente')
                    .on('click', function() {
                        markHotKitchenDone(order.id);
                    });
                tdAction.append(btnHotKitchen);
            }
            
            if (order.hotKitchenDone && !order.coldKitchenDone) {
                const btnColdKitchen = $('<button>')
                    .addClass('finish-btn cold-kitchen no-select')
                    .text('Finalizar Cocina Fría')
                    .on('click', function() {
                        markColdKitchenDone(order.id);
                    });
                tdAction.append(btnColdKitchen);
            }
        } else {
            // Para platillos normales, botón de finalizar
            const btnFinish = $('<button>')
                .addClass('finish-btn no-select')
                .text('Finalizar');
            
            // Clase específica según categoría
            if (order.category === 'caliente' || order.category === 'entrada-caliente') {
                btnFinish.addClass('hot-kitchen');
            } else if (order.category === 'frio' || order.category === 'entrada-fria') {
                btnFinish.addClass('cold-kitchen');
            }
            
            btnFinish.on('click', function() {
                finishPreparation(order.id);
            });
            
            tdAction.append(btnFinish);
        }
        
        // Para pedidos a domicilio, agregar botones adicionales
        if (order.service === 'domicilio') {
            // Si es combo, verificar que ambas cocinas estén terminadas
            if ((order.isCombo && order.coldKitchenDone) || !order.isCombo) {
                if (!order.deliveryDepartureTime) {
                    const btnDepart = $('<button>')
                        .addClass('finish-btn no-select')
                        .text('Registrar salida')
                        .on('click', function() {
                            markDeliveryDeparture(order.id);
                        });
                    tdAction.append(btnDepart);
                } else if (!order.deliveryArrivalTime) {
                    const btnArrival = $('<button>')
                        .addClass('finish-btn no-select')
                        .text('Registrar entrega')
                        .on('click', function() {
                            markDeliveryArrival(order.id);
                        });
                    tdAction.append(btnArrival);
                }
            }
        }
        
        tr.append(tdAction);
        
        tbody.append(tr);
        
        // Aplicar feedback táctil a los botones recién añadidos
        tdAction.find('button').on('touchstart', function() {
            $(this).addClass('btn-touch-effect');
        }).on('touchend touchcancel', function() {
            $(this).removeClass('btn-touch-effect');
            $(this).addClass('touch-highlight');
            setTimeout(() => {
                $(this).removeClass('touch-highlight');
            }, 300);
        });
    });
    
    // Actualizar contador de pendientes
    $('#pending-count').text('(' + pendingOrders.length + ')');
}

// Función para actualizar la tabla de completados
function updateCompletedTable(showAllHistory = false) {
    const tbody = $('#completed-body');
    tbody.empty();
    
    // Filtrar según necesidad
    let ordersToShow = completedOrders;
    if (!showAllHistory) {
        // Mostrar solo las últimas 10
        ordersToShow = completedOrders.slice(0, 10);
    }
    
    ordersToShow.forEach(function(order) {
        const tr = $('<tr>');
        
        // Columna de platillo
        const tdDish = $('<td>').text(order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : ''));
        tr.append(tdDish);
        
        // Columna de inicio
        const tdStart = $('<td>').text(order.startTimeFormatted);
        tr.append(tdStart);
        
        // Columna de fin
        const tdEnd = $('<td>').text(order.endTimeFormatted);
        tr.append(tdEnd);
        
        // Columna de tiempo total
        const tdTime = $('<td>');
        
        // Aplicar clase según tiempo
        const prepTimeMinutes = getMinutesFromTimeString(order.prepTime);
        if (prepTimeMinutes < 5) {
            tdTime.addClass('time-excellent');
        } else if (prepTimeMinutes < 10) {
            tdTime.addClass('time-good');
        } else if (prepTimeMinutes < 15) {
            tdTime.addClass('time-warning');
        } else {
            tdTime.addClass('time-bad');
        }
        
        tdTime.text(order.prepTime);
        tr.append(tdTime);
        
        // Columna de detalles
        const tdDetails = $('<td>');
        
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
        
        tdDetails.html(serviceText + customizationsText + deliveryTimeText + comboStatusText);
        tr.append(tdDetails);
        
        tbody.append(tr);
    });
    
    // Implementar deslizamiento horizontal suave en tablas para móviles
    $('.table-responsive').off('touchstart').on('touchstart', function(e) {
        const startX = e.originalEvent.touches[0].pageX;
        const scrollLeft = this.scrollLeft;
        
        $(this).on('touchmove', function(e) {
            const x = e.originalEvent.touches[0].pageX;
            const walkX = (x - startX) * 2; // Velocidad de desplazamiento
            this.scrollLeft = scrollLeft - walkX;
            e.preventDefault();
        });
        
        $(document).on('touchend', function() {
            $('.table-responsive').off('touchmove');
            $(document).off('touchend');
        });
    });
}

// Función para alternar el filtro de historial
function toggleHistoryFilter(button, showAll) {
    // Actualizar estado de botones
    $('.filter-btn').removeClass('active');
    $(button).addClass('active');
    
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
    const notification = $('#notification');
    notification.text(message);
    
    // Aplicar animación de entrada
    notification.css({
        'display': 'block',
        'animation': 'fadeIn 0.3s'
    });
    
    // Ocultar después de 3 segundos con animación de salida
    setTimeout(function() {
        notification.css('animation', 'fadeOut 0.3s forwards');
        
        // Ocultar completamente después de la animación
        setTimeout(function() {
            notification.css('display', 'none');
        }, 300);
    }, 3000);
    
    // Usar notificaciones nativas en iOS si están disponibles
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Avika", {
            body: message,
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAMAAAKElNQgAAAAk1BMVEX////+FBwAAAD+GiP+Exv+ERr+ICn+Hif/KjP/pKf+DhiUlJTOzs7v7+/J29zZ2dnk5OTCwsL09PS5ubkcHBywsLDp6eldXV1ubm5TU1OFhYWlpaU7OztCQkJLS0ssLCwQEBCampp3d3cYGBiAgICnp6dOTk7T09MzMzM5OTkjIyNqamp6enq0tLRFRUUqKirCEy1uAAAE4ElEQVR4"
        });
    }
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
        $('.timer-cell[data-start-time]').each(function() {
            const startTime = new Date($(this).data('startTime'));
            const now = new Date();
            const elapsedMillis = now - startTime;
            const elapsedSecs = Math.floor(elapsedMillis / 1000);
            const mins = Math.floor(elapsedSecs / 60);
            const secs = elapsedSecs % 60;
            
            $(this).text(padZero(mins) + ':' + padZero(secs));
            
            // Cambiar color según tiempo transcurrido
            $(this).removeClass('alert warning');
            if (mins >= 15) {
                $(this).addClass('alert');
                // Vibrar para alertar si es un tiempo crítico (cada 30 segundos)
                if (secs === 0 || secs === 30) {
                    if ('vibrate' in navigator) {
                        navigator.vibrate([100, 100, 100]);
                    }
                }
            } else if (mins >= 10) {
                $(this).addClass('warning');
            }
        });
    }, 1000);
}

// Guardar datos en el almacenamiento local con mejor manejo de errores
function guardarDatosLocales() {
    try {
        // Convertir la fecha a string para evitar problemas con JSON
        const pendingStringified = JSON.stringify(pendingOrders);
        const completedStringified = JSON.stringify(completedOrders);
        
        // Usar try-catch específico para detectar problemas de cuota
        try {
            localStorage.setItem('avika_pendingOrders', pendingStringified);
            localStorage.setItem('avika_completedOrders', completedStringified);
            localStorage.setItem('avika_lastSaved', new Date().toISOString());
        } catch (storageError) {
            // Si es un error de cuota, intentar liberar algo de espacio
            if (isQuotaExceeded(storageError)) {
                // Eliminar elementos antiguos para hacer espacio
                if (completedOrders.length > 20) {
                    completedOrders = completedOrders.slice(0, 20);
                    localStorage.setItem('avika_completedOrders', JSON.stringify(completedOrders));
                    localStorage.setItem('avika_pendingOrders', pendingStringified);
                    showNotification('Se liberó espacio eliminando órdenes antiguas');
                } else {
                    showNotification('Error: No hay suficiente espacio de almacenamiento');
                }
            } else {
                throw storageError; // Re-lanzar si no es un error de cuota
            }
        }
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showNotification('Error al guardar datos. ' + error.message);
    }
}

// Función auxiliar para detectar errores de cuota de almacenamiento
function isQuotaExceeded(e) {
    let quotaExceeded = false;
    if (e && e.code) {
        switch (e.code) {
            case 22: // Safari quota exceeded error
                quotaExceeded = true;
                break;
            case 1014: // Firefox quota exceeded error
                quotaExceeded = true;
                break;
        }
    } else if (e && e.name === 'QuotaExceededError') {
        quotaExceeded = true;
    } else if (e && e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        quotaExceeded = true;
    }
    return quotaExceeded;
}

// Cargar datos del almacenamiento local con mejor manejo
function cargarDatosLocales() {
    try {
        const pendingData = localStorage.getItem('avika_pendingOrders');
        const completedData = localStorage.getItem('avika_completedOrders');
        
        if (pendingData) {
            pendingOrders = JSON.parse(pendingData);
            
            // Asegurar que las fechas se conviertan correctamente
            pendingOrders.forEach(function(order) {
                if (typeof order.startTime === 'string') {
                    order.startTime = new Date(order.startTime);
                }
                if (order.hotKitchenTime && typeof order.hotKitchenTime === 'string') {
                    order.hotKitchenTime = new Date(order.hotKitchenTime);
                }
                if (order.coldKitchenTime && typeof order.coldKitchenTime === 'string') {
                    order.coldKitchenTime = new Date(order.coldKitchenTime);
                }
                if (order.deliveryDepartureTime && typeof order.deliveryDepartureTime === 'string') {
                    order.deliveryDepartureTime = new Date(order.deliveryDepartureTime);
                }
            });
        }
        
        if (completedData) {
            completedOrders = JSON.parse(completedData);
            
            // Asegurar que las fechas se conviertan correctamente
            completedOrders.forEach(function(order) {
                if (typeof order.startTime === 'string') {
                    order.startTime = new Date(order.startTime);
                }
                if (order.endTime && typeof order.endTime === 'string') {
                    order.endTime = new Date(order.endTime);
                }
            });
        }
        
        // Verificar permiso para notificaciones en iOS
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showNotification('Error al cargar datos guardados. ' + error.message);
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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
                color: #333;
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

// Añadir soporte para gestos de deslizamiento en toda la aplicación
$(document).ready(function() {
    // Comprobar si estamos en un dispositivo iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        $('body').addClass('ios-device');
        
        // Solicitar permiso para mantener la pantalla activa
        try {
            if ('wakeLock' in navigator) {
                // Esta API aún es experimental y puede no estar disponible en todos los dispositivos
                navigator.wakeLock.request('screen').then((wakeLock) => {
                    console.log('Wake Lock activado');
                    
                    // Liberar el Wake Lock cuando la página se oculta
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'visible' && wakeLock.released) {
                            navigator.wakeLock.request('screen');
                        }
                    });
                }).catch(err => {
                    console.log(`No se pudo activar Wake Lock: ${err.message}`);
                });
            }
        } catch (err) {
            console.log('Wake Lock API no soportada');
        }
    }
});