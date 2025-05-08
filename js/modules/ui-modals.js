// ui-modals.js - Funciones para el manejo de modales
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Mostrar modal de confirmación
Avika.ui.showConfirmationModal = function(message, confirmCallback, cancelCallback) {
    // Crear modal si no existe
    var modal = document.getElementById('confirmation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirmation-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmación</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <p id="confirmation-message"></p>
                    <div class="modal-actions">
                        <button id="confirm-button" class="action-btn">Confirmar</button>
                        <button id="cancel-button" class="action-btn cancel-btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
    }
    
    // Actualizar mensaje
    document.getElementById('confirmation-message').textContent = message;
    
    // Configurar eventos
    var closeButton = modal.querySelector('.close-modal');
    var confirmButton = document.getElementById('confirm-button');
    var cancelButton = document.getElementById('cancel-button');
    
    // Función para cerrar el modal
    var closeModal = function() {
        modal.style.display = 'none';
    };
    
    // Evento de cierre
    closeButton.onclick = function() {
        closeModal();
        if (typeof cancelCallback === 'function') {
            cancelCallback();
        }
    };
    
    // Evento de confirmación
    confirmButton.onclick = function() {
        closeModal();
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
    };
    
    // Evento de cancelación
    cancelButton.onclick = function() {
        closeModal();
        if (typeof cancelCallback === 'function') {
            cancelCallback();
        }
    };
    
    // Mostrar modal
    modal.style.display = 'block';
};

// Mostrar modal de detalles de orden
Avika.ui.showOrderDetailsModal = function(order) {
    if (!order) {
        console.error("No se proporcionó una orden válida");
        return;
    }
    
    // Crear modal si no existe
    var modal = document.getElementById('order-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-details-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Detalles de la Orden</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="order-details-content">
                        <!-- Contenido dinámico -->
                    </div>
                    <div class="modal-actions">
                        <button id="close-details-button" class="action-btn">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        var closeButton = modal.querySelector('.close-modal');
        var closeDetailsButton = document.getElementById('close-details-button');
        
        // Función para cerrar el modal
        var closeModal = function() {
            modal.style.display = 'none';
        };
        
        // Eventos de cierre
        closeButton.onclick = closeModal;
        closeDetailsButton.onclick = closeModal;
    }
    
    // Actualizar contenido
    var detailsContent = document.getElementById('order-details-content');
    
    // Formatear detalles
    var orderDetails = `
        <div class="order-details">
            <h3>${order.dish}</h3>
            <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Hora de inicio:</span>
                <span class="detail-value">${order.startTimeFormatted || 'No disponible'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tipo de servicio:</span>
                <span class="detail-value">${this.formatServiceType(order.serviceType)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Categoría:</span>
                <span class="detail-value">${order.category || 'No especificada'}</span>
            </div>
    `;
    
    // Añadir información de combo especial si aplica
    if (order.isSpecialCombo) {
        orderDetails += `
            <div class="detail-row">
                <span class="detail-label">Combo especial:</span>
                <span class="detail-value">Sí</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Cocina caliente:</span>
                <span class="detail-value">${order.hotKitchenFinished ? 'Completado' : 'Pendiente'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Cocina fría:</span>
                <span class="detail-value">${order.coldKitchenFinished ? 'Completado' : 'Pendiente'}</span>
            </div>
        `;
    }
    
    // Añadir personalizaciones si las hay
    if (order.customizations && order.customizations.length > 0) {
        orderDetails += `
            <div class="detail-row">
                <span class="detail-label">Personalizaciones:</span>
                <span class="detail-value">${order.customizations.join(', ')}</span>
            </div>
        `;
    }
    
    // Añadir información de reparto si aplica
    if (order.serviceType === 'domicilio' && order.departureTime) {
        orderDetails += `
            <div class="detail-row">
                <span class="detail-label">Hora de salida:</span>
                <span class="detail-value">${order.departureTimeFormatted || 'No disponible'}</span>
            </div>
        `;
        
        if (order.arrivalTime) {
            orderDetails += `
                <div class="detail-row">
                    <span class="detail-label">Hora de llegada:</span>
                    <span class="detail-value">${order.arrivalTimeFormatted || 'No disponible'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tiempo de entrega:</span>
                    <span class="detail-value">${this.calculateDeliveryTime(order)}</span>
                </div>
            `;
        }
    }
    
    // Añadir información de finalización si aplica
    if (order.completionTime) {
        orderDetails += `
            <div class="detail-row">
                <span class="detail-label">Hora de finalización:</span>
                <span class="detail-value">${order.completionTimeFormatted || 'No disponible'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tiempo total:</span>
                <span class="detail-value">${this.calculateTotalTime(order)}</span>
            </div>
        `;
    }
    
    // Cerrar div de detalles
    orderDetails += '</div>';
    
    // Actualizar contenido
    detailsContent.innerHTML = orderDetails;
    
    // Mostrar modal
    modal.style.display = 'block';
};

// Formatear tipo de servicio
Avika.ui.formatServiceType = function(serviceType) {
    switch (serviceType) {
        case 'domicilio':
            return 'Domicilio';
        case 'para-llevar':
            return 'Ordena y Recoge';
        case 'comedor':
        default:
            return 'Comedor';
    }
};

