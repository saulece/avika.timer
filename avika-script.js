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

// Lista de combos especiales (doble cocina)
var specialCombos = ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'];

var categoryNames = {
    'frio': 'Platillos Fríos',
    'entrada-fria': 'Entradas Frías',
    'caliente': 'Platillos Calientes',
    'entrada-caliente': 'Entradas Calientes',
    'combos': 'Combos'
};

// Funciones básicas
function showSection(sectionId) {
    $('#categories-section, #dishes-section, #preparation-section').hide();
    $('#' + sectionId).show();
}

function showNotification(message) {
    var $notification = $('#notification');
    $notification.text(message).show();
    
    setTimeout(function() {
        $notification.hide();
    }, 3000);
}

function padZero(num) {
    return (num < 10 ? '0' : '') + num;
}

function formatTime(date) {
    if (!date) return '--:--:--';
    
    var hours = padZero(date.getHours());
    var minutes = padZero(date.getMinutes());
    var seconds = padZero(date.getSeconds());
    return hours + ':' + minutes + ':' + seconds;
}

// Funciones para la interfaz de usuario
function selectCategory(category) {
    currentCategory = category;
    $('#selected-category-title').text(categoryNames[category]);
    
    var $dishesContainer = $('#dishes-container');
    $dishesContainer.empty();
    
    if (!dishes[category] || dishes[category].length === 0) {
        $dishesContainer.html('<p>No hay platillos en esta categoría</p>');
        showSection('dishes-section');
        return;
    }
    
    // Crear botones para cada platillo
    dishes[category].forEach(function(dish) {
        var buttonClass = 'dish-btn';
        if (category === 'combos' && specialCombos.indexOf(dish) !== -1) {
            buttonClass += ' special-combo';
        }
        
        var $button = $('<button>')
            .addClass(buttonClass)
            .text(dish)
            .data('dish', dish)
            .on('click', function() {
                selectDish($(this).data('dish'));
            });
            
        $dishesContainer.append($button);
    });
    
    showSection('dishes-section');
}

function selectDish(dish) {
    currentDish = dish;
    $('#selected-dish-title').text(dish);
    
    isSpecialCombo = (specialCombos.indexOf(dish) !== -1);
    
    resetOptions();
    updatePersonalizationOptions();
    
    showSection('preparation-section');
}

function resetOptions() {
    // Limpiar personalización
    currentCustomizations = [];
    
    // Resetear servicio
    $('.option-btn').removeClass('selected');
    $('#btn-comedor').addClass('selected');
    currentService = 'comedor';
    
    // Resetear cantidad
    currentQuantity = 1;
    $('#quantity-display').text('1');
    
    // Limpiar notas
    $('#notes-input').val('');
}

function updatePersonalizationOptions() {
    var $container = $('#personalization-options');
    $container.empty();
    
    if (currentCategory === 'combos') {
        $('#personalization-section').hide();
        return;
    }
    
    $('#personalization-section').show();
    
    // Crear botones para cada opción de personalización
    $.each(customizationOptions, function(code, text) {
        var $button = $('<button>')
            .addClass('option-btn')
            .text(text)
            .data('option', code)
            .on('click', function() {
                toggleOption($(this), $(this).data('option'));
            });
            
        $container.append($button);
    });
}

function toggleOption(button, option) {
    button.toggleClass('selected');
    
    if (button.hasClass('selected')) {
        if (currentCustomizations.indexOf(option) === -1) {
            currentCustomizations.push(option);
        }
    } else {
        currentCustomizations = currentCustomizations.filter(function(item) {
            return item !== option;
        });
    }
}

function selectService(button, service) {
    $('.option-btn').removeClass('selected');
    button.addClass('selected');
    currentService = service;
}

function changeQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    $('#quantity-display').text(currentQuantity);
}

