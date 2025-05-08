// ui-filters.js - Funciones para filtrado y búsqueda
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Función para filtrar platillos por búsqueda
Avika.ui.filterDishes = function(searchText) {
    searchText = searchText.toLowerCase().trim();
    
    // Obtener todos los botones de platillos
    var dishButtons = document.querySelectorAll('.dish-button');
    var visibleCount = 0;
    
    // Recorrer todos los botones
    for (var i = 0; i < dishButtons.length; i++) {
        var button = dishButtons[i];
        var dishName = button.getAttribute('data-dish-name').toLowerCase();
        
        // Mostrar u ocultar según la búsqueda
        if (searchText === '' || dishName.includes(searchText)) {
            button.style.display = 'block';
            visibleCount++;
        } else {
            button.style.display = 'none';
        }
    }
    
    // Mostrar mensaje si no hay resultados
    var noResultsMessage = document.getElementById('no-search-results');
    if (noResultsMessage) {
        if (visibleCount === 0 && searchText !== '') {
            noResultsMessage.style.display = 'block';
            noResultsMessage.textContent = 'No se encontraron platillos para: "' + searchText + '"';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }
    
    return visibleCount;
};

// Función para filtrar platillos en el modal de tickets
Avika.ui.filterTicketDishes = function(searchText) {
    searchText = searchText.toLowerCase().trim();
    
    // Obtener todos los botones de platillos en el modal
    var dishButtons = document.querySelectorAll('#ticket-dish-selection .dish-button');
    var visibleCount = 0;
    
    // Si no hay botones de platillos, crear mensaje de error
    if (!dishButtons || dishButtons.length === 0) {
        this.showTicketSearchError('No hay platillos disponibles para filtrar');
        return 0;
    }
    
    // Recorrer todos los botones
    for (var i = 0; i < dishButtons.length; i++) {
        var button = dishButtons[i];
        var dishName = button.getAttribute('data-dish-name');
        
        // Verificar que el botón tenga un nombre de platillo válido
        if (!dishName) continue;
        
        dishName = dishName.toLowerCase();
        
        // Mostrar u ocultar según la búsqueda
        if (searchText === '' || dishName.includes(searchText)) {
            button.style.display = 'block';
            visibleCount++;
        } else {
            button.style.display = 'none';
        }
    }
    
    // Mostrar mensaje si no hay resultados
    var noResultsMessage = document.getElementById('ticket-no-search-results');
    if (!noResultsMessage) {
        // Si no existe el elemento, crearlo
        noResultsMessage = document.createElement('div');
        noResultsMessage.id = 'ticket-no-search-results';
        noResultsMessage.className = 'no-search-results';
        
        // Buscar el contenedor donde insertarlo
        var container = document.getElementById('ticket-dish-selection');
        if (container) {
            container.appendChild(noResultsMessage);
        } else {
            // Si no hay contenedor, insertarlo al inicio del modal
            var modal = document.getElementById('ticket-modal');
            if (modal && modal.querySelector('.modal-body')) {
                modal.querySelector('.modal-body').appendChild(noResultsMessage);
            }
        }
    }
    
    // Actualizar mensaje
    if (visibleCount === 0 && searchText !== '') {
        noResultsMessage.style.display = 'block';
        noResultsMessage.textContent = 'No se encontraron platillos para: "' + searchText + '"';
        
        // Notificar al usuario si es una búsqueda sustancial
        if (searchText.length > 2) {
            if (typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('No se encontraron platillos para: "' + searchText + '"', 'info');
            }
        }
    } else {
        noResultsMessage.style.display = 'none';
    }
    
    return visibleCount;
};

// Mostrar error en la búsqueda de tickets
Avika.ui.showTicketSearchError = function(message) {
    var errorContainer = document.getElementById('ticket-no-search-results');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'ticket-no-search-results';
        errorContainer.className = 'no-search-results error';
        
        // Buscar el contenedor donde insertarlo
        var container = document.getElementById('ticket-dish-selection');
        if (container) {
            container.appendChild(errorContainer);
        } else {
            // Si no hay contenedor, insertarlo al inicio del modal
            var modal = document.getElementById('ticket-modal');
            if (modal && modal.querySelector('.modal-body')) {
                modal.querySelector('.modal-body').appendChild(errorContainer);
            }
        }
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Notificar al usuario
    if (typeof Avika.ui.showNotification === 'function') {
        Avika.ui.showNotification(message, 'error');
    }
};

// Función para aplicar filtros a la tabla de órdenes pendientes
Avika.ui.aplicarFiltros = function() {
    var categoryFilter = document.getElementById('filter-category').value;
    var serviceFilter = document.getElementById('filter-service').value;
    var timeFilter = document.getElementById('filter-time').value;
    
    // Obtener todas las filas de órdenes pendientes
    var rows = document.querySelectorAll('#pending-orders-body tr');
    var visibleCount = 0;
    
    // Recorrer todas las filas
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var shouldShow = true;
        
        // Verificar si es una fila vacía
        if (row.classList.contains('empty-table')) {
            continue;
        }
        
        // Obtener datos de la orden
        var orderData = this.obtenerDatosOrdenDeFila(row);
        
        // Aplicar filtro de categoría
        if (categoryFilter !== 'todos' && orderData.category !== categoryFilter) {
            shouldShow = false;
        }
        
        // Aplicar filtro de servicio
        if (serviceFilter !== 'todos' && orderData.service !== serviceFilter) {
            shouldShow = false;
        }
        
        // Aplicar filtro de tiempo
        if (timeFilter !== 'todos') {
            var timeThreshold = parseInt(timeFilter) * 60; // Convertir minutos a segundos
            if (orderData.elapsedTime < timeThreshold) {
                shouldShow = false;
            }
        }
        
        // Mostrar u ocultar la fila
        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
    
    // Mostrar mensaje si no hay resultados
    var pendingBody = document.getElementById('pending-orders-body');
    if (pendingBody && visibleCount === 0) {
        var emptyRow = document.createElement('tr');
        emptyRow.className = 'filter-empty-row';
        emptyRow.innerHTML = '<td colspan="5" class="empty-table">No hay órdenes que coincidan con los filtros</td>';
        pendingBody.appendChild(emptyRow);
    } else {
        var emptyFilterRow = pendingBody.querySelector('.filter-empty-row');
        if (emptyFilterRow) {
            emptyFilterRow.remove();
        }
    }
};

// Función para obtener datos de una orden a partir de una fila
Avika.ui.obtenerDatosOrdenDeFila = function(fila) {
    var result = {
        id: '',
        category: '',
        service: '',
        elapsedTime: 0
    };
    
    // Primero intentar obtener el ID de la orden desde el atributo data-order-id
    var orderId = fila.getAttribute('data-order-id');
    if (orderId) {
        result.id = orderId;
        
        // Intentar obtener la orden directamente desde Avika.data
        var order = this.findOrderById(orderId);
        if (order) {
            // Si encontramos la orden en los datos, usamos esos valores
            result.category = (order.category || '').toLowerCase();
            result.service = order.serviceType || 'comedor';
            
            // Calcular tiempo transcurrido desde el inicio
            if (order.startTime) {
                result.elapsedTime = this.calcularTiempoTranscurrido(order.startTime);
                return result; // Retornar inmediatamente ya que tenemos todos los datos
            }
        }
    }
    
    // Si no se pudo obtener la orden desde Avika.data, extraer datos del DOM como respaldo
    
    // Obtener categoría
    var categorySpan = fila.querySelector('.category-type');
    if (categorySpan) {
        result.category = categorySpan.textContent.toLowerCase();
    }
    
    // Obtener servicio
    var serviceSpan = fila.querySelector('.service-type');
    if (serviceSpan) {
        result.service = this.extraerServicioDeFila(fila);
    }
    
    // Obtener tiempo transcurrido
    var startTimeElement = fila.querySelector('.elapsed');
    if (startTimeElement) {
        var startTimeStr = startTimeElement.getAttribute('data-start-time');
        if (startTimeStr) {
            result.elapsedTime = this.calcularTiempoTranscurrido(startTimeStr);
        }
    }
    
    return result;
};

// Función eficiente para encontrar una orden por su ID - Usando implementación centralizada
Avika.ui.findOrderById = function(orderId) {
    // Usar la implementación centralizada en Avika.utils
    return Avika.utils.findOrderById(orderId);
};

// Extraer servicio del texto en la celda de detalles
Avika.ui.extraerServicioDeFila = function(fila) {
    var serviceSpan = fila.querySelector('.service-type');
    if (!serviceSpan) return 'comedor'; // Valor por defecto
    
    if (serviceSpan.classList.contains('domicilio')) return 'domicilio';
    if (serviceSpan.classList.contains('para-llevar')) return 'para-llevar';
    return 'comedor';
};

// Calcular tiempo transcurrido en segundos
Avika.ui.calcularTiempoTranscurrido = function(inicioStr) {
    try {
        var inicio = new Date(inicioStr);
        var ahora = new Date();
        return Math.floor((ahora - inicio) / 1000);
    } catch (e) {
        console.error("Error al calcular tiempo transcurrido:", e);
        return 0;
    }
};

// Función para limpiar filtros
Avika.ui.limpiarFiltros = function() {
    // Restablecer selectores
    var categoryFilter = document.getElementById('filter-category');
    var serviceFilter = document.getElementById('filter-service');
    var timeFilter = document.getElementById('filter-time');
    
    if (categoryFilter) categoryFilter.value = 'todos';
    if (serviceFilter) serviceFilter.value = 'todos';
    if (timeFilter) timeFilter.value = 'todos';
    
    // Mostrar todas las filas
    var rows = document.querySelectorAll('#pending-orders-body tr');
    for (var i = 0; i < rows.length; i++) {
        if (!rows[i].classList.contains('empty-table')) {
            rows[i].style.display = '';
        }
    }
    
    // Eliminar mensaje de filtro vacío
    var emptyFilterRow = document.querySelector('.filter-empty-row');
    if (emptyFilterRow) {
        emptyFilterRow.remove();
    }
};

// Función para aplicar filtros a la tabla de reparto
Avika.ui.filtrarReparto = function(tiempoMinutos) {
    // Obtener todas las filas de órdenes en reparto
    var rows = document.querySelectorAll('#delivery-orders-body tr');
    var visibleCount = 0;
    
    // Recorrer todas las filas
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var shouldShow = true;
        
        // Verificar si es una fila vacía
        if (row.classList.contains('empty-table')) {
            continue;
        }
        
        // Aplicar filtro de tiempo
        if (tiempoMinutos > 0) {
            var elapsedElement = row.querySelector('.delivery-elapsed');
            if (elapsedElement) {
                var departureTimeStr = elapsedElement.getAttribute('data-departure-time');
                if (departureTimeStr) {
                    var elapsedSeconds = this.calcularTiempoTranscurrido(departureTimeStr);
                    var thresholdSeconds = tiempoMinutos * 60;
                    
                    if (elapsedSeconds < thresholdSeconds) {
                        shouldShow = false;
                    }
                }
            }
        }
        
        // Mostrar u ocultar la fila
        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
};

// Función para limpiar filtros de reparto
Avika.ui.limpiarFiltrosReparto = function() {
    // Mostrar todas las filas
    var rows = document.querySelectorAll('#delivery-orders-body tr');
    for (var i = 0; i < rows.length; i++) {
        if (!rows[i].classList.contains('empty-table')) {
            rows[i].style.display = '';
        }
    }
};

// Función para realizar búsqueda global de platillos en todas las categorías
Avika.ui.performGlobalDishSearch = function(searchText) {
    searchText = searchText.toLowerCase().trim();
    
    // Obtener el contenedor de resultados
    var resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) {
        console.error("Contenedor de resultados de búsqueda no encontrado");
        // Crear el contenedor si no existe
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'global-search-results';
        resultsContainer.className = 'search-results-container';
        
        // Intentar insertarlo en el DOM
        var dishesSection = document.getElementById('dishes-section');
        if (dishesSection) {
            dishesSection.appendChild(resultsContainer);
        } else {
            // Si no hay sección de platillos, insertarlo en el body
            document.body.appendChild(resultsContainer);
        }
    }
    
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = '';
    
    // Si la búsqueda está vacía, no mostrar resultados
    if (searchText === '') {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Verificar que el menú esté disponible
    if (!Avika.config || !Avika.config.menu) {
        this.showGlobalSearchError('El menú no está disponible para búsqueda', resultsContainer);
        return;
    }
    
    // Buscar platillos que coincidan
    var matchingDishes = [];
    var searchStartTime = performance.now();
    var searchTimeout = 500; // Máximo 500ms para la búsqueda
    var timeoutOccurred = false;
    
    try {
        // Recorrer todas las categorías
        for (var categoryName in Avika.config.menu) {
            // Verificar si la búsqueda está tomando demasiado tiempo
            if (performance.now() - searchStartTime > searchTimeout) {
                timeoutOccurred = true;
                break;
            }
            
            var category = Avika.config.menu[categoryName];
            
            // Verificar si la categoría tiene subcategorías
            if (category.subcategories) {
                // Recorrer subcategorías
                for (var subcategoryName in category.subcategories) {
                    var subcategory = category.subcategories[subcategoryName];
                    
                    // Verificar que la subcategoría sea un array
                    if (!Array.isArray(subcategory)) continue;
                    
                    // Recorrer platillos de la subcategoría
                    for (var i = 0; i < subcategory.length; i++) {
                        var dish = subcategory[i];
                        if (typeof dish === 'string' && dish.toLowerCase().includes(searchText)) {
                            matchingDishes.push({
                                name: dish,
                                category: categoryName,
                                subcategory: subcategoryName
                            });
                        }
                    }
                }
            } else if (Array.isArray(category)) {
                // Categoría sin subcategorías
                for (var i = 0; i < category.length; i++) {
                    var dish = category[i];
                    if (typeof dish === 'string' && dish.toLowerCase().includes(searchText)) {
                        matchingDishes.push({
                            name: dish,
                            category: categoryName,
                            subcategory: null
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error durante la búsqueda global de platillos:', error);
        this.showGlobalSearchError('Error durante la búsqueda: ' + error.message, resultsContainer);
        return;
    }
    
    // Mostrar resultados
    if (matchingDishes.length > 0) {
        // Crear encabezado
        var header = document.createElement('h3');
        header.textContent = 'Resultados de búsqueda' + (timeoutOccurred ? ' (parciales)' : '');
        resultsContainer.appendChild(header);
        
        // Crear lista de resultados
        var resultsList = document.createElement('div');
        resultsList.className = 'search-results-list';
        
        // Limitar a 10 resultados para no sobrecargar la interfaz
        var maxResults = Math.min(matchingDishes.length, 10);
        
        for (var i = 0; i < maxResults; i++) {
            var dish = matchingDishes[i];
            
            // Crear botón para el platillo
            var button = document.createElement('button');
            button.className = 'dish-button search-result-button';
            button.setAttribute('data-dish-name', dish.name);
            button.setAttribute('data-category', dish.category);
            if (dish.subcategory) {
                button.setAttribute('data-subcategory', dish.subcategory);
            }
            
            // Texto del botón
            button.textContent = dish.name;
            
            // Etiqueta de categoría
            var categoryLabel = document.createElement('span');
            categoryLabel.className = 'category-label';
            categoryLabel.textContent = dish.category + (dish.subcategory ? ' > ' + dish.subcategory : '');
            button.appendChild(categoryLabel);
            
            // Evento de clic
            button.onclick = function() {
                var dishName = this.getAttribute('data-dish-name');
                var category = this.getAttribute('data-category');
                var subcategory = this.getAttribute('data-subcategory');
                
                // Seleccionar el platillo
                if (typeof Avika.ui.selectDish === 'function') {
                    Avika.ui.selectDish(dishName);
                } else {
                    // Si no existe la función, mostrar notificación
                    if (typeof Avika.ui.showNotification === 'function') {
                        Avika.ui.showNotification('No se puede seleccionar el platillo: ' + dishName, 'error');
                    }
                }
                
                // Ocultar resultados
                resultsContainer.style.display = 'none';
            };
            
            resultsList.appendChild(button);
        }
        
        // Mostrar contador si hay más resultados
        if (matchingDishes.length > maxResults) {
            var moreResults = document.createElement('div');
            moreResults.className = 'more-results';
            moreResults.textContent = '... y ' + (matchingDishes.length - maxResults) + ' resultados más';
            resultsList.appendChild(moreResults);
        }
        
        resultsContainer.appendChild(resultsList);
        resultsContainer.style.display = 'block';
        
        // Mostrar notificación si hubo timeout
        if (timeoutOccurred && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('La búsqueda fue interrumpida por tomar demasiado tiempo. Se muestran resultados parciales.', 'warning');
        }
    } else {
        // Mostrar mensaje de no resultados
        var noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No se encontraron platillos para: "' + searchText + '"';
        resultsContainer.appendChild(noResults);
        resultsContainer.style.display = 'block';
        
        // Mostrar notificación si la búsqueda es sustancial
        if (searchText.length > 2 && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('No se encontraron platillos para: "' + searchText + '"', 'info');
        }
    }
};

// Mostrar error en la búsqueda global
Avika.ui.showGlobalSearchError = function(message, container) {
    if (!container) {
        container = document.getElementById('global-search-results');
        if (!container) return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear mensaje de error
    var errorDiv = document.createElement('div');
    errorDiv.className = 'search-error';
    errorDiv.textContent = message;
    
    container.appendChild(errorDiv);
    container.style.display = 'block';
    
    // Mostrar notificación
    if (typeof Avika.ui.showNotification === 'function') {
        Avika.ui.showNotification(message, 'error');
    }
};
