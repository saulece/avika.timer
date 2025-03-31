// Variables globales (estado)
var currentCategory = '';
var currentDish = '';
var currentCustomizations = [];
var currentService = 'comedor';
var currentQuantity = 1;
var isSpecialCombo = false;

// Arrays para almacenar pedidos
var pendingOrders = [];
var completedOrders = [];
var timerInterval;

// Categorías principales para la interfaz
var categories = [
    {
        id: 'cocina-fria',
        name: 'Cocina Fría',
        icon: '🥶',
        color: '#3498db',
        subcategories: ['entrada-fria', 'roll', 'sashimi', 'sushi']
    },
    {
        id: 'cocina-caliente',
        name: 'Cocina Caliente',
        icon: '🔥',
        color: '#e74c3c',
        subcategories: ['entrada-caliente', 'arroz-pasta', 'carne-pollo', 'pescado-marisco']
    },
    {
        id: 'combos',
        name: 'Combos',
        icon: '🍱',
        color: '#9b59b6',
        subcategories: []
    },
    {
        id: 'bebidas',
        name: 'Bebidas',
        icon: '🥤',
        color: '#2ecc71',
        subcategories: []
    },
    {
        id: 'postres',
        name: 'Postres',
        icon: '🍨',
        color: '#f39c12',
        subcategories: []
    }
];

// Subcategorías detalladas
var subcategories = {
    // Cocina Fría
    'entrada-fria': {
        name: 'Entradas Frías',
        icon: '🥗',
        color: '#3498db'
    },
    'roll': {
        name: 'Rollos',
        icon: '🍣',
        color: '#3498db'
    },
    'sashimi': {
        name: 'Sashimi',
        icon: '🐟',
        color: '#3498db'
    },
    'sushi': {
        name: 'Sushi / Onigiri',
        icon: '🍙',
        color: '#3498db'
    },
    
    // Cocina Caliente
    'entrada-caliente': {
        name: 'Entradas Calientes',
        icon: '🍢',
        color: '#e74c3c'
    },
    'arroz-pasta': {
        name: 'Arroz y Pasta',
        icon: '🍚',
        color: '#e74c3c'
    },
    'carne-pollo': {
        name: 'Carnes y Pollos',
        icon: '🍗',
        color: '#e74c3c'
    },
    'pescado-marisco': {
        name: 'Pescados y Mariscos',
        icon: '🦞',
        color: '#e74c3c'
    }
};