// Calcular tiempo de entrega
Avika.ui.calculateDeliveryTime = function(order) {
    if (!order.departureTime || !order.arrivalTime) {
        return 'No disponible';
    }
    
    var departureTime = new Date(order.departureTime);
    var arrivalTime = new Date(order.arrivalTime);
    var elapsedSeconds = Math.floor((arrivalTime - departureTime) / 1000);
    
    return Avika.utils.formatElapsedTime(elapsedSeconds);
};

// Calcular tiempo total
Avika.ui.calculateTotalTime = function(order) {
    if (!order.startTime || !order.completionTime) {
        return 'No disponible';
    }
    
    var startTime = new Date(order.startTime);
    var completionTime = new Date(order.completionTime);
    var elapsedSeconds = Math.floor((completionTime - startTime) / 1000);
    
    return Avika.utils.formatElapsedTime(elapsedSeconds);
};

// Mostrar modal de estadísticas
Avika.ui.showStatsModal = function() {
    // Crear modal si no existe
    var modal = document.getElementById('stats-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'stats-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Estadísticas</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="stats-content">
                        <!-- Contenido dinámico -->
                    </div>
                    <div class="modal-actions">
                        <button id="close-stats-button" class="action-btn">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        var closeButton = modal.querySelector('.close-modal');
        var closeStatsButton = document.getElementById('close-stats-button');
        
        // Función para cerrar el modal
        var closeModal = function() {
            modal.style.display = 'none';
        };
        
        // Eventos de cierre
        closeButton.onclick = closeModal;
        closeStatsButton.onclick = closeModal;
    }
    
    // Actualizar contenido
    var statsContent = document.getElementById('stats-content');
    
    // Calcular estadísticas usando la implementación centralizada en stats.js
    var stats;
    if (Avika.stats && typeof Avika.stats.calculateStats === 'function') {
        stats = Avika.stats.calculateStats();
    } else {
        console.error('Error: Avika.stats.calculateStats no está disponible');
        Avika.ui.showNotification('Error al calcular estadísticas. Consulta la consola para más detalles.', 'error');
        return;
    }
    
    // Formatear estadísticas
    var statsHtml = `
        <div class="stats-container">
            <div class="stats-section">
                <h3>Órdenes</h3>
                <div class="stat-row">
                    <span class="stat-label">Total de órdenes:</span>
                    <span class="stat-value">${stats.totalOrders}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Órdenes pendientes:</span>
                    <span class="stat-value">${stats.pendingOrders}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Órdenes en reparto:</span>
                    <span class="stat-value">${stats.deliveryOrders}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Órdenes completadas:</span>
                    <span class="stat-value">${stats.completedOrders}</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Tiempos</h3>
                <div class="stat-row">
                    <span class="stat-label">Tiempo promedio de preparación:</span>
                    <span class="stat-value">${stats.avgPrepTime}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Tiempo promedio de entrega:</span>
                    <span class="stat-value">${stats.avgDeliveryTime}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Tiempo promedio total:</span>
                    <span class="stat-value">${stats.avgTotalTime}</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Por categoría</h3>
    `;
    
    // Añadir estadísticas por categoría
    for (var category in stats.byCategory) {
        statsHtml += `
            <div class="stat-row">
                <span class="stat-label">${category}:</span>
                <span class="stat-value">${stats.byCategory[category]}</span>
            </div>
        `;
    }
    
    statsHtml += `
            </div>
            
            <div class="stats-section">
                <h3>Por servicio</h3>
                <div class="stat-row">
                    <span class="stat-label">Comedor:</span>
                    <span class="stat-value">${stats.byService.comedor}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Domicilio:</span>
                    <span class="stat-value">${stats.byService.domicilio}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Para llevar:</span>
                    <span class="stat-value">${stats.byService['para-llevar']}</span>
                </div>
            </div>
        </div>
    `;
    
    // Actualizar contenido
    statsContent.innerHTML = statsHtml;
    
    // Mostrar modal
    modal.style.display = 'block';
};

// NOTA: La función calculateStats ha sido movida a stats.js
// Ahora se utiliza Avika.stats.calculateStats en su lugar

