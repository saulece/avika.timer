// ui-controller.js - Funciones de interfaz de usuario con soporte para subcategorías
window.Avika = window.Avika || {};

Avika.ui = {
    // Estado de la UI
    state: {
        lastSavedState: '',
        currentSubCategory: null, // Añadido para el seguimiento de subcategorías
        ticketMode: false, // Añadido para modo ticket
        ticketItems: [], // Añadido para almacenar elementos del ticket
        ticketService: 'comedor', // Servicio predeterminado para el ticket
        selectedTicketItem: {}, // Item seleccionado actualmente
        expandedTickets: {}
    },
    
    // Funciones básicas de UI
    showSection: function(sectionId) {
        console.log("Mostrando sección:", sectionId); // Añadido para depuración
        
        // Ocultar todas las secciones primero
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('dishes-section').style.display = 'none';
        document.getElementById('preparation-section').style.display = 'none';
        
        // Mostrar la sección solicitada
        var section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            
            // Forzar un reflow para asegurar que los cambios de CSS se apliquen
            void section.offsetWidth;
            
            console.log("Sección " + sectionId + " configurada como visible");
            
            // Verificación adicional para dishes-section
            if (sectionId === 'dishes-section') {
                var dishesContainer = document.getElementById('dishes-container');
                if (dishesContainer) {
                    console.log("Contenedor de platillos encontrado, cantidad de hijos:", dishesContainer.children.length);
                    
                    // Verificar los botones de platillos
                    var buttons = dishesContainer.querySelectorAll('.dish-btn');
                    console.log("Botones de platillos encontrados:", buttons.length);
                    
                    // Verificar si los botones tienen estilos que los ocultan
                    if (buttons.length > 0) {
                        var buttonStyle = window.getComputedStyle(buttons[0]);
                        console.log("Estilo de botón:", 
                                    "display=" + buttonStyle.display, 
                                    "visibility=" + buttonStyle.visibility,
                                    "opacity=" + buttonStyle.opacity);
                    }
                } else {
                    console.error("No se encontró el contenedor de platillos");
                }
            }
        } else {
            console.error("Sección no encontrada:", sectionId);
        }
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
        
        // Celda de temporizador
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        timerCell.setAttribute('data-id', order.id);
        timerCell.textContent = '00:00:00';
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        
        var detailsText = '';
        
        // Añadir información de servicio
        detailsText += Avika.config.serviceNames[order.serviceType] || order.serviceType;
        
        // Añadir personalizaciones si existen
        if (order.customizations && order.customizations.length) {
            detailsText += ', ' + order.customizations.join(', ');
        }
        
        // Añadir notas si existen
        if (order.notes) {
            detailsText += '<br><span class="notes">' + order.notes + '</span>';
        }
        
        // Añadir información del ticket
        if (order.ticketId) {
            detailsText += '<br><span class="ticket-info">Ticket #' + order.ticketId.substring(order.ticketId.length - 5) + '</span>';
        }
        
        detailsCell.innerHTML = detailsText;
        row.appendChild(detailsCell);
        
        // Celda de acciones
        var actionsCell = document.createElement('td');
        
        // Si es un combo especial, mostrar botones para cada cocina
        if (order.isSpecialCombo) {
            var hotKitchenBtn = document.createElement('button');
            hotKitchenBtn.className = 'action-btn kitchen-btn' + (order.hotKitchenFinished ? ' disabled' : '');
            hotKitchenBtn.textContent = order.hotKitchenFinished ? 'Cocina Cal. ✓' : 'Cocina Cal.';
            hotKitchenBtn.disabled = order.hotKitchenFinished;
            hotKitchenBtn.onclick = function() {
                Avika.orders.finishHotKitchen(order.id);
            };
            actionsCell.appendChild(hotKitchenBtn);
            
            var coldKitchenBtn = document.createElement('button');
            coldKitchenBtn.className = 'action-btn kitchen-btn' + (order.coldKitchenFinished ? ' disabled' : '');
            coldKitchenBtn.textContent = order.coldKitchenFinished ? 'Cocina Fría ✓' : 'Cocina Fría';
            coldKitchenBtn.disabled = order.coldKitchenFinished;
            coldKitchenBtn.onclick = function() {
                Avika.orders.finishColdKitchen(order.id);
            };
            actionsCell.appendChild(coldKitchenBtn);
            
            // Si ambas cocinas están listas y es a domicilio, verificar si todos los platillos del ticket están terminados
            if (order.hotKitchenFinished && order.coldKitchenFinished && order.serviceType === 'domicilio') {
                // Solo mostrar el botón de salida si este platillo pertenece a un ticket donde todos los platillos están terminados
                if (order.ticketId) {
                    // Primero verificar si todos los platillos del ticket están terminados
                    var allTicketItemsFinished = true;
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                                allTicketItemsFinished = false;
                                break;
                            } else if (!item.isSpecialCombo && !item.finished) {
                                allTicketItemsFinished = false;
                                break;
                            }
                        }
                    }
                    
                    // Solo mostrar botón de salida si todos los platillos están terminados
                    if (allTicketItemsFinished && !order.deliveryDepartureTime) {
                        var departureBtn = document.createElement('button');
                        departureBtn.className = 'action-btn departure-btn';
                        departureBtn.textContent = 'Registrar Salida';
                        departureBtn.onclick = function() {
                            Avika.orders.markDeliveryDeparture(order.id);
                        };
                        actionsCell.appendChild(departureBtn);
                    }
                    // Si ya se registró la salida pero no la entrega
                    else if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                        var arrivalBtn = document.createElement('button');
                        arrivalBtn.className = 'action-btn arrival-btn';
                        arrivalBtn.textContent = 'Registrar Entrega';
                        arrivalBtn.onclick = function() {
                            Avika.orders.markDeliveryArrival(order.id);
                        };
                        actionsCell.appendChild(arrivalBtn);
                    }
                }
                else if (!order.kitchenFinished) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                    actionsCell.appendChild(departureBtn);
                }
            }
        } 
        // Si es a domicilio, mostrar botón de "Listo" y luego "Registrar Salida"
        else if (order.serviceType === 'domicilio') {
            // Si es parte de un ticket
            if (order.ticketId) {
                // Verificar si todos los platillos del ticket están terminados
                var allTicketItemsFinished = true;
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
                            allTicketItemsFinished = false;
                            break;
                        } else if (!item.isSpecialCombo && !item.finished) {
                            allTicketItemsFinished = false;
                            break;
                        }
                    }
                }
                
                // Si este platillo no está terminado, mostrar botón "Listo"
                if (!order.finished) {
                    var doneBtn = document.createElement('button');
                    doneBtn.className = 'action-btn';
                    doneBtn.textContent = 'Listo';
                    doneBtn.onclick = function() {
                        Avika.orders.finishIndividualItem(order.id);
                    };
                    actionsCell.appendChild(doneBtn);
                }
                // Si todos los platillos del ticket están terminados, mostrar "Registrar Salida"
                else if (allTicketItemsFinished && !order.deliveryDepartureTime) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'action-btn departure-btn';
                    departureBtn.textContent = 'Registrar Salida';
                    departureBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                    actionsCell.appendChild(departureBtn);
                }
                // Si ya se registró la salida pero no la entrega
                else if (order.deliveryDepartureTime && !order.deliveryArrivalTime) {
                    var arrivalBtn = document.createElement('button');
                    arrivalBtn.className = 'action-btn arrival-btn';
                    arrivalBtn.textContent = 'Registrar Entrega';
                    arrivalBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(order.id);
                    };
                    actionsCell.appendChild(arrivalBtn);
                }
                // Platillo terminado pero esperando que otros platillos del ticket estén listos
                else if (order.finished && !allTicketItemsFinished) {
                    var statusText = document.createElement('span');
                    statusText.className = 'status-text';
                    statusText.textContent = 'Esperando otros platillos';
                    actionsCell.appendChild(statusText);
                }
            }
            // Platillo individual (sin ticket)
            else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                
                // Mostrar el botón adecuado según el estado
                if (!order.kitchenFinished) {
                    doneBtn.textContent = 'Listo';
                    doneBtn.onclick = function() {
                        Avika.orders.finishKitchenForDelivery(order.id);
                    };
                } else if (!order.deliveryDepartureTime) {
                    doneBtn.textContent = 'Registrar Salida';
                    doneBtn.onclick = function() {
                        Avika.orders.markDeliveryDeparture(order.id);
                    };
                } else if (!order.deliveryArrivalTime) {
                    doneBtn.textContent = 'Registrar Entrega';
                    doneBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(order.id);
                    };
                }
                
                actionsCell.appendChild(doneBtn);
            }
        }
        // Para platillos normales no a domicilio, mostrar botón de listo
        else if (!order.deliveryDepartureTime) {
            // Si es parte de un ticket y ya está terminado, mostrar "Esperando otros platillos"
            if (order.ticketId && order.finished) {
                var statusText = document.createElement('span');
                statusText.className = 'status-text';
                statusText.textContent = 'Esperando otros platillos';
                actionsCell.appendChild(statusText);
            } else {
                var doneBtn = document.createElement('button');
                doneBtn.className = 'action-btn';
                doneBtn.textContent = 'Listo';
                
                // Si es parte de un ticket, usar finishIndividualItem en lugar de finishPreparation
                if (order.ticketId) {
                    doneBtn.onclick = function() {
                        Avika.orders.finishIndividualItem(order.id);
                    };
                } else {
                    doneBtn.onclick = function() {
                        Avika.orders.finishPreparation(order.id);
                    };
                }
                
                actionsCell.appendChild(doneBtn);
            }
        }
        
        row.appendChild(actionsCell);
        
        return row;
    },
    
    // Funcionalidad para expandir/contraer tickets
    toggleTicket: function(ticketId) {
        // Actualizar el estado del ticket
        if (!this.state.expandedTickets) {
            this.state.expandedTickets = {};
        }
        
        this.state.expandedTickets[ticketId] = !this.state.expandedTickets[ticketId];
        
        // Actualizar el botón de expandir/contraer
        var expandButton = document.querySelector('.expand-ticket-btn[data-ticket-id="' + ticketId + '"]');
        if (expandButton) {
            if (this.state.expandedTickets[ticketId]) {
                expandButton.innerHTML = '&#x25BC;'; // Triángulo hacia abajo
                expandButton.classList.remove('collapsed');
                expandButton.classList.add('expanded');
            } else {
                expandButton.innerHTML = '&#x25B6;'; // Triángulo hacia la derecha
                expandButton.classList.remove('expanded');
                expandButton.classList.add('collapsed');
            }
        }
        
        // Mostrar u ocultar las filas de los elementos del ticket
        var itemRows = document.querySelectorAll('.ticket-item-row[data-ticket-id="' + ticketId + '"]');
        itemRows.forEach(function(row) {
            row.style.display = this.state.expandedTickets[ticketId] ? 'table-row' : 'none';
        }.bind(this));
    },
    
    // Actualizar tabla de órdenes completadas
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
        
        // Añadir botón para limpiar historial si hay pedidos completados
        if (Avika.data.completedOrders.length > 0) {
            var clearHistoryContainer = document.getElementById('clear-history-container');
            if (!clearHistoryContainer) {
                clearHistoryContainer = document.createElement('div');
                clearHistoryContainer.id = 'clear-history-container';
                clearHistoryContainer.style.textAlign = 'center';
                clearHistoryContainer.style.margin = '10px 0';
                
                var completedTable = document.getElementById('completed-table');
                if (completedTable) {
                    completedTable.parentNode.insertBefore(clearHistoryContainer, completedTable.nextSibling);
                }
            }
            
            clearHistoryContainer.innerHTML = '';
            var clearBtn = document.createElement('button');
            clearBtn.className = 'action-btn cancel-btn';
            clearBtn.textContent = 'Limpiar Historial';
            clearBtn.onclick = function() {
                if (confirm('¿Está seguro que desea limpiar el historial de platillos terminados?')) {
                    Avika.orders.clearCompletedOrders();
                    
                    // Ocultar el botón después de limpiar
                    document.getElementById('clear-history-container').style.display = 'none';
                }
            };
            
            clearHistoryContainer.appendChild(clearBtn);
        }
    },

    // Actualizar todos los temporizadores
    updateAllTimers: function() {
        if (Avika.data.pendingOrders.length === 0) return;
        
        var timerCells = document.getElementById('pending-body').querySelectorAll('.timer-cell');
        
        for (var i = 0; i < timerCells.length; i++) {
            var timerCell = timerCells[i];
            var orderId = timerCell.getAttribute('data-id');
            
            if (!orderId) continue;
            
            // Buscar la orden por ID
            var order = null;
            for (var j = 0; j < Avika.data.pendingOrders.length; j++) {
                if (Avika.data.pendingOrders[j].id === orderId) {
                    order = Avika.data.pendingOrders[j];
                    break;
                }
            }
            
            // Si no se encontró la orden, continuar con la siguiente
            if (!order) continue;
            
            var now = new Date();
            var elapsedMillis = now - new Date(order.startTime);
            var elapsedSeconds = Math.floor(elapsedMillis / 1000);
            
            var hours = Math.floor(elapsedSeconds / 3600);
            var minutes = Math.floor((elapsedSeconds % 3600) / 60);
            var seconds = elapsedSeconds % 60;
            
            timerCell.textContent = this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(seconds);
            
            // Añadir clases de advertencia según el tiempo transcurrido
            timerCell.classList.remove('warning', 'alert');
            
            // Más de 10 minutos: advertencia
            if (minutes >= 10 || hours > 0) {
                timerCell.classList.add('warning');
            }
            
            // Más de 15 minutos: alerta
            if (minutes >= 15 || hours > 0) {
                timerCell.classList.add('alert');
            }
        }
    },
    
    // Funciones para el manejo de tickets o comandas
    enableTicketMode: function() {
        this.state.ticketMode = true;
        this.state.ticketItems = [];
        this.state.ticketService = 'comedor';
        
        // Mostrar modal para ingresar tickets
        this.showTicketModal();
    },
    
    showTicketModal: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('ticket-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ticket-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Ingreso de Ticket/Comanda</h2>
                    
                    <div class="ticket-input-group">
                        <label for="ticket-time">Hora de entrada:</label>
                        <div class="simple-time-picker">
                            <select id="ticket-hour" class="time-select">
                                ${this.generateHourOptions()}
                            </select>
                            <span>:</span>
                            <select id="ticket-minute" class="time-select">
                                ${this.generateMinuteOptions()}
                            </select>
                            <span class="time-select-label">hrs</span>
                        </div>
                    </div>
                    
                    <div class="ticket-items-container">
                        <h3>Platillos en este ticket: <span id="ticket-count">0</span></h3>
                        <div id="ticket-items-list" class="ticket-items-list"></div>
                    </div>
                    
                    <div class="ticket-service-selection">
                        <p>Tipo de servicio para todo el ticket:</p>
                        <div class="option-btns">
                            <button class="option-btn selected" id="ticket-btn-comedor">Comedor</button>
                            <button class="option-btn" id="ticket-btn-domicilio">Domicilio</button>
                            <button class="option-btn" id="ticket-btn-para-llevar">Ordena y Espera</button>
                        </div>
                    </div>
                    
                    <div class="ticket-notes">
                        <label for="ticket-notes-input">Notas para todo el ticket:</label>
                        <textarea id="ticket-notes-input" placeholder="Notas adicionales para todo el ticket"></textarea>
                    </div>
                    
                    <div class="ticket-buttons">
                        <button id="btn-add-ticket-item" class="action-btn">Agregar platillo</button>
                        <div class="modal-action-btns">
                            <button id="btn-cancel-ticket" class="action-btn cancel-btn">Cancelar</button>
                            <button id="btn-save-ticket" class="action-btn start-btn" disabled>Guardar ticket</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                Avika.ui.cancelTicket();
            };
            
            // Evento para agregar platillo
            document.getElementById('btn-add-ticket-item').onclick = function() {
                Avika.ui.showTicketItemSelection();
            };
            
            // Evento para guardar ticket
            document.getElementById('btn-save-ticket').onclick = function() {
                // Prevenir múltiples clics
                this.disabled = true;
                // Usar timeout para asegurar que el botón se actualiza visualmente antes de continuar
                setTimeout(function() {
                    Avika.ui.saveTicket();
                }, 50);
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-ticket').onclick = function() {
                Avika.ui.cancelTicket();
            };
            
            // Eventos de selección de servicio
            document.getElementById('ticket-btn-comedor').onclick = function() {
                Avika.ui.selectTicketService(this, 'comedor');
            };
            
            document.getElementById('ticket-btn-domicilio').onclick = function() {
                Avika.ui.selectTicketService(this, 'domicilio');
            };
            
            document.getElementById('ticket-btn-para-llevar').onclick = function() {
                Avika.ui.selectTicketService(this, 'para-llevar');
            };
        }
        
        // Inicializar hora actual
        var now = new Date();
        document.getElementById('ticket-hour').value = now.getHours();
        document.getElementById('ticket-minute').value = this.roundToFive(now.getMinutes());
        
        // Resetear lista de items
        this.state.ticketItems = [];
        document.getElementById('ticket-items-list').innerHTML = '';
        document.getElementById('ticket-count').textContent = '0';
        document.getElementById('btn-save-ticket').disabled = true;
        document.getElementById('ticket-notes-input').value = '';
        
        // Seleccionar servicio predeterminado (comedor)
        document.getElementById('ticket-btn-comedor').classList.add('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        this.state.ticketService = 'comedor';
        
        // Mostrar modal
        modal.style.display = 'block';
    },
    
    // Funciones de utilidad para el selector de hora
    generateHourOptions: function() {
        var options = '';
        for (var i = 0; i < 24; i++) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    generateMinuteOptions: function() {
        var options = '';
        for (var i = 0; i < 60; i += 5) {
            options += `<option value="${i}">${this.padZero(i)}</option>`;
        }
        return options;
    },
    
    roundToFive: function(num) {
        return Math.round(num / 5) * 5 % 60;
    },
    
    selectTicketService: function(button, service) {
        document.getElementById('ticket-btn-comedor').classList.remove('selected');
        document.getElementById('ticket-btn-domicilio').classList.remove('selected');
        document.getElementById('ticket-btn-para-llevar').classList.remove('selected');
        
        button.classList.add('selected');
        this.state.ticketService = service;
    },
    
    showTicketItemSelection: function() {
        // Crear modal de selección de platillo
        var modal = document.getElementById('item-selection-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-selection-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Seleccionar platillo</h2>
                    
                    <div class="mobile-friendly-select">
                        <div class="selection-step" id="category-selection-step">
                            <h3>Categoría:</h3>
                            <div class="category-container">
                                <button class="category-btn" data-category="frio">Platillos Fríos</button>
                                <button class="category-btn" data-category="entrada-fria">Entradas Frías</button>
                                <button class="category-btn" data-category="caliente">Platillos Calientes</button>
                                <button class="category-btn" data-category="entrada-caliente">Entradas Calientes</button>
                                <button class="category-btn" data-category="combos">Combos</button>
                            </div>
                        </div>
                        
                        <div class="selection-step" id="dish-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-category">« Atrás</button>
                                <h3>Platillo: <span id="selected-category-name"></span></h3>
                            </div>
                            <div id="dishes-selection-container" class="dishes-container"></div>
                        </div>
                        
                        <div class="selection-step" id="quantity-selection-step" style="display: none;">
                            <div class="step-header">
                                <button class="back-to-dish">« Atrás</button>
                                <h3>Platillo: <span id="selected-dish-name"></span></h3>
                            </div>
                            <div class="item-quantity">
                                <h3>Cantidad:</h3>
                                <div class="qty-control">
                                    <button class="qty-btn" id="item-btn-decrease">-</button>
                                    <span class="qty-display" id="item-quantity-display">1</span>
                                    <button class="qty-btn" id="item-btn-increase">+</button>
                                </div>
                            </div>
                            
                            <div class="item-notes">
                                <h3>Notas para este platillo:</h3>
                                <textarea id="item-notes-input" placeholder="Notas específicas para este platillo"></textarea>
                            </div>
                            
                            <div class="item-buttons">
                                <div class="modal-action-btns">
                                    <button id="btn-cancel-item" class="action-btn cancel-btn">Cancelar</button>
                                    <button id="btn-add-to-ticket" class="action-btn start-btn">Agregar al ticket</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
            
            // Eventos para categorías
            var categoryBtns = modal.querySelectorAll('.category-btn');
            categoryBtns.forEach(function(btn) {
                btn.onclick = function() {
                    var category = this.getAttribute('data-category');
                    Avika.ui.selectTicketCategory(category);
                    
                    // Mostrar paso de selección de platillos
                    document.getElementById('category-selection-step').style.display = 'none';
                    document.getElementById('dish-selection-step').style.display = 'block';
                };
            });
            
            // Botón para volver a categorías
            modal.querySelector('.back-to-category').onclick = function() {
                document.getElementById('category-selection-step').style.display = 'block';
                document.getElementById('dish-selection-step').style.display = 'none';
            };
            
            // Botón para volver a platillos
            modal.querySelector('.back-to-dish').onclick = function() {
                document.getElementById('dish-selection-step').style.display = 'block';
                document.getElementById('quantity-selection-step').style.display = 'none';
            };
            
            // Eventos de cantidad
            document.getElementById('item-btn-decrease').onclick = function() {
                Avika.ui.changeTicketItemQuantity(-1);
            };
            
            document.getElementById('item-btn-increase').onclick = function() {
                Avika.ui.changeTicketItemQuantity(1);
            };
            
            // Evento para agregar al ticket
            document.getElementById('btn-add-to-ticket').onclick = function() {
                Avika.ui.addItemToTicket();
            };
            
            // Evento para cancelar
            document.getElementById('btn-cancel-item').onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Reiniciar selección
        this.state.selectedTicketItem = {
            category: '',
            dish: '',
            quantity: 1,
            notes: ''
        };
        
        // Mostrar modal en el primer paso (categorías)
        document.getElementById('category-selection-step').style.display = 'block';
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'none';
        
        // Resetear contenido
        document.getElementById('item-quantity-display').textContent = '1';
        document.getElementById('item-notes-input').value = '';
        document.getElementById('selected-category-name').textContent = '';
        document.getElementById('selected-dish-name').textContent = '';
        document.getElementById('dishes-selection-container').innerHTML = '';
        
        modal.style.display = 'block';
    },
    
    selectTicketCategory: function(category) {
        this.state.selectedTicketItem.category = category;
        document.getElementById('selected-category-name').textContent = Avika.config.categoryNames[category];
        
        var container = document.getElementById('dishes-selection-container');
        container.innerHTML = '';
        
        // Mostrar platillos de la categoría
        if (Avika.config.dishes[category]) {
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = document.createElement('button');
                button.className = 'dish-btn';
                
                if (category === 'combos' && Avika.config.specialCombos.indexOf(dish) !== -1) {
                    button.className += ' special-combo';
                }
                
                button.textContent = dish;
                button.onclick = (function(selectedDish) {
                    return function() {
                        Avika.ui.selectTicketDish(selectedDish);
                    };
                })(dish);
                
                container.appendChild(button);
            }
        }
    },
    
    selectTicketDish: function(dish) {
        this.state.selectedTicketItem.dish = dish;
        this.state.selectedTicketItem.quantity = 1;
        
        // Mostrar el nombre del platillo seleccionado
        document.getElementById('selected-dish-name').textContent = dish;
        
        // Ir al paso de cantidad
        document.getElementById('dish-selection-step').style.display = 'none';
        document.getElementById('quantity-selection-step').style.display = 'block';
    },
    
    changeTicketItemQuantity: function(change) {
        var quantityDisplay = document.getElementById('item-quantity-display');
        var currentQty = parseInt(quantityDisplay.textContent);
        var newQty = Math.max(1, currentQty + change);
        
        quantityDisplay.textContent = newQty;
        this.state.selectedTicketItem.quantity = newQty;
    },
    
    addItemToTicket: function() {
        var notes = document.getElementById('item-notes-input').value;
        this.state.selectedTicketItem.notes = notes;
        
        // Agregar al ticket actual
        this.state.ticketItems.push({
            category: this.state.selectedTicketItem.category,
            dish: this.state.selectedTicketItem.dish,
            quantity: this.state.selectedTicketItem.quantity,
            notes: this.state.selectedTicketItem.notes,
            isSpecialCombo: (this.state.selectedTicketItem.category === 'combos' && 
                           Avika.config.specialCombos.indexOf(this.state.selectedTicketItem.dish) !== -1)
        });
        
        // Actualizar lista de items
        this.updateTicketItemsList();
        
        // Cerrar modal de selección
        document.getElementById('item-selection-modal').style.display = 'none';
        
        // Habilitar botón de guardar si hay items
        document.getElementById('btn-save-ticket').disabled = false;
    },
    
    updateTicketItemsList: function() {
        var container = document.getElementById('ticket-items-list');
        container.innerHTML = '';
        
        this.state.ticketItems.forEach(function(item, index) {
            var itemElement = document.createElement('div');
            itemElement.className = 'ticket-item';
            itemElement.innerHTML = `
                <div class="ticket-item-info">
                    <span class="ticket-item-name">${item.dish} ${item.quantity > 1 ? '(' + item.quantity + ')' : ''}</span>
                    <span class="ticket-item-category">${Avika.config.categoryNames[item.category]}</span>
                    ${item.notes ? '<span class="ticket-item-notes">Notas: ' + item.notes + '</span>' : ''}
                </div>
                <button class="ticket-item-remove" data-index="${index}">×</button>
            `;
            container.appendChild(itemElement);
        });
        
        // Actualizar contador
        document.getElementById('ticket-count').textContent = this.state.ticketItems.length;
        
        // Agregar eventos para remover items
        var removeBtns = container.querySelectorAll('.ticket-item-remove');
        removeBtns.forEach(function(btn) {
            btn.onclick = function() {
                var index = parseInt(this.getAttribute('data-index'));
                Avika.ui.removeTicketItem(index);
            };
        });
    },
    
    removeTicketItem: function(index) {
        this.state.ticketItems.splice(index, 1);
        this.updateTicketItemsList();
        
        // Deshabilitar botón de guardar si no hay items
        document.getElementById('btn-save-ticket').disabled = (this.state.ticketItems.length === 0);
    },
    
    saveTicket: function() {
        // Deshabilitar botón inmediatamente para evitar múltiples envíos
        var saveButton = document.getElementById('btn-save-ticket');
        if (saveButton) {
            saveButton.disabled = true;
        }
        
        // Validar que haya platillos en el ticket
        if (!this.state.ticketItems || this.state.ticketItems.length === 0) {
            this.showNotification('El ticket debe contener al menos un platillo');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        // Obtener datos del ticket
        var ticketTime = new Date();
        
        // Obtener hora seleccionada con validación
        var hourElement = document.getElementById('ticket-hour');
        var minuteElement = document.getElementById('ticket-minute');
        
        if (!hourElement || !minuteElement) {
            this.showNotification('Error al obtener la hora seleccionada');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        var hour = parseInt(hourElement.value);
        var minute = parseInt(minuteElement.value);
        
        // Validar valores
        if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
            this.showNotification('Por favor ingrese valores válidos para la hora');
            if (saveButton) {
                saveButton.disabled = false;
            }
            return;
        }
        
        // Establecer hora y minutos
        ticketTime.setHours(hour);
        ticketTime.setMinutes(minute);
        ticketTime.setSeconds(0);
        
        var ticketService = this.state.ticketService || 'comedor';
        var ticketNotes = document.getElementById('ticket-notes-input')?.value || '';
        
        // Validar que haya una fecha válida
        if (isNaN(ticketTime.getTime())) {
            this.showNotification('Por favor ingrese una hora válida');
            if (saveButton) {
                saveButton.disabled = false; // Re-habilitar el botón si hay error
            }
            return;
        }
        
        // Generar un ID de ticket único para agrupar los platillos
        var ticketId = 'ticket-' + Date.now();
        
        try {
            // Procesar cada item del ticket
            this.state.ticketItems.forEach(function(item) {
                var preparation = {
                    id: Date.now().toString() + Math.floor(Math.random() * 1000),
                    ticketId: ticketId, // Añadir ID del ticket para agrupar
                    dish: item.dish,
                    category: item.category,
                    categoryDisplay: Avika.config.categoryNames[item.category],
                    quantity: item.quantity,
                    customizations: [],
                    serviceType: ticketService,
                    notes: item.notes + (ticketNotes ? ' | ' + ticketNotes : ''),
                    startTime: ticketTime,
                    startTimeFormatted: Avika.ui.formatTime(ticketTime),
                    isSpecialCombo: item.isSpecialCombo,
                    isFromTicket: true,
                    finished: false, // Asegurarnos que comienza como no terminado
                    allTicketItemsFinished: false // Inicializar como no terminado
                };
                
                if (item.isSpecialCombo) {
                    preparation.hotKitchenFinished = false;
                    preparation.coldKitchenFinished = false;
                }
                
                // Crear una copia para evitar referencias directas
                Avika.data.pendingOrders.push(JSON.parse(JSON.stringify(preparation)));
            });
            
            // Actualizar la UI
            Avika.ui.updatePendingTable();
            Avika.storage.guardarDatosLocales();
            
            // Mostrar notificación
            this.showNotification('Ticket agregado con ' + this.state.ticketItems.length + ' platillos');
            
            // Cerrar modal - Primero verificar que todavía existe
            var modal = document.getElementById('ticket-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Restablecer estado
            this.state.ticketMode = false;
            this.state.ticketItems = [];
            
        } catch (error) {
            // Capturar cualquier error y mostrar una notificación
            console.error('Error al guardar ticket:', error);
            this.showNotification('Error al guardar ticket: ' + (error.message || 'Error desconocido'));
            
            // Re-habilitar el botón si hay error
            if (saveButton) {
                saveButton.disabled = false;
            }
        }
    },
    
    cancelTicket: function() {
        document.getElementById('ticket-modal').style.display = 'none';
        this.state.ticketMode = false;
        this.state.ticketItems = [];
    },

    // Función para forzar a completar un ticket entero (desbloquear tickets atorados)
    forceCompleteTicket: function(ticketId) {
        var ticketItems = [];
        var itemsToRemove = [];
        
        // Encontrar todos los elementos del ticket
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                // Marcar todos los platillos como terminados
                item.finished = true;
                item.allItemsFinished = true;
                item.allTicketItemsFinished = true;
                item.kitchenFinished = true;
                
                if (item.isSpecialCombo) {
                    item.hotKitchenFinished = true;
                    item.coldKitchenFinished = true;
                }
                
                // Si no tiene ya un tiempo de finalización, establecerlo
                if (!item.finishTime) {
                    item.finishTime = new Date();
                    item.finishTimeFormatted = this.formatTime(item.finishTime);
                }
                
                // Si es domicilio o para llevar, preparar para la entrega
                if (item.serviceType === 'domicilio' || item.serviceType === 'para-llevar') {
                    item.readyForDelivery = true;
                }
                
                ticketItems.push(item);
            }
        }
        
        this.showNotification('Ticket desbloqueado: ' + ticketItems.length + ' platillos marcados como terminados. Este procedimiento debe usarse solo en casos excepcionales.');
        this.updatePendingTable();
        Avika.storage.guardarDatosLocales();
    },
    
    // Función para mostrar el modal de selección de ticket a desbloquear
    showForceCompleteModal: function() {
        // Crear el modal si no existe
        var modal = document.getElementById('force-complete-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'force-complete-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Desbloquear Ticket (Emergencia)</h2>
                    <p>Esta función es para situaciones excepcionales donde un ticket quedó "atorado" por algún error.</p>
                    <p><strong>Nota importante:</strong> Normalmente, el botón "Salida del Repartidor" aparece automáticamente una vez que todos los platillos del ticket están marcados como terminados.</p>
                    <p>Esta función solo debe usarse cuando por alguna razón el flujo normal falló y necesita desbloquear un ticket.</p>
                    <div id="ticket-list" class="ticket-list-container"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Evento para cerrar modal
            var closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Llenar la lista de tickets pendientes
        var ticketListContainer = document.getElementById('ticket-list');
        ticketListContainer.innerHTML = '';
        
        var uniqueTickets = {};
        
        // Recopilar tickets únicos
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var order = Avika.data.pendingOrders[i];
            if (order.ticketId && !uniqueTickets[order.ticketId]) {
                uniqueTickets[order.ticketId] = {
                    ticketId: order.ticketId,
                    serviceType: order.serviceType,
                    startTime: order.startTimeFormatted
                };
            }
        }
        
        // Crear botones para cada ticket
        var ticketCount = 0;
        for (var tid in uniqueTickets) {
            var ticket = uniqueTickets[tid];
            ticketCount++;
            
            var ticketItem = document.createElement('div');
            ticketItem.className = 'force-ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-info">
                    <span class="ticket-id">Ticket #${ticketCount}</span>
                    <span class="ticket-details">${Avika.config.serviceNames[ticket.serviceType]} - ${ticket.startTime}</span>
                </div>
                <button class="force-complete-btn" data-ticket-id="${ticket.ticketId}">Desbloquear</button>
            `;
            ticketListContainer.appendChild(ticketItem);
        }
        
        // Si no hay tickets, mostrar mensaje
        if (ticketCount === 0) {
            ticketListContainer.innerHTML = '<p>No hay tickets pendientes para desbloquear</p>';
        } else {
            // Agregar eventos a los botones
            var buttons = ticketListContainer.querySelectorAll('.force-complete-btn');
            buttons.forEach(function(btn) {
                btn.onclick = function() {
                    var ticketId = this.getAttribute('data-ticket-id');
                    Avika.ui.forceCompleteTicket(ticketId);
                    modal.style.display = 'none';
                };
            });
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
    },

    // Crear filas secundarias para los platillos de un ticket
    createTicketChildRows: function(ticketId, parentRow) {
        var childItems = [];
        
        // Recopilar todos los platillos del mismo ticket
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                childItems.push(item);
            }
        }
        
        // Verificar si todos los platillos del ticket están terminados
        var allTicketItemsFinished = childItems.every(function(item) {
            if (item.isSpecialCombo) {
                return item.hotKitchenFinished && item.coldKitchenFinished;
            } else {
                return item.finished;
            }
        });
        
        // Actualizar la propiedad allTicketItemsFinished en todos los platillos del ticket
        for (var i = 0; i < childItems.length; i++) {
            childItems[i].allTicketItemsFinished = allTicketItemsFinished;
        }
        
        // Crear y agregar las filas secundarias
        var fragment = document.createDocumentFragment();
        var table = parentRow.parentElement;
        
        for (var i = 0; i < childItems.length; i++) {
            var item = childItems[i];
            var childRow = this.createTicketChildRow(item, allTicketItemsFinished);
            childRow.classList.add('ticket-item-row');
            childRow.style.display = this.state.expandedTickets[ticketId] ? 'table-row' : 'none';
            fragment.appendChild(childRow);
        }
        
        // Insertar después del encabezado del ticket
        if (parentRow.nextElementSibling) {
            table.insertBefore(fragment, parentRow.nextElementSibling);
        } else {
            table.appendChild(fragment);
        }
    },

    // Crear fila para un platillo individual dentro de un ticket
    createTicketChildRow: function(item, allTicketItemsFinished) {
        var row = document.createElement('tr');
        
        // Celda del platillo
        var dishCell = document.createElement('td');
        dishCell.textContent = item.dish + (item.quantity > 1 ? ' (' + item.quantity + ')' : '');
        row.appendChild(dishCell);
        
        // Celda de inicio
        var startCell = document.createElement('td');
        startCell.textContent = item.startTimeFormatted;
        row.appendChild(startCell);
        
        // Celda de tiempo transcurrido o tiempo de preparación individual si ya está terminado
        var timerCell = document.createElement('td');
        timerCell.className = 'timer-cell';
        if (item.finished || (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
            timerCell.textContent = item.individualPrepTime || '--:--';
            timerCell.classList.add('finished-time');
        } else {
            timerCell.textContent = '00:00';
        }
        row.appendChild(timerCell);
        
        // Celda de detalles
        var detailsCell = document.createElement('td');
        var details = '';
        
        // Mostrar estado del platillo individual
        if (item.isSpecialCombo) {
            if (item.hotKitchenFinished) details += "✓ Cocina Caliente, ";
            else details += "⚪ Cocina Caliente, ";
            
            if (item.coldKitchenFinished) details += "✓ Cocina Fría";
            else details += "⚪ Cocina Fría";
        } else {
            if (item.finished) details += "✓ Terminado";
            else if (item.kitchenFinished) details += "✓ Listo en cocina";
            else details += "⚪ En preparación";
        }
        
        if (item.customizations && item.customizations.length > 0) {
            details += ', ' + item.customizations.map(function(code) {
                return Avika.config.customizationOptions[code] || code;
            }).join(', ');
        }
        
        if (item.notes) {
            details += ' - ' + item.notes;
        }
        
        // Añadir información sobre el ticket
        details += ' | Parte de ticket';
        if (allTicketItemsFinished) {
            details += ' (Listo para entrega)';
        }
        
        detailsCell.textContent = details;
        row.appendChild(detailsCell);
        
        // Celda de acción para el platillo individual
        var actionCell = document.createElement('td');
        actionCell.className = 'action-cell';
        
        // Mostrar acción de salida/entrega en el nivel de ticket si todos los platillos están listos
        if (allTicketItemsFinished) {
            // Si es domicilio o para llevar, mostrar botones correspondientes
            if ((item.serviceType === 'domicilio' || item.serviceType === 'para-llevar')) {
                var ticketBtnGroup = document.createElement('div');
                ticketBtnGroup.style.display = 'flex';
                ticketBtnGroup.style.flexDirection = 'column';
                ticketBtnGroup.style.gap = '5px';
                
                // Si no ha salido el repartidor aún
                if (!item.deliveryDepartureTime) {
                    var departureBtn = document.createElement('button');
                    departureBtn.className = 'finish-btn delivery';
                    departureBtn.textContent = 'Salida del Repartidor';
                    departureBtn.onclick = (function(orderId) {
                        return function(e) {
                            e.stopPropagation(); // Evitar que el clic llegue a la fila
                            Avika.orders.markDeliveryDeparture(orderId);
                        };
                    })(item.id);
                    ticketBtnGroup.appendChild(departureBtn);
                }
                // Si ya se registró la salida pero no la entrega
                else if (!item.deliveryArrivalTime) {
                    var arrivalBtn = document.createElement('button');
                    arrivalBtn.className = 'finish-btn delivery-arrived';
                    arrivalBtn.textContent = 'Entrega de Pedido';
                    arrivalBtn.onclick = function() {
                        Avika.orders.markDeliveryArrival(item.id);
                    };
                    ticketBtnGroup.appendChild(arrivalBtn);
                }
                
                actionCell.appendChild(ticketBtnGroup);
            }
            // Para platillos de comedor, el botón de completar aparece solo en el encabezado
            else {
                // Mostrar estado terminado
                var doneLabel = document.createElement('span');
                doneLabel.className = 'done-status';
                doneLabel.textContent = 'Listo';
                actionCell.appendChild(doneLabel);
            }
        }
        // Si el platillo no está terminado, mostrar botones para marcar como terminado
        else if (item.isSpecialCombo && (!item.hotKitchenFinished || !item.coldKitchenFinished)) {
            var buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.flexDirection = 'column';
            buttonGroup.style.gap = '5px';
            
            if (!item.hotKitchenFinished) {
                var hotKitchenBtn = document.createElement('button');
                hotKitchenBtn.className = 'finish-btn hot-kitchen';
                hotKitchenBtn.textContent = 'Cocina Caliente';
                hotKitchenBtn.onclick = (function(orderId) {
                    return function(e) {
                        e.stopPropagation(); // Evitar que el clic llegue a la fila
                        Avika.orders.finishHotKitchen(orderId);
                    };
                })(item.id);
                buttonGroup.appendChild(hotKitchenBtn);
            }
            
            if (!item.coldKitchenFinished) {
                var coldKitchenBtn = document.createElement('button');
                coldKitchenBtn.className = 'finish-btn cold-kitchen';
                coldKitchenBtn.textContent = 'Cocina Fría';
                coldKitchenBtn.onclick = (function(orderId) {
                    return function(e) {
                        e.stopPropagation(); // Evitar que el clic llegue a la fila
                        Avika.orders.finishColdKitchen(orderId);
                    };
                })(item.id);
                buttonGroup.appendChild(coldKitchenBtn);
            }
            
            actionCell.appendChild(buttonGroup);
        } 
        // Para platillos normales que no están terminados
        else if (!item.finished) {
            var finishBtn = document.createElement('button');
            finishBtn.className = 'finish-btn';
            finishBtn.textContent = 'Listo';
            finishBtn.onclick = (function(orderId) {
                return function(e) {
                    e.stopPropagation(); // Evitar que el clic llegue a la fila
                    Avika.orders.finishIndividualItem(orderId);
                };
            })(item.id);
            actionCell.appendChild(finishBtn);
        }
        // Si el platillo ya está terminado pero el ticket aún no está completo
        else {
            var ticketLabel = document.createElement('span');
            ticketLabel.className = 'done-status';
            ticketLabel.textContent = 'Terminado';
            actionCell.appendChild(ticketLabel);
        }
        
        row.appendChild(actionCell);
        
        return row;
    }
};