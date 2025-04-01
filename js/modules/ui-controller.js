// ui-controller.js - Funciones de interfaz de usuario con soporte para subcategorías
Avika.ui = {
    // Estado de la UI
    state: {
        lastSavedState: '',
        currentSubCategory: null // Añadido para el seguimiento de subcategorías
    },
    
    // Funciones básicas de UI
    showSection: function(sectionId) {
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('dishes-section').style.display = 'none';
        document.getElementById('preparation-section').style.display = 'none';
        
        document.getElementById(sectionId).style.display = 'block';
    },

    showNotification: function(message) {
        var notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(function() {
            notification.style.display = 'none';
        }, 3000);
    },
    
    padZero: function(num) {
        return (num < 10 ? '0' : '') + num;
    },

    formatTime: function(date) {
        if (!date) return '--:--:--';
        
        var hours = this.padZero(date.getHours());
        var minutes = this.padZero(date.getMinutes());
        var seconds = this.padZero(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },
    
    // Función para manejar subcategorías
    // Reemplaza la función selectCategory en ui-controller.js con esta versión corregida

selectCategory: function(category) {
    console.log("Seleccionando categoría:", category); // Añadido para depuración
    
    Avika.data.currentCategory = category;
    document.getElementById('selected-category-title').textContent = Avika.config.categoryNames[category];
    
    var dishesContainer = document.getElementById('dishes-container');
    // Limpiar el contenedor completamente
    dishesContainer.innerHTML = '';
    
    // Verificar si hay datos de platillos
    if (!Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
        dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
        this.showSection('dishes-section');
        return;
    }
    
    // Verificar si hay subcategorías configuradas para esta categoría
    if (Avika.config.subCategories && 
        Avika.config.subCategories[category] && 
        Avika.config.subCategories[category].length > 0) {
        
        console.log("Procesando subcategorías para:", category); // Añadido para depuración
        
        // Crear contenedor para subcategorías
        var subCategoriesContainer = document.createElement('div');
        subCategoriesContainer.className = 'subcategories-container';
        
        // Añadir botón para "Todos los platillos"
        var allButton = document.createElement('button');
        allButton.className = 'subcategory-btn active';
        allButton.textContent = 'Todos los platillos';
        allButton.onclick = function() {
            Avika.ui.selectSubCategory(category, null);
            
            // Marcar este botón como activo
            var buttons = subCategoriesContainer.querySelectorAll('.subcategory-btn');
            buttons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        };
        subCategoriesContainer.appendChild(allButton);
        
        // Añadir un botón para cada subcategoría
        Avika.config.subCategories[category].forEach(function(subcat) {
            var button = document.createElement('button');
            button.className = 'subcategory-btn';
            button.textContent = subcat.name;
            button.onclick = function() {
                Avika.ui.selectSubCategory(category, subcat);
                
                // Marcar este botón como activo
                var buttons = subCategoriesContainer.querySelectorAll('.subcategory-btn');
                buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            };
            subCategoriesContainer.appendChild(button);
        });
        
        // Añadir el contenedor de subcategorías al principio
        dishesContainer.appendChild(subCategoriesContainer);
        
        // Añadir la sección de búsqueda rápida
        var searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar platillo...';
        searchInput.className = 'search-input';
        searchInput.id = 'dish-search';
        searchInput.addEventListener('input', function() {
            Avika.ui.filterDishes(this.value.toLowerCase());
        });
        searchContainer.appendChild(searchInput);
        dishesContainer.appendChild(searchContainer);
        
        // Crear contenedor para los botones de platillos
        var platillosContainer = document.createElement('div');
        platillosContainer.className = 'dishes-buttons-container';
        dishesContainer.appendChild(platillosContainer);
        
        // Mostrar todos los platillos inicialmente
        this.selectSubCategory(category, null, platillosContainer);
    } else {
        // Si no hay subcategorías, mostrar todos los platillos directamente
        console.log("Mostrando todos los platillos para:", category); // Añadido para depuración
        
        // Añadir la sección de búsqueda rápida
        var searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar platillo...';
        searchInput.className = 'search-input';
        searchInput.id = 'dish-search';
        searchInput.addEventListener('input', function() {
            Avika.ui.filterDishes(this.value.toLowerCase());
        });
        searchContainer.appendChild(searchInput);
        dishesContainer.appendChild(searchContainer);
        
        // Crear contenedor para los botones de platillos
        var platillosContainer = document.createElement('div');
        platillosContainer.className = 'dishes-buttons-container';
        dishesContainer.appendChild(platillosContainer);
        
        // Añadir todos los platillos como botones
        for (var i = 0; i < Avika.config.dishes[category].length; i++) {
            var dish = Avika.config.dishes[category][i];
            var button = document.createElement('button');
            button.className = 'dish-btn';
            button.setAttribute('data-dish', dish.toLowerCase());
            
            if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                button.className += ' special-combo';
            }
            
            button.textContent = dish;
            button.onclick = (function(selectedDish) {
                return function() {
                    Avika.ui.selectDish(selectedDish);
                };
            })(dish);
            
            platillosContainer.appendChild(button);
        }
    }
    
    // Asegurarse de que se muestre la sección correcta
    this.showSection('dishes-section');
    console.log("Sección de platillos mostrada"); // Añadido para depuración
},
    
    // Función para seleccionar una subcategoría
    // Reemplaza la función selectSubCategory en ui-controller.js con esta versión corregida

selectSubCategory: function(category, subcategory, container) {
    console.log("Seleccionando subcategoría:", subcategory ? subcategory.name : "Todos"); // Añadido para depuración
    
    this.state.currentSubCategory = subcategory;
    
    // Si no se proporciona un contenedor, usar el predeterminado
    var platillosContainer = container || document.querySelector('.dishes-buttons-container');
    if (!platillosContainer) {
        console.error("No se encontró el contenedor de platillos"); // Añadido para depuración
        return;
    }
    
    // Limpiar contenedor
    platillosContainer.innerHTML = '';
    
    // Si se seleccionó una subcategoría específica
    if (subcategory) {
        console.log("Mostrando platillos de subcategoría:", subcategory.name); // Añadido para depuración
        
        // Mostrar solo los platillos de esta subcategoría
        subcategory.items.forEach(function(dish) {
            var button = document.createElement('button');
            button.className = 'dish-btn';
            button.setAttribute('data-dish', dish.toLowerCase());
            
            if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                button.className += ' special-combo';
            }
            
            button.textContent = dish;
            button.onclick = function() {
                Avika.ui.selectDish(dish);
            };
            
            platillosContainer.appendChild(button);
        });
    } else {
        console.log("Mostrando todos los platillos de la categoría:", category); // Añadido para depuración
        
        // Si se seleccionó "Todos", mostrar todos los platillos de la categoría
        if (!Avika.config.dishes[category]) {
            console.error("No se encontraron platillos para la categoría:", category); // Añadido para depuración
            return;
        }
        
        for (var i = 0; i < Avika.config.dishes[category].length; i++) {
            var dish = Avika.config.dishes[category][i];
            var button = document.createElement('button');
            button.className = 'dish-btn';
            button.setAttribute('data-dish', dish.toLowerCase());
            
            if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                button.className += ' special-combo';
            }
            
            button.textContent = dish;
            button.onclick = (function(selectedDish) {
                return function() {
                    Avika.ui.selectDish(selectedDish);
                };
            })(dish);
            
            platillosContainer.appendChild(button);
        }
    }
    
    console.log("Platillos añadidos:", platillosContainer.children.length); // Añadido para depuración
},
    
    // Función para filtrar platillos por búsqueda
    filterDishes: function(searchText) {
        var buttons = document.querySelectorAll('.dish-btn');
        var found = false;
        
        buttons.forEach(function(button) {
            var dishName = button.getAttribute('data-dish');
            if (dishName.indexOf(searchText) > -1) {
                button.style.display = '';
                found = true;
            } else {
                button.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no se encuentran platillos
        var noResultsMsg = document.getElementById('no-results-message');
        if (!found) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.textContent = 'No se encontraron platillos que coincidan con la búsqueda.';
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.style.color = '#888';
                
                var container = document.querySelector('.dishes-buttons-container');
                if (container) {
                    container.parentNode.insertBefore(noResultsMsg, container.nextSibling);
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },

    selectDish: function(dish) {
        Avika.data.currentDish = dish;
        document.getElementById('selected-dish-title').textContent = dish;
        
        Avika.data.isSpecialCombo = (Avika.config.specialCombos.indexOf(dish) !== -1);
        
        this.resetOptions();
        this.updatePersonalizationOptions();
        
        this.showSection('preparation-section');
    },

    resetOptions: function() {
        // Limpiar personalización
        Avika.data.currentCustomizations = [];
        
        // Resetear servicio
        document.getElementById('btn-comedor').classList.add('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        Avika.data.currentService = 'comedor';
        
        // Resetear cantidad
        Avika.data.currentQuantity = 1;
        document.getElementById('quantity-display').textContent = '1';
        
        // Limpiar notas
        document.getElementById('notes-input').value = '';
    },

    updatePersonalizationOptions: function() {
        var container = document.getElementById('personalization-options');
        container.innerHTML = '';
        
        if (Avika.data.currentCategory === 'combos') {
            document.getElementById('personalization-section').style.display = 'none';
            return;
        }
        
        document.getElementById('personalization-section').style.display = 'block';
        
        for (var code in Avika.config.customizationOptions) {
            if (!Avika.config.customizationOptions.hasOwnProperty(code)) continue;
            
            var button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = Avika.config.customizationOptions[code];
            button.setAttribute('data-option', code);
            button.onclick = function() {
                Avika.ui.toggleOption(this, this.getAttribute('data-option'));
            };
            container.appendChild(button);
        }
    },

    toggleOption: function(button, option) {
        button.classList.toggle('selected');
        
        if (button.classList.contains('selected')) {
            if (Avika.data.currentCustomizations.indexOf(option) === -1) {
                Avika.data.currentCustomizations.push(option);
            }
        } else {
            Avika.data.currentCustomizations = Avika.data.currentCustomizations.filter(function(item) {
                return item !== option;
            });
        }
    },

    selectService: function(button, service) {
        document.getElementById('btn-comedor').classList.remove('selected');
        document.getElementById('btn-domicilio').classList.remove('selected');
        document.getElementById('btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        Avika.data.currentService = service;
    },

    changeQuantity: function(change) {
        Avika.data.currentQuantity = Math.max(1, Avika.data.currentQuantity + change);
        document.getElementById('quantity-display').textContent = Avika.data.currentQuantity;
    },

    // Actualizar tabla de órdenes pendientes
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
    
    ccreateOrderRow: function(order) {
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
        if (order.isSpecialCombo && Avika.config.specialCombos.indexOf(order.dish) !== -1 && order.serviceType === 'domicilio') {
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
        else if (order.isSpecialCombo && Avika.config.specialCombos.indexOf(order.dish) !== -1) {
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
        // Pedidos normales o combos regulares
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
};