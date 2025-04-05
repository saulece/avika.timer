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
        console.log("Mostrando sección:", sectionId);
        
        // Verificar que el ID de sección es válido
        if (!sectionId) {
            console.error("Error: No se proporcionó un ID de sección.");
            return;
        }
        
        // Ocultar todas las secciones primero
        var sectionsToHide = ['categories-section', 'dishes-section', 'preparation-section'];
        sectionsToHide.forEach(function(id) {
            var section = document.getElementById(id);
            if (section) {
                section.style.display = 'none';
                console.log("Sección " + id + " ocultada");
            } else {
                console.warn("No se encontró la sección:", id);
            }
        });
        
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
            
            // Verificación adicional para preparation-section
            if (sectionId === 'preparation-section') {
                var selectedDishTitle = document.getElementById('selected-dish-title');
                if (selectedDishTitle) {
                    console.log("Título de platillo seleccionado:", selectedDishTitle.textContent);
                } else {
                    console.error("No se encontró el elemento #selected-dish-title");
                }
                
                var quantityDisplay = document.getElementById('quantity-display');
                if (quantityDisplay) {
                    console.log("Cantidad mostrada:", quantityDisplay.textContent);
                } else {
                    console.error("No se encontró el elemento #quantity-display");
                }
                
                var btnStart = document.getElementById('btn-start');
                if (btnStart) {
                    console.log("Botón iniciar encontrado:", btnStart.outerHTML);
                } else {
                    console.error("No se encontró el botón #btn-start");
                }
            }
        } else {
            console.error("Sección no encontrada:", sectionId);
            this.showNotification("Error: No se pudo mostrar la sección " + sectionId);
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
    
    showErrorMessage: function(message) {
        console.error("Error:", message);
        
        // Buscar o crear un elemento para mostrar errores
        var errorContainer = document.getElementById('error-message');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-message';
            errorContainer.style.position = 'fixed';
            errorContainer.style.top = '20%';
            errorContainer.style.left = '50%';
            errorContainer.style.transform = 'translateX(-50%)';
            errorContainer.style.backgroundColor = '#f44336';
            errorContainer.style.color = 'white';
            errorContainer.style.padding = '15px 20px';
            errorContainer.style.borderRadius = '5px';
            errorContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            errorContainer.style.zIndex = '9999';
            errorContainer.style.maxWidth = '80%';
            errorContainer.style.textAlign = 'center';
            document.body.appendChild(errorContainer);
        }
        
        // Colocar un botón de cierre
        errorContainer.innerHTML = '<span id="close-error" style="position:absolute;right:10px;top:10px;cursor:pointer;font-weight:bold;">&times;</span>' +
                                   '<p style="margin:5px 0;">' + message + '</p>';
        
        // Mostrar el error
        errorContainer.style.display = 'block';
        
        // Configurar cierre
        var closeBtn = document.getElementById('close-error');
        if (closeBtn) {
            closeBtn.onclick = function() {
                errorContainer.style.display = 'none';
            };
        }
        
        // Auto-ocultar después de un tiempo
        setTimeout(function() {
            if (errorContainer) {
                errorContainer.style.display = 'none';
            }
        }, 8000);
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
        console.log("Seleccionando categoría:", category);
        
        // Validar categoría
        if (!category) {
            console.error("Error: Categoría no válida");
            this.showNotification("Error: Categoría no válida");
            return;
        }
        
        try {
            // Actualizar estado
        Avika.data.currentCategory = category;
            
            // Verificar que existe el elemento del título
            var categoryTitle = document.getElementById('selected-category-title');
            if (categoryTitle) {
                categoryTitle.textContent = Avika.config.categoryNames[category] || category;
            } else {
                console.warn("Elemento selected-category-title no encontrado");
            }
        
        var dishesContainer = document.getElementById('dishes-container');
            if (!dishesContainer) {
                console.error("Contenedor de platillos no encontrado");
                this.showNotification("Error: No se pudo mostrar la categoría");
                return;
            }
            
        // Limpiar el contenedor completamente
        dishesContainer.innerHTML = '';
        
        // Verificar si hay datos de platillos
        if (!Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
            dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
            this.showSection('dishes-section');
            return;
        }
        
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
        
        // Crear un contenedor con estilo cuadrícula para los botones
        var gridContainer = document.createElement('div');
        gridContainer.className = 'dishes-grid-container';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(170px, 1fr))';
        gridContainer.style.gap = '10px';
        gridContainer.style.padding = '15px';
        dishesContainer.appendChild(gridContainer);
        
        // Verificar si hay subcategorías configuradas para esta categoría
        if (Avika.config.subCategories && 
            Avika.config.subCategories[category] && 
            Avika.config.subCategories[category].length > 0) {
            
            console.log("Procesando subcategorías para:", category);
            
            // Crear contenedor para subcategorías
            var subCategoriesContainer = document.createElement('div');
            subCategoriesContainer.className = 'subcategories-container';
            subCategoriesContainer.style.marginBottom = '15px';
            
            // Añadir botón para "Todos los platillos"
            var allButton = document.createElement('button');
            allButton.className = 'subcategory-btn active';
            allButton.textContent = 'Todos los platillos';
            allButton.style.padding = '8px 12px';
            allButton.style.margin = '0 5px 5px 0';
            allButton.style.borderRadius = '4px';
            allButton.onclick = function() {
                Avika.ui.selectSubCategory(category, null, gridContainer);
                
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
                button.style.padding = '8px 12px';
                button.style.margin = '0 5px 5px 0';
                button.style.borderRadius = '4px';
                button.onclick = function() {
                    Avika.ui.selectSubCategory(category, subcat, gridContainer);
                    
                    // Marcar este botón como activo
                    var buttons = subCategoriesContainer.querySelectorAll('.subcategory-btn');
                    buttons.forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                };
                subCategoriesContainer.appendChild(button);
            });
            
            // Añadir el contenedor de subcategorías antes de la cuadrícula
            dishesContainer.insertBefore(subCategoriesContainer, gridContainer);
            
            // Mostrar todos los platillos inicialmente
            this.selectSubCategory(category, null, gridContainer);
        } else {
            // Si no hay subcategorías, mostrar todos los platillos directamente
            console.log("Mostrando todos los platillos para:", category);
            
            // Añadir todos los platillos como botones
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = this.createCompactDishButton(dish, category);
                gridContainer.appendChild(button);
            }
        }
        
        // Asegurarse de que se muestre la sección correcta
        this.showSection('dishes-section');
        console.log("Sección de platillos mostrada");
        } catch (e) {
            console.error("Error al seleccionar categoría:", e);
            this.showNotification("Error al mostrar categoría: " + e.message);
        }
    },
    
    // Función auxiliar para crear botones de platillos más compactos
    createCompactDishButton: function(dish, category) {
        var button = document.createElement('button');
        button.className = 'dish-btn';
        button.setAttribute('data-dish', dish.toLowerCase());
        
        // Estilos para hacer el botón más compacto
        button.style.padding = '12px 8px';
        button.style.fontSize = '0.9rem';
        button.style.height = 'auto';
        button.style.minHeight = '50px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.textAlign = 'center';
        button.style.borderRadius = '6px';
        button.style.wordBreak = 'break-word';
        
        if (category === 'combos' && Avika.config.specialCombos && Avika.config.specialCombos.indexOf(dish) !== -1) {
            button.className += ' special-combo';
        }
        
        button.textContent = dish;
        
        // Usar addEventListener en lugar de onclick
        button.addEventListener('click', function() {
            console.log("Clic en botón de platillo:", dish);
            Avika.ui.selectDish(dish);
        });
        
        return button;
    },
    
    // Función para seleccionar una subcategoría
    selectSubCategory: function(category, subcategory, container) {
        console.log("Seleccionando subcategoría:", subcategory ? subcategory.name : "Todos");
        
        this.state.currentSubCategory = subcategory;
        
        // Si no se proporciona un contenedor, usar el predeterminado
        var dishesContainer = container || document.querySelector('.dishes-grid-container');
        if (!dishesContainer) {
            console.error("No se encontró el contenedor de platillos");
            return;
        }
        
        // Limpiar contenedor
        dishesContainer.innerHTML = '';
        
        // Si se seleccionó una subcategoría específica
        if (subcategory) {
            console.log("Mostrando platillos de subcategoría:", subcategory.name);
            
            // Mostrar solo los platillos de esta subcategoría
            subcategory.items.forEach(function(dish) {
                var button = Avika.ui.createCompactDishButton(dish, category);
                dishesContainer.appendChild(button);
            });
        } else {
            console.log("Mostrando todos los platillos de la categoría:", category);
            
            // Si se seleccionó "Todos", mostrar todos los platillos de la categoría
            if (!Avika.config.dishes[category]) {
                console.error("No se encontraron platillos para la categoría:", category);
                return;
            }
            
            for (var i = 0; i < Avika.config.dishes[category].length; i++) {
                var dish = Avika.config.dishes[category][i];
                var button = Avika.ui.createCompactDishButton(dish, category);
                dishesContainer.appendChild(button);
            }
        }
        
        console.log("Platillos añadidos:", dishesContainer.children.length);
    },
    
    // Función para filtrar platillos por búsqueda
    filterDishes: function(searchText) {
        console.log("Filtrando platillos con texto:", searchText);
        var buttons = document.querySelectorAll('.dish-btn');
        var found = false;
        
        buttons.forEach(function(button) {
            var dishName = button.getAttribute('data-dish');
            if (!dishName) {
                console.warn("Botón sin atributo data-dish:", button.textContent);
                // Usar el texto del botón como alternativa
                dishName = button.textContent || "";
            }
            
            // Convertir ambos a minúsculas para una comparación insensible a mayúsculas/minúsculas
            if (dishName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
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
                
                var container = document.querySelector('.dishes-grid-container');
                if (container) {
                    container.parentNode.insertBefore(noResultsMsg, container.nextSibling);
                }
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },

    selectDish: function(dish) {
        console.log("Seleccionando platillo:", dish);
        
        try {
            // Verificar que hay un platillo seleccionado
            if (!dish) {
                console.error("Error: No se proporcionó un platillo para seleccionar.");
                return;
            }
            
            // Actualizar el estado
            Avika.data.currentDish = dish;
            
            // Verificar que existe el elemento del título
            var dishTitle = document.getElementById('selected-dish-title');
            if (!dishTitle) {
                console.error("Error: No se encontró el elemento #selected-dish-title");
                return;
            }
            
            // Actualizar el título
            dishTitle.textContent = dish;
            
            // Verificar si es combo especial
            Avika.data.isSpecialCombo = (Avika.config.specialCombos && 
                                         Avika.config.specialCombos.indexOf(dish) !== -1);
            
            // Resetear opciones
            this.resetOptions();
            
            // Actualizar opciones de personalización
            this.updatePersonalizationOptions();
            
            // Cambiar a la sección de preparación
            console.log("Cambiando a sección preparation-section");
            this.showSection('preparation-section');
        } catch (e) {
            console.error("Error al seleccionar platillo:", e);
            this.showNotification("Error al seleccionar platillo: " + e.message);
        }
    },

    resetOptions: function() {
        // Limpiar personalización
        Avika.data.currentCustomizations = [];
        
        // Resetear servicio
        var btnComedor = document.getElementById('btn-comedor');
        var btnDomicilio = document.getElementById('btn-domicilio');
        var btnParaLlevar = document.getElementById('btn-para-llevar');
        var quantityDisplay = document.getElementById('quantity-display');
        var notesInput = document.getElementById('notes-input');
        
        // Actualizar los elementos solo si existen
        if (btnComedor) btnComedor.classList.add('selected');
        if (btnDomicilio) btnDomicilio.classList.remove('selected');
        if (btnParaLlevar) btnParaLlevar.classList.remove('selected');
        
        // Actualizar el estado
        Avika.data.currentService = 'comedor';
        
        // Resetear cantidad
        Avika.data.currentQuantity = 1;
        if (quantityDisplay) quantityDisplay.textContent = '1';
        
        // Limpiar notas
        if (notesInput) notesInput.value = '';
    },

    updatePersonalizationOptions: function() {
        var container = document.getElementById('customization-container');
        if (!container) {
            console.error("No se encontró el contenedor de personalizaciones #customization-container");
            return;
        }
        
        container.innerHTML = '';
        
        if (Avika.data.currentCategory === 'combos') {
            var optionGroup = document.getElementById('customization-options');
            if (optionGroup) {
                optionGroup.style.display = 'none';
            }
            return;
        }
        
        var optionGroup = document.getElementById('customization-options');
        if (optionGroup) {
            optionGroup.style.display = 'block';
        }
        
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
        console.log("Seleccionando servicio:", service);
        
        // Verificar que existan los elementos
        var btnComedor = document.getElementById('btn-comedor');
        var btnDomicilio = document.getElementById('btn-domicilio');
        var btnParaLlevar = document.getElementById('btn-para-llevar');
        
        // Remover clases solo si los elementos existen
        if (btnComedor) btnComedor.classList.remove('selected');
        if (btnDomicilio) btnDomicilio.classList.remove('selected');
        if (btnParaLlevar) btnParaLlevar.classList.remove('selected');
        
        // Añadir clase al botón actual
        if (button) button.classList.add('selected');
        
        // Actualizar el estado
        Avika.data.currentService = service;
    },

    // Cambiar la cantidad para platillos
    changeQuantity: function(change) {
        console.log("Cambiando cantidad:", change);
        
        // Actualizar valor en el objeto de datos
        Avika.data.currentQuantity = Math.max(1, Avika.data.currentQuantity + change);
        
        // Actualizar el texto en el elemento de la interfaz si existe
        var quantityDisplay = document.getElementById('quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = Avika.data.currentQuantity;
        } else {
            console.warn("Elemento quantity-display no encontrado");
        }
    },

    // Inicializar esta función antes de startPreparation
    showTimeSelector: function(callback) {
        // Crear modal si no existe
        var timeSelectorModal = document.getElementById('time-selector-modal');
        if (!timeSelectorModal) {
            timeSelectorModal = document.createElement('div');
            timeSelectorModal.id = 'time-selector-modal';
            timeSelectorModal.className = 'modal';
                
                var modalContent = document.createElement('div');
                modalContent.className = 'modal-content';
            modalContent.style.maxWidth = '400px';
                
                // Botón para cerrar
                var closeBtn = document.createElement('span');
                closeBtn.className = 'close-modal';
                closeBtn.innerHTML = '&times;';
                closeBtn.onclick = function() {
                timeSelectorModal.style.display = 'none';
                };
                
                // Título
                var title = document.createElement('h2');
            title.textContent = 'Seleccionar hora de entrada';
            
            // Contenedor de inputs
            var timeInputContainer = document.createElement('div');
            timeInputContainer.style.display = 'flex';
            timeInputContainer.style.justifyContent = 'center';
            timeInputContainer.style.marginBottom = '20px';
            
            // Hora actual
            var now = new Date();
            
            // Input de horas
            var hoursInput = document.createElement('input');
            hoursInput.type = 'number';
            hoursInput.min = '0';
            hoursInput.max = '23';
            hoursInput.value = now.getHours();
            hoursInput.style.width = '60px';
            hoursInput.style.textAlign = 'center';
            hoursInput.style.fontSize = '24px';
            hoursInput.style.margin = '0 5px';
            
            // Input de minutos
            var minutesInput = document.createElement('input');
            minutesInput.type = 'number';
            minutesInput.min = '0';
            minutesInput.max = '59';
            minutesInput.value = now.getMinutes();
            minutesInput.style.width = '60px';
            minutesInput.style.textAlign = 'center';
            minutesInput.style.fontSize = '24px';
            minutesInput.style.margin = '0 5px';
            
            // Separador
            var separator = document.createElement('span');
            separator.textContent = ':';
            separator.style.fontSize = '24px';
            separator.style.margin = '0 5px';
            
            // Añadir elementos al contenedor
            timeInputContainer.appendChild(hoursInput);
            timeInputContainer.appendChild(separator);
            timeInputContainer.appendChild(minutesInput);
                
                // Botones de acción
            var buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'space-between';
            
            // Botón para usar hora actual
            var currentTimeBtn = document.createElement('button');
            currentTimeBtn.textContent = 'Usar hora actual';
            currentTimeBtn.className = 'action-btn';
            currentTimeBtn.onclick = function() {
                var currentDate = new Date();
                if (callback) callback(currentDate);
                timeSelectorModal.style.display = 'none';
            };
            
            // Botón para confirmar
            var confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Confirmar';
            confirmBtn.className = 'action-btn start-btn';
            confirmBtn.onclick = function() {
                var hours = parseInt(hoursInput.value, 10);
                var minutes = parseInt(minutesInput.value, 10);
                
                // Validar valores
                if (isNaN(hours) || hours < 0 || hours > 23) {
                    alert('Por favor, ingresa una hora válida (0-23)');
                    return;
                }
                
                if (isNaN(minutes) || minutes < 0 || minutes > 59) {
                    alert('Por favor, ingresa minutos válidos (0-59)');
            return;
        }
        
                // Crear fecha con la hora seleccionada
                var selectedDate = new Date();
                selectedDate.setHours(hours, minutes, 0, 0);
                
                // Llamar al callback con la fecha seleccionada
                if (callback) callback(selectedDate);
                
                // Cerrar modal
                timeSelectorModal.style.display = 'none';
            };
            
            // Añadir botones al contenedor
            buttonsContainer.appendChild(currentTimeBtn);
            buttonsContainer.appendChild(confirmBtn);
                
                // Añadir elementos al modal
                modalContent.appendChild(closeBtn);
                modalContent.appendChild(title);
            modalContent.appendChild(timeInputContainer);
            modalContent.appendChild(buttonsContainer);
            
            timeSelectorModal.appendChild(modalContent);
            document.body.appendChild(timeSelectorModal);
        }
        
        // Actualizar valores de input con la hora actual
        var now = new Date();
        var hoursInput = timeSelectorModal.querySelector('input[type="number"][min="0"][max="23"]');
        var minutesInput = timeSelectorModal.querySelector('input[type="number"][min="0"][max="59"]');
        
        if (hoursInput) hoursInput.value = now.getHours();
        if (minutesInput) minutesInput.value = now.getMinutes();
        
        // Mostrar modal
        timeSelectorModal.style.display = 'block';
    },

    // Modificar startPreparation para permitir hora personalizada
    startPreparation: function() {
        const self = this; // Guardar referencia a this
        
        // Mostrar selector de tiempo
        this.showTimeSelector(function(selectedTime) {
            console.log("Iniciando preparación con hora:", selectedTime);
            
            try {
                // Obtener datos de personalización
                var customizationText = '';
                if (Avika.data.currentCustomizations && Avika.data.currentCustomizations.length > 0) {
                    Avika.data.currentCustomizations.forEach(function(code) {
                        if (Avika.config.customizationOptions[code]) {
                            customizationText += Avika.config.customizationOptions[code] + ', ';
                        }
                    });
                    customizationText = customizationText.slice(0, -2); // Eliminar la última coma y espacio
                }
                
                // Obtener notas
                var notes = '';
                var notesInput = document.getElementById('notes-input');
                if (notesInput) {
                    notes = notesInput.value.trim();
                }
                
                // Si estamos en modo ticket, agregar a la lista de items del ticket
                if (self.state.ticketMode) {
                    console.log("Agregando platillo al ticket actual");
                    
                    // Crear objeto para el item del ticket
                    var ticketItem = {
                        dish: Avika.data.currentDish,
                        quantity: Avika.data.currentQuantity,
                        customizations: Avika.data.currentCustomizations || [],
                        customizationText: customizationText,
                        notes: notes,
                        service: Avika.data.currentService,
                        startTime: selectedTime, // Usar la hora seleccionada
                        startTimeFormatted: Avika.ui.formatTime(selectedTime)
                    };
                    
                    // Agregar a la lista de items
                    self.state.ticketItems.push(ticketItem);
                    
                    // Actualizar tabla de items del ticket
                    self.updateTicketItems();
                    
                    // Actualizar el texto del botón de agregar
                    var addButton = document.getElementById('btn-add-to-ticket');
                    if (addButton) {
                        addButton.textContent = 'Agregar otro platillo';
                    }
                    
                    // Mostrar modal de ticket
                    var ticketModal = document.getElementById('ticket-modal');
                    if (ticketModal) {
                        ticketModal.style.display = 'block';
                    } else {
                        self.showErrorMessage("El modal del ticket no se pudo encontrar");
                    }
                    
                    // Mostrar notificación
                    self.showNotification("Platillo agregado al ticket");
                
                return;
            }
            
                // Si no estamos en modo ticket, crear un nuevo platillo individual
                var newOrder = {
                    dish: Avika.data.currentDish,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations || [],
                    notes: notes,
                    service: Avika.data.currentService,
                    startTime: selectedTime, // Usar la hora seleccionada
                    startTimeISO: selectedTime.toISOString(), // Guardar formato ISO para almacenamiento
                    finishTime: null,
                    status: 'pending'
                };
                
                // Guardar la orden en la lista de pendientes
                if (!Avika.data.pendingOrders) {
                    Avika.data.pendingOrders = [];
                }
                
                Avika.data.pendingOrders.push(newOrder);
                
                // Guardar datos localmente si está disponible
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Actualizar tabla de órdenes pendientes
                if (typeof self.updatePendingTable === 'function') {
                    self.updatePendingTable();
                } else {
                    console.error("Función updatePendingTable no encontrada");
                }
                
                // Volver a la sección de categorías
                self.showSection('categories-section');
                
                // Mostrar notificación
                self.showNotification("Platillo '" + Avika.data.currentDish + "' añadido a la lista de preparación");
                
            } catch (e) {
                console.error("Error al iniciar preparación:", e);
                self.showErrorMessage("Error al iniciar preparación: " + e.message);
            }
        });
    },
    
    // Actualizar tabla de items del ticket
    updateTicketItems: function() {
        console.log("Actualizando tabla de items del ticket");
        
        var ticketItemsBody = document.getElementById('ticket-items-body');
        if (!ticketItemsBody) {
            console.error("Elemento ticket-items-body no encontrado");
            return;
        }
        
        // Limpiar tabla
        ticketItemsBody.innerHTML = '';
        
        // Actualizar el texto del botón según si hay platillos o no
        var addButton = document.getElementById('btn-add-to-ticket');
        if (addButton) {
            if (Avika.ui.state.ticketItems.length === 0) {
                addButton.textContent = 'Agregar platillo';
            } else {
                addButton.textContent = 'Agregar otro platillo';
            }
        }
        
        // Si no hay items, mostrar mensaje
        if (Avika.ui.state.ticketItems.length === 0) {
            var row = ticketItemsBody.insertRow();
            var cell = row.insertCell(0);
            cell.colSpan = 4;
            cell.textContent = "No hay platillos en el ticket. Añade alguno primero.";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            return;
        }
        
        // Añadir cada item a la tabla
        Avika.ui.state.ticketItems.forEach(function(item, index) {
            var row = ticketItemsBody.insertRow();
            
            // Cantidad
            var quantityCell = row.insertCell(0);
            quantityCell.textContent = item.quantity;
            
            // Platillo
            var dishCell = row.insertCell(1);
            dishCell.textContent = item.dish;
            
            // Personalización y notas
            var customizationCell = row.insertCell(2);
            var customizationText = item.customizationText || '';
            if (item.notes) {
                if (customizationText) customizationText += ' + ';
                customizationText += 'Nota: ' + item.notes;
            }
            customizationCell.textContent = customizationText || '-';
            
            // Acciones
            var actionsCell = row.insertCell(3);
            var removeBtn = document.createElement('button');
            removeBtn.textContent = 'Eliminar';
            removeBtn.className = 'action-btn cancel-btn';
            removeBtn.style.padding = '5px 10px';
            removeBtn.style.fontSize = '0.8rem';
            
            removeBtn.onclick = function() {
                Avika.ui.removeTicketItem(index);
            };
            
            actionsCell.appendChild(removeBtn);
        });
    },
    
    // Eliminar item del ticket
    removeTicketItem: function(index) {
        console.log("Eliminando item del ticket:", index);
        
        // Eliminar item del array
        if (index >= 0 && index < Avika.ui.state.ticketItems.length) {
            Avika.ui.state.ticketItems.splice(index, 1);
            
            // Actualizar tabla
            Avika.ui.updateTicketItems();
            
            // Mostrar notificación
            Avika.ui.showNotification("Platillo eliminado del ticket");
        }
    },

    // Actualizar tabla de órdenes pendientes
    updatePendingTable: function() {
        console.log("Actualizando tabla de órdenes pendientes");
        
        var pendingBody = document.getElementById('pending-body');
        if (!pendingBody) {
            console.error("Elemento pending-body no encontrado");
            return;
        }
        
        // Limpiar tabla
        pendingBody.innerHTML = '';
        
        // Verificar si hay órdenes pendientes
        if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            var row = pendingBody.insertRow();
            var cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = "No hay platillos en preparación";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            
            // Actualizar contador
            var pendingCount = document.getElementById('pending-count');
            if (pendingCount) {
                pendingCount.textContent = "0";
            }
            
            return;
        }
        
        // Agrupar órdenes por ticket ID para colapsarlas si pertenecen al mismo ticket
        var ticketGroups = {};
        var singleOrders = [];
        
        Avika.data.pendingOrders.forEach(function(order, index) {
            if (order.ticketId) {
                if (!ticketGroups[order.ticketId]) {
                    ticketGroups[order.ticketId] = {
                        items: [],
                        created: order.startTime
                    };
                }
                ticketGroups[order.ticketId].items.push({order: order, index: index});
            } else {
                singleOrders.push({order: order, index: index});
            }
        });
        
        // Añadir órdenes individuales
        singleOrders.forEach(function(item) {
            this.addOrderRow(pendingBody, item.order, item.index);
        }, this);
        
        // Añadir tickets
        for (var ticketId in ticketGroups) {
            if (ticketGroups.hasOwnProperty(ticketId)) {
                this.addTicketRows(pendingBody, ticketId, ticketGroups[ticketId]);
            }
        }
        
        // Actualizar contador
        var pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = Avika.data.pendingOrders.length.toString();
        }
    },
    
    // Añadir filas para un ticket
    addTicketRows: function(tbody, ticketId, ticketGroup) {
        var self = this;
        
        // Crear fila principal para el ticket
        var headerRow = tbody.insertRow();
        headerRow.className = 'ticket-header-row';
        
        // Nombre del ticket (primer columna)
        var ticketCell = headerRow.insertCell(0);
        ticketCell.colSpan = 5;
        ticketCell.style.backgroundColor = '#f8f9fa';
        ticketCell.style.fontWeight = 'bold';
        
        // Crear contenedor para ticket header con estilo flexible
        var ticketHeader = document.createElement('div');
        ticketHeader.style.display = 'flex';
        ticketHeader.style.justifyContent = 'space-between';
        ticketHeader.style.alignItems = 'center';
        ticketHeader.style.padding = '8px';
        
        // Información del ticket
        var ticketInfo = document.createElement('div');
        ticketInfo.innerHTML = 'Ticket #' + ticketId.replace('ticket-', '') + 
                              ' <span class="badge">' + ticketGroup.items.length + ' platillos</span>';
        
        // Botón para expandir/colapsar
        var expandBtn = document.createElement('button');
        expandBtn.textContent = this.state.expandedTickets[ticketId] ? '▼ Colapsar' : '► Expandir';
        expandBtn.className = 'action-btn';
        expandBtn.style.padding = '5px 10px';
        expandBtn.style.fontSize = '0.8rem';
        
        expandBtn.onclick = function() {
            self.toggleTicketExpansion(ticketId);
        };
        
        // Añadir elementos al header
        ticketHeader.appendChild(ticketInfo);
        ticketHeader.appendChild(expandBtn);
        ticketCell.appendChild(ticketHeader);
        
        // Si el ticket está expandido, mostrar sus elementos
        if (this.state.expandedTickets[ticketId]) {
            ticketGroup.items.forEach(function(item) {
                var itemRow = tbody.insertRow();
                itemRow.className = 'ticket-item-row ticket-' + ticketId;
                
                // Platillo (con sangría)
                var dishCell = itemRow.insertCell(0);
                dishCell.innerHTML = '<span style="margin-left: 20px;">• ' + item.order.dish + 
                                     (item.order.quantity > 1 ? ' (' + item.order.quantity + ')' : '') + '</span>';
                
                // Hora de inicio
                var startCell = itemRow.insertCell(1);
                startCell.textContent = self.formatTime(new Date(item.order.startTime));
                
                // Temporizador
                var timerCell = itemRow.insertCell(2);
                timerCell.className = 'timer-cell';
                timerCell.setAttribute('data-start-time', item.order.startTime);
                timerCell.textContent = self.calculateElapsedTime(item.order.startTime);
                
                // Detalles
                var detailsCell = itemRow.insertCell(3);
                
                // Servicio
                var serviceText = '';
                switch (item.order.service) {
                    case 'comedor': serviceText = 'Comedor'; break;
                    case 'domicilio': serviceText = 'Domicilio'; break;
                    case 'para-llevar': serviceText = 'Ordena y espera'; break;
                    default: serviceText = item.order.service;
                }
                
                // Personalización
                var customText = '';
                if (item.order.customizations && item.order.customizations.length > 0) {
                    item.order.customizations.forEach(function(code) {
                        if (Avika.config.customizationOptions[code]) {
                            customText += Avika.config.customizationOptions[code] + ', ';
                        }
                    });
                    customText = customText.slice(0, -2); // Eliminar última coma y espacio
                }
                
                // Notas
                var notesText = item.order.notes ? '<br>Nota: ' + item.order.notes : '';
                
                // Combinar toda la información
                detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                        (customText ? '<br>' + customText : '') + 
                                        notesText;
                
                // Acciones
                var actionsCell = itemRow.insertCell(4);
                
                // Botón para marcar como completado
                var completeBtn = document.createElement('button');
                completeBtn.textContent = 'Listo';
                completeBtn.className = 'action-btn';
                completeBtn.onclick = function() {
                    self.completeOrder(item.index);
                };
                actionsCell.appendChild(completeBtn);
                
            }, this);
        }
    },
    
    // Añadir fila para una orden individual
    addOrderRow: function(tbody, order, index) {
        var row = tbody.insertRow();
        
        // Platillo
        var dishCell = row.insertCell(0);
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        
        // Hora de inicio
        var startCell = row.insertCell(1);
        startCell.textContent = self.formatTime(new Date(order.startTime));
        
        // Temporizador
        var timerCell = row.insertCell(2);
        timerCell.className = 'timer-cell';
        timerCell.setAttribute('data-start-time', order.startTime);
        timerCell.textContent = self.calculateElapsedTime(order.startTime);
        
        // Detalles
        var detailsCell = row.insertCell(3);
        
        // Servicio
        var serviceText = '';
        switch (order.service) {
            case 'comedor': serviceText = 'Comedor'; break;
            case 'domicilio': serviceText = 'Domicilio'; break;
            case 'para-llevar': serviceText = 'Ordena y espera'; break;
            default: serviceText = order.service;
        }
        
        // Personalización
        var customText = '';
        if (order.customizations && order.customizations.length > 0) {
            order.customizations.forEach(function(code) {
                if (Avika.config.customizationOptions[code]) {
                    customText += Avika.config.customizationOptions[code] + ', ';
                }
            });
            customText = customText.slice(0, -2); // Eliminar última coma y espacio
        }
        
        // Notas
        var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
        
        // Combinar toda la información
        detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                (customText ? '<br>' + customText : '') + 
                                notesText;
        
        // Acciones
        var actionsCell = row.insertCell(4);
        
        // Botón para marcar como completado
        var completeBtn = document.createElement('button');
        completeBtn.textContent = 'Listo';
        completeBtn.className = 'action-btn';
        
        var self = this;
        completeBtn.onclick = function() {
            self.completeOrder(index);
        };
        
        actionsCell.appendChild(completeBtn);
    },
    
    // Calcular tiempo transcurrido
    calculateElapsedTime: function(startTimeStr) {
        var startTime = new Date(startTimeStr);
        var now = new Date();
        var elapsed = Math.floor((now - startTime) / 1000); // en segundos
        
        var hours = Math.floor(elapsed / 3600);
        var minutes = Math.floor((elapsed % 3600) / 60);
        var seconds = elapsed % 60;
        
        var timeStr = '';
        
        if (hours > 0) {
            timeStr += hours + 'h ';
        }
        
        timeStr += this.padZero(minutes) + ':' + this.padZero(seconds);
        
        return timeStr;
    },
    
    // Actualizar todos los temporizadores
    updateAllTimers: function() {
        var timerCells = document.querySelectorAll('.timer-cell');
        
        timerCells.forEach(function(cell) {
            var startTime = cell.getAttribute('data-start-time');
            if (startTime) {
                cell.textContent = this.calculateElapsedTime(startTime);
            }
        }, this);
    },
    
    // Expandir o colapsar un ticket
    toggleTicketExpansion: function(ticketId) {
        console.log("Cambiando expansión del ticket:", ticketId);
        
        // Cambiar estado
        this.state.expandedTickets[ticketId] = !this.state.expandedTickets[ticketId];
        
        // Actualizar tabla
        this.updatePendingTable();
    },
    
    // Completar una orden
    completeOrder: function(index) {
        console.log("Completando orden:", index);
        
        try {
            // Verificar que la orden existe
            if (!Avika.data.pendingOrders || index < 0 || index >= Avika.data.pendingOrders.length) {
                console.error("Orden no válida:", index);
                this.showNotification("Error: Orden no válida");
                return;
            }
            
            var order = Avika.data.pendingOrders[index];
            
            // Actualizar estado y tiempo de finalización
            order.status = 'completed';
            order.finishTime = new Date();
            
            // Guardar datos para serialización correcta
            var orderForStorage = Object.assign({}, order);
            if (orderForStorage.startTime) {
                orderForStorage.startTimeISO = order.startTime.toISOString();
            }
            if (orderForStorage.finishTime) {
                orderForStorage.finishTimeISO = order.finishTime.toISOString();
            }
            
            // Mover a órdenes completadas
            if (!Avika.data.completedOrders) {
                Avika.data.completedOrders = [];
            }
            
            Avika.data.completedOrders.push(orderForStorage);
            
            // Eliminar de órdenes pendientes
            Avika.data.pendingOrders.splice(index, 1);
            
            // Si es parte de un ticket, verificar si todas las órdenes del ticket están completas
            if (order.ticketId) {
                var remainingTicketItems = Avika.data.pendingOrders.filter(function(item) {
                    return item.ticketId === order.ticketId;
                });
                
                if (remainingTicketItems.length === 0) {
                    console.log("Todas las órdenes del ticket completadas:", order.ticketId);
                    this.showNotification("Ticket completo: " + order.ticketId);
                }
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar tablas
            this.updatePendingTable();
            
            if (typeof this.updateCompletedTable === 'function') {
                this.updateCompletedTable(false); // Mostrar recientes por defecto
            }
            
            // Notificar
            this.showNotification("Platillo '" + order.dish + "' marcado como completado");
            
        } catch (e) {
            console.error("Error al completar orden:", e);
            this.showErrorMessage("Error al completar orden: " + e.message);
        }
    },
    
    // Actualizar tabla de órdenes completadas
    updateCompletedTable: function(showAll) {
        console.log("Actualizando tabla de órdenes completadas, mostrar todas:", showAll);
        
        var completedBody = document.getElementById('completed-body');
        if (!completedBody) {
            console.error("Elemento completed-body no encontrado");
            return;
        }
        
        // Limpiar tabla
        completedBody.innerHTML = '';
        
        // Verificar si hay órdenes completadas
        if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
            var row = completedBody.insertRow();
            var cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = "No hay platillos completados";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            return;
        }
        
        // Ordenar por fecha de finalización (más reciente primero)
        var sortedOrders = Avika.data.completedOrders.slice().sort(function(a, b) {
            return new Date(b.finishTime) - new Date(a.finishTime);
        });
        
        // Limitar a los últimos 20 si no se muestra todo
        var ordersToShow = showAll ? sortedOrders : sortedOrders.slice(0, 20);
        
        // Añadir cada orden a la tabla
        ordersToShow.forEach(function(order) {
            var row = completedBody.insertRow();
            
            // Platillo
            var dishCell = row.insertCell(0);
            dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
            
            // Hora de inicio
            var startCell = row.insertCell(1);
            startCell.textContent = self.formatTime(new Date(order.startTime));
            
            // Hora de finalización
            var finishCell = row.insertCell(2);
            finishCell.textContent = self.formatTime(new Date(order.finishTime));
            
            // Tiempo total
            var totalTime = row.insertCell(3);
            var elapsedSeconds = Math.floor((new Date(order.finishTime) - new Date(order.startTime)) / 1000);
            var minutes = Math.floor(elapsedSeconds / 60);
            var seconds = elapsedSeconds % 60;
            totalTime.textContent = minutes + 'm ' + seconds + 's';
            
            // Detalles
            var detailsCell = row.insertCell(4);
            
            // Servicio
            var serviceText = '';
            switch (order.service) {
                case 'comedor': serviceText = 'Comedor'; break;
                case 'domicilio': serviceText = 'Domicilio'; break;
                case 'para-llevar': serviceText = 'Ordena y espera'; break;
                default: serviceText = order.service;
            }
            
            // Personalización
            var customText = '';
            if (order.customizations && order.customizations.length > 0) {
                order.customizations.forEach(function(code) {
                    if (Avika.config.customizationOptions[code]) {
                        customText += Avika.config.customizationOptions[code] + ', ';
                    }
                });
                customText = customText.slice(0, -2); // Eliminar última coma y espacio
            }
            
            // Ticket ID
            var ticketText = order.ticketId ? '<br>Ticket: ' + order.ticketId.replace('ticket-', '#') : '';
            
            // Notas
            var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
            
            // Combinar toda la información
            detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                                   ticketText +
                                   (customText ? '<br>' + customText : '') + 
                                   notesText;
        }, this);
    },

    // Inicializar todos los eventos de la aplicación
    initEvents: function() {
        try {
            console.log("Inicializando eventos...");
            
            // Inicializar botones de servicio
            var btnComedor = document.getElementById('btn-comedor');
            var btnDomicilio = document.getElementById('btn-domicilio');
            var btnParaLlevar = document.getElementById('btn-para-llevar');
            
            if (btnComedor) {
                btnComedor.onclick = null; // Eliminar onclick inline
                btnComedor.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'comedor');
                });
            }
            
            if (btnDomicilio) {
                btnDomicilio.onclick = null; // Eliminar onclick inline
                btnDomicilio.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'domicilio');
                });
            }
            
            if (btnParaLlevar) {
                btnParaLlevar.onclick = null; // Eliminar onclick inline
                btnParaLlevar.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'para-llevar');
                });
            }
            
            // Inicializar botones de cantidad
            var quantityBtns = document.querySelectorAll('.qty-btn');
            quantityBtns.forEach(function(btn) {
                btn.onclick = null; // Eliminar onclick inline
                
                if (btn.textContent === '-') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(-1);
                    });
                } else if (btn.textContent === '+') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(1);
                    });
                }
            });
            
            // Inicializar botón para iniciar preparación
            var btnStart = document.getElementById('btn-start');
            if (btnStart) {
                console.log("Asignando evento al botón iniciar preparación");
                // Eliminar cualquier evento anterior
                var btnStartClone = btnStart.cloneNode(true);
                if (btnStart.parentNode) {
                    btnStart.parentNode.replaceChild(btnStartClone, btnStart);
                    btnStart = btnStartClone;
                }
                
                // Asignar nuevo evento
                btnStart.addEventListener('click', function() {
                    console.log("Clic en botón iniciar preparación");
                    Avika.ui.startPreparation();
                });
            } else {
                console.error("Botón iniciar preparación no encontrado");
            }
            
            // Inicializar botón para cancelar
            var btnCancel = document.getElementById('btn-cancel');
            if (btnCancel) {
                console.log("Asignando evento al botón cancelar");
                // Eliminar cualquier evento anterior
                var btnCancelClone = btnCancel.cloneNode(true);
                if (btnCancel.parentNode) {
                    btnCancel.parentNode.replaceChild(btnCancelClone, btnCancel);
                    btnCancel = btnCancelClone;
                }
                
                // Asignar nuevo evento
                btnCancel.addEventListener('click', function() {
                    console.log("Clic en botón cancelar");
                    Avika.ui.showSection('dishes-section');
                });
            } else {
                console.error("Botón cancelar no encontrado");
            }
            
            // Inicializar botón para volver a categorías
            var btnBackToCategories = document.getElementById('btn-back-to-categories');
            if (btnBackToCategories) {
                btnBackToCategories.addEventListener('click', function() {
                    Avika.ui.showSection('categories-section');
                });
            }
            
            // Inicializar ticket/comanda
            var newTicketBtn = document.getElementById('btn-new-ticket');
            if (newTicketBtn) {
                newTicketBtn.addEventListener('click', function() {
                    Avika.ui.enableTicketMode();
                });
            }
            
            // Inicializar botón para desbloquear tickets
            var forceCompleteBtn = document.getElementById('btn-force-complete');
            if (forceCompleteBtn) {
                forceCompleteBtn.addEventListener('click', function() {
                    Avika.ui.showForceCompleteModal();
                });
            }
            
            // Inicializar filtros de historial
            var filterBtns = {
                showAll: document.getElementById('btn-show-all-history'),
                showRecent: document.getElementById('btn-show-recent'),
                showStats: document.getElementById('btn-show-stats'),
                clearHistory: document.getElementById('btn-clear-history')
            };
            
            if (filterBtns.showAll) {
                filterBtns.showAll.addEventListener('click', function() {
                    Avika.ui.updateCompletedTable(true);
                    this.classList.add('active');
                    if (filterBtns.showRecent) filterBtns.showRecent.classList.remove('active');
                    if (filterBtns.showStats) filterBtns.showStats.classList.remove('active');
                });
            }
            
            if (filterBtns.showRecent) {
                filterBtns.showRecent.addEventListener('click', function() {
                    Avika.ui.updateCompletedTable(false);
                    this.classList.add('active');
                    if (filterBtns.showAll) filterBtns.showAll.classList.remove('active');
                    if (filterBtns.showStats) filterBtns.showStats.classList.remove('active');
                });
            }
            
            if (filterBtns.showStats) {
                filterBtns.showStats.addEventListener('click', function() {
                    if (Avika.stats && typeof Avika.stats.showStatistics === 'function') {
                        Avika.stats.showStatistics();
                        this.classList.add('active');
                        if (filterBtns.showAll) filterBtns.showAll.classList.remove('active');
                        if (filterBtns.showRecent) filterBtns.showRecent.classList.remove('active');
                    } else {
                        console.error("Función showStatistics no disponible");
                    }
                });
            }
            
            if (filterBtns.clearHistory) {
                filterBtns.clearHistory.addEventListener('click', function() {
                    if (confirm('¿Estás seguro de que deseas eliminar todo el historial de platillos completados?')) {
                        if (Avika.orders && typeof Avika.orders.clearCompletedOrders === 'function') {
                            Avika.orders.clearCompletedOrders();
                        } else if (Avika.storage && typeof Avika.storage.limpiarHistorial === 'function') {
                            Avika.storage.limpiarHistorial();
                        } else {
                            console.error("No se encontró función para limpiar historial");
                        }
                    }
                });
            }
            
            // Agregar función de exportar datos si existe el botón
            var exportBtn = document.getElementById('btn-export');
            if (exportBtn) {
                exportBtn.addEventListener('click', function() {
                    if (Avika.stats && typeof Avika.stats.exportData === 'function') {
                        Avika.stats.exportData();
                    } else if (Avika.stats && typeof Avika.stats.exportarDatos === 'function') {
                        Avika.stats.exportarDatos();
                    } else {
                        console.error("Función de exportar datos no disponible");
                    }
                });
            }
            
            console.log("Eventos inicializados correctamente");
            return true;
        } catch (e) {
            console.error("Error durante la inicialización de eventos:", e);
            console.error("Detalles del error:", e.message);
            console.error("Stack:", e.stack);
            
            // Mostrar mensaje de error al usuario
            this.showErrorMessage('Hubo un problema al inicializar la aplicación: ' + e.message);
            return false;
        }
    },

    // Inicializar botones de categoría
    initCategoryButtons: function() {
        try {
            console.log("Inicializando botones de categoría...");
            
            // Usar selectores para elementos con data-category
            var categoryButtons = document.querySelectorAll('.category-btn[data-category]');
            console.log("Encontrados " + categoryButtons.length + " botones de categoría");
            
            if (categoryButtons.length === 0) {
                console.warn("No se encontraron botones de categoría con atributo data-category");
                
                // Intentar con los IDs tradicionales como fallback
                var categories = ['frio', 'entrada-fria', 'caliente', 'entrada-caliente', 'combos'];
                categories.forEach(function(category) {
                    var btn = document.getElementById('btn-' + category);
                    if (btn) {
                        console.log("Usando botón con ID para categoría: " + category);
                        btn.addEventListener('click', function() {
                            Avika.ui.showDishes(category);
                        });
                    } else {
                        console.warn("Botón de categoría no encontrado: " + category);
                    }
                });
                
                return false;
            }
            
            // Asignar eventos a los botones encontrados
            categoryButtons.forEach(function(btn) {
                var category = btn.getAttribute('data-category');
                console.log("Asignando evento para categoría: " + category);
                
                btn.addEventListener('click', function() {
                    console.log("Clic en botón de categoría: " + category);
                    Avika.ui.showDishes(category);
                });
            });
            
            console.log("Botones de categoría inicializados correctamente");
            return true;
        } catch (e) {
            console.error("Error al inicializar botones de categoría:", e);
            return false;
        }
    },

    // Generar botones de categoría para modales
    generateCategoryButtons: function() {
        var html = '';
        
        // Categorías principales
        var categories = [
            { id: 'frio', name: 'Platillos Fríos' },
            { id: 'entrada-fria', name: 'Entradas Frías' },
            { id: 'caliente', name: 'Platillos Calientes' },
            { id: 'entrada-caliente', name: 'Entradas Calientes' },
            { id: 'combos', name: 'Combos' }
        ];
        
        // Generar HTML para cada categoría
        categories.forEach(function(cat) {
            html += `<button class="category-btn" data-category="${cat.id}">${cat.name}</button>`;
        });
        
        return html;
    },

    // Detectar tipo de dispositivo y adaptar interfaz
    detectDevice: function() {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var isSmallScreen = window.innerWidth < 480;
        
        if (isMobile || isSmallScreen) {
            document.body.classList.add('mobile-device');
            console.log("Dispositivo móvil detectado. Adaptando interfaz...");
            
            // Si es dispositivo móvil, reducir el tamaño de los textos y elementos
            this.adaptMobileInterface();
        } else {
            document.body.classList.remove('mobile-device');
            console.log("Dispositivo de escritorio detectado");
        }
        
        // Registrar evento de cambio de tamaño de ventana
        window.addEventListener('resize', function() {
            var isSmallScreen = window.innerWidth < 480;
            if (isSmallScreen) {
                document.body.classList.add('mobile-device');
                Avika.ui.adaptMobileInterface();
            } else {
                document.body.classList.remove('mobile-device');
            }
        });
        
        return isMobile || isSmallScreen;
    },
    
    // Adaptar interfaz para móviles
    adaptMobileInterface: function() {
        try {
            console.log("Adaptando interfaz para móviles...");
            
            // Reducir altura de encabezado
            var header = document.querySelector('header');
            if (header) {
                header.style.padding = '8px';
            }
            
            // Aplicar estilos adicionales para categorías en móviles
            var categoryContainer = document.querySelector('.category-container');
            if (categoryContainer) {
                // Asegurar que tenga máximo 3 botones por fila
                var buttons = categoryContainer.querySelectorAll('.category-btn');
                var screenWidth = window.innerWidth;
                var maxButtons = screenWidth < 360 ? 2 : 3;
                
                // Asignar ancho aproximado para mostrar 2 o 3 botones por fila
                var buttonWidth = (screenWidth - 40) / maxButtons;
                buttons.forEach(function(btn) {
                    // Establecer ancho fijo para cada botón
                    btn.style.width = (buttonWidth - 10) + 'px';
                    btn.style.margin = '3px';
                    
                    // Ajustar texto para que quepa mejor
                    var text = btn.textContent;
                    if (text.includes("Platillos")) {
                        btn.textContent = text.replace("Platillos", "Plat.");
                    }
                    if (text.includes("Entradas")) {
                        btn.textContent = text.replace("Entradas", "Ent.");
                    }
                });
            }
            
            console.log("Interfaz móvil adaptada correctamente");
        } catch (e) {
            console.error("Error al adaptar interfaz móvil:", e);
        }
    },
    
    // Mostrar platos de una categoría seleccionada
    showDishes: function(category) {
        console.log("Mostrando platos de la categoría:", category);
        try {
            // Verificar que la categoría existe
            if (!category || !Avika.config.categoryNames || !Avika.config.categoryNames[category]) {
                console.error("Error: Categoría no válida:", category);
                this.showNotification("Error: Categoría no válida.");
                return;
            }
            
            // Llamar a la función selectCategory para mostrar los platos
            if (typeof this.selectCategory === 'function') {
                this.selectCategory(category);
            } else {
                console.error("Error: Función selectCategory no encontrada");
                this.showNotification("Error: No se pueden mostrar los platos.");
            }
        } catch (e) {
            console.error("Error al mostrar platos:", e);
            this.showNotification("Error al mostrar platillos: " + e.message);
        }
    },
    
    // Activar consola de depuración para móviles
    enableMobileDebugging: function() {
        try {
            // Verificar si estamos en un dispositivo móvil
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                console.log("Dispositivo móvil detectado, activando consola de depuración...");
                
                // Crear elemento script para cargar eruda
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/eruda';
                script.onload = function() {
                    // Una vez cargado, iniciar eruda
                    if (typeof eruda !== 'undefined') {
                        eruda.init();
                        console.log("Consola de depuración móvil activada");
                    }
                };
                script.onerror = function() {
                    console.error("No se pudo cargar la consola de depuración móvil");
                };
                
                // Agregar script al documento
                document.head.appendChild(script);
            }
        } catch (e) {
            console.error("Error al activar depuración móvil:", e);
        }
    },
    
    // Habilitar modo ticket/comanda para múltiples platillos
    // Habilitar modo ticket/comanda para múltiples platillos