function startPreparation() {
    var preparation = {
        id: Date.now().toString(),
        dish: currentDish,
        category: currentCategory,
        categoryDisplay: categoryNames[currentCategory],
        quantity: currentQuantity,
        customizations: currentCustomizations.slice(),
        serviceType: currentService,
        notes: $('#notes-input').val().trim(),
        startTime: new Date(),
        startTimeFormatted: formatTime(new Date()),
        isSpecialCombo: isSpecialCombo
    };
    
    if (isSpecialCombo) {
        preparation.hotKitchenFinished = false;
        preparation.coldKitchenFinished = false;
    }
    
    pendingOrders.push(preparation);
    
    updatePendingTable();
    guardarDatosLocales();
    
    showNotification(preparation.dish + ' agregado a preparación');
    
    showSection('categories-section');
}

function updatePendingTable() {
    var $pendingBody = $('#pending-body');
    $pendingBody.empty();
    
    $('#pending-count').text(pendingOrders.length);
    
    pendingOrders.forEach(function(order, index) {
        var $row = $('<tr>').data('order-id', order.id);
        
        // Celda del platillo
        $row.append(
            $('<td>').text(order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : ''))
        );
        
        // Celda de inicio
        $row.append(
            $('<td>').text(order.startTimeFormatted)
        );
        
        // Celda de tiempo transcurrido
        $row.append(
            $('<td>').addClass('timer-cell').text('00:00')
        );
        
        // Celda de detalles
        var details = getServiceName(order.serviceType);
        
        if (order.isSpecialCombo) {
            if (order.hotKitchenFinished) details = "✓ Cocina Caliente, ";
            if (order.coldKitchenFinished) details += "✓ Cocina Fría, ";
            details += categoryNames[order.category];
        } else if (order.kitchenFinished) {
            details = "✓ " + details;
        }
        
        if (order.customizations && order.customizations.length > 0) {
            details += ', ' + order.customizations.map(function(code) {
                return customizationOptions[code] || code;
            }).join(', ');
        }
        
        if (order.notes) {
            details += ' - ' + order.notes;
        }
        
        if (order.deliveryDepartureTime) {
            details += ' | Salida: ' + order.deliveryDepartureTimeFormatted;
        }
        
        if (order.deliveryArrivalTime) {
            details += ' | Entrega: ' + order.deliveryArrivalTimeFormatted;
        }
        
        $row.append(
            $('<td>').text(details)
        );
        
        // Celda de acción
        var $actionCell = $('<td>');
        
        // Para combos especiales a domicilio, maneja ambos flujos
        if (order.isSpecialCombo && order.serviceType === 'domicilio') {
            var $buttonGroup = $('<div>').css({
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '5px'
            });
            
            // Primero mostrar botones de cocina si no están terminados
            if (!order.hotKitchenFinished || !order.coldKitchenFinished) {
                if (!order.hotKitchenFinished) {
                    $buttonGroup.append(
                        $('<button>')
                            .addClass('finish-btn hot-kitchen')
                            .text('Cocina Caliente')
                            .data('order-id', order.id)
                            .on('click', function() {
                                finishHotKitchen($(this).data('order-id'));
                            })
                    );
                }
                
                if (!order.coldKitchenFinished) {
                    $buttonGroup.append(
                        $('<button>')
                            .addClass('finish-btn cold-kitchen')
                            .text('Cocina Fría')
                            .data('order-id', order.id)
                            .on('click', function() {
                                finishColdKitchen($(this).data('order-id'));
                            })
                    );
                }
            }
            // Si ambas cocinas están terminadas pero no ha salido a domicilio
            else if (!order.deliveryDepartureTime) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn delivery')
                        .text('Salida del Repartidor')
                        .data('order-id', order.id)
                        .on('click', function() {
                            markDeliveryDeparture($(this).data('order-id'));
                        })
                );
            } 
            // Si ya salió el repartidor pero no se ha entregado
            else if (!order.deliveryArrivalTime) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn delivery-arrived')
                        .text('Entrega de Pedido')
                        .data('order-id', order.id)
                        .on('click', function() {
                            markDeliveryArrival($(this).data('order-id'));
                        })
                );
            }
            
            $actionCell.append($buttonGroup);
        }
        // Combos especiales regulares (no a domicilio)
        else if (order.isSpecialCombo) {
            var $buttonGroup = $('<div>').css({
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '5px'
            });
            
            if (!order.hotKitchenFinished) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn hot-kitchen')
                        .text('Cocina Caliente')
                        .data('order-id', order.id)
                        .on('click', function() {
                            finishHotKitchen($(this).data('order-id'));
                        })
                );
            }
            
            if (!order.coldKitchenFinished) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn cold-kitchen')
                        .text('Cocina Fría')
                        .data('order-id', order.id)
                        .on('click', function() {
                            finishColdKitchen($(this).data('order-id'));
                        })
                );
            }
            
            $actionCell.append($buttonGroup);
        } 
        // Pedidos a domicilio (no especiales)
        else if (order.serviceType === 'domicilio') {
            var $buttonGroup = $('<div>').css({
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '5px'
            });
            
            // Si no está terminado en cocina, mostrar botón de terminar
            if (!order.kitchenFinished) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn')
                        .text('Terminado en Cocina')
                        .data('order-id', order.id)
                        .on('click', function() {
                            finishKitchenForDelivery($(this).data('order-id'));
                        })
                );
            } 
            // Si ya está terminado en cocina pero no ha salido el repartidor
            else if (!order.deliveryDepartureTime) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn delivery')
                        .text('Salida del Repartidor')
                        .data('order-id', order.id)
                        .on('click', function() {
                            markDeliveryDeparture($(this).data('order-id'));
                        })
                );
            } 
            // Si ya salió el repartidor pero no se ha entregado
            else if (!order.deliveryArrivalTime) {
                $buttonGroup.append(
                    $('<button>')
                        .addClass('finish-btn delivery-arrived')
                        .text('Entrega de Pedido')
                        .data('order-id', order.id)
                        .on('click', function() {
                            markDeliveryArrival($(this).data('order-id'));
                        })
                );
            }
            
            $actionCell.append($buttonGroup);
        }
        // Pedidos normales
        else {
            $actionCell.append(
                $('<button>')
                    .addClass('finish-btn')
                    .text('Listo')
                    .data('order-id', order.id)
                    .on('click', function() {
                        finishPreparation($(this).data('order-id'));
                    })
            );
        }
        
        $row.append($actionCell);
        
        $pendingBody.append($row);
    });
}

