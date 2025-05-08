// ui-settings.js - Funciones para manejar la configuración de la aplicación
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

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
                            <div class="setting-row">
                                <label for="auto-refresh">Actualización automática (segundos)</label>
                                <select id="auto-refresh">
                                    <option value="0">Desactivado</option>
                                    <option value="2">2 segundos</option>
                                    <option value="5" selected>5 segundos</option>
                                    <option value="10">10 segundos</option>
                                    <option value="30">30 segundos</option>
                                </select>
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
            if (typeof Avika.ui.exportData === 'function') {
                Avika.ui.exportData();
            } else {
                Avika.ui.showNotification('Función de exportación no disponible', 'error');
            }
        };
        
        document.getElementById('import-data').onclick = function() {
            if (typeof Avika.ui.importData === 'function') {
                Avika.ui.importData();
            } else {
                Avika.ui.showNotification('Función de importación no disponible', 'error');
            }
        };
        
        document.getElementById('clear-data').onclick = function() {
            Avika.ui.showConfirmationModal(
                '¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.',
                function() {
                    if (typeof Avika.ui.clearAllData === 'function') {
                        Avika.ui.clearAllData();
                        closeModal();
                    } else {
                        Avika.ui.showNotification('Función de limpieza no disponible', 'error');
                    }
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
    // Inicializar configuración si no existe
    if (!Avika.config) {
        Avika.config = {};
    }
    
    // Notificaciones
    var soundCheckbox = document.getElementById('notification-sound');
    var durationInput = document.getElementById('notification-duration');
    
    if (soundCheckbox && Avika.config.notificationSound !== undefined) {
        soundCheckbox.checked = Avika.config.notificationSound;
    } else if (soundCheckbox) {
        // Valor por defecto
        soundCheckbox.checked = true;
        Avika.config.notificationSound = true;
    }
    
    if (durationInput && Avika.config.notificationDuration !== undefined) {
        durationInput.value = Avika.config.notificationDuration;
    } else if (durationInput) {
        // Valor por defecto
        durationInput.value = 5;
        Avika.config.notificationDuration = 5;
    }
    
    // Interfaz
    var compactModeCheckbox = document.getElementById('compact-mode');
    var darkModeCheckbox = document.getElementById('dark-mode');
    var autoRefreshSelect = document.getElementById('auto-refresh');
    
    if (compactModeCheckbox && Avika.config.compactMode !== undefined) {
        compactModeCheckbox.checked = Avika.config.compactMode;
    } else if (compactModeCheckbox) {
        // Valor por defecto
        compactModeCheckbox.checked = false;
        Avika.config.compactMode = false;
    }
    
    if (darkModeCheckbox && Avika.config.darkMode !== undefined) {
        darkModeCheckbox.checked = Avika.config.darkMode;
    } else if (darkModeCheckbox) {
        // Valor por defecto
        darkModeCheckbox.checked = false;
        Avika.config.darkMode = false;
    }
    
    if (autoRefreshSelect && Avika.config.autoRefreshInterval !== undefined) {
        autoRefreshSelect.value = Avika.config.autoRefreshInterval;
    } else if (autoRefreshSelect) {
        // Valor por defecto
        autoRefreshSelect.value = 5;
        Avika.config.autoRefreshInterval = 5;
    }
    
    // Aplicar configuración visual
    this.applyVisualSettings();
};

// Guardar configuración
Avika.ui.saveSettings = function() {
    // Inicializar configuración si no existe
    if (!Avika.config) {
        Avika.config = {};
    }
    
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
    var autoRefreshSelect = document.getElementById('auto-refresh');
    
    if (compactModeCheckbox) {
        Avika.config.compactMode = compactModeCheckbox.checked;
        // Usar la implementación centralizada
        Avika.ui.setCompactMode(Avika.config.compactMode);
    }
    
    if (darkModeCheckbox) {
        Avika.config.darkMode = darkModeCheckbox.checked;
        // Usar la implementación centralizada
        Avika.ui.setDarkMode(Avika.config.darkMode);
    }
    
    if (autoRefreshSelect) {
        Avika.config.autoRefreshInterval = parseInt(autoRefreshSelect.value) || 0;
    }
    
    // Aplicar configuración visual
    this.applyVisualSettings();
    
    // Guardar configuración
    if (Avika.storage && typeof Avika.storage.guardarConfiguracion === 'function') {
        Avika.storage.guardarConfiguracion();
    } else {
        // Implementación de respaldo
        try {
            localStorage.setItem('avika_config', JSON.stringify(Avika.config));
        } catch (e) {
            console.error('Error al guardar configuración:', e);
        }
    }
    
    // Mostrar notificación
    Avika.ui.showNotification('Configuración guardada', 'success');
};

// Aplicar configuración visual
Avika.ui.applyVisualSettings = function() {
    // Modo compacto
    if (Avika.config.compactMode) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
    
    // Modo oscuro
    if (Avika.config.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Actualizar intervalo de actualización automática
    if (Avika.config.autoRefreshInterval > 0) {
        this.setupAutoRefresh(Avika.config.autoRefreshInterval);
    } else {
        this.disableAutoRefresh();
    }
};

// Configurar actualización automática
Avika.ui.setupAutoRefresh = function(intervalSeconds) {
    // Limpiar intervalo existente
    this.disableAutoRefresh();
    
    // Configurar nuevo intervalo
    this._autoRefreshInterval = setInterval(function() {
        // Actualizar tablas
        if (typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        
        if (typeof Avika.ui.updateDeliveryTable === 'function') {
            Avika.ui.updateDeliveryTable();
        }
    }, intervalSeconds * 1000);
};

// Desactivar actualización automática
Avika.ui.disableAutoRefresh = function() {
    if (this._autoRefreshInterval) {
        clearInterval(this._autoRefreshInterval);
        this._autoRefreshInterval = null;
    }
};

// Implementación centralizada para activar/desactivar modo compacto
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

// Alternar modo compacto - Función para compatibilidad con código existente
Avika.ui.toggleCompactMode = function() {
    // Inicializar configuración si no existe
    if (!Avika.config) {
        Avika.config = {};
    }
    
    // Alternar modo
    Avika.config.compactMode = !Avika.config.compactMode;
    
    // Aplicar cambio usando la implementación centralizada
    Avika.ui.setCompactMode(Avika.config.compactMode);
    
    // Guardar configuración completa
    if (Avika.storage && typeof Avika.storage.guardarConfiguracion === 'function') {
        Avika.storage.guardarConfiguracion();
    } else {
        // Implementación de respaldo
        try {
            localStorage.setItem('avika_config', JSON.stringify(Avika.config));
        } catch (e) {
            console.error('Error al guardar configuración:', e);
        }
    }
    
    // Mostrar notificación
    var modoTexto = Avika.config.compactMode ? 'activado' : 'desactivado';
    Avika.ui.showNotification('Modo compacto ' + modoTexto, 'info');
};

// Implementación centralizada para activar/desactivar modo oscuro
Avika.ui.setDarkMode = function(enable) {
    if (enable) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('avika_dark_mode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('avika_dark_mode', 'false');
    }
};

// Alternar modo oscuro - Función para compatibilidad con código existente
Avika.ui.toggleDarkMode = function() {
    // Inicializar configuración si no existe
    if (!Avika.config) {
        Avika.config = {};
    }
    
    // Alternar modo
    Avika.config.darkMode = !Avika.config.darkMode;
    
    // Aplicar cambio usando la implementación centralizada
    Avika.ui.setDarkMode(Avika.config.darkMode);
    
    // Guardar configuración completa
    if (Avika.storage && typeof Avika.storage.guardarConfiguracion === 'function') {
        Avika.storage.guardarConfiguracion();
    } else {
        // Implementación de respaldo
        try {
            localStorage.setItem('avika_config', JSON.stringify(Avika.config));
        } catch (e) {
            console.error('Error al guardar configuración:', e);
        }
    }
    
    // Mostrar notificación
    var modoTexto = Avika.config.darkMode ? 'activado' : 'desactivado';
    Avika.ui.showNotification('Modo oscuro ' + modoTexto, 'info');
};

// Cargar configuración desde localStorage
Avika.ui.loadConfigFromStorage = function() {
    try {
        // Intentar cargar desde el módulo de almacenamiento
        if (Avika.storage && typeof Avika.storage.cargarConfiguracion === 'function') {
            Avika.storage.cargarConfiguracion();
        } else {
            // Implementación de respaldo
            var configStr = localStorage.getItem('avika_config');
            if (configStr) {
                var config = JSON.parse(configStr);
                if (config) {
                    Avika.config = config;
                }
            }
        }
        
        // Aplicar configuración visual
        this.applyVisualSettings();
    } catch (e) {
        console.error('Error al cargar configuración:', e);
    }
};

// Inicializar configuración predeterminada
Avika.ui.initDefaultConfig = function() {
    // Inicializar configuración si no existe
    if (!Avika.config) {
        Avika.config = {};
    }
    
    // Valores predeterminados
    if (Avika.config.notificationSound === undefined) {
        Avika.config.notificationSound = true;
    }
    
    if (Avika.config.notificationDuration === undefined) {
        Avika.config.notificationDuration = 5;
    }
    
    if (Avika.config.compactMode === undefined) {
        Avika.config.compactMode = false;
    }
    
    if (Avika.config.darkMode === undefined) {
        Avika.config.darkMode = false;
    }
    
    if (Avika.config.autoRefreshInterval === undefined) {
        Avika.config.autoRefreshInterval = 5;
    }
    
    // Aplicar configuración visual
    this.applyVisualSettings();
};
