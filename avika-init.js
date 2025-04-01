// ====== PROBLEMA 1: CORREGIR EL INIT.JS ======
// Reemplaza completamente el archivo avika-init.js con este código

// avika-init.js - Script de inicialización para la aplicación Avika
// Este script debe cargarse después de todos los demás scripts de Avika

// Esperamos a que el DOM esté completamente cargado
window.Avika = window.Avika || {};
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando Avika...");
    
    // Verifica que los objetos Avika existen
    if (!window.Avika) {
        console.error("Error crítico: Objeto Avika no encontrado");
        return;
    }
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders
    });
    
    // Inicializar manualmente botones de categoría
    function initCategoryButtons() {
        console.log("Inicializando botones de categoría...");
        
        // Conectar los botones de categoría con sus funciones
        document.getElementById('btn-frio').addEventListener('click', function() {
            Avika.ui.selectCategory('frio');
        });
        
        document.getElementById('btn-entrada-fria').addEventListener('click', function() {
            Avika.ui.selectCategory('entrada-fria');
        });
        
        document.getElementById('btn-caliente').addEventListener('click', function() {
            Avika.ui.selectCategory('caliente');
        });
        
        document.getElementById('btn-entrada-caliente').addEventListener('click', function() {
            Avika.ui.selectCategory('entrada-caliente');
        });
        
        document.getElementById('btn-combos').addEventListener('click', function() {
            Avika.ui.selectCategory('combos');
        });
        
        console.log("Botones de categoría inicializados correctamente");
    }
    
    // Inicializar botones de servicio
    function initServiceButtons() {
        console.log("Inicializando botones de servicio...");
        
        document.getElementById('btn-comedor').addEventListener('click', function() {
            Avika.ui.selectService(this, 'comedor');
        });
        
        document.getElementById('btn-domicilio').addEventListener('click', function() {
            Avika.ui.selectService(this, 'domicilio');
        });
        
        document.getElementById('btn-para-llevar').addEventListener('click', function() {
            Avika.ui.selectService(this, 'para-llevar');
        });
        
        console.log("Botones de servicio inicializados correctamente");
    }
    
    // Inicializar botones de cantidad
    function initQuantityButtons() {
        console.log("Inicializando botones de cantidad...");
        
        document.getElementById('btn-decrease').addEventListener('click', function() {
            Avika.ui.changeQuantity(-1);
        });
        
        document.getElementById('btn-increase').addEventListener('click', function() {
            Avika.ui.changeQuantity(1);
        });
        
        console.log("Botones de cantidad inicializados correctamente");
    }
    
    // Inicializar botones de acción
    function initActionButtons() {
        console.log("Inicializando botones de acción...");
        
        document.getElementById('btn-back-to-categories').addEventListener('click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        document.getElementById('btn-back-to-dishes').addEventListener('click', function() {
            Avika.ui.showSection('dishes-section');
        });
        
        document.getElementById('btn-start').addEventListener('click', function() {
            Avika.orders.startPreparation();
        });
        
        document.getElementById('btn-cancel').addEventListener('click', function() {
            Avika.ui.showSection('categories-section');
        });
        
        // Botones de filtrado para historial
        var btnShowAllHistory = document.getElementById('btn-show-all-history');
        var btnShowRecent = document.getElementById('btn-show-recent');
        
        if (btnShowAllHistory) {
            btnShowAllHistory.addEventListener('click', function() {
                btnShowAllHistory.classList.add('active');
                btnShowRecent.classList.remove('active');
                Avika.ui.updateCompletedTable(true);
            });
        }
        
        if (btnShowRecent) {
            btnShowRecent.addEventListener('click', function() {
                btnShowRecent.classList.add('active');
                btnShowAllHistory.classList.remove('active');
                Avika.ui.updateCompletedTable(false);
            });
        }
        
        // Botón de exportar
        var btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', function() {
                Avika.stats.exportarDatos();
            });
        }
        
        console.log("Botones de acción inicializados correctamente");
    }
    
    // Cargar datos guardados
    function loadSavedData() {
        console.log("Cargando datos guardados...");
        try {
            Avika.storage.cargarDatosGuardados();
            console.log("Datos cargados correctamente");
        } catch (e) {
            console.error("Error al cargar datos:", e);
        }
    }
    
    // Inicialización de la aplicación
    function initApp() {
        console.log("Inicializando aplicación...");
        
        // Inicializar componentes de UI
        initCategoryButtons();
        initServiceButtons();
        initQuantityButtons();
        initActionButtons();
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar actualizaciones periódicas
        setInterval(function() {
            Avika.ui.updateAllTimers();
        }, 1000);
        
        // Configurar autoguardado
        setInterval(function() {
            Avika.storage.guardarDatosLocales();
        }, Avika.config.autoSaveInterval || 30000);
        
        console.log("Inicialización completa");
    }
    
    // Iniciar la aplicación
    try {
        initApp();
    } catch (e) {
        console.error("Error fatal durante la inicialización:", e);
        alert("Error al inicializar la aplicación. Consulta la consola para más detalles.");
    }
});
// Botón para ver estadísticas y promedios
var btnShowStats = document.getElementById('btn-show-stats');
if (btnShowStats) {
    btnShowStats.addEventListener('click', function() {
        Avika.stats.calcularPromedios();
    });
}

// Botón para limpiar historial
var btnClearHistory = document.getElementById('btn-clear-history');
if (btnClearHistory) {
    btnClearHistory.addEventListener('click', function() {
        Avika.storage.limpiarHistorial();
    });
}
// ====== PROBLEMA 2: COMPLETAR UI-CONTROLLER.JS ======
// Añade estas funciones al archivo ui-controller.js (al final del archivo)

// Solo añade estas funciones adicionales al ui-controller.js
/*
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
    }
*/

// ====== PROBLEMA 3: REEMPLAZAR COMPLETAMENTE MAIN.JS ======
// Elimina main.js ya que duplica la funcionalidad de ui-controller.js

// ====== PROBLEMA 4: MODIFICAR EL INDEX.HTML ======
/*
Asegúrate de que tu orden de carga de scripts en index.html sea la siguiente:

<script src="js/modules/config.js"></script>
<script src="js/modules/ui-controller.js"></script>
<script src="js/modules/order-service.js"></script>
<script src="js/modules/storage.js"></script>
<script src="js/modules/stats.js"></script>
<script src="avika-init.js"></script>

Elimina cualquier referencia a main.js
*/