function finishHotKitchen(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    var now = new Date();
    
    order.hotKitchenFinished = true;
    order.hotKitchenTime = now;
    order.hotKitchenTimeFormatted = formatTime(now);
    
    updatePendingTable();
    guardarDatosLocales();
    showNotification('Cocina caliente terminada para ' + order.dish);
    
    // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
    if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
        finishPreparation(id);
    }
    // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
    else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
        order.kitchenFinished = true;
        updatePendingTable();
    }
}

function finishColdKitchen(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    var now = new Date();
    
    order.coldKitchenFinished = true;
    order.coldKitchenTime = now;
    order.coldKitchenTimeFormatted = formatTime(now);
    
    updatePendingTable();
    guardarDatosLocales();
    showNotification('Cocina fría terminada para ' + order.dish);
    
    // Si ambas cocinas están terminadas y no es a domicilio, completar el pedido
    if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType !== 'domicilio') {
        finishPreparation(id);
    }
    // Para domicilios, ambas cocinas deben estar listas antes de pasar al siguiente paso
    else if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
        order.kitchenFinished = true;
        updatePendingTable();
    }
}

// Esta función se llama cuando termina la preparación en cocina para un pedido a domicilio
function finishKitchenForDelivery(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Marca la orden como terminada en cocina pero pendiente de entrega
    order.kitchenFinished = true;
    order.kitchenFinishedTime = new Date();
    order.kitchenFinishedTimeFormatted = formatTime(order.kitchenFinishedTime);
    
    showNotification(order.dish + ' terminado en cocina, pendiente entrega');
    updatePendingTable();
    guardarDatosLocales();
}

