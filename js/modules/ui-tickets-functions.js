// ui-tickets-functions.js - Funciones adicionales para el manejo de tickets
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Seleccionar categoría en el modal de tickets
Avika.ui.selectTicketCategory = function(category) {
    // Actualizar botones de categoría
    var buttons = document.querySelectorAll('#ticket-categories-container .category-btn');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-category') === category) {
            buttons[i].classList.add('active');
        } else {
            buttons[i].classList.remove('active');
        }
    }
    
    // Obtener contenedor de platillos
    var container = document.getElementById('ticket-dishes-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Obtener platillos de la categoría
    var categoryData = Avika.config.menu[category];
    
    // Verificar si la categoría tiene subcategorías
    if (categoryData.subcategories) {
        // Crear contenedor para subcategorías
        var subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = 'subcategories-container';
        
        // Crear botones para cada subcategoría
        for (var subcategoryName in categoryData.subcategories) {
            var subcategoryButton = document.createElement('button');
            subcategoryButton.className = 'subcategory-btn';
            subcategoryButton.setAttribute('data-category', category);
            subcategoryButton.setAttribute('data-subcategory', subcategoryName);
            subcategoryButton.textContent = subcategoryName;
            
            // Evento de clic
            subcategoryButton.onclick = function() {
                var cat = this.getAttribute('data-category');
                var subcat = this.getAttribute('data-subcategory');
                
                // Actualizar botones de subcategoría
                var subButtons = document.querySelectorAll('.subcategory-btn');
                for (var j = 0; j < subButtons.length; j++) {
                    subButtons[j].classList.remove('active');
                }
                this.classList.add('active');
                
                // Mostrar platillos de la subcategoría
                Avika.ui.showTicketSubcategoryDishes(cat, subcat);
            };
            
            subcategoriesContainer.appendChild(subcategoryButton);
        }
        
        container.appendChild(subcategoriesContainer);
        
        // Seleccionar primera subcategoría
        if (subcategoriesContainer.firstChild) {
            subcategoriesContainer.firstChild.click();
        }
    } else if (Array.isArray(categoryData)) {
        // Categoría sin subcategorías, mostrar platillos directamente
        this.showTicketCategoryDishes(category);
    }
};

// Mostrar platillos de una categoría sin subcategorías
Avika.ui.showTicketCategoryDishes = function(category) {
    var container = document.getElementById('ticket-dishes-container');
    if (!container) return;
    
    // Limpiar contenedor de platillos
    var dishesContainer = container.querySelector('.dishes-grid');
    if (!dishesContainer) {
        dishesContainer = document.createElement('div');
        dishesContainer.className = 'dishes-grid';
        container.appendChild(dishesContainer);
    } else {
        dishesContainer.innerHTML = '';
    }
    
    // Obtener platillos de la categoría
    var dishes = Avika.config.menu[category];
    
    // Crear botones para cada platillo
    for (var i = 0; i < dishes.length; i++) {
        var dish = dishes[i];
        
        var button = document.createElement('button');
        button.className = 'dish-button';
        button.setAttribute('data-dish-name', dish);
        button.setAttribute('data-category', category);
        button.textContent = dish;
        
        // Evento de clic
        button.onclick = function() {
            var dishName = this.getAttribute('data-dish-name');
            Avika.ui.selectTicketDish(dishName);
        };
        
        dishesContainer.appendChild(button);
    }
};

// Mostrar platillos de una subcategoría
Avika.ui.showTicketSubcategoryDishes = function(category, subcategory) {
    var container = document.getElementById('ticket-dishes-container');
    if (!container) return;
    
    // Limpiar contenedor de platillos
    var dishesContainer = container.querySelector('.dishes-grid');
    if (!dishesContainer) {
        dishesContainer = document.createElement('div');
        dishesContainer.className = 'dishes-grid';
        container.appendChild(dishesContainer);
    } else {
        dishesContainer.innerHTML = '';
    }
    
    // Obtener platillos de la subcategoría
    var dishes = Avika.config.menu[category].subcategories[subcategory];
    
    // Crear botones para cada platillo
    for (var i = 0; i < dishes.length; i++) {
        var dish = dishes[i];
        
        var button = document.createElement('button');
        button.className = 'dish-button';
        button.setAttribute('data-dish-name', dish);
        button.setAttribute('data-category', category);
        button.setAttribute('data-subcategory', subcategory);
        button.textContent = dish;
        
        // Evento de clic
        button.onclick = function() {
            var dishName = this.getAttribute('data-dish-name');
            Avika.ui.selectTicketDish(dishName);
        };
        
        dishesContainer.appendChild(button);
    }
};