// Platillos organizados por subcategoría
var dishes = {
    // Entradas Frías
    'entrada-fria': [
        { id: 'baby-squid', name: 'Baby Squid', price: 180, special: true },
        { id: 'tiradito-atun', name: 'Tiradito de Atún Togarashi', price: 200 },
        { id: 'tiradito-camaron', name: 'Tiradito de Camarón', price: 210, special: true },
        { id: 'maguro-peruano', name: 'Maguro Peruano', price: 210, special: true },
        { id: 'tostadita-nikkei', name: 'Tostadita Nikkei', price: 195 },
        { id: 'tostada-ceviche-verde', name: 'Tostada de Ceviche Verde', price: 195 },
        { id: 'tostadita-tataki', name: 'Tostadita Tataki', price: 195 },
        { id: 'tostadita-crunchy', name: 'Tostadita Crunchy', price: 195, special: true },
        { id: 'cocktail-avika', name: 'Cocktail Avika', price: 200 },
        { id: 'ceviche-limeno', name: 'Ceviche Limeño', price: 210 },
        { id: 'ceviche-peruano', name: 'Ceviche Peruano', price: 210 }
    ],
    
    // Sashimi
    'sashimi': [
        { id: 'sashimi-robalo', name: 'Sashimi de Robalo', price: 205 },
        { id: 'sashimi-atun', name: 'Sashimi de Atún', price: 215 },
        { id: 'sashimi-mixto', name: 'Sashimi Mixto', price: 225 },
        { id: 'sashimi-salmon', name: 'Sashimi de Salmón', price: 255 }
    ],
    
    // Rollos
    'roll': [
        // Naturales
        { id: 'kanikama-roll', name: 'Kanikama Roll', price: 170, category: 'Natural' },
        { id: 'curry-roll', name: 'Curry Roll', price: 170, category: 'Natural' },
        { id: 'philadelphia-roll', name: 'Philadelphia Roll', price: 175, category: 'Natural' },
        { id: 'spicy-roll', name: 'Spicy Roll', price: 175, category: 'Natural', special: true },
        { id: 'aguacate-roll', name: 'Aguacate Roll', price: 175, category: 'Natural' },
        { id: 'avi-roll', name: 'Avi Roll', price: 180, category: 'Natural' },
        { id: 'mango-roll', name: 'Mango Roll', price: 185, category: 'Natural' },
        { id: 'mikuso-roll', name: 'Mikuso Roll', price: 185, category: 'Natural' },
        { id: 'acevichado-roll', name: 'Acevichado Roll', price: 190, category: 'Natural' },
        { id: 'dragon-roll', name: 'Dragon Roll', price: 195, category: 'Natural' },
        
        // Empanizados
        { id: 'furai-roll', name: 'Furai Roll', price: 190, category: 'Empanizado' },
        { id: 'coco-roll', name: 'Coco Roll', price: 195, category: 'Empanizado' },
        { id: 'red-fire-roll', name: 'Red Fire Roll', price: 195, category: 'Empanizado', special: true },
        { id: 'ebi-crunch-roll', name: 'Ebi Crunch Roll', price: 195, category: 'Empanizado', special: true },
        { id: 'teriyaki-crunch-roll', name: 'Teriyaki Crunch Roll', price: 210, category: 'Empanizado' },
        { id: 'tnt-roll', name: 'TNT Roll', price: 210, category: 'Empanizado', special: true },
        { id: 'ika-ebi-roll', name: 'Ika Ebi Roll', price: 225, category: 'Empanizado' },
        
        // Horneados
        { id: 'tuna-roll', name: 'Tuna Roll', price: 200, category: 'Horneado' },
        { id: 'rocotto-roll', name: 'Rocotto Roll', price: 200, category: 'Horneado', special: true },
        { id: 'parrillero-roll', name: 'Parrillero Roll', price: 200, category: 'Horneado' },
        { id: 'rib-eye-roll', name: 'Rib Eye Roll', price: 220, category: 'Horneado', special: true },
        { id: 'avika-roll', name: 'Avika Roll', price: 200, category: 'Horneado', special: true }
    ],
    
    // Sushi / Onigiri
    'sushi': [
        { id: 'onigiri-cangrejo', name: 'Onigiri Cangrejo', price: 175 },
        { id: 'onigiri-pollo', name: 'Onigiri Pollo', price: 185 },
        { id: 'onigiri-res', name: 'Onigiri Res', price: 195 },
        { id: 'onigiri-camaron', name: 'Onigiri Camarón', price: 195 }
    ],
    
    // Entradas Calientes
    'entrada-caliente': [
        { id: 'kushiage', name: 'Kushiage', price: 160, options: true },
        { id: 'rollitos-kani', name: 'Rollitos Kani', price: 170 },
        { id: 'toritos-tempura', name: 'Toritos Tempura', price: 180, special: true, options: true },
        { id: 'taquitos-crujientes', name: 'Taquitos Crujientes', price: 160, special: true },
        { id: 'tacos-nikkei', name: 'Tacos Nikkei', price: 195 },
        { id: 'tacos-costra-queso', name: 'Tacos de Costra de Queso', price: 190, options: true },
        { id: 'brocheta-yakitori', name: 'Brocheta Yakitori', price: 170, options: true },
        { id: 'ika-ebi-togarashi', name: 'Ika Ebi Togarashi', price: 230, special: true },
        { id: 'miso-shiro', name: 'Miso Shiro', price: 150 },
        { id: 'sopa-udon', name: 'Sopa Udon', price: 175, options: true },
        { id: 'sopa-ramen', name: 'Sopa Ramen de Cerdo', price: 180 },
        { id: 'sopa-mariscos-thai', name: 'Sopa Mariscos Thai', price: 190 }
    ],
    
    // Arroz y Pasta
    'arroz-pasta': [
        { id: 'arroz-yakimeshi', name: 'Arroz Yakimeshi', price: 225, options: true },
        { id: 'arroz-peruano', name: 'Arroz Peruano', price: 200 },
        { id: 'arroz-wok', name: 'Arroz Wok', price: 200 },
        { id: 'arroz-thai-mariscos', name: 'Arroz Thai con Mariscos', price: 220 },
        { id: 'yakisoba', name: 'Yakisoba', price: 235, options: true }
    ],
    
    // Carnes y Pollos
    'carne-pollo': [
        { id: 'nuggets', name: 'Nuggets', price: 200 },
        { id: 'pechuga-teriyaki', name: 'Pechuga Teriyaki', price: 240 },
        { id: 'lomo-saltado', name: 'Lomo Saltado', price: 250 },
        { id: 'rib-eye-grill', name: 'Rib Eye Grill', price: 320 }
    ],
    
    // Pescados y Mariscos
    'pescado-marisco': [
        { id: 'camaron-nutty', name: 'Camarón Nutty', price: 260 },
        { id: 'camaron-iwa', name: 'Camarón Iwa', price: 280 },
        { id: 'pasta-de-mar', name: 'Pasta de Mar', price: 280 },
        { id: 'ebi-chips', name: 'Ebi Chips', price: 280, special: true },
        { id: 'pulpo-marine', name: 'Pulpo Marine', price: 300, special: true },
        { id: 'tuna-thai', name: 'Tuna Thai', price: 280 },
        { id: 'atun-rocotto', name: 'Atún salsa Rocotto', price: 280 },
        { id: 'filete-thai-asia', name: 'Filete Thai Asia', price: 290 },
        { id: 'filete-ninjago', name: 'Filete Ninjago', price: 290 },
        { id: 'filete-zakana-thai', name: 'Filete Zakana Thai', price: 290, special: true },
        { id: 'salmon-kion', name: 'Salmón Kion', price: 290, special: true },
        { id: 'sake-new-style', name: 'Sake New Style', price: 310 },
        { id: 'pargo-ika-ebi', name: 'Pargo al Ika Ebi', price: 450 }
    ],
    
    // Combos (se mantienen igual)
    'combos': [
        { id: 'combo-tokio', name: 'Combo Tokio', price: 350, special: true },
        { id: 'combo-osaka', name: 'Combo Osaka', price: 350, special: true },
        { id: 'combo-bagua', name: 'Combo Bagua', price: 380, special: true },
        { id: 'combo-pisco', name: 'Combo Pisco', price: 400 },
        { id: 'combo-lima', name: 'Combo Lima', price: 420 }
    ]
};

