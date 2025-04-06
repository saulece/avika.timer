// fix.js - Quick fix for initialization errors
(function() {
    console.log("Aplicando correcciones para errores de inicialización");
    
    // Ensure all required namespaces exist
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    if (!Avika.orders) Avika.orders = {};
    if (!Avika.data) {
        Avika.data = {
            pendingOrders: [],
            completedOrders: [],
            currentCategory: '',
            currentDish: '',
            currentCustomizations: [],
            currentService: 'comedor',
            currentQuantity: 1,
            isSpecialCombo: false
        };
    }
    if (!Avika.storage) Avika.storage = {};
    if (!Avika.dateUtils) Avika.dateUtils = {};
    if (!Avika.config) {
        Avika.config = {
            timerInterval: 1000,
            autoSaveInterval: 30000
        };
    }
    
    // Fix critical functions that are causing errors
    
    // Fix for moduleExists - this is causing errors when checking modules
    Avika.moduleExists = function(modulePath) {
        try {
            var parts = modulePath.split('.');
            var obj = window;
            
            for (var i = 0; i < parts.length; i++) {
                if (!obj[parts[i]]) {
                    return false;
                }
                obj = obj[parts[i]];
            }
            
            return true;
        } catch (e) {
            console.error("Error al verificar módulo:", e);
            return false;
        }
    };
    
    // Ensure notification functions exist
    Avika.ui.showNotification = Avika.ui.showNotification || function(message, duration) {
        console.log("Notificación:", message);
        alert(message);
    };
    
    Avika.ui.showErrorMessage = Avika.ui.showErrorMessage || function(message) {
        console.error("Error:", message);
        alert("Error: " + message);
    };
    
    // Basic implementation for updatePendingTable
    Avika.ui.updatePendingTable = Avika.ui.updatePendingTable || function() {
        console.log("Actualizando tabla pendientes (implementación básica)");
        var pendingBody = document.getElementById('pending-body');
        if (!pendingBody) return;
        
        pendingBody.innerHTML = '';
        
        // Update counter
        var pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
        }
        
        if (!Avika.data.pendingOrders || Avika.data.pendingOrders.length === 0) {
            var emptyRow = pendingBody.insertRow();
            var emptyCell = emptyRow.insertCell(0);
            emptyCell.colSpan = 5;
            emptyCell.textContent = "No hay platillos en preparación";
            emptyCell.style.textAlign = "center";
        }
    };
    
    // Basic implementation for updateCompletedTable
    Avika.ui.updateCompletedTable = Avika.ui.updateCompletedTable || function() {
        console.log("Actualizando tabla completados (implementación básica)");
        var completedBody = document.getElementById('completed-body');
        if (!completedBody) return;
        
        completedBody.innerHTML = '';
        
        if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
            var emptyRow = completedBody.insertRow();
            var emptyCell = emptyRow.insertCell(0);
            emptyCell.colSpan = 5;
            emptyCell.textContent = "No hay platillos completados";
            emptyCell.style.textAlign = "center";
        }
    };
    
    // Basic implementation for date utilities
    Avika.dateUtils.calculateElapsedTime = Avika.dateUtils.calculateElapsedTime || function(startTime) {
        if (!startTime) return "--:--";
        try {
            var now = new Date();
            var start = new Date(startTime);
            var elapsed = Math.floor((now - start) / 1000);
            var mins = Math.floor(elapsed / 60);
            var secs = elapsed % 60;
            return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        } catch (e) {
            console.error("Error al calcular tiempo transcurrido:", e);
            return "--:--";
        }
    };
    
    // Basic implementation for formatTime
    Avika.dateUtils.formatTime = Avika.dateUtils.formatTime || function(date) {
        if (!date) return "--:--:--";
        try {
            var d = new Date(date);
            var hours = d.getHours();
            var mins = d.getMinutes();
            var secs = d.getSeconds();
            return (hours < 10 ? '0' : '') + hours + ':' + 
                   (mins < 10 ? '0' : '') + mins + ':' + 
                   (secs < 10 ? '0' : '') + secs;
        } catch (e) {
            console.error("Error al formatear hora:", e);
            return "--:--:--";
        }
    };
    
    // Basic implementation for storage functions
    Avika.storage.guardarDatosLocales = Avika.storage.guardarDatosLocales || function() {
        console.log("Guardando datos locales (implementación básica)");
        try {
            var dataToSave = {
                pendingOrders: Avika.data.pendingOrders || [],
                completedOrders: Avika.data.completedOrders || [],
                lastSaved: new Date()
            };
            
            localStorage.setItem('avika_timer_data', JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error("Error al guardar datos:", e);
            return false;
        }
    };
    
    Avika.storage.cargarDatosGuardados = Avika.storage.cargarDatosGuardados || function() {
        console.log("Cargando datos guardados (implementación básica)");
        try {
            var savedData = localStorage.getItem('avika_timer_data');
            if (!savedData) {
                console.log("No hay datos guardados para cargar");
                return false;
            }
            
            var parsedData = JSON.parse(savedData);
            
            if (parsedData.pendingOrders) {
                Avika.data.pendingOrders = parsedData.pendingOrders;
            }
            
            if (parsedData.completedOrders) {
                Avika.data.completedOrders = parsedData.completedOrders;
            }
            
            return true;
        } catch (e) {
            console.error("Error al cargar datos guardados:", e);
            return false;
        }
    };
    
    // Update the DOM when ready
    if (document.readyState === 'complete') {
        initDom();
    } else {
        window.addEventListener('DOMContentLoaded', initDom);
    }
    
    function initDom() {
        try {
            // Initialize basic UI events for category buttons
            document.querySelectorAll('.category-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var category = this.getAttribute('data-category');
                    selectCategory(category);
                });
            });
            
            // Provide a basic selectCategory implementation
            if (!Avika.ui.selectCategory) {
                Avika.ui.selectCategory = selectCategory;
            }
            
            // Initialize back buttons
            var btnBackToCategories = document.getElementById('btn-back-to-categories');
            if (btnBackToCategories) {
                btnBackToCategories.addEventListener('click', function() {
                    showSection('categories-section');
                });
            }
        } catch (e) {
            console.error("Error en inicialización DOM:", e);
        }
    }
    
    // Basic implementation for section display
    function showSection(sectionId) {
        try {
            var sections = ['categories-section', 'dishes-section', 'preparation-section'];
            
            sections.forEach(function(id) {
                var section = document.getElementById(id);
                if (section) {
                    section.style.display = id === sectionId ? 'block' : 'none';
                }
            });
        } catch (e) {
            console.error("Error al mostrar sección:", e);
        }
    }
    
    // Basic implementation for category selection
    function selectCategory(category) {
        try {
            // Update current category
            Avika.data.currentCategory = category;
            
            // Show dishes section
            showSection('dishes-section');
            
            // Update category title
            var titleElement = document.getElementById('selected-category-title');
            if (titleElement) {
                var categoryName = category;
                if (Avika.config && Avika.config.categoryNames && Avika.config.categoryNames[category]) {
                    categoryName = Avika.config.categoryNames[category];
                }
                titleElement.textContent = categoryName;
            }
            
            // Clear current dishes container
            var dishesContainer = document.getElementById('dishes-container');
            if (dishesContainer) {
                dishesContainer.innerHTML = '';
                
                // Add dishes for this category
                if (Avika.config && Avika.config.dishes && Avika.config.dishes[category]) {
                    Avika.config.dishes[category].forEach(function(dish) {
                        var dishButton = document.createElement('button');
                        dishButton.className = 'dish-btn';
                        dishButton.textContent = dish;
                        dishButton.addEventListener('click', function() {
                            if (Avika.orders && typeof Avika.orders.selectDish === 'function') {
                                Avika.orders.selectDish(dish);
                            } else {
                                console.error("Función selectDish no encontrada");
                            }
                        });
                        
                        dishesContainer.appendChild(dishButton);
                    });
                } else {
                    dishesContainer.innerHTML = '<p>No hay platillos disponibles para esta categoría</p>';
                }
            }
        } catch (e) {
            console.error("Error al seleccionar categoría:", e);
        }
    }
    
    console.log("Correcciones aplicadas");
})(); 