enableTicketMode: function() {
    console.log("Activando modo ticket/comanda");
    
    try {
        // Cambiar estado de la UI
        this.state.ticketMode = true;
        this.state.ticketItems = [];
        
        // Crear modal para ticket si no existe
        var ticketModal = document.getElementById('ticket-modal');
        if (!ticketModal) {
            console.log("Creando modal para ticket");
            
            ticketModal = document.createElement('div');
            ticketModal.id = 'ticket-modal';
            ticketModal.className = 'modal';
            ticketModal.style.display = 'none';
            
            var modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            // Botón para cerrar
            var closeBtn = document.createElement('span');
            closeBtn.className = 'close-modal';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function() {
                ticketModal.style.display = 'none';
                Avika.ui.state.ticketMode = false;
            };
            
            // Título
            var title = document.createElement('h2');
            title.textContent = 'Nuevo Ticket / Comanda';
            
            // Contenedor para productos añadidos
            var itemsContainer = document.createElement('div');
            itemsContainer.id = 'ticket-items';
            itemsContainer.className = 'ticket-items';
            
            // Tabla de platillos añadidos
            var table = document.createElement('table');
            table.className = 'ticket-table';
            
            var thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Cant.</th><th>Platillo</th><th>Personalización</th><th>Acciones</th></tr>';
            
            var tbody = document.createElement('tbody');
            tbody.id = 'ticket-items-body';
            
            table.appendChild(thead);
            table.appendChild(tbody);
            itemsContainer.appendChild(table);
            
            // Opciones de servicio para ticket
            var serviceOptions = document.createElement('div');
            serviceOptions.className = 'option-group';
            serviceOptions.innerHTML = `
                <div class="option-title">Tipo de servicio para todo el ticket:</div>
                <div class="option-btns">
                    <button id="ticket-btn-comedor" class="option-btn selected">Comedor</button>
                    <button id="ticket-btn-domicilio" class="option-btn">Domicilio</button>
                    <button id="ticket-btn-para-llevar" class="option-btn">Ordena y espera</button>
                </div>
            `;
            
            // Notas para todo el ticket
            var notesGroup = document.createElement('div');
            notesGroup.className = 'option-group';
            notesGroup.innerHTML = `
                <div class="option-title">Notas generales para el ticket:</div>
                <textarea id="ticket-notes" class="notes-input" placeholder="Notas generales que aplican a todo el ticket..."></textarea>
            `;
            
            // Botones de acción
            var actionBtns = document.createElement('div');
            actionBtns.className = 'action-btns';
            actionBtns.innerHTML = `
                <button id="btn-add-to-ticket" class="action-btn">Agregar platillo</button>
                <button id="btn-save-ticket" class="action-btn start-btn">Guardar ticket</button>
            `;
            
            // Añadir elementos al modal
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(title);
            modalContent.appendChild(itemsContainer);
            modalContent.appendChild(serviceOptions);
            modalContent.appendChild(notesGroup);
            modalContent.appendChild(actionBtns);
            
            ticketModal.appendChild(modalContent);
            document.body.appendChild(ticketModal);
            
            console.log("Modal de ticket creado correctamente");
        }
        
        // Asegurarse de que los botones tengan los eventos correctos
        console.log("Asignando eventos a los botones del ticket modal");
        
        // Botones de servicio
        var btnComedor = document.getElementById('ticket-btn-comedor');
        if (btnComedor) {
            btnComedor.onclick = function() {
                Avika.ui.selectTicketService(this, 'comedor');
            };
        }
        
        var btnDomicilio = document.getElementById('ticket-btn-domicilio');
        if (btnDomicilio) {
            btnDomicilio.onclick = function() {
                Avika.ui.selectTicketService(this, 'domicilio');
            };
        }
        
        var btnParaLlevar = document.getElementById('ticket-btn-para-llevar');
        if (btnParaLlevar) {
            btnParaLlevar.onclick = function() {
                Avika.ui.selectTicketService(this, 'para-llevar');
            };
        }
        
        // Botón para agregar platillos
        var btnAddToTicket = document.getElementById('btn-add-to-ticket');
        if (btnAddToTicket) {
            btnAddToTicket.onclick = function() {
                ticketModal.style.display = 'none';
                Avika.ui.showSection('categories-section');
            };
        }
        
        // Botón para guardar ticket
        var btnSaveTicket = document.getElementById('btn-save-ticket');
        if (btnSaveTicket) {
            btnSaveTicket.onclick = function() {
                Avika.ui.saveTicket();
            };
        }
        
        // Limpiar tabla de items
        var ticketItemsBody = document.getElementById('ticket-items-body');
        if (ticketItemsBody) {
            ticketItemsBody.innerHTML = '';
        }
        
        // Resetear servicio del ticket
        this.state.ticketService = 'comedor';
        
        if (btnComedor) btnComedor.classList.add('selected');
        if (btnDomicilio) btnDomicilio.classList.remove('selected');
        if (btnParaLlevar) btnParaLlevar.classList.remove('selected');
        
        // Limpiar notas
        var ticketNotes = document.getElementById('ticket-notes');
        if (ticketNotes) ticketNotes.value = '';
        
        // Mostrar modal
        console.log("Mostrando modal de ticket");
        ticketModal.style.display = 'block';
        
    } catch (e) {
        console.error("Error al activar modo ticket:", e);
        this.showErrorMessage("Error al activar modo ticket: " + e.message);
    }
},
    
    // Seleccionar servicio para ticket
    selectTicketService: function(button, service) {
        console.log("Seleccionando servicio para ticket:", service);
        
        // Verificar que existan los elementos
        var btnComedor = document.getElementById('ticket-btn-comedor');
        var btnDomicilio = document.getElementById('ticket-btn-domicilio');
        var btnParaLlevar = document.getElementById('ticket-btn-para-llevar');
        
        // Remover clases solo si los elementos existen
        if (btnComedor) btnComedor.classList.remove('selected');
        if (btnDomicilio) btnDomicilio.classList.remove('selected');
        if (btnParaLlevar) btnParaLlevar.classList.remove('selected');
        
        // Añadir clase al botón actual
        if (button) button.classList.add('selected');
        
        // Actualizar el estado
        this.state.ticketService = service;
    },
    
    // Guardar ticket/comanda
    saveTicket: function() {
        console.log("Guardando ticket con", this.state.ticketItems.length, "items");
        
        if (this.state.ticketItems.length === 0) {
            this.showNotification("Error: No hay platillos en el ticket.");
            return;
        }
        
        try {
            // Obtener notas generales
            var ticketNotes = document.getElementById('ticket-notes');
            var generalNotes = ticketNotes ? ticketNotes.value : '';
            
            // Crear nuevo ticket
            var newTicket = {
                id: 'ticket-' + Date.now(),
                service: this.state.ticketService,
                items: this.state.ticketItems,
                notes: generalNotes,
                created: new Date()
            };
            
            // Procesar cada item y agregarlo a órdenes pendientes
            newTicket.items.forEach(function(item) {
                // Crear un nuevo objeto para cada item del ticket
                var newOrder = {
                    dish: item.dish,
                    quantity: item.quantity,
                    customizations: item.customizations,
                    notes: item.notes,
                    service: newTicket.service,
                    ticketId: newTicket.id,
                    startTime: new Date(),
                    finishTime: null,
                    status: 'pending'
                };
                
                // Agregar a órdenes pendientes
                if (!Avika.data.pendingOrders) {
                    Avika.data.pendingOrders = [];
                }
                
                Avika.data.pendingOrders.push(newOrder);
            });
            
            // Guardar datos si está disponible
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar tabla de órdenes pendientes
            if (typeof this.updatePendingTable === 'function') {
                this.updatePendingTable();
            }
            
            // Cerrar modal y resetear estado
            var ticketModal = document.getElementById('ticket-modal');
            if (ticketModal) {
                ticketModal.style.display = 'none';
            }
            
            this.state.ticketMode = false;
            this.state.ticketItems = [];
            
            // Mostrar notificación
            this.showNotification("Ticket guardado correctamente con " + newTicket.items.length + " platillos.");
            
        } catch (e) {
            console.error("Error al guardar ticket:", e);
            this.showErrorMessage("Error al guardar ticket: " + e.message);
        }
    },

    // Implementación de la función que falta para forzar la finalización de tickets
    showForceCompleteModal: function() {
        console.log("Mostrando modal para desbloquear tickets");
        
        try {
            // Crear modal si no existe
            var forceCompleteModal = document.getElementById('force-complete-modal');
            if (!forceCompleteModal) {
                forceCompleteModal = document.createElement('div');
                forceCompleteModal.id = 'force-complete-modal';
                forceCompleteModal.className = 'modal';
                
                var modalContent = document.createElement('div');
                modalContent.className = 'modal-content';
                
                // Botón para cerrar
                var closeBtn = document.createElement('span');
                closeBtn.className = 'close-modal';
                closeBtn.innerHTML = '&times;';
                closeBtn.onclick = function() {
                    forceCompleteModal.style.display = 'none';
                };
                
                // Título
                var title = document.createElement('h2');
                title.textContent = 'Desbloquear Tickets';
                
                // Texto explicativo
                var explanation = document.createElement('p');
                explanation.textContent = 'Selecciona un ticket para marcarlo como completado manualmente:';
                
                // Contenedor para lista de tickets pendientes
                var ticketsContainer = document.createElement('div');
                ticketsContainer.id = 'pending-tickets-container';
                ticketsContainer.className = 'pending-tickets-container';
                
                // Añadir elementos al modal
                modalContent.appendChild(closeBtn);
                modalContent.appendChild(title);
                modalContent.appendChild(explanation);
                modalContent.appendChild(ticketsContainer);
                
                forceCompleteModal.appendChild(modalContent);
                document.body.appendChild(forceCompleteModal);
            }
            
            // Actualizar lista de tickets pendientes
            this.updatePendingTicketsList();
            
            // Mostrar modal
            forceCompleteModal.style.display = 'block';
            
        } catch (e) {
            console.error("Error al mostrar modal de desbloqueo:", e);
            this.showErrorMessage("Error al mostrar modal de desbloqueo: " + e.message);
        }
    },

    // Función auxiliar para actualizar la lista de tickets pendientes
    updatePendingTicketsList: function() {
        console.log("Actualizando lista de tickets pendientes");
        
        var ticketsContainer = document.getElementById('pending-tickets-container');
        if (!ticketsContainer) {
            console.error("Contenedor de tickets pendientes no encontrado");
            return;
        }
        
        // Limpiar contenedor
        ticketsContainer.innerHTML = '';
        
        // Verificar si hay órdenes pendientes
        if (!Avika.data || !Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            var message = document.createElement('p');
            message.textContent = "No hay tickets pendientes.";
            message.style.textAlign = "center";
            message.style.padding = "20px";
            ticketsContainer.appendChild(message);
            return;
        }
        
        // Obtener tickets únicos
        var ticketsMap = {};
        Avika.data.pendingOrders.forEach(function(order) {
            if (order.ticketId) {
                if (!ticketsMap[order.ticketId]) {
                    ticketsMap[order.ticketId] = {
                        id: order.ticketId,
                        items: [],
                        service: order.serviceType || order.service || 'comedor'
                    };
                }
                ticketsMap[order.ticketId].items.push(order);
            }
        });
        
        // Si no hay tickets, mostrar mensaje
        if (Object.keys(ticketsMap).length === 0) {
            var message = document.createElement('p');
            message.textContent = "No hay tickets pendientes.";
            message.style.textAlign = "center";
            message.style.padding = "20px";
            ticketsContainer.appendChild(message);
            return;
        }
        
        // Crear una lista de tickets
        var ticketsList = document.createElement('ul');
        ticketsList.className = 'tickets-list';
        
        // Añadir cada ticket a la lista
        for (var ticketId in ticketsMap) {
            var ticket = ticketsMap[ticketId];
            
            var listItem = document.createElement('li');
            listItem.className = 'ticket-item';
            
            // Información del ticket
            var ticketInfo = document.createElement('div');
            ticketInfo.className = 'ticket-info';
            ticketInfo.innerHTML = '<strong>Ticket #' + ticketId.replace('ticket-', '') + '</strong> - ' +
                                  (Avika.config && Avika.config.serviceNames ? 
                                    (Avika.config.serviceNames[ticket.service] || ticket.service) : 
                                    ticket.service) +
                                  ' <span class="badge">' + ticket.items.length + ' platillos</span>';
            
            // Botón para completar ticket
            var completeBtn = document.createElement('button');
            completeBtn.textContent = 'Completar';
            completeBtn.className = 'action-btn start-btn';
            completeBtn.setAttribute('data-ticket-id', ticketId);
            
            var self = this;
            completeBtn.onclick = function() {
                var id = this.getAttribute('data-ticket-id');
                self.forceCompleteTicket(id);
            };
            
            // Añadir elementos al item
            listItem.appendChild(ticketInfo);
            listItem.appendChild(completeBtn);
            
            // Añadir item a la lista
            ticketsList.appendChild(listItem);
        }
        
        // Añadir órdenes individuales
        var individualOrders = Avika.data.pendingOrders.filter(function(order) {
            return !order.ticketId;
        });
        
        if (individualOrders.length > 0) {
            var divider = document.createElement('div');
            divider.className = 'tickets-divider';
            divider.textContent = 'Órdenes individuales';
            ticketsContainer.appendChild(divider);
            
            // Lista para órdenes individuales
            var ordersList = document.createElement('ul');
            ordersList.className = 'tickets-list';
            
            individualOrders.forEach(function(order, index) {
                var listItem = document.createElement('li');
                listItem.className = 'ticket-item';
                
                // Información de la orden
                var orderInfo = document.createElement('div');
                orderInfo.className = 'ticket-info';
                orderInfo.innerHTML = '<strong>' + order.dish + '</strong> - ' +
                                    (Avika.config && Avika.config.serviceNames ? 
                                        (Avika.config.serviceNames[order.service || order.serviceType] || 
                                        (order.service || order.serviceType)) : 
                                        (order.service || order.serviceType));
                
                // Botón para completar orden
                var completeBtn = document.createElement('button');
                completeBtn.textContent = 'Completar';
                completeBtn.className = 'action-btn';
                
                var self = this;
                completeBtn.onclick = function() {
                    // Buscar el índice actual de la orden en el array
                    var currentIndex = -1;
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        if (Avika.data.pendingOrders[i] === order || 
                            (Avika.data.pendingOrders[i].id && order.id && 
                             Avika.data.pendingOrders[i].id === order.id)) {
                            currentIndex = i;
                            break;
                        }
                    }
                    
                    if (currentIndex !== -1) {
                        self.completeOrder(currentIndex);
                        document.getElementById('force-complete-modal').style.display = 'none';
                    }
                };
                
                // Añadir elementos al item
                listItem.appendChild(orderInfo);
                listItem.appendChild(completeBtn);
                
                // Añadir item a la lista
                ordersList.appendChild(listItem);
            }, this);
            
            ticketsContainer.appendChild(ordersList);
        }
        
        // Añadir lista al contenedor
        ticketsContainer.appendChild(ticketsList);
    },

    // Función para completar forzosamente un ticket
    forceCompleteTicket: function(ticketId) {
        console.log("Completando ticket forzosamente:", ticketId);
        
        try {
            // Verificar que existe el ticket
            var ticketExists = false;
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].ticketId === ticketId) {
                    ticketExists = true;
                    break;
                }
            }
            
            if (!ticketExists) {
                this.showNotification("Error: El ticket no existe o ya fue completado");
                return;
            }
            
            // Usar la función completeTicket de Avika.orders si existe
            if (Avika.orders && typeof Avika.orders.completeTicket === 'function') {
                Avika.orders.completeTicket(ticketId);
                
                // Cerrar el modal
                var forceCompleteModal = document.getElementById('force-complete-modal');
                if (forceCompleteModal) {
                    forceCompleteModal.style.display = 'none';
                }
                
                return;
            }
            
            // Implementación alternativa si no existe la función en Avika.orders
            var ticketOrders = [];
            var now = new Date();
            
            // Buscar todos los índices de órdenes del ticket
            var orderIndices = [];
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                if (Avika.data.pendingOrders[i].ticketId === ticketId) {
                    // Guardar el índice y la orden
                    orderIndices.push(i);
                    
                    // Finalizar la orden
                    var order = Avika.data.pendingOrders[i];
                    order.status = 'completed';
                    order.finishTime = now;
                    
                    // Añadir a órdenes completadas
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }
                    
                    // Crear una copia para evitar referencias
                    var orderCopy = JSON.parse(JSON.stringify(order));
                    
                    // Guardar formato ISO para las fechas (para restaurarlas después)
                    if (order.startTime) {
                        orderCopy.startTimeISO = new Date(order.startTime).toISOString();
                    }
                    if (now) {
                        orderCopy.finishTimeISO = now.toISOString();
                    }
                    
                    Avika.data.completedOrders.push(orderCopy);
                    ticketOrders.push(order);
                }
            }
            
            // Eliminar órdenes del array pendingOrders (desde el final para no afectar índices)
            for (var i = orderIndices.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(orderIndices[i], 1);
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar tablas
            this.updatePendingTable();
            if (typeof this.updateCompletedTable === 'function') {
                this.updateCompletedTable(false);
            }
            
            // Cerrar el modal
            var forceCompleteModal = document.getElementById('force-complete-modal');
            if (forceCompleteModal) {
                forceCompleteModal.style.display = 'none';
            }
            
            // Mostrar notificación
            this.showNotification("Ticket #" + ticketId.replace('ticket-', '') + " completado manualmente");
            
        } catch (e) {
            console.error("Error al completar ticket:", e);
            this.showErrorMessage("Error al completar ticket: " + e.message);
        }
    },

    // Función auxiliar para obtener tickets pendientes
    getPendingTickets: function() {
        var ticketsMap = {};
        
        if (Avika.data.pendingOrders) {
            Avika.data.pendingOrders.forEach(function(order) {
                if (order.ticketId && !ticketsMap[order.ticketId]) {
                    ticketsMap[order.ticketId] = {
                        id: order.ticketId,
                        count: 0
                    };
                }
                
                if (order.ticketId) {
                    ticketsMap[order.ticketId].count++;
                }
            });
        }
        
        return ticketsMap;
    }
};