// Seleccionar platillo para el ticket
Avika.ui.selectTicketDish = function(dish) {
    // Actualizar estado
    Avika.ui.state.selectedTicketItem = {
        dish: dish,
        quantity: 1,
        customizations: []
    };
    
    // Mostrar sección de personalización
    document.getElementById('ticket-dish-selection').style.display = 'none';
    document.getElementById('ticket-dish-customization').style.display = 'block';
    
    // Actualizar título
    document.getElementById('selected-ticket-dish-title').textContent = dish;
    
    // Actualizar cantidad
    document.getElementById('ticket-quantity-display').textContent = '1';
    
    // Cargar opciones de personalización
    this.loadTicketCustomizationOptions();
};

// Cambiar cantidad de un platillo para el ticket
Avika.ui.changeTicketItemQuantity = function(change) {
    var quantityDisplay = document.getElementById('ticket-quantity-display');
    var currentQuantity = parseInt(quantityDisplay.textContent);
    var newQuantity = currentQuantity + change;
    
    // Validar cantidad
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    
    // Actualizar display
    quantityDisplay.textContent = newQuantity;
    
    // Actualizar estado
    Avika.ui.state.selectedTicketItem.quantity = newQuantity;
};

// Cargar opciones de personalización para el platillo seleccionado
Avika.ui.loadTicketCustomizationOptions = function() {
    var container = document.getElementById('ticket-options-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Obtener opciones de personalización
    var options = Avika.config.customizationOptions || [];
    
    // Crear botones para cada opción
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        
        var button = document.createElement('button');
        button.className = 'option-btn';
        button.setAttribute('data-option', option);
        button.textContent = option;
        
        // Evento de clic
        button.onclick = function() {
            var opt = this.getAttribute('data-option');
            Avika.ui.toggleTicketOption(this, opt);
        };
        
        container.appendChild(button);
    }
};

// Alternar opción de personalización
Avika.ui.toggleTicketOption = function(button, option) {
    // Alternar clase activa
    button.classList.toggle('active');
    
    // Actualizar estado
    var customizations = Avika.ui.state.selectedTicketItem.customizations;
    var index = customizations.indexOf(option);
    
    if (index === -1) {
        // Añadir opción
        customizations.push(option);
    } else {
        // Eliminar opción
        customizations.splice(index, 1);
    }
};

