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
    
    // MODIFICADO: Nueva función para manejar subcategorías
    selectCategory: function(category) {
        Avika.data.currentCategory = category;
        document.getElementById('selected-category-title').textContent = Avika.config.categoryNames[category];
        
        var dishesContainer = document.getElementById('dishes-container');
        dishesContainer.innerHTML = '';
        
        // Verificar si hay datos de platillos
        if (!Avika.config.dishes[category] || Avika.config.dishes[category].length === 0) {
            dishesContainer.innerHTML = '<p>No hay platillos en esta categoría</p>';
            this.showSection('dishes-section');
            return;
        }
        
        // Verificar si hay subcategorías configuradas para esta categoría
        if (Avika.config.subCategories && Avika.config.subCategories[category] && Avika.config.subCategories[category].length > 0) {
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
        
        this.showSection('dishes-section');
    },
    
    // NUEVA: Función para seleccionar una subcategoría
    selectSubCategory: function(category, subcategory, container) {
        this.state.currentSubCategory = subcategory;
        
        // Si no se proporciona un contenedor, usar el predeterminado
        var platillosContainer = container || document.querySelector('.dishes-buttons-container');
        if (!platillosContainer) return;
        
        // Limpiar contenedor
        platillosContainer.innerHTML = '';
        
        // Si se seleccionó una subcategoría específica
        if (subcategory) {
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
            // Si se seleccionó "Todos", mostrar todos los platillos de la categoría
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
    },
    
    // NUEVA: Función para filtrar platillos por búsqueda
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
    }
};