// Esta función registra la salida del repartidor
function markDeliveryDeparture(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de salida
    order.deliveryDepartureTime = new Date();
    order.deliveryDepartureTimeFormatted = formatTime(order.deliveryDepartureTime);
    
    showNotification('Salida del repartidor registrada para ' + order.dish);
    updatePendingTable();
    guardarDatosLocales();
}

// Esta función registra la entrega al cliente
function markDeliveryArrival(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
    // Registra el tiempo de entrega y completa el pedido
    order.deliveryArrivalTime = new Date();
    order.deliveryArrival
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

function finishPreparation(id) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrders.length; i++) {
        if (pendingOrders[i].id === id) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex === -1) return;
    
    var order = pendingOrders[orderIndex];
    
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

function updateCompletedTable(showAll) {
    var $completedBody = $('#completed-body');
    $completedBody.empty();
    
    var displayOrders = showAll ? completedOrders : completedOrders.slice(0, 5);
    
    displayOrders.forEach(function(order) {
        var $row = $('<tr>');
        
        // Celda del platillo
        $row.append(
            $('<td>').text(order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : ''))
        );
        
        // Celda de inicio
        $row.append(
            $('<td>').text(order.startTimeFormatted)
        );
        
        // Celda de fin
        $row.append(
            $('<td>').text(order.endTimeFormatted)
        );
        
        // Celda de tiempo total
        $row.append(
            $('<td>').text(order.prepTime)
        );
        
        // Celda de detalles
        var details = getServiceName(order.serviceType) + ', ' + categoryNames[order.category];
        
        if (order.isSpecialCombo) {
            details += ' (Combo Especial)';
        }
        
        if (order.customizations && order.customizations.length > 0) {
            details += ', ' + order.customizations.map(function(code) {
                return customizationOptions[code] || code;
            }).join(', ');
        }
        
        if (order.notes) {
            details += ' - ' + order.notes;
        }
        
        if (order.deliveryDepartureTimeFormatted) {
            details += ' | Salida: ' + order.deliveryDepartureTimeFormatted;
        }
        
        if (order.deliveryArrivalTimeFormatted) {
            details += ' | Entrega: ' + order.deliveryArrivalTimeFormatted;
            
            if (order.deliveryTime) {
                details += ' | Tiempo de entrega: ' + order.deliveryTime;
            }
        }
        
        $row.append(
            $('<td>').text(details)
        );
        
        $completedBody.append($row);
    });
}

function updateAllTimers() {
    if (pendingOrders.length === 0) return;
    
    var $rows = $('#pending-body tr');
    
    $rows.each(function(index) {
        if (index >= pendingOrders.length) return false; // Break the loop
        
        var order = pendingOrders[index];
        var $timerCell = $(this).find('.timer-cell');
        
        if ($timerCell.length) {
            var now = new Date();
            var elapsedMillis = now - new Date(order.startTime);
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            var minutes = Math.floor(elapsedSeconds / 60);
            var seconds = elapsedSeconds % 60;
            
            $timerCell.text(padZero(minutes) + ':' + padZero(seconds));
            
            // Añadir clases de alerta basadas en el tiempo transcurrido
            $timerCell.removeClass('warning alert');
            if (minutes >= 10) {
                $timerCell.addClass('alert');
            } else if (minutes >= 5) {
                $timerCell.addClass('warning');
            }
        }
    });
}

function getServiceName(service) {
    var names = {
        'comedor': 'Comedor',
        'domicilio': 'Domicilio',
        'para-llevar': 'Ordena y Espera'
    };
    return names[service] || service;
}