// Mostrar modal de configuración
Avika.ui.showSettingsModal = function() {
    // Crear modal si no existe
    var modal = document.getElementById('settings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Configuración</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="settings-content">
                        <div class="settings-section">
                            <h3>Notificaciones</h3>
                            <div class="setting-row">
                                <label for="notification-sound">Sonido de notificación</label>
                                <input type="checkbox" id="notification-sound" checked>
                            </div>
                            <div class="setting-row">
                                <label for="notification-duration">Duración de notificación (segundos)</label>
                                <input type="number" id="notification-duration" min="1" max="10" value="5">
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Interfaz</h3>
                            <div class="setting-row">
                                <label for="compact-mode">Modo compacto</label>
                                <input type="checkbox" id="compact-mode">
                            </div>
                            <div class="setting-row">
                                <label for="dark-mode">Modo oscuro</label>
                                <input type="checkbox" id="dark-mode">
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Datos</h3>
                            <div class="setting-row">
                                <button id="export-data" class="action-btn">Exportar datos</button>
                                <button id="import-data" class="action-btn">Importar datos</button>
                            </div>
                            <div class="setting-row">
                                <button id="clear-data" class="action-btn danger-btn">Limpiar todos los datos</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="save-settings-button" class="action-btn">Guardar</button>
                        <button id="close-settings-button" class="action-btn cancel-btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        var closeButton = modal.querySelector('.close-modal');
        var saveSettingsButton = document.getElementById('save-settings-button');
        var closeSettingsButton = document.getElementById('close-settings-button');
        
        // Función para cerrar el modal
        var closeModal = function() {
            modal.style.display = 'none';
        };
        
        // Eventos de cierre
        closeButton.onclick = closeModal;
        closeSettingsButton.onclick = closeModal;
        
        // Evento de guardar configuración
        saveSettingsButton.onclick = function() {
            Avika.ui.saveSettings();
            closeModal();
        };
        
        // Eventos de datos
        document.getElementById('export-data').onclick = function() {
            Avika.ui.exportData();
        };
        
        document.getElementById('import-data').onclick = function() {
            Avika.ui.importData();
        };
        
        document.getElementById('clear-data').onclick = function() {
            Avika.ui.showConfirmationModal(
                '¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.',
                function() {
                    Avika.ui.clearAllData();
                    closeModal();
                }
            );
        };
    }
    
    // Cargar configuración actual
    this.loadCurrentSettings();
    
    // Mostrar modal
    modal.style.display = 'block';
};

// Cargar configuración actual
Avika.ui.loadCurrentSettings = function() {
    // Notificaciones
    var soundCheckbox = document.getElementById('notification-sound');
    var durationInput = document.getElementById('notification-duration');
    
    if (soundCheckbox && Avika.config.notificationSound !== undefined) {
        soundCheckbox.checked = Avika.config.notificationSound;
    }
    
    if (durationInput && Avika.config.notificationDuration !== undefined) {
        durationInput.value = Avika.config.notificationDuration;
    }
    
    // Interfaz
    var compactModeCheckbox = document.getElementById('compact-mode');
    var darkModeCheckbox = document.getElementById('dark-mode');
    
    if (compactModeCheckbox && Avika.config.compactMode !== undefined) {
        compactModeCheckbox.checked = Avika.config.compactMode;
    }
    
    if (darkModeCheckbox && Avika.config.darkMode !== undefined) {
        darkModeCheckbox.checked = Avika.config.darkMode;
    }
};

// Guardar configuración
Avika.ui.saveSettings = function() {
    // Notificaciones
    var soundCheckbox = document.getElementById('notification-sound');
    var durationInput = document.getElementById('notification-duration');
    
    if (soundCheckbox) {
        Avika.config.notificationSound = soundCheckbox.checked;
    }
    
    if (durationInput) {
        Avika.config.notificationDuration = parseInt(durationInput.value) || 5;
    }
    
    // Interfaz
    var compactModeCheckbox = document.getElementById('compact-mode');
    var darkModeCheckbox = document.getElementById('dark-mode');
    
    if (compactModeCheckbox) {
        Avika.config.compactMode = compactModeCheckbox.checked;
        this.toggleCompactMode(Avika.config.compactMode);
    }
    
    if (darkModeCheckbox) {
        Avika.config.darkMode = darkModeCheckbox.checked;
        this.toggleDarkMode(Avika.config.darkMode);
    }
    
    // Guardar configuración
    if (Avika.storage && typeof Avika.storage.guardarConfiguracion === 'function') {
        Avika.storage.guardarConfiguracion();
    }
    
    // Mostrar notificación
    this.showNotification('Configuración guardada', 'success');
};

// Alternar modo compacto - Implementación centralizada
Avika.ui.setCompactMode = function(enable) {
    var body = document.body;
    
    if (enable) {
        body.classList.add('compact-mode');
        localStorage.setItem('avika_compact_mode', 'true');
        if (document.getElementById('btn-compact-mode')) {
            document.getElementById('btn-compact-mode').textContent = 'Desactivar modo ultra-compacto';
        }
    } else {
        body.classList.remove('compact-mode');
        localStorage.setItem('avika_compact_mode', 'false');
        if (document.getElementById('btn-compact-mode')) {
            document.getElementById('btn-compact-mode').textContent = 'Activar modo ultra-compacto';
        }
    }
    
    // Actualizar tablas para reflejar el nuevo modo
    if (typeof Avika.ui.updatePendingTable === 'function') {
        Avika.ui.updatePendingTable();
    }
    if (typeof Avika.ui.updateDeliveryTable === 'function') {
        Avika.ui.updateDeliveryTable();
    }
};

// Alternar modo oscuro - Implementación centralizada
Avika.ui.setDarkMode = function(enable) {
    if (enable) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('avika_dark_mode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('avika_dark_mode', 'false');
    }
};

// Mantener la función toggleDarkMode para compatibilidad con código existente
Avika.ui.toggleDarkMode = function(enable) {
    return Avika.ui.setDarkMode(enable);
};
