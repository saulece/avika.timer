// ui-controller-two.js - Segunda parte de funciones de interfaz de usuario
// Complementa el archivo ui-controller.js

// Ampliando el objeto Avika.ui con funciones adicionales
Object.assign(Avika.ui, {
    updatePendingTable: function() {
        // Actualizar contador primero
        document.getElementById('pending-count').textContent = Avika.data.pendingOrders.length;
        
        var pendingBody = document.getElementById('pending-body');
        
        // Si no hay órdenes pendientes, limpiamos la tabla
        if (Avika.data.pendingOrders.length === 0) {
            pendingBody.innerHTML = '';
            return;
        }
        
        // Reconstruir la tabla completamente para evitar problemas
        pendingBody.innerHTML = '';
        
        // Agregar todas las órdenes pendientes desde cero
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            // Crear una nueva fila para cada orden
            var newRow = this.createOrderRow(order);
            pendingBody.appendChild(newRow);
        }
    },
    
    createOrderRow: function(order) {
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
        var details = Avika.config.serviceNames[order.serviceType];
        
        if (order.isSpecialCombo) {
            if (order.hotKitchenFinished) details = "✓ Cocina Caliente, ";
            if (order.coldKitchenFinished) details += "✓ Cocina Fría, ";
            details += Avika.config.categoryNames[order.category];
        } else if (order.kitchenFinished) {
            details = "✓ " + details;
        }
        
        if (order.customizations && order.customizations.length > 0) {
            details += ', ' + order.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
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
        actionCell.className = 'action-cell'; // Añadida clase para estilos específicos
        
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
                            Avika.orders.finishHotKitchen(orderId);
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
                            Avika.orders.finishColdKitchen(orderId);
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
                        Avika.orders.markDeliveryDeparture(orderId);
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
                        Avika.orders.markDeliveryArrival(orderId);
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
                        Avika.orders.finishHotKitchen(orderId);
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
                        Avika.orders.finishColdKitchen(orderId);
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
                        Avika.orders.finishKitchenForDelivery(orderId);
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
                        Avika.orders.markDeliveryDeparture(orderId);
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
                        Avika.orders.markDeliveryArrival(orderId);
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
                    Avika.orders.finishPreparation(orderId);
                };
            })(order.id);
            actionCell.appendChild(finishBtn);
        }
        
        row.appendChild(actionCell);
        
        return row;
    },
    
    updateCompletedTable: function(showAll) {
        var completedBody = document.getElementById('completed-body');
        completedBody.innerHTML = '';
        
        var displayOrders = showAll ? Avika.data.completedOrders : Avika.data.completedOrders.slice(0, 5);
        
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
            var details = Avika.config.serviceNames[order.serviceType] + ', ' + Avika.config.categoryNames[order.category];
            
            if (order.isSpecialCombo) {
                details += ' (Combo Especial)';
            }
            
            if (order.customizations && order.customizations.length > 0) {
                details += ', ' + order.customizations.map(function(code) {
                    return Avika.config.customizationOptions[code] || code;
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
    },

    updateAllTimers: function() {
        if (Avika.data.pendingOrders.length === 0) return;
        
        var timerCells = document.getElementById('pending-body').querySelectorAll('.timer-cell');
        
        for (var i = 0; i < timerCells.length; i++) {
            if (i >= Avika.data.pendingOrders.length) return;
            
            var order = Avika.data.pendingOrders[i];
            var timerCell = timerCells[i];
            
            var now = new Date();
            var elapsedMillis = now - new Date(order.startTime);
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            var minutes = Math.floor(elapsedSeconds / 60);
            var seconds = elapsedSeconds % 60;
            
            timerCell.textContent = this.padZero(minutes) + ':' + this.padZero(seconds);
            
            // Añadir clases de advertencia según el tiempo transcurrido
            timerCell.classList.remove('warning', 'alert');
            
            // Más de 10 minutos: advertencia
            if (minutes >= 10) {
                timerCell.classList.add('warning');
            }
            
            // Más de 15 minutos: alerta
            if (minutes >= 15) {
                timerCell.classList.add('alert');
            }
        }
    },
    
    // Función para agregar estilos para botones de entrega
    addDeliveryStyles: function() {
        if (document.getElementById('delivery-styles')) return;
        
        var styleElement = document.createElement('style');
        styleElement.id = 'delivery-styles';
        styleElement.textContent = `
.finish-btn.delivery {
    background-color: #f39c12;
}
.finish-btn.delivery-arrived {
    background-color: #3498db;
}

/* Estilos para subcategorías */
.subcategories-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    padding: 10px;
    background-color: var(--highlight-bg);
    border-radius: 8px;
}

.subcategory-btn {
    background-color: var(--container-bg);
    color: var(--text-color);
    border: 1px solid var(--primary-btn);
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.subcategory-btn:hover {
    background-color: var(--primary-btn);
    color: white;
}

.subcategory-btn.active {
    background-color: var(--primary-btn);
    color: white;
    font-weight: bold;
}

/* Contenedor para los botones de platillos */
.dishes-buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

/* Ajustes para el encabezado de acción en la tabla */
.pending-orders-section th:nth-child(5),
.pending-orders-section td.action-cell {
    background-color: var(--container-bg);
    position: sticky;
    right: 0;
    z-index: 2;
}

.pending-orders-section th:nth-child(5) {
    background-color: var(--table-header-bg);
    color: var(--table-header-text);
    z-index: 3;
}`;
        
        document.head.appendChild(styleElement);
    }
});