// Opciones de personalización
var customizationOptions = {
    'general': [
        { id: 'sin-alga', name: 'Sin Alga' },
        { id: 'extra-picante', name: 'Extra Picante' },
        { id: 'cambio-proteina', name: 'Cambiar Proteína' },
        { id: 'sin-cebolla', name: 'Sin Cebolla' },
        { id: 'sin-aguacate', name: 'Sin Aguacate' }
    ],
    'sushi': [
        { id: 'empanizado-extra', name: 'Empanizado Extra', price: 25 }
    ],
    'proteinas': [
        { id: 'pollo', name: 'Pollo' },
        { id: 'res', name: 'Res' },
        { id: 'camaron', name: 'Camarón' },
        { id: 'mixto', name: 'Mixto' },
        { id: 'vegetales', name: 'Vegetales' }
    ]
};

// Renderiza las categorías principales
function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.style.backgroundColor = category.color;
        btn.setAttribute('data-category', category.id);
        
        btn.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
        `;
        
        btn.addEventListener('click', () => selectCategory(category));
        container.appendChild(btn);
    });
}

// Maneja la selección de categoría
function selectCategory(category) {
    currentCategory = category.id;
    
    // Actualiza header
    document.getElementById('selected-category-title').textContent = category.name;
    
    if (category.subcategories.length > 0) {
        // Tiene subcategorías - mostrar subcategorías
        showSubcategories(category);
    } else {
        // No tiene subcategorías - mostrar directamente los platillos
        showDishes(category.id);
    }
    
    // Muestra sección de platillos
    document.getElementById('categories-section').style.display = 'none';
    document.getElementById('dishes-section').style.display = 'block';
}

// Muestra subcategorías
function showSubcategories(category) {
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    // Encabezado para subcategorías 
    const header = document.createElement('div');
    header.className = 'subcategory-header';
    header.innerHTML = `<h3>Selecciona una categoría de ${category.name}</h3>`;
    container.appendChild(header);
    
    // Renderiza cada subcategoría
    category.subcategories.forEach(subId => {
        const subcat = subcategories[subId];
        const btn = document.createElement('button');
        btn.className = 'dish-btn subcategory-btn';
        btn.style.borderColor = subcat.color;
        
        btn.innerHTML = `
            <span class="subcategory-icon">${subcat.icon}</span>
            <span class="subcategory-name">${subcat.name}</span>
        `;
        
        btn.addEventListener('click', () => {
            showDishes(subId);
            // Actualiza el título para mostrar subcategoría
            document.getElementById('selected-category-title').textContent = subcat.name;
        });
        
        container.appendChild(btn);
    });
}

// Muestra platillos de una categoría o subcategoría
function showDishes(categoryId) {
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    // Si no hay platillos disponibles
    if (!dishes[categoryId] || dishes[categoryId].length === 0) {
        container.innerHTML = '<p class="no-dishes">No hay platillos disponibles en esta categoría</p>';
        return;
    }
    
    // Organizar platillos por subcategoría si aplica (ejemplo: los rollos)
    const dishGroups = {};
    dishes[categoryId].forEach(dish => {
        if (dish.category) {
            if (!dishGroups[dish.category]) {
                dishGroups[dish.category] = [];
            }
            dishGroups[dish.category].push(dish);
        } else {
            if (!dishGroups['default']) {
                dishGroups['default'] = [];
            }
            dishGroups['default'].push(dish);
        }
    });
    
    // Renderizar platillos por grupos
    const groupKeys = Object.keys(dishGroups);
    
    // Si hay grupos, mostrarlos con encabezados
    if (groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== 'default')) {
        groupKeys.forEach(group => {
            // Encabezado de grupo
            if (group !== 'default') {
                const header = document.createElement('div');
                header.className = 'dish-group-header';
                header.innerHTML = `<h4>${group}</h4>`;
                container.appendChild(header);
            }
            
            // Platillos del grupo
            dishGroups[group].forEach(dish => {
                renderDishButton(dish, container);
            });
        });
    } else {
        // Si no hay grupos, mostrar platillos directamente
        dishes[categoryId].forEach(dish => {
            renderDishButton(dish, container);
        });
    }
}

// Renderiza un botón de platillo
function renderDishButton(dish, container) {
    const btn = document.createElement('button');
    btn.className = 'dish-btn';
    if (dish.special) {
        btn.className += ' special-combo';
    }
    
    // Formato de precio en pesos mexicanos
    const formattedPrice = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    }).format(dish.price);
    
    btn.innerHTML = `
        <span class="dish-name">${dish.name}</span>
        <span class="dish-price">${formattedPrice}</span>
    `;
    
    btn.addEventListener('click', () => selectDish(dish));
    container.appendChild(btn);
}

// Maneja la selección de un platillo
function selectDish(dish) {
    currentDish = dish.id;
    
    // Actualiza el título del platillo seleccionado
    document.getElementById('selected-dish-title').textContent = dish.name;
    
    // Carga opciones de personalización apropiadas
    loadCustomizationOptions(dish);
    
    // Muestra sección de preparación
    document.getElementById('dishes-section').style.display = 'none';
    document.getElementById('preparation-section').style.display = 'block';
}

// Carga opciones de personalización para el platillo
function loadCustomizationOptions(dish) {
    const optionsContainer = document.getElementById('personalization-options');
    optionsContainer.innerHTML = '';
    
    // Limpia contenedores adicionales de proteínas si existen
    const proteinContainer = document.getElementById('protein-options');
    if (proteinContainer) {
        proteinContainer.remove();
    }
    
    // Agrega opciones generales siempre
    customizationOptions.general.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.name;
        btn.setAttribute('data-option', option.id);
        
        btn.addEventListener('click', (e) => {
            e.target.classList.toggle('selected');
            updateCustomizations();
        });
        
        optionsContainer.appendChild(btn);
    });
    
    // Si es un platillo con opciones específicas, mostrar opciones de proteína
    if (dish.options) {
        // Encabezado para opciones de proteína
        const header = document.createElement('div');
        header.className = 'option-title mt-3';
        header.textContent = 'Proteína';
        document.getElementById('personalization-section').appendChild(header);
        
        // Contenedor para opciones de proteína
        const proteinContainer = document.createElement('div');
        proteinContainer.className = 'option-btns';
        proteinContainer.id = 'protein-options';
        
        // Agrega opciones de proteína
        customizationOptions.proteinas.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.name;
            btn.setAttribute('data-protein', option.id);
            
            btn.addEventListener('click', (e) => {
                // Quita selección de otros botones de proteína
                document.querySelectorAll('[data-protein]').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Selecciona este botón
                e.target.classList.add('selected');
                updateCustomizations();
            });
            
            proteinContainer.appendChild(btn);
        });
        
        document.getElementById('personalization-section').appendChild(proteinContainer);
    }
    
    // Si es un platillo de sushi y ofrece empanizado extra
    if (currentCategory === 'roll') {
        customizationOptions.sushi.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn premium-option';
            btn.innerHTML = `${option.name} <small>(+$${option.price})</small>`;
            btn.setAttribute('data-option', option.id);
            
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('selected');
                updateCustomizations();
            });
            
            optionsContainer.appendChild(btn);
        });
    }
}

// Actualiza la lista de personalizaciones basada en las selecciones
function updateCustomizations() {
    currentCustomizations = [];
    
    // Recolecta opciones seleccionadas
    document.querySelectorAll('.option-btn.selected').forEach(el => {
        if (el.hasAttribute('data-option')) {
            currentCustomizations.push(el.getAttribute('data-option'));
        }
        
        if (el.hasAttribute('data-protein')) {
            currentCustomizations.push(`proteina-${el.getAttribute('data-protein')}`);
        }
    });
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Asignar clase según tipo
    notification.className = '';
    notification.classList.add('notification', `notification-${type}`);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatear hora
function formatTime(date) {
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Agregar ceros iniciales
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Obtener nombre del servicio
function getServiceName(serviceId) {
    const services = {
        'comedor': 'Comedor',
        'domicilio': 'Domicilio',
        'para-llevar': 'Ordena y Espera'
    };
    return services[serviceId] || serviceId;
}

// Obtener botón de acción según tipo de pedido
function getActionButton(order) {
    if (order.service === 'domicilio') {
        if (!order.deliveryDepartureTime) {
            return `<button class="finish-btn delivery" onclick="markDeliveryDeparture('${order.id}')">Salida</button>`;
        } else if (!order.deliveryArrivalTime) {
            return `<button class="finish-btn delivery-arrived" onclick="markDeliveryArrival('${order.id}')">Entregado</button>`;
        }
    }
    
    let btnClass = '';
    if (order.category.includes('fria') || order.category === 'roll' || order.category === 'sashimi' || order.category === 'sushi') {
        btnClass = 'cold-kitchen';
    } else {
        btnClass = 'hot-kitchen';
    }
    
    return `<button class="finish-btn ${btnClass}" onclick="finishPreparation('${order.id}')">Finalizar</button>`;
}

// Actualiza tabla de pedidos pendientes
function updatePendingTable() {
    const tableBody = document.getElementById('pending-body');
    const pendingCount = document.getElementById('pending-count');
    
    // Actualiza contador
    pendingCount.textContent = pendingOrders.length;
    
    // Limpia tabla
    tableBody.innerHTML = '';
    
    // Si no hay pedidos
    if (pendingOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="empty-message">No hay platillos en preparación</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Agrega cada pedido a la tabla
    pendingOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Calcula tiempo transcurrido
        const now = new Date();
        const startTime = new Date(order.startTime);
        const elapsedMs = now - startTime;
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        const mins = Math.floor(elapsedSecs / 60);
        const secs = elapsedSecs % 60;
        
        // Determina clase CSS según tiempo transcurrido
        let timerClass = '';
        if (mins >= 10) {
            timerClass = 'alert';
        } else if (mins >= 5) {
            timerClass = 'warning';
        }
        
        // Información a mostrar
        const customInfo = order.customizations.length > 0 
            ? `<strong>Personalización:</strong> ${order.customizations.join(', ')}<br>` 
            : '';
        const serviceInfo = `<strong>Servicio:</strong> ${getServiceName(order.service)}<br>`;
        const quantityInfo = order.quantity > 1 ? `<strong>Cantidad:</strong> ${order.quantity}<br>` : '';
        const notesInfo = order.notes ? `<strong>Notas:</strong> ${order.notes}` : '';
        
        row.innerHTML = `
            <td>${order.dish}</td>
            <td>${order.startTimeFormatted}</td>
            <td class="timer-cell ${timerClass}">${padZero(mins)}:${padZero(secs)}</td>
            <td class="details-cell">
                ${customInfo}
                ${serviceInfo}
                ${quantityInfo}
                ${notesInfo}
            </td>
            <td>
                ${getActionButton(order)}
            </td>