// Función para calcular y mostrar promedios por categoría
function calcularPromedios() {
    // Solo usamos órdenes completadas para los cálculos
    if (completedOrders.length === 0) {
        showNotification('No hay datos suficientes para calcular promedios');
        return;
    }
    
    // Agrupar por categoría
    var categoriasTiempos = {};
    var totalPorCategoria = {};
    
    // Para tiempos de entrega
    var tiempoTotalEntrega = 0;
    var totalEntregas = 0;
    
    // Inicializar contadores para cada categoría
    for (var key in categoryNames) {
        categoriasTiempos[key] = 0;
        totalPorCategoria[key] = 0;
    }
    
    // Sumar tiempos por categoría
    completedOrders.forEach(function(order) {
        // Ignorar órdenes sin tiempo de preparación completo
        if (!order.endTime) return;
        
        var categoria = order.category;
        var tiempoEnSegundos = (new Date(order.endTime) - new Date(order.startTime)) / 1000;
        
        categoriasTiempos[categoria] += tiempoEnSegundos;
        totalPorCategoria[categoria]++;
        
        // Calcular estadísticas de entrega si están disponibles
        if (order.deliveryDepartureTime && order.deliveryArrivalTime) {
            var tiempoEntregaSegundos = (new Date(order.deliveryArrivalTime) - new Date(order.deliveryDepartureTime)) / 1000;
            tiempoTotalEntrega += tiempoEntregaSegundos;
            totalEntregas++;
        }
    });
    
    // Crear tabla HTML con resultados
    var contenidoPromedio = '<div style="margin-bottom: 20px;">';
    contenidoPromedio += '<h2>Promedio de Preparación por Categoría</h2>';
    contenidoPromedio += '<table style="width: 100%; border-collapse: collapse;">';
    contenidoPromedio += '<thead><tr><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white; text-align: left;">Categoría</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white; text-align: left;">Tiempo Promedio</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white; text-align: left;">Cantidad</th></tr></thead>';
    contenidoPromedio += '<tbody>';
    
    for (var categoria in categoriasTiempos) {
        if (totalPorCategoria[categoria] > 0) {
            var tiempoPromedio = categoriasTiempos[categoria] / totalPorCategoria[categoria];
            var minutos = Math.floor(tiempoPromedio / 60);
            var segundos = Math.floor(tiempoPromedio % 60);
            
            contenidoPromedio += '<tr>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">' + categoryNames[categoria] + '</td>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">' + padZero(minutos) + ':' + padZero(segundos) + ' min</td>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">' + totalPorCategoria[categoria] + '</td>';
            contenidoPromedio += '</tr>';
        }
    }
    
    contenidoPromedio += '</tbody></table>';
    
    // Agregar estadísticas de entrega si hay datos
    if (totalEntregas > 0) {
        var tiempoPromedioEntrega = tiempoTotalEntrega / totalEntregas;
        var minutosEntrega = Math.floor(tiempoPromedioEntrega / 60);
        var segundosEntrega = Math.floor(tiempoPromedioEntrega % 60);
        
        contenidoPromedio += '<h2 style="margin-top: 20px;">Promedio de Tiempo de Entrega</h2>';
        contenidoPromedio += '<table style="width: 100%; border-collapse: collapse;">';
        contenidoPromedio += '<thead><tr><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white; text-align: left;">Concepto</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white; text-align: left;">Tiempo Promedio</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white; text-align: left;">Cantidad</th></tr></thead>';
        contenidoPromedio += '<tbody>';
        contenidoPromedio += '<tr>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tiempo de Entrega (desde salida hasta llegada)</td>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">' + padZero(minutosEntrega) + ':' + padZero(segundosEntrega) + ' min</td>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">' + totalEntregas + '</td>';
        contenidoPromedio += '</tr>';
        contenidoPromedio += '</tbody></table>';
    }
    
    contenidoPromedio += '</div>';
    
    // Mostrar en el modal
    $('#promedios-contenido').html(contenidoPromedio);
    $('#promedios-modal').addClass('active');
}

function exportarDatos() {
    if (completedOrders.length === 0) {
        showNotification('No hay datos para exportar');
        return;
    }
    
    // Crear datos para Excel con todas las columnas importantes
    var ws_data = [
        ['Platillo', 'Categoría', 'Cantidad', 'Tipo de Servicio', 
         'Inicio Preparación', 'Fin Preparación', 'Tiempo Total Preparación',
         'Cocina Caliente', 'Cocina Fría', 'Salida Repartidor', 'Llegada Repartidor', 'Tiempo de Entrega']
    ];
    
    // Agregar cada orden completada con todos los tiempos
    completedOrders.forEach(function(order) {
        ws_data.push([
            order.dish,
            categoryNames[order.category],
            order.quantity,
            getServiceName(order.serviceType),
            order.startTimeFormatted,
            order.endTimeFormatted,
            order.prepTime,
            order.hotKitchenTimeFormatted || '',
            order.coldKitchenTimeFormatted || '',
            order.deliveryDepartureTimeFormatted || '',
            order.deliveryArrivalTimeFormatted || '',
            order.deliveryTime || ''
        ]);
    });
    
    // Crear libro y hoja
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Aplicar formato a la hoja (encabezados en negrita, ajustar ancho de columnas)
    ws['!cols'] = [
        {wch: 20}, // Platillo
        {wch: 15}, // Categoría
        {wch: 8},  // Cantidad
        {wch: 12}, // Tipo de Servicio
        {wch: 15}, // Inicio Preparación
        {wch: 15}, // Fin Preparación
        {wch: 15}, // Tiempo Total Preparación
        {wch: 15}, // Cocina Caliente
        {wch: 15}, // Cocina Fría
        {wch: 15}, // Salida Repartidor
        {wch: 15}, // Llegada Repartidor
        {wch: 15}  // Tiempo de Entrega
    ];
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Avika");
    
    // Crear hoja de estadísticas de promedios
    crearHojaPromedios(wb);
    
    // Generar archivo
    var hoy = new Date();
    var fecha = hoy.getFullYear() + '-' + padZero(hoy.getMonth() + 1) + '-' + padZero(hoy.getDate());
    var fileName = 'avika_tiempos_' + fecha + '.xlsx';
    
    // Escribir archivo y descargar
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
        // Mostrar instrucciones específicas para iOS
        showNotification('Generando Excel. Utiliza la opción "Compartir" cuando aparezca.');
        
        // Usar método de escritura para iOS
        var wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
        var blob = new Blob([wbout], {type:'application/octet-stream'});
        var url = URL.createObjectURL(blob);
        
        // Crear enlace temporal
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    } else {
        // Para otros dispositivos, usar método de descarga directa
        XLSX.writeFile(wb, fileName);
        showNotification('Datos exportados correctamente');
    }
}

