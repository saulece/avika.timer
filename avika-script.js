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
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'none';
    
    document.getElementById(sectionId).style.display = 'block';
}

function showNotification(message) {
    var notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(function() {
        notification.style.display = 'none';
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
    document.getElementById('selected-category-title').textContent = categoryNames[category];
    
    var dishesContainer = document.getElementById('dishes-container');
    dishesContainer.innerHTML = '';
    
    if (!dishes[category] || dishes[category].length === 0) {
        dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
        showSection('dishes-section');
        return;
    }
    
    for (var i = 0; i < dishes[category].length; i++) {
        var dish = dishes[category][i];
        var button = document.createElement('button');
        button.className = 'dish-btn';
        
        if (category === 'combos' && specialCombos.indexOf(dish) !== -1) {
            button.className += ' special-combo';
        }
        
        button.textContent = dish;
        button.onclick = (function(selectedDish) {
            return function() {
                selectDish(selectedDish);
            };
        })(dish);
        
        dishesContainer.appendChild(button);
    }
    
    showSection('dishes-section');
}

function selectDish(dish) {
    currentDish = dish;
    document.getElementById('selected-dish-title').textContent = dish;
    
    isSpecialCombo = (specialCombos.indexOf(dish) !== -1);
    
    resetOptions();
    updatePersonalizationOptions();
    
    showSection('preparation-section');
}

function resetOptions() {
    // Limpiar personalización
    currentCustomizations = [];
    
    // Resetear servicio
    document.getElementById('btn-comedor').classList.add('selected');
    document.getElementById('btn-domicilio').classList.remove('selected');
    document.getElementById('btn-para-llevar').classList.remove('selected');
    currentService = 'comedor';
    
    // Resetear cantidad
    currentQuantity = 1;
    document.getElementById('quantity-display').textContent = '1';
    
    // Limpiar notas
    document.getElementById('notes-input').value = '';
}

function updatePersonalizationOptions() {
    var container = document.getElementById('personalization-options');
    container.innerHTML = '';
    
    if (currentCategory === 'combos') {
        document.getElementById('personalization-section').style.display = 'none';
        return;
    }
    
    document.getElementById('personalization-section').style.display = 'block';
    
    for (var code in customizationOptions) {
        if (!customizationOptions.hasOwnProperty(code)) continue;
        
        var button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = customizationOptions[code];
        button.setAttribute('data-option', code);
        button.onclick = function() {
            toggleOption(this, this.getAttribute('data-option'));
        };
        container.appendChild(button);
    }
}

function toggleOption(button, option) {
    button.classList.toggle('selected');
    
    if (button.classList.contains('selected')) {
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
    document.getElementById('btn-comedor').classList.remove('selected');
    document.getElementById('btn-domicilio').classList.remove('selected');
    document.getElementById('btn-para-llevar').classList.remove('selected');
    
    button.classList.add('selected');
    currentService = service;
}

function changeQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    document.getElementById('quantity-display').textContent = currentQuantity;
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
        notes: document.getElementById('notes-input').value.trim(),
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
    
    showNotification(preparation.dish + ' agregado a preparación');
    
    showSection('categories-section');
}

function updatePendingTable() {
    var pendingBody = document.getElementById('pending-body');
    pendingBody.innerHTML = '';
    
    document.getElementById('pending-count').textContent = pendingOrders.length;
    
    for (var i = 0; i < pendingOrders.length; i++) {
        var order = pendingOrders[i];
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.textContent = order.startTimeFormatted;
        row.appendChild(startCell);
        
        // Celda de tiempo transcurrido
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        timerCell.textContent = '00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
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
        
        detailsCell.textContent = details;
        row.appendChild(detailsCell);
        
        // Celda de acción
        var actionCell = document.createElement('td');
        
        // Para combos especiales a domicilio, maneja ambos flujos
        if (order.isSpecialCombo && order.serviceType === 'domicilio') {
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            // Primero mostrar botones de cocina si no están terminados
            if (!order.hotKitchenFinished || !order.coldKitchenFinished) {
                if (!order.hotKitchenFinished) {
                    var hotKitchenBtn = document.createElement('button');
                    hotKitchenBtn.className = 'finish-btn hot-kitchen';
                    hotKitchenBtn.textContent = 'Cocina Caliente';
                    hotKitchenBtn.onclick = (function(orderId) {
                        return function() {
                            finishHotKitchen(orderId);
                        };
                    })(order.id);
                    buttonGroup.appendChild(hotKitchenBtn);
                }
                
                if (!order.coldKitchenFinished) {
                    var coldKitchenBtn = document.createElement('button');
                    coldKitchenBtn.className = 'finish-btn cold-kitchen';
                    coldKitchenBtn.textContent = 'Cocina Fría';
                    coldKitchenBtn.onclick = (function(orderId) {
                        return function() {
                            finishColdKitchen(orderId);
                        };
                    })(order.id);
                    buttonGroup.appendChild(coldKitchenBtn);
                }
            }
            // Si ambas cocinas están terminadas pero no ha salido a domicilio
            else if (!order.deliveryDepartureTime) {
                var departureBtn = document.createElement('button');
                departureBtn.className = 'finish-btn delivery';
                departureBtn.textContent = 'Salida del Repartidor';
                departureBtn.onclick = (function(orderId) {
                    return function() {
                        markDeliveryDeparture(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(departureBtn);
            } 
            // Si ya salió el repartidor pero no se ha entregado
            else if (!order.deliveryArrivalTime) {
                var arrivalBtn = document.createElement('button');
                arrivalBtn.className = 'finish-btn delivery-arrived';
                arrivalBtn.textContent = 'Entrega de Pedido';
                arrivalBtn.onclick = (function(orderId) {
                    return function() {
                        markDeliveryArrival(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(arrivalBtn);
            }
            
            actionCell.appendChild(buttonGroup);
        }
        // Combos especiales regulares (no a domicilio)
        else if (order.isSpecialCombo) {
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            if (!order.hotKitchenFinished) {
                var hotKitchenBtn = document.createElement('button');
                hotKitchenBtn.className = 'finish-btn hot-kitchen';
                hotKitchenBtn.textContent = 'Cocina Caliente';
                hotKitchenBtn.onclick = (function(orderId) {
                    return function() {
                        finishHotKitchen(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(hotKitchenBtn);
            }
            
            if (!order.coldKitchenFinished) {
                var coldKitchenBtn = document.createElement('button');
                coldKitchenBtn.className = 'finish-btn cold-kitchen';
                coldKitchenBtn.textContent = 'Cocina Fría';
                coldKitchenBtn.onclick = (function(orderId) {
                    return function() {
                        finishColdKitchen(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(coldKitchenBtn);
            }
            
            actionCell.appendChild(buttonGroup);
        } 
        // Pedidos a domicilio (no especiales)
        else if (order.serviceType === 'domicilio') {
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            // Si no está terminado en cocina, mostrar botón de terminar
            if (!order.kitchenFinished) {
                var finishBtn = document.createElement('button');
                finishBtn.className = 'finish-btn';
                finishBtn.textContent = 'Terminado en Cocina';
                finishBtn.onclick = (function(orderId) {
                    return function() {
                        finishKitchenForDelivery(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(finishBtn);
            } 
            // Si ya está terminado en cocina pero no ha salido el repartidor
            else if (!order.deliveryDepartureTime) {
                var departureBtn = document.createElement('button');
                departureBtn.className = 'finish-btn delivery';
                departureBtn.textContent = 'Salida del Repartidor';
                departureBtn.onclick = (function(orderId) {
                    return function() {
                        markDeliveryDeparture(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(departureBtn);
            } 
            // Si ya salió el repartidor pero no se ha entregado
            else if (!order.deliveryArrivalTime) {
                var arrivalBtn = document.createElement('button');
                arrivalBtn.className = 'finish-btn delivery-arrived';
                arrivalBtn.textContent = 'Entrega de Pedido';
                arrivalBtn.onclick = (function(orderId) {
                    return function() {
                        markDeliveryArrival(orderId);
                    };
                })(order.id);
                buttonGroup.appendChild(arrivalBtn);
            }
            
            actionCell.appendChild(buttonGroup);
        }
        // Pedidos normales
        else {
            var finishBtn = document.createElement('button');
            finishBtn.className = 'finish-btn';
            finishBtn.textContent = 'Listo';
            finishBtn.onclick = (function(orderId) {
                return function() {
                    finishPreparation(orderId);
                };
            })(order.id);
            actionCell.appendChild(finishBtn);
        }
        
        row.appendChild(actionCell);
        
        pendingBody.appendChild(row);
    }
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
}

function updateCompletedTable(showAll) {
    var completedBody = document.getElementById('completed-body');
    completedBody.innerHTML = '';
    
    var displayOrders = showAll ? completedOrders : completedOrders.slice(0, 5);
    
    for (var i = 0; i < displayOrders.length; i++) {
        var order = displayOrders[i];
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.textContent = order.startTimeFormatted;
        row.appendChild(startCell);
        
        // Celda de fin
        var endCell = document.createElement('td');
        endCell.textContent = order.endTimeFormatted;
        row.appendChild(endCell);
        
        // Celda de tiempo total
        var timeCell = document.createElement('td');
        timeCell.textContent = order.prepTime;
        row.appendChild(timeCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
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
        
        detailsCell.textContent = details;
        row.appendChild(detailsCell);
        
        completedBody.appendChild(row);
    }
}

function updateAllTimers() {
    if (pendingOrders.length === 0) return;
    
    var rows = document.getElementById('pending-body').querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        if (i >= pendingOrders.length) return;
        
        var row = rows[i];
        var order = pendingOrders[i];
        var timerCell = row.querySelector('.timer-cell');
        
        if (timerCell) {
            var now = new Date();
            var elapsedMillis = now - new Date(order.startTime);
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            var minutes = Math.floor(elapsedSeconds / 60);
            var seconds = elapsedSeconds % 60;
            
            timerCell.textContent = padZero(minutes) + ':' + padZero(seconds);
        }
    }
}

function getServiceName(service) {
    var names = {
        'comedor': 'Comedor',
        'domicilio': 'Domicilio',
        'para-llevar': 'Ordena y Espera'
    };
    return names[service] || service;
}

// Agregar estilos para botones de entrega
function addDeliveryStyles() {
    var styleElement = document.createElement('style');
    styleElement.textContent = `
        .finish-btn.delivery {
            background-color: #f39c12;
        }
        .finish-btn.delivery-arrived {
            background-color: #3498db;
        }
    `;
    document.head.appendChild(styleElement);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos para botones de entrega
    addDeliveryStyles();
    
    // Botones de categoría
    document.getElementById('btn-frio').onclick = function() {
        selectCategory('frio');
    };
    
    document.getElementById('btn-entrada-fria').onclick = function() {
        selectCategory('entrada-fria');
    };
    
    document.getElementById('btn-caliente').onclick = function() {
        selectCategory('caliente');
    };
    
    document.getElementById('btn-entrada-caliente').onclick = function() {
        selectCategory('entrada-caliente');
    };
    
    document.getElementById('btn-combos').onclick = function() {
        selectCategory('combos');
    };
    
    // Botones de navegación
    document.getElementById('btn-back-to-categories').onclick = function() {
        showSection('categories-section');
    };
    
    // Botones de servicio
    document.getElementById('btn-comedor').onclick = function() {
        selectService(this, 'comedor');
    };
    
    document.getElementById('btn-domicilio').onclick = function() {
        selectService(this, 'domicilio');
    };
    
    document.getElementById('btn-para-llevar').onclick = function() {
        selectService(this, 'para-llevar');
    };
    
    // Botones de cantidad
    document.getElementById('btn-decrease').onclick = function() {
        changeQuantity(-1);
    };
    
    document.getElementById('btn-increase').onclick = function() {
        changeQuantity(1);
    };
    
    // Botones de acción
    document.getElementById('btn-cancel').onclick = function() {
        showSection('dishes-section');
    };
    
    document.getElementById('btn-back-to-dishes').onclick = function() {
        showSection('dishes-section');
    };
    
    document.getElementById('btn-start').onclick = function() {
        startPreparation();
    };
    
    document.getElementById('btn-export').onclick = function() {
        showNotification('Exportación no implementada en esta versión simplificada');
    };
    
    // Botones de historial
    document.getElementById('btn-show-all-history').onclick = function() {
        this.classList.add('active');
        document.getElementById('btn-show-recent').classList.remove('active');
        updateCompletedTable(true);
    };
    
    document.getElementById('btn-show-recent').onclick = function() {
        this.classList.add('active');
        document.getElementById('btn-show-all-history').classList.remove('active');
        updateCompletedTable(false);
    };
    
    // Inicializar temporizador
    timerInterval = setInterval(updateAllTimers, 1000);
    
    showSection('categories-section');
    showNotification('Temporizador de Sushi iniciado');
});
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
    var contenidoPromedio = '<div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">';
    contenidoPromedio += '<h2>Promedio de Preparación por Categoría</h2>';
    contenidoPromedio += '<table style="width: 100%; border-collapse: collapse;">';
    contenidoPromedio += '<thead><tr><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white;">Categoría</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white;">Tiempo Promedio</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #3498db; color: white;">Cantidad</th></tr></thead>';
    contenidoPromedio += '<tbody>';
    
    for (var categoria in categoriasTiempos) {
        if (totalPorCategoria[categoria] > 0) {
            var tiempoPromedio = categoriasTiempos[categoria] / totalPorCategoria[categoria];
            var minutos = Math.floor(tiempoPromedio / 60);
            var segundos = Math.floor(tiempoPromedio % 60);
            
            contenidoPromedio += '<tr>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">' + categoryNames[categoria] + '</td>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">' + padZero(minutos) + ':' + padZero(segundos) + ' min</td>';
            contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">' + totalPorCategoria[categoria] + '</td>';
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
        contenidoPromedio += '<thead><tr><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white;">Concepto</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white;">Tiempo Promedio</th><th style="padding: 8px; border: 1px solid #ddd; background-color: #f39c12; color: white;">Cantidad</th></tr></thead>';
        contenidoPromedio += '<tbody>';
        contenidoPromedio += '<tr>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">Tiempo de Entrega (desde salida hasta llegada)</td>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">' + padZero(minutosEntrega) + ':' + padZero(segundosEntrega) + ' min</td>';
        contenidoPromedio += '<td style="padding: 8px; border: 1px solid #ddd;">' + totalEntregas + '</td>';
        contenidoPromedio += '</tr>';
        contenidoPromedio += '</tbody></table>';
    }
    
    contenidoPromedio += '</div>';
    
    // Crear un diálogo modal para mostrar los promedios
    var modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '1001';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    var modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90%';
    modalContent.style.overflow = 'auto';
    
    modalContent.innerHTML = contenidoPromedio;
    
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '10px 15px';
    closeButton.style.backgroundColor = '#e74c3c';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = function() {
        document.body.removeChild(modal);
    };
    
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Función para exportar a Excel (CSV)
function exportarDatos() {
    if (completedOrders.length === 0) {
        showNotification('No hay datos para exportar');
        return;
    }
    
    // Crear encabezados CSV
    var csv = 'Platillo,Categoría,Cantidad,Tipo de Servicio,Inicio,Fin,Tiempo Total,Salida Repartidor,Llegada Repartidor,Tiempo de Entrega\n';
    
    // Agregar cada orden completada
    completedOrders.forEach(function(order) {
        var row = [
            '"' + order.dish + '"',
            '"' + categoryNames[order.category] + '"',
            order.quantity,
            '"' + getServiceName(order.serviceType) + '"',
            '"' + order.startTimeFormatted + '"',
            '"' + order.endTimeFormatted + '"',
            '"' + order.prepTime + '"',
            '"' + (order.deliveryDepartureTimeFormatted || '') + '"',
            '"' + (order.deliveryArrivalTimeFormatted || '') + '"',
            '"' + (order.deliveryTime || '') + '"'
        ];
        
        csv += row.join(',') + '\n';
    });
    
    // Crear link de descarga
    var csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var csvUrl = URL.createObjectURL(csvBlob);
    
    var link = document.createElement('a');
    link.href = csvUrl;
    var hoy = new Date();
    var fecha = hoy.getFullYear() + '-' + padZero(hoy.getMonth() + 1) + '-' + padZero(hoy.getDate());
    link.download = 'avika_tiempos_' + fecha + '.csv';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Datos exportados correctamente');
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
            showNotification('Datos cargados de ' + new Date(lastSaved).toLocaleString());
        }
    } catch (e) {
        console.error('Error al cargar datos guardados:', e);
    }
}

// Iniciar el guardado automático cada 30 segundos
setInterval(guardarDatosLocales, 30000);

// Código para agregar a la inicialización
function agregarBotones() {
    // Crear botón para ver promedios
    var btnPromedios = document.createElement('button');
    btnPromedios.className = 'back-btn';
    btnPromedios.style.backgroundColor = '#3498db';
    btnPromedios.style.marginRight = '10px';
    btnPromedios.textContent = 'Ver Promedios';
    btnPromedios.onclick = calcularPromedios;
    
    // Modificar el botón de exportar existente
    var btnExport = document.getElementById('btn-export');
    btnExport.textContent = 'Exportar a Excel';
    btnExport.onclick = exportarDatos;
    
    // Insertar el botón de promedios antes del botón de exportar
    btnExport.parentNode.insertBefore(btnPromedios, btnExport);
    
    // Cargar datos guardados
    cargarDatosGuardados();
}

// Modificar la función finishPreparation y markDeliveryArrival para guardar datos automáticamente
var originalFinishPreparation = finishPreparation;
finishPreparation = function(id) {
    originalFinishPreparation(id);
    guardarDatosLocales();
};

var originalMarkDeliveryArrival = markDeliveryArrival;
markDeliveryArrival = function(id) {
    originalMarkDeliveryArrival(id);
    guardarDatosLocales();
};

// Función para limpiar historial (opcional)
function limpiarHistorial() {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial completado?')) {
        completedOrders = [];
        updateCompletedTable();
        guardarDatosLocales();
        showNotification('Historial limpiado');
    }
}

// Agregar botón de limpiar historial (opcional)
function agregarBotonLimpiar() {
    var btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'back-btn';
    btnLimpiar.style.backgroundColor = '#e74c3c';
    btnLimpiar.style.marginLeft = '10px';
    btnLimpiar.textContent = 'Limpiar Historial';
    btnLimpiar.onclick = limpiarHistorial;
    
    var btnExport = document.getElementById('btn-export');
    btnExport.parentNode.insertBefore(btnLimpiar, btnExport.nextSibling);
}

// Código para añadir al final de la inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Código original de inicialización...
    
    // Agregar nuestras nuevas funciones
    agregarBotones();
    agregarBotonLimpiar();
});