// js/modules/dashboard.js - Módulo para monitoreo en tiempo real
(function() {
    window.Avika = window.Avika || {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('dashboard');
    }
    
    // Estado del tablero
    var updateInterval = null;
    var isActive = false;
    
    // Objeto principal
    Avika.dashboard = {
        // Iniciar monitoreo
        start: function() {
            if (isActive) return;
            
            console.log("Iniciando monitoreo en tiempo real");
            isActive = true;
            
            // Crear contenedor del tablero si no existe
            this.createDashboardContainer();
            
            // Iniciar actualización periódica
            updateInterval = setInterval(this.updateDashboard.bind(this), 5000);
            
            // Actualizar inmediatamente
            this.updateDashboard();
            
            return true;
        },
        
        // Detener monitoreo
        stop: function() {
            if (!isActive) return;
            
            console.log("Deteniendo monitoreo en tiempo real");
            isActive = false;
            
            // Limpiar intervalo
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
            
            // Ocultar dashboard
            var container = document.getElementById('dashboard-container');
            if (container) {
                container.style.display = 'none';
            }
            
            return true;
        },
        
        // Crear contenedor del tablero
        createDashboardContainer: function() {
            // Verificar si ya existe
            var container = document.getElementById('dashboard-container');
            if (container) {
                container.style.display = 'block';
                return;
            }
            
            // Crear contenedor
            container = document.createElement('div');
            container.id = 'dashboard-container';
            container.style.position = 'fixed';
            container.style.top = '100px';
            container.style.right = '20px';
            container.style.width = '300px';
            container.style.backgroundColor = '#fff';
            container.style.padding = '10px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            container.style.zIndex = '1000';
            container.style.color = '#333';
            
            // Título
            var title = document.createElement('h3');
            title.textContent = 'Monitoreo en Tiempo Real';
            title.style.margin = '0 0 10px 0';
            title.style.borderBottom = '1px solid #eee';
            title.style.paddingBottom = '5px';
            container.appendChild(title);
            
            // Añadir botón para cerrar
            var closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '5px';
            closeBtn.style.right = '8px';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = '#999';
            closeBtn.onclick = this.stop.bind(this);
            container.appendChild(closeBtn);
            
            // Crear secciones para estadísticas
            var cookingStats = document.createElement('div');
            cookingStats.id = 'cooking-stats';
            cookingStats.style.marginBottom = '15px';
            container.appendChild(cookingStats);
            
            var deliveryStats = document.createElement('div');
            deliveryStats.id = 'delivery-stats';
            deliveryStats.style.marginBottom = '15px';
            container.appendChild(deliveryStats);
            
            // Botón para actualizar manualmente
            var refreshBtn = document.createElement('button');
            refreshBtn.textContent = 'Actualizar';
            refreshBtn.style.padding = '5px 10px';
            refreshBtn.style.border = 'none';
            refreshBtn.style.backgroundColor = '#3498db';
            refreshBtn.style.color = 'white';
            refreshBtn.style.borderRadius = '4px';
            refreshBtn.style.cursor = 'pointer';
            refreshBtn.style.width = '100%';
            refreshBtn.onclick = this.updateDashboard.bind(this);
            container.appendChild(refreshBtn);
            
            // Añadir al documento
            document.body.appendChild(container);
        },
        
        // Actualizar tablero
        updateDashboard: function() {
            if (!isActive) return;
            
            console.log("Actualizando tablero");
            
            // Obtener contenedores
            var cookingStats = document.getElementById('cooking-stats');
            var deliveryStats = document.getElementById('delivery-stats');
            
            if (!cookingStats || !deliveryStats) return;
            
            // Limpiar contenedores
            cookingStats.innerHTML = '';
            deliveryStats.innerHTML = '';
            
            // Título de cocina
            var cookingTitle = document.createElement('h4');
            cookingTitle.textContent = 'Estado de Cocina';
            cookingTitle.style.fontSize = '14px';
            cookingTitle.style.margin = '0 0 5px 0';
            cookingStats.appendChild(cookingTitle);
            
            // Calcular estadísticas de cocina
            var pendingCount = Avika.data.pendingOrders ? Avika.data.pendingOrders.length : 0;
            var coldCount = 0;
            var hotCount = 0;
            var bothCount = 0;
            
            if (Avika.data.pendingOrders) {
                Avika.data.pendingOrders.forEach(function(order) {
                    // Determinar tipo de cocina
                    if (order.kitchenType === 'cold' || 
                        (order.dish && this.getDishKitchenType(order.dish) === 'cold')) {
                        coldCount++;
                    } else if (order.kitchenType === 'hot' || 
                               (order.dish && this.getDishKitchenType(order.dish) === 'hot')) {
                        hotCount++;
                    } else if (order.isSpecialCombo || 
                              order.kitchenType === 'both' || 
                              (order.dish && this.getDishKitchenType(order.dish) === 'both')) {
                        bothCount++;
                    }
                }.bind(this));
            }
            
            // Crear lista de estadísticas
            var statsList = document.createElement('ul');
            statsList.style.margin = '0';
            statsList.style.padding = '0 0 0 20px';
            
            statsList.innerHTML = 
                '<li>Total pendientes: <strong>' + pendingCount + '</strong></li>' +
                '<li>Cocina fría: <strong>' + coldCount + '</strong></li>' +
                '<li>Cocina caliente: <strong>' + hotCount + '</strong></li>' +
                '<li>Combos especiales: <strong>' + bothCount + '</strong></li>';
            
            cookingStats.appendChild(statsList);
            
            // Título de entregas
            var deliveryTitle = document.createElement('h4');
            deliveryTitle.textContent = 'Estado de Entregas';
            deliveryTitle.style.fontSize = '14px';
            deliveryTitle.style.margin = '0 0 5px 0';
            deliveryStats.appendChild(deliveryTitle);
            
            // Calcular estadísticas de entregas
            var deliveryCount = 0;
            var pendingDelivery = 0;
            var inTransit = 0;
            
            if (Avika.data.pendingOrders) {
                Avika.data.pendingOrders.forEach(function(order) {
                    if (order.service === 'domicilio') {
                        deliveryCount++;
                        
                        if (order.deliveryDepartureTime) {
                            inTransit++;
                        } else {
                            pendingDelivery++;
                        }
                    }
                });
            }
            
            // Crear lista de estadísticas de entrega
            var deliveryList = document.createElement('ul');
            deliveryList.style.margin = '0';
            deliveryList.style.padding = '0 0 0 20px';
            
            deliveryList.innerHTML = 
                '<li>Total domicilios: <strong>' + deliveryCount + '</strong></li>' +
                '<li>Pendientes de salir: <strong>' + pendingDelivery + '</strong></li>' +
                '<li>En tránsito: <strong>' + inTransit + '</strong></li>';
            
            deliveryStats.appendChild(deliveryList);
            
            // Añadir timestamp de última actualización
            var timestamp = document.createElement('div');
            timestamp.style.fontSize = '10px';
            timestamp.style.color = '#999';
            timestamp.style.textAlign = 'right';
            timestamp.style.marginTop = '5px';
            timestamp.textContent = 'Actualizado: ' + new Date().toLocaleTimeString();
            deliveryStats.appendChild(timestamp);
        },
        
        // Obtener tipo de cocina para un platillo
        getDishKitchenType: function(dish) {
            if (!dish) return 'unknown';
            
            // Buscar en la configuración
            for (var category in Avika.config.dishes) {
                if (Avika.config.dishes[category] && Avika.config.dishes[category].includes(dish)) {
                    if (Avika.config.kitchenTypes && Avika.config.kitchenTypes[category]) {
                        return Avika.config.kitchenTypes[category];
                    }
                    break;
                }
            }
            
            // Detectar combos
            if (dish.toLowerCase().includes('combo')) {
                return 'both';
            }
            
            return 'unknown';
        }
    };
    
    console.log("Módulo de tablero inicializado");
})();