// Función para crear la hoja de promedios
function crearHojaPromedios(wb) {
    // Agrupar por categoría
    var categoriasTiempos = {};
    var totalPorCategoria = {};
    
    // Para tiempos de entrega
    var tiempoTotalEntrega = 0;
    var totalEntregas = 0;
    
    // Inicializar contadores para cada categoría
    for (var key in categoryNames) {
        categoriasTiempos[key] = 0;
        totalPorCategoria[key] = 0;
    }
    
    // Sumar tiempos por categoría
    completedOrders.forEach(function(order) {
        // Ignorar órdenes sin tiempo de preparación completo
        if (!order.endTime) return;
        
        var categoria = order.category;
        var tiempoEnSegundos = (new Date(order.endTime) - new Date(order.startTime)) / 1000;
        
        categoriasTiempos[categoria] += tiempoEnSegundos;
        totalPorCategoria[categoria]++;
        
        // Calcular estadísticas de entrega si están disponibles
        if (order.deliveryDepartureTime && order.deliveryArrivalTime) {
            var tiempoEntregaSegundos = (new Date(order.deliveryArrivalTime) - new Date(order.deliveryDepartureTime)) / 1000;
            tiempoTotalEntrega += tiempoEntregaSegundos;
            totalEntregas++;
        }
    });
    
    // Crear datos para Excel
    var promedios_data = [
        ['Categoría', 'Tiempo Promedio (minutos)', 'Cantidad de Platillos']
    ];
    
    for (var categoria in categoriasTiempos) {
        if (totalPorCategoria[categoria] > 0) {
            var tiempoPromedio = categoriasTiempos[categoria] / totalPorCategoria[categoria];
            var minutos = Math.floor(tiempoPromedio / 60);
            var segundos = Math.floor(tiempoPromedio % 60);
            
            promedios_data.push([
                categoryNames[categoria],
                minutos + ':' + padZero(segundos),
                totalPorCategoria[categoria]
            ]);
        }
    }
    
    // Agregar un espacio
    promedios_data.push([]);
    promedios_data.push([]);
    
    // Agregar estadísticas de entrega si hay datos
    if (totalEntregas > 0) {
        var tiempoPromedioEntrega = tiempoTotalEntrega / totalEntregas;
        var minutosEntrega = Math.floor(tiempoPromedioEntrega / 60);
        var segundosEntrega = Math.floor(tiempoPromedioEntrega % 60);
        
        promedios_data.push(['Estadísticas de Entregas a Domicilio']);
        promedios_data.push(['Concepto', 'Tiempo Promedio (minutos)', 'Cantidad']);
        promedios_data.push([
            'Tiempo de Entrega (desde salida hasta llegada)',
            minutosEntrega + ':' + padZero(segundosEntrega),
            totalEntregas
        ]);
    }
    
    // Crear hoja
    var ws_promedios = XLSX.utils.aoa_to_sheet(promedios_data);
    
    // Aplicar formato a la hoja
    ws_promedios['!cols'] = [
        {wch: 30}, // Categoría/Concepto
        {wch: 25}, // Tiempo Promedio
        {wch: 20}  // Cantidad
    ];
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws_promedios, "Promedios");
}

// Función para guardar datos automáticamente en el almacenamiento local
function guardarDatosLocales() {
    try {
        localStorage.setItem('avika_pendingOrders', JSON.stringify(pendingOrders));
        localStorage.setItem('avika_completedOrders', JSON.stringify(completedOrders));
        localStorage.setItem('avika_lastSaved', new Date().toString());
    } catch (e) {
        console.error('Error al guardar datos localmente:', e);
    }
}

// Función para cargar datos guardados
function cargarDatosGuardados() {
    try {
        var savedPending = localStorage.getItem('avika_pendingOrders');
        var savedCompleted = localStorage.getItem('avika_completedOrders');
        
        if (savedPending) {
            pendingOrders = JSON.parse(savedPending);
            updatePendingTable();
        }
        
        if (savedCompleted) {
            completedOrders = JSON.parse(savedCompleted);
            updateCompletedTable();
        }
        
        var lastSaved = localStorage.getItem('avika_lastSaved');
        if (lastSaved) {
            showNotification('Datos cargados');
        }
    } catch (e) {
        console.error('Error al cargar datos guardados:', e);
    }
}

// Función para limpiar historial
function limpiarHistorial() {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial completado?')) {
        completedOrders = [];
        updateCompletedTable();
        guardarDatosLocales();
        showNotification('Historial limpiado');
    }
}