// Añadir platillo al ticket
Avika.ui.addItemToTicket = function() {
    // Obtener datos del platillo
    var item = Avika.ui.state.selectedTicketItem;
    
    if (!item || !item.dish) {
        console.error("No hay platillo seleccionado");
        return;
    }
    
    // Crear copia del item para añadir al ticket
    var ticketItem = {
        dish: item.dish,
        quantity: item.quantity,
        customizations: item.customizations.slice(),
        id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
    };
    
    // Añadir al ticket
    Avika.ui.state.ticketItems.push(ticketItem);
    
    // Actualizar lista de platillos
    Avika.ui.updateTicketItemsList();
    
    // Cerrar modal de selección
    var modal = document.getElementById('ticket-item-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Actualizar lista de platillos en el ticket
Avika.ui.updateTicketItemsList = function() {
    var container = document.getElementById('ticket-items-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Verificar si hay platillos
    if (Avika.ui.state.ticketItems.length === 0) {
        var emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-ticket';
        emptyMessage.textContent = 'No hay platillos añadidos';
        container.appendChild(emptyMessage);
        return;
    }
    
    // Crear lista de platillos
    var ticketList = document.createElement('ul');
    ticketList.className = 'ticket-items';
    
    for (var i = 0; i < Avika.ui.state.ticketItems.length; i++) {
        var item = Avika.ui.state.ticketItems[i];
        
        var listItem = document.createElement('li');
        listItem.className = 'ticket-item';
        listItem.setAttribute('data-item-id', item.id);
        
        // Información del platillo
        var itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        
        // Nombre y cantidad
        var itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = (item.quantity > 1 ? item.quantity + 'x ' : '') + item.dish;
        itemInfo.appendChild(itemName);
        
        // Personalizaciones
        if (item.customizations && item.customizations.length > 0) {
            var itemCustomizations = document.createElement('span');
            itemCustomizations.className = 'item-customizations';
            itemCustomizations.textContent = item.customizations.join(', ');
            itemInfo.appendChild(itemCustomizations);
        }
        
        listItem.appendChild(itemInfo);
        
        // Botón de eliminar
        var removeButton = document.createElement('button');
        removeButton.className = 'remove-item';
        removeButton.textContent = '×';
        removeButton.setAttribute('data-index', i);
        
        // Evento de clic
        removeButton.onclick = function() {
            var index = parseInt(this.getAttribute('data-index'));
            Avika.ui.removeTicketItem(index);
        };
        
        listItem.appendChild(removeButton);
        ticketList.appendChild(listItem);
    }
    
    container.appendChild(ticketList);
};

// Eliminar platillo del ticket
Avika.ui.removeTicketItem = function(index) {
    // Validar índice
    if (index < 0 || index >= Avika.ui.state.ticketItems.length) {
        console.error("Índice de platillo inválido");
        return;
    }
    
    // Eliminar platillo
    Avika.ui.state.ticketItems.splice(index, 1);
    
    // Actualizar lista
    Avika.ui.updateTicketItemsList();
};

// Guardar ticket
Avika.ui.saveTicket = function() {
    // Verificar si hay platillos
    if (Avika.ui.state.ticketItems.length === 0) {
        Avika.ui.showNotification('No hay platillos en el ticket', 'warning');
        return;
    }
    
    // Generar ID único para el ticket
    var ticketId = 'ticket_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // Crear órdenes para cada platillo
    for (var i = 0; i < Avika.ui.state.ticketItems.length; i++) {
        var item = Avika.ui.state.ticketItems[i];
        
        // Crear orden
        var order = {
            dish: item.dish,
            quantity: item.quantity,
            serviceType: Avika.ui.state.ticketService,
            customizations: item.customizations,
            ticketId: ticketId,
            id: item.id || ('order_' + Date.now() + '_' + i),
            startTime: new Date().toISOString(),
            category: this.getCategoryForDish(item.dish)
        };
        
        // Verificar si es un combo especial
        if (Avika.config.specialCombos && Avika.config.specialCombos.includes(item.dish)) {
            order.isSpecialCombo = true;
            order.hotKitchenFinished = false;
            order.coldKitchenFinished = false;
        }
        
        // Formatear hora de inicio
        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
            order.startTimeFormatted = Avika.utils.formatTime(new Date(order.startTime));
        } else {
            // Implementación de respaldo
            var date = new Date(order.startTime);
            var hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
            var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            var seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
            order.startTimeFormatted = hours + ':' + minutes + ':' + seconds;
        }
        
        // Añadir a órdenes pendientes
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        Avika.data.pendingOrders.push(order);
    }
    
    // Guardar datos
    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
        Avika.storage.guardarDatosLocales();
    }
    
    // Actualizar tabla de pendientes
    if (typeof Avika.ui.updatePendingTable === 'function') {
        Avika.ui.updatePendingTable();
    }
    
    // Mostrar notificación
    Avika.ui.showNotification('Ticket creado con éxito', 'success');
    
    // Cerrar modal
    var modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Resetear estado
    Avika.ui.state.ticketMode = false;
    Avika.ui.state.ticketItems = [];
    
    // Mostrar sección de categorías
    Avika.ui.showSection('categories-section');
};

// Obtener categoría para un platillo
Avika.ui.getCategoryForDish = function(dishName) {
    // Buscar en todas las categorías
    for (var categoryName in Avika.config.menu) {
        var category = Avika.config.menu[categoryName];
        
        // Verificar si la categoría tiene subcategorías
        if (category.subcategories) {
            // Buscar en subcategorías
            for (var subcategoryName in category.subcategories) {
                var dishes = category.subcategories[subcategoryName];
                if (dishes.includes(dishName)) {
                    return categoryName;
                }
            }
        } else if (Array.isArray(category)) {
            // Categoría sin subcategorías
            if (category.includes(dishName)) {
                return categoryName;
            }
        }
    }
    
    return 'sin-categoria';
};

// Cancelar ticket
Avika.ui.cancelTicket = function() {
    // Resetear estado
    Avika.ui.state.ticketMode = false;
    Avika.ui.state.ticketItems = [];
    
    // Cerrar modal
    var modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Mostrar sección de categorías
    Avika.ui.showSection('categories-section');
};