// Cambiar tema claro/oscuro
function toggleTheme() {
    $('body').toggleClass('dark-mode');
    var isDarkMode = $('body').hasClass('dark-mode');
    $('#toggle-theme').text(isDarkMode ? '☀️' : '🌙');
    localStorage.setItem('avika_darkMode', isDarkMode);
}

// Verificar el tema guardado
function cargarTema() {
    var savedDarkMode = localStorage.getItem('avika_darkMode');
    if (savedDarkMode === 'true') {
        $('body').addClass('dark-mode');
        $('#toggle-theme').text('☀️');
    }
}

// Verificar si es una PWA
function esStandalone() {
    return (window.navigator.standalone === true) || 
           (window.matchMedia('(display-mode: standalone)').matches);
}

// Mostrar guía de instalación
function mostrarGuiaInstalacion() {
    if (!esStandalone() && !localStorage.getItem('avika_hideInstallGuide')) {
        $('#install-guide').show();
    }
}

// Ocultar guía de instalación
function ocultarGuiaInstalacion() {
    $('#install-guide').hide();
    localStorage.setItem('avika_hideInstallGuide', 'true');
}

// Inicialización con jQuery
$(document).ready(function() {
    // Activar FastClick para eliminar el retraso de 300ms en clics táctiles
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }
    
    // Botones de categoría
    $('#btn-frio').on('click', function() { selectCategory('frio'); });
    $('#btn-entrada-fria').on('click', function() { selectCategory('entrada-fria'); });
    $('#btn-caliente').on('click', function() { selectCategory('caliente'); });
    $('#btn-entrada-caliente').on('click', function() { selectCategory('entrada-caliente'); });
    $('#btn-combos').on('click', function() { selectCategory('combos'); });
    
    // Botones de navegación
    $('#btn-back-to-categories').on('click', function() { showSection('categories-section'); });
    
    // Botones de servicio
    $('#btn-comedor').on('click', function() { selectService($(this), 'comedor'); });
    $('#btn-domicilio').on('click', function() { selectService($(this), 'domicilio'); });
    $('#btn-para-llevar').on('click', function() { selectService($(this), 'para-llevar'); });
    
    // Botones de cantidad
    $('#btn-decrease').on('click', function() { changeQuantity(-1); });
    $('#btn-increase').on('click', function() { changeQuantity(1); });
    
    // Botones de acción
    $('#btn-cancel').on('click', function() { showSection('categories-section'); });
    $('#btn-back-to-dishes').on('click', function() { showSection('dishes-section'); });
    $('#btn-start').on('click', function() { startPreparation(); });
    
    // Botones de exportar y promedios
    $('#btn-export').on('click', function() { exportarDatos(); });
    $('#btn-promedios').on('click', function() { calcularPromedios(); });
    
    // Botón de limpiar historial
    $('#btn-clear').on('click', function() { limpiarHistorial(); });
    
    // Cerrar modal
    $('#modal-close').on('click', function() { $('#promedios-modal').removeClass('active'); });
    
    // Botones de historial
    $('#btn-show-all-history').on('click', function() {
        $(this).addClass('active');
        $('#btn-show-recent').removeClass('active');
        updateCompletedTable(true);
    });
    
    $('#btn-show-recent').on('click', function() {
        $(this).addClass('active');
        $('#btn-show-all-history').removeClass('active');
        updateCompletedTable(false);
    });
    
    // Botón de tema
    $('#toggle-theme').on('click', function() { toggleTheme(); });
    
    // Botón para ocultar guía de instalación
    $('#hide-guide').on('click', function() { ocultarGuiaInstalacion(); });
    
    // Inicializar temporizador
    timerInterval = setInterval(updateAllTimers, 1000);
    
    // Cargar datos guardados
    cargarDatosGuardados();
    
    // Cargar tema guardado
    cargarTema();
    
    // Mostrar guía de instalación
    setTimeout(mostrarGuiaInstalacion, 5000);
    
    showSection('categories-section');
    showNotification('Temporizador Avika